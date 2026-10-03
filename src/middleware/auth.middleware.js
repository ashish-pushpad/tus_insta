import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import prisma from '../config/database.js';

/**
 * Fields that must never appear in log output or error responses.
 * Referenced by the sanitize helper below.
 */
const SENSITIVE_FIELDS = new Set([
  'password', 'accessToken', 'token', 'secret', 'authorization',
  'fb_exchange_token', 'client_secret', 'AI_API_KEY'
]);

/**
 * Strips sensitive keys from an object before it is logged or serialised.
 * Works one level deep — sufficient for req.body logging.
 */
export const sanitizeForLog = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    clean[k] = SENSITIVE_FIELDS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return clean;
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Malformed authentication token');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      // Map JWT errors to a single safe message — never leak internal detail
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    // Validate user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
