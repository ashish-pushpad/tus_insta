import prisma from '../../config/database.js';
import { checkSemanticMatch } from './semanticMatch.service.js';
import { processTemplate } from '../../utils/template.js';
import { logger } from '../../utils/logger.js';

/**
 * Checks exact keyword matching against comment text
 */
export const checkExactKeywordMatch = (commentText = '', keywords = []) => {
  if (!commentText || !Array.isArray(keywords) || keywords.length === 0) return false;

  const normalizedComment = commentText.toLowerCase();

  return keywords.some((kw) => {
    const normKw = String(kw).toLowerCase().trim();
    if (!normKw) return false;

    // Word boundary or punctuation match check (e.g., "price?" matches "price")
    const escapeRegex = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|\\W)${escapeRegex}(?:$|\\s|\\W)`, 'i');
    
    return regex.test(normalizedComment);
  });
};

/**
 * Evaluates Special Rules against an incoming comment with priority ordering
 */
export const matchSpecialRules = async ({ commentText, instagramAccountId, mediaId, fromUsername, postUrl }) => {
  if (!commentText) return { matched: false };

  let rules = [];
  try {
    rules = await prisma.specialRule.findMany({
      where: {
        instagramAccountId,
        isEnabled: true,
        OR: [
          { mediaId: null }, // Global rules
          { mediaId }       // Post specific rules
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  } catch (error) {
    logger.warn({ error: error.message }, 'Failed to load special rules from database, using transient check');
  }

  for (const rule of rules) {
    let rawKeywords = rule.keywords;
    if (typeof rawKeywords === 'string') {
      try {
        rawKeywords = JSON.parse(rawKeywords);
      } catch {
        rawKeywords = [rawKeywords];
      }
    }
    const keywords = Array.isArray(rawKeywords) ? rawKeywords : [];

    let isMatch = false;
    if (rule.triggerType === 'EXACT') {
      isMatch = checkExactKeywordMatch(commentText, keywords);
    } else if (rule.triggerType === 'SEMANTIC') {
      isMatch = await checkSemanticMatch(commentText, keywords);
    }

    if (isMatch) {
      logger.info({ ruleId: rule.id, ruleName: rule.name, triggerType: rule.triggerType }, 'Special Rule Matched');

      const templateVariables = {
        username: fromUsername ? `@${fromUsername.replace(/^@/, '')}` : '@user',
        link: rule.link || '',
        product_name: rule.name || 'product',
        post_url: postUrl || ''
      };

      const interpolatedCommentReply = processTemplate(rule.commentReply || '', templateVariables);
      const interpolatedDmMessage = processTemplate(rule.dmMessage || '', templateVariables);

      return {
        matched: true,
        rule,
        actionType: rule.actionType, // COMMENT_REPLY, DM, BOTH
        commentReply: interpolatedCommentReply,
        dmMessage: interpolatedDmMessage
      };
    }
  }

  return { matched: false };
};
