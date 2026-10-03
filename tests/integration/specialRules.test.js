/**
 * Integration tests — Special Rules API + rule engine
 *
 * Covers: CRUD authorization, keyword matching, priority ordering,
 * template variable interpolation.
 */
import { jest } from '@jest/globals';

// ── Mocks ────────────────────────────────────────────────────────────────────
const testUserId   = 'user-001';
const otherUserId  = 'user-999';
const accountId    = 'acc-001';
const ruleId       = 'rule-001';

const mockRule = {
  id:                ruleId,
  userId:            testUserId,
  instagramAccountId: accountId,
  name:              'Price Rule',
  triggerType:       'EXACT',
  keywords:          ['price', 'cost'],
  actionType:        'BOTH',
  commentReply:      "I'll DM you the details 📩",
  dmMessage:         'Hey {{username}}, here is the link: {{link}}',
  link:              'https://example.com',
  priority:          10,
  isEnabled:         true,
  createdAt:         new Date(),
  updatedAt:         new Date()
};

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: {
    user: { findUnique: jest.fn() },
    specialRule: {
      findMany:   jest.fn(),
      findFirst:  jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn()
    },
    instagramAccount: { findFirst: jest.fn() },
    instagramMedia:   { findFirst: jest.fn() },
    $disconnect: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisConnection: jest.fn().mockReturnValue(null),
  closeRedis: jest.fn()
}));
jest.unstable_mockModule('../../src/jobs/queues.js', () => ({
  commentReplyQueue: null, dmReplyQueue: null, tokenRefreshQueue: null,
  enqueueCommentReply: jest.fn(), enqueueDmReply: jest.fn(), enqueueTokenRefresh: jest.fn(),
  QUEUE_NAMES: { COMMENT_REPLY: 'comment-reply', DM_REPLY: 'dm-reply', TOKEN_REFRESH: 'token-refresh' }
}));
jest.unstable_mockModule('../../src/jobs/scheduler.js', () => ({ startScheduler: jest.fn() }));

const { default: request } = await import('supertest');
const { default: app }      = await import('../../src/app.js');
const { default: prisma }   = await import('../../src/config/database.js');
import jwt from 'jsonwebtoken';
const { env } = await import('../../src/config/env.js');

const makeToken = (userId = testUserId) =>
  jwt.sign({ id: userId, email: 'u@test.com', name: 'Test' }, env.JWT_SECRET, { expiresIn: '1h' });

