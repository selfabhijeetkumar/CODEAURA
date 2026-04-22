/**
 * CODEAURA — Dynamic API Key Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages multiple API keys across providers with:
 *   • Automatic validation on startup
 *   • Per-key failure tracking
 *   • Dead-key eviction (removed from pool after threshold failures)
 *   • Round-robin + failover rotation
 *   • Runtime health status endpoint
 */

export type Provider =
  | 'gemini'
  | 'openrouter'
  | 'groq';

export interface ApiKeyEntry {
  provider: Provider;
  /** env var name — for logging only */
  envVar: string;
  key: string;
  /** human-readable label, e.g. "NVIDIA Nemotron 3 Super" */
  label: string;
  failures: number;
  dead: boolean;
  lastError?: string;
  lastUsed?: Date;
}

// ── Failure threshold before a key is evicted ─────────────────────────────
const MAX_FAILURES = 3;

// ── Registry ──────────────────────────────────────────────────────────────
const registry: ApiKeyEntry[] = [];

/** Register a key. Called at startup from env.ts */
export function registerKey(entry: Omit<ApiKeyEntry, 'failures' | 'dead'>): void {
  if (!entry.key || entry.key === 'none' || entry.key === 'skip' || entry.key.length < 8) {
    console.warn(`[KeyManager] Skipping invalid/empty key for ${entry.label}`);
    return;
  }
  // Avoid duplicates
  if (registry.some(e => e.key === entry.key)) return;

  registry.push({ ...entry, failures: 0, dead: false });
  console.log(`[KeyManager] ✅ Registered key [${entry.label}] (${entry.key.slice(0, 10)}...)`);
}

/** Get all live keys for a provider */
export function getLiveKeys(provider: Provider): ApiKeyEntry[] {
  return registry.filter(e => e.provider === provider && !e.dead);
}

/** Get ANY live key across all providers (for generic failover) */
export function getAnyLiveKey(): ApiKeyEntry | null {
  return registry.find(e => !e.dead) ?? null;
}

/** Mark a successful use */
export function markSuccess(entry: ApiKeyEntry): void {
  entry.lastUsed = new Date();
  // Reset failure counter on success
  entry.failures = 0;
}

/** Mark a failure. Evicts the key after MAX_FAILURES. */
export function markFailure(entry: ApiKeyEntry, error: string): void {
  entry.failures++;
  entry.lastError = error;
  if (entry.failures >= MAX_FAILURES) {
    entry.dead = true;
    console.warn(
      `[KeyManager] ☠️  Key EVICTED [${entry.label}] after ${entry.failures} failures. ` +
      `Last error: ${error.slice(0, 120)}`
    );
  } else {
    console.warn(
      `[KeyManager] ⚠️  Key failure ${entry.failures}/${MAX_FAILURES} [${entry.label}]: ${error.slice(0, 80)}`
    );
  }
}

/** Revive all dead keys (useful for admin reset endpoint) */
export function reviveAllKeys(): void {
  registry.forEach(e => { e.dead = false; e.failures = 0; });
  console.log('[KeyManager] 🔄 All keys revived.');
}

/** Full health report for /api/v1/health */
export function getHealthReport() {
  const total = registry.length;
  const live = registry.filter(e => !e.dead).length;
  const dead = total - live;

  return {
    total,
    live,
    dead,
    keys: registry.map(e => ({
      label: e.label,
      provider: e.provider,
      envVar: e.envVar,
      keySnippet: e.key.slice(0, 10) + '...',
      failures: e.failures,
      dead: e.dead,
      lastError: e.dead ? e.lastError : undefined,
      lastUsed: e.lastUsed,
    })),
  };
}

/**
 * Execute a function with automatic key rotation & eviction.
 *
 * @param provider  Which provider pool to use
 * @param fn        Async function receiving a live ApiKeyEntry, returns T
 * @returns         Result from fn, or throws if all keys exhausted
 */
export async function withKeyRotation<T>(
  provider: Provider,
  fn: (entry: ApiKeyEntry) => Promise<T>
): Promise<T> {
  const liveKeys = getLiveKeys(provider);

  if (liveKeys.length === 0) {
    throw new Error(`[KeyManager] No live keys available for provider: ${provider}`);
  }

  let lastErr: Error = new Error('No keys tried');

  for (const entry of liveKeys) {
    try {
      console.log(`[KeyManager] Trying [${entry.label}] (${entry.key.slice(0, 10)}...)`);
      const result = await fn(entry);
      markSuccess(entry);
      return result;
    } catch (err: any) {
      markFailure(entry, err?.message ?? String(err));
      lastErr = err;
    }
  }

  throw lastErr;
}
