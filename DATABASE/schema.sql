-- ============================================================
-- CODEAURA Database Schema
-- Provider: Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: sessions
-- Purpose: Caches AI analysis results per unique code hash
--          to avoid redundant Gemini/DeepSeek API calls.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash       TEXT        NOT NULL,          -- SHA-256 of submitted code
  language        TEXT        NOT NULL,          -- e.g. 'javascript', 'python'
  filename        TEXT,                          -- optional filename hint
  code            TEXT        NOT NULL,          -- raw source code submitted
  script          JSONB       NOT NULL,          -- AI-generated execution script (array of steps)
  quality_score   INTEGER     NOT NULL DEFAULT 0, -- 0-100 quality rating
  bugs_count      INTEGER     NOT NULL DEFAULT 0, -- number of detected bugs
  anon_token      TEXT,                          -- optional anonymous user token
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast cache lookups by code hash + recency
CREATE INDEX IF NOT EXISTS idx_sessions_code_hash_created
  ON public.sessions (code_hash, created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow the service role (backend) full access
CREATE POLICY "service_role_all" ON public.sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anonymous reads by token
CREATE POLICY "anon_read_own" ON public.sessions
  FOR SELECT
  USING (anon_token = current_setting('request.jwt.claims', true)::jsonb->>'sub');
