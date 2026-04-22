'use client';
import { useEffect, useRef, useCallback } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';
import { useExecutionStore } from '@/store/executionStore';

export function useExecutionPlayer() {
  const { isPlaying, speed, setProgress, pause, loop, autoAdvance } = usePlaybackStore();
  const { script, currentIndex, totalSteps, setCurrentIndex } = useExecutionStore();
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const STEP_DURATION = 800; // ms per step at 1x

  const seek = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalSteps - 1)));
    setProgress(totalSteps > 0 ? index / totalSteps : 0);
  }, [setCurrentIndex, setProgress, totalSteps]);

  useEffect(() => {
    // In manual mode OR when not playing — no auto-advance
    if (!isPlaying || !script || totalSteps === 0 || !autoAdvance) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const stepMs = STEP_DURATION / speed;
    let startIndex = currentIndex;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const stepsElapsed = Math.floor(elapsed / stepMs);
      const newIndex = startIndex + stepsElapsed;

      if (newIndex >= totalSteps) {
        if (loop) {
          seek(0);
          startTimeRef.current = performance.now();
          startIndex = 0;
        } else {
          pause();
          seek(totalSteps - 1);
        }
        return;
      }

      if (newIndex !== currentIndex) seek(newIndex);
      setProgress(newIndex / totalSteps);
      rafRef.current = requestAnimationFrame(tick);
    };

    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, speed, script, totalSteps, loop, autoAdvance]);

  return { seek, currentIndex, totalSteps };
}
