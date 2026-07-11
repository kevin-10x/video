import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { csrf } from 'hono/csrf';

import { authMiddleware, optionalAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { validateBody, validateQuery, validateParams } from './middleware/validate.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import jobRoutes from './routes/jobs.js';
import assetRoutes from './routes/assets.js';
import exportRoutes from './routes/exports.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import healthRoutes from './routes/health.js';
import africanAssetRoutes from './routes/african-assets.js';

import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  namespace Cloudflare {
    interface Env {
      DATABASE_URL: string;
      JWT_SECRET: string;
      ENCRYPTION_KEY: string;
      MINIO_ENDPOINT: string;
      MINIO_ACCESS_KEY: string;
      MINIO_SECRET_KEY: string;
      MINIO_BUCKET: string;
      MINIO_PUBLIC_URL: string;
      AI_SERVICE_URL: string;
      AI_SERVICE_TOKEN: string;
      CLIENT_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      SESSIONS: KVNamespace;
      STORAGE: R2Bucket;
      RATE_LIMITER: DurableObjectNamespace;
    }
  }
}

interface Variables {
  user: {
    id: string;
    email: string;
    role: string;
  };
  sessionId: string;
  prisma: ReturnType<typeof createPrismaClient>;
}

function createPrismaClient(env: Cloudflare.Env) {
  return new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  }).$extends(withAccelerate());
}

const app = new Hono<{ Bindings: Cloudflare.Env; Variables: Variables }>();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.vercel.app'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400,
}));

app.use('/api/*', async (c, next) => {
  c.set('prisma', createPrismaClient(c.env));
  await next();
});

app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: (c) => c.req.header('CF-Connecting-IP') || 'unknown',
  store: {
    async increment(key: string) {
      const kv = c.env.SESSIONS;
      const current = parseInt(await kv.get(`ratelimit:${key}`) || '0');
      const count = current + 1;
      await kv.put(`ratelimit:${key}`, count.toString(), { expirationTtl: 900 });
      return { totalHits: count, resetTime: Date.now() + 900000 };
    },
    async decrement(key: string) {},
    async resetKey(key: string) {
      await c.env.SESSIONS.delete(`ratelimit:${key}`);
    },
  },
}));

app.route('/api/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/projects', authMiddleware, projectRoutes);
app.route('/api/jobs', authMiddleware, jobRoutes);
app.route('/api/assets', authMiddleware, assetRoutes);
app.route('/api/exports', authMiddleware, exportRoutes);
app.route('/api/users', authMiddleware, userRoutes);
app.route('/api/notifications', authMiddleware, notificationRoutes);
app.route('/api/african-assets', authMiddleware, africanAssetRoutes);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
export type AppType = typeof app;