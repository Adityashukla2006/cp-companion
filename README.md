# CP Companion

A personal competitive programming dashboard built with **Next.js 16**, **TypeScript**, and **Recharts**. Aggregates live data from **Codeforces** and **LeetCode** into a single, clean interface — ratings, upcoming contests, daily problems, and recent accepted work all in one view.

---

## Features

| Area | What it shows |
|---|---|
| **Ratings at a glance** | Codeforces rating & rank, LeetCode contest rating & global rank, best CF rating jump |
| **Rating chart** | Interactive Codeforces rating growth over time (area chart) |
| **Daily LeetCode** | Today's daily challenge with difficulty badge, topic tags, and a direct "Solve" link |
| **Upcoming contests** | Merged list of upcoming Codeforces + LeetCode contests, sorted by start time with live countdown |
| **Recent activity** | Latest accepted submissions from both platforms with problem links |
| **Skeleton loading** | Graceful loading states while API data is fetched |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language** — TypeScript 5
- **Charts** — [Recharts](https://recharts.org/)
- **Icons** — [Lucide React](https://lucide.dev/)
- **Styling** — Tailwind CSS 4 + custom globals

---

## Project Structure

```
cp-tracker/
├── app/
│   ├── api/                    # Next.js API route handlers (server-side proxies)
│   │   ├── codeforces/
│   │   │   ├── contests/       # GET — upcoming CF contests
│   │   │   ├── problems/       # GET — problemset by tags
│   │   │   └── user/
│   │   │       ├── route.ts          # GET — CF user info
│   │   │       ├── history/          # GET — CF rating history
│   │   │       └── submissions/      # GET — recent CF submissions
│   │   └── leetcode/
│   │       ├── contests/
│   │       │   └── upcoming/         # GET — upcoming LC contests
│   │       ├── daily/                # GET — LC daily question
│   │       ├── question/
│   │       │   ├── route.ts          # GET — search question by ID
│   │       │   └── [slug]/           # GET — question details by slug
│   │       └── user/
│   │           └── [username]/       # GET — LC user profile + stats
│   │               └── submissions/  # GET — recent LC submissions
│   ├── services/               # Client-side service layers
│   │   ├── codeforces.ts       # CF data fetching & normalisation
│   │   └── leetcode.ts         # LC data fetching & normalisation
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts          # Formatting, fetch wrapper, conversion utilities
│   ├── globals.css             # Design tokens & component styles
│   ├── layout.tsx              # Root layout (Inter font, metadata)
│   └── page.tsx                # Main dashboard UI
├── .env                        # Environment variables (not committed)
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Architecture

```
Browser (client component)
  │
  ├─ services/leetcode.ts ──► /api/leetcode/*  ──► LeetCode API / GraphQL
  │
  └─ services/codeforces.ts ─► /api/codeforces/* ──► Codeforces API
```

API routes act as **server-side proxies** so external API keys and base URLs stay out of the browser. Service modules on the client normalise raw responses into strongly-typed interfaces before the UI consumes them.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A running [LeetCode API](https://github.com/alfaarghya/alfa-leetcode-api) instance (or any compatible proxy)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd cp-tracker
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_LEETCODE_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CODEFORCES_API_BASE_URL=https://codeforces.com/api
```

> **Note:** The Codeforces API is public and doesn't require keys for the endpoints used here. The LeetCode URL should point to your running LeetCode API proxy.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## API Routes Reference

All routes return JSON. Errors return `{ "error": "..." }` with an appropriate HTTP status.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/codeforces/user` | User info for the configured handle |
| `GET` | `/api/codeforces/user/history` | Rating change history |
| `GET` | `/api/codeforces/user/submissions` | Recent submissions (last 15) |
| `GET` | `/api/codeforces/contests` | Full contest list (client filters to `BEFORE` phase) |
| `GET` | `/api/codeforces/problems?tags=...` | Problemset filtered by tags |
| `GET` | `/api/leetcode/user/:username` | Profile, contest stats, solve counts |
| `GET` | `/api/leetcode/user/:username/submissions` | Recent submissions |
| `GET` | `/api/leetcode/daily` | Today's daily challenge |
| `GET` | `/api/leetcode/contests/upcoming` | Upcoming LC contests |
| `GET` | `/api/leetcode/question?slug=...` | Question details by slug (GraphQL) |
| `GET` | `/api/leetcode/question/:slug` | Question details by slug (REST) |

---

## Customisation

- **Change usernames** — Update `CODEFORCES_USERNAME` in `app/services/codeforces.ts` and `LEETCODE_USERNAME` in `app/page.tsx`.
- **Styling** — Design tokens live in `app/globals.css` (CSS custom properties). Modify colours, spacing, or typography there.
- **Add a platform** — Create a new API route under `app/api/`, a service module under `app/services/`, and add types in `app/types/index.ts`.

---

## License

This project is for personal use. No license specified.
