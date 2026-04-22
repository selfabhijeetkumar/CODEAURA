'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useExecutionStore } from '@/store/executionStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useExecutionPlayer } from '@/hooks/useExecutionPlayer';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { TopNav } from '@/components/studio/TopNav';
import { InputPanel } from '@/components/studio/InputPanel';
import { ExplanationPanel } from '@/components/studio/ExplanationPanel';
import { TimelineRail } from '@/components/studio/TimelineRail';
import { TransportControls } from '@/components/studio/TransportControls';
import { AskAIDock } from '@/components/studio/AskAIDock';
import { AnalyzingOverlay } from '@/components/studio/AnalyzingOverlay';
import { QualityScoreOrb } from '@/components/studio/QualityScoreOrb';
import { SaveSessionModal } from '@/components/studio/SaveSessionModal';
import { NoteEditor } from '@/components/studio/NoteEditor';
import { QuizModal } from '@/components/studio/QuizModal';
import { useUIStore } from '@/store/uiStore';
import { usePlaybackStore } from '@/store/playbackStore';

// Three.js scene SSR-safe
const VizScene = dynamic(() => import('@/components/viz/Scene').then(m => ({ default: m.VizScene })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-aura-void">
      <div className="w-8 h-8 border-2 border-aura-plasma rounded-full animate-spin border-t-transparent" />
    </div>
  ),
});

