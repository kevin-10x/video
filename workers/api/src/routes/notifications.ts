import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.enum(['JOB_COMPLETED', 'JOB_FAILED', 'EXPORT_READY', 'PROJECT_SHARED', 'COMMENT_MENTION', 'SYSTEM_ANNOUNCEMENT', 'CREDIT_LOW', 'SUBSCRIPTION_CHANGE']).optional(),
});

router.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { page, limit, unreadOnly, type } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };
  if (unreadOnly) where.read = false;
  if (type) where.type = type;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return c.json({ notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.patch('/:id/read', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const notification = await prisma.notification.findFirst({ where: { id: c.req.valid('param').id, userId: c.get('user').id } });
  if (!notification) throw new HTTPException(404, { message: 'Notification not found' });
  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true, readAt: new Date() } });
  return c.json({ notification: updated });
});

router.patch('/read-all', async (c) => {
  const prisma = createPrisma(c.env);
  await prisma.notification.updateMany({ where: { userId: c.get('user').id, read: false }, data: { read: true, readAt: new Date() } });
  return c.json({ message: 'All notifications marked as read' });
});

router.delete('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const notification = await prisma.notification.findFirst({ where: { id: c.req.valid('param').id, userId: c.get('user').id } });
  if (!notification) throw new HTTPException(404, { message: 'Notification not found' });
  await prisma.notification.delete({ where: { id: notification.id } });
  return c.json({ message: 'Notification deleted' });
});

export default router;