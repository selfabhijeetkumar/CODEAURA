import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../middleware/logger.js';

const router = Router();

const QuizBody = z.object({
  code: z.string().min(1).max(50000),
  language: z.string().optional(),
  steps: z.array(z.object({ title: z.string(), type: z.string() })).optional(),
  stepCount: z.number().optional(),
});

const GEMINI_MODEL = 'gemini-2.0-flash';

router.post('/quiz', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language, steps, stepCount } = QuizBody.parse(req.body);

    const count = stepCount ?? steps?.length ?? 5;
    const questionCount = count < 10 ? '3-4' : count <= 25 ? '5-7' : '8-10';
    const stepTitles = (steps ?? []).slice(0, 5).map(s => s.title).join(', ');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are a CS professor. A student watched this code execute step by step. Generate a quiz.
Language: ${language ?? 'unknown'}
Code:
\`\`\`
${code.slice(0, 3000)}
\`\`\`
Steps summary (first 5): ${stepTitles || 'not provided'}
Total steps: ${count}

RULES:
- Generate exactly ${questionCount} questions
- All questions multiple choice with exactly 4 options
- Questions specific to THIS code execution
- Include: variable values, function purposes, time complexity, bug identification, step purposes
- Make questions progressively harder

Return ONLY valid JSON, no markdown:
{
  "questions": [{
    "question_number": 1,
    "question": "string",
    "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
    "correct_answer": "A",
    "explanation": "string"
  }],
  "total_questions": 5,
  "difficulty": "medium"
}`;

    logger.info({ stepCount: count, language }, 'Generating quiz');
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Quiz generation returned invalid JSON');
    }

    return res.json(parsed);
  } catch (err) {
    next(err);
  }
});

export default router;
