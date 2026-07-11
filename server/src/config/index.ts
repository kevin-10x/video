import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/adamae',
  
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-min-32-chars',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    bucket: process.env.MINIO_BUCKET || 'adamae',
    publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000/adamae',
  },
  
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    token: process.env.AI_SERVICE_TOKEN || 'ai-service-secret-token',
  },
  
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      callbackUrl: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/api/auth/microsoft/callback',
    },
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'AfroToon AI <noreply@adamae.com>',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  
  credits: {
    freeCredits: parseInt(process.env.FREE_CREDITS || '100', 10),
    creditResetDays: parseInt(process.env.CREDIT_RESET_DAYS || '30', 10),
  },
  
  video: {
    maxDuration: 300, // 5 minutes default
    supportedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    maxResolution: { width: 3840, height: 2160 },
  },
  
  animationStyles: [
    'ANIME',
    'COMIC',
    'PIXAR_STYLE',
    'DISNEY_STYLE',
    'AFRICAN_CARTOON',
    'MANGA',
    'CHIBI',
    'GHIBLI_STYLE',
    'CYBERPUNK',
    'FANTASY',
    'WATERCOLOR',
    'OIL_PAINTING',
    'PENCIL_SKETCH',
    'CLAYMATION',
    'LEGO_STYLE',
  ] as const,
};

export type Config = typeof config;