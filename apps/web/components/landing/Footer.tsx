'use client';
import { useRouter } from 'next/navigation';

export function Footer() {
  return (
    <footer className="border-t border-aura-smoke py-12 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { title: 'PRODUCT', links: ['Studio', 'Demo', 'Diff Mode', 'API'] },
          { title: 'EXPLORE', links: ['JavaScript', 'Python', 'Rust', 'All Languages'] },
          { title: 'COMPANY', links: ['About', 'Blog', 'Careers', 'Press'] },
          { title: 'LEGAL', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
        ].map((col) => (
          <div key={col.title}>
            <div className="label-caps mb-4">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-body text-aura-ink-tertiary hover:text-aura-ink-secondary transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-aura-smoke flex items-center justify-between flex-wrap gap-4">
        <span className="font-serif italic text-aura-plasma text-lg">CODEAURA</span>
        <span className="label-caps text-aura-ink-tertiary">© 2026 — YOUR CODE IS A FILM</span>
      </div>
    </footer>
  );
}
