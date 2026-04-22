import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyzeLimiter } from '../middleware/rate-limit.js';
import { analyzeCode } from '../services/gemini.service.js';
import { hashCode, getCachedSession, saveSession } from '../services/cache.service.js';
import { logger } from '../middleware/logger.js';
import type { ExecutionScript } from '../schemas/execution-step.js';

const router = Router();

const AnalyzeBody = z.object({
  code: z.string().min(1).max(50000),
  filename: z.string().optional(),
  anonToken: z.string().optional(),
});

router.post('/analyze', analyzeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, filename, anonToken } = AnalyzeBody.parse(req.body);

    const codeHash = hashCode(code);

    // Cache check
    const cached = await getCachedSession(codeHash);
    if (cached) {
      logger.info({ codeHash }, 'Cache hit — returning cached session');
      return res.json({ sessionId: cached.id, script: cached.script, cached: true });
    }

    // Gemini analysis
    logger.info({ filename, codeLength: code.length }, 'Analyzing with Gemini');
    const script: ExecutionScript = await analyzeCode(code, filename);

    if (!script) {
      throw new Error('Analysis failed to return a script');
    }

    // Save to Supabase
    const sessionId = await saveSession({
      codeHash,
      language: script.language,
      filename,
      code,
      script,
      qualityScore: script.qualityScore,
      bugsCount: script.bugs.length,
      anonToken,
    });

    return res.json({ sessionId, script, cached: false });
  } catch (err) {
    next(err);
  }
});

export default router;
