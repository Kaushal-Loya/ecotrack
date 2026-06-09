# 🌿 EcoTrack — Carbon Footprint Awareness Platform

> Track, understand, and reduce your personal carbon footprint with personalised insights and goals.

[![CI](https://github.com/YOUR_USERNAME/carbon-footprint-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/carbon-footprint-platform/actions/workflows/ci.yml)

---

## 🎯 Chosen Vertical

**Sustainability & Climate Action** — An individual carbon footprint tracker that helps users measure their CO₂ impact, log daily activities, receive AI-style personalised reduction tips, and set progress-tracked goals.

---

## 🏗️ Architecture

```
carbon-footprint-platform/
├── apps/
│   ├── api/          Node.js + Express + TypeScript REST API
│   │   ├── prisma/   SQLite database schema + seed data
│   │   └── src/      Routes, services, middleware, tests
│   └── web/          React + TypeScript + Vite + Tailwind CSS
│       └── src/      Components, pages, hooks, utils, tests
├── e2e/              Playwright end-to-end tests
└── .github/          CI/CD workflows
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Type safety, fast HMR, code splitting |
| Styling | Tailwind CSS v3 | Accessible utility classes, dark mode |
| State | Zustand | Lightweight, no boilerplate |
| Charts | Recharts | Accessible SVG charts |
| Backend | Node.js + Express + TypeScript | Lightweight REST API |
| Database | SQLite + Prisma ORM | Zero-config, type-safe queries |
| Auth | JWT (15m) + Refresh tokens (7d) | Stateless, secure |
| Unit tests | Vitest + Testing Library | Fast, modern |
| E2E tests | Playwright | Cross-browser, reliable |
| CI | GitHub Actions | Auto lint, test, audit |

---

## 🔧 How It Works

### 1. Carbon Footprint Calculator (Onboarding)
Users answer a multi-step questionnaire (transport, diet, energy, shopping). The backend computes an annual CO₂ projection using **verified emission factors** from EPA, IPCC AR6, and DEFRA 2023, then stores a `FootprintSnapshot`.

### 2. Activity Logging
Users log individual activities (e.g. "drove 20 km in a petrol car"). The API auto-computes the CO₂ equivalent at write time using the `EmissionFactor` table (cached in memory at startup).

### 3. Personalised Insights
A **rule-based insight engine** analyses the user's emission breakdown by category, prioritises the highest-emission area, and returns the top 3 contextual tips with estimated annual savings.

### 4. Goals & Progress
Users set a reduction target (baseline kg → target kg by a deadline). Progress is calculated live against their rolling 12-month activity total.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/carbon-footprint-platform.git
cd carbon-footprint-platform
npm install
```

### 2. Configure the backend
```bash
cd apps/api
cp .env.example .env
# Edit .env and set strong JWT_SECRET and JWT_REFRESH_SECRET values
```

### 3. Set up the database
```bash
# From apps/api directory
npm run db:generate   # generate Prisma client
npm run db:push       # create SQLite tables
npm run db:seed       # seed emission factors
```

### 4. Start development servers
```bash
# From the root directory
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Health check**: http://localhost:4000/health

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

## 🔒 Security Practices

- **Passwords**: bcrypt with cost factor 12
- **JWTs**: Short-lived access tokens (15 min) + httpOnly-flaggable refresh tokens (7 days)
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
- Focus indicators visible (`focus-visible` with ring styles)
- Charts include accessible data tables as fallback (`<details>/<summary>`)
- ARIA: `role`, `aria-label`, `aria-live`, `aria-pressed`, `aria-busy`, `aria-expanded`, `aria-required`
- WCAG AA colour contrast ratios (dark theme, green accents)
- `prefers-reduced-motion` respected (animations disabled)
- Skip-to-main-content link for keyboard users
- Mobile responsive with touch-friendly tap targets

---

## 📊 Emission Factor Sources

All CO₂ factors are sourced from peer-reviewed, government-published data:

| Source | Data Used |
|---|---|
| [EPA GHG Equivalencies Calculator](https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references) | Electricity, general reference |
| [IPCC AR6 (2022)](https://www.ipcc.ch/report/ar6/) | Dietary emission factors |
| [DEFRA 2023 Conversion Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023) | Transport, energy, shopping |

---

## 📋 Key API Endpoints

```
POST   /api/auth/register          Create account
POST   /api/auth/login             Get tokens
POST   /api/auth/refresh           Rotate refresh token

GET    /api/footprint              Get current footprint + snapshot
POST   /api/footprint/calculate    Calculate and save annual footprint
GET    /api/footprint/factors      List all emission factors

POST   /api/activities             Log an activity
GET    /api/activities             List activities (paginated, filterable)
DELETE /api/activities/:id         Delete a log entry

GET    /api/insights               Get 3 personalised tips

POST   /api/goals                  Create a reduction goal
GET    /api/goals                  List goals with live progress
PATCH  /api/goals/:id              Update goal
DELETE /api/goals/:id              Delete goal
```

---

## 🔮 Assumptions Made

1. **SQLite over PostgreSQL** for zero-config evaluator setup. The Prisma `DATABASE_URL` can be swapped to a PostgreSQL connection string with no code changes.
2. **Rule-based insights** rather than LLM-based to keep the app fully self-contained, fast, and auditable.
3. **Annual footprint** is calculated from the last 365 days of activity logs, updated in real time.
4. **Emission factors** are cached in memory at startup because they change rarely. A `POST /footprint/factors/invalidate` admin endpoint can clear the cache if needed.
5. **No email verification** for competition simplicity, but the registration flow is designed to easily plug in a verification step.
