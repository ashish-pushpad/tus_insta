import { commentResponseSchema, dmResponseSchema } from '../../src/services/ai/ai.service.js';

describe('Vercel AI SDK Schema Validation', () => {
  test('should validate valid structured comment AI output', () => {
    const rawOutput = {
      shouldReply: true,
      reply: "Thank you! 🙌 We are excited to launch this!",
      reason: "Positive user engagement"
    };

    const parsed = commentResponseSchema.parse(rawOutput);
    expect(parsed.shouldReply).toBe(true);
    expect(parsed.reply).toContain('Thank you');
  });

  test('should fail validation when required fields are missing', () => {
    const invalidOutput = {
      reply: "Missing shouldReply boolean"
    };

    expect(() => commentResponseSchema.parse(invalidOutput)).toThrow();
  });

  test('should validate valid structured DM AI output', () => {
    const rawDmOutput = {
      shouldReply: true,
      message: "Hello! We would love to assist you with your inquiry.",
      reason: "Customer support request"
    };

    const parsed = dmResponseSchema.parse(rawDmOutput);
    expect(parsed.message).toBeTruthy();
  });
});
