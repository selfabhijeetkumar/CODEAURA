/**
 * CODEAURA — Groq Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses Groq's ultra-fast inference API.
 * Models: llama-3.3-70b-versatile (primary), mixtral-8x7b-32768 (fallback)
 *
 * Groq uses an OpenAI-compatible API, so we reuse the openai package.
 */

import OpenAI from 'openai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';
import { withKeyRotation, getLiveKeys, type ApiKeyEntry } from './api-key-manager.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const ANALYZE_MODELS = [
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
];

const ASK_MODELS = [
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
];

function makeClient(entry: ApiKeyEntry): OpenAI {
  return new OpenAI({
    baseURL: GROQ_BASE_URL,
    apiKey: entry.key,
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
export async function analyzeWithGroq(code: string, filename?: string): Promise<unknown> {
  const liveKeys = getLiveKeys('groq');
  if (liveKeys.length === 0) {
    throw new Error('Groq: no live keys available');
  }

  return withKeyRotation('groq', async (entry) => {
    const client = makeClient(entry);
    let lastModelErr: Error = new Error('No models tried');

    for (const model of ANALYZE_MODELS) {
      try {
        console.log(`[Groq Analyze] key=${entry.key.slice(0, 10)}... model=${model}`);

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
        if (!text) throw new Error(`Groq model ${model} returned empty content`);

        const cleaned = cleanJson(text);
        logger.info({ model, text_length: cleaned.length }, 'Groq /analyze response');
        console.log(`[Groq Analyze] ✅ ${model} OK — ${cleaned.length} chars`);

        let parsed: unknown;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          throw new Error(`Groq model ${model} returned invalid JSON`);
        }

        return ExecutionScriptSchema.parse(parsed);

      } catch (modelErr: any) {
        console.warn(`[Groq Analyze] model ${model} failed: ${modelErr.message}`);
        lastModelErr = modelErr;
      }
    }

    throw lastModelErr;
  });
}

// ── Ask ───────────────────────────────────────────────────────────────────────
export async function askWithGroq(question: string, stepContext: string): Promise<string> {
  const liveKeys = getLiveKeys('groq');
  if (liveKeys.length === 0) {
    throw new Error('Groq: no live keys available for ask');
  }

  return withKeyRotation('groq', async (entry) => {
    const client = makeClient(entry);
    const prompt = `Current step context:\n${stepContext}\n\nUser question: ${question}`;
    let lastModelErr: Error = new Error('No models tried');

    for (const model of ASK_MODELS) {
      try {
        console.log(`[Groq Ask] key=${entry.key.slice(0, 10)}... model=${model}`);

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
        if (!answer) throw new Error(`Groq model ${model} returned empty answer`);

        console.log(`[Groq Ask] ✅ ${model} OK — ${answer.length} chars`);
        return answer;

      } catch (modelErr: any) {
        console.warn(`[Groq Ask] model ${model} failed: ${modelErr.message}`);
        lastModelErr = modelErr;
      }
    }

    throw lastModelErr;
  });
}
