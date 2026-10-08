# Campus Commerce Marketplace MVP - Backend Architecture & Documentation

## Overview

The **Campus Commerce Marketplace** backend is a production-ready, RESTful service built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM. It implements all core business requirements from the MVP PRD and powers the Figma-designed React frontend.

---

## 1. System Architecture

```text
Customer / Vendor / Admin (React 19 Frontend)
             │
             ▼
      Vite Dev / Nginx Reverse Proxy
             │
             ▼
 Express API Gateway (/api/v1/*)
   ├── Security & Request Correlation (UUID, CORS, Helmet)
   ├── Rate Limiting & Cooldown Protection (OTP Throttling)
   ├── Role-Based Access Control (RBAC: CUSTOMER, VENDOR_OWNER, ADMIN)
   ├── Zod Schema Validation
   └── Service Configuration Engine
             │
   ┌─────────┼──────────┬──────────────┐
   ▼         ▼          ▼              ▼
Auth     Bookings  Marketplace    Vendor / Admin
Service   Service   Service         Operations
   │         │          │              │
   └─────────┴──────────┴──────────────┘
             │
     Prisma ORM Layer
             │
  PostgreSQL 16 Database
```

---

## 2. Key Business Rules Enforced Server-Side

1. **OTP Rate Limiting & Abuse Prevention**:
   - 1st OTP: 30s interval
   - 2nd OTP: 60s interval
   - 3rd OTP: 5-minute strict lockout
   - Cycle resets after cooldown
   - Plaintext OTPs are never stored; HMAC-SHA256 salted hashes are verified in constant time.

2. **Server-Authoritative Pricing**:
   - Bike rides: calculated using `fareMatrix[pickup][dropoff][passengers]`.
   - Max 2 passengers strictly enforced; requests > 2 rejected with `INVALID_PASSENGER_COUNT`.
   - Laundry: calculated per kg with service fee; restricted clothing types (e.g., blankets, socks) rejected with `RESTRICTED_CLOTHING`.
   - Food: calculated server-side from active menu prices. Client-supplied totals are ignored.

3. **Finite State Machines**:
   - **Ride**: `REQUESTED → ASSIGNED → ON_THE_WAY → COMPLETED` (or `CANCELLED`)
   - **Laundry**: `REQUESTED → ACCEPTED → RECEIVED → PROCESSING → READY → COMPLETED` (or `CANCELLED`)
   - **Food**: `RECEIVED → ACCEPTED → PREPARING → READY → COMPLETED` (or `CANCELLED`)

4. **Idempotency Protection**:
   - Duplicate submissions using `Idempotency-Key` or body key return existing bookings without duplicate charging or creation.

5. **Notifications & WhatsApp Provider Abstraction**:
   - Persistent in-app notifications in PostgreSQL.
   - Asynchronous WhatsApp notifications dispatched without blocking request lifecycles.
   - Respects user notification preferences for operational vs. promotional updates.

---

## 3. Tech Stack & Directory Structure

- **Runtime**: Node.js v22+
- **Language**: TypeScript 5.7+
- **Framework**: Express 4.x
- **ORM**: Prisma 5.22+
- **Database**: PostgreSQL 16
- **Validation**: Zod 3.24+
- **Testing**: Vitest + Supertest

```text
server/
  src/
    app.ts                  # Express application configuration
    index.ts                # Server entry point & graceful shutdown
    config/
      env.ts                # Zod-validated environment config
    db/
      prisma.ts             # Prisma client singleton
    utils/
      errors.ts             # AppError & ErrorCode catalog
      response.ts           # Standard { success, data, error } envelope
      logger.ts             # Structured JSON logger with correlation IDs
      phone.ts              # Canonical phone normalization
      audit.ts              # Persistent audit log writer
    auth/
      jwt.ts                # Access & refresh token session manager
      otp.ts                # OTP generator & rate limiter
    middleware/
      auth.middleware.ts    # requireAuth & optionalAuth
      rbac.middleware.ts    # requireRole & requireVendorAccess
      validate.middleware.ts# Zod validation
      error.middleware.ts   # Centralized error handler
      logging.middleware.ts # Request correlation & latency logging
    notifications/
      whatsapp.interface.ts # IWhatsAppProvider interface
      mock.whatsapp.ts      # Local mock WhatsApp provider
      notification.service.ts # In-app and WhatsApp dispatch
    storage/
      storage.interface.ts  # IStorageProvider interface
      local.storage.ts      # Local disk storage adapter
      index.ts              # Storage factory
    validators/
      auth.validator.ts
      booking.validator.ts
      vendor.validator.ts
      admin.validator.ts
    services/
      auth.service.ts
      marketplace.service.ts
      booking.service.ts
      vendor-ops.service.ts
      admin.service.ts
    controllers/
      auth.controller.ts
      marketplace.controller.ts
      booking.controller.ts
      vendor.controller.ts
      admin.controller.ts
      upload.controller.ts
    routes/
      auth.routes.ts
      marketplace.routes.ts
      booking.routes.ts
      vendor.routes.ts
      admin.routes.ts
      index.ts              # /api/v1 router aggregation
    docs/
      openapi.json          # OpenAPI 3.0 specification
  prisma/
    schema.prisma           # Prisma data models & migrations
    seed.ts                 # Realistic database seed
  tests/
    api.test.ts             # 21 comprehensive automated tests
```

