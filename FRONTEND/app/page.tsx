'use client';

import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing/Hero';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { useEffect } from 'react';

const OceanBackground = dynamic(
  () => import('@/components/OceanBackground').then(m => ({ default: m.OceanBackground })),
  { ssr: false }
);

export default function LandingPage() {
  // Wake up the backend on page load (Render cold start prevention)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      fetch(`${apiUrl}/api/v1/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
  }, []);

  return (
    <>
      <OceanBackground />
      <CustomCursor />
      <main>
        <Hero />
      </main>
    </>
  );
}
