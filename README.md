# CODEAURA 🎬

> **Watch your code become cinema.**

CODEAURA is a cinematic AI-powered code execution visualizer that renders any code — in any language — as a narrated 3D film using Three.js, GSAP, and Gemini AI.

```
Your code is a film. CODEAURA is the cinema.
```

---

## Architecture

```
codeaura/
├── apps/
│   ├── web/          → Next.js 14 (App Router) — frontend
│   └── api/          → Express + Gemini AI — backend
├── packages/
│   └── shared/       → TypeScript types + constants
└── pnpm-workspace.yaml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| 3D | Three.js 0.168, @react-three/fiber, @react-three/drei |
| Animation | GSAP 3.12, ScrollTrigger |
| Post FX | @react-three/postprocessing (Bloom, CA, Vignette) |
| State | Zustand 4.5 |
| Editor | Monaco Editor |
| AI | Gemini 1.5 Pro (analysis) + Flash (Q&A) |
| Database | Supabase (PostgreSQL + Storage) |
| Backend | Express 4 + Pino + Zod |
| Package Manager | pnpm 9 + Turborepo |

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Add your `SUPABASE_SERVICE_ROLE_KEY` to `.env` (get it from [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API).

### 3. Run in development

```bash
# Both frontend + backend
pnpm dev

# Frontend only (port 3000)
pnpm dev:web

# Backend only (port 8080)
pnpm dev:api
```

### 4. Access

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8080/api/v1/health
- **Studio:** http://localhost:3000/studio
- **Demo:** http://localhost:3000/demo/fibonacci-recursion

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | web | Backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Supabase anon key |
| `GEMINI_API_KEY` | api | Gemini API key |
| `SUPABASE_URL` | api | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | api | Service role key (secret) |
| `CORS_ORIGIN` | api | Allowed frontend origin |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Previous / Next step |
| `⌘K` / `Ctrl+K` | Command palette |
| `/` | Ask AI dock |
| `E` | Toggle editor panel |
| `F` | Fullscreen |

---

## Demo Scenes

| Slug | Language | Highlight |
|------|----------|-----------|
| `fibonacci-recursion` | Python | RecursionSpiral |
| `quicksort-race` | JavaScript | ArrayRail + LoopHelix |
| `async-promise-chain` | TypeScript | AsyncPulse |
| `dijkstra-shortest-path` | Go | ObjectCluster |
| `linked-list-cpp` | C++ | ClassTemple + ErrorShatter |

---

## Deployment

### Frontend → Vercel

```bash
# Push to GitHub, then connect repo to Vercel
# Set all NEXT_PUBLIC_* env vars in Vercel dashboard
```

### Backend → Render

```bash
# Create Web Service on render.com
# Root dir: apps/api
# Build: pnpm build
# Start: pnpm start
# Set all env vars in Render dashboard
```

---

## Design System

- **Background:** Void black `#000000` — 90% of every viewport
- **Accents:** Plasma `#7C5CFF`, Aurora `#4FE3C1`, Ember `#FF6B4A`, Solar `#FFB547`, Nebula `#FF3DCB`
- **Glass:** `rgba(18,21,31,0.55)` + `blur(24px)` + 1px `rgba(255,255,255,0.06)` border
- **Typography:** Instrument Serif (display) + Geist (body) + Geist Mono (code)

---

*Built with CODEAURA × Gemini × Three.js*
