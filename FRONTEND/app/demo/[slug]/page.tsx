import { DemoStudio } from '@/components/studio/DemoStudio';
import type { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function getDemo(slug: string) {
  try {
    const res = await fetch(`${API}/api/v1/demos/${slug}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const demo = await getDemo(params.slug);
  return {
    title: demo ? `${demo.title} — CODEAURA` : 'Demo — CODEAURA',
    description: demo?.description ?? 'Watch code become 3D cinema with CODEAURA.',
  };
}

// Always render — never 404, show skeleton if API is unreachable
export default async function DemoPage({ params }: { params: { slug: string } }) {
  const demo = await getDemo(params.slug);
  return <DemoStudio demo={demo} />;
}

export const dynamicParams = true;
