import { resolve } from 'path';
import { config } from 'dotenv';

// Load apps/api/.env  (one level up from src/)
const result = config({ path: resolve(import.meta.dirname, '..', '.env') });

if (result.error) {
  console.error(`[env] ⚠️  dotenv failed to load: ${result.error.message}`);
} else {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('[env] ❌ GEMINI_API_KEY missing in apps/api/.env');
  } else {
    console.log(`[env] ✅ GEMINI_API_KEY loaded (${key.slice(0, 8)}...)`);
  }
}
