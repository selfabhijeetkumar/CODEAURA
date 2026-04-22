import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const router = Router();

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || '');
}

const DiffBody = z.object({
  sessionIdA: z.string().uuid(),
  sessionIdB: z.string().uuid(),
});

router.post('/diff', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionIdA, sessionIdB } = DiffBody.parse(req.body);
    const { getSessionById } = await import('../services/cache.service.js');
    const { diffSessions } = await import('../services/gemini.service.js');
    const [sessionA, sessionB] = await Promise.all([
      getSessionById(sessionIdA),
      getSessionById(sessionIdB),
    ]);
    if (!sessionA || !sessionB) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'One or both sessions not found' } });
    }
    const report = await diffSessions(sessionA.script, sessionB.script);
    const sb = await getSupabase();
    await sb.from('diffs').insert({ session_a: sessionIdA, session_b: sessionIdB, report });
    return res.json({ report });
  } catch (err) {
    next(err);
  }
});

export default router;
