<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7C5CFF,50:00D4FF,100:FF6B6B&height=200&section=header&text=CODEAURA&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Watch%20Your%20Code%20Think.&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=800&size=28&duration=3000&pause=800&color=7C5CFF&center=true&vCenter=true&multiline=true&repeat=true&width=900&height=100&lines=The+World's+First+Cinematic+Code+Visualizer.;Every+Variable.+Every+Loop.+Rendered+in+3D.;Narrated+by+AI.+Understood+Instantly." alt="Typing SVG" />

<br/><br/>

<a href="https://codeaura-psi.vercel.app">
  <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-codeaura--psi.vercel.app-7C5CFF?style=for-the-badge&labelColor=0D0D0D&logoColor=white" height="35"/>
</a>
&nbsp;
<a href="https://github.com/selfabhijeetkumar/CODEAURA">
  <img src="https://img.shields.io/badge/⭐%20GitHub-CODEAURA-ffffff?style=for-the-badge&labelColor=0D0D0D&logo=github" height="35"/>
</a>
&nbsp;
<img src="https://img.shields.io/badge/Built%20With-Next.js%20%2B%20Three.js%20%2B%20Gemini-00D4FF?style=for-the-badge&labelColor=0D0D0D" height="35"/>

<br/><br/>

<img src="https://img.shields.io/badge/Version-2.0.0-7C5CFF?style=flat-square&labelColor=0D0D0D"/>
<img src="https://img.shields.io/badge/License-MIT-00D4FF?style=flat-square&labelColor=0D0D0D"/>
<img src="https://img.shields.io/badge/Status-🟢%20Live%20%26%20Deployed-00FF88?style=flat-square&labelColor=0D0D0D"/>
<img src="https://img.shields.io/badge/Hackathon-AAVISHKAR%202026-FF6B6B?style=flat-square&labelColor=0D0D0D"/>

<br/><br/>

---

<br/>

> ### *"Most developers write code. Nobody truly sees it think. Until now."*

</div>

---

## AI Infrastructure 🧠

CODEAURA implements a **Dynamic AI Pool** with automatic health tracking and seamless failover. It is designed to be indestructible in production.

### Dynamic Key Management
The system supports multiple API keys across three major providers:
- **Gemini (Primary):** Google's high-speed multimodal models.
- **Groq (First Fallback):** Ultra-low latency Llama 3.3 and Mixtral models.
- **OpenRouter (Secondary Fallback):** Massive models like NVIDIA Nemotron 3 Super and GPT-OSS 120b.

### Failover Logic
1. **Validation:** Each key is validated on startup and registered to the central `ApiKeyManager`.
2. **Rotation:** Requests rotate through available keys in a round-robin fashion.
3. **Eviction:** If a key fails 3 times (e.g., 429 Rate Limit, 401 Unauthorized), it is **automatically evicted** from the live pool.
4. **Provider Pivot:** If all keys for a provider (e.g., Gemini) are exhausted or dead, the system automatically pivots to the next provider (Groq → OpenRouter).
5. **Graceful Degradation:** If all AI providers fail, the system falls back to a deterministic 3D script generator to ensure the visualizer never crashes.

---

## 🎬 Feature Showcase
CODEAURA renders any code — in any language — as a narrated 3D film using Three.js, GSAP, and cinematic 3D actors like `FunctionPortal`, `LoopHelix`, and `RecursionSpiral`.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Add your Gemini, Groq, and OpenRouter keys to enable the full AI pool.

### 3. Run in development
```bash
pnpm dev
```

---

## 🌐 Deployment Guide

### Backend (Express)
- **Host:** [Render.com](https://render.com)
- **Build:** `pnpm build`
- **Start:** `pnpm start`

### Frontend (Next.js)
- **Host:** [Vercel](https://vercel.com)
- **Framework:** Next.js (App Router)

---

## 🎨 Design System

- **Background:** Void black `#000000`
- **Accents:** Plasma `#7C5CFF`, Aurora `#4FE3C1`, Ember `#FF6B4A`
- **Glass:** `rgba(18,21,31,0.55)` + `blur(24px)` + 1px border

---

*Built for AAVISHKAR 2026 × Gemini × NVIDIA × Groq*
