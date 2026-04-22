# CODEAURA — Deployment Checklist

## 🚀 Frontend — Vercel

**Root directory:** `apps/web`  
**Build command:** `pnpm --filter web build`  
**Output directory:** `.next`  
**Node version:** 18.x

### Environment Variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://[your-render-service].onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://phmwhzbtzodghiwclrxs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(see .env)* |

> **Steps:**
> 1. Push repo to GitHub
> 2. Import repo in Vercel → set root directory to `apps/web`
> 3. Add all env vars above
> 4. Deploy → your URL will be `https://codeaura.vercel.app`

---

## ⚙️ Backend — Render

**Root directory:** `/` (repo root)  
**Build command:** `pnpm install && pnpm --filter api build`  
**Start command:** `node apps/api/dist/index.js`  
**Health check path:** `/api/v1/health`  
**Port:** `8080`

### Environment Variables

| Variable | Value |
|---|---|
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | *(see .env)* |
| `DEEPSEEK_API_KEY` | *(see .env)* |
| `SUPABASE_URL` | `https://phmwhzbtzodghiwclrxs.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Supabase dashboard → Settings → API)* |
| `CORS_ORIGIN` | `https://codeaura.vercel.app` |

> **Steps:**
> 1. Create new Web Service on Render → connect GitHub repo
> 2. Set build + start commands above
> 3. Add all env vars
> 4. Copy the Render URL → paste into Vercel's `NEXT_PUBLIC_API_URL`

---

## ✅ Pre-flight Checks

- [ ] `pnpm --filter web build` completes with 0 errors
- [ ] `pnpm --filter api build` completes with 0 errors  
- [ ] `GET /api/v1/health` returns `{ "status": "ok" }`
- [ ] Analyze request returns a 15-20 step script (test with Fibonacci code)
- [ ] Share button copies a valid URL to clipboard
- [ ] Voice narration plays on step advance
- [ ] NEXT button advances steps in Manual mode
- [ ] Quality Score orb shows improvement tips on hover

---

## 🎬 Demo Flow for Judges

1. Open `https://codeaura.vercel.app`
2. Click **"Watch Your Code Think →"** on the hero
3. Click **"Fibonacci"** demo preset → auto-analyzes
4. Watch the 3D cinema with voice narration
5. Click **NEXT** to step through manually
6. Hover the Quality Score orb to see AI improvement tips
7. Click **Share** → show judges the copyable link
