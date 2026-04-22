'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { getAllSessions, deleteSession, isSupabaseAvailable } from '@/lib/supabase';

type Session = {
  id: string;
  session_name: string;
  code: string;
  language: string;
  quality_score: number;
  quiz_score: number;
  bug_count: number;
  created_at: string;
  steps: unknown[] | null;
};

function getLangColor(lang: string) {
  const m: Record<string, string> = {
    javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
    rust: '#CE422B', go: '#00ADD8', java: '#B07219', c: '#555555',
    cpp: '#F34B7D', swift: '#F05138', kotlin: '#A97BFF',
  };
  return m[lang?.toLowerCase()] ?? '#5A5F75';
}

function getScoreColor(score: number) {
  if (score >= 90) return '#4FE3C1';
  if (score >= 75) return '#7C5CFF';
  if (score >= 60) return '#FFB547';
  if (score >= 40) return '#FF6B4A';
  return '#FF2D55';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbAvailable, setDbAvailable] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseAvailable()) {
      setDbAvailable(false);
      setLoading(false);
      return;
    }
    getAllSessions()
      .then(data => { setSessions(data as Session[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!loading && sessions.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.session-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [loading, sessions]);

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  };

  const handleRerun = (s: Session) => {
    const encoded = encodeURIComponent(s.code);
    router.push(`/studio?code=${encoded}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000814', color: '#EAEAF0', padding: '0' }}>
      {/* Header */}
      <div style={{
        padding: '32px 40px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,8,20,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00b4d8', fontFamily: 'serif', fontStyle: 'italic', fontSize: 20, cursor: 'pointer' }}>
            CODEAURA
          </button>
          <span style={{ color: '#2A2D3E' }}>›</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#EAEAF0', margin: 0 }}>Dashboard</h1>
        </div>
        <button
          onClick={() => router.push('/studio')}
          style={{
            padding: '10px 20px', background: 'linear-gradient(135deg, #7C5CFF, #FF3DCB)',
            border: 'none', borderRadius: 10, color: 'white', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          + New Analysis
        </button>
      </div>

      <div style={{ padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Your Sessions</h2>
          <p style={{ color: '#5A5F75', fontSize: 14, margin: 0 }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* No DB banner */}
        {!dbAvailable && (
          <div style={{
            textAlign: 'center', padding: '60px 40px',
            background: 'rgba(255,180,71,0.06)',
            border: '1px solid rgba(255,180,71,0.25)',
            borderRadius: 16, maxWidth: 520, margin: '0 auto 40px',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗄️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFB547', marginBottom: 8 }}>Database not configured</h3>
            <p style={{ color: '#5A5F75', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              Add <code style={{ color: '#FFB547' }}>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code style={{ color: '#FFB547' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
              to your Vercel environment variables to enable session history.
            </p>
            <button
              onClick={() => router.push('/studio')}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Continue to Studio →
            </button>
          </div>
        )}

        {dbAvailable && loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#5A5F75' }}>
            <div style={{ width: 32, height: 32, border: '2px solid #00b4d8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Loading sessions...
          </div>
        )}

        {dbAvailable && error && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#FF6B4A' }}>
            Error loading sessions: {error}
          </div>
        )}

        {dbAvailable && !loading && !error && sessions.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, maxWidth: 500, margin: '0 auto',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No sessions yet</h3>
            <p style={{ color: '#5A5F75', marginBottom: 24, fontSize: 14 }}>
              Analyze some code and save your first session!
            </p>
            <button
              onClick={() => router.push('/studio')}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                border: 'none', borderRadius: 10, color: 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Analyze some code →
            </button>
          </div>
        )}

        {dbAvailable && !loading && sessions.length > 0 && (
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {sessions.map(s => {
              const langColor = getLangColor(s.language);
              const scoreColor = getScoreColor(s.quality_score);
              const stepCount = Array.isArray(s.steps) ? s.steps.length : 0;
              return (
                <div
                  key={s.id}
                  className="session-card"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, padding: 24, opacity: 0,
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,180,216,0.3)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#EAEAF0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.session_name}
                      </h3>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 11,
                          fontWeight: 600, letterSpacing: '0.05em',
                          background: langColor + '22', color: langColor,
                          border: `1px solid ${langColor}44`,
                        }}>
                          {s.language?.toUpperCase() ?? 'CODE'}
                        </span>
                        <span style={{ color: '#5A5F75', fontSize: 11, alignSelf: 'center' }}>
                          {formatDate(s.created_at)}
                        </span>
                      </div>
                    </div>
                    {/* Quality circle */}
                    <div style={{ flexShrink: 0, marginLeft: 12 }}>
                      <svg width={52} height={52} viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle
                          cx="26" cy="26" r="22" fill="none"
                          stroke={scoreColor} strokeWidth="3"
                          strokeDasharray={`${(s.quality_score / 100) * 138.2} 138.2`}
                          strokeDashoffset={34.6} strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 4px ${scoreColor})` }}
                        />
                        <text x="26" y="30" textAnchor="middle" fill={scoreColor} fontSize="12" fontWeight="700">
                          {s.quality_score}
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.1em', marginBottom: 2 }}>STEPS</div>
                      <div style={{ color: '#EAEAF0', fontSize: 16, fontWeight: 700 }}>{stepCount}</div>
                    </div>
                    <div>
                      <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.1em', marginBottom: 2 }}>BUGS</div>
                      <div style={{ color: s.bug_count > 0 ? '#FF6B4A' : '#4FE3C1', fontSize: 16, fontWeight: 700 }}>{s.bug_count}</div>
                    </div>
                    {s.quiz_score > 0 && (
                      <div>
                        <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.1em', marginBottom: 2 }}>QUIZ</div>
                        <div style={{ color: '#7C5CFF', fontSize: 16, fontWeight: 700 }}>{s.quiz_score}%</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleRerun(s)}
                      style={{
                        flex: 1, padding: '9px 0',
                        background: 'rgba(0,180,216,0.1)',
                        border: '1px solid rgba(0,180,216,0.3)',
                        borderRadius: 8, color: '#00b4d8',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,180,216,0.2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,180,216,0.1)'}
                    >
                      Re-run →
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        padding: '9px 14px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, color: '#5A5F75',
                        fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF6B4A'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,74,0.4)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5A5F75'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
