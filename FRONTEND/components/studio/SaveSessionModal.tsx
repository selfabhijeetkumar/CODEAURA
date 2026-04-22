'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { saveSessionToDb, upsertLeaderboard } from '@/lib/supabase';

interface SaveSessionModalProps {
  code: string;
  language?: string;
  steps?: unknown[];
  qualityScore?: number;
  bugCount?: number;
  quizScore?: number;
  onClose: () => void;
  onSaved?: (sessionId: string, sessionName: string) => void;
}

export function SaveSessionModal({
  code, language, steps, qualityScore = 0, bugCount = 0, quizScore = 0,
  onClose, onSaved,
}: SaveSessionModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { scale: 0.85, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }, []);

  const close = () => {
    if (!cardRef.current) { onClose(); return; }
    gsap.to(cardRef.current, {
      scale: 0.9, opacity: 0, y: 20, duration: 0.2, ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const row = await saveSessionToDb({
        session_name: name.trim(),
        code,
        language: language ?? 'unknown',
        steps: steps as unknown,
        quality_score: qualityScore,
        quiz_score: quizScore,
        bug_count: bugCount,
      });

      // Upsert leaderboard with a guest user
      const userId = localStorage.getItem('ca_user_id') ?? (() => {
        const id = `guest_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('ca_user_id', id);
        return id;
      })();
      const username = localStorage.getItem('ca_username') ?? 'Anonymous Coder';
      await upsertLeaderboard({ user_id: userId, username, quality_score: qualityScore, bug_count: bugCount });

      // Toast
      setToast(true);
      if (toastRef.current) {
        gsap.fromTo(toastRef.current,
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
        setTimeout(() => {
          if (toastRef.current) gsap.to(toastRef.current, { x: 100, opacity: 0, duration: 0.3, onComplete: () => setToast(false) });
        }, 3000);
      }
      onSaved?.(row.id, name.trim());
      setTimeout(close, 3500);
    } catch (err: any) {
      console.error('Save session error:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Card */}
        <div
          ref={cardRef}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,180,216,0.3)',
            borderRadius: 16,
            padding: 40,
            width: 440,
            maxWidth: '90vw',
          }}
        >
          <h2 style={{ color: '#EAEAF0', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            💾 Name this session
          </h2>
          <p style={{ color: '#5A5F75', fontSize: 13, marginBottom: 24 }}>
            Save your analysis to revisit or compare later.
          </p>

          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Fibonacci Recursion, Bubble Sort..."
            style={{
              width: '100%', padding: '12px 16px',
              background: 'rgba(10,12,20,0.8)',
              border: '1px solid rgba(0,180,216,0.3)',
              borderRadius: 10, color: '#EAEAF0', fontSize: 14,
              outline: 'none', boxSizing: 'border-box', marginBottom: 24,
            }}
          />

          {/* Stats preview */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Quality', value: `${qualityScore}/100` },
              { label: 'Steps', value: `${steps?.length ?? 0}` },
              { label: 'Bugs', value: `${bugCount}` },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(0,180,216,0.08)',
                border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8,
                padding: '8px 12px', textAlign: 'center',
              }}>
                <div style={{ color: '#00b4d8', fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.1em', marginTop: 2 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              style={{
                flex: 1, padding: '12px 0',
                background: name.trim() ? 'linear-gradient(135deg, #0077b6, #00b4d8)' : 'rgba(0,180,216,0.2)',
                border: 'none', borderRadius: 10, color: 'white',
                fontSize: 14, fontWeight: 600, cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
                opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Session'}
            </button>
            <button
              onClick={close}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, color: '#5A5F75',
                fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          ref={toastRef}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 300,
            background: 'rgba(0,180,216,0.15)',
            border: '1px solid rgba(0,180,216,0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: 12, padding: '14px 22px',
            color: '#00b4d8', fontWeight: 600, fontSize: 14,
            boxShadow: '0 4px 24px rgba(0,180,216,0.3)',
          }}
        >
          ✓ Session saved!
        </div>
      )}
    </>
  );
}
