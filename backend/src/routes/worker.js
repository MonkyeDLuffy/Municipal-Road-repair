import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken, requireRole('worker'));

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(time) {
  return time;
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
    console.error('Worker me error:', error);
    res.status(500).json({ error: 'Failed to fetch worker data' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const workerId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todaysTasks, completedToday, pendingTasks, completedThisWeek] = await Promise.all([
      prisma.task.count({
        where: {
          workerId,
          scheduledDate: { gte: today, lt: tomorrow },
          status: { in: ['assigned', 'in_progress'] },
        },
      }),
      prisma.task.count({
        where: {
          workerId,
          status: 'completed',
          updatedAt: { gte: today },
        },
      }),
      prisma.task.count({
        where: {
          workerId,
          status: { in: ['assigned', 'in_progress'] },
        },
      }),
      prisma.task.count({
        where: {
          workerId,
          status: 'completed',
          updatedAt: { gte: weekAgo },
        },
      }),
    ]);

    res.json({
      stats: {
        todaysTasks,
        completedToday,
        pending: pendingTasks,
        completedThisWeek,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const workerId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        workerId,
        scheduledDate: { gte: today, lt: tomorrow },
        status: { in: ['assigned', 'in_progress'] },
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      location: task.location,
      latitude: task.latitude,
      longitude: task.longitude,
      date: formatDate(task.scheduledDate),
      startTime: formatTime(task.startTime),
      endTime: formatTime(task.endTime),
      priority: task.priority,
      status: task.status,
      team: task.team?.name,
      requiredSkill: task.requiredSkill,
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

router.get('/tasks/history', async (req, res) => {
  try {
    const workerId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const tasks = await prisma.task.findMany({
      where: {
        workerId,
        status: 'completed',
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      taskId: task.taskId,
      title: task.title,
      location: task.location,
      date: formatDate(task.scheduledDate),
      priority: task.priority,
      status: task.status,
      team: task.team?.name,
      completedAt: formatDate(task.updatedAt),
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Task history error:', error);
    res.status(500).json({ error: 'Failed to load task history' });
  }
});

export default router;