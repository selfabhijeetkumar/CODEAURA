import { z } from 'zod';

const SeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
const ImpactSchema = z.enum(['minor', 'moderate', 'major']);
const StepTypeSchema = z.enum([
  'variable_declaration', 'variable_assignment', 'function_call',
  'function_return', 'loop_start', 'loop_iteration', 'loop_end',
  'conditional', 'array_operation', 'object_mutation', 'class_instantiation',
  'recursion', 'async_await', 'io_operation', 'error', 'comment_or_noop',
]);

export const ExecutionStepSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  type: StepTypeSchema,
  line: z.number().int().positive(),
  codeSnippet: z.string(),
  title: z.string(),
  narration: z.string(),
  cinematicHint: z.string(),
  payload: z.record(z.unknown()),
});

export const ExecutionScriptSchema = z.object({
  language: z.string(),
  languageConfidence: z.number().min(0).max(1),
  summary: z.string(),
  qualityScore: z.number().min(0).max(100),
  qualityBreakdown: z.object({
    readability: z.number().min(0).max(100),
    performance: z.number().min(0).max(100),
    correctness: z.number().min(0).max(100),
    idiomaticity: z.number().min(0).max(100),
  }),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
    explanation: z.string(),
  }),
  bugs: z.array(z.object({
    line: z.number(),
    severity: SeveritySchema,
    title: z.string(),
    explanation: z.string(),
    suggestedFix: z.string(),
  })),
  optimizations: z.array(z.object({
    line: z.number(),
    title: z.string(),
    description: z.string(),
    estimatedImpact: ImpactSchema,
  })),
  steps: z.array(ExecutionStepSchema).min(1).max(60),
  scenePlan: z.object({
    camera: z.object({
      style: z.enum(['orbit', 'dolly', 'tracking']),
      initialPosition: z.tuple([z.number(), z.number(), z.number()]),
    }),
    palette: z.enum(['plasma', 'aurora', 'ember', 'nebula']),
    tempo: z.enum(['slow', 'medium', 'fast']),
  }),
});

export type ExecutionScript = z.infer<typeof ExecutionScriptSchema>;
export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;

export const DiffReportSchema = z.object({
  added: z.array(z.string()),
  removed: z.array(z.string()),
  changed: z.array(z.object({
    id: z.string(),
    beforeTitle: z.string(),
    afterTitle: z.string(),
    reason: z.string(),
  })),
  verdict: z.string(),
  performanceDelta: z.string(),
  readabilityDelta: z.string(),
});
