import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Lazy Supabase to prevent top-level env read before dotenv
async function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  
  if (!url || !key) return null;
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key);
  } catch (err) {
    return null;
  }
}

router.get('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getSessionById } = await import('../services/cache.service.js');
    const session = await getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
    return res.json(session);
  } catch (err) {
    next(err);
  }
});

router.get('/demos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sb = await getSupabase();
    if (!sb) return res.json([]);
    const { data, error } = await sb.from('demos').select('slug,title,description,language,thumbnail_url').order('created_at');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/demos/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sb = await getSupabase();
    if (!sb) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Demo not found (Database unavailable)' } });
    const { data, error } = await sb.from('demos').select('*').eq('slug', req.params.slug).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Demo not found' } });
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
