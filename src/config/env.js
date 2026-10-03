import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  APP_URL: z.string().default('http://localhost:5000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/instagram_ai_db?schema=public'),

  JWT_SECRET: z.string().default('dev_super_secret_jwt_key_1234567890_antigravity'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  META_APP_ID: z.string().default('mock_meta_app_id'),
  META_APP_SECRET: z.string().default('mock_meta_app_secret'),
  META_REDIRECT_URI: z.string().default('http://localhost:5000/api/instagram/callback'),
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN: z.string().default('instagram_ai_verify_token_secret'),

  AI_GATEWAY_API_KEY: z.string().default('mock_openai_api_key'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_PROVIDER: z.string().default('openai'),

  CORS_ORIGIN: z.string().optional(),
  REDIS_URL: z.string().optional()
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables configuration:', result.error.format());
    return process.env;
  }
  return result.data;
};

export const env = parseEnv();
