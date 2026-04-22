'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlassPanel } from '@/components/ui/GlassPanel';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { num: '01', title: 'Universal Languages', sub: 'Zero hardcoded parsers', body: 'Paste Python, Rust, C, Java, JavaScript, or anything invented tomorrow. Gemini understands all of it.' },
  { num: '02', title: '3D Execution Theatre', sub: 'Cinema-grade visualization', body: 'Every variable is an orb. Every function a portal. Every loop a double helix. Watch your code literally move.' },
  { num: '03', title: 'AI Narration', sub: 'Plain English, every step', body: 'No jargon. No manuals. A friendly AI voice explains exactly what is happening — like a 14-year-old could understand.' },
  { num: '04', title: 'Bug Cinematics', sub: 'Errors as drama', body: 'Bugs trigger an ErrorShatter explosion — chromatic aberration spikes, ember floods the scene, the camera shakes.' },
  { num: '05', title: 'Diff the Multiverse', sub: 'Side-by-side execution', body: 'Paste two versions of the same code. Watch them run simultaneously. See exactly what changed and why.' },
];

export function FeatureReel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !railRef.current) return;

    const totalWidth = railRef.current.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => `+=${totalWidth + window.innerHeight}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        gsap.set(railRef.current, { x: -self.progress * totalWidth });
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-aura-smoke z-20">
        <div
          ref={barRef}
          className="h-full origin-left"
          style={{ background: 'var(--aura-grad-plasma)', transform: 'scaleX(0)' }}
        />
      </div>

      {/* Section label */}
      <div className="absolute top-8 left-8 label-caps text-aura-ink-tertiary z-20">02 — FEATURE REEL</div>

      {/* Rail */}
      <div ref={railRef} className="flex items-center gap-8 px-24 h-full absolute" style={{ willChange: 'transform' }}>
        {FEATURES.map((f) => (
          <GlassPanel
            key={f.num}
            className="flex-shrink-0 w-[480px] h-[360px] p-10 flex flex-col justify-between"
          >
            <div>
              <span className="label-caps text-aura-plasma">{f.num}</span>
              <h3 className="font-serif text-title text-aura-ink-pure mt-3">{f.title}</h3>
              <p className="label-caps text-aura-ink-tertiary mt-1">{f.sub}</p>
            </div>
            <p className="text-body text-aura-ink-secondary leading-relaxed">{f.body}</p>
          </GlassPanel>
        ))}
        {/* Padding at end */}
        <div className="flex-shrink-0 w-24" />
      </div>
    </section>
  );
}
