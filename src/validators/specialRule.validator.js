import { z } from 'zod';

// ── Base object shape (all fields optional for PATCH) ─────────────────────────
const specialRuleBaseSchema = z.object({
  instagramAccountId: z.string().min(1).optional(),
  mediaId:            z.string().nullable().optional(),
  name:               z.string().min(1).optional(),
  triggerType:        z.enum(['EXACT', 'SEMANTIC']).optional(),
  keywords:           z.array(z.string()).min(1).optional(),
  actionType:         z.enum(['COMMENT_REPLY', 'DM', 'BOTH']).optional(),
  commentReply:       z.string().nullable().optional(),
  dmMessage:          z.string().nullable().optional(),
  link:               z.string().url().nullable().optional(),
  priority:           z.number().int().min(1).optional(),
  isEnabled:          z.boolean().optional()
});

// ── Cross-field validation helper — applied separately to avoid ZodEffects ─────
const withActionValidation = (schema) =>
  schema.superRefine((data, ctx) => {
    const needsComment = data.actionType === 'COMMENT_REPLY' || data.actionType === 'BOTH';
    const needsDm      = data.actionType === 'DM'            || data.actionType === 'BOTH';

    if (needsComment && !data.commentReply?.trim()) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['commentReply'],
        message: 'Comment reply text is required for COMMENT_REPLY / BOTH actions'
      });
    }

    if (needsDm && !data.dmMessage?.trim()) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['dmMessage'],
        message: 'DM message text is required for DM / BOTH actions'
      });
    }
  });

// ── Create — required fields overridden ──────────────────────────────────────
export const createSpecialRuleSchema = z.object({
  body: withActionValidation(
    specialRuleBaseSchema.extend({
      instagramAccountId: z.string().min(1, 'Instagram Account ID is required'),
      name:               z.string().min(1, 'Rule name is required'),
      triggerType:        z.enum(['EXACT', 'SEMANTIC']).default('EXACT'),
      keywords:           z.array(z.string()).min(1, 'At least one keyword is required'),
      actionType:         z.enum(['COMMENT_REPLY', 'DM', 'BOTH']).default('BOTH'),
      priority:           z.number().int().min(1).default(1),
      isEnabled:          z.boolean().default(true)
    })
  )
});

// ── Update — all fields optional, id in params ────────────────────────────────
export const updateSpecialRuleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body:   withActionValidation(specialRuleBaseSchema)
});
