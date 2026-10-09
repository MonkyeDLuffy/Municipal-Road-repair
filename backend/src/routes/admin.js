import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateAdmin, requireRole('admin'));

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
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

    res.json({ user });
  } catch (error) {
    console.error('Admin me error:', error);
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalSupervisors,
      totalWorkers,
      totalCitizens,
      totalReports,
      submittedReports,
      underReviewReports,
      approvedReports,
      rejectedReports,
      inProgressReports,
      resolvedReports,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'supervisor' } }),
      prisma.user.count({ where: { role: 'worker' } }),
      prisma.citizen.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'submitted' } }),
      prisma.report.count({ where: { status: 'under_review' } }),
      prisma.report.count({ where: { status: 'approved' } }),
      prisma.report.count({ where: { status: 'rejected' } }),
      prisma.report.count({ where: { status: { in: ['assigned', 'in_progress'] } } }),
      prisma.report.count({ where: { status: { in: ['completed', 'resolved'] } } }),
    ]);

    res.json({
      stats: {
        totalSupervisors,
        totalWorkers,
        totalCitizens,
        totalReports,
        submitted: submittedReports,
        underReview: underReviewReports,
        approved: approvedReports,
        rejected: rejectedReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/supervisors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [supervisors, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'supervisor' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: { role: 'supervisor' } }),
    ]);

    res.json({
      supervisors: supervisors.map((s) => ({
        id: s.id,
        employeeId: s.employeeId,
        name: s.name,
        email: s.email,
        mobile: s.mobile,
        status: s.status,
        createdAt: formatDate(s.createdAt),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get supervisors error:', error);
    res.status(500).json({ error: 'Failed to load supervisors' });
  }
});

const createSupervisorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15).regex(/^[\d+\-\s()]+$/, 'Invalid mobile number format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

router.post('/supervisors', async (req, res) => {
  try {
    const { name, email, mobile, password } = createSupervisorSchema.parse(req.body);

    // Check uniqueness
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

    // Generate unique supervisor ID
    const lastSupervisor = await prisma.user.findFirst({
      where: {
        employeeId: {
          startsWith: 'SUP-',
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
    if (lastSupervisor) {
      const match = lastSupervisor.employeeId.match(/^SUP-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    let supervisorId = `SUP-${nextNumber}`;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await prisma.user.findUnique({ where: { employeeId: supervisorId } });
      if (!existing) {
        break;
      }
      nextNumber += 1;
      supervisorId = `SUP-${nextNumber}`;
      attempts += 1;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique supervisor ID after maximum attempts');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create supervisor
    const user = await prisma.user.create({
      data: {
        employeeId: supervisorId,
        name,
        email,
        mobile,
        passwordHash,
        role: 'supervisor',
        status: 'active',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Supervisor created successfully',
      supervisor: {
        supervisorId: user.employeeId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('[SUPERVISOR_CREATE_ERROR]', JSON.stringify({
      code: error?.code,
      message: error?.message,
      meta: error?.meta ? JSON.stringify(error.meta) : undefined,
      name: error?.name,
    }));
    res.status(500).json({ success: false, message: 'Failed to create supervisor' });
  }
});

export default router;