'use client';

import { useEffect, useState, useRef } from 'react';
import { useExecutionStore } from '@/store/executionStore';
import { STEP_TYPE_COLORS } from 'shared/constants/languages';
import { GlassPanel } from '@/components/ui/GlassPanel';

// ── Voice narration hook ───────────────────────────────────────────────────────
function useVoiceNarration(text: string, muted: boolean) {
  useEffect(() => {
    if (muted || !text || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = 0.9;
    utter.pitch  = 1.0;
    utter.volume = 1.0;

    // Try to use Google UK English Female if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google UK English Female'));
    if (preferred) utter.voice = preferred;

    // Voices may not be loaded yet on first render — wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = window.speechSynthesis.getVoices().find(v => v.name.includes('Google UK English Female'));
        if (v) utter.voice = v;
        window.speechSynthesis.speak(utter);
      };
    } else {
      window.speechSynthesis.speak(utter);
    }

    return () => { window.speechSynthesis.cancel(); };
  }, [text, muted]);
}

// ── Friendly step type labels ──────────────────────────────────────────────────
function formatStepType(type: string, codeSnippet?: string): string {
  const lower = (codeSnippet ?? '').toLowerCase();
  if (type === 'io_operation') {
    if (lower.includes('printf') || lower.includes('print') || lower.includes('cout')) return 'OUTPUT TO SCREEN';
    if (lower.includes('scanf') || lower.includes('input') || lower.includes('cin'))   return 'WAITING FOR INPUT';
    return 'I/O OPERATION';
  }
  return type.replace(/_/g, ' ').toUpperCase();
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ExplanationPanel() {
  const { script, currentIndex, currentStep } = useExecutionStore();
  const [muted, setMuted] = useState(false);

  const spokenText = currentStep
    ? `${currentStep.title}. ${currentStep.narration}. ${currentStep.cinematicHint ?? ''}`
    : '';

  useVoiceNarration(spokenText, muted);

  if (!script || !currentStep) return null;

  const color = STEP_TYPE_COLORS[currentStep.type] ?? '#9BA0B3';
  const displayType = formatStepType(currentStep.type, currentStep.codeSnippet);

  return (
    <div className="flex flex-col h-full">
      {/* Step counter + mute button */}
      <div className="p-5 border-b border-aura-smoke flex-shrink-0 flex items-center justify-between">
        <span className="label-caps text-aura-ink-tertiary">STEP {currentIndex + 1} / {script.steps.length}</span>
        <div className="flex items-center gap-3">
          <span
            className="label-caps px-3 py-1 rounded-full text-[10px]"
            style={{ background: color + '20', color }}
          >
            {displayType}
          </span>
          {/* Mute / unmute voice */}
          <button
            onClick={() => {
              setMuted(m => !m);
              if (!muted) window.speechSynthesis?.cancel();
            }}
            title={muted ? 'Unmute narration' : 'Mute narration'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              opacity: muted ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h3 className="font-serif text-heading text-aura-ink-pure leading-snug">{currentStep.title}</h3>
        </div>

        {/* Code snippet */}
        <div className="rounded-xl overflow-hidden bg-aura-carbon border border-aura-smoke">
          <div className="px-4 py-2 border-b border-aura-smoke flex items-center">
            <span className="label-caps text-aura-ink-tertiary">LINE {currentStep.line}</span>
          </div>
          <pre className="p-4 font-mono text-code text-aura-aurora overflow-x-auto">
            <code>{currentStep.codeSnippet}</code>
          </pre>
        </div>

        {/* Narration */}
        <div className="glass-panel p-5">
          <p className="label-caps text-aura-ink-tertiary mb-2">NARRATOR</p>
          <p className="text-body-lg text-aura-ink-primary leading-relaxed">{currentStep.narration}</p>
        </div>

        {/* Cinematic hint */}
        <div>
          <p className="label-caps text-aura-ink-tertiary mb-2">CINEMATIC DIRECTION</p>
          <p className="text-body text-aura-ink-secondary italic">{currentStep.cinematicHint}</p>
        </div>

        {/* Summary (first step only) */}
        {currentIndex === 0 && (
          <>
            <div className="border-t border-aura-smoke pt-5">
              <p className="label-caps text-aura-ink-tertiary mb-2">SUMMARY</p>
              <p className="text-body text-aura-ink-secondary">{script.summary}</p>
            </div>
            <div>
              <p className="label-caps text-aura-ink-tertiary mb-2">COMPLEXITY</p>
              <div className="flex gap-3 mb-2">
                <span className="glass-panel px-3 py-1 label-caps text-aura-solar">{script.complexity.time}</span>
                <span className="glass-panel px-3 py-1 label-caps text-aura-aurora">{script.complexity.space}</span>
              </div>
              <p className="text-caption text-aura-ink-tertiary">{script.complexity.explanation}</p>
            </div>
          </>
        )}

        {/* Bugs for this step */}
        {script.bugs
          .filter(b => b.line === currentStep.line)
          .map((bug, i) => (
            <GlassPanel key={i} className="p-4 border-l-2" style={{ borderLeftColor: bug.severity === 'critical' || bug.severity === 'high' ? '#FF6B4A' : '#FFB547' }}>
              <span className="label-caps text-aura-ember mb-1 block">{bug.severity.toUpperCase()} BUG</span>
              <p className="text-body-lg text-aura-ink-primary font-medium">{bug.title}</p>
              <p className="text-body text-aura-ink-secondary mt-1">{bug.explanation}</p>
              <div className="mt-3 rounded-lg bg-aura-carbon p-3">
                <p className="label-caps text-aura-aurora mb-1">FIX</p>
                <p className="font-mono text-code text-aura-ink-secondary">{bug.suggestedFix}</p>
              </div>
            </GlassPanel>
          ))}
      </div>
    </div>
  );
}
