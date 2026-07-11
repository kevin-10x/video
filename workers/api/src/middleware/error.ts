import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: Error, c: any) => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    }, 400);
  }

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: err.status === 401 ? 'UNAUTHORIZED' : 
              err.status === 403 ? 'FORBIDDEN' :
              err.status === 404 ? 'NOT_FOUND' : 'ERROR',
        message: err.message,
      },
    }, err.status);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return c.json({
        success: false,
        error: { code: 'DUPLICATE_ENTRY', message: 'A record with this value already exists' },
      }, 409);
    }
    if (err.code === 'P2025') {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      }, 404);
    }
  }

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }, 500);
};

export const notFoundHandler = (c: any) => {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  }, 404);
};