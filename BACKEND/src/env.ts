import { resolve } from 'path';
import { config } from 'dotenv';
import { registerKey } from './services/api-key-manager.js';

// CJS-compatible dirname
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dir: string = (() => {
  try {
    return __dirname;
  } catch {
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
  // Register Gemini Keys
  if (process.env.GEMINI_API_KEY) registerKey({ provider: 'gemini', envVar: 'GEMINI_API_KEY', key: process.env.GEMINI_API_KEY, label: 'Gemini Primary' });
  if (process.env.ALT_GEMINI_API_KEY) registerKey({ provider: 'gemini', envVar: 'ALT_GEMINI_API_KEY', key: process.env.ALT_GEMINI_API_KEY, label: 'Gemini Alt' });

  // Register OpenRouter Keys
  if (process.env.NEMOTRON_3_SUPER_API_KEY) registerKey({ provider: 'openrouter', envVar: 'NEMOTRON_3_SUPER_API_KEY', key: process.env.NEMOTRON_3_SUPER_API_KEY, label: 'Nemotron 3 Super' });
  if (process.env.GPT_OSS_120B_API_KEY) registerKey({ provider: 'openrouter', envVar: 'GPT_OSS_120B_API_KEY', key: process.env.GPT_OSS_120B_API_KEY, label: 'GPT-OSS 120b' });
  if (process.env.NEMOTRON_3_NANO_API_KEY) registerKey({ provider: 'openrouter', envVar: 'NEMOTRON_3_NANO_API_KEY', key: process.env.NEMOTRON_3_NANO_API_KEY, label: 'Nemotron 3 Nano' });
  if (process.env.OPENROUTER_API_KEY) registerKey({ provider: 'openrouter', envVar: 'OPENROUTER_API_KEY', key: process.env.OPENROUTER_API_KEY, label: 'GPT-OSS 20b' });

  // Register Groq Keys
  if (process.env.GROQ_API_KEY) registerKey({ provider: 'groq', envVar: 'GROQ_API_KEY', key: process.env.GROQ_API_KEY, label: 'Groq Primary' });

  // Fallbacks
  if (process.env.DEEPSEEK_API_KEY) {
    console.log(`[env] ✅ DEEPSEEK_API_KEY loaded for legacy fallback`);
  }
}
