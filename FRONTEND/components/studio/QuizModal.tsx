'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface QuizQuestion {
  question_number: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

interface QuizData {
  questions: QuizQuestion[];
  total_questions: number;
  difficulty: string;
}

interface QuizModalProps {
  code: string;
  language?: string;
  steps?: Array<{ title: string; type: string }>;
  stepCount: number;
  sessionName?: string;
  onClose: () => void;
  onComplete: (score: number) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

function DifficultyBadge({ d }: { d: string }) {
  const colors: Record<string, string> = { easy: '#4FE3C1', medium: '#FFB547', hard: '#FF6B4A' };
  const c = colors[d] ?? '#7C5CFF';
  return (
    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', background: c + '22', color: c, border: `1px solid ${c}44` }}>
      {d?.toUpperCase()}
    </span>
  );
}

export function QuizModal({ code, language, steps, stepCount, sessionName, onClose, onComplete }: QuizModalProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  // Fetch quiz — runs once on mount (deps captured at mount time intentionally)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API}/api/v1/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, steps, stepCount }),
        });
        if (!res.ok) throw new Error('Quiz generation failed');
        const data = await res.json();
        setQuiz(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []); // intentionally empty — fetch once on mount

  // Entrance
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }
    );
  }, [loading]);

  // Score count-up — intentionally only triggers when done flips to true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!done) return;
    const pct = Math.round((score / (quiz?.total_questions ?? 1)) * 100);
    const tween = { val: 0 };
    gsap.to(tween, {
      val: pct, duration: 1.5, ease: 'power2.out',
      onUpdate: () => setScoreDisplay(Math.round(tween.val)),
    });
  }, [done]); // intentionally watching only 'done'

  const handleSelect = (key: string) => {
    if (answered || !quiz) return;
    setSelected(key);
    setAnswered(true);
    if (key === quiz.questions[currentQ].correct_answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQ + 1 >= quiz.total_questions) {
      setDone(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const close = () => {
    if (!cardRef.current) { onClose(); return; }
    gsap.to(cardRef.current, { scale: 0.9, opacity: 0, duration: 0.2, onComplete: onClose });
  };

  const scorePct = quiz ? Math.round((score / quiz.total_questions) * 100) : 0;

  const getPerformance = () => {
    if (scorePct >= 90) return { msg: '🎉 Outstanding! You understood everything!', color: '#4FE3C1' };
    if (scorePct >= 70) return { msg: '🔥 Great work! Strong understanding.', color: '#7C5CFF' };
    if (scorePct >= 50) return { msg: '💪 Good effort. Keep practicing!', color: '#FFB547' };
    return { msg: '📚 Keep watching — understanding takes time.', color: '#FF6B4A' };
  };

  const q = quiz?.questions[currentQ];

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,8,20,0.97)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div ref={cardRef} style={{ width: '100%', maxWidth: 680 }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#EAEAF0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Generating your quiz...</h2>
            <p style={{ color: '#5A5F75' }}>AI is crafting questions based on your code</p>
            <div style={{ width: 40, height: 40, border: '3px solid #7C5CFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '24px auto 0' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', color: '#FF6B4A' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Quiz generation failed</h2>
            <p style={{ color: '#5A5F75', marginBottom: 24 }}>{error}</p>
            <button onClick={close} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'white', fontSize: 14, cursor: 'pointer' }}>Close</button>
          </div>
        )}

        {/* Results */}
        {done && quiz && (() => {
          const perf = getPerformance();
          return (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '40px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 64, fontWeight: 800, color: perf.color, fontVariantNumeric: 'tabular-nums' }}>
                  <span ref={scoreRef}>{scoreDisplay}</span>%
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#EAEAF0', margin: '12px 0 8px' }}>{perf.msg}</div>
                <div style={{ color: '#5A5F75', fontSize: 13 }}>{score}/{quiz.total_questions} correct · {quiz.difficulty} difficulty</div>
              </div>

              {/* Question review */}
              <div style={{ padding: '24px 32px', maxHeight: '40vh', overflowY: 'auto' }}>
                {quiz.questions.map((qs, i) => (
                  <div key={i} style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeft: '3px solid rgba(0,180,216,0.4)' }}>
                    <div style={{ fontSize: 12, color: '#5A5F75', marginBottom: 4 }}>Q{i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#EAEAF0', marginBottom: 6 }}>{qs.question}</div>
                    <div style={{ fontSize: 12, color: '#4FE3C1' }}>✓ {qs.options[qs.correct_answer as keyof typeof qs.options]}</div>
                    <div style={{ fontSize: 11, color: '#5A5F75', marginTop: 4 }}>{qs.explanation}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { onComplete(scorePct); close(); }}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  💾 Save Session with Score
                </button>
                <button
                  onClick={close}
                  style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#EAEAF0', fontSize: 14, cursor: 'pointer' }}
                >
                  Re-watch
                </button>
              </div>
            </div>
          );
        })()}

        {/* Quiz question */}
        {!loading && !error && !done && quiz && q && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#5A5F75', fontSize: 12, fontWeight: 600 }}>{sessionName ?? 'Quiz'}</span>
              <DifficultyBadge d={quiz.difficulty} />
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginLeft: 'auto', maxWidth: 200 }}>
                <div style={{ height: '100%', width: `${((currentQ + 1) / quiz.total_questions) * 100}%`, background: 'linear-gradient(90deg, #7C5CFF, #00b4d8)', borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ color: '#5A5F75', fontSize: 11, whiteSpace: 'nowrap' }}>{currentQ + 1} / {quiz.total_questions}</span>
            </div>

            {/* Question */}
            <div style={{ padding: '36px 36px 24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#EAEAF0', lineHeight: 1.5, margin: 0 }}>{q.question}</h2>
            </div>

            {/* Options */}
            <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {OPTION_KEYS.map(key => {
                const isSelected = selected === key;
                const isCorrect = answered && key === q.correct_answer;
                const isWrong = answered && isSelected && key !== q.correct_answer;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={answered}
                    style={{
                      padding: '16px 20px', textAlign: 'left',
                      background: isCorrect
                        ? 'rgba(0,255,136,0.15)'
                        : isWrong
                        ? 'rgba(255,59,48,0.15)'
                        : isSelected
                        ? 'rgba(0,180,216,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isCorrect ? '#00ff88' : isWrong ? '#ff3b30' : isSelected ? '#00b4d8' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 12, cursor: answered ? 'default' : 'pointer',
                      transition: 'all 0.2s', fontSize: 13, fontWeight: 500,
                      color: '#EAEAF0',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}
                    onMouseEnter={e => {
                      if (!answered) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#00b4d8';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,180,216,0.1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!answered && !isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color: isCorrect ? '#00ff88' : isWrong ? '#ff3b30' : '#EAEAF0' }}>
                      {isCorrect ? '✓' : isWrong ? '✗' : key}
                    </span>
                    <span style={{ lineHeight: 1.5 }}>{q.options[key]}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation + Next */}
            {answered && (
              <div style={{ margin: '0 28px 28px', padding: '14px 18px', background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#00b4d8', letterSpacing: '0.08em', marginBottom: 6 }}>EXPLANATION</div>
                <p style={{ fontSize: 13, color: '#EAEAF0', margin: '0 0 12px', lineHeight: 1.6 }}>{q.explanation}</p>
                <button
                  onClick={handleNext}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7C5CFF, #5B3FFF)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {currentQ + 1 >= quiz.total_questions ? 'See Results →' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
