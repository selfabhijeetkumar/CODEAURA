'use client';

import { forwardRef, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'plasma' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'plasma', size = 'md', magnetic = false, loading = false, className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLButtonElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLButtonElement>) || innerRef;

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic) return;
      const btn = resolvedRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      if (!magnetic) return;
      gsap.to(resolvedRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    };

    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-7 py-3 text-sm', lg: 'px-9 py-4 text-body-lg' };
    const variants = {
      plasma: 'btn-plasma',
      ghost: 'bg-transparent text-aura-ink-secondary hover:text-aura-ink-primary border border-transparent hover:border-aura-smoke transition-all duration-400',
      glass: 'glass-panel hover:border-white/12 text-aura-ink-primary',
    };

    return (
      <button
        ref={resolvedRef}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-xl font-sans font-medium transition-all duration-400 ease-aura select-none disabled:opacity-40 disabled:pointer-events-none',
          sizes[size],
          variants[variant],
          loading && 'pointer-events-none',
          className
        )}
        data-magnetic={magnetic ? 'true' : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading ? (
          <span className="flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-aura-plasma animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-aura-plasma animate-bounce" style={{ animationDelay: '80ms' }} />
            <span className="w-1 h-1 rounded-full bg-aura-plasma animate-bounce" style={{ animationDelay: '160ms' }} />
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
