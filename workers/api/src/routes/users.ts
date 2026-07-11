import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono();

const updatePrefsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  notifications: z.record(z.any()).optional(),
  defaultStyle: z.string().optional(),
  defaultQuality: z.enum(['LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K']).optional(),
  autoSave: z.boolean().optional(),
});

router.get('/me/profile', async (c) => {
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({
    where: { id: c.get('user').id },
    select: {
      id: true, email: true, name: true, username: true, avatar: true, bio: true,
      role: true, credits: true, totalCreditsUsed: true, creditsResetAt: true,
      emailVerified: true, twoFactorEnabled: true, lastLoginAt: true, createdAt: true,
      preferences: true,
      _count: { select: { projects: true, assets: true, exports: true } },
    },
  });
  if (!user) throw new HTTPException(404, { message: 'User not found' });
  return c.json({ user });
});

router.get('/me/stats', async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const [projectsByStatus, exportsByFormat, credits] = await Promise.all([
    prisma.project.groupBy({ by: ['status'], where: { userId: user.id }, _count: { status: true } }),
    prisma.export.groupBy({ by: ['format', 'quality'], where: { userId: user.id }, _count: { format: true } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { credits: true, totalCreditsUsed: true, creditsResetAt: true } }),
  ]);
  return c.json({ stats: { projectsByStatus, exportsByFormat, credits } });
});

router.patch('/me/preferences', zValidator('json', updatePrefsSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const prefs = await prisma.userPreference.upsert({
    where: { userId: c.get('user').id },
    update: c.req.valid('json'),
    create: { userId: c.get('user').id, ...c.req.valid('json') },
  });
  return c.json({ preferences: prefs });
});

router.get('/me/sessions', async (c) => {
  const prisma = createPrisma(c.env);
  const sessions = await prisma.session.findMany({
    where: { userId: c.get('user').id },
    select: { id: true, ipAddress: true, userAgent: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ sessions });
});

router.delete('/me/sessions/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const session = await prisma.session.findFirst({ where: { id: c.req.valid('param').id, userId: c.get('user').id } });
  if (!session) throw new HTTPException(404, { message: 'Session not found' });
  await prisma.session.delete({ where: { id: session.id } });
  return c.json({ message: 'Session revoked' });
});

router.get('/me/api-keys', async (c) => {
  const prisma = createPrisma(c.env);
  const keys = await prisma.apiKey.findMany({
    where: { userId: c.get('user').id },
    select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ apiKeys: keys });
});

router.post('/me/api-keys', zValidator('json', z.object({ name: z.string().min(1).max(50), expiresAt: z.string().datetime().optional() })), async (c) => {
  const crypto = require('crypto');
  const key = `adm_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.slice(0, 12);

  const prisma = createPrisma(c.env);
  const apiKey = await prisma.apiKey.create({
    data: { userId: c.get('user').id, name: c.req.valid('json').name, keyHash, keyPrefix, expiresAt: c.req.valid('json').expiresAt ? new Date(c.req.valid('json').expiresAt) : null },
  });
  return c.status(201).json({ apiKey: { ...apiKey, key } });
});

router.delete('/me/api-keys/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const apiKey = await prisma.apiKey.findFirst({ where: { id: c.req.valid('param').id, userId: c.get('user').id } });
  if (!apiKey) throw new HTTPException(404, { message: 'API key not found' });
  await prisma.apiKey.delete({ where: { id: apiKey.id } });
  return c.json({ message: 'API key revoked' });
});

router.get('/:username', zValidator('param', z.object({ username: z.string() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({
    where: { username: c.req.valid('param').username.toLowerCase() },
    select: { id: true, name: true, username: true, avatar: true, bio: true, createdAt: true, _count: { select: { projects: { where: { isPublic: true } } } } },
  });
  if (!user) throw new HTTPException(404, { message: 'User not found' });
  return c.json({ user });
});

router.get('/:username/projects', zValidator('param', z.object({ username: z.string() })), zValidator('query', z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(12) })), async (c) => {
  const { page, limit } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({ where: { username: c.req.valid('param').username.toLowerCase() }, select: { id: true } });
  if (!user) throw new HTTPException(404, { message: 'User not found' });

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id, isPublic: true }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { exports: { where: { status: 'COMPLETED' }, take: 1, orderBy: { createdAt: 'desc' } } } }),
    prisma.project.count({ where: { userId: user.id, isPublic: true } }),
  ]);
  return c.json({ projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/:username/assets', zValidator('param', z.object({ username: z.string() })), zValidator('query', z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20), type: z.string().optional() })), async (c) => {
  const { page, limit, type } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({ where: { username: c.req.valid('param').username.toLowerCase() }, select: { id: true } });
  if (!user) throw new HTTPException(404, { message: 'User not found' });

  const where: any = { userId: user.id, isPublic: true };
  if (type) where.type = type;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.asset.count({ where }),
  ]);
  return c.json({ assets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export default router;