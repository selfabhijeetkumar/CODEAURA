/**
 * CODEAURA — OpenRouter Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all OpenRouter-hosted models:
 *   • nvidia/llama-3.1-nemotron-ultra-253b-v1  (Nemotron 3 Super)
 *   • openai/gpt-4o-mini                        (GPT-OSS 120b proxy)
 *   • nvidia/nemotron-nano-8b-instruct           (Nemotron 3 Nano 30B)
 *   • openai/gpt-4o-mini-2024-07-18             (GPT-OSS 20B)
 *   • minimax/minimax-m1                         (MiniMax M2.5)
 *   • openai/gpt-3.5-turbo                       (GPT-OSS 20b proxy)
 *
 * Uses the central ApiKeyManager for rotation + eviction.
 */

import OpenAI from 'openai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema, type ExecutionScript } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';
import { withKeyRotation, getLiveKeys, type ApiKeyEntry } from './api-key-manager.js';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_SITE_URL = 'https://codeaura-psi.vercel.app';
const OPENROUTER_SITE_TITLE = 'CODEAURA';

/**
 * Priority-ordered model list for analysis.
 * We try the best model first, step down on failure.
 */
const ANALYZE_MODELS = [
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',   // Nemotron 3 Super (best)
  'openai/gpt-4o-mini',                          // GPT-OSS 120b via OpenRouter
  'nvidia/nemotron-nano-8b-instruct',            // Nemotron 3 Nano 30B
  'openai/gpt-4o-mini-2024-07-18',               // GPT-OSS 20B (new)
  'minimax/minimax-m1',                          // MiniMax M2.5 (new)
  'openai/gpt-3.5-turbo',                        // GPT-OSS legacy
];

const ASK_MODELS = [
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'openai/gpt-4o-mini',
  'nvidia/nemotron-nano-8b-instruct',
  'openai/gpt-4o-mini-2024-07-18',
  'minimax/minimax-m1',
  'openai/gpt-3.5-turbo',
];

function makeClient(entry: ApiKeyEntry): OpenAI {
  return new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey: entry.key,
    defaultHeaders: {
      'HTTP-Referer': OPENROUTER_SITE_URL,
      'X-Title': OPENROUTER_SITE_TITLE,
    },
  });
}

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

// ── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeWithOpenRouter(code: string, filename?: string): Promise<ExecutionScript> {
  const liveKeys = getLiveKeys('openrouter');
  if (liveKeys.length === 0) {
    throw new Error('OpenRouter: no live keys available');
  }

  return withKeyRotation('openrouter', async (entry) => {
    const client = makeClient(entry);

    // Try models in priority order for this key
    let lastModelErr: Error = new Error('No models tried');

    for (const model of ANALYZE_MODELS) {
      try {
        console.log(`[OpenRouter Analyze] key=${entry.key.slice(0, 10)}... model=${model}`);

        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: ANALYZE_SYSTEM },
            { role: 'user', content: buildAnalyzeUser(code, filename) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 8192,
        });

        const text = response.choices[0]?.message?.content;
        if (!text) throw new Error(`OpenRouter model ${model} returned empty content`);

        const cleaned = cleanJson(text);
        logger.info({ model, text_length: cleaned.length }, 'OpenRouter /analyze response');
        console.log(`[OpenRouter Analyze] ✅ ${model} OK — ${cleaned.length} chars`);

        let parsed: unknown;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          throw new Error(`OpenRouter model ${model} returned invalid JSON`);
        }

        return ExecutionScriptSchema.parse(parsed);

      } catch (modelErr: any) {
        console.warn(`[OpenRouter Analyze] model ${model} failed: ${modelErr.message}`);
        lastModelErr = modelErr;
        // Continue to next model in list
      }
    }

    // All models failed for this key — propagate so withKeyRotation can try next key
    throw lastModelErr;
  });
}

// ── Ask ───────────────────────────────────────────────────────────────────────
export async function askWithOpenRouter(question: string, stepContext: string): Promise<string> {
  const liveKeys = getLiveKeys('openrouter');
  if (liveKeys.length === 0) {
    throw new Error('OpenRouter: no live keys available for ask');
  }

  return withKeyRotation('openrouter', async (entry) => {
    const client = makeClient(entry);
    const prompt = `Current step context:\n${stepContext}\n\nUser question: ${question}`;

    let lastModelErr: Error = new Error('No models tried');

    for (const model of ASK_MODELS) {
      try {
        console.log(`[OpenRouter Ask] key=${entry.key.slice(0, 10)}... model=${model}`);

        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: ASK_SYSTEM },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 512,
        });

        const answer = response.choices[0]?.message?.content;
        if (!answer) throw new Error(`OpenRouter model ${model} returned empty answer`);

        console.log(`[OpenRouter Ask] ✅ ${model} OK — ${answer.length} chars`);
        return answer;

      } catch (modelErr: any) {
        console.warn(`[OpenRouter Ask] model ${model} failed: ${modelErr.message}`);
        lastModelErr = modelErr;
      }
    }

    throw lastModelErr;
  });
}
