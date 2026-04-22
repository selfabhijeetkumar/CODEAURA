'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useExecutionStore } from '@/store/executionStore';
import { usePlaybackStore } from '@/store/playbackStore';
import { Button } from '@/components/ui/Button';
import { Scrambler } from '@/components/ui/Scrambler';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const SHORTCUTS = [
  { key: 'Space', label: 'Play/Pause' },
  { key: '←→', label: 'Step' },
  { key: '⌘K', label: 'Commands' },
  { key: '/', label: 'Ask AI' },
  { key: 'E', label: 'Toggle Editor' },
  { key: 'F', label: 'Fullscreen' },
];

export function TopNav() {
  const router = useRouter();
  const { toggleEditor, editorVisible } = useUIStore();
  const { script, sessionId } = useExecutionStore();
  const { isPlaying } = usePlaybackStore();

  const [toast, setToast] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleShare = async () => {
    if (!script || sharing) return;
    setSharing(true);
    try {
      let sid = sessionId;

      // If no sessionId yet, save the session first
      if (!sid) {
        const res = await fetch(`${API}/api/v1/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script }),
        });
        const data = await res.json();
        sid = data?.id ?? data?.sessionId ?? null;
      }

      if (sid) {
        const url = `${window.location.origin}/studio?session=${sid}`;
        await navigator.clipboard.writeText(url);
        showToast('Link copied! Share your visualization 🔗');
      } else {
        // Fallback: copy the current URL
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied! 🔗');
      }
    } catch {
      showToast('Could not copy link — try again');
    } finally {
      setSharing(false);
    }
  };

  return (
    <nav className="h-12 flex items-center justify-between px-5 border-b border-aura-smoke bg-black/60 backdrop-blur-[20px] z-30 flex-shrink-0 relative">
      {/* Logo */}
      <button onClick={() => router.push('/')} className="font-serif italic text-lg text-aura-plasma hover:text-aura-plasma-glow transition-colors duration-300">
        CODEAURA
      </button>

      {/* Script info */}
      {script && (
        <div className="flex items-center gap-3">
          <span className="label-caps text-aura-ink-tertiary">{script.language.toUpperCase()}</span>
          <span className="text-aura-smoke">|</span>
          <span className="label-caps text-aura-ink-tertiary">{script.steps.length} STEPS</span>
          {isPlaying && (
            <span className="flex items-center gap-1 label-caps text-aura-aurora">
              <span className="w-1.5 h-1.5 rounded-full bg-aura-aurora animate-pulse" />
              PLAYING
            </span>
          )}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Keyboard hint chips */}
        <div className="hidden lg:flex items-center gap-2 mr-3">
          {SHORTCUTS.map(s => (
            <kbd key={s.key} className="px-2 py-0.5 rounded text-[10px] font-mono bg-aura-graphite text-aura-ink-tertiary border border-aura-smoke">
              {s.key}
            </kbd>
          ))}
        </div>

        {/* Share button — only when a script is loaded */}
        {script && (
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              height: 30,
              padding: '0 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#EAEAF0',
              fontSize: 12,
              fontWeight: 500,
              cursor: sharing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: sharing ? 0.6 : 1,
              transition: 'border-color 0.2s, background 0.2s',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,92,255,0.6)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,92,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            title="Copy shareable link"
          >
            {sharing ? '⏳' : '🔗'} Share
          </button>
        )}

        <Button variant="ghost" size="sm" onClick={toggleEditor}>
          {editorVisible ? '⟵ Editor' : 'Editor ⟶'}
        </Button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 16,
            zIndex: 100,
            background: 'rgba(10,12,20,0.96)',
            border: '1px solid rgba(124,92,255,0.4)',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            color: '#EAEAF0',
            boxShadow: '0 4px 24px rgba(124,92,255,0.3)',
            animation: 'fadeInUp 0.3s ease both',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </nav>
  );
}
