'use client';
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

export function useMousePosition() {
  const setCursorPosition = useUIStore((s) => s.setCursorPosition);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setCursorPosition(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [setCursorPosition]);

  return pos;
}