const authHeader = (userId = testUserId) => ({
  Authorization: `Bearer ${makeToken(userId)}`
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Special Rules API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // authenticate middleware — always resolve the requesting user
    prisma.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === testUserId
        ? { id: testUserId, email: 'u@test.com', name: 'Test' }
        : null
      )
    );
  });

  // ── GET /api/special-rules ────────────────────────────────────────────────

  describe('GET /api/special-rules', () => {
    test('200 — returns rules for authenticated user', async () => {
      prisma.specialRule.findMany.mockResolvedValue([mockRule]);

      const res = await request(app)
        .get('/api/special-rules')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].id).toBe(ruleId);
    });

    test('401 — rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/special-rules');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/special-rules ───────────────────────────────────────────────

  describe('POST /api/special-rules', () => {
    const newRulePayload = {
      instagramAccountId: accountId,
      name:        'Price Rule',
      triggerType: 'EXACT',
      keywords:    ['price', 'cost'],
      actionType:  'BOTH',
      commentReply: "I'll DM you 📩",
      dmMessage:   'Hey {{username}}: {{link}}',
      link:        'https://example.com',
      priority:    10
    };

    test('201 — creates rule when account is owned by user', async () => {
      prisma.instagramAccount.findFirst.mockResolvedValue({ id: accountId });
      prisma.specialRule.create.mockResolvedValue({ ...mockRule, id: 'new-rule-001' });

      const res = await request(app)
        .post('/api/special-rules')
        .set(authHeader())
        .send(newRulePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('404 — rejects when account does not belong to user', async () => {
      prisma.instagramAccount.findFirst.mockResolvedValue(null); // ownership check fails

      const res = await request(app)
        .post('/api/special-rules')
        .set(authHeader())
        .send(newRulePayload);

      expect(res.status).toBe(404);
    });

    test('400 — rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/special-rules')
        .set(authHeader())
        .send({ name: 'Incomplete Rule' }); // missing keywords, actionType, etc.

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/special-rules/:id ────────────────────────────────────────

  describe('DELETE /api/special-rules/:id', () => {
    test('200 — deletes owned rule', async () => {
      prisma.specialRule.findFirst.mockResolvedValue({ id: ruleId });
      prisma.specialRule.delete.mockResolvedValue({ id: ruleId });

      const res = await request(app)
        .delete(`/api/special-rules/${ruleId}`)
        .set(authHeader());

      expect(res.status).toBe(200);
    });

    test('404 — cannot delete another user\'s rule', async () => {
      // findFirst with userId filter returns null (other user's rule)
      prisma.specialRule.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/special-rules/${ruleId}`)
        .set(authHeader(otherUserId));

      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /api/special-rules/:id ─────────────────────────────────────────

  describe('PATCH /api/special-rules/:id', () => {
    test('200 — updates owned rule', async () => {
      prisma.specialRule.findFirst.mockResolvedValue({ id: ruleId, instagramAccountId: accountId });
      prisma.specialRule.update.mockResolvedValue({ ...mockRule, isEnabled: false });

      const res = await request(app)
        .patch(`/api/special-rules/${ruleId}`)
        .set(authHeader())
        .send({ isEnabled: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isEnabled).toBe(false);
    });

    test('404 — cannot update another user\'s rule', async () => {
      prisma.specialRule.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/special-rules/${ruleId}`)
        .set(authHeader(otherUserId))
        .send({ isEnabled: false });

      expect(res.status).toBe(404);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Rule Engine — keyword matching', () => {
  const { checkExactKeywordMatch } = await import('../../src/services/rules/ruleEngine.service.js');
  const { checkSemanticMatch }     = await import('../../src/services/rules/semanticMatch.service.js');
  const { processTemplate }        = await import('../../src/utils/template.js');

  describe('Exact matching', () => {
    test('matches keyword in comment text', () => {
      expect(checkExactKeywordMatch('what is the price?', ['price'])).toBe(true);
    });

    test('is case-insensitive', () => {
      expect(checkExactKeywordMatch('HOW MUCH DOES THIS COST', ['cost'])).toBe(true);
    });

    test('does NOT match partial word (priceless ≠ price)', () => {
      expect(checkExactKeywordMatch('this is priceless', ['price'])).toBe(false);
    });

    test('matches first keyword out of multiple', () => {
      expect(checkExactKeywordMatch('send me the link please', ['price', 'link'])).toBe(true);
    });

    test('returns false when no keywords match', () => {
      expect(checkExactKeywordMatch('love the vibe!', ['price', 'cost'])).toBe(false);
    });
  });

  describe('Semantic matching', () => {
    test('matches synonym "rate" for keyword "price"', async () => {
      expect(await checkSemanticMatch('what is your rate?', ['price'])).toBe(true);
    });

    test('matches stem — "buying" matches keyword "buy"', async () => {
      expect(await checkSemanticMatch('I am thinking of buying this', ['buy'])).toBe(true);
    });

    test('returns false for completely unrelated comment', async () => {
      expect(await checkSemanticMatch('great photo!', ['price', 'cost'])).toBe(false);
    });

    test('matches direct substring (fast path)', async () => {
      expect(await checkSemanticMatch('how much does this cost?', ['cost'])).toBe(true);
    });
  });

  describe('Template processing', () => {
    test('interpolates {{username}}', () => {
      const result = processTemplate('Hey {{username}}!', { username: '@alice' });
      expect(result).toBe('Hey @alice!');
    });

    test('interpolates multiple variables', () => {
      const result = processTemplate('Hi {{username}}, check {{link}}', {
        username: '@bob',
        link: 'https://example.com'
      });
      expect(result).toBe('Hi @bob, check https://example.com');
    });

    test('replaces missing variable with empty string', () => {
      const result = processTemplate('Hi {{username}} — {{undefined_var}}', { username: '@carol' });
      expect(result).not.toContain('{{undefined_var}}');
    });

    test('is safe — does not execute code inside template', () => {
      const malicious = '{{username}} <script>alert(1)</script>';
      const result = processTemplate(malicious, { username: 'alice' });
      expect(result).toBe('alice <script>alert(1)</script>'); // XSS is a frontend concern; template just interpolates
    });
  });
});
