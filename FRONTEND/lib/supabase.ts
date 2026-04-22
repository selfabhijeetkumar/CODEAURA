import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Lazy singleton — safe to import at module level, client created only when needed ──
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }
  _client = createClient(url, key);
  return _client;
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export async function saveSessionToDb(data: {
  session_name: string;
  code: string;
  language?: string;
  steps?: unknown;
  quality_score?: number;
  quiz_score?: number;
  bug_count?: number;
}) {
  const { data: row, error } = await getClient()
    .from('sessions')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function getAllSessions() {
  const { data, error } = await getClient()
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteSession(id: string) {
  const { error } = await getClient().from('sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export async function saveNote(data: {
  session_id?: string;
  step_number: number;
  ai_explanation?: string;
  user_note: string;
}) {
  const { data: row, error } = await getClient()
    .from('session_notes')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function getNotesForSession(session_id: string) {
  const { data, error } = await getClient()
    .from('session_notes')
    .select('*')
    .eq('session_id', session_id)
    .order('step_number', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteNote(id: string) {
  const { error } = await getClient().from('session_notes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export async function upsertLeaderboard(data: {
  user_id: string;
  username: string;
  quality_score: number;
  bug_count: number;
}) {
  const sb = getClient();
  const { data: existing } = await sb
    .from('leaderboard_stats')
    .select('*')
    .eq('user_id', data.user_id)
    .single();

  if (existing) {
    const newTotal = existing.total_sessions + 1;
    const newAvg = ((existing.average_score * existing.total_sessions) + data.quality_score) / newTotal;
    await sb
      .from('leaderboard_stats')
      .update({
        total_sessions: newTotal,
        average_score: Math.round(newAvg * 10) / 10,
        best_score: Math.max(existing.best_score, data.quality_score),
        total_bugs_found: existing.total_bugs_found + data.bug_count,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', data.user_id);
  } else {
    await sb.from('leaderboard_stats').insert({
      user_id: data.user_id,
      username: data.username,
      total_sessions: 1,
      average_score: data.quality_score,
      best_score: data.quality_score,
      total_bugs_found: data.bug_count,
      rank_badge: '🌱 Getting Started',
    });
  }
}

export async function getLeaderboard() {
  const { data, error } = await getClient()
    .from('leaderboard_stats')
    .select('*')
    .order('average_score', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
