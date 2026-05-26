# Clinic SMS Reminder

SMS-Based Patient Reminder System for Health Facilities in Ghana.

## Features

- User authentication with role-based access (Admin, Receptionist, Doctor, Nurse)
- Patient registration and management
- Appointment scheduling and tracking
- Automated SMS reminders (via Arkesel/Hubtel)
- SMS delivery logging
- Reports dashboard

## Tech Stack

- **Next.js 16** (App Router + API Routes)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** + **Prisma 7**
- **JWT Authentication** (via `jose`)

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 16+

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Receptionist**: `receptionist` / `reception123`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `SMS_API_KEY` | SMS provider API key |
| `SMS_SENDER_ID` | SMS sender ID |
| `NEXT_PUBLIC_APP_NAME` | Application name |
