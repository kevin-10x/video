import { createMiddleware } from 'hono/factory';
import { z, ZodSchema } from 'zod';

export const validateBody = <T extends ZodSchema>(schema: T) =>
  createMiddleware(async (c, next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.req.validatedBody = validated;
      await next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
          },
        }, 400);
      }
      throw err;
    }
  });

export const validateQuery = <T extends ZodSchema>(schema: T) =>
  createMiddleware(async (c, next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);
      c.req.validatedQuery = validated;
      await next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
          },
        }, 400);
      }
      throw err;
    }
  });

export const validateParams = <T extends ZodSchema>(schema: T) =>
  createMiddleware(async (c, next) => {
    try {
      const validated = schema.parse(c.req.param());
      c.req.validatedParams = validated;
      await next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid route parameters',
            details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
          },
        }, 400);
      }
      throw err;
    }
  });