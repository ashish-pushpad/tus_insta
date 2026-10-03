/**
 * Integration tests — Webhook endpoints + event processing pipeline
 *
 * Tests webhook verification, duplicate event suppression,
 * disabled-automation guard, and the rule-before-AI priority flow.
 */
import { jest } from '@jest/globals';

// ── Mock Prisma ───────────────────────────────────────────────────────────────
const mockWebhookEvent = { id: 'whe-001', externalEventId: 'comment_cmt-001', processed: true };
const mockComment      = { id: 'cmt-db-001', commentId: 'cmt-001' };
const mockMedia        = { id: 'med-001', mediaId: 'media-001', aiCommentReplyEnabled: true, caption: 'Test post', permalink: 'https://ig.com/p/test' };
const mockAccount      = { id: 'acc-001', instagramUserId: 'ig-001', accessToken: 'mock_token', isConnected: true };

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: {
    webhookEvent: {
      findUnique:   jest.fn(),
      create:       jest.fn(),
      updateMany:   jest.fn()
    },
    comment: {
      findUnique: jest.fn(),
      create:     jest.fn()
    },
    instagramAccount: {
      findUnique: jest.fn(),
      findFirst:  jest.fn()
    },
    instagramMedia: {
      findUnique: jest.fn(),
      findFirst:  jest.fn()
    },
    specialRule: {
      findMany: jest.fn()
    },
    aIConfiguration: {
      findFirst: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisConnection: jest.fn().mockReturnValue(null),
  closeRedis:         jest.fn()
}));
jest.unstable_mockModule('../../src/jobs/queues.js', () => ({
  commentReplyQueue: null, dmReplyQueue: null, tokenRefreshQueue: null,
  enqueueCommentReply: jest.fn(), enqueueDmReply: jest.fn(), enqueueTokenRefresh: jest.fn(),
  QUEUE_NAMES: { COMMENT_REPLY: 'comment-reply', DM_REPLY: 'dm-reply', TOKEN_REFRESH: 'token-refresh' }
}));
jest.unstable_mockModule('../../src/jobs/scheduler.js', () => ({ startScheduler: jest.fn() }));

// Mock Instagram API calls so tests never hit external services
jest.unstable_mockModule('../../src/services/instagram/instagramComment.service.js', () => ({
  replyToComment:              jest.fn().mockResolvedValue({ id: 'reply-001' }),
  sendPrivateReplyFromComment: jest.fn().mockResolvedValue({ id: 'dm-001' })
}));
jest.unstable_mockModule('../../src/services/ai/commentReply.service.js', () => ({
  generateAICommentReply: jest.fn().mockResolvedValue({
    shouldReply: true,
    reply: 'Thanks for your comment!',
    reason: 'Engaging comment'
  })
}));

const { default: request } = await import('supertest');
const { default: app }      = await import('../../src/app.js');
const { default: prisma }   = await import('../../src/config/database.js');
const { env }               = await import('../../src/config/env.js');

// ─────────────────────────────────────────────────────────────────────────────

