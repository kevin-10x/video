import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { ensureBucket } from '../lib/minio.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    redis: 'unknown',
    storage: 'unknown',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  try {
    await ensureBucket();
    checks.storage = 'ok';
  } catch {
    checks.storage = 'error';
  }

  const status = Object.values(checks).every(v => v === 'ok') ? 200 : 503;
  res.status(status).json(checks);
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    await ensureBucket();
    res.json({ ready: true });
  } catch {
    res.status(503).json({ ready: false });
  }
});

router.get('/live', (_req: Request, res: Response) => {
  res.json({ alive: true });
});

export default router;