import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

console.log('[AUTH MIDDLEWARE] JWT_SECRET loaded:', JWT_SECRET ? 'YES (length: ' + JWT_SECRET.length + ')' : 'NO');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function generateToken(user) {
  console.log('[GENERATE TOKEN] JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'NOT SET');
  console.log('[GENERATE TOKEN] JWT_SECRET first 20 chars:', JWT_SECRET ? JWT_SECRET.substring(0, 20) : 'NOT SET');
  return jwt.sign(
    { userId: user.id, employeeId: user.employeeId, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyToken(token) {
  console.log('[VERIFY TOKEN] JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'NOT SET');
  console.log('[VERIFY TOKEN] JWT_SECRET first 20:', JWT_SECRET ? JWT_SECRET.substring(0, 20) : 'NOT SET');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[VERIFY TOKEN] Success:', JSON.stringify(decoded, null, 2));
    return decoded;
  } catch (error) {
    console.log('[VERIFY TOKEN] Error:', error.message);
    return null;
  }
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      teamId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(403).json({ error: 'User not found' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is not active' });
  }

  req.user = user;
  req.authType = 'worker';
  next();
}

export async function authenticateCitizen(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const citizen = await prisma.citizen.findUnique({
    where: { authUserId: user.id },
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
    return res.status(403).json({ error: 'Account is not active' });
  }

  req.citizen = citizen;
  req.supabaseUser = user;
  req.authType = 'citizen';
  next();
}

export async function authenticateSupervisor(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      teamId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(403).json({ error: 'User not found' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is not active' });
  }

  if (user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Insufficient permissions. Supervisor role required.' });
  }

  req.user = user;
  req.authType = 'supervisor';
  next();
}

export async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[AUTH ADMIN] Auth header:', authHeader);
  console.log('[AUTH ADMIN] Token extracted:', token ? 'YES' : 'NO');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  console.log('[AUTH ADMIN] Token decoded:', decoded ? 'YES' : 'NO', decoded ? JSON.stringify(decoded) : 'null');
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      teamId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(403).json({ error: 'User not found' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is not active' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions. Admin role required.' });
  }

  req.user = user;
  req.authType = 'admin';
  next();
}

export async function authenticateWorkerOrCitizen(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    if (decoded) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          teamId: true,
          createdAt: true,
        },
      });

      if (user && user.status === 'active') {
        req.user = user;
        req.authType = 'worker';
        return next();
      }
    }
  } catch (workerError) {
    // Not a worker token, try citizen
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      const citizen = await prisma.citizen.findUnique({
        where: { authUserId: user.id },
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

      if (citizen && citizen.status === 'active') {
        req.citizen = citizen;
        req.supabaseUser = user;
        req.authType = 'citizen';
        return next();
      }
    }
  } catch (citizenError) {
    // Not a valid citizen token either
  }

  return res.status(403).json({ error: 'Invalid or expired token' });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user || req.citizen;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}