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

// Load BACKEND/.env
const isProd = dir.endsWith('dist');
const envPath = isProd ? resolve(dir, '..', '.env') : resolve(dir, '.env');
const result = config({ path: envPath });

if (result.error) {
  console.error(`[env] ⚠️  dotenv failed to load: ${result.error.message}`);
} else {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (geminiKey) {
    console.log(`[env] ✅ GEMINI_API_KEY loaded (${geminiKey.slice(0, 8)}...)`);
  } else {
    console.warn('[env] ⚠️  GEMINI_API_KEY not set — will try OpenAI/DeepSeek fallback');
  }
  if (openaiKey) {
    console.log(`[env] ✅ OPENAI_API_KEY loaded (${openaiKey.slice(0, 8)}...)`);
  } else {
    console.warn('[env] ⚠️  OPENAI_API_KEY not set — OpenAI fallback disabled');
  }
  if (deepseekKey && deepseekKey !== 'none' && deepseekKey !== 'skip') {
    console.log(`[env] ✅ DEEPSEEK_API_KEY loaded (${deepseekKey.slice(0, 8)}...)`);
  } else {
    console.warn('[env] ⚠️  DEEPSEEK_API_KEY not set — DeepSeek fallback disabled');
  }
}
