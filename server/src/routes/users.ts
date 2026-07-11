import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

const profileQuerySchema = z.object({
  includeProjects: z.coerce.boolean().default(false),
  includeAssets: z.coerce.boolean().default(false),
});

router.get('/me/profile', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, name: true, username: true, avatar: true, bio: true,
      role: true, credits: true, totalCreditsUsed: true, creditsResetAt: true,
      emailVerified: true, twoFactorEnabled: true, lastLoginAt: true, createdAt: true,
      preferences: true,
      _count: { select: { projects: true, assets: true, exports: true } },
    },
  });
  if (!user) throw new NotFoundError('User');
  res.json({ user });
}));

router.get('/:username', validateParams(z.object({ username: z.string() })), asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username.toLowerCase() },
    select: {
      id: true, name: true, username: true, avatar: true, bio: true, createdAt: true,
      _count: { select: { projects: { where: { isPublic: true } } } },
    },
  });
  if (!user) throw new NotFoundError('User');
  res.json({ user });
}));

router.get('/:username/projects', validateParams(z.object({ username: z.string() })), validateQuery(z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})), asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as any;
  const user = await prisma.user.findUnique({ where: { username: req.params.username.toLowerCase() }, select: { id: true } });
  if (!user) throw new NotFoundError('User');

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, isPublic: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { exports: { where: { status: 'COMPLETED' }, take: 1, orderBy: { createdAt: 'desc' } } },
    }),
    prisma.project.count({ where: { userId: user.id, isPublic: true } }),
  ]);

  res.json({ projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:username/assets', validateParams(z.object({ username: z.string() })), validateQuery(z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.string().optional(),
})), asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, type } = req.query as any;
  const user = await prisma.user.findUnique({ where: { username: req.params.username.toLowerCase() }, select: { id: true } });
  if (!user) throw new NotFoundError('User');

  const where: any = { userId: user.id, isPublic: true };
  if (type) where.type = type;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.asset.count({ where }),
  ]);

  res.json({ assets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

export default router;