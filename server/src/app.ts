import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config';
import { errorHandler, notFound } from './errors';
import { authenticate } from './middleware/auth';
import { authRouter } from './routes/auth';
import { petsRouter } from './routes/pets';
import { remindersRouter } from './routes/reminders';
import { tipsRouter } from './routes/tips';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(pinoHttp({
    level: config.LOG_LEVEL,
    enabled: config.NODE_ENV !== 'test',
    redact: ['req.headers.authorization']
  }));
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN.split(','), credentials: false }));
  app.use(express.json({ limit: '100kb' }));
  if (config.NODE_ENV !== 'test') app.use('/api', rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: 'draft-7' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'pawpal-api' }));
  app.use('/api/auth', authRouter);
  app.use('/api/pets', authenticate, petsRouter);
  app.use('/api/reminders', authenticate, remindersRouter);
  app.use('/api/tips', authenticate, tipsRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
