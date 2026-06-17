# Career Intelligence Hub

AI-powered career intelligence platform that helps job seekers discover opportunities, analyze job requirements, identify skill gaps, create learning roadmaps, and prepare for interviews — all using local AI models via Ollama.

## Features

- **Job Discovery** — Paste career page URLs or HTML to discover and extract job postings
- **AI Analysis** — Executive summaries, difficulty ratings, skill ranking, salary estimation
- **Skill Learning** — AI-generated roadmaps with projects, resources, and interview questions
- **Interview Prep** — 30/60/90-day plans, mock interviews, risk analysis, resume optimization
- **Analytics Dashboard** — Visual insights on skills, salaries, benefits, and hiring trends
- **Skill Gap Analysis** — Compare your profile against job requirements
- **Dark/Light Mode** — Responsive design with premium SaaS UI
- **Local AI** — No API costs, runs entirely on your machine with Ollama

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| UI Components | Radix UI primitives, Framer Motion, Recharts |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB with Mongoose |
| Authentication | NextAuth (Google, GitHub, Email) |
| AI | Ollama (Llama 3 8B, Gemma 2 9B, Qwen 3 14B) |
| Crawling | Cheerio + Fetch |

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Ollama** — [Install Ollama](https://ollama.ai)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and auth credentials
```

### 3. Install Ollama Models

```bash
ollama serve
ollama pull llama3:8b
ollama pull gemma2:9b
ollama pull qwen3:14b
```

### 4. Start MongoDB

```bash
docker run -d -p 27017:27017 mongo:7
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Docker Deployment

```bash
docker compose up -d
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── analyze/           # URL/HTML analysis
│   ├── analytics/         # Charts & analytics
│   ├── auth/              # Sign in
│   ├── interview/         # Interview prep
│   ├── jobs/              # Job listing & detail
│   ├── learning/          # Learning center
│   ├── saved/             # Saved jobs
│   └── settings/          # Settings & AI config
├── components/
│   ├── layout/            # Sidebar, Header
│   ├── providers.tsx      # React Query, Auth, Theme
│   └── ui/                # UI components
├── lib/
│   ├── ai.ts              # Ollama AI service
│   ├── auth.ts            # NextAuth config
│   ├── crawler.ts         # Crawling & parsing
│   ├── db.ts              # MongoDB connection
│   └── utils.ts           # Utilities
└── models/                # Mongoose schemas
```

## AI Models

| Task | Default Model | Purpose |
|------|--------------|---------|
| Job Extraction | Llama 3 8B | Parse job postings |
| Skill Analysis | Gemma 2 9B | Analyze skills & difficulty |
| Learning Roadmaps | Qwen 3 14B | Generate learning paths |
| Interview Prep | Qwen 3 14B | Create interview plans |

Models can be changed in Settings > AI Configuration.

## License

MIT
