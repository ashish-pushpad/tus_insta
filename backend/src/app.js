import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import instagramRoutes from './routes/instagram.routes.js';
import automationRoutes from './routes/automation.routes.js';
import specialRuleRoutes from './routes/specialRule.routes.js';
import aiRoutes from './routes/ai.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import activityRoutes from './routes/activity.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();

// Security Headers & CORS
app.use(helmet());

const configuredOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  ...(env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((s) => s.trim()) : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(origin) ||
      env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));


app.set('trust proxy', 1);
// Rate limiting
app.use(globalLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Instagram AI Auto-Reply API',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/special-rules', specialRuleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Middleware
app.use(errorHandler);

export default app;
