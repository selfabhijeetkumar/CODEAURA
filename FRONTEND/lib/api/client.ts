import type { ExecutionScript } from 'shared/types/execution';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function post<T>(path: string, body: unknown, timeoutMs = 60_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? 'Request failed');
    return data as T;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out — is the API server running?');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeCode(code: string, filename?: string): Promise<{ sessionId: string; script: ExecutionScript; cached: boolean }> {
  return post('/api/v1/analyze', { code, filename });
}

export async function askQuestion(question: string, stepContext: string): Promise<{ answer: string }> {
  return post('/api/v1/ask', { question, stepContext });
}

export async function importFromGitHub(url: string): Promise<{ files: Array<{ name: string; path: string; content: string }>; primaryFile: { name: string; content: string } | null }> {
  return post('/api/v1/github/import', { url });
}

export async function diffSessions(sessionIdA: string, sessionIdB: string) {
  return post('/api/v1/diff', { sessionIdA, sessionIdB });
}

export async function getSession(id: string) {
  const res = await fetch(`${API}/api/v1/sessions/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Session not found');
  return data;
}

export async function getDemos() {
  const res = await fetch(`${API}/api/v1/demos`);
  return res.json();
}

export async function getDemo(slug: string) {
  const res = await fetch(`${API}/api/v1/demos/${slug}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Demo not found');
  return data;
}
