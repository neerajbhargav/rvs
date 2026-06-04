# RVS Co-Founder Exercise — User Onboarding App

A full-stack onboarding wizard with configurable form components, admin management, and data persistence.

Built by **Neeraj Bhargav Rondla** for Revolution Venture Studios.

## Tech Stack

- **Frontend:** Next.js 16 (React), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** File-based JSON store (local) / swappable to PostgreSQL
- **Deployment:** Vercel / Render / local demo

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

| Route    | Description                                        |
| -------- | -------------------------------------------------- |
| `/`      | User onboarding wizard (3-step flow)               |
| `/admin` | Admin panel — configure form components per page   |
| `/data`  | Data table — all users in the database             |

## Architecture

- Clean database abstraction in `src/lib/db.ts`
- Next.js API routes serve as backend
- Wizard supports resume: users who registered can return and pick up where they left off
- Admin config validates that each page always has at least 1 component
