import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { asyncHandler, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { JobStatus, JobType } from '@prisma/client';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'TEXT_TO_CARTOON', 'LIP_SYNC', 'SUBTITLES', 'UPSCALE', 'BACKGROUND_REMOVAL', 'VOICE_CLONE', 'TRANSLATION']).optional(),
  projectId: z.string().cuid().optional(),
});

router.get('/', authMiddleware, validateQuery(listQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status, type, projectId } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };
  if (status) where.status = status;
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.job.count({ where }),
  ]);

  res.json({ jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await prisma.job.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { project: { select: { id: true, name: true, type: true } } },
  });
  if (!job) throw new NotFoundError('Job');
  res.json({ job });
}));

router.post('/:id/cancel', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await prisma.job.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!job) throw new NotFoundError('Job');
  if (!['PENDING', 'QUEUED', 'PROCESSING'].includes(job.status)) {
    throw new AuthorizationError('Job cannot be cancelled');
  }

  await prisma.job.update({
    where: { id: job.id },
    data: { status: JobStatus.CANCELLED, completedAt: new Date() },
  });

  res.json({ message: 'Job cancelled' });
}));

router.post('/:id/retry', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await prisma.job.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!job) throw new NotFoundError('Job');
  if (job.status !== JobStatus.FAILED) {
    throw new AuthorizationError('Only failed jobs can be retried');
  }
  if (job.retryCount >= job.maxRetries) {
    throw new AuthorizationError('Maximum retries exceeded');
  }

  const newJob = await prisma.job.create({
    data: {
      projectId: job.projectId,
      userId: req.user!.id,
      type: job.type,
      status: JobStatus.QUEUED,
      input: job.input,
      priority: job.priority,
      retryCount: job.retryCount + 1,
    },
  });

  res.status(201).json({ job: newJob });
}));

export default router;