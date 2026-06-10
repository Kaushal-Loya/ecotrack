# 🌿 EcoTrack — Carbon Footprint Awareness Platform

> Track, understand, and reduce your personal carbon footprint with personalised insights and goals.

[![CI](https://github.com/Kaushal-Loya/ecotrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Kaushal-Loya/ecotrack/actions/workflows/ci.yml)

---

## 🎯 Chosen Vertical

**Sustainability & Climate Action** — An individual carbon footprint tracker that helps users measure their CO₂ impact, log daily activities, receive personalised reduction tips, and set progress-tracked goals.

---

## 🏗️ Architecture

```
carbon-footprint-platform/                 ← npm workspaces monorepo
├── apps/
│   ├── api/                               ← Node.js · Express · TypeScript · Prisma
│   │   ├── api/index.ts                   ← Vercel serverless entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma              ← PostgreSQL schema (5 models)
│   │   │   └── seed.ts                   ← Emission factors + demo user
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── prisma.ts              ← Shared PrismaClient singleton
│   │       │   └── emissionFactors.ts    ← Named emission coefficients (DEFRA/IPCC/EPA)
│   │       ├── errors/AppError.ts        ← Typed error class hierarchy
│   │       ├── middleware/               ← authenticate · validate · errorHandler
│   │       ├── routes/                   ← auth · footprint · activities · insights · goals
│   │       ├── services/                 ← authService · footprintService · goalService · insightService
│   │       └── types/index.ts            ← Shared API types
│   └── web/                               ← React 18 · TypeScript · Vite · Tailwind CSS
│       └── src/
│           ├── components/               ← ActivityForm · FootprintChart · GoalCard · Layout · …
│           ├── hooks/                    ← useAuth (Zustand) · useActivities
│           ├── pages/                    ← Dashboard · Activities · Insights · Goals · Onboarding · Auth
│           ├── types/index.ts            ← Shared frontend types
│           └── utils/
│               ├── api.ts               ← Axios client + JWT interceptors
│               └── emissions.ts         ← Format helpers · EMISSION_COEFFICIENTS · category maps
├── e2e/                                   ← Playwright end-to-end tests
└── .github/                               ← CI/CD workflows (lint · test · audit)
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Type safety, fast HMR, code splitting |
| Styling | Tailwind CSS v3 | Accessible utility classes, dark mode |
| State | Zustand + persist | Lightweight, no boilerplate, survives refresh |
| Charts | Recharts | Accessible SVG charts |
| Backend | Node.js + Express + TypeScript | Lightweight REST API |
| Database | PostgreSQL + Prisma ORM | Production-grade, type-safe queries |
| Auth | JWT (15 m access) + Refresh tokens (7 d) | Stateless, secure token rotation |
| Unit tests | Vitest + Testing Library | Fast, modern |
| E2E tests | Playwright | Cross-browser, reliable |
| CI | GitHub Actions | Auto lint, test, audit |
| Hosting | Vercel (separate projects) | Edge CDN for frontend, serverless for API |

---

## 🔧 How It Works

### 1. Carbon Footprint Calculator (Onboarding)
Users answer a multi-step questionnaire (transport, diet, energy, shopping). The backend computes an annual CO₂ projection using **verified emission factors** from EPA, IPCC AR6, and DEFRA 2023 — defined as named constants in `src/lib/emissionFactors.ts` — then stores a `FootprintSnapshot`.

### 2. Activity Logging
Users log individual activities (e.g. "drove 20 km in a petrol car"). The API auto-computes CO₂ at write time using the `EmissionFactor` database table (cached as a `Map` in memory at startup).

### 3. Personalised Insights
A **rule-based insight engine** (`insightService.ts`) analyses the user's emission breakdown by category, prioritises the highest-emission area, and returns the top 3 contextual tips with estimated annual savings.

### 4. Goals & Progress
Users set a reduction target (baseline kg → target kg by a deadline). Progress is calculated live against their rolling 12-month activity total and returned with every `GET /api/goals` call.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+
- A PostgreSQL database (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### 1. Clone and install
```bash
git clone https://github.com/Kaushal-Loya/ecotrack.git
cd carbon-footprint-platform
npm install
```

### 2. Configure the backend
```bash
cd apps/api
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string
# Set strong random values for JWT_SECRET and JWT_REFRESH_SECRET
```

### 3. Set up the database
```bash
# From apps/api directory
npm run db:generate   # generate Prisma client
npm run db:migrate    # apply migrations to your PostgreSQL DB
npm run db:seed       # seed emission factors + demo user
```

### 4. Start development servers
```bash
# From the root directory
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Health check**: http://localhost:4000/health

### Demo credentials (after seeding)
- **Email**: `demo@example.com`
- **Password**: `DemoPass1`

---

## 🧪 Testing

```bash
# API unit tests
cd apps/api && npm test

# Web unit tests
cd apps/web && npm test

# E2E tests (requires both servers running)
cd e2e && npx playwright test
```

---

## 🚀 Deployment (Vercel)

The monorepo deploys as **two separate Vercel projects**:

| Project | Root Directory | Notes |
|---|---|---|
| `ecotrack-api` | `apps/api` | Serverless function via `api/index.ts` |
| `ecotrack-web` | `apps/web` | Static SPA build via Vite |

### Required environment variables

**API project:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Strong random secret (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Different strong random secret |
| `JWT_EXPIRES_IN` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | e.g. `7d` |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | Comma-separated frontend URL(s) |
| `HUSKY` | `0` (disables git hooks in CI) |

**Web project:**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full API base URL, e.g. `https://your-api.vercel.app/api` |
| `HUSKY` | `0` |

---

## 🔒 Security Practices

- **Passwords**: bcrypt with cost factor 12
- **JWTs**: Short-lived access tokens (15 min) + refresh tokens (7 days) with rotation
- **Input validation**: Zod schemas on all API endpoints; unknown fields stripped
- **Rate limiting**: Auth routes 10 req/min; API routes 100 req/min
- **SQL injection**: Prisma parameterised queries only; no raw SQL with user input
- **CORS**: Explicit origin whitelist (no wildcard)
- **Security headers**: Helmet.js on every response
- **Secrets**: All keys in environment variables; `.env` in `.gitignore`
- **Dependency hygiene**: `npm audit` runs in CI on every push

---

## ♿ Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`, `<header>`)
- All form inputs have associated `<label>` elements
- Focus indicators visible (`focus-visible` ring styles)
- Charts include accessible data tables as fallback (`<details>/<summary>`)
- ARIA: `role`, `aria-label`, `aria-live`, `aria-pressed`, `aria-busy`, `aria-expanded`
- WCAG AA colour contrast ratios (dark theme, green accents)
- `prefers-reduced-motion` respected (animations disabled when set)
- Skip-to-main-content link for keyboard users
- Mobile responsive with touch-friendly tap targets

---

## 📊 Emission Factor Sources

All CO₂ coefficients are sourced from peer-reviewed, government-published data and defined as named constants in [`apps/api/src/lib/emissionFactors.ts`](apps/api/src/lib/emissionFactors.ts):

| Source | Data Used |
|---|---|
| [EPA GHG Equivalencies Calculator](https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references) | Electricity, general reference |
| [IPCC AR6 (2022)](https://www.ipcc.ch/report/ar6/) | Dietary emission factors |
| [DEFRA 2023 Conversion Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023) | Transport, energy, shopping |

---

## 📋 Key API Endpoints

```
POST   /api/auth/register              Create account
POST   /api/auth/login                 Get access + refresh tokens
POST   /api/auth/refresh               Rotate refresh token

GET    /api/footprint                  Get live footprint + latest snapshot
POST   /api/footprint/calculate        Calculate and save annual footprint (onboarding)
GET    /api/footprint/factors          List all emission factors
POST   /api/footprint/factors/invalidate  Invalidate and reload in-memory cache

POST   /api/activities                 Log an activity (CO₂ computed at write time)
GET    /api/activities                 List activities (paginated, filterable by category/range)
DELETE /api/activities/:id             Delete a log entry

GET    /api/insights                   Get top 3 personalised reduction tips

POST   /api/goals                      Create a reduction goal
GET    /api/goals                      List goals with live progress %
PATCH  /api/goals/:id                  Update goal
DELETE /api/goals/:id                  Delete goal

GET    /health                         Health check (no auth required)
```

---

## 🔮 Design Decisions

1. **PostgreSQL over SQLite** for production correctness — Prisma makes the provider swap transparent to all application code.
2. **Rule-based insights** rather than LLM-based — fully self-contained, fast, auditable, and offline-capable.
3. **Annual footprint** is calculated from the last 365 days of activity logs, updated in real time on every `GET /footprint` call.
4. **Emission factors cached in memory** at startup (loaded once from DB) because they change rarely. A `POST /footprint/factors/invalidate` admin endpoint clears and reloads the cache without a restart.
5. **Named emission constants** (`emissionFactors.ts`) ensure all coefficients have a single authoritative definition with full source attribution — avoiding magic numbers scattered across files.
6. **Singleton PrismaClient** shared across all services — avoids wasting connection pool slots and is the standard pattern for serverless deployments.
7. **No email verification** for competition simplicity — the registration flow is designed to easily add a verification step.
