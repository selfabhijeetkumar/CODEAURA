'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface ScramblerProps {
  text: string;
  trigger?: boolean;
  className?: string;
  speed?: number;
}

const CHARS = '{}[]()<>/*#@!?$%^&_+=|\\~`';

export function Scrambler({ text, trigger = true, className = '', speed = 30 }: ScramblerProps) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<NodeJS.Timeout | null>(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    iterRef.current = 0;

    const interval = setInterval(() => {
      iterRef.current += 1;
      setDisplay(
        text
          .split('')
          .map((char, idx) => {
            if (idx < iterRef.current) return char;
            if (char === ' ') return ' ';
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      if (iterRef.current >= text.length) clearInterval(interval);
    }, speed);

    frameRef.current = interval;
    return () => clearInterval(interval);
  }, [text, trigger, speed]);

  return <span className={className}>{display}</span>;
}
