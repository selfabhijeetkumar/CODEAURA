'use client';
import { useEffect } from 'react';
import { usePlaybackStore } from '@/store/playbackStore';
import { useExecutionStore } from '@/store/executionStore';
import { useUIStore } from '@/store/uiStore';

export function useKeyboard() {
  const { togglePlay, speed, setSpeed } = usePlaybackStore();
  const { currentIndex, totalSteps, setCurrentIndex } = useExecutionStore();
  const { setCommandBar, setAskAI, toggleEditor, toggleFullscreen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < totalSteps - 1) setCurrentIndex(currentIndex + 1);
          break;
        case 'k':
          if (e.metaKey || e.ctrlKey) { e.preventDefault(); setCommandBar(true); }
          break;
        case '/':
          e.preventDefault();
          setAskAI(true);
          break;
        case 'e':
        case 'E':
          toggleEditor();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, totalSteps, togglePlay, setCurrentIndex, setCommandBar, setAskAI, toggleEditor, toggleFullscreen, speed, setSpeed]);
}
