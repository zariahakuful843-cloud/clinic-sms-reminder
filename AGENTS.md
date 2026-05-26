# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is an **SMS-Based Patient Reminder System** for health facilities in Ghana. It's a Next.js 16 full-stack application (TypeScript + Tailwind CSS) using PostgreSQL with Prisma 7 ORM.

### Tech Stack

- **Framework**: Next.js 16 (App Router, API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL 16 + Prisma 7
- **Auth**: JWT (via `jose` library, stored in httpOnly cookies)
- **SMS**: Arkesel/Hubtel integration (mocked in dev)

### Services Required

| Service | Command | Notes |
|---------|---------|-------|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Must be running before dev server |
| Next.js Dev Server | `npm run dev` | Runs on port 3000 by default |

### Development Commands

See `package.json` scripts:
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint checks
- `npm run db:migrate` — Run Prisma migrations
- `npm run db:seed` — Seed database with test data
- `npm run db:studio` — Open Prisma Studio (DB GUI)

### Key Caveats

- **Prisma 7** uses driver adapters — `PrismaClient` must be instantiated with `@prisma/adapter-pg`. The generated client is at `src/generated/prisma/` (gitignored). Run `npx prisma generate` after any schema change.
- The `.env` file contains `DATABASE_URL` pointing to local PostgreSQL. Default credentials: `clinicadmin:clinicpass` on database `clinic_sms_reminder`.
- SMS sending is **mocked** in development (when `SMS_API_KEY=mock-sms-api-key`). Messages are logged to the `SMSLog` table with `DELIVERED` status.
- Login credentials for testing: `admin / admin123` and `receptionist / reception123`.
- The ESLint config disables `react-hooks/set-state-in-effect` (standard data-fetching patterns trigger this overly strict React 19 rule).
