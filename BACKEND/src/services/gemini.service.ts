import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM, DIFF_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema, DiffReportSchema } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';
import * as deepseekService from './deepseek.service.js';
import * as openaiService from './openai.service.js';

// ── Stable model name ─────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-1.5-flash';

// ── API Key Selection & Failover ─────────────────────────────────────────────
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.ALT_GEMINI_API_KEY
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getGenAI(): GoogleGenerativeAI {
  if (keys.length === 0) {
    throw new Error('No valid GEMINI_API_KEY found in environment.');
  }
  return new GoogleGenerativeAI(keys[currentKeyIndex]);
}

function getKeySnippet(index?: number): string {
  const i = index ?? currentKeyIndex;
  const k = keys[i];
  return k ? `${k.slice(0, 8)}...` : 'MISSING';
}

function rotateKey() {
  if (keys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`[Failover] Switched to Gemini key index=${currentKeyIndex} (${getKeySnippet()})`);
  }
}

// ── AI Fallback Chain: Gemini → OpenAI → DeepSeek → Mock ─────────────────────
async function runAnalysisFallbackChain(code: string, filename?: string) {
  // 1. Try OpenAI
  try {
    console.log('[Fallback] Trying OpenAI gpt-3.5-turbo...');
    return await openaiService.analyzeWithOpenAI(code, filename);
  } catch (openaiErr: any) {
    console.error(`[Fallback] OpenAI failed: ${openaiErr.message}`);
  }

  // 2. Try DeepSeek
  try {
    console.log('[Fallback] Trying DeepSeek...');
    return await deepseekService.analyzeCode(code, filename);
  } catch (dsErr: any) {
    console.error(`[Fallback] DeepSeek failed: ${dsErr.message}`);
  }

  // 3. Return mock steps — NEVER throw to frontend
  console.warn('[Fallback] All AI providers failed. Returning mock steps.');
  return deepseekService.generateMockSteps(code);
}

async function runAskFallbackChain(question: string, stepContext: string): Promise<string> {
  // 1. Try OpenAI
  try {
    console.log('[Fallback] Ask — Trying OpenAI gpt-3.5-turbo...');
    return await openaiService.askWithOpenAI(question, stepContext);
  } catch (openaiErr: any) {
    console.error(`[Fallback] Ask — OpenAI failed: ${openaiErr.message}`);
  }

  // 2. Try DeepSeek
  try {
    console.log('[Fallback] Ask — Trying DeepSeek...');
    return await deepseekService.askQuestion(question, stepContext);
  } catch (dsErr: any) {
    console.error(`[Fallback] Ask — DeepSeek failed: ${dsErr.message}`);
  }

  // 3. Mock answer
  console.warn('[Fallback] Ask — All AI providers failed. Returning mock answer.');
  return 'AI providers are currently offline. This is a mock response.';
}

// ── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeCode(code: string, filename?: string) {
  console.log(`[Analyze] Starting — model=${GEMINI_MODEL}  key index=${currentKeyIndex} (${getKeySnippet()})`);

  // If no Gemini keys at all, skip straight to fallback chain
  if (keys.length === 0) {
    console.warn('[Analyze] No Gemini keys configured. Jumping to fallback chain...');
    return await runAnalysisFallbackChain(code, filename);
  }

  let attempts = 0;
  const maxAttempts = keys.length;

  while (attempts < maxAttempts) {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: ANALYZE_SYSTEM,
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(buildAnalyzeUser(code, filename));
      const text = result.response.text();
      logger.info({ text_length: text.length }, 'Gemini /analyze response received');
      console.log(`[Analyze] Gemini OK — ${text.length} chars`);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Gemini returned invalid JSON');
      }

      return ExecutionScriptSchema.parse(parsed);

    } catch (err: any) {
      console.error(`[Analyze] Gemini attempt ${attempts + 1} FAILED (key index=${currentKeyIndex}): ${err.message}`);
      rotateKey();
      attempts++;

      if (attempts === maxAttempts) {
        console.warn('[Analyze] Gemini exhausted all keys. Running fallback chain...');
        return await runAnalysisFallbackChain(code, filename);
      }
    }
  }

  // Safety net
  return await runAnalysisFallbackChain(code, filename);
}

// ── Ask ───────────────────────────────────────────────────────────────────────
export async function askQuestion(question: string, stepContext: string): Promise<string> {
  console.log(`[Ask] ── REQUEST ──────────────────────────────────────────`);
  console.log(`[Ask]  model      : ${GEMINI_MODEL}`);
  console.log(`[Ask]  key index  : ${currentKeyIndex}`);
  console.log(`[Ask]  key snippet: ${getKeySnippet()}`);
  console.log(`[Ask]  question   : "${question.slice(0, 100)}"`);
  console.log(`[Ask]  ctx length : ${stepContext.length} chars`);
  console.log(`[Ask] ───────────────────────────────────────────────────────`);

  if (keys.length === 0) {
    console.warn('[Ask] No Gemini keys configured. Running fallback chain...');
    return await runAskFallbackChain(question, stepContext);
  }

  try {
    const model = getGenAI().getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: ASK_SYSTEM,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512,
      },
    });

    const prompt = `Current step context:\n${stepContext}\n\nUser question: ${question}`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log(`[Ask] ✅ Gemini SUCCESS — ${answer.length} chars`);
    return answer;

  } catch (error: any) {
    console.error(`[Ask] ❌ Gemini FAILED ─────────────────────────────────────────`);
    console.error(`[Ask]  error msg  : ${error.message}`);
    console.error(`[Ask]  http status: ${error.status ?? 'unknown'}`);
    console.error(`[Ask] ────────────────────────────────────────────────────`);
    logger.warn({ err: error }, 'Gemini /ask failed — running fallback chain');

    return await runAskFallbackChain(question, stepContext);
  }
}

// ── Diff ──────────────────────────────────────────────────────────────────────
export async function diffSessions(scriptA: unknown, scriptB: unknown) {
  console.log(`[Diff] Starting — model=${GEMINI_MODEL}  key index=${currentKeyIndex} (${getKeySnippet()})`);

  if (keys.length === 0) {
    return DiffReportSchema.parse({
      added: [], removed: [], changed: [],
      verdict: 'Diff unavailable — AI not configured.',
      performanceDelta: 'N/A', readabilityDelta: 'N/A',
    });
  }

  try {
    const model = getGenAI().getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: DIFF_SYSTEM,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Version A:\n${JSON.stringify(scriptA)}\n\nVersion B:\n${JSON.stringify(scriptB)}\n\nProduce the diff report.`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return DiffReportSchema.parse(parsed);
  } catch (err: any) {
    console.error(`[Diff] Gemini failed: ${err.message}. Returning empty diff.`);
    return DiffReportSchema.parse({
      added: [], removed: [], changed: [],
      verdict: 'Diff unavailable — AI temporarily offline.',
      performanceDelta: 'N/A', readabilityDelta: 'N/A',
    });
  }
}
