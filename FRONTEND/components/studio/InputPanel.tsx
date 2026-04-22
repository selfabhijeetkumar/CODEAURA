'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useExecutionStore } from '@/store/executionStore';
import { analyzeCode } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { toast } from 'sonner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false, loading: () => (
  <div className="flex-1 bg-aura-void animate-pulse" />
) });

const TABS = ['PASTE', 'FILE', 'GITHUB'] as const;
type Tab = typeof TABS[number];

// ── Demo presets ───────────────────────────────────────────────────────────
const DEMOS = [
  {
    label: 'Fibonacci',
    language: 'javascript',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(8));`,
  },
  {
    label: 'Bubble Sort',
    language: 'python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90, 1, 45, 7]
print(bubble_sort(numbers))`,
  },
  {
    label: 'Binary Search',
    language: 'c',
    code: `#include <stdio.h>

int binary_search(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int n = 10;
    int result = binary_search(arr, n, 23);
    printf("Found at index: %d\\n", result);
    return 0;
}`,
  },
] as const;

const PLACEHOLDER = `// Paste any code here — 26+ languages supported
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(8));`;

export function InputPanel() {
  const [tab, setTab] = useState<Tab>('PASTE');
  const [code, setCode] = useState(PLACEHOLDER);
  const [filename, setFilename] = useState<string | undefined>();
  const [githubUrl, setGithubUrl] = useState('');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { setScript, setAnalyzing, isAnalyzing } = useExecutionStore();

  const handleAnalyze = async (overrideCode?: string) => {
    const src = overrideCode ?? code;
    if (!src.trim()) { toast.error('Paste some code first!'); return; }
    try {
      setAnalyzing(true, 'PARSING');
      const STATUSES = ['PARSING', 'MAPPING FLOW', 'DETECTING PATTERNS', 'COMPOSING SCENE', 'RENDERING NARRATION'];
      let i = 0;
      const ticker = setInterval(() => { i = (i + 1) % STATUSES.length; setAnalyzing(true, STATUSES[i]); }, 800);
      const { script, sessionId } = await analyzeCode(src, filename);
      clearInterval(ticker);
      setScript(script, sessionId);
      toast.success('Code analyzed — 3D cinema ready!');
    } catch (err: any) {
      setAnalyzing(false);
      toast.error(err.message ?? 'Analysis failed');
    }
  };

  const handleDemo = (demo: typeof DEMOS[number]) => {
    setCode(demo.code);
    setActiveDemo(demo.label);
    setTab('PASTE');
    // Auto-analyze after a tick so the editor state settles
    setTimeout(() => handleAnalyze(demo.code), 100);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { setCode(ev.target?.result as string); setTab('PASTE'); };
    reader.readAsText(file);
  };

  const handleGitHub = async () => {
    if (!githubUrl.trim()) { toast.error('Enter a GitHub URL'); return; }
    try {
      setAnalyzing(true, 'FETCHING REPO');
      const { importFromGitHub } = await import('@/lib/api/client');
      const result = await importFromGitHub(githubUrl);
      if (result.primaryFile) {
        setCode(result.primaryFile.content);
        setFilename(result.primaryFile.name);
        setTab('PASTE');
        toast.success(`Imported ${result.primaryFile.name}`);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Import failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-aura-smoke flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 label-caps transition-all duration-300 ${tab === t
              ? 'text-aura-plasma border-b-2 border-aura-plasma -mb-px'
              : 'text-aura-ink-tertiary hover:text-aura-ink-secondary'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Demo preset pills ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-aura-smoke"
        style={{ background: 'rgba(10,10,15,0.6)' }}
      >
        <span
          className="label-caps flex-shrink-0"
          style={{ color: '#5A5F75', fontSize: 9, letterSpacing: '0.15em' }}
        >
          TRY:
        </span>
        {DEMOS.map(d => (
          <button
            key={d.label}
            onClick={() => handleDemo(d)}
            disabled={isAnalyzing}
            style={{
              height: 24,
              padding: '0 10px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              cursor: isAnalyzing ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              background: activeDemo === d.label
                ? 'linear-gradient(135deg, #7C5CFF, #FF3DCB)'
                : 'rgba(124,92,255,0.12)',
              border: `1px solid ${activeDemo === d.label ? 'transparent' : 'rgba(124,92,255,0.3)'}`,
              color: activeDemo === d.label ? '#fff' : '#A89BE8',
              boxShadow: activeDemo === d.label ? '0 0 12px rgba(124,92,255,0.5)' : 'none',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'PASTE' && (
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(v) => { setCode(v ?? ''); setActiveDemo(null); }}
              theme="vs-dark"
              options={{
                fontFamily: 'GeistMono, Menlo, monospace',
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                wordWrap: 'on',
                renderLineHighlight: 'gutter',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                smoothScrolling: true,
              }}
            />
          </div>
        )}

        {tab === 'FILE' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <input ref={fileRef} type="file" accept="*/*" className="hidden" onChange={handleFile} />
            <GlassPanel
              className="w-full p-10 flex flex-col items-center gap-4 cursor-pointer border-dashed hover:border-aura-plasma/50 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-4xl">📄</div>
              <p className="text-body text-aura-ink-secondary text-center">
                Click to upload any code file<br />
                <span className="label-caps text-aura-ink-tertiary mt-1 block">26+ languages supported</span>
              </p>
            </GlassPanel>
            {filename && (
              <p className="label-caps text-aura-aurora">✓ {filename} loaded</p>
            )}
          </div>
        )}

        {tab === 'GITHUB' && (
          <div className="flex-1 flex flex-col gap-4 p-6">
            <p className="label-caps text-aura-ink-tertiary">GITHUB URL</p>
            <input
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/blob/main/file.py"
              className="w-full bg-aura-graphite border border-aura-smoke rounded-xl px-4 py-3 font-mono text-sm text-aura-ink-primary placeholder-aura-ink-ghost outline-none focus:border-aura-plasma transition-colors"
            />
            <Button variant="plasma" onClick={handleGitHub} loading={isAnalyzing}>
              Import from GitHub
            </Button>
            <p className="text-caption text-aura-ink-tertiary">
              Supports: file, folder, or repo root URLs. Optional: set GITHUB_TOKEN for private repos.
            </p>
          </div>
        )}
      </div>

      {/* Analyze CTA */}
      <div className="p-4 border-t border-aura-smoke flex-shrink-0">
        <Button
          variant="plasma"
          size="lg"
          className="w-full justify-center"
          onClick={() => handleAnalyze()}
          loading={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : '▶ Analyze Code'}
        </Button>
      </div>
    </div>
  );
}
