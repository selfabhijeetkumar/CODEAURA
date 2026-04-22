'use client';

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';
import { gsap } from 'gsap';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const { setCursorPosition } = useUIStore();

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setCursorPosition(mouseX, mouseY);

      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
      gsap.to(ring, { x: mouseX, y: mouseY, duration: 0.18, ease: 'power2.out' });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, select, [data-magnetic]');
      if (isInteractive) {
        gsap.to(ring, { scale: 5, opacity: 0.12, duration: 0.4, ease: 'power2.out' });
        gsap.to(dot, { scale: 0.6, duration: 0.3 });
      } else {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    };

    const handleMouseDown = () => gsap.to(dot, { scale: 0.8, duration: 0.15 });
    const handleMouseUp = () => gsap.to(dot, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.4)' });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setCursorPosition]);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[99998]"
        style={{ transform: 'translate(-50%, -50%)', mixBlendMode: 'difference' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[99997]"
        style={{ transform: 'translate(-50%, -50%)', mixBlendMode: 'difference', opacity: 0.6 }}
      />
    </>
  );
}
