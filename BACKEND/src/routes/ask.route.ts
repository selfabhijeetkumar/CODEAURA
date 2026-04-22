import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { askLimiter } from '../middleware/rate-limit.js';
import { askQuestion } from '../services/gemini.service.js';

const router = Router();

const AskBody = z.object({
  question: z.string().min(1).max(500),
  stepContext: z.string().max(2000),
});

router.post('/ask', askLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, stepContext } = AskBody.parse(req.body);
    const answer = await askQuestion(question, stepContext);
    res.json({ answer });
  } catch (err: any) {
    // Log the real error so the terminal shows exactly what went wrong
    console.error('[ask.route] ❌ /api/v1/ask threw an error:');
    console.error('  message :', err?.message ?? String(err));
    console.error('  status  :', err?.status ?? err?.statusCode ?? 'n/a');
    console.error('  stack   :', err?.stack?.split('\n').slice(0, 4).join('\n'));

    // Return 200 so the frontend receives a readable message instead of crashing
    res.status(200).json({
      answer: null,
      error: err?.message ?? 'AI provider returned an unexpected error. Please try again.',
    });
  }
});

export default router;
