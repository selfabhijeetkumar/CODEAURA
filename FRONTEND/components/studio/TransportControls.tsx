'use client';

import { usePlaybackStore } from '@/store/playbackStore';
import { useExecutionStore } from '@/store/executionStore';

const SPEEDS = [0.5, 1, 1.5, 2] as const;

export function TransportControls() {
  const { isPlaying, togglePlay, speed, setSpeed, loop, setLoop, autoAdvance, setAutoAdvance } = usePlaybackStore();
  const { currentIndex, totalSteps, setCurrentIndex, script } = useExecutionStore();

  if (!script) return null;

  const goNext = () => setCurrentIndex(Math.min(totalSteps - 1, currentIndex + 1));
  const goPrev = () => setCurrentIndex(Math.max(0, currentIndex - 1));

  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-black/80 backdrop-blur-sm border-t border-aura-smoke flex-wrap">
      {/* Step Back */}
      <button
        onClick={goPrev}
        disabled={currentIndex === 0}
        className="text-aura-ink-secondary hover:text-aura-ink-primary disabled:opacity-30 transition-colors text-lg"
        title="Previous step (←)"
      >⏮</button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isPlaying ? 'rgba(124,92,255,0.15)' : 'var(--aura-grad-plasma)',
          border: isPlaying ? '1px solid var(--aura-plasma)' : 'none',
          boxShadow: isPlaying ? '0 0 20px rgba(124,92,255,0.4)' : 'none',
        }}
        title="Play/Pause (Space)"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Step Forward */}
      <button
        onClick={goNext}
        disabled={currentIndex >= totalSteps - 1}
        className="text-aura-ink-secondary hover:text-aura-ink-primary disabled:opacity-30 transition-colors text-lg"
        title="Next step (→)"
      >⏭</button>

      {/* Speed */}
      <div className="flex items-center gap-1 ml-2">
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className="px-2 py-1 rounded text-[11px] font-mono transition-all duration-300"
            style={{
              background: speed === s ? 'rgba(124,92,255,0.2)' : 'transparent',
              color: speed === s ? '#A88BFF' : '#5A5F75',
              border: speed === s ? '1px solid var(--aura-plasma)' : '1px solid transparent',
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Loop */}
      <button
        onClick={() => setLoop(!loop)}
        className="px-3 py-1 rounded text-[11px] font-mono transition-all duration-300 ml-1"
        style={{
          color: loop ? '#4FE3C1' : '#5A5F75',
          border: `1px solid ${loop ? '#4FE3C1' : 'transparent'}`,
        }}
      >
        ↺ LOOP
      </button>

      {/* AUTO / MANUAL toggle */}
      <button
        onClick={() => setAutoAdvance(!autoAdvance)}
        className="px-3 py-1 rounded text-[11px] font-mono transition-all duration-300 ml-1"
        title={autoAdvance ? 'Switch to manual step-by-step' : 'Switch to auto-play'}
        style={{
          color: autoAdvance ? '#FFB347' : '#7C5CFF',
          border: `1px solid ${autoAdvance ? '#FFB347' : '#7C5CFF'}`,
          background: autoAdvance ? 'rgba(255,179,71,0.08)' : 'rgba(124,92,255,0.08)',
        }}
      >
        {autoAdvance ? 'AUTO ▶' : 'MANUAL ⏸'}
      </button>

      {/* Step counter — right */}
      <div className="ml-auto font-mono text-sm text-aura-ink-tertiary">
        <span className="text-aura-ink-primary">{currentIndex + 1}</span>
        <span> / {totalSteps}</span>
      </div>
    </div>
  );
}
