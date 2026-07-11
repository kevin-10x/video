import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { ExportQuality, ExportFormat, JobStatus } from '@prisma/client';

const router = Router();

const createExportSchema = z.object({
  projectId: z.string().cuid(),
  quality: z.enum(['P720', 'P1080', 'P2K', 'P4K']).default('P1080'),
  format: z.enum(['MP4', 'MOV', 'GIF', 'WEBM']).default('MP4'),
  watermark: z.boolean().default(true),
  includesAudio: z.boolean().default(true),
  subtitleIds: z.array(z.string().cuid()).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  projectId: z.string().cuid().optional(),
});

router.post('/', authMiddleware, validateBody(createExportSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, quality, format, watermark, includesAudio, subtitleIds } = req.body;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.user!.id },
    include: { exports: { where: { status: 'COMPLETED' }, orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (!project) throw new NotFoundError('Project');

  if (project.status !== 'COMPLETED') {
    throw new Error('Project not completed yet');
  }

  const latestExport = project.exports[0];
  if (!latestExport) throw new NotFoundError('No completed render to export');

  const exportRecord = await prisma.export.create({
    data: {
      projectId,
      userId: req.user!.id,
      quality,
      format,
      watermark,
      includesAudio,
      subtitles: subtitleIds ? subtitleIds.map(id => ({ id })) : [],
      status: 'PENDING',
    },
  });

  // TODO: Trigger actual export job via AI service
  res.status(201).json({ export: exportRecord });
}));

router.get('/', authMiddleware, validateQuery(listQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, projectId } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };
  if (projectId) where.projectId = projectId;

  const [exports, total] = await Promise.all([
    prisma.export.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.export.count({ where }),
  ]);

  res.json({ exports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const exportRecord = await prisma.export.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { project: { select: { id: true, name: true, style: true } } },
  });
  if (!exportRecord) throw new NotFoundError('Export');
  res.json({ export: exportRecord });
}));

router.get('/:id/download', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const exportRecord = await prisma.export.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!exportRecord) throw new NotFoundError('Export');
  if (exportRecord.status !== 'COMPLETED') throw new Error('Export not ready');
  if (exportRecord.expiresAt && exportRecord.expiresAt < new Date()) throw new Error('Download link expired');

  await prisma.export.update({ where: { id: exportRecord.id }, data: { downloadCount: { increment: 1 } } });
  
  res.json({ downloadUrl: exportRecord.url });
}));

export default router;