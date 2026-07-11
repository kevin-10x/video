import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { NotificationType } from '@prisma/client';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.enum(['JOB_COMPLETED', 'JOB_FAILED', 'EXPORT_READY', 'PROJECT_SHARED', 'COMMENT_MENTION', 'SYSTEM_ANNOUNCEMENT', 'CREDIT_LOW', 'SUBSCRIPTION_CHANGE']).optional(),
});

router.get('/', authMiddleware, validateQuery(listQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, unreadOnly, type } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };
  if (unreadOnly) where.read = false;
  if (type) where.type = type;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user!.id, read: false } }),
  ]);

  res.json({ notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.patch('/:id/read', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!notification) throw new NotFoundError('Notification');

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true, readAt: new Date() },
  });
  res.json({ notification: updated });
}));

router.patch('/read-all', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true, readAt: new Date() },
  });
  res.json({ message: 'All notifications marked as read' });
}));

router.delete('/:id', authMiddleware, validateParams(z.object({ id: z.string().cuid() })), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!notification) throw new NotFoundError('Notification');

  await prisma.notification.delete({ where: { id: notification.id } });
  res.json({ message: 'Notification deleted' });
}));

export default router;