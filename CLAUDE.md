# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

My-Hammer-Syria is a bilingual (Arabic/English) job marketplace for craftspeople in Syria. Customers post jobs, craftspeople bid on them. The app supports real-time messaging, payments, ratings, and portfolio showcasing.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Serve production build
npm run lint         # Run ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Run Prisma migrations (dev)
npm run db:push      # Push schema without migration history
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture

### Routing

Next.js 14 App Router with locale-based routing via `next-intl`. All user-facing pages live under `src/app/[locale]/` and are served at `/ar/...` or `/en/...`. Route groups organize pages by role:

- `(auth)` — login, register, password reset
- `(customer)` — posting and managing jobs
- `(craftsman)` — finding jobs and managing bids
- `jobs/`, `profile/`, `messages/`, `notifications/`, `craftsmen/`, `payment/`, `admin/` — shared routes

Middleware (`src/middleware.ts`) handles locale detection only — no auth checks there. Auth is checked per-page/per-route via `auth()`.

### API Routes

All API endpoints live under `src/app/api/`. Key route groups:
- `/api/auth/` — NextAuth handler + register, forgot-password, reset-password
- `/api/jobs/`, `/api/bids/` — core marketplace operations
- `/api/conversations/`, `/api/messages/` — real-time chat
- `/api/pusher/auth/` — Pusher channel authentication
- `/api/payments/` — Stripe payment handling
- `/api/upload/` — Cloudinary image uploads
- `/api/admin/` — admin-only operations

### Authentication

NextAuth 5 (beta) with Credentials provider and `@auth/prisma-adapter`. JWT session strategy. Three user roles: `CUSTOMER`, `CRAFTSMAN`, `ADMIN`. Auth logic lives in `src/lib/auth.ts`. Passwords hashed with bcryptjs.

Session object shape:
```typescript
{ user: { id: string, email: string, name?: string, image?: string, role: string } }
```

Usage in server components: `const session = await auth()` (from `@/lib/auth`).
Usage in client components: `const { data: session } = useSession()` (from `next-auth/react`).

When role=CRAFTSMAN, registration also creates a `CraftsmanProfile` record. Password reset uses the separate `PasswordResetToken` model with expiry.

### Database

PostgreSQL via Prisma. Core models: `User`, `CraftsmanProfile`, `Job`, `Bid`, `Category`, `Review`, `PortfolioItem`, `Conversation`, `Message`, `ConversationParticipant`, `Payment`, `Notification`. Schema at `prisma/schema.prisma`. Always run `npm run db:generate` after schema changes.

Key non-obvious schema details:
- Bilingual content is stored as separate fields (e.g., `title` / `titleAr`) — not via i18n keys
- `Job.images` is a **JSON string** (not a separate table) — parse it on the client
- `Conversation.jobId` is optional — conversations can exist independently of jobs
- One bid per craftsman per job is enforced with a unique constraint on `(jobId, craftsmanId)`

### Real-time

Pusher for live chat and notifications. Server-side client in `src/lib/pusher.ts` exposes a `safeTrigger()` helper that silently ignores errors when Pusher is not configured — the app degrades gracefully to HTTP polling.

Channel conventions:
- `private-conversation-{conversationId}` — chat messages
- `private-user-{userId}` — per-user notifications

Event names come from the `PUSHER_EVENTS` constant: `NEW_MESSAGE`, `NEW_NOTIFICATION`, `BID_UPDATE`, `JOB_UPDATE`.

Custom hooks: `useRealTimeChat(conversationId, userId)` and `useNotifications(userId)` in `src/hooks/`.

### Internationalization

`next-intl` handles Arabic/English. Translation strings live in `messages/ar.json` and `messages/en.json`. Components use the `useTranslations()` hook (client) or `getTranslations()` (server). **Default locale is `ar`** (Arabic-first market).

RTL layout: `dir` and `lang` are set on `<html>` in `src/app/[locale]/layout.tsx`. Arabic uses Lalezar font, English uses Inter. Use Tailwind `start`/`end` classes instead of `left`/`right` so RTL flips automatically via `tailwindcss-rtl`.

### State & Data Fetching

- **React Query** (`@tanstack/react-query`) for server state and caching — used in client components
- **Zustand** for global UI/client state (`src/store/useStore.ts`): `useUIStore` (mobile menu, notification panel) and `useUserPreferences` (locale, persisted to localStorage)
- **Axios** for HTTP requests from the client

### Styling

TailwindCSS with a custom green primary (`#12bc6c`) and amber secondary (`#f59e0b`) color palette. RTL support via `tailwindcss-rtl`. UI primitives are Radix-UI components wrapped in `src/components/ui/` and re-exported from `src/components/ui/index.ts`. The `cn()` utility (clsx + tailwind-merge) is used throughout for conditional class composition.

### Validation

Zod schemas live in `src/lib/validations/`. API routes use `schema.safeParse(body)` and return `{ error, details: parsed.error.flatten() }` with status 400 on failure. Key schemas: `registerSchema`, `loginSchema`, `createJobSchema`, `filterJobsSchema`.

### Path Aliases

`@/*` maps to `src/*` — use this for all imports within the project.

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` + `DIRECT_URL` — PostgreSQL (supports Neon/PgBouncer connection pooling)
- `AUTH_SECRET`, `NEXTAUTH_URL` — auth config (`openssl rand -base64 32` for secret)
- `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` — real-time messaging (optional, app works without it)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` — payments
- `CLOUDINARY_*` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — image uploads
- `RESEND_API_KEY` or SMTP vars — email delivery
- `GOOGLE_CLIENT_ID/SECRET` — optional OAuth

## Key Constants

Defined in `src/lib/constants.ts`: `GOVERNORATES` (14 Syrian provinces), `CURRENCIES` (SYP/USD), job/bid status enums, `JOBS_PER_PAGE = 12`, `MAX_IMAGES_PER_JOB = 5`, `MAX_IMAGE_SIZE = 5MB`, `CURRENCY_SYMBOLS = { SYP: "ل.س", USD: "$" }`.
