import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { AuthenticationError } from './errorHandler.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
  sessionId?: string;
}

export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiry,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AuthenticationError('Invalid token');
  }

  if (payload.type !== 'access') {
    throw new AuthenticationError('Invalid token type');
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    select: { id: true, userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AuthenticationError('Session expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new AuthenticationError('User not found or inactive');
  }

  req.user = { id: user.id, email: user.email, role: user.role };
  req.sessionId = session.id;
  next();
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload.type === 'access') {
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        select: { id: true, userId: true, expiresAt: true },
      });
      if (session && session.expiresAt > new Date()) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, status: true },
        });
        if (user && user.status === 'ACTIVE') {
          req.user = { id: user.id, email: user.email, role: user.role };
          req.sessionId = session.id;
        }
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AuthenticationError('Insufficient permissions');
    }
    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireModerator = requireRole('ADMIN', 'MODERATOR');