import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validateParams, validateQuery, validateBody } from '../middleware/validate.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { minio, uploadBuffer } from '../lib/minio.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = Router();

const uploadUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  projectId: z.string().cuid().optional(),
});

const createAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT']),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().cuid().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT']).optional(),
  projectId: z.string().cuid().optional(),
  tags: z.string().optional(),
});

router.post('/upload-url', authMiddleware, validateBody(uploadUrlSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { fileName, contentType, projectId } = req.body;
  const objectName = `uploads/${req.user!.id}/${uuidv4()}-${fileName}`;
  const uploadUrl = await minio.presignedPutObject('adamae', objectName, 3600);
  
  res.json({ uploadUrl, objectName, fileUrl: `${process.env.MINIO_PUBLIC_URL}/${objectName}` });
}));

router.post('/', authMiddleware, validateBody(createAssetSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await prisma.asset.create({
    data: { ...req.body, userId: req.user!.id, tags: req.body.tags || [] },
  });
  res.status(201).json({ asset });
}));

router.get('/', authMiddleware, validateQuery(listQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, type, projectId, tags } = req.query as any;
  const where: any = { userId: req.user!.id };
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;
  if (tags) where.tags = { hasSome: tags.split(',') };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  res.json({ assets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/african-library', authMiddleware, validateQuery(z.object({
  category: z.enum(['characters', 'backgrounds', 'clothing', 'accessories', 'music', 'sound_effects', 'all']).optional(),
  region: z.string().optional(),
  style: z.string().optional(),
})), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Return curated African assets
  const categories = req.query.category || 'all';
  const assets = await prisma.asset.findMany({
    where: {
      isPublic: true,
      type: { in: ['CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT'] },
      tags: { hasSome: ['african', 'afrotoon'] },
    },
    take: 50,
    orderBy: { downloadCount: 'desc' },
  });
  res.json({ assets });
}));

router.get('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!asset) throw new NotFoundError('Asset');
  res.json({ asset });
}));

router.patch('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), validateBody(z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
})), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!asset) throw new NotFoundError('Asset');
  
  const updated = await prisma.asset.update({ where: { id: asset.id }, data: req.body });
  res.json({ asset: updated });
}));

router.delete('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!asset) throw new NotFoundError('Asset');
  
  await minio.removeObject('adamae', asset.url.split('/').pop()!);
  await prisma.asset.delete({ where: { id: asset.id } });
  res.json({ message: 'Asset deleted' });
}));

router.post('/:id/download', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!asset) throw new NotFoundError('Asset');
  
  const downloadUrl = await minio.presignedGetObject('adamae', asset.url.split('/').pop()!, 3600);
  await prisma.asset.update({ where: { id: asset.id }, data: { downloadCount: { increment: 1 } } });
  
  res.json({ downloadUrl });
}));

export default router;