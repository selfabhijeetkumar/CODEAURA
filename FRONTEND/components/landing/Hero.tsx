'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { Scrambler } from '@/components/ui/Scrambler';
import { HeroCanvas } from './HeroCanvas';
import { ManifestoSection } from './ManifestoSection';
import { FeatureReel } from './FeatureReel';
import { HowItWorks } from './HowItWorks';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Boot loader fades out
    tl.to(loaderRef.current, { opacity: 0, duration: 0.6, ease: 'power2.in', delay: 1.2 })
      .set(loaderRef.current, { display: 'none' })
      // Stagger hero text in
      .from('.hero-word', { yPercent: 120, duration: 1.2, stagger: 0.04, ease: 'expo.out' }, '-=0.3')
      .from(subRef.current, { opacity: 0, y: 24, duration: 1.0, ease: 'expo.out' }, '-=0.7')
      .from(ctaRef.current!.children, { opacity: 0, y: 16, duration: 0.8, stagger: 0.12, ease: 'expo.out' }, '-=0.5')
      .from(scrollRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');

    // Scroll indicator yoyo
    gsap.to('.scroll-dot', {
      y: 12, duration: 1.2, ease: 'power1.inOut', yoyo: true, repeat: -1,
    });

    return () => { tl.kill(); ScrollTrigger.getAll().forEach(st => st.kill()); };
  }, []);

  return (
    <>
      {/* ── Boot Loader ── */}
      <div
        ref={loaderRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-aura-void"
      >
        <h1 className="font-serif text-[clamp(32px,6vw,80px)] text-aura-ink-pure tracking-widest">
          <Scrambler text="CODEAURA" speed={40} />
        </h1>
        <div className="mt-6 w-48 h-px bg-gradient-to-r from-transparent via-aura-plasma to-transparent animate-plasma-pulse" />
      </div>

      {/* ── SECTION 1 — Hero ── */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroCanvas />

        <div className="relative z-10 text-center px-6 max-w-5xl w-full">
          {/* Main headline — 3 lines for dramatic effect */}
          <div className="overflow-hidden pb-3">
            <div className="hero-word font-serif italic text-hero text-aura-ink-pure" style={{ lineHeight: '0.95', willChange: 'transform', display: 'block' }}>
              Your Code.
            </div>
          </div>
          <div className="overflow-hidden pb-3">
            <div className="hero-word font-serif text-hero text-plasma text-glow-plasma" style={{ lineHeight: '0.95', willChange: 'transform', display: 'block' }}>
              Visualized.
            </div>
          </div>
          <div className="overflow-hidden pb-6">
            <div className="hero-word font-serif italic text-hero text-aura-ink-pure" style={{ lineHeight: '0.95', willChange: 'transform', display: 'block' }}>
              Alive.
            </div>
          </div>

          {/* Sub-headline */}
          <p ref={subRef} className="mt-8 text-body-lg text-aura-ink-secondary max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
            Paste any code. Watch it execute in 3D.<br />
            <em className="text-aura-ink-primary not-italic">Understand every step with AI narration.</em>
          </p>

          {/* CTA */}
          <div ref={ctaRef} className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            <button
              onClick={() => router.push('/studio')}
              style={{
                height: 56,
                padding: '0 40px',
                background: 'linear-gradient(135deg, #7C5CFF, #FF3DCB)',
                border: 'none',
                borderRadius: 28,
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.04em',
                boxShadow: '0 0 40px rgba(124,92,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                router.prefetch('/studio');
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 60px rgba(124,92,255,0.8)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(124,92,255,0.5)';
              }}
            >
              Watch Your Code Think <span style={{ fontSize: 20 }}>→</span>
            </button>
            <button
              className="text-aura-ink-secondary text-body hover:text-aura-ink-primary transition-colors duration-400 group flex items-center gap-2"
              onClick={() => router.push('/demo/fibonacci-recursion')}
            >
              Watch 60s demo
              <span className="inline-block transition-transform duration-400 group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* ── 3 Feature cards ────────────────────────────────────────────── */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: '🎬', label: '14+ Step Types', sub: 'Every pattern, visualized' },
              { icon: '🔊', label: 'Voice Narration', sub: 'AI explains every step' },
              { icon: '🤖', label: 'AI-Powered Analysis', sub: 'Gemini & DeepSeek' },
            ].map(f => (
              <div
                key={f.label}
                style={{
                  background: 'rgba(18,21,31,0.6)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  padding: '18px 12px',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                <p style={{ color: '#EAEAF0', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.label}</p>
                <p style={{ color: '#5A5F75', fontSize: 11, letterSpacing: '0.05em' }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-aura-smoke" />
          <div className="scroll-dot w-1.5 h-1.5 rounded-full bg-aura-plasma" />
        </div>
      </section>

      <ManifestoSection />
      <FeatureReel />
      <HowItWorks />
      <CTASection />
      <Footer />
    </>
  );
}
