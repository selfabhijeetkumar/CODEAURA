export type StepType =
  | 'variable_declaration'
  | 'variable_assignment'
  | 'function_call'
  | 'function_return'
  | 'loop_start'
  | 'loop_iteration'
  | 'loop_end'
  | 'conditional'
  | 'array_operation'
  | 'object_mutation'
  | 'class_instantiation'
  | 'recursion'
  | 'async_await'
  | 'io_operation'
  | 'error'
  | 'comment_or_noop';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ImpactLevel = 'minor' | 'moderate' | 'major';
export type CameraStyle = 'orbit' | 'dolly' | 'tracking';
export type ScenePalette = 'plasma' | 'aurora' | 'ember' | 'nebula';
export type SceneTempo = 'slow' | 'medium' | 'fast';
export type ArrayOp = 'push' | 'pop' | 'set' | 'splice';
export type AsyncState = 'pending' | 'resolved' | 'rejected';
export type IODirection = 'in' | 'out';

export interface ExecutionBug {
  line: number;
  severity: Severity;
  title: string;
  explanation: string;
  suggestedFix: string;
}

export interface ExecutionOptimization {
  line: number;
  title: string;
  description: string;
  estimatedImpact: ImpactLevel;
}

export interface ExecutionStep {
  id: string;
  order: number;
  type: StepType;
  line: number;
  codeSnippet: string;
  title: string;
  narration: string;
  cinematicHint: string;
  payload: Record<string, unknown>;
}

export interface ScenePlan {
  camera: {
    style: CameraStyle;
    initialPosition: [number, number, number];
  };
  palette: ScenePalette;
  tempo: SceneTempo;
}

export interface QualityBreakdown {
  readability: number;
  performance: number;
  correctness: number;
  idiomaticity: number;
}

export interface ExecutionScript {
  language: string;
  languageConfidence: number;
  summary: string;
  qualityScore: number;
  qualityBreakdown: QualityBreakdown;
  complexity: {
    time: string;
    space: string;
    explanation: string;
  };
  bugs: ExecutionBug[];
  optimizations: ExecutionOptimization[];
  steps: ExecutionStep[];
  scenePlan: ScenePlan;
}

export interface DemoRecord {
  slug: string;
  title: string;
  description: string;
  language: string;
  script: ExecutionScript;
  thumbnail_url?: string;
}

export interface DiffReport {
  added: string[];
  removed: string[];
  changed: Array<{
    id: string;
    beforeTitle: string;
    afterTitle: string;
    reason: string;
  }>;
  verdict: string;
  performanceDelta: string;
  readabilityDelta: string;
}
