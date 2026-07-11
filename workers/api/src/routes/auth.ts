import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = new Hono();

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

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

function createPrisma(env: Cloudflare.Env) {
  return new PrismaClient({ datasourceUrl: env.DATABASE_URL }).$extends(withAccelerate());
}

async function generateTokens(user: any, sessionId: string, env: Cloudflare.Env) {
  const accessPayload = { userId: user.id, email: user.email, role: user.role, sessionId, type: 'access' };
  const refreshPayload = { userId: user.id, email: user.email, role: user.role, sessionId, type: 'refresh' };
  
  const accessToken = await signToken(accessPayload, env.JWT_SECRET, '15m');
  const refreshToken = await signToken(refreshPayload, env.JWT_SECRET, '7d');
  
  return { accessToken, refreshToken };
}

async function signToken(payload: any, secret: string, expiresIn: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiry(expiresIn);
  
  const tokenPayload = { ...payload, iat: now, exp };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function parseExpiry(str: string): number {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) { case 's': return value; case 'm': return value * 60; case 'h': return value * 3600; case 'd': return value * 86400; default: return 900; }
}

router.post('/register', zValidator('json', registerSchema), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const { email, password, name, username } = c.req.valid('json');

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }].filter(Boolean) } });
  if (existing) throw new HTTPException(409, { message: existing.email === email ? 'Email already registered' : 'Username taken' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, username: username?.toLowerCase(), credits: 100 },
    select: { id: true, email: true, name: true, username: true, createdAt: true },
  });

  const sessionId = uuidv4();
  const { accessToken, refreshToken } = await generateTokens(user, sessionId, env);

  await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify({ userId: user.id }), { expirationTtl: 604800 });
  await env.SESSIONS.put(`session:${refreshToken}`, sessionId, { expirationTtl: 604800 });

  return c.json({ user, accessToken, refreshToken }, 201);
});

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const { email, password, rememberMe } = c.req.valid('json');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) throw new HTTPException(401, { message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HTTPException(401, { message: 'Invalid credentials' });

  const sessionId = uuidv4();
  const ttl = rememberMe ? 2592000 : 604800;
  const { accessToken, refreshToken } = await generateTokens(user, sessionId, env);

  await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify({ userId: user.id }), { expirationTtl: ttl });
  await env.SESSIONS.put(`session:${refreshToken}`, sessionId, { expirationTtl: ttl });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return c.json({
    user: { id: user.id, email: user.email, name: user.name, username: user.username, avatar: user.avatar, role: user.role },
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const env = c.env;
  const prisma = createPrisma(env);
  const { refreshToken } = c.req.valid('json');

  const sessionId = await env.SESSIONS.get(`session:${refreshToken}`);
  if (!sessionId) throw new HTTPException(401, { message: 'Invalid refresh token' });

  let payload: any;
  try {
    payload = await verify(refreshToken, env.JWT_SECRET);
  } catch {
    throw new HTTPException(401, { message: 'Invalid refresh token' });
  }

  if (payload.type !== 'refresh') throw new HTTPException(401, { message: 'Invalid token type' });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new HTTPException(401, { message: 'User not found' });

  const newSessionId = uuidv4();
  const tokens = await generateTokens(user, newSessionId, env);

  await env.SESSIONS.delete(`session:${sessionId}`);
  await env.SESSIONS.delete(`session:${refreshToken}`);
  await env.SESSIONS.put(`session:${newSessionId}`, JSON.stringify({ userId: user.id }), { expirationTtl: 604800 });
  await env.SESSIONS.put(`session:${tokens.refreshToken}`, newSessionId, { expirationTtl: 604800 });

  return c.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
});

router.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await verify(token, c.env.JWT_SECRET) as any;
      await c.env.SESSIONS.delete(`session:${payload.sessionId}`);
      await c.env.SESSIONS.delete(`session:${token}`);
    } catch {}
  }
  return c.json({ message: 'Logged out' });
});

const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new HTTPException(401, { message: 'No token provided' });

  const token = authHeader.slice(7);
  let payload: any;
  try { payload = await verify(token, c.env.JWT_SECRET); }
  catch { throw new HTTPException(401, { message: 'Invalid token' }); }

  if (payload.type !== 'access') throw new HTTPException(401, { message: 'Invalid token type' });

  const sessionData = await c.env.SESSIONS.get(`session:${payload.sessionId}`);
  if (!sessionData) throw new HTTPException(401, { message: 'Session expired' });

  c.set('user', { id: payload.userId, email: payload.email, role: payload.role });
  c.set('sessionId', payload.sessionId);
  await next();
});

router.get('/me', authMiddleware, async (c) => {
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({
    where: { id: c.get('user').id },
    select: { id: true, email: true, name: true, username: true, avatar: true, bio: true, role: true, credits: true, emailVerified: true, createdAt: true },
  });
  return c.json({ user });
});

router.patch('/me', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const { username } = c.req.valid('json');
  
  if (username) {
    const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (existing && existing.id !== c.get('user').id) throw new HTTPException(409, { message: 'Username taken' });
  }

  const user = await prisma.user.update({
    where: { id: c.get('user').id },
    data: c.req.valid('json'),
    select: { id: true, email: true, name: true, username: true, avatar: true, bio: true },
  });
  return c.json({ user });
});

router.post('/change-password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const { currentPassword, newPassword } = c.req.valid('json');

  const user = await prisma.user.findUnique({ where: { id: c.get('user').id } });
  if (!user?.passwordHash) throw new HTTPException(400, { message: 'Cannot change password for OAuth accounts' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new HTTPException(401, { message: 'Current password incorrect' });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await c.env.SESSIONS.delete(`session:${c.get('sessionId')}`);

  return c.json({ message: 'Password changed. Please log in again.' });
});

export default router;