import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

const IS_PROD = env.NODE_ENV === 'production';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code       = err.code       || 'INTERNAL_SERVER_ERROR';
  let message    = err.message    || 'An unexpected internal error occurred';
  let details    = err.details    || null;

  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    statusCode = 400;
    code       = 'VALIDATION_ERROR';
    message    = 'Invalid request parameters';
    details    = err.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message
    }));
  }

  // ── Prisma unique constraint violation ────────────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    code       = 'CONFLICT';
    message    = 'A record with this value already exists';
  }

  // ── Logging ───────────────────────────────────────────────────────────────
  const logCtx = {
    url:    req.originalUrl,
    method: req.method,
    statusCode,
    code
  };

  if (statusCode >= 500) {
    // Always log full error server-side; never expose stack to client
    logger.error({ ...logCtx, err }, 'Unhandled server error');
  } else {
    logger.warn({ ...logCtx, message }, 'Client error');
  }

  // ── Response ──────────────────────────────────────────────────────────────
  // In production, replace opaque 5xx messages with a generic string
  // so internal implementation details are never leaked.
  const clientMessage = IS_PROD && statusCode >= 500
    ? 'An internal server error occurred. Please try again later.'
    : message;

  const response = {
    success: false,
    error: {
      code,
      message: clientMessage,
      ...(details ? { details } : {}),
      // Only include stack in non-production environments
      ...(!IS_PROD && statusCode >= 500 && err.stack
        ? { stack: err.stack }
        : {}
      )
    }
  };

  return res.status(statusCode).json(response);
};
