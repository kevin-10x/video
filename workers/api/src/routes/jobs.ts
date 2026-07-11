import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'TEXT_TO_CARTOON', 'LIP_SYNC', 'SUBTITLES', 'UPSCALE', 'BACKGROUND_REMOVAL', 'VOICE_CLONE', 'TRANSLATION']).optional(),
  projectId: z.string().cuid().optional(),
});

router.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { page, limit, status, type, projectId } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };
  if (status) where.status = status;
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { project: { select: { id: true, name: true } } } }),
    prisma.job.count({ where }),
  ]);

  return c.json({ jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const job = await prisma.job.findFirst({ where: { id: c.req.valid('param').id, userId: user.id }, include: { project: { select: { id: true, name: true, type: true } } } });
  if (!job) throw new HTTPException(404, { message: 'Job not found' });
  return c.json({ job });
});

router.post('/:id/cancel', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const job = await prisma.job.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!job) throw new HTTPException(404, { message: 'Job not found' });
  if (!['PENDING', 'QUEUED', 'PROCESSING'].includes(job.status)) throw new HTTPException(400, { message: 'Job cannot be cancelled' });

  await prisma.job.update({ where: { id: job.id }, data: { status: 'CANCELLED', completedAt: new Date() } });
  return c.json({ message: 'Job cancelled' });
});

router.post('/:id/retry', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const job = await prisma.job.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!job) throw new HTTPException(404, { message: 'Job not found' });
  if (job.status !== 'FAILED') throw new HTTPException(400, { message: 'Only failed jobs can be retried' });
  if (job.retryCount >= job.maxRetries) throw new HTTPException(400, { message: 'Maximum retries exceeded' });

  const newJob = await prisma.job.create({
    data: { projectId: job.projectId, userId: user.id, type: job.type, status: 'QUEUED', input: job.input, priority: job.priority, retryCount: job.retryCount + 1 },
  });

  await triggerAIProcessing(newJob.id, c.env, job.input);
  return c.json({ job: newJob });
});

async function triggerAIProcessing(jobId: string, env: Cloudflare.Env, input: any) {
  const response = await fetch(`${env.AI_SERVICE_URL}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.AI_SERVICE_TOKEN}` },
    body: JSON.stringify({ type: input.type || 'VIDEO_TO_CARTOON', projectId: input.projectId, userId: input.userId, input, priority: 10 }),
  });
  if (!response.ok) throw new Error('Failed to queue AI job');
}

export default router;