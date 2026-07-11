import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';

const router = new Hono();

const uploadInitSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive().max(524288000),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT']),
  projectId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
});

router.post('/upload-url', zValidator('json', uploadInitSchema), async (c) => {
  const env = c.env;
  const user = c.get('user');
  const { fileName, fileType, fileSize, type, projectId, tags } = c.req.valid('json');

  if (projectId) {
    const project = await createPrisma(env).project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) throw new HTTPException(404, { message: 'Project not found' });
  }

  const objectName = `users/${user.id}/assets/${uuidv4()}-${fileName}`;
  const uploadUrl = await env.STORAGE.createMultipartUpload(objectName, {
    httpMetadata: { contentType: fileType },
    customMetadata: { userId: user.id, type, projectId: projectId || '', tags: JSON.stringify(tags || []) },
  });

  return c.json({ 
    uploadUrl: `https://${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/${objectName}?uploadId=${uploadUrl.uploadId}`,
    objectName,
    fileUrl: `${env.MINIO_PUBLIC_URL}/${objectName}`,
  });
});

const createAssetSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT']),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  projectId: z.string().cuid().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

router.post('/', zValidator('json', createAssetSchema), async (c) => {
  const env = c.env;
  const user = c.get('user');
  const data = c.req.valid('json');

  if (data.projectId) {
    const project = await createPrisma(env).project.findFirst({ where: { id: data.projectId, userId: user.id } });
    if (!project) throw new HTTPException(404, { message: 'Project not found' });
  }

  const asset = await createPrisma(env).asset.create({
    data: { ...data, userId: user.id, projectId: data.projectId, metadata: data.metadata || {}, tags: data.tags || [] },
  });
  return c.json({ asset }, 201);
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL', 'STYLE', 'CHARACTER', 'BACKGROUND', 'CLOTHING', 'ACCESSORY', 'MUSIC', 'SOUND_EFFECT', 'SUBTITLE', 'SCRIPT']).optional(),
  projectId: z.string().cuid().optional(),
  tags: z.string().optional(),
});

router.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { page, limit, type, projectId, tags } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;
  if (tags) where.tags = { hasSome: tags.split(',') };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.asset.count({ where }),
  ]);

  return c.json({ assets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const asset = await prisma.asset.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!asset) throw new HTTPException(404, { message: 'Asset not found' });

  const downloadUrl = await c.env.STORAGE.createSignedGetUrl(asset.url.split('/').pop()!, { expiresIn: 3600 });
  return c.json({ asset: { ...asset, downloadUrl } });
});

router.patch('/:id', zValidator('param', z.object({ id: z.string().cuid() })), zValidator('json', z.object({
  name: z.string().min(1).max(255).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
})), async (c) => {
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const asset = await prisma.asset.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!asset) throw new HTTPException(404, { message: 'Asset not found' });

  const updated = await prisma.asset.update({ where: { id: asset.id }, data: c.req.valid('json') });
  return c.json({ asset: updated });
});

router.delete('/:id', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const user = c.get('user');
  const asset = await prisma.asset.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!asset) throw new HTTPException(404, { message: 'Asset not found' });

  await env.STORAGE.delete(asset.url.split('/').pop()!);
  await prisma.asset.delete({ where: { id: asset.id } });
  return c.json({ message: 'Asset deleted' });
});

router.post('/:id/download', zValidator('param', z.object({ id: z.string().cuid() })), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const user = c.get('user');
  const asset = await prisma.asset.findFirst({ where: { id: c.req.valid('param').id, userId: user.id } });
  if (!asset) throw new HTTPException(404, { message: 'Asset not found' });

  const downloadUrl = await env.STORAGE.createSignedGetUrl(asset.url.split('/').pop()!, { expiresIn: 3600 });
  await prisma.asset.update({ where: { id: asset.id }, data: { downloadCount: { increment: 1 } } });
  return c.json({ downloadUrl });
});

export default router;