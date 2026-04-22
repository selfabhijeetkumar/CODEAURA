import { resolve } from 'path';
import { config } from 'dotenv';

// CJS-compatible dirname — tsx handles ESM in dev, tsc produces CJS for prod
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dir: string = (() => {
  try {
    // Works when compiled to CJS (production build)
    return __dirname;
  } catch {
    // Should not reach here in CJS build
    return process.cwd();
  }
})();

// Load BACKEND/.env  (one level up from src/)
const result = config({ path: resolve(dir, '..', '.env') });

if (result.error) {
  console.error(`[env] ⚠️  dotenv failed to load: ${result.error.message}`);
} else {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('[env] ❌ GEMINI_API_KEY missing in BACKEND/.env');
  } else {
    console.log(`[env] ✅ GEMINI_API_KEY loaded (${key.slice(0, 8)}...)`);
  }
}
