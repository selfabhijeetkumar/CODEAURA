'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { saveNote } from '@/lib/supabase';

interface NoteEditorProps {
  stepNumber: number;
  aiExplanation?: string;
  sessionId?: string;
  existingNote?: string;
  onClose: () => void;
  onSaved: (stepNumber: number, note: string) => void;
}

export function NoteEditor({ stepNumber, aiExplanation, sessionId, existingNote, onClose, onSaved }: NoteEditorProps) {
  const [text, setText] = useState(existingNote ?? '');
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const MAX = 500;

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current, { x: 320 }, { x: 0, duration: 0.4, ease: 'power2.out' });
  }, []);

  const close = () => {
    if (!panelRef.current) { onClose(); return; }
    gsap.to(panelRef.current, { x: 320, duration: 0.3, ease: 'power2.in', onComplete: onClose });
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await saveNote({
        session_id: sessionId,
        step_number: stepNumber,
        ai_explanation: aiExplanation,
        user_note: text.trim(),
      });
      onSaved(stepNumber, text.trim());
      close();
    } catch (err: any) {
      console.error('Save note error:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed', top: 0, right: 0,
        width: 320, height: '100vh',
        background: 'rgba(0,8,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(0,180,216,0.2)',
        zIndex: 150, display: 'flex', flexDirection: 'column',
        transform: 'translateX(320px)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#EAEAF0' }}>
          📝 Note for Step {stepNumber}
        </h3>
        <button
          onClick={close}
          style={{ background: 'none', border: 'none', color: '#5A5F75', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* AI Explanation */}
      {aiExplanation && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#5A5F75', marginBottom: 8 }}>AI EXPLANATION</div>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>{aiExplanation}</p>
        </div>
      )}

      {/* Textarea */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#5A5F75' }}>YOUR UNDERSTANDING</div>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          placeholder="Write what you understood here... What does this step do? Why does it matter?"
          style={{
            flex: 1, resize: 'none', width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,180,216,0.3)',
            borderRadius: 10, padding: 14,
            color: '#EAEAF0', fontSize: 13, lineHeight: 1.6,
            outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: text.length >= MAX * 0.9 ? '#FF6B4A' : '#5A5F75' }}>
          {text.length}/{MAX}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          style={{
            flex: 1, padding: '11px 0',
            background: text.trim() ? 'linear-gradient(135deg, #0077b6, #00b4d8)' : 'rgba(0,180,216,0.15)',
            border: 'none', borderRadius: 8,
            color: 'white', fontSize: 13, fontWeight: 600,
            cursor: text.trim() && !saving ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
        <button
          onClick={close}
          style={{
            padding: '11px 16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: '#5A5F75', fontSize: 13, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
