import OpenAI from 'openai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';

const OPENAI_MODEL = 'gpt-3.5-turbo';

function isConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!(key && key !== 'none' && key !== 'skip');
}

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function analyzeWithOpenAI(code: string, filename?: string) {
  if (!isConfigured()) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  console.log(`[OpenAI Analyze] Starting — model=${OPENAI_MODEL}`);

  const client = getClient();
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: ANALYZE_SYSTEM },
      { role: 'user', content: buildAnalyzeUser(code, filename) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  if (!text) throw new Error('OpenAI returned empty response');

  logger.info({ text_length: text.length }, 'OpenAI /analyze response received');
  console.log(`[OpenAI Analyze] Response OK — ${text.length} chars`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('OpenAI returned invalid JSON');
  }

  return ExecutionScriptSchema.parse(parsed);
}

export async function askWithOpenAI(question: string, stepContext: string): Promise<string> {
  if (!isConfigured()) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  console.log(`[OpenAI Ask] Starting — model=${OPENAI_MODEL}`);

  const client = getClient();
  const prompt = `Current step context:\n${stepContext}\n\nUser question: ${question}`;

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: ASK_SYSTEM },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 512,
  });

  const answer = response.choices[0].message.content;
  if (!answer) throw new Error('OpenAI returned empty response');

  console.log(`[OpenAI Ask] ✅ SUCCESS — ${answer.length} chars`);
  return answer;
}
