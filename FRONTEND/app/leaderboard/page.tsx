'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { getLeaderboard } from '@/lib/supabase';

type LeaderboardEntry = {
  id: string;
  user_id: string;
  username: string;
  total_sessions: number;
  average_score: number;
  best_score: number;
  total_bugs_found: number;
  last_active: string;
  rank_badge: string;
};

function getRankBadge(rank: number): string {
  if (rank === 1) return '👑 Code God';
  if (rank <= 5) return '🔥 Elite Coder';
  if (rank <= 10) return '⚡ Rising Dev';
  if (rank <= 25) return '💻 Active Coder';
  return '🌱 Getting Started';
}

function getRankGlow(rank: number) {
  if (rank === 1) return '0 0 20px rgba(255,215,0,0.4)';
  if (rank === 2) return '0 0 16px rgba(192,192,192,0.3)';
  if (rank === 3) return '0 0 16px rgba(205,127,50,0.3)';
  return 'none';
}

function getRankColor(rank: number) {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return '#5A5F75';
}

type Filter = 'all' | 'week' | 'today';

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const myUserId = typeof window !== 'undefined' ? localStorage.getItem('ca_user_id') : null;

  useEffect(() => {
    getLeaderboard()
      .then(data => {
        // Update rank badges based on position
        const withBadges = (data as LeaderboardEntry[]).map((e, i) => ({
          ...e,
          rank_badge: getRankBadge(i + 1),
        }));
        setEntries(withBadges);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('.lb-row');
      gsap.fromTo(rows,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [loading, filter]);

  const now = Date.now();
  const filtered = entries.filter(e => {
    if (filter === 'all') return true;
    const last = new Date(e.last_active).getTime();
    if (filter === 'week') return now - last < 7 * 24 * 60 * 60 * 1000;
    if (filter === 'today') return now - last < 24 * 60 * 60 * 1000;
    return true;
  });

  const myRank = entries.findIndex(e => e.user_id === myUserId) + 1;
  const myEntry = entries.find(e => e.user_id === myUserId);
  const nextEntry = myRank > 1 ? entries[myRank - 2] : null;
  const pointsToNext = nextEntry ? Math.round(nextEntry.average_score - (myEntry?.average_score ?? 0)) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#000814', color: '#EAEAF0' }}>
      {/* Nav */}
      <div style={{
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,8,20,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00b4d8', fontFamily: 'serif', fontStyle: 'italic', fontSize: 20, cursor: 'pointer' }}>
          CODEAURA
        </button>
        <span style={{ color: '#2A2D3E' }}>›</span>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Leaderboard</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/studio')} style={{ padding: '8px 16px', background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)', borderRadius: 8, color: '#7C5CFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Studio</button>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 8, color: '#00b4d8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Dashboard</button>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
        {/* My Rank Card */}
        {myEntry && (
          <div style={{
            background: 'rgba(0,180,216,0.06)',
            border: '1px solid rgba(0,180,216,0.3)',
            borderRadius: 16, padding: '24px 32px',
            marginBottom: 32,
            boxShadow: '0 0 40px rgba(0,180,216,0.1)',
            display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ color: '#00b4d8', fontSize: 11, letterSpacing: '0.1em', marginBottom: 4 }}>YOUR RANK</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#EAEAF0', lineHeight: 1 }}>#{myRank}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{myEntry.username}</div>
              <div style={{ color: '#5A5F75', fontSize: 13 }}>{myEntry.rank_badge}</div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#00b4d8', fontSize: 22, fontWeight: 700 }}>{myEntry.average_score.toFixed(1)}</div>
                <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.08em' }}>AVG SCORE</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#7C5CFF', fontSize: 22, fontWeight: 700 }}>{myEntry.best_score}</div>
                <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.08em' }}>BEST SCORE</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#4FE3C1', fontSize: 22, fontWeight: 700 }}>{myEntry.total_sessions}</div>
                <div style={{ color: '#5A5F75', fontSize: 10, letterSpacing: '0.08em' }}>SESSIONS</div>
              </div>
            </div>
            {nextEntry && myRank > 1 && (
              <div style={{
                background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)',
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div style={{ color: '#7C5CFF', fontSize: 12, fontWeight: 600 }}>
                  {pointsToNext > 0 ? `+${pointsToNext} pts to #{myRank - 1}` : 'You\'re in the lead!'}
                </div>
                <div style={{ color: '#5A5F75', fontSize: 11, marginTop: 4 }}>Keep coding to climb 🚀</div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['all', 'week', 'today'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f ? 'rgba(0,180,216,0.2)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(0,180,216,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: filter === f ? '#00b4d8' : '#5A5F75',
              }}
            >
              {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'Today'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#5A5F75', fontSize: 13, alignSelf: 'center' }}>
            {filtered.length} coder{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#5A5F75' }}>Loading rankings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3 style={{ color: '#EAEAF0', marginBottom: 8 }}>No coders ranked yet</h3>
            <p style={{ color: '#5A5F75', fontSize: 14 }}>Be the first! Save a session to appear here.</p>
          </div>
        ) : (
          <div ref={tableRef}>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 100px 100px 100px 100px',
              gap: 12, padding: '10px 20px',
              color: '#5A5F75', fontSize: 10, letterSpacing: '0.1em',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 8,
            }}>
              <div>RANK</div>
              <div>CODER</div>
              <div style={{ textAlign: 'center' }}>SESSIONS</div>
              <div style={{ textAlign: 'center' }}>AVG SCORE</div>
              <div style={{ textAlign: 'center' }}>BEST</div>
              <div style={{ textAlign: 'center' }}>BUGS FOUND</div>
            </div>

            {filtered.map((entry, i) => {
              const rank = i + 1;
              const rankColor = getRankColor(rank);
              const glow = getRankGlow(rank);
              const isMe = entry.user_id === myUserId;

              return (
                <div
                  key={entry.id}
                  className="lb-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px 100px 100px 100px',
                    gap: 12,
                    padding: '14px 20px',
                    borderRadius: 12,
                    marginBottom: 4,
                    opacity: 0,
                    background: isMe
                      ? 'rgba(0,180,216,0.06)'
                      : rank <= 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    border: isMe
                      ? '1px solid rgba(0,180,216,0.25)'
                      : rank <= 3 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                    boxShadow: glow,
                    transition: 'background 0.2s',
                    cursor: 'default',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isMe) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,180,216,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!isMe) (e.currentTarget as HTMLDivElement).style.background = rank <= 3 ? 'rgba(255,255,255,0.02)' : 'transparent';
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: rank === 1 ? 20 : 16,
                    fontWeight: 800,
                    color: rankColor,
                    textShadow: glow !== 'none' ? `0 0 10px ${rankColor}` : 'none',
                  }}>
                    #{rank}
                  </div>

                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `linear-gradient(135deg, #0077b6, #00b4d8)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#EAEAF0' }}>
                        {entry.username} {isMe && <span style={{ color: '#00b4d8', fontSize: 11 }}>(you)</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#5A5F75' }}>{entry.rank_badge}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'center', color: '#EAEAF0', fontSize: 14, fontWeight: 600 }}>{entry.total_sessions}</div>
                  <div style={{ textAlign: 'center', color: '#00b4d8', fontSize: 14, fontWeight: 700 }}>{entry.average_score.toFixed(1)}</div>
                  <div style={{ textAlign: 'center', color: '#7C5CFF', fontSize: 14, fontWeight: 700 }}>{entry.best_score}</div>
                  <div style={{ textAlign: 'center', color: '#4FE3C1', fontSize: 14, fontWeight: 600 }}>{entry.total_bugs_found}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
