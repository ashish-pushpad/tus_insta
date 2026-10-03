import { generateStructuredAIResponse, dmResponseSchema } from './ai.service.js';
import { getDmSystemPrompt } from './prompts/dm.prompt.js';
import prisma from '../../config/database.js';

export const generateAIDmReply = async ({ messageText, conversationHistory = [], userId, instagramAccountId }) => {
  let aiConfig = {
    replyStyle: 'friendly',
    tone: 'Friendly and helpful customer support representative',
    maxResponseLength: 250,
    businessDescription: 'Standard customer engagement',
    businessInstructions: 'Provide clear and helpful guidance.'
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
    // fallback
  }

  const systemPrompt = getDmSystemPrompt(aiConfig);
  const historyText = conversationHistory
    .map((msg) => `${msg.senderType}: "${msg.content}"`)
    .join('\n');

  const userPrompt = `
Conversation History:
${historyText || 'No prior context'}

Latest Message: "${messageText}"

Generate a helpful and friendly DM reply.
`;

  const defaultMockResponse = {
    shouldReply: true,
    message: "Hey there! Thanks for messaging us 👋 How can we help you out today?",
    reason: 'Standard customer greeting fallback'
  };

  const result = await generateStructuredAIResponse({
    systemPrompt,
    userPrompt,
    schema: dmResponseSchema,
    defaultMockResponse
  });

  return dmResponseSchema.parse(result);
};
