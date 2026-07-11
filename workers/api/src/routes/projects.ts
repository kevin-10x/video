import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { v4 as uuidv4 } from 'uuid';

const router = new Hono();

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'AFRICAN_CARTOON_GENERATOR', 'TEXT_TO_CARTOON', 'IMAGE_TO_CARTOON']),
  style: z.string().optional(),
  quality: z.enum(['LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K']).default('MEDIUM_720P'),
  fps: z.number().int().min(1).max(60).default(30),
  settings: z.record(z.any()).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  style: z.string().optional(),
  quality: z.enum(['LOW_480P', 'MEDIUM_720P', 'HIGH_1080P', 'ULTRA_2K', 'ULTRA_4K']).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  settings: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED']).optional(),
  type: z.enum(['VIDEO_TO_CARTOON', 'AFRICAN_CARTOON_GENERATOR', 'TEXT_TO_CARTOON', 'IMAGE_TO_CARTOON']).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

function createPrisma(env: Cloudflare.Env) {
  return new PrismaClient({ datasourceUrl: env.DATABASE_URL }).$extends(withAccelerate());
}

async function triggerAIProcessing(projectId: string, env: Cloudflare.Env, input: any) {
  const response = await fetch(`${env.AI_SERVICE_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_SERVICE_TOKEN}`,
    },
    body: JSON.stringify({
      type: 'VIDEO_TO_CARTOON',
      projectId,
      userId: '', // Will be filled by AI service
      input,
      priority: 10,
    }),
  });
  return response.json();
}

router.post('/', zValidator('json', createProjectSchema), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const user = c.get('user');

  const project = await prisma.project.create({
    data: { ...c.req.valid('json'), userId: user.id, style: c.req.valid('json').style || 'AFRICAN_CARTOON' },
  });
  return c.json({ project }, 201);
});

router.get('/', zValidator('query', listQuerySchema), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const { page, limit, status, type, sort, order } = c.req.valid('query');
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };
  if (status) where.status = status;
  if (type) where.type = type;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
      include: { _count: { select: { jobs: true, exports: true, assets: true } } },
    }),
    prisma.project.count({ where }),
  ]);

  return c.json({ projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const project = await prisma.project.findFirst({
    where: { id: c.req.valid('param').id, userId: user.id },
    include: { jobs: { orderBy: { createdAt: 'asc' } }, exports: { orderBy: { createdAt: 'desc' } }, assets: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });
  return c.json({ project });
});

router.patch('/:id', zValidator('param', z.object({ id: z.string().cuid() })), zValidator('json', updateProjectSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const project = await prisma.project.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });
  if (project.status === 'PROCESSING') throw new HTTPException(400, { message: 'Cannot edit processing project' });

  const updated = await prisma.project.update({ where: { id: project.id }, data: c.req.valid('json') });
  return c.json({ project: updated });
});

router.delete('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const project = await prisma.project.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });
  if (project.status === 'PROCESSING') throw new HTTPException(400, { message: 'Cannot delete processing project' });

  await prisma.project.delete({ where: { id: project.id } });
  return c.json({ message: 'Project deleted' });
});

router.post('/:id/upload-url', zValidator('param', z.object({ id: z.string().cuid() })), zValidator('json', z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().int().positive().max(524288000),
})), async (c) => {
  const env = c.env;
  const project = await createPrisma(env).project.findFirst({ where: { id: c.req.valid('param').id, userId: c.get('user').id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });

  const objectName = `projects/${project.id}/uploads/${uuidv4()}-${c.req.valid('json').fileName}`;
  const uploadUrl = await env.STORAGE.createMultipartUpload(objectName, { 
    httpMetadata: { contentType: c.req.valid('json').fileType },
    customMetadata: { projectId: project.id, userId: c.get('user').id },
  });

  return c.json({ 
    uploadUrl: `https://${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/${objectName}?uploadId=${uploadUrl.uploadId}`,
    objectName,
    fileUrl: `${env.MINIO_PUBLIC_URL}/${objectName}`,
  });
});

router.post('/:id/start', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const user = c.get('user');
  
  const project = await prisma.project.findFirst({ where: { id: c.req.valid('param').id, userId: user.id }, include: { assets: true } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });
  if (project.status === 'PROCESSING') throw new HTTPException(400, { message: 'Project already processing' });

  const videoAsset = project.assets.find(a => a.type === 'VIDEO' && a.mimeType.startsWith('video/'));
  if (!videoAsset) throw new HTTPException(400, { message: 'No video asset found' });

  await prisma.project.update({ where: { id: project.id }, data: { status: 'PROCESSING', progress: 0 } });

  const job = await prisma.job.create({
    data: {
      projectId: project.id,
      userId: user.id,
      type: 'VIDEO_TO_CARTOON',
      status: 'QUEUED',
      input: { videoUrl: videoAsset.url, style: project.style, quality: project.quality, fps: project.fps, settings: project.settings },
      priority: 10,
    },
  });

  await triggerAIProcessing(job.id, env, job.input);

  return c.json({ job, message: 'Processing started' });
});

router.post('/:id/share', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const project = await prisma.project.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });

  const shareToken = uuidv4();
  const updated = await prisma.project.update({ where: { id: project.id }, data: { isPublic: true, shareToken } });
  return c.json({ shareUrl: `${env.CLIENT_URL}/shared/${shareToken}`, project: updated });
});

router.delete('/:id/share', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const project = await prisma.project.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!project) throw new HTTPException(404, { message: 'Project not found' });

  const updated = await prisma.project.update({ where: { id: project.id }, data: { isPublic: false, shareToken: null } });
  return c.json({ project: updated });
});

router.get('/shared/:token', zValidator('param', z.object({ token: z.string() })), async (c) => {
  const prisma = createPrisma(c.env);
  const project = await prisma.project.findFirst({
    where: { shareToken: c.req.valid('param').token, isPublic: true },
    include: { exports: { where: { status: 'COMPLETED' }, orderBy: { createdAt: 'desc' }, take: 1 }, user: { select: { name: true, username: true, avatar: true } } },
  });
  if (!project) throw new HTTPException(404, { message: 'Shared project not found' });
  return c.json({ project });
});

export default router;