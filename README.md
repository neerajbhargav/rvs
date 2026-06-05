# SupportIQ — AI Customer Support Platform

A full-stack onboarding wizard with configurable form components, admin management, data persistence, and an AI-powered customer support dashboard prototype.

Built by **Neeraj Bhargav Rondla** for Revolution Venture Studios.

## Tech Stack

- **Frontend:** Next.js 16 (React 19), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## Routes

| Route        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `/`          | User onboarding wizard (3-step flow with resume support) |
| `/admin`     | Admin panel — configure form components per page         |
| `/data`      | Data table — all users in the database                   |
| `/dashboard` | **BONUS:** SupportIQ AI agent prototype with live demo   |

## Architecture

- **Prisma ORM** for type-safe database access with PostgreSQL
- **Next.js API routes** serve as the backend
- **Wizard resume:** users who registered can return and pick up where they left off
- **Admin config** validates that each page always has at least 1 component
- **Dark/Light mode** toggle with system preference detection
- **Premium design** with glassmorphism, micro-animations, and responsive layout

## SupportIQ Dashboard (Bonus)

The `/dashboard` route demonstrates the core SupportIQ product concept:
- Live AI customer support agent with mock responses
- Agent reasoning trace showing tool calls and decision steps
- Real-time metrics: deflection rate, resolution time, cost savings
- ROI calculator proving the business case ($4.20 saved per ticket)
