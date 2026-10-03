import { generateStructuredAIResponse, commentResponseSchema } from './ai.service.js';
import { getCommentSystemPrompt } from './prompts/comment.prompt.js';
import prisma from '../../config/database.js';

export const generateAICommentReply = async ({ commentText, postCaption, userId, instagramAccountId }) => {
  let aiConfig = {
    replyStyle: 'friendly',
    tone: 'Friendly and helpful social media manager',
    maxResponseLength: 150,
    businessDescription: 'Engaging brand account',
    businessInstructions: 'Be warm, encouraging, and natural.'
  };

  try {
    const dbConfig = await prisma.aIConfiguration.findFirst({
      where: {
        OR: [
          { userId },
          { instagramAccountId }
        ]
      }
    });
    if (dbConfig) aiConfig = { ...aiConfig, ...dbConfig };
  } catch {
    // transient config fallback
  }

  const systemPrompt = getCommentSystemPrompt(aiConfig);
  const userPrompt = `
Post Caption: "${postCaption || 'No caption available'}"
Incoming Comment: "${commentText}"

Generate a friendly and engaging comment reply.
`;

  const fallbackReplies = [
    "Thank you! 🙌 We're so glad you like it!",
    "Appreciate the kind words! 🔥 Let us know if you have any questions!",
    "Thanks for engaging! Stay tuned for more updates ✨",
    "Awesome! Thanks for reaching out to us 😊"
  ];
  const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

  const defaultMockResponse = {
    shouldReply: true,
    reply: randomFallback,
    reason: 'Positive user engagement fallback'
  };

  const result = await generateStructuredAIResponse({
    systemPrompt,
    userPrompt,
    schema: commentResponseSchema,
    defaultMockResponse
  });

  console.log("Ai Commnet Reply ",result)

  return commentResponseSchema.parse(result);
};
