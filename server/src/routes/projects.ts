import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { asyncHandler, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { aiService } from '../lib/aiClient.js';
import { minio, getPresignedPutUrl } from '../lib/minio.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'AFRICAN_CARTOON_GENERATOR', 'TEXT_TO_CARTOON', 'IMAGE_TO_CARTOON']),
  style: z.string().optional(),
  quality: z.enum(['LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K']).default('MEDIUM_720P'),
  fps: z.number().int().min(1).max(60).default(30),
  styleConfig: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  style: z.string().optional(),
  quality: z.enum(['LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K']).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  styleConfig: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED']).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'AFRICAN_CARTOON_GENERATOR', 'TEXT_TO_CARTOON', 'IMAGE_TO_CARTOON']).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

router.post('/', validateBody(createProjectSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.create({
    data: { ...req.body, userId: req.user!.id },
  });
  res.status(201).json({ project });
}));

router.get('/', validateQuery(listQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status, type, sort, order } = req.query as any;
  const where = { userId: req.user!.id, ...(status && { status }), ...(type && { type }) };
  
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { jobs: true, exports: true, assets: true } } },
    }),
    prisma.project.count({ where }),
  ]);

  res.json({ projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      jobs: { orderBy: { createdAt: 'desc' } },
      exports: { orderBy: { createdAt: 'desc' } },
      assets: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!project) throw new NotFoundError('Project');
  res.json({ project });
}));

router.patch('/:id', validateParams(z.object({ id: z.string().cuid() })), validateBody(updateProjectSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw new NotFoundError('Project');
  if (project.status === 'PROCESSING') throw new AuthorizationError('Cannot edit processing project');

  const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json({ project: updated });
}));

router.delete('/:id', validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw new NotFoundError('Project');
  if (project.status === 'PROCESSING') throw new AuthorizationError('Cannot delete processing project');

  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
}));

router.post('/:id/duplicate', validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw new NotFoundError('Project');

  const duplicated = await prisma.project.create({
    data: {
      userId: req.user!.id,
      name: `${project.name} (Copy)`,
      description: project.description,
      type: project.type,
      style: project.style,
      quality: project.quality,
      fps: project.fps,
      styleConfig: project.styleConfig,
      settings: project.settings,
    },
  });
  res.status(201).json({ project: duplicated });
}));

router.get('/:id/upload-url', validateParams(z.object({ id: z.string().cuid() })), validateBody(z.object({
  fileName: z.string(),
  contentType: z.string(),
})), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw new NotFoundError('Project');

  const objectName = `projects/${project.id}/uploads/${uuidv4()}-${req.body.fileName}`;
  const url = await getPresignedPutUrl(objectName, 3600);
  res.json({ uploadUrl: url, objectName });
}));

router.post('/:id/start', validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw new NotFoundError('Project');
  if (project.status === 'PROCESSING') throw new AuthorizationError('Project already processing');

  await prisma.project.update({ where: { id: project.id }, data: { status: 'PROCESSING', progress: 0 } });

  const job = await aiService.createJob({
    type: project.type === 'VIDEO_TO_CARTOON' ? 'VIDEO_TO_CARTOON' : 'TEXT_TO_CARTOON',
    projectId: project.id,
    userId: req.user!.id,
    input: { style: project.style, quality: project.quality, fps: project.fps, ...project.styleConfig },
  });

  await prisma.job.create({
    data: {
      projectId: project.id,
      userId: req.user!.id,
      type: project.type === 'VIDEO_TO_CARTOON' ? 'VIDEO_TO_CARTOON' : 'TEXT_TO_CARTOON',
      status: 'QUEUED',
      input: { aiJobId: job.jobId },
    },
  });

  res.json({ message: 'Processing started', jobId: job.jobId });
}));

router.get('/public/:shareToken', asyncHandler(async (req: Request, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { shareToken: req.params.shareToken, isPublic: true },
    include: { exports: { where: { status: 'COMPLETED' }, orderBy: { createdAt: 'desc' } } },
  });
  if (!project) throw new NotFoundError('Project');
  res.json({ project });
}));

export default router;