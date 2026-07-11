import { Hono } from 'hono';
import { z } from 'zod';

const router = new Hono();

router.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
  });
});

router.get('/ready', async (c) => {
  try {
    const prisma = c.get('prisma');
    await prisma.$queryRaw`SELECT 1`;
    await c.env.SESSIONS.get('health-check');
    return c.json({ ready: true });
  } catch {
    return c.json({ ready: false }, 503);
  }
});

router.get('/live', (c) => {
  return c.json({ alive: true });
});

export default router;