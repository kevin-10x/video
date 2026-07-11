import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

export const authMiddleware = createMiddleware<{
  Bindings: Cloudflare.Env;
  Variables: { user: { id: string; email: string; role: string }; sessionId: string };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;
  
  try {
    payload = await verify(token, c.env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }

  if (payload.type !== 'access') {
    throw new HTTPException(401, { message: 'Invalid token type' });
  }

  const sessionKey = `session:${payload.sessionId}`;
  const sessionData = await c.env.SESSIONS.get(sessionKey);
  if (!sessionData) {
    throw new HTTPException(401, { message: 'Session expired' });
  }

  c.set('user', { id: payload.userId, email: payload.email, role: payload.role });
  c.set('sessionId', payload.sessionId);
  
  await next();
});

export const optionalAuth = createMiddleware<{
  Bindings: Cloudflare.Env;
  Variables: { user?: { id: string; email: string; role: string }; sessionId?: string };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.slice(7);
  try {
    const payload = await verify(token, c.env.JWT_SECRET) as JwtPayload;
    if (payload.type === 'access') {
      const sessionKey = `session:${payload.sessionId}`;
      const sessionData = await c.env.SESSIONS.get(sessionKey);
      if (sessionData) {
        c.set('user', { id: payload.userId, email: payload.email, role: payload.role });
        c.set('sessionId', payload.sessionId);
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  await next();
});

export const requireRole = (...roles: string[]) => 
  createMiddleware<{ Variables: { user: { role: string } } }>(async (c, next) => {
    if (!c.get('user') || !roles.includes(c.get('user').role)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' });
    }
    await next();
  });