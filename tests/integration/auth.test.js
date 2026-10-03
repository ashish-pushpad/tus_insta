/**
 * Integration tests — Authentication endpoints
 *
 * These tests use an in-memory SQLite-like approach via Prisma's
 * mock client, or run against a real test DB if DATABASE_URL is set
 * to a test instance. For CI, set TEST_DATABASE_URL in env.
 *
 * We mock the Prisma client so tests run without a live Postgres instance.
 */
import { jest } from '@jest/globals';

// ── Mock Prisma before importing app ──────────────────────────────────────────
const mockUser = {
  id:        'user-test-001',
  email:     'test@example.com',
  name:      'Test User',
  password:  '$2b$12$placeholder', // overridden per-test
  createdAt: new Date('2024-01-01')
};

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create:     jest.fn()
    },
    aIConfiguration: {
      findFirst: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn()
    },
    instagramAccount: {
      findFirst: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

// Mock BullMQ queues and workers so they don't require Redis
jest.unstable_mockModule('../../src/jobs/queues.js', () => ({
  commentReplyQueue: null,
  dmReplyQueue:      null,
  tokenRefreshQueue: null,
  enqueueCommentReply: jest.fn(),
  enqueueDmReply:      jest.fn(),
  enqueueTokenRefresh: jest.fn(),
  QUEUE_NAMES: {
    COMMENT_REPLY: 'comment-reply',
    DM_REPLY:      'dm-reply',
    TOKEN_REFRESH: 'token-refresh'
  }
}));

// Prevent workers from trying to connect to Redis
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisConnection: jest.fn().mockReturnValue(null),
  closeRedis:         jest.fn()
}));

// Prevent node-cron from scheduling
jest.unstable_mockModule('../../src/jobs/scheduler.js', () => ({
  startScheduler: jest.fn()
}));

const { default: request }  = await import('supertest');
const { default: app }       = await import('../../src/app.js');
const { default: prisma }    = await import('../../src/config/database.js');
const bcrypt                 = await import('bcryptjs');

// ─────────────────────────────────────────────────────────────────────────────

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/auth/register ────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    test('201 — registers a new user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);       // no existing user
      prisma.user.create.mockResolvedValue({
        id:        mockUser.id,
        email:     mockUser.email,
        name:      mockUser.name,
        createdAt: mockUser.createdAt
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user.email).toBe('test@example.com');
      // Password must NOT appear in response
      expect(JSON.stringify(res.body)).not.toContain('password123');
    });

    test('400 — rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123', name: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('400 — rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('409/400 — rejects duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser); // user already exists

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

      expect([400, 409]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /api/auth/login ───────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    test('200 — logs in with correct credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user).toMatchObject({ email: 'test@example.com' });
    });

    test('401 — rejects wrong password', async () => {
      const hashed = await bcrypt.hash('correctpassword', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('401 — rejects non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('does not expose password hash in response', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(JSON.stringify(res.body)).not.toContain(hashed);
    });
  });

  // ── GET /api/auth/me ───────────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    test('401 — rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('401 — rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
    });

    test('200 — returns user profile with valid token', async () => {
      // Get a real token via login first
      const hashed = await bcrypt.hash('password123', 10);
      prisma.user.findUnique
        // First call: login lookup
        .mockResolvedValueOnce({ ...mockUser, password: hashed })
        // Second call: authenticate middleware lookup
        .mockResolvedValueOnce({ id: mockUser.id, email: mockUser.email, name: mockUser.name })
        // Third call: getUserProfile
        .mockResolvedValueOnce({ ...mockUser, instagramAccounts: [] });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.password).toBeUndefined();
    });
  });
});
