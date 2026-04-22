'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useExecutionStore } from '@/store/executionStore';
import { askQuestion } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface Message { role: 'user' | 'assistant'; content: string; }

export function AskAIDock() {
  const { askAIOpen, setAskAI } = useUIStore();
  const { currentStep } = useExecutionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const ctx = currentStep
        ? `Step: ${currentStep.title}\nCode: ${currentStep.codeSnippet}\nNarration: ${currentStep.narration}`
        : '';
      const { answer } = await askQuestion(q, ctx);
      setMessages(m => [...m, { role: 'assistant', content: answer }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Unable to reach AI right now. Try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!askAIOpen) {
    return (
      <button
        onClick={() => setAskAI(true)}
        className="fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-400 hover:scale-110"
        style={{ background: 'var(--aura-grad-plasma)', boxShadow: '0 0 30px rgba(124,92,255,0.4)' }}
        title="Ask AI (/)"
      >
        ✦
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-5 z-40 w-[380px] h-[500px] flex flex-col glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-aura-smoke flex-shrink-0">
        <span className="label-caps text-aura-plasma">ASK AI</span>
        {currentStep && (
          <span className="text-caption text-aura-ink-tertiary truncate max-w-[200px]">
            re: {currentStep.title}
          </span>
        )}
        <button onClick={() => setAskAI(false)} className="text-aura-ink-tertiary hover:text-aura-ink-primary ml-2">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="text-3xl">✦</div>
            <p className="text-body text-aura-ink-tertiary">Ask anything about this step.<br />Plain English only.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] px-4 py-3 rounded-xl text-body"
              style={{
                background: m.role === 'user' ? 'rgba(124,92,255,0.2)' : 'rgba(18,21,31,0.8)',
                border: `1px solid ${m.role === 'user' ? 'rgba(124,92,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: m.role === 'user' ? '#EAEAF0' : '#9BA0B3',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 pl-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-aura-plasma animate-bounce" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-aura-smoke flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask about this step..."
          className="flex-1 bg-aura-graphite border border-aura-smoke rounded-xl px-4 py-2 text-body text-aura-ink-primary placeholder-aura-ink-ghost outline-none focus:border-aura-plasma transition-colors"
        />
        <Button variant="plasma" size="sm" onClick={sendMessage} loading={loading}>✦</Button>
      </div>
    </div>
  );
}
