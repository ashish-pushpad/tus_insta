import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const BCRYPT_ROUNDS = 12;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

export const registerUser = async ({ email, password, name }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true }
  });

  if (existingUser) {
    throw new ValidationError('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      aiConfigurations: {
        create: {
          replyStyle: 'friendly',
          tone: 'Friendly and helpful social media manager',
          maxResponseLength: 150,
          businessDescription: '',
          businessInstructions: 'Be welcoming, concise, and professional.'
        }
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  });

  logger.info({ userId: user.id, email: user.email }, 'New user registered');

  const token = signToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, password: true, createdAt: true }
  });

  if (!user) {
    // Constant-time comparison even on missing user to prevent timing attacks
    await bcrypt.hash('dummy_prevent_timing_attack', BCRYPT_ROUNDS);
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  logger.info({ userId: user.id }, 'User logged in');

  const token = signToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token
  };
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      instagramAccounts: {
        select: {
          id: true,
          instagramUserId: true,
          username: true,
          name: true,
          profilePictureUrl: true,
          isConnected: true,
          tokenExpiresAt: true
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  return user;
};
