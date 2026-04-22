'use client';

import { useState } from 'react';

interface QualityScoreOrbProps {
  score: number;
  breakdown: { readability: number; performance: number; correctness: number; idiomaticity: number };
}

function getScoreColor(score: number) {
  if (score >= 90) return '#4FE3C1';
  if (score >= 75) return '#7C5CFF';
  if (score >= 60) return '#FFB547';
  if (score >= 40) return '#FF6B4A';
  return '#FF2D55';
}

const TIPS: Record<string, string> = {
  correctness:   'Add input validation and error handling',
  performance:   'Consider algorithmic improvements (e.g. memoization)',
  readability:   'Add comments explaining logic; use descriptive variable names',
  idiomaticity:  'Use language-standard patterns and conventions',
};

const METRIC_ORDER = ['correctness', 'performance', 'readability', 'idiomaticity'] as const;

export function QualityScoreOrb({ score, breakdown }: QualityScoreOrbProps) {
  const [open, setOpen]             = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const color = getScoreColor(score);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative">
      {/* ── Score orb ─────────────────────────────────────────────────────────── */}
      <div
        className="cursor-pointer relative"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
          <circle cx="40" cy="40" r={radius} fill="rgba(18,21,31,0.85)" stroke="#1C2030" strokeWidth="2" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x="40" y="44" textAnchor="middle" fill={color} fontSize="18" fontFamily="Geist" fontWeight="600">
            {score}
          </text>
          <text x="40" y="56" textAnchor="middle" fill="#5A5F75" fontSize="9" fontFamily="Geist" letterSpacing="2">
            QUALITY
          </text>
        </svg>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute right-0 top-full mt-1 z-50 text-[11px] text-aura-ink-secondary rounded-lg px-3 py-2 whitespace-nowrap"
            style={{ background: 'rgba(12,14,22,0.95)', border: '1px solid #2A2D3E', maxWidth: 280, whiteSpace: 'normal' }}
          >
            Score = average of 4 metrics. Fix the bugs shown below to increase correctness.
          </div>
        )}
      </div>

      {/* ── Breakdown popup ───────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,12,20,0.97)', border: '1px solid #2A2D3E', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          <div className="px-4 pt-4 pb-1">
            <p className="label-caps text-aura-ink-tertiary mb-3" style={{ fontSize: 10, letterSpacing: '0.12em' }}>
              QUALITY BREAKDOWN
            </p>
          </div>

          {METRIC_ORDER.map((key) => {
            const val = breakdown[key];
            const metricColor = getScoreColor(val);
            const tip = val < 80 ? TIPS[key] : null;
            return (
              <div key={key} className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="label-caps text-aura-ink-tertiary" style={{ fontSize: 10 }}>
                    {key.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono font-semibold" style={{ color: metricColor }}>
                    {val}
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-1.5 bg-aura-smoke rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${val}%`, background: metricColor, boxShadow: `0 0 6px ${metricColor}` }}
                  />
                </div>

                {/* Improvement tip */}
                {tip && (
                  <p className="text-[10px] italic mt-0.5 leading-snug" style={{ color: '#FFB347' }}>
                    💡 {tip}
                  </p>
                )}
              </div>
            );
          })}

          <div className="px-4 pb-4 pt-1 border-t border-aura-smoke">
            <p className="text-[10px] text-aura-ink-tertiary italic">
              HOW TO IMPROVE: Address each metric below 80 using the tips above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
