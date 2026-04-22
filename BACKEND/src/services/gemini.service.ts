import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM, DIFF_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema, DiffReportSchema, type ExecutionScript } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';
import { withKeyRotation, getLiveKeys, getAnyLiveKey } from './api-key-manager.js';

import * as openrouterService from './openrouter.service.js';
import * as groqService from './groq.service.js';
import * as deepseekService from './deepseek.service.js';

// ── Stable model name ─────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-1.5-flash';

// ── AI Fallback Chain ─────────────────────────────────────────────────────────
async function runAnalysisFallbackChain(code: string, filename?: string): Promise<ExecutionScript> {
  // 1. Try Groq
  try {
    if (getLiveKeys('groq').length > 0) {
      console.log('[Fallback] Trying Groq...');
      return await groqService.analyzeWithGroq(code, filename);
    }
  } catch (err: any) {
    console.error(`[Fallback] Groq failed: ${err.message}`);
  }

  // 2. Try OpenRouter (GPT-OSS / Nemotron)
  try {
    if (getLiveKeys('openrouter').length > 0) {
      console.log('[Fallback] Trying OpenRouter...');
      return await openrouterService.analyzeWithOpenRouter(code, filename);
    }
  } catch (err: any) {
    console.error(`[Fallback] OpenRouter failed: ${err.message}`);
  }

  // 3. Try DeepSeek (Legacy Fallback)
  try {
    console.log('[Fallback] Trying DeepSeek (Legacy)...');
    return await deepseekService.analyzeCode(code, filename);
  } catch (dsErr: any) {
    console.error(`[Fallback] DeepSeek failed: ${dsErr.message}`);
  }

  // 4. Return mock steps
  console.warn('[Fallback] All AI providers failed. Returning mock steps.');
  return deepseekService.generateMockSteps(code);
}

async function runAskFallbackChain(question: string, stepContext: string): Promise<string> {
  // 1. Try Groq
  try {
    if (getLiveKeys('groq').length > 0) {
      console.log('[Fallback] Ask — Trying Groq...');
      return await groqService.askWithGroq(question, stepContext);
    }
  } catch (err: any) {
    console.error(`[Fallback] Ask — Groq failed: ${err.message}`);
  }

  // 2. Try OpenRouter
  try {
    if (getLiveKeys('openrouter').length > 0) {
      console.log('[Fallback] Ask — Trying OpenRouter...');
      return await openrouterService.askWithOpenRouter(question, stepContext);
    }
  } catch (err: any) {
    console.error(`[Fallback] Ask — OpenRouter failed: ${err.message}`);
  }

  // 3. Try DeepSeek (Legacy)
  try {
    console.log('[Fallback] Ask — Trying DeepSeek (Legacy)...');
    return await deepseekService.askQuestion(question, stepContext);
  } catch (dsErr: any) {
    console.error(`[Fallback] Ask — DeepSeek failed: ${dsErr.message}`);
  }

  // 4. Mock answer
  console.warn('[Fallback] Ask — All AI providers failed. Returning mock answer.');
  return 'AI providers are currently offline. This is a mock response.';
}

// ── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeCode(code: string, filename?: string): Promise<ExecutionScript> {
  const liveKeys = getLiveKeys('gemini');

  if (liveKeys.length === 0) {
    console.warn('[Analyze] No Gemini keys configured. Jumping to fallback chain...');
    return await runAnalysisFallbackChain(code, filename);
  }

  try {
    return await withKeyRotation('gemini', async (entry) => {
      console.log(`[Analyze] Starting — model=${GEMINI_MODEL} key=${entry.key.slice(0, 10)}...`);
      
      const genAI = new GoogleGenerativeAI(entry.key);
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
    });
  } catch (err: any) {
    console.warn(`[Analyze] All Gemini keys failed: ${err.message}. Running fallback chain...`);
    return await runAnalysisFallbackChain(code, filename);
  }
}

// ── Ask ───────────────────────────────────────────────────────────────────────
export async function askQuestion(question: string, stepContext: string): Promise<string> {
  const liveKeys = getLiveKeys('gemini');

  if (liveKeys.length === 0) {
    console.warn('[Ask] No Gemini keys configured. Running fallback chain...');
    return await runAskFallbackChain(question, stepContext);
  }

  try {
    return await withKeyRotation('gemini', async (entry) => {
      console.log(`[Ask] Starting — model=${GEMINI_MODEL} key=${entry.key.slice(0, 10)}...`);
      
      const genAI = new GoogleGenerativeAI(entry.key);
      const model = genAI.getGenerativeModel({
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
    });
  } catch (error: any) {
    logger.warn({ err: error }, 'Gemini /ask failed — running fallback chain');
    return await runAskFallbackChain(question, stepContext);
  }
}

// ── Diff ──────────────────────────────────────────────────────────────────────
export async function diffSessions(scriptA: unknown, scriptB: unknown) {
  const liveKey = getLiveKeys('gemini')[0] || getAnyLiveKey();
  
  if (!liveKey) {
    return DiffReportSchema.parse({
      added: [], removed: [], changed: [],
      verdict: 'Diff unavailable — AI not configured.',
      performanceDelta: 'N/A', readabilityDelta: 'N/A',
    });
  }

  try {
    console.log(`[Diff] Starting — key=${liveKey.key.slice(0, 10)}... (${liveKey.provider})`);
    
    // For simplicity, we'll only use Gemini for Diff.
    if (liveKey.provider !== 'gemini') {
       throw new Error('Diff currently only implemented for Gemini');
    }

    const genAI = new GoogleGenerativeAI(liveKey.key);
    const model = genAI.getGenerativeModel({
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
    console.error(`[Diff] failed: ${err.message}. Returning empty diff.`);
    return DiffReportSchema.parse({
      added: [], removed: [], changed: [],
      verdict: 'Diff unavailable — AI temporarily offline.',
      performanceDelta: 'N/A', readabilityDelta: 'N/A',
    });
  }
}
