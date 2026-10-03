import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const commentResponseSchema = z.object({
  shouldReply: z.boolean(),
  reply: z.string(),
  reason: z.string(),
});

export const dmResponseSchema = z.object({
  shouldReply: z.boolean(),
  message: z.string(),
  reason: z.string(),
});

const getAIClient = () => {
  const apiKey = env.OPENROUTER_API_KEY;

  if (
    !apiKey ||
    apiKey === 'mock_openai_api_key' ||
    apiKey.startsWith('your_')
  ) {
    return null;
  }

  return createOpenRouter({
    apiKey,
  });
};

/**
 * Generate a structured AI response using
 * Vercel AI SDK + OpenRouter.
 */
export const generateStructuredAIResponse = async ({
  systemPrompt,
  userPrompt,
  schema,
  defaultMockResponse,
}) => {
  const ai = getAIClient();

  if (!ai) {
    logger.info(
      'Vercel AI SDK operating in mock mode (OPENROUTER_API_KEY not configured)'
    );

    return defaultMockResponse;
  }

  try {
    const { output } = await generateText({
      model: ai(env.AI_MODEL || 'openrouter/free'),

      system: systemPrompt,

      prompt: userPrompt,

      output: Output.object({
        schema,
      }),
    });

    return output;
  } catch (error) {
    console.log("error to generate ai res",error)
    logger.error(
      { error: error.message },
      'Vercel AI SDK generation error, using safe fallback'
    );

    return defaultMockResponse;
  }
};