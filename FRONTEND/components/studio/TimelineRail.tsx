'use client';

import { useExecutionStore } from '@/store/executionStore';
import { usePlaybackStore } from '@/store/playbackStore';
import { STEP_TYPE_COLORS } from 'shared/constants/languages';

export function TimelineRail() {
  const { script, currentIndex, setCurrentIndex } = useExecutionStore();
  const { progress } = usePlaybackStore();

  if (!script) return null;

  return (
    <div className="px-4 py-2 bg-black/70 backdrop-blur-sm border-t border-aura-smoke">
      {/* Progress bar */}
      <div className="relative h-1 bg-aura-smoke rounded-full mb-3 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentIndex(Math.floor(pct * script.steps.length));
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
          style={{ width: `${(progress * 100).toFixed(1)}%`, background: 'var(--aura-grad-plasma)' }}
        />
        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-plasma transition-all duration-150"
          style={{ left: `calc(${(progress * 100).toFixed(1)}% - 6px)` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex gap-0.5 overflow-x-auto pb-1 scrollbar-hide">
        {script.steps.map((step, i) => {
          const color = STEP_TYPE_COLORS[step.type] ?? '#5A5F75';
          const isActive = i === currentIndex;
          const hasError = step.type === 'error';
          return (
            <button
              key={step.id}
              onClick={() => setCurrentIndex(i)}
              title={step.title}
              className="flex-shrink-0 relative"
            >
              <div
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: isActive ? color : color + '55',
                  transform: isActive ? 'scale(1.8)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
