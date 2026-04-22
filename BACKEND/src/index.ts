
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error.js';
import healthRouter from './routes/health.route.js';
import analyzeRouter from './routes/analyze.route.js';
import askRouter from './routes/ask.route.js';
import githubRouter from './routes/github.route.js';
import sessionsRouter from './routes/sessions.route.js';
import diffRouter from './routes/diff.route.js';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// ── Security ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      (process.env.CORS_ORIGIN || 'http://localhost:3000').trim(),
      'https://codeaura.vercel.app',
      /https:\/\/codeaura-.*\.vercel\.app$/,
    ];
    if (!origin) return callback(null, true);
    const isAllowed = allowed.some((a) =>
      typeof a === 'string' ? a === origin : a.test(origin)
    );
    callback(isAllowed ? null : new Error('CORS rejected'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Logging ───────────────────────────────────────────────
app.use(pinoHttp({ logger: logger as any }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/v1', healthRouter);
app.use('/api/v1', analyzeRouter);
app.use('/api/v1', askRouter);
app.use('/api/v1', githubRouter);
app.use('/api/v1', sessionsRouter);
app.use('/api/v1', diffRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 CODEAURA API running on http://localhost:${PORT}`);
});

export default app;
