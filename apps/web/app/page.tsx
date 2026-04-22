import { Hero } from '@/components/landing/Hero';
import { CustomCursor } from '@/components/layout/CustomCursor';

export default function LandingPage() {
  return (
    <>
      <CustomCursor />
      <main>
        <Hero />
      </main>
    </>
  );
}
