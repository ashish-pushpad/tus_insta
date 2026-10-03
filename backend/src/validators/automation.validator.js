import { z } from 'zod';

export const updateAutomationSchema = z.object({
  body: z.object({
    mediaId: z.string().min(1, 'Media ID is required'),
    aiCommentReplyEnabled: z.boolean().optional(),
    aiDmReplyEnabled: z.boolean().optional(),
    enabled: z.boolean().optional()
  })
});
