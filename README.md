# Campus Commerce Marketplace MVP

Campus Commerce Marketplace is a campus services marketplace for students, vendors, and administrators. The frontend is a React 19 + Vite experience with Firebase authentication hooks and rich local demo state, while the backend is an Express + TypeScript API backed by Prisma and PostgreSQL.

## What's Included

- Customer flows for bike rides, laundry, and food ordering
- Vendor flows for requests, services, riders, offers, messaging, and profile management
- Admin flows for vendor onboarding, approvals, suspensions, user management, reports, and disputes
- Booking, chat, negotiation, reporting, and profile onboarding modals in the frontend
- REST API with validation, RBAC, notifications, uploads, and OpenAPI docs

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS v4
- Backend: Node.js, Express, TypeScript
- Data: PostgreSQL 16 with Prisma ORM
- Auth and integrations: JWT, OTP, Firebase Auth, WhatsApp/email abstractions
- Testing: Vitest and Supertest

## Repository Layout

- `src/` frontend application, components, store, API client, and Firebase integration
- `server/` backend API, Prisma schema, migrations, and tests
- `server/prisma/` database schema, migrations, and seed data
- `server/src/docs/openapi.json` OpenAPI specification
- `docker-compose.yml` local PostgreSQL and backend container setup

## Requirements

- Node.js 22 or newer
- npm 11 or newer
- PostgreSQL 16 for local backend development
- Docker and Docker Compose if you want the containerized setup

## Quick Start

### 1. Install dependencies

```bash
npm install
cd server
npm install
```

### 2. Configure the backend environment

Create a `server/.env` file with at least the database URL. Most other settings already have sensible defaults in `server/src/config/env.ts`.

```env
PORT=8000
NODE_ENV=development
APP_BASE_URL=http://localhost:8000
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:8443,http://127.0.0.1:8443,http://localhost:3000
DATABASE_URL=postgresql://vinay:campuspassword@localhost:5432/campus_commerce?schema=public
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
OTP_SECRET=change-me-too
```

### 3. Prepare the database

From the `server/` directory:

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start the apps

Run these in separate terminals:

```bash
# Backend
cd server
npm run dev
```

```bash
# Frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Docker Setup

The provided Compose file starts PostgreSQL and the backend only. The frontend still runs separately with Vite.

```bash
docker-compose up --build
```

## Available Scripts

### Root frontend package

- `npm run dev` - Start the Vite dev server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally
- `npm run format` - Format frontend code with Oxfmt

### Backend package

- `npm run dev` - Start the backend in watch mode
- `npm run build` - Generate Prisma client and compile TypeScript
- `npm run start` - Run the compiled backend from `dist/`
- `npm run test` - Run the backend test suite
- `npm run prisma:generate` - Generate the Prisma client
- `npm run prisma:migrate` - Apply or create Prisma migrations in development
- `npm run prisma:push` - Push the schema directly to the database
- `npm run prisma:seed` - Seed demo data

## API Notes

- Health checks: `GET /health` and `GET /ready`
- OpenAPI docs: `GET /api/v1/docs`
- Versioned API root: `/api/v1`
- Main resource groups: auth, marketplace, bookings, vendor, admin, and uploads

## Development Notes

- The frontend uses local persisted demo state for much of the marketplace experience.
- Firebase Auth is wired into the UI for Google sign-in support.
- The backend enforces validation, role-based access control, and consistent response formatting.
- Uploaded files are served from `/uploads` when local storage is enabled.

## License

No license file is currently included in this repository.