describe('Webhook API', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── GET /api/webhooks/instagram (verification) ────────────────────────────

  describe('GET /api/webhooks/instagram — Meta hub verification', () => {
    test('200 — returns challenge with valid verify token', async () => {
      const res = await request(app)
        .get('/api/webhooks/instagram')
        .query({
          'hub.mode':         'subscribe',
          'hub.verify_token': env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
          'hub.challenge':    'test_challenge_12345'
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe('test_challenge_12345');
    });

    test('401 — rejects wrong verify token', async () => {
      const res = await request(app)
        .get('/api/webhooks/instagram')
        .query({
          'hub.mode':         'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge':    'test_challenge_12345'
        });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/webhooks/instagram (event reception) ────────────────────────

  describe('POST /api/webhooks/instagram — event processing', () => {
    const commentPayload = {
      object: 'instagram',
      entry: [{
        id: 'acc-001',
        changes: [{
          field: 'comments',
          value: {
            id:    'cmt-001',
            text:  'Amazing product!',
            media: { id: 'media-001' },
            from:  { id: 'usr-001', username: 'testuser' }
          }
        }]
      }]
    };

    test('200 — always returns 200 to Meta immediately', async () => {
      // Make dedup check return "already processed" so handler exits fast
      prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhookEvent);

      const res = await request(app)
        .post('/api/webhooks/instagram')
        .send(commentPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('200 — duplicate event is silently skipped (idempotency)', async () => {
      // Simulate event already in the webhook_events table
      prisma.webhookEvent.findUnique.mockResolvedValue({ ...mockWebhookEvent, processed: true });

      const res = await request(app)
        .post('/api/webhooks/instagram')
        .send(commentPayload);

      expect(res.status).toBe(200);
    });

    test('200 — ignores non-instagram object type', async () => {
      const res = await request(app)
        .post('/api/webhooks/instagram')
        .send({ object: 'page', entry: [] });

      expect(res.status).toBe(200);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Comment processing pipeline', () => {
  beforeEach(() => jest.clearAllMocks());

  test('skips processing when automation is disabled for media', async () => {
    const { handleCommentEvent } = await import('../../src/services/webhook/handlers/comment.handler.js');

    prisma.comment.findUnique.mockResolvedValue(null);
    prisma.instagramAccount.findUnique.mockResolvedValue(mockAccount);
    prisma.instagramMedia.findUnique.mockResolvedValue({ ...mockMedia, aiCommentReplyEnabled: false });

    const result = await handleCommentEvent({
      commentId:          'cmt-002',
      mediaId:            'media-001',
      text:               'Nice!',
      fromUserId:         'usr-001',
      fromUsername:       'testuser',
      instagramAccountId: 'acc-001'
    });

    expect(result.status).toBe('SKIPPED');
    expect(result.reason).toBe('Automation disabled');
  });

  test('skips AI when special rule matches (rule has priority)', async () => {
    const { handleCommentEvent } = await import('../../src/services/webhook/handlers/comment.handler.js');
    const { generateAICommentReply } = await import('../../src/services/ai/commentReply.service.js');

    prisma.comment.findUnique.mockResolvedValue(null);     // not processed yet
    prisma.instagramAccount.findUnique.mockResolvedValue(mockAccount);
    prisma.instagramMedia.findUnique.mockResolvedValue(mockMedia);
    prisma.specialRule.findMany.mockResolvedValue([{
      id:          'rule-001',
      name:        'Price Rule',
      triggerType: 'EXACT',
      keywords:    JSON.stringify(['price', 'cost']),
      actionType:  'COMMENT_REPLY',
      commentReply: 'Check our pricing page!',
      dmMessage:   null,
      link:        null,
      priority:    10,
      isEnabled:   true,
      mediaId:     null
    }]);
    prisma.comment.create.mockResolvedValue({});
    prisma.aIConfiguration.findFirst.mockResolvedValue(null);

    const result = await handleCommentEvent({
      commentId:          'cmt-003',
      mediaId:            'media-001',
      text:               'What is the price?',
      fromUserId:         'usr-001',
      fromUsername:       'testuser',
      instagramAccountId: 'acc-001'
    });

    expect(result.responseType).toBe('RULE');
    // AI should NOT have been called
    expect(generateAICommentReply).not.toHaveBeenCalled();
  });

  test('falls back to AI when no special rule matches', async () => {
    const { handleCommentEvent } = await import('../../src/services/webhook/handlers/comment.handler.js');
    const { generateAICommentReply } = await import('../../src/services/ai/commentReply.service.js');

    prisma.comment.findUnique.mockResolvedValue(null);
    prisma.instagramAccount.findUnique.mockResolvedValue(mockAccount);
    prisma.instagramMedia.findUnique.mockResolvedValue(mockMedia);
    prisma.specialRule.findMany.mockResolvedValue([]); // no rules
    prisma.comment.create.mockResolvedValue({});
    prisma.aIConfiguration.findFirst.mockResolvedValue(null);

    await handleCommentEvent({
      commentId:          'cmt-004',
      mediaId:            'media-001',
      text:               'Love this post!',
      fromUserId:         'usr-001',
      fromUsername:       'testuser',
      instagramAccountId: 'acc-001'
    });

    expect(generateAICommentReply).toHaveBeenCalled();
  });

  test('already-processed comment is skipped (idempotency)', async () => {
    const { handleCommentEvent } = await import('../../src/services/webhook/handlers/comment.handler.js');

    // comment already exists in DB
    prisma.comment.findUnique.mockResolvedValue(mockComment);

    const result = await handleCommentEvent({
      commentId:          'cmt-001',
      mediaId:            'media-001',
      text:               'Already seen this',
      fromUserId:         'usr-001',
      fromUsername:       'testuser',
      instagramAccountId: 'acc-001'
    });

    expect(result.status).toBe('SKIPPED');
    expect(result.reason).toBe('Already processed');
  });
});
