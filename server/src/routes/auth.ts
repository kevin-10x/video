import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncHandler, AuthenticationError, ConflictError, ValidationError } from '../middleware/errorHandler.js';
import { generateAccessToken, generateRefreshToken, verifyToken, AuthenticatedRequest } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(128),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

router.post('/register', validateBody(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: username || '' }] },
  });
  if (existing) {
    throw new ConflictError(existing.email === email ? 'Email already registered' : 'Username taken');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      username: username?.toLowerCase(),
      credits: config.credits.freeCredits,
      creditsResetAt: new Date(Date.now() + config.credits.creditResetDays * 24 * 60 * 60 * 1000),
    },
    select: { id: true, email: true, name: true, username: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: 'USER', sessionId: '' });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: 'USER', sessionId: '' });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.update({ where: { id: session.id }, data: { token: refreshToken } });
  
  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: 'USER', sessionId: session.id });
  const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: 'USER', sessionId: session.id });
  
  await prisma.session.update({ where: { id: session.id }, data: { token: newRefreshToken } });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ user, accessToken: newAccessToken });
}));

router.post('/login', validateBody(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthenticationError('Invalid credentials');

  if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
    throw new AuthenticationError('Account is suspended');
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: '', // Will update after generating tokens
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id });

  await prisma.session.update({ where: { id: session.id }, data: { token: refreshToken } });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, avatar: user.avatar },
    accessToken,
  });
}));

router.post('/refresh', validateBody(refreshSchema), asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const payload = verifyToken(refreshToken);
  if (payload.type !== 'refresh') throw new AuthenticationError('Invalid token type');

  const session = await prisma.session.findUnique({ where: { token: refreshToken } });
  if (!session || session.expiresAt < new Date()) {
    throw new AuthenticationError('Session expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, role: true, status: true } });
  if (!user || user.status !== 'ACTIVE') throw new AuthenticationError('User not found or inactive');

  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id });
  const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id });

  await prisma.session.update({ where: { id: session.id }, data: { token: newRefreshToken } });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken });
}));

router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    try {
      const payload = verifyToken(refreshToken);
      if (payload.type === 'refresh') {
        await prisma.session.deleteMany({ where: { token: refreshToken } });
      }
    } catch {
      // Ignore invalid tokens
    }
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}));

router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AuthenticationError();

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (payload.type !== 'access') throw new AuthenticationError('Invalid token type');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, email: true, name: true, username: true, avatar: true, bio: true,
      role: true, credits: true, createdAt: true, lastLoginAt: true,
      preferences: true, _count: { select: { projects: true, assets: true } },
    },
  });
  if (!user) throw new AuthenticationError('User not found');
  res.json({ user });
}));

router.patch('/me', validateBody(updateProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AuthenticationError();
  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (req.body.username) {
    const existing = await prisma.user.findUnique({ where: { username: req.body.username.toLowerCase() } });
    if (existing && existing.id !== payload.userId) throw new ConflictError('Username taken');
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { ...req.body, username: req.body.username?.toLowerCase() },
    select: { id: true, email: true, name: true, username: true, avatar: true, bio: true },
  });
  res.json({ user });
}));

router.post('/change-password', validateBody(z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
})), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AuthenticationError();
  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.passwordHash) throw new AuthenticationError();

  const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
  if (!valid) throw new AuthenticationError('Current password incorrect');

  const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  res.json({ message: 'Password changed. Please log in again.' });
}));

router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return res.json({ message: 'If email exists, reset link sent' });

  // TODO: Send reset email
  res.json({ message: 'If email exists, reset link sent' });
}));

router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
  // TODO: Verify reset token
  res.json({ message: 'Password reset' });
}));

router.get('/google', asyncHandler(async (_req: Request, res: Response) => {
  const state = uuidv4();
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${config.oauth.google.clientId}&` +
    `redirect_uri=${encodeURIComponent(config.oauth.google.callbackUrl)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`;
  res.redirect(url);
}));

router.get('/google/callback', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement Google OAuth callback
  res.redirect(`${config.clientUrl}/auth/callback?provider=google`);
}));

export default router;