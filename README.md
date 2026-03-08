# My Hammer Syria — مطرقتي سوريا

A bilingual (Arabic/English) job marketplace for craftspeople in Syria. Customers post jobs, craftspeople bid on them. The platform supports real-time messaging, payments, ratings, and portfolio management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 3 + RTL support |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| Real-time | Pusher |
| Payments | Stripe |
| Image Uploads | Cloudinary |
| Email | Resend or SMTP |
| i18n | next-intl (Arabic default, English) |
| State | React Query + Zustand |

---

## Prerequisites

Make sure these are installed on your machine:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** (local install or cloud — e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com))
- **Git**

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/My-Hammer-Syria.git
cd My-Hammer-Syria
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Now open `.env` and fill in the values. See the section below for details on each variable.

### 4. Set up the database

```bash
# Run migrations and create all tables
npm run db:migrate

# Generate the Prisma client
npm run db:generate

# (Optional) Seed the database with demo data
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

The app is now running at **http://localhost:3000**

The default language is Arabic (`/ar/`). You can switch to English at `/en/`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in these values:

### Required — Database

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/my_hammer_syria"

# Same as DATABASE_URL unless you use a connection pooler (e.g. Neon/PgBouncer)
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/my_hammer_syria"
```

> **Tip for local Postgres:** `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/my_hammer_syria"`

### Required — Authentication

```env
# Generate a secret: openssl rand -base64 32
AUTH_SECRET="your-random-secret-here"

NEXTAUTH_URL="http://localhost:3000"
```

### Required — App URL

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Optional — Real-time Chat (Pusher)

Without Pusher, the app still works — it falls back to HTTP polling.

Create a free account at [pusher.com](https://pusher.com), then:

```env
PUSHER_APP_ID="your-app-id"
PUSHER_APP_KEY="your-app-key"
PUSHER_APP_SECRET="your-app-secret"
PUSHER_APP_CLUSTER="eu"

NEXT_PUBLIC_PUSHER_APP_KEY="your-app-key"
NEXT_PUBLIC_PUSHER_APP_CLUSTER="eu"
```

### Optional — Payments (Stripe)

Create a free test account at [stripe.com](https://stripe.com):

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Optional — Image Uploads (Cloudinary)

Create a free account at [cloudinary.com](https://cloudinary.com):

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

### Optional — Email (choose one)

**Option A — Resend:**
```env
RESEND_API_KEY="re_..."
```

**Option B — SMTP:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="you@gmail.com"
SMTP_PASS="your-app-password"
```

### Optional — Google OAuth

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## Available Scripts

```bash
npm run dev           # Start development server (localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

npm run db:generate   # Regenerate Prisma client (run after schema changes)
npm run db:migrate    # Run database migrations
npm run db:push       # Push schema to DB without migration history
npm run db:seed       # Seed database with demo data
npm run db:studio     # Open Prisma Studio (visual DB browser)
```

---

## Project Structure

```
My-Hammer-Syria/
├── src/
│   ├── app/
│   │   ├── api/                  # API routes (auth, jobs, bids, messages, payments...)
│   │   └── [locale]/             # Pages with locale routing (ar/, en/)
│   │       ├── (auth)/           # Login, Register, Password Reset
│   │       ├── (customer)/       # Post Job, My Jobs
│   │       ├── (craftsman)/      # Find Jobs, My Bids
│   │       ├── jobs/[jobId]/     # Job detail page
│   │       ├── messages/         # Chat
│   │       ├── profile/          # User profiles
│   │       ├── admin/            # Admin dashboard
│   │       └── page.tsx          # Landing page
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Auth, Prisma, Stripe, Pusher, utils
│   ├── hooks/                    # Custom hooks (realtime chat, notifications)
│   ├── store/                    # Zustand global state
│   └── middleware.ts             # Locale detection
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script
├── messages/
│   ├── ar.json                   # Arabic translations
│   └── en.json                   # English translations
└── .env.example                  # Environment variables template
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| `CUSTOMER` | Post jobs, accept bids, pay, leave reviews |
| `CRAFTSMAN` | Browse jobs, place bids, manage portfolio |
| `ADMIN` | Manage all users, jobs, and platform content |

---

## Database (Quick Reference)

```bash
# Start Prisma Studio to view/edit data in the browser
npm run db:studio
# Opens at http://localhost:5555
```

After any change to `prisma/schema.prisma`, run:
```bash
npm run db:generate
npm run db:migrate
```

---

## Troubleshooting

**`Cannot find module '@prisma/client'`**
```bash
npm run db:generate
```

**Database connection error**
- Make sure PostgreSQL is running
- Check that `DATABASE_URL` in `.env` is correct
- For local Postgres, ensure the database exists: `createdb my_hammer_syria`

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```

**Pusher errors in console**
- These are non-fatal. The app works without Pusher configured.
- To suppress: add the Pusher variables to `.env`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is private and not open for public use without permission.
