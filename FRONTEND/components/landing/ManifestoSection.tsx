'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const MANIFESTO = `Code is the most performed language on Earth — yet nobody has ever seen it dance. Until now. CODEAURA is a cinema for logic. A stage for syntax. Every variable is a character. Every loop, a choreography. Every bug, a plot twist.`;

export function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    const words = MANIFESTO.split(' ');
    textRef.current.innerHTML = words
      .map((w) => `<span class="manifesto-word inline-block opacity-10 mr-[0.28em]">${w}</span>`)
      .join('');

    const wordEls = textRef.current.querySelectorAll('.manifesto-word');

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress;
        wordEls.forEach((el, i) => {
          const threshold = i / wordEls.length;
          const wordProgress = Math.max(0, Math.min(1, (progress - threshold) * wordEls.length));
          (el as HTMLElement).style.opacity = String(0.1 + wordProgress * 0.9);
          (el as HTMLElement).style.transform = `translateY(${(1 - wordProgress) * 6}px)`;
        });
      },
    });

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen flex items-center justify-center px-8 overflow-hidden">
      {/* Section label */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 -rotate-90 label-caps tracking-[0.3em] text-aura-ink-tertiary select-none">
        01 — MANIFESTO
      </div>

      <p
        ref={textRef}
        className="font-serif text-display text-aura-ink-pure max-w-4xl leading-tight text-center"
      />
    </section>
  );
}
