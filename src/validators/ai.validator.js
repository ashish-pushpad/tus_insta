import { z } from 'zod';

export const updateAISettingsSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    replyStyle: z.string().optional(),
    businessDescription: z.string().optional(),
    businessInstructions: z.string().optional(),
    tone: z.string().optional(),
    maxResponseLength: z.number().int().min(10).max(1000).optional(),
    customInstructions: z.string().optional()
  })
});
