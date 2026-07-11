import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export async function connectRedis() {
  if (redis.status === 'wait') {
    await redis.connect();
  }
  return redis;
}

export const QUEUE_KEYS = {
  AI_JOBS: 'queue:ai-jobs',
  HIGH_PRIORITY: 'queue:high-priority',
  LOW_PRIORITY: 'queue:low-priority',
  PROCESSING: 'processing:jobs',
  COMPLETED: 'completed:jobs',
  FAILED: 'failed:jobs',
};

export const CACHE_KEYS = {
  USER_SESSION: (sessionId: string) => `session:${sessionId}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  PROJECT: (projectId: string) => `project:${projectId}`,
  JOB_PROGRESS: (jobId: string) => `job:progress:${jobId}`,
  ASSET: (assetId: string) => `asset:${assetId}`,
  CREDITS: (userId: string) => `credits:${userId}`,
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
};