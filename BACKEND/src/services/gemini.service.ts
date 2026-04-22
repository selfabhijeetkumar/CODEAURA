import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM, DIFF_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema, DiffReportSchema } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';
import * as deepseekService from './deepseek.service.js';

// ── Stable model name ─────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.0-flash';

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
    console.log(`[Failover] Switched to key index=${currentKeyIndex} (${getKeySnippet()})`);
  }
}

// ── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeCode(code: string, filename?: string) {
  console.log(`[Analyze] Starting — model=${GEMINI_MODEL}  key index=${currentKeyIndex} (${getKeySnippet()})`);

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
      console.log(`[Analyze] Response OK — ${text.length} chars`);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Gemini returned invalid JSON');
      }

      return ExecutionScriptSchema.parse(parsed);

    } catch (err: any) {
      console.error(`[Analyze] Attempt ${attempts + 1} FAILED (key index=${currentKeyIndex}): ${err.message}`);
      rotateKey();
      attempts++;
      
      const isRateLimit = err.status === 429 || err?.response?.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('quota');
      const isNotFound = err.status === 404 || err?.response?.status === 404 || err.message?.includes('404');
      
      if (isRateLimit || isNotFound) {
        console.log(`[Analyze] Triggering DeepSeek fallback automatically...`);
        try {
          return await deepseekService.analyzeCode(code, filename);
        } catch (dsErr: any) {
          console.error(`[Analyze] DeepSeek fallback FAILED: ${dsErr.message}`);
          if (attempts === maxAttempts) {
            console.warn('[Analyze] All AI providers failed. Returning mock steps.');
            return deepseekService.generateMockSteps(code);
          }
        }
      } else if (attempts === maxAttempts) {
        console.warn('[Analyze] Gemini API failed after all available keys were exhausted. Returning mock steps.');
        return deepseekService.generateMockSteps(code);
      }
    }
  }

  // If no Gemini keys are configured at all, fallback to DeepSeek immediately
  if (maxAttempts === 0) {
    console.log(`[Analyze] No Gemini keys configured. Triggering DeepSeek fallback automatically...`);
    try {
      return await deepseekService.analyzeCode(code, filename);
    } catch (dsErr: any) {
      console.error(`[Analyze] DeepSeek fallback FAILED: ${dsErr.message}`);
      console.warn('[Analyze] All AI providers failed. Returning mock steps.');
      return deepseekService.generateMockSteps(code);
    }
  }
}

// ── Ask ───────────────────────────────────────────────────────────────────────
export async function askQuestion(question: string, stepContext: string): Promise<string> {
  // Log WHICH key is being used BEFORE the call
  console.log(`[Ask] ── REQUEST ──────────────────────────────────────────`);
  console.log(`[Ask]  model      : ${GEMINI_MODEL}`);
  console.log(`[Ask]  key index  : ${currentKeyIndex}`);
  console.log(`[Ask]  key snippet: ${getKeySnippet()}`);
  console.log(`[Ask]  question   : "${question.slice(0, 100)}"`);
  console.log(`[Ask]  ctx length : ${stepContext.length} chars`);
  console.log(`[Ask] ───────────────────────────────────────────────────────`);

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

    console.log(`[Ask] ✅ SUCCESS — response ${answer.length} chars`);
    return answer;

  } catch (error: any) {
    // Surface the full error so it's visible in terminal — NOT silently swallowed
    console.error(`[Ask] ❌ FAILED ─────────────────────────────────────────`);
    console.error(`[Ask]  key index  : ${currentKeyIndex}`);
    console.error(`[Ask]  key snippet: ${getKeySnippet()}`);
    console.error(`[Ask]  error msg  : ${error.message}`);
    console.error(`[Ask]  http status: ${error.status ?? error.statusCode ?? 'unknown'}`);
    console.error(`[Ask]  error code : ${error.errorDetails?.[0]?.reason ?? 'unknown'}`);
    console.error(`[Ask] ────────────────────────────────────────────────────`);
    logger.warn({ err: error }, 'Gemini /ask failed');

    const isRateLimit = error.status === 429 || error?.response?.status === 429 || error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
    const isNotFound = error.status === 404 || error?.response?.status === 404 || error.message?.includes('404');
    
    if (isRateLimit || isNotFound) {
      console.log(`[Ask] Triggering DeepSeek fallback automatically...`);
      try {
        return await deepseekService.askQuestion(question, stepContext);
      } catch (dsErr: any) {
        console.warn('[Ask] All AI providers failed. Returning mock answer.');
        return "AI providers are currently offline. This is a mock response.";
      }
    }

    console.warn('[Ask] Gemini API failed. Returning mock answer.');
    return "AI providers are currently offline. This is a mock response.";
  }
}

// ── Diff ──────────────────────────────────────────────────────────────────────
export async function diffSessions(scriptA: unknown, scriptB: unknown) {
  console.log(`[Diff] Starting — model=${GEMINI_MODEL}  key index=${currentKeyIndex} (${getKeySnippet()})`);

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
}
