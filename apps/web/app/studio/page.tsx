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

  // ── Polish 3: Step transition flash overlay ─────────────────────────────────
  const [flashing, setFlashing] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (currentIndex === prevIndexRef.current) return;
    prevIndexRef.current = currentIndex;

    // 1. Trigger flash
    setFlashing(true);
    // 2. At 50ms: clear flash, bump panel key so ExplanationPanel fades in fresh
    const t1 = setTimeout(() => {
      setFlashing(false);
      setPanelKey(k => k + 1);
    }, 50);
    return () => clearTimeout(t1);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex(Math.min(totalSteps - 1, currentIndex + 1));
  }, [currentIndex, totalSteps, setCurrentIndex]);

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

          {/* Polish 3: black flash overlay on step transition */}
          {flashing && (
            <div
              className="absolute inset-0 z-25 pointer-events-none"
              style={{ background: '#000000', opacity: 0.6 }}
            />
          )}

          {/* Quality orb — top-right of canvas */}
          {script && (
            <div className="absolute top-4 right-4 z-20">
              <QualityScoreOrb score={script.qualityScore} breakdown={script.qualityBreakdown} />
            </div>
          )}

          {/* Floating NEXT button — center bottom, manual mode only */}
          {script && !autoAdvance && (
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
              style={{ animation: 'fadeInUp 0.4s ease 0.5s both' }}
            >
              <button
                onClick={goNext}
                disabled={currentIndex >= totalSteps - 1}
                style={{
                  height: 48,
                  padding: '0 32px',
                  background: 'linear-gradient(135deg, #7C5CFF, #5B3FFF)',
                  border: '1px solid rgba(124,92,255,0.5)',
                  borderRadius: 24,
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  boxShadow: '0 0 24px rgba(124,92,255,0.55)',
                  cursor: currentIndex >= totalSteps - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex >= totalSteps - 1 ? 0.4 : 1,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
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
            <TimelineRail />
            <TransportControls />
          </div>
        </main>

        {/* Right panel — explanation (key changes = fade in fresh content) */}
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
    </div>
  );
}
