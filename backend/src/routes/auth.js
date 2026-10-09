import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { generateToken, authenticateToken, requireRole } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';

const router = express.Router();
const prisma = new PrismaClient();

const workerLoginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

const workerRegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15).regex(/^[\d+\-\s()]+$/, 'Invalid mobile number format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const citizenRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const citizenLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const supervisorLoginSchema = z.object({
  supervisorId: z.string().min(1, 'Supervisor ID is required'),
  password: z.string().min(1, 'Password is required'),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Admin username is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/worker/login', async (req, res) => {
  try {
    const { employeeId, password } = workerLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Worker ID or password' });
    }

    if (user.role !== 'worker') {
      return res.status(403).json({ success: false, message: 'Access denied. Worker role required.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active. Contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid Worker ID or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        teamId: user.teamId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Worker login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

async function generateWorkerId() {
  const lastWorker = await prisma.user.findFirst({
    where: {
      employeeId: {
        startsWith: 'WRK-',
      },
    },
    orderBy: {
      employeeId: 'desc',
    },
    select: {
      employeeId: true,
    },
  });

  let nextNumber = 1001;
  if (lastWorker) {
    const match = lastWorker.employeeId.match(/^WRK-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  let workerId = `WRK-${nextNumber}`;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await prisma.user.findUnique({ where: { employeeId: workerId } });
    if (!existing) {
      return workerId;
    }
    nextNumber += 1;
    workerId = `WRK-${nextNumber}`;
    attempts += 1;
  }

  throw new Error('Failed to generate unique worker ID after maximum attempts');
}

router.post('/worker/register', async (req, res) => {
  try {
    const { username, email, mobile, password } = workerRegisterSchema.parse(req.body);

    // Check uniqueness
    const existingUsername = await prisma.user.findFirst({ where: { name: username } });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (mobile) {
      const existingMobile = await prisma.user.findUnique({ where: { mobile } });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered' });
      }
    }

    // Generate unique worker ID
    const employeeId = await generateWorkerId();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create worker
    const user = await prisma.user.create({
      data: {
        employeeId,
        name: username,
        email,
        mobile,
        passwordHash,
        role: 'worker',
        status: 'active',
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        teamId: user.teamId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    // Safe diagnostic logging - no secrets
    const errInfo = {
      code: error?.code,
      message: error?.message,
      meta: error?.meta ? JSON.stringify(error.meta) : undefined,
      name: error?.name,
    };
    console.error('[WORKER_REGISTER_ERROR]', JSON.stringify(errInfo));
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

router.post('/citizen/register', async (req, res) => {
  try {
    const { name, email, password } = citizenRegisterSchema.parse(req.body);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      console.error('Supabase auth error:', authError);
      return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }

    const citizen = await prisma.citizen.create({
      data: {
        authUserId: authData.user.id,
        name,
        email,
        role: 'citizen',
        status: 'active',
      },
    });

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ error: 'Registration successful but login failed. Please log in manually.' });
    }

    res.status(201).json({
      token: sessionData.session.access_token,
      user: {
        id: citizen.id,
        authUserId: citizen.authUserId,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        status: citizen.status,
        createdAt: citizen.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Citizen registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/citizen/login', async (req, res) => {
  try {
    const { email, password } = citizenLoginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const citizen = await prisma.citizen.findUnique({
      where: { authUserId: data.user.id },
      select: {
        id: true,
        authUserId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!citizen) {
      return res.status(403).json({ error: 'Citizen profile not found' });
    }

    if (citizen.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active. Contact administrator.' });
    }

    res.json({
      token: data.session.access_token,
      user: citizen,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Citizen login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.post('/supervisor/login', async (req, res) => {
  try {
    const { supervisorId, password } = supervisorLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { employeeId: supervisorId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Supervisor ID or password' });
    }

    if (user.role !== 'supervisor') {
      return res.status(403).json({ success: false, message: 'Access denied. Supervisor role required.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active. Contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid Supervisor ID or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        supervisorId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Supervisor login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    console.log('[ADMIN LOGIN] Request received:', { username: req.body.username });
    const { username, password } = adminLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { employeeId: username },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin username or password' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active. Contact administrator.' });
    }

    console.log('[ADMIN LOGIN] Comparing password for user:', user.employeeId);
    console.log('[ADMIN LOGIN] Comparing password for user:', user.employeeId);
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
      console.log('[ADMIN LOGIN] bcrypt.compare result:', isValidPassword);
    } catch (bcryptError) {
      console.error('[ADMIN LOGIN] bcrypt.compare error:', bcryptError);
      return res.status(500).json({ success: false, message: 'Password verification failed' });
    }
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid admin username or password' });
    }

    console.log('[ADMIN LOGIN] Password valid, generating token for user:', user.employeeId);
    let token;
    try {
      token = generateToken(user);
      console.log('[ADMIN LOGIN] Token generated successfully for:', user.employeeId);
    } catch (tokenError) {
      console.error('[ADMIN LOGIN] generateToken error:', tokenError);
      return res.status(500).json({ success: false, message: 'Token generation failed' });
    }
    res.json({
      token,
      user: {
        id: user.id,
        username: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.authType === 'worker') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          status: true,
          teamId: true,
          createdAt: true,
          team: {
            select: { id: true, name: true },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user, authType: 'worker' });
    }

    if (req.authType === 'citizen') {
      const citizen = await prisma.citizen.findUnique({
        where: { id: req.citizen.id },
        select: {
          id: true,
          authUserId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      return res.json({ user: citizen, authType: 'citizen' });
    }

    res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;