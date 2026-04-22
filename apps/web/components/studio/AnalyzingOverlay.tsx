'use client';

import { useEffect, useRef, useState } from 'react';

const PHASES = [
  'Parsing syntax tree...',
  'Detecting patterns...',
  'Building 3D world...',
  'Generating narration...',
];

const PHASE_MS = 800;
const TOTAL_MS = PHASES.length * PHASE_MS; // 3200ms

export function AnalyzingOverlay() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(performance.now());
  const rafRef   = useRef<number>(0);

  // ── Cycling phase text ─────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIdx(i => Math.min(i + 1, PHASES.length - 1));
    }, PHASE_MS);
    return () => clearInterval(id);
  }, []);

  // ── Progress bar RAF ───────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const p = Math.min(elapsed / TOTAL_MS, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      style={{ background: '#0A0A0F', backdropFilter: 'blur(20px)' }}
    >
      {/* ── Plasma orb spinner ─────────────────────────────────────────────── */}
      <div className="relative w-24 h-24 mb-10">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#7C5CFF',
            borderRightColor: '#FF3DCB',
            animation: 'spin 1.2s linear infinite',
          }}
        />
        {/* Middle ring (opposite) */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            border: '2px solid transparent',
            borderBottomColor: '#4FE3C1',
            borderLeftColor: '#7C5CFF',
            animation: 'spin 1.8s linear infinite reverse',
          }}
        />
        {/* Inner glow core */}
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,92,255,0.6) 0%, rgba(124,92,255,0) 70%)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Cycling phase text ─────────────────────────────────────────────── */}
      <div
        key={phaseIdx}
        className="mb-8 text-center"
        style={{ animation: 'fadeInUp 0.35s ease both' }}
      >
        <p
          className="font-mono text-sm tracking-widest"
          style={{ color: '#7C5CFF', letterSpacing: '0.18em' }}
        >
          {PHASES[phaseIdx].toUpperCase()}
        </p>
      </div>

      {/* ── Plasma progress bar ────────────────────────────────────────────── */}
      <div
        className="rounded-full overflow-hidden"
        style={{ width: 280, height: 3, background: 'rgba(124,92,255,0.15)' }}
      >
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #7C5CFF, #FF3DCB)',
            boxShadow: '0 0 10px rgba(124,92,255,0.8)',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* ── Phase dots ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mt-6">
        {PHASES.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: i <= phaseIdx ? '#7C5CFF' : '#2E3244',
                boxShadow: i <= phaseIdx ? '0 0 6px rgba(124,92,255,0.8)' : 'none',
              }}
            />
            {i < PHASES.length - 1 && <div className="w-6 h-px bg-aura-smoke" />}
          </div>
        ))}
      </div>

      {/* ── Headline ──────────────────────────────────────────────────────── */}
      <p className="mt-8 text-sm text-aura-ink-tertiary tracking-wide" style={{ fontSize: 13 }}>
        Your code is becoming cinema...
      </p>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100% { opacity:0.6; transform:scale(0.9); } 50% { opacity:1; transform:scale(1.1); } }
      `}</style>
    </div>
  );
}
