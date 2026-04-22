import OpenAI from 'openai';
import { ANALYZE_SYSTEM, buildAnalyzeUser, ASK_SYSTEM } from '../prompts/analyze.prompt.js';
import { ExecutionScriptSchema } from '../schemas/execution-step.js';
import { logger } from '../middleware/logger.js';

const DEEPSEEK_MODEL = 'deepseek/deepseek-chat';

function getOpenAI(): OpenAI {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.DEEPSEEK_API_KEY,
        defaultHeaders: {
            'HTTP-Referer': 'https://codeaura.vercel.app',
            'X-Title': 'CODEAURA',
        },
    });
}

export async function analyzeCode(code: string, filename?: string) {
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('No DEEPSEEK_API_KEY found');
    }
    console.log(`[DeepSeek Analyze] Starting — model=${DEEPSEEK_MODEL}`);

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
            { role: 'system', content: ANALYZE_SYSTEM },
            { role: 'user', content: buildAnalyzeUser(code, filename) }
        ],
        response_format: { type: 'json_object' }
    });

    const text = response.choices[0].message.content;
    if (!text) {
        throw new Error('DeepSeek returned empty response');
    }

    // DeepSeek might still return markdown-wrapped json
    const cleanText = text.trim().replace(/^```json/, '').replace(/```$/, '').trim();

    logger.info({ text_length: cleanText.length }, 'DeepSeek /analyze response received');
    console.log(`[DeepSeek Analyze] Response OK — ${cleanText.length} chars`);

    let parsed: unknown;
    try {
        parsed = JSON.parse(cleanText);
    } catch {
        throw new Error('DeepSeek returned invalid JSON');
    }

    return ExecutionScriptSchema.parse(parsed);
}

export async function askQuestion(question: string, stepContext: string): Promise<string> {
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('No DEEPSEEK_API_KEY found');
    }
    console.log(`[DeepSeek Ask] Starting — model=${DEEPSEEK_MODEL}`);

    const prompt = `Current step context:\n${stepContext}\n\nUser question: ${question}`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
            { role: 'system', content: ASK_SYSTEM },
            { role: 'user', content: prompt }
        ]
    });

    const answer = response.choices[0].message.content;
    if (!answer) {
        throw new Error('DeepSeek returned empty response');
    }

    console.log(`[DeepSeek Ask] ✅ SUCCESS — response ${answer.length} chars`);
    return answer;
}
