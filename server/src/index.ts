import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { ensureBucket } from './lib/minio.js';

import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import jobRoutes from './routes/jobs.js';
import assetRoutes from './routes/assets.js';
import exportRoutes from './routes/exports.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((_req, _res, next) => {
  const error = new Error('Route not found') as any;
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    await redis.connect();
    console.log('✅ Redis connected');
    
    await ensureBucket();
    console.log('✅ MinIO bucket ready');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`📝 API: http://localhost:${config.port}/api`);
      console.log(`🏥 Health: http://localhost:${config.port}/api/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;