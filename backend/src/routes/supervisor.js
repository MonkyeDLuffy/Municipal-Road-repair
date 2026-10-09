import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateSupervisor, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateSupervisor, requireRole('supervisor'));

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
    console.error('Supervisor me error:', error);
    res.status(500).json({ error: 'Failed to fetch supervisor data' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalReports,
      submittedReports,
      underReviewReports,
      approvedReports,
      rejectedReports,
      inProgressReports,
      resolvedReports,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'submitted' } }),
      prisma.report.count({ where: { status: 'under_review' } }),
      prisma.report.count({ where: { status: 'approved' } }),
      prisma.report.count({ where: { status: 'rejected' } }),
      prisma.report.count({ where: { status: 'in_progress' } }),
      prisma.report.count({ where: { status: { in: ['completed', 'resolved'] } } }),
    ]);

    res.json({
      stats: {
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
    console.error('Supervisor dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          reportNumber: true,
          title: true,
          description: true,
          locationText: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
          citizen: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports: reports.map((r) => ({
        id: r.id,
        reportNumber: r.reportNumber,
        title: r.title,
        description: r.description,
        location: r.locationText,
        status: r.status,
        date: formatDate(r.createdAt),
        updatedAt: formatDate(r.updatedAt),
        imageUrl: r.imageUrl,
        citizen: r.citizen,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Supervisor get reports error:', error);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reportNumber: true,
        title: true,
        description: true,
        locationText: true,
        googleMapsUrl: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        imageSize: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        citizen: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      report: {
        id: report.id,
        reportNumber: report.reportNumber,
        title: report.title,
        description: report.description,
        location: report.locationText,
        googleMapsUrl: report.googleMapsUrl,
        latitude: report.latitude,
        longitude: report.longitude,
        imageUrl: report.imageUrl,
        imageSize: report.imageSize,
        status: report.status,
        rejectionReason: report.rejectionReason,
        date: formatDate(report.createdAt),
        updatedAt: formatDate(report.updatedAt),
        citizen: report.citizen,
      },
    });
  } catch (error) {
    console.error('Supervisor get report error:', error);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

router.patch('/reports/:id/approve', async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'submitted' && report.status !== 'under_review') {
      return res.status(400).json({ error: 'Report is not eligible for approval' });
    }

    // Start a transaction for consistent approval + assignment
    const reportTransaction = await prisma.$transaction(async (tx) => {
      // 1. Approve the report
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: 'approved',
        },
        select: {
          id: true,
          reportNumber: true,
          status: true,
          updatedAt: true,
        },
      });

      // 2. Find all workers and determine availability
      const allWorkers = await tx.user.findMany({
        where: { role: 'worker', status: 'active' },
        select: {
          id: true,
          employeeId: true,
          name: true,
        },
      });

      // 3. For each worker, count their active tasks (assigned or in_progress)
      const workersWithActiveTasks = await Promise.all(
        allWorkers.map(async (worker) => {
          const activeTaskCount = await tx.task.count({
            where: {
              workerId: worker.id,
              status: { in: ['assigned', 'in_progress'] },
            },
          });
          return {
            worker,
            activeTaskCount,
          };
        })
      );

      // 4. Find free workers (those with 0 active tasks)
      const freeWorkers = workersWithActiveTasks.filter(
        (w) => w.activeTaskCount === 0
      );

      let assignmentResult = null;

      // 5. Assign the report to a free worker
      if (freeWorkers.length > 0) {
        // Sort by fewest active tasks (all have 0, so just pick first)
        // If multiple free, pick the one with fewest active tasks overall
        freeWorkers.sort((a, b) => a.activeTaskCount - b.activeTaskCount);
        const selectedWorker = freeWorkers[0].worker;

        // Create a new task assigned to this worker for this report
        const newTask = await tx.task.create({
          data: {
            taskId: `TASK-${Date.now()}`,
            title: `Repair: ${report.title}`,
            description: report.description || 'Road repair task',
            location: report.locationText,
            latitude: report.latitude,
            longitude: report.longitude,
            priority: 'MEDIUM',
            status: 'assigned',
            requiredSkill: 'road_repair',
            scheduledDate: new Date(), // current time - ensures task appears in Worker Dashboard
            startTime: '09:00',
            endTime: '15:00',
            workerId: selectedWorker.id,
            reportId: report.id,
            teamId: selectedWorker.teamId,
          },
        });

        assignmentResult = {
          assignedTo: selectedWorker.employeeId,
          taskId: newTask.taskId,
          reportId: report.id,
        };
      } else {
        // No free workers - report remains approved but unassigned
        assignmentResult = {
          status: 'no_worker_available',
          message: 'Report approved, but no worker is currently available.',
        };
      }

      return { report: updatedReport, assignment: assignmentResult };
    });

    res.json({
      message: 'Report approved successfully',
      report: reportTransaction.report,
      assignment: reportTransaction.assignment,
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ error: 'Failed to approve report' });
  }
});

router.patch('/reports/:id/reject', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'submitted' && report.status !== 'under_review') {
      return res.status(400).json({ error: 'Report is not eligible for rejection' });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      },
      select: {
        id: true,
        reportNumber: true,
        status: true,
        rejectionReason: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Report rejected successfully',
      report: updatedReport,
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ error: 'Failed to reject report' });
  }
});

export default router;