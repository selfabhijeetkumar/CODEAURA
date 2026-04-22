'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-aura-smoke py-12 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
        {/* PRODUCT */}
        <div>
          <div className="label-caps mb-4">PRODUCT</div>
          <ul className="space-y-2">
            <li>
              <Link href="/studio" className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300">
                Studio
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/selfabhijeetkumar/CODEAURA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>

        {/* BUILT WITH */}
        <div>
          <div className="label-caps mb-4">BUILT WITH</div>
          <ul className="space-y-2">
            <li>
              <a
                href="https://ai.google.dev/gemini-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300"
              >
                Gemini AI
              </a>
            </li>
            <li>
              <a
                href="https://threejs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300"
              >
                Three.js
              </a>
            </li>
            <li>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300"
              >
                Supabase
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-aura-smoke flex items-center justify-between flex-wrap gap-4">
        <span className="font-serif italic text-aura-plasma text-lg">CODEAURA</span>
        <span className="label-caps text-aura-ink-tertiary">© 2026 — YOUR CODE IS A FILM</span>
      </div>
    </footer>
  );
}
