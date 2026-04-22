import { create } from 'zustand';
import type { ExecutionScript, ExecutionStep } from 'shared/types/execution';

interface ExecutionState {
  script: ExecutionScript | null;
  currentIndex: number;
  sessionId: string | null;
  isAnalyzing: boolean;
  analyzeStatus: string;
  setScript: (script: ExecutionScript, sessionId: string) => void;
  setCurrentIndex: (index: number) => void;
  setAnalyzing: (status: boolean, message?: string) => void;
  reset: () => void;
  currentStep: ExecutionStep | null;
  totalSteps: number;
}

const ANALYZE_STATUS_MESSAGES = [
  'PARSING',
  'MAPPING FLOW',
  'DETECTING PATTERNS',
  'COMPOSING SCENE',
  'RENDERING NARRATION',
];

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  script: null,
  currentIndex: 0,
  sessionId: null,
  isAnalyzing: false,
  analyzeStatus: 'PARSING',

  currentStep: null,
  totalSteps: 0,

  setScript: (script, sessionId) =>
    set({
      script,
      sessionId,
      currentIndex: 0,
      isAnalyzing: false,
      currentStep: script.steps[0] ?? null,
      totalSteps: script.steps.length,
    }),

  setCurrentIndex: (index) => {
    const { script } = get();
    set({
      currentIndex: index,
      currentStep: script?.steps[index] ?? null,
    });
  },

  setAnalyzing: (status, message) =>
    set({
      isAnalyzing: status,
      analyzeStatus: message ?? ANALYZE_STATUS_MESSAGES[0],
    }),

  reset: () =>
    set({
      script: null,
      currentIndex: 0,
      sessionId: null,
      isAnalyzing: false,
      currentStep: null,
      totalSteps: 0,
    }),
}));
