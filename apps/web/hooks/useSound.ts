'use client';

import { useRef, useEffect } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  };

  const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      vol.gain.setValueAtTime(gain, ctx.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  return {
    variable: () => playTone(440, 0.15, 'sine', 0.25),
    functionCall: () => playTone(220, 0.3, 'sine', 0.3),
    loopTick: () => playTone(880, 0.06, 'square', 0.1),
    errorShatter: () => { playTone(80, 0.4, 'sawtooth', 0.4); playTone(2000, 0.12, 'sine', 0.15); },
    returnPing: () => playTone(1320, 0.2, 'sine', 0.2),
    successChime: () => { playTone(523, 0.15, 'sine', 0.2); setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 150); setTimeout(() => playTone(784, 0.3, 'sine', 0.2), 300); },
    toggle: (on: boolean) => { enabledRef.current = on; },
  };
}
