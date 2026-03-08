# AGENTS.md — My Hammer Syria

> This file provides essential guidance for AI coding agents working with this codebase.

## Project Overview

**My Hammer Syria** is a bilingual (Arabic/English) job marketplace connecting customers with craftspeople in Syria. The platform enables customers to post jobs, receive bids from craftsmen, communicate via real-time chat, process payments, and manage ratings/reviews.

### Key Features
- User authentication with role-based access (Customer, Craftsman, Admin)
- Job posting and bidding system
- Real-time messaging (WebSocket via Pusher)
- Payment processing (Stripe + local payment methods)
- Craftsman portfolio and ratings
- Bilingual UI (Arabic/English) with RTL support

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5 |
| UI | React 18, TailwindCSS 3.4 |
| Database | PostgreSQL with Prisma ORM 5.18 |
| Auth | NextAuth 5 (beta) with JWT strategy |
| i18n | next-intl 3.17 |
| State | Zustand (UI), React Query (server state) |
| Real-time | Pusher |
| Payments | Stripe |
| Images | Cloudinary |
| Validation | Zod |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-prefixed routes (/ar/*, /en/*)
│   │   ├── (auth)/               # Route group: Login, Register, Password reset
│   │   ├── (customer)/           # Route group: Job posting, My Jobs
│   │   ├── (craftsman)/          # Route group: Find jobs, My bids
│   │   ├── jobs/[jobId]/         # Public job detail
│   │   ├── messages/             # Chat interface
│   │   ├── profile/              # User profiles
│   │   ├── craftsmen/            # Craftsman directory
│   │   ├── payment/              # Checkout flows
│   │   ├── admin/                # Admin dashboard
│   │   └── page.tsx              # Landing page
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth handler + custom auth
│   │   ├── jobs/                 # Job CRUD
│   │   ├── bids/                 # Bid operations
│   │   ├── messages/             # Chat API
│   │   ├── conversations/        # Conversation management
│   │   ├── payments/             # Stripe integration
│   │   ├── upload/               # Cloudinary uploads
│   │   └── admin/                # Admin operations
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + Tailwind
├── components/
│   ├── ui/                       # Reusable UI primitives (Button, Input, Card, etc.)
│   ├── layout/                   # Navbar, Footer, MobileNav
│   ├── jobs/                     # Job cards, bid forms, filters
│   ├── chat/                     # Conversation list, chat window
│   └── providers/                # React Query provider
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── pusher.ts                 # Real-time messaging setup
│   ├── stripe.ts                 # Stripe configuration
│   ├── cloudinary.ts             # Cloudinary client
│   ├── constants.ts              # App constants (governorates, currencies)
│   └── validations/              # Zod schemas
├── hooks/
│   ├── useRealTimeChat.ts        # Pusher chat hook
│   └── useNotifications.ts       # Notification polling hook
├── store/
│   └── useStore.ts               # Zustand stores (UI state)
└── i18n/
    ├── request.ts                # next-intl request config
    ├── routing.ts                # Locale routing config
    └── navigation.ts             # Locale-aware navigation

prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Database seeding script

messages/
├── ar.json                       # Arabic translations
└── en.json                       # English translations
```

---

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client after schema changes
npm run db:migrate       # Run migrations (development)
npm run db:push          # Push schema without migration history
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI
```

---

## Routing Architecture

### Locale-Based Routing
- All user-facing pages are under `/[locale]/` (e.g., `/ar/jobs`, `/en/jobs`)
- Default locale: `ar` (Arabic)
- Supported locales: `ar`, `en`
- Middleware (`src/middleware.ts`) handles locale detection and redirection

### Route Groups
| Group | Purpose | Routes |
|-------|---------|--------|
| `(auth)` | Authentication pages | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `(customer)` | Customer features | `/post-job`, `/my-jobs` |
| `(craftsman)` | Craftsman features | `/find-jobs`, `/my-bids` |
| `(none)` | Public/shared routes | `/jobs`, `/profile`, `/messages`, `/craftsmen`, etc. |

### Auth Protection
- **No auth checks in middleware** — auth is handled per-page using `auth()` from `@/lib/auth`
- Server Components: `const session = await auth()`
- Client Components: `const { data: session } = useSession()` from `next-auth/react`

---

## Database Schema (Prisma)

### Core Models
- `User` — Base user with role (CUSTOMER | CRAFTSMAN | ADMIN)
- `CraftsmanProfile` — Extended profile for craftsmen
- `Job` — Job postings by customers
- `Bid` — Bids placed by craftsmen on jobs (unique constraint: one bid per craftsman per job)
- `Category` — Job/service categories
- `Review` — Ratings and reviews (one per completed job)
- `Conversation` & `Message` — Real-time chat
- `Payment` — Payment records
- `Notification` — User notifications
- `PortfolioItem` — Craftsman portfolio images

### Important Schema Notes
- **Bilingual content** stored as separate fields (e.g., `title`/`titleAr`)
- **`Job.images` is a JSON string** — parse with `JSON.parse()` on client
- **`Conversation.jobId` is optional** — conversations can exist independently
- Database indexes on frequently queried fields (status, role, governorate, etc.)

---

## Authentication

### Session Shape
```typescript
{
  user: {
    id: string,
    email: string,
    name?: string,
    image?: string,
    role: "CUSTOMER" | "CRAFTSMAN" | "ADMIN"
  }
}
```

### Usage Patterns
```typescript
// Server Component
import { auth } from "@/lib/auth";
const session = await auth();

// Client Component
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### Craftsman Registration
When `role=CRAFTSMAN`, registration automatically creates a `CraftsmanProfile` record.

---

## Internationalization (i18n)

### Configuration
- **Library**: `next-intl`
- **Default locale**: `ar` (Arabic-first market)
- **Translations**: `messages/ar.json`, `messages/en.json`

### Usage Patterns
```typescript
// Server Component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("jobs");

// Client Component
import { useTranslations } from "next-intl";
const t = useTranslations("jobs");
```

### RTL Support
- HTML `dir` and `lang` set dynamically based on locale
- Use Tailwind `start`/`end` classes instead of `left`/`right`
- Arabic font: Lalezar, English font: Inter

---

## Real-Time Features (Pusher)

### Channel Conventions
- `private-conversation-{conversationId}` — Chat messages
- `private-user-{userId}` — User notifications

### Events
Defined in `src/lib/pusher.ts`:
- `NEW_MESSAGE` — New chat message
- `NEW_NOTIFICATION` — User notification
- `BID_UPDATE` — Bid status changes
- `JOB_UPDATE` — Job status changes

### Graceful Degradation
The `safeTrigger()` helper silently ignores errors when Pusher is not configured. The app works via HTTP polling when Pusher is unavailable.

---

## Styling Guidelines

### Color Palette (Tailwind)
- **Primary**: `#12bc6c` (green) — `primary-50` to `primary-950`
- **Secondary**: `#f59e0b` (amber) — `secondary-50` to `secondary-950`

### RTL Best Practices
- Use `me-*` (margin-end) and `ms-*` (margin-start) instead of `ml-*`/`mr-*`
- Use `pe-*` (padding-end) and `ps-*` (padding-start)
- Use `text-start` and `text-end` instead of `text-left`/`text-right`
- Use `start-*` and `end-*` for positioning

### Utility Function
```typescript
import { cn } from "@/components/ui";
// Combines clsx and tailwind-merge for conditional classes
```

---

## Validation (Zod)

Schemas live in `src/lib/validations/`:
- `user.ts` — Registration, login, profile updates
- `job.ts` — Job creation, filtering
- `bid.ts` — Bid submission
- `review.ts` — Review submission

### API Route Pattern
```typescript
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return Response.json(
    { error: "Validation failed", details: parsed.error.flatten() },
    { status: 400 }
  );
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Required for PgBouncer/Neon

# Auth
AUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Pusher (optional — app works without)
PUSHER_APP_ID="..."
PUSHER_APP_KEY="..."
PUSHER_APP_SECRET="..."
PUSHER_APP_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_APP_KEY="..."
NEXT_PUBLIC_PUSHER_APP_CLUSTER="eu"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# Email (Resend or SMTP)
RESEND_API_KEY="re_..."
# OR SMTP_*

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Key Constants

From `src/lib/constants.ts`:
- `GOVERNORATES` — 14 Syrian provinces
- `CURRENCIES` — `["SYP", "USD"]`
- `JOB_STATUSES` — `["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]`
- `BID_STATUSES` — `["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]`
- `JOBS_PER_PAGE = 12`
- `MAX_IMAGES_PER_JOB = 5`
- `MAX_IMAGE_SIZE = 5MB`

---

## Testing

No automated test suite is currently configured. Manual testing workflow:

1. Run `npm run dev`
2. Run `npm run db:seed` to populate test data
3. Test flows:
   - Register as customer → Post job → Receive bids
   - Register as craftsman → Find jobs → Place bid
   - Accept bid → Chat → Mark complete → Leave review

---

## Common Tasks

### Adding a New API Route
1. Create file in `src/app/api/[resource]/route.ts`
2. Export `GET`/`POST`/`PATCH`/`DELETE` handlers
3. Use `auth()` to check authentication
4. Use Zod schemas for validation
5. Use `prisma` client for database operations

### Adding a New Page
1. Create under `src/app/[locale]/[route]/page.tsx`
2. Export async function for Server Components (default)
3. Add `"use client"` directive for Client Components
4. Use `getTranslations()` for server-side translations
5. Import from `@/components/*` using path alias

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate` to update client
3. Run `npm run db:migrate` (dev) or `npm run db:push`
4. Update seed data in `prisma/seed.ts` if needed

### Adding Translations
1. Add keys to both `messages/ar.json` and `messages/en.json`
2. Use nested structure (e.g., `"jobs.post.title"`)
3. Access via `t("jobs.post.title")`

---

## Deployment Notes

### Build Requirements
- Node.js 18+
- PostgreSQL 14+
- Environment variables configured

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Generate `AUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure Stripe webhook endpoint
- [ ] Configure Cloudinary for image uploads
- [ ] Configure Pusher for real-time features (optional)

---

## Security Considerations

- Passwords hashed with bcryptjs
- JWT session strategy
- CSRF protection via NextAuth
- SQL injection prevention via Prisma ORM
- XSS prevention via React escaping
- File upload restrictions (Cloudinary handles security)

---

## Path Aliases

All imports use `@/*` which maps to `src/*`:
```typescript
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui";
import { prisma } from "@/lib/prisma";
```