---

## 4. Setup & Running Locally

### 1. Database & Migrations
```bash
# Start PostgreSQL (macOS Homebrew)
brew services start postgresql@16

# Run migrations and seed
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

### 2. Start the Backend Development Server
```bash
npm run dev
# Server listens on http://localhost:8000
```

### 3. Run Backend Test Suite
```bash
npm test
# Runs 21 Vitest integration tests against PostgreSQL
```

### 4. Build Production Bundle
```bash
npm run build
npm start
```

### 5. Docker Deployment
```bash
# Run both PostgreSQL and Backend containerized
docker-compose up --build -d
```

---

## 5. Seed Accounts for Testing

| Role | Name / Entity | Phone / Email | Password / OTP | Notes |
|------|---------------|---------------|----------------|-------|
| **Customer** | Aarav Mehta | `+919876543210` | OTP `123456` | Student, Maple Hostel B-204 |
| **Vendor Owner** | Green Bowl | `nisha@greenbowl.in` | `Password@123` | Food Vendor (Veg-only) |
| **Vendor Owner** | FreshFold Laundry | `rahul@freshfold.in` | `Password@123` | Laundry Vendor |
| **Vendor Owner** | Campus Wheels | `amit@campuswheels.in` | `Password@123` | Bike Rides Vendor |
| **Admin** | System Admin | `+919800000000` | `Admin@123` | Platform Administrator |

---

## 6. Endpoints Overview

- **Health**: `GET /health`, `GET /ready`
- **Docs**: `GET /api/v1/docs` (OpenAPI JSON)
- **Auth**:
  - `POST /api/v1/auth/customer/request-otp`
  - `POST /api/v1/auth/customer/verify-otp`
  - `POST /api/v1/auth/admin/login`
  - `POST /api/v1/auth/vendor/login`
  - `POST /api/v1/auth/vendor/activate`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET  /api/v1/auth/me`
  - `PATCH /api/v1/auth/profile`
- **Marketplace**:
  - `GET /api/v1/categories`
  - `GET /api/v1/vendors`
  - `GET /api/v1/vendors/:id`
  - `GET /api/v1/services/:id`
  - `GET /api/v1/offers`
- **Bookings**:
  - `POST /api/v1/bookings/ride/quote`
  - `POST /api/v1/bookings`
  - `GET  /api/v1/bookings`
  - `GET  /api/v1/bookings/:id`
  - `POST /api/v1/bookings/:id/cancel`
  - `PATCH /api/v1/bookings/:id/status`
  - `POST /api/v1/bookings/:id/assign-rider`
- **Vendor Operations**:
  - `GET /api/v1/vendor/profile`, `PATCH /api/v1/vendor/profile`
  - `GET /api/v1/vendor/stats`
  - `GET /api/v1/vendor/riders`, `POST`, `PATCH`, `DELETE`
  - `GET /api/v1/vendor/menu`, `POST`, `PATCH`, `DELETE`
  - `GET /api/v1/vendor/offers`, `POST`, `POST :id/toggle-publish`
- **Admin Operations**:
  - `POST /api/v1/admin/vendors`
  - `GET  /api/v1/admin/vendors`
  - `POST /api/v1/admin/vendors/:id/suspend`
  - `POST /api/v1/admin/vendors/:id/activate`
  - `POST /api/v1/admin/vendors/:id/remove`
  - `GET  /api/v1/admin/users`
  - `GET  /api/v1/admin/stats`
  - `GET  /api/v1/admin/activity`
