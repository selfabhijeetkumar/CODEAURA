'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useGsapScroll() {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  return { ScrollTrigger };
}

export function useParallax(ref: React.RefObject<HTMLElement>, speed = 0.5) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        gsap.set(el, { y: self.progress * 100 * speed });
      },
    });
    return () => st.kill();
  }, [ref, speed]);
}
