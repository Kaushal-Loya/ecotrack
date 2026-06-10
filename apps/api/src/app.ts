import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import footprintRouter from './routes/footprint.js';
import activitiesRouter from './routes/activities.js';
import insightsRouter from './routes/insights.js';
import goalsRouter from './routes/goals.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): express.Express {
  const app = express();

  // ─── Security headers ────────────────────────────────────────────────────
  // CSP is an HTML-page concern — APIs serve JSON so we disable it to avoid
  // the browser enforcing 'default-src: none' when the frontend fetches data.
  app.use(
    helmet({
      contentSecurityPolicy: false,     // Not needed for a JSON API
      crossOriginEmbedderPolicy: false, // Would block cross-origin resources
    })
  );

  // ─── CORS — whitelist specific origins ───────────────────────────────────
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
    })
  );

  // ─── Body parsing & compression ──────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: '10kb' })); // limit body size
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // ─── Rate limiting ───────────────────────────────────────────────────────
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { status: 'error', message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { status: 'error', message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);

  // ─── Routes ──────────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/footprint', footprintRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/insights', insightsRouter);
  app.use('/api/goals', goalsRouter);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Centralised error handler ───────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
