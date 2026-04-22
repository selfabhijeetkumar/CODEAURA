'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  const router = useRouter();
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-8 py-24 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(124,92,255,0.08) 0%, transparent 70%)' }} />

      <div className="label-caps text-aura-ink-tertiary mb-6">04 — BEGIN</div>
      <h2 className="font-serif text-display text-aura-ink-pure max-w-3xl leading-tight">
        Your code is waiting<br />for its{' '}
        <em className="text-plasma text-glow-plasma italic">closeup.</em>
      </h2>
      <p className="mt-6 text-body-lg text-aura-ink-secondary max-w-md">
        Free to start. Every language ever written. Powered by Gemini AI.
      </p>
      <div className="mt-10">
        <Button variant="plasma" size="lg" magnetic onClick={() => router.push('/studio')}>
          Open the Studio →
        </Button>
      </div>
    </section>
  );
}