export default function StudioPage() {
  useKeyboard();
  const { script, isAnalyzing, currentIndex, totalSteps, setCurrentIndex } = useExecutionStore();
  const { editorVisible } = useUIStore();
  const { autoAdvance } = usePlaybackStore();
  useExecutionPlayer();

  // ── Step flash ─────────────────────────────────────────────────────────────
  const [flashing, setFlashing] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (currentIndex === prevIndexRef.current) return;
    prevIndexRef.current = currentIndex;
    setFlashing(true);
    const t1 = setTimeout(() => { setFlashing(false); setPanelKey(k => k + 1); }, 50);
    return () => clearTimeout(t1);
  }, [currentIndex]);

  // ── Safety timeout: dismiss overlay if stuck ────────────────────────────────
  const { setAnalyzing } = useExecutionStore();
  useEffect(() => {
    if (!isAnalyzing) return;
    const timer = setTimeout(() => {
      setAnalyzing(false);
    }, 45000);
    return () => clearTimeout(timer);
  }, [isAnalyzing, setAnalyzing]);

  // ── Save Session Modal ──────────────────────────────────────────────────────
  const [showSave, setShowSave] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | undefined>();
  const [quizScore, setQuizScore] = useState(0);

  // ── Notes ──────────────────────────────────────────────────────────────────
  const [noteEditorStep, setNoteEditorStep] = useState<number | null>(null);
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});

  const handleNoteSaved = (stepNum: number, note: string) => {
    setStepNotes(prev => ({ ...prev, [stepNum]: note }));
    setNoteEditorStep(null);
  };

  // ── Quiz Mode ──────────────────────────────────────────────────────────────
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTriggered, setQuizTriggered] = useState(false);

  useEffect(() => {
    if (!script || quizTriggered) return;
    if (totalSteps > 0 && currentIndex >= totalSteps * 0.5) {
      setQuizTriggered(true);
    }
  }, [currentIndex, totalSteps, script, quizTriggered]);

  // Reset quiz trigger when new script loads
  useEffect(() => {
    setQuizTriggered(false);
    setQuizScore(0);
  }, [script]);

  const goNext = useCallback(() => {
    setCurrentIndex(Math.min(totalSteps - 1, currentIndex + 1));
  }, [currentIndex, totalSteps, setCurrentIndex]);

  const currentStep = script?.steps[currentIndex];
  const stepsForQuiz = script?.steps.map(s => ({ title: s.title, type: s.type })) ?? [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-aura-void flex flex-col select-none">
      <CustomCursor />
      <TopNav />

      {/* ── BENTO MAIN ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — editor/input */}
        {editorVisible && (
          <aside className="w-[440px] flex-shrink-0 flex flex-col border-r border-aura-smoke overflow-hidden">
            <InputPanel />
          </aside>
        )}

        {/* Center — 3D canvas */}
        <main className="flex-1 relative flex flex-col overflow-hidden scene-container">
          {isAnalyzing && <AnalyzingOverlay />}
          <VizScene />

          {/* Step transition flash */}
          {flashing && (
            <div className="absolute inset-0 z-25 pointer-events-none" style={{ background: '#000000', opacity: 0.6 }} />
          )}

          {/* Quality orb + Save button — top-right */}
          {script && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              {/* Save Session button */}
              <button
                onClick={() => setShowSave(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(0,180,216,0.1)',
                  border: '1px solid rgba(0,180,216,0.35)',
                  borderRadius: 10, color: '#00b4d8',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 12px rgba(0,180,216,0.2)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,180,216,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,180,216,0.1)'}
              >
                💾 Save Session
              </button>
              <QualityScoreOrb score={script.qualityScore} breakdown={script.qualityBreakdown} />
            </div>
          )}

          {/* Quiz trigger button — appears at 50% progress */}
          {quizTriggered && !showQuiz && script && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30" style={{ animation: 'fadeInUp 0.5s ease both' }}>
              <button
                onClick={() => setShowQuiz(true)}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #7C5CFF, #FF3DCB)',
                  border: '1px solid rgba(124,92,255,0.5)',
                  borderRadius: 24, color: 'white',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(124,92,255,0.6)',
                  animation: 'pulse 2s ease infinite',
                }}
              >
                🧠 Test Your Understanding →
              </button>
            </div>
          )}

          {/* Floating NEXT button */}
          {script && !autoAdvance && !quizTriggered && (
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
              style={{ animation: 'fadeInUp 0.4s ease 0.5s both' }}
            >
              <button
                onClick={goNext}
                disabled={currentIndex >= totalSteps - 1}
                style={{
                  height: 48, padding: '0 32px',
                  background: 'linear-gradient(135deg, #7C5CFF, #5B3FFF)',
                  border: '1px solid rgba(124,92,255,0.5)',
                  borderRadius: 24, color: 'white',
                  fontSize: 15, fontWeight: 600, letterSpacing: '0.05em',
                  boxShadow: '0 0 24px rgba(124,92,255,0.55)',
                  cursor: currentIndex >= totalSteps - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex >= totalSteps - 1 ? 0.4 : 1,
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(124,92,255,0.9)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(124,92,255,0.55)'; }}
              >
                NEXT <span style={{ fontSize: 18 }}>→</span>
              </button>
            </div>
          )}

          {/* Bottom transport */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
            <TimelineRail
              stepNotes={stepNotes}
              onNoteClick={(stepIdx) => setNoteEditorStep(stepIdx + 1)}
            />
            <TransportControls />
          </div>
        </main>

        {/* Right panel — explanation */}
        {script && (
          <aside
            key={panelKey}
            className="w-[360px] flex-shrink-0 border-l border-aura-smoke overflow-y-auto"
            style={{ animation: 'panelFadeIn 0.25s ease both' }}
          >
            <ExplanationPanel />
          </aside>
        )}
      </div>

      <AskAIDock />

      {/* ── Modals / Panels ── */}
      {showSave && script && (
        <SaveSessionModal
          code={script.steps[0]?.codeSnippet ?? ''}
          language={script.language}
          steps={script.steps as unknown[]}
          qualityScore={script.qualityScore}
          bugCount={script.bugs.length}
          quizScore={quizScore}
          onClose={() => setShowSave(false)}
          onSaved={(id) => setSavedSessionId(id)}
        />
      )}

      {noteEditorStep !== null && (
        <NoteEditor
          stepNumber={noteEditorStep}
          aiExplanation={script?.steps[noteEditorStep - 1]?.narration}
          sessionId={savedSessionId}
          onClose={() => setNoteEditorStep(null)}
          onSaved={handleNoteSaved}
        />
      )}

      {showQuiz && script && (
        <QuizModal
          code={script.steps.map(s => s.codeSnippet).join('\n')}
          language={script.language}
          steps={stepsForQuiz}
          stepCount={totalSteps}
          onClose={() => setShowQuiz(false)}
          onComplete={(s) => { setQuizScore(s); setShowQuiz(false); setShowSave(true); }}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { box-shadow: 0 0 28px rgba(124,92,255,0.6); } 50% { box-shadow: 0 0 48px rgba(255,61,203,0.8); } }
      `}</style>
    </div>
  );
}
