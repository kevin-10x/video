import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono();

const createExportSchema = z.object({
  projectId: z.string().cuid(),
  quality: z.enum(['P720', 'P1080', 'P2K', 'P4K']).default('P1080'),
  format: z.enum(['MP4', 'MOV', 'GIF', 'WEBM']).default('MP4'),
  watermark: z.boolean().default(true),
  includesAudio: z.boolean().default(true),
  subtitleIds: z.array(z.string().cuid()).optional(),
});

router.post('/', zValidator('json', createExportSchema), async (c) => {
  const env = c.env;
  const user = c.get('user');
  const data = c.req.valid('json');

  const prisma = createPrisma(env);
  const project = await prisma.project.findFirst({ where: { id: data.projectId, userId: user.id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });
  if (project.status !== 'COMPLETED') throw new HTTPException(400, { message: 'Project not completed' });

  const exportRecord = await prisma.export.create({
    data: {
      projectId: data.projectId,
      userId: user.id,
      quality: data.quality,
      format: data.format,
      watermark: data.watermark,
      includesAudio: data.includesAudio,
      subtitles: data.subtitleIds ? data.subtitleIds.map(id => ({ id })) : [],
      status: 'PENDING',
    },
  });

  return c.json({ export: exportRecord, message: 'Export queued' }, 201);
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  projectId: z.string().cuid().optional(),
});

router.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { page, limit, projectId } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };
  if (projectId) where.projectId = projectId;

  const [exports, total] = await Promise.all([
    prisma.export.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { project: { select: { id: true, name: true, style: true } } } }),
    prisma.export.count({ where }),
  ]);

  return c.json({ exports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const exportRecord = await prisma.export.findFirst({ where: { id: c.req.valid('param').id, userId: user.id }, include: { project: { select: { id: true, name: true, style: true } } } });
  if (!exportRecord) throw new HTTPException(404, { message: 'Export not found' });
  return c.json({ export: exportRecord });
});

router.get('/:id/download', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const user = c.get('user');
  const exportRecord = await prisma.export.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!exportRecord) throw new HTTPException(404, { message: 'Export not found' });
  if (exportRecord.status !== 'COMPLETED') throw new HTTPException(400, { message: 'Export not ready' });
  if (exportRecord.expiresAt && exportRecord.expiresAt < new Date()) throw new HTTPException(410, { message: 'Download link expired' });

  await prisma.export.update({ where: { id: exportRecord.id }, data: { downloadCount: { increment: 1 } } });
  return c.json({ downloadUrl: exportRecord.url });
});

export default router;