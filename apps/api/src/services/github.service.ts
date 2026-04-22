import { logger } from '../middleware/logger.js';

interface GitHubFile {
  name: string;
  path: string;
  content: string;
  language?: string;
}

interface GitHubImportResult {
  files: GitHubFile[];
  primaryFile: GitHubFile | null;
  repoName?: string;
}

function parseGitHubUrl(url: string): { owner: string; repo: string; path: string; type: 'file' | 'tree' | 'raw' } {
  const raw = url.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/[^/]+\/(.+)/);
  if (raw) return { owner: raw[1], repo: raw[2], path: raw[3], type: 'raw' };

  const blob = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/[^/]+\/(.+)/);
  if (blob) return { owner: blob[1], repo: blob[2], path: blob[3], type: 'file' };

  const tree = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/[^/]+\/(.+)/);
  if (tree) return { owner: tree[1], repo: tree[2], path: tree[3], type: 'tree' };

  const repo = url.match(/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (repo) return { owner: repo[1], repo: repo[2], path: '', type: 'tree' };

  throw new Error('Invalid GitHub URL format');
}

const CODE_FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css'];

function isCodeFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return CODE_FILE_EXTENSIONS.includes(ext);
}

async function fetchGitHubAPI(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'CODEAURA/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function importFromGitHub(url: string): Promise<GitHubImportResult> {
  const { owner, repo, path, type } = parseGitHubUrl(url);
  logger.info({ owner, repo, path, type }, 'GitHub import');

  // Single file
  if (type === 'file' || type === 'raw') {
    const data = await fetchGitHubAPI(`repos/${owner}/${repo}/contents/${path}`) as {
      name: string; path: string; content: string; encoding: string;
    };
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const file: GitHubFile = { name: data.name, path: data.path, content };
    return { files: [file], primaryFile: file, repoName: `${owner}/${repo}` };
  }

  // Directory / repo tree
  const items = await fetchGitHubAPI(
    `repos/${owner}/${repo}/contents/${path}`
  ) as Array<{ name: string; path: string; type: string; download_url: string }>;

  const codeFiles = items
    .filter((f) => f.type === 'file' && isCodeFile(f.name))
    .slice(0, 20);

  const files = await Promise.all(
    codeFiles.map(async (f) => {
      const res = await fetch(f.download_url);
      const content = await res.text();
      return { name: f.name, path: f.path, content };
    })
  );

  const primaryFile = files.find((f) => /index|main|app|mod|init/.test(f.name.toLowerCase())) ?? files[0] ?? null;
  return { files, primaryFile, repoName: `${owner}/${repo}` };
}
