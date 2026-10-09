import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateCitizen, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateCitizen, requireRole('citizen'));

function generateReportNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RPT-${year}-${random}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

router.get('/me', async (req, res) => {
  try {
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

    res.json({ citizen });
  } catch (error) {
    console.error('Citizen me error:', error);
    res.status(500).json({ error: 'Failed to fetch citizen data' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const citizenId = req.citizen.id;

    const [totalReports, submittedReports, underReviewReports, inProgressReports, resolvedReports] = await Promise.all([
      prisma.report.count({ where: { citizenId } }),
      prisma.report.count({ where: { citizenId, status: 'submitted' } }),
      prisma.report.count({ where: { citizenId, status: 'under_review' } }),
      prisma.report.count({ where: { citizenId, status: { in: ['assigned', 'in_progress'] } } }),
      prisma.report.count({ where: { citizenId, status: { in: ['completed', 'resolved'] } } }),
    ]);

    const recentReports = await prisma.report.findMany({
      where: { citizenId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        reportNumber: true,
        title: true,
        locationText: true,
        status: true,
        createdAt: true,
        imageUrl: true,
      },
    });

    res.json({
      stats: {
        totalReports,
        submitted: submittedReports,
        underReview: underReviewReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
      },
      recentReports: recentReports.map((r) => ({
        id: r.id,
        reportNumber: r.reportNumber,
        title: r.title,
        location: r.locationText,
        status: r.status,
        date: formatDate(r.createdAt),
        imageUrl: r.imageUrl,
      })),
    });
  } catch (error) {
    console.error('Citizen dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

const createReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).optional(),
  locationText: z.string().min(5, 'Location must be at least 5 characters').max(200),
  googleMapsUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageBase64: z.string().optional(),
  imageFileName: z.string().optional(),
  imageContentType: z.string().optional(),
});

router.post('/reports', async (req, res) => {
  let uploadedImagePath = null;
  
  try {
    const data = createReportSchema.parse(req.body);
    const citizenId = req.citizen.id;

    let googleMapsUrl = data.googleMapsUrl;
    if (googleMapsUrl === '') googleMapsUrl = null;

    if (googleMapsUrl && !googleMapsUrl.includes('google.com/maps') && !googleMapsUrl.includes('goo.gl/maps')) {
      return res.status(400).json({ error: 'Please provide a valid Google Maps URL' });
    }

    let imagePath = null;
    let imageUrl = null;
    let imageSize = null;

    if (data.imageBase64 && data.imageFileName && data.imageContentType) {
      const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Validate MIME type declaration
      if (!isValidImageType(data.imageContentType)) {
        return res.status(400).json({ error: 'Invalid image type. Allowed: JPEG, PNG, WEBP' });
      }
      
      // Validate actual file signature/magic bytes
      if (!isValidImageBuffer(buffer)) {
        return res.status(400).json({ error: 'Invalid image file signature' });
      }
      
      const sizeInKB = buffer.length / 1024;
      if (sizeInKB > 50) {
        return res.status(400).json({ error: `Image size (${sizeInKB.toFixed(1)} KB) exceeds 50 KB limit` });
      }

      const objectKey = generateTemporaryObjectKey();

      try {
        await uploadTemporaryImage(buffer, objectKey);
        imagePath = objectKey;
        imageUrl = null;
        imageSize = buffer.length;
        uploadedImagePath = imagePath;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image. Please try again.' });
      }
    }

    let reportNumber;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
      reportNumber = generateReportNumber();
      const existing = await prisma.report.findUnique({ where: { reportNumber } });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      if (uploadedImagePath) {
        await deleteTemporaryImage(uploadedImagePath);
      }
      return res.status(500).json({ error: 'Failed to generate unique report number. Please try again.' });
    }

    const report = await prisma.report.create({
      data: {
        reportNumber,
        citizenId,
        title: data.title,
        description: data.description,
        locationText: data.locationText,
        googleMapsUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        imagePath,
        imageUrl,
        imageSize,
        status: 'submitted',
      },
    });

    res.status(201).json({
      report: {
        id: report.id,
        reportNumber: report.reportNumber,
        title: report.title,
        description: report.description,
        locationText: report.locationText,
        googleMapsUrl: report.googleMapsUrl,
        latitude: report.latitude,
        longitude: report.longitude,
        imageUrl: report.imageUrl,
        imageSize: report.imageSize,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        imagePath: report.imagePath,
      },
    });
  } catch (error) {
    if (uploadedImagePath) {
      await deleteTemporaryImage(uploadedImagePath);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report. Please try again.' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const citizenId = req.citizen.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = { citizenId };
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
          locationText: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports: reports.map((r) => ({
        id: r.id,
        reportNumber: r.reportNumber,
        title: r.title,
        location: r.locationText,
        status: r.status,
        date: formatDate(r.createdAt),
        updatedAt: formatDate(r.updatedAt),
        imageUrl: r.imageUrl,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const citizenId = req.citizen.id;
    const reportId = req.params.id;

    const report = await prisma.report.findFirst({
      where: { id: reportId, citizenId },
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
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

export default router;