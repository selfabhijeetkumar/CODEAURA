'use client';

import { useEffect } from 'react';
import { useExecutionStore } from '@/store/executionStore';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { TopNav } from '@/components/studio/TopNav';
import { ExplanationPanel } from '@/components/studio/ExplanationPanel';
import { TimelineRail } from '@/components/studio/TimelineRail';
import { TransportControls } from '@/components/studio/TransportControls';
import { AskAIDock } from '@/components/studio/AskAIDock';
import { QualityScoreOrb } from '@/components/studio/QualityScoreOrb';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useExecutionPlayer } from '@/hooks/useExecutionPlayer';
import dynamic from 'next/dynamic';

const VizScene = dynamic(() => import('@/components/viz/Scene').then(m => ({ default: m.VizScene })), {
  ssr: false,
  loading: () => <div className="flex-1 bg-aura-void flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-aura-plasma rounded-full animate-spin border-t-transparent" />
  </div>,
});

export function DemoStudio({ demo }: { demo: any }) {
  const { setScript, script } = useExecutionStore();
  useKeyboard();
  useExecutionPlayer();

  useEffect(() => {
    setScript(demo.script, demo.slug);
  }, [demo, setScript]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-aura-void flex flex-col select-none">
      <CustomCursor />
      <TopNav />
      {/* Demo badge */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full"
        style={{ background: 'rgba(79,227,193,0.1)', border: '1px solid rgba(79,227,193,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-aura-aurora animate-pulse" />
        <span className="label-caps text-aura-aurora">DEMO MODE</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative flex flex-col overflow-hidden scene-container">
          <VizScene />
          {script && (
            <div className="absolute top-4 right-4 z-20">
              <QualityScoreOrb score={script.qualityScore} breakdown={script.qualityBreakdown} />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
            <TimelineRail />
            <TransportControls />
          </div>
        </main>
        {script && (
          <aside className="w-[360px] flex-shrink-0 border-l border-aura-smoke overflow-y-auto">
            <ExplanationPanel />
          </aside>
        )}
      </div>
      <AskAIDock />
    </div>
  );
}
