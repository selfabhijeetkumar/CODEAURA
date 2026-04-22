import { createHash } from 'node:crypto';
import { logger } from '../middleware/logger.js';

// Lazy Supabase client — only created after env vars are loaded
let _supabase: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;

async function getSupabase() {
  if (_supabase) return _supabase;
  const { createClient } = await import('@supabase/supabase-js');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  _supabase = createClient(process.env.SUPABASE_URL!, key);
  return _supabase;
}

const CACHE_TTL_DAYS = 7;

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export async function getCachedSession(codeHash: string) {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .eq('code_hash', codeHash)
    .gte('created_at', new Date(Date.now() - CACHE_TTL_DAYS * 86400000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.warn({ error }, 'Cache lookup failed');
    return null;
  }
  return data;
}

export async function saveSession(params: {
  codeHash: string;
  language: string;
  filename?: string;
  code: string;
  script: unknown;
  qualityScore: number;
  bugsCount: number;
  anonToken?: string;
}) {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from('sessions')
    .insert({
      code_hash: params.codeHash,
      language: params.language,
      filename: params.filename ?? null,
      code: params.code,
      script: params.script,
      quality_score: params.qualityScore,
      bugs_count: params.bugsCount,
      anon_token: params.anonToken ?? null,
    })
    .select('id')
    .single();

  if (error) {
    logger.error({ error }, 'Failed to save session');
    return null;
  }
  return data.id as string;
}

export async function getSessionById(id: string) {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.warn({ error }, 'Session lookup failed');
    return null;
  }
  return data;
}
