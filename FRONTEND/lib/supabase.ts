/**
 * CODEAURA — Supabase Client
 *
 * Designed to degrade gracefully: if env vars are missing,
 * all functions return empty/null instead of throwing.
 * Core visualization works WITHOUT Supabase.
 * Only Save Session, Dashboard, Leaderboard need it.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Lazy singleton — never throws, warns instead ──────────────────────────────
let _client: SupabaseClient | null = null;
let _initAttempted = false;

function getClient(): SupabaseClient | null {
  if (_initAttempted) return _client;
  _initAttempted = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[CODEAURA] Supabase not configured — running without DB. ' +
        'Save Session, Dashboard, and Leaderboard will be unavailable. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable them.'
      );
    }
    return null;
  }

  try {
    _client = createClient(url, key);
  } catch (err) {
    console.warn('[CODEAURA] Supabase init failed:', err);
    _client = null;
  }

  return _client;
}

/** Returns true if Supabase is configured and available */
export function isSupabaseAvailable(): boolean {
  return getClient() !== null;
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
}): Promise<{ id: string } | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data: row, error } = await sb
    .from('sessions')
    .insert(data)
    .select()
    .single();
  if (error) { console.error('[Supabase] saveSession:', error.message); return null; }
  return row;
}

export async function getAllSessions(): Promise<unknown[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] getAllSessions:', error.message); return []; }
  return data ?? [];
}

export async function deleteSession(id: string): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) console.error('[Supabase] deleteSession:', error.message);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function saveNote(data: {
  session_id?: string;
  step_number: number;
  ai_explanation?: string;
  user_note: string;
}): Promise<unknown | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data: row, error } = await sb
    .from('session_notes')
    .insert(data)
    .select()
    .single();
  if (error) { console.error('[Supabase] saveNote:', error.message); return null; }
  return row;
}

export async function getNotesForSession(session_id: string): Promise<unknown[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('session_notes')
    .select('*')
    .eq('session_id', session_id)
    .order('step_number', { ascending: true });
  if (error) { console.error('[Supabase] getNotesForSession:', error.message); return []; }
  return data ?? [];
}

export async function deleteNote(id: string): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  const { error } = await sb.from('session_notes').delete().eq('id', id);
  if (error) console.error('[Supabase] deleteNote:', error.message);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function upsertLeaderboard(data: {
  user_id: string;
  username: string;
  quality_score: number;
  bug_count: number;
}): Promise<void> {
  const sb = getClient();
  if (!sb) return;

  try {
    const { data: existing } = await sb
      .from('leaderboard_stats')
      .select('*')
      .eq('user_id', data.user_id)
      .single();

    if (existing) {
      const newTotal = existing.total_sessions + 1;
      const newAvg =
        ((existing.average_score * existing.total_sessions) + data.quality_score) / newTotal;
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
  } catch (err) {
    console.error('[Supabase] upsertLeaderboard:', err);
  }
}

export async function getLeaderboard(): Promise<unknown[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('leaderboard_stats')
    .select('*')
    .order('average_score', { ascending: false });
  if (error) { console.error('[Supabase] getLeaderboard:', error.message); return []; }
  return data ?? [];
}
