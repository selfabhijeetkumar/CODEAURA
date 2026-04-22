import { GlassPanel } from '@/components/ui/GlassPanel';

const STEPS = [
  { num: '01', title: 'Paste', body: 'Drop any code in any language. Or upload a file, drag a folder, or import directly from a GitHub URL.' },
  { num: '02', title: 'Analyze', body: 'Gemini AI parses every execution step, detects bugs, scores quality, and composes the 3D scene plan.' },
  { num: '03', title: 'Witness', body: 'Your code becomes cinema. Pin the timeline, ask questions, explore every step in narrated 3D.' },
];

export function HowItWorks() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-8 py-24">
      <div className="label-caps text-aura-ink-tertiary text-center mb-4">03 — HOW IT WORKS</div>
      <h2 className="font-serif text-display text-aura-ink-pure text-center mb-16">
        Three steps to<br /><em className="text-plasma">understanding.</em>
      </h2>

      <div className="relative flex flex-col md:flex-row gap-8 max-w-5xl w-full">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-gradient-to-r from-aura-smoke via-aura-plasma to-aura-smoke -translate-y-1/2 z-0" />

        {STEPS.map((step, i) => (
          <GlassPanel
            key={step.num}
            className="relative z-10 flex-1 p-8 flex flex-col gap-4"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="font-serif italic text-[56px] leading-none text-plasma opacity-80">{step.num}</div>
            <h3 className="font-sans text-heading text-aura-ink-pure">{step.title}</h3>
            <p className="text-body text-aura-ink-secondary">{step.body}</p>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
