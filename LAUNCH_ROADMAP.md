# My Hammer Syria — Complete Launch Roadmap
> Last updated: 2026-03-08
> Overall completion: **~80%**
> This document is the single source of truth for everything needed before go-live.

---

## Table of Contents
1. [Project Status Overview](#1-project-status-overview)
2. [PHASE 1 — Critical Blockers](#2-phase-1--critical-blockers-must-fix-before-any-launch)
3. [PHASE 2 — Core Completions](#3-phase-2--core-completions-required-for-proper-launch)
4. [PHASE 3 — Security Hardening](#4-phase-3--security-hardening)
5. [PHASE 4 — Admin Panel](#5-phase-4--admin-panel)
6. [PHASE 5 — UX & Feature Polish](#6-phase-5--ux--feature-polish)
7. [PHASE 5.5 — Google & SEO Präsenz ⭐](#7-phase-55--google--seo-präsenz-)
8. [PHASE 6 — Infrastructure & Deployment](#8-phase-6--infrastructure--deployment)
9. [PHASE 7 — Post-Launch Monitoring](#9-phase-7--post-launch-monitoring)
10. [File-Level TODO Index](#10-file-level-todo-index)
11. [Environment Variables Checklist](#11-environment-variables-checklist)
12. [Full Feature Matrix](#12-full-feature-matrix)

---

## 1. Project Status Overview

### What is fully working ✅
- **Authentication** — login, register (5-step), forgot/reset password (flow exists, no email)
- **Job lifecycle** — post job (4-step), browse jobs, bid, accept bid, mark complete, leave review
- **Real-time chat** — Pusher-powered messaging per conversation
- **Profiles** — customer + craftsman profiles, portfolio upload, edit
- **Payments** — Stripe card payment (PaymentIntent + Webhook) wired up
- **Image uploads** — Cloudinary (jobs: 5 max, portfolio: unlimited, avatar: 1)
- **Notifications** — real-time via Pusher, unread count, mark-read
- **Bilingual** — Arabic (default) + English, RTL/LTR, all 391 translation keys
- **Landing page** — hero, categories, featured jobs, testimonials, animations
- **Admin** — basic dashboard with stats + user activation toggle
- **All pages exist** — 31 pages, 28 API endpoints

### What is broken / missing / stubbed ❌
| Area | Status |
|------|--------|
| Email delivery | 0% — completely unimplemented |
| Rate limiting | 0% — no protection |
| Email verification | 0% — isVerified field exists, never used |
| Cash/Bank/Syriatel payments | UI only — no backend |
| Dispute resolution | 0% — no model, no UI, no API |
| Content moderation | 0% |
| Admin panel (full) | 30% — only user activation done |
| Testing | 0% — zero tests |
| Error monitoring | 0% — no Sentry or equivalent |
| About page | Placeholder — no content |
| Contact form emails | Stubbed — TODO comment only |

---

## 2. PHASE 1 — Critical Blockers (must fix before any launch)

These items make the app **non-functional** for real users. Nothing launches without them.

---

### 2.1 Email Delivery System

**Why critical:** Users who forget their password are permanently locked out.
**Current state:** `forgot-password/route.ts` generates a reset token and logs it to the console with a TODO comment. No email is ever sent.

#### Steps:
- [ ] Sign up for [Resend](https://resend.com) (recommended — simple API, free tier 3,000/month)
  - Alternative: SendGrid, Mailgun, AWS SES, or SMTP (Gmail/Outlook)
- [ ] Add env vars: `RESEND_API_KEY` + `EMAIL_FROM` (e.g. `noreply@myhammersyria.com`)
- [ ] Create `src/lib/email.ts`:
  ```ts
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  export async function sendPasswordResetEmail(to: string, resetUrl: string, locale: string) { ... }
  export async function sendWelcomeEmail(to: string, name: string, locale: string) { ... }
  export async function sendContactEmail(name: string, email: string, message: string) { ... }
  ```
- [ ] Replace TODO in `src/app/api/auth/forgot-password/route.ts` (line ~39):
  - Call `sendPasswordResetEmail(user.email, resetUrl, locale)`
  - `resetUrl = ${process.env.NEXTAUTH_URL}/${locale}/reset-password?token=${token}`
- [ ] Replace TODO in `src/app/api/contact/route.ts` (line ~33):
  - Call `sendContactEmail(name, email, message)`
  - Send copy to admin email address
- [ ] Create bilingual email templates (Arabic + English):
  - Password reset email (subject, body, CTA button)
  - Welcome / registration confirmation email
  - Contact form confirmation (auto-reply to user)
- [ ] Test all 3 email flows end-to-end

**Files to edit:**
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/contact/route.ts`
- `src/lib/email.ts` (create new)

---

### 2.2 Rate Limiting

**Why critical:** Without it, attackers can brute-force passwords (1000 attempts/second is trivial).

#### Steps:
- [ ] Set up [Upstash Redis](https://upstash.com) — free tier 10,000 commands/day
  - Add env vars: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- [ ] Install `@upstash/ratelimit` + `@upstash/redis`
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```
- [ ] Create `src/lib/ratelimit.ts` with limits:
  - Login: 5 attempts per IP per 15 minutes
  - Register: 3 accounts per IP per hour
  - Forgot password: 3 requests per email per hour
  - Contact form: 5 per IP per hour
  - API endpoints: 100 requests per user per minute
- [ ] Apply rate limit check at start of each protected route:
  ```ts
  const { success } = await limiter.limit(ip);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  ```
- [ ] Apply to:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/contact/route.ts`
  - `src/app/api/jobs/route.ts` (POST)
  - `src/app/api/bids/` (POST)
  - `src/app/api/messages/` (POST)
  - `src/app/api/upload/route.ts`
- [ ] Return human-readable error (bilingual) + Retry-After header

**Files to edit/create:**
- `src/lib/ratelimit.ts` (create new)
- All API routes listed above

---

### 2.3 Email Verification on Registration

**Why critical:** Without it, anyone can register with a fake email. Spam/abuse becomes uncontrollable.

#### Steps:
- [ ] Add `emailVerifiedAt DateTime?` to User model in `prisma/schema.prisma` (field `isVerified` already exists)
- [ ] Run `npm run db:migrate`
- [ ] On registration (`src/app/api/auth/register/route.ts`):
  - After creating the user, generate a verification token (similar to password reset)
  - Store token in `PasswordResetToken` table (or create separate `EmailVerificationToken` model)
  - Send welcome email with verification link
- [ ] Create `/api/auth/verify-email?token=...` endpoint:
  - Validate token exists and not expired (24h)
  - Set `user.isVerified = true` and `emailVerifiedAt = now()`
  - Delete token
  - Redirect to `/login?verified=1`
- [ ] Create `/[locale]/verify-email/page.tsx` — landing page for the link
- [ ] Gate access: unverified users redirected to `/verify-email-pending` with resend option
- [ ] Create `/[locale]/verify-email-pending/page.tsx` — "Please verify your email" screen
- [ ] Add "Resend verification" API: `POST /api/auth/resend-verification`
- [ ] Add translations for verification flow in `messages/en.json` + `messages/ar.json`

**Files to create/edit:**
- `prisma/schema.prisma`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts` (create)
- `src/app/api/auth/resend-verification/route.ts` (create)
- `src/app/[locale]/verify-email/page.tsx` (create)
- `src/app/[locale]/verify-email-pending/page.tsx` (create)
- `messages/en.json`, `messages/ar.json`

---

### 2.4 Non-Stripe Payment Methods (Cash / Bank Transfer / Syriatel)

**Why critical:** Most Syrian users cannot use Stripe (international cards required). Cash/Syriatel are the primary real-world payment methods.

#### Current state:
`/payment/checkout` shows 4 payment method tabs (Stripe, Cash, Bank Transfer, Syriatel Cash) but only Stripe has backend processing. The other 3 are UI-only with no submission logic.

#### Steps:

**Cash Payment:**
- [ ] On "Pay with Cash" submit:
  - `POST /api/payments/cash-confirm` with `{ bidId, jobId, amount, currency }`
  - Create `Payment` record with `status: PENDING`, `method: CASH`
  - Notify customer to meet craftsman and pay in cash
  - Notify craftsman that customer chose cash payment
  - Customer confirms after paying → `POST /api/payments/[paymentId]/confirm-cash`
  - Admin can also confirm → in admin panel
- [ ] Update `Payment` model: add `method` field: `STRIPE | CASH | BANK_TRANSFER | SYRIATEL`
- [ ] Add `confirmedAt DateTime?` field to Payment

**Bank Transfer:**
- [ ] Create bank transfer instructions page/modal with:
  - Bank name, IBAN, account number, reference code (= jobId or bidId)
  - Show reference code the customer should include in the transfer
- [ ] `POST /api/payments/bank-transfer` — creates PENDING payment, sends instructions email
- [ ] Customer uploads proof of transfer → `POST /api/upload` → attach to payment
- [ ] Admin reviews and approves in admin panel → marks COMPLETED
- [ ] Notify both parties when approved

**Syriatel Cash:**
- [ ] Implement Syriatel Cash API (if available) OR create manual flow:
  - Customer pays via Syriatel mobile → enters transaction confirmation code
  - `POST /api/payments/syriatel` with `{ transactionCode, amount, phone }`
  - Backend verifies code with Syriatel API (if available) OR admin verifies manually
- [ ] Fix the placeholder phone number `+0944 XXX XXX` in checkout page

**Files to create/edit:**
- `prisma/schema.prisma` (add `method`, `confirmedAt` to Payment)
- `src/app/api/payments/cash-confirm/route.ts` (create)
- `src/app/api/payments/bank-transfer/route.ts` (create)
- `src/app/api/payments/syriatel/route.ts` (create)
- `src/app/api/payments/[paymentId]/confirm/route.ts` (create)
- `src/app/[locale]/payment/checkout/page.tsx` (complete all payment method handlers)

---

## 3. PHASE 2 — Core Completions (required for proper launch)

These items make the app complete for real-world usage.

---

### 3.1 Dispute Resolution System

**Why needed:** When a customer is unhappy with work, or a craftsman isn't paid — there is currently zero mechanism to handle this.

#### Steps:
- [ ] Add `Dispute` model to `prisma/schema.prisma`:
  ```prisma
  model Dispute {
    id          String        @id @default(cuid())
    jobId       String
    job         Job           @relation(fields: [jobId], references: [id])
    openedById  String
    openedBy    User          @relation("disputeOpener", fields: [openedById], references: [id])
    againstId   String
    against     User          @relation("disputeTarget", fields: [againstId], references: [id])
    reason      String
    description String
    evidence    String?       // JSON array of Cloudinary URLs
    status      DisputeStatus @default(OPEN)
    resolution  String?
    resolvedById String?
    resolvedAt  DateTime?
    createdAt   DateTime      @default(now())
    updatedAt   DateTime      @updatedAt
  }
  enum DisputeStatus { OPEN UNDER_REVIEW RESOLVED_CUSTOMER RESOLVED_CRAFTSMAN RESOLVED_MUTUAL CLOSED }
  ```
- [ ] Run `npm run db:migrate`
- [ ] Create API endpoints:
  - `POST /api/disputes` — open a dispute (customer or craftsman)
  - `GET /api/disputes/me` — user's own disputes
  - `GET /api/disputes/[disputeId]` — single dispute detail
  - `POST /api/disputes/[disputeId]/evidence` — attach evidence files
  - `PATCH /api/admin/disputes/[disputeId]` — admin resolves dispute
- [ ] Create pages:
  - `/[locale]/disputes/` — list user's disputes
  - `/[locale]/disputes/[disputeId]` — dispute detail + chat with admin
  - `/[locale]/disputes/open?jobId=...` — open dispute form
- [ ] Add "Open Dispute" button on job detail page (visible after job COMPLETED)
- [ ] Notify admin when new dispute opened
- [ ] Notify both parties when dispute resolved
- [ ] Admin panel: dispute list + resolution interface
- [ ] Add translations for all dispute UI

---

### 3.2 Complete Notification System

**Why needed:** Currently only `NEW_REVIEW` creates notifications. Users miss important events.

#### All notification types to implement:
- [ ] `NEW_BID` — customer receives when craftsman bids on their job
- [ ] `BID_ACCEPTED` — craftsman receives when customer accepts their bid
- [ ] `BID_REJECTED` — craftsman receives when customer rejects their bid
- [ ] `BID_WITHDRAWN` — customer receives when craftsman withdraws bid
- [ ] `NEW_MESSAGE` — receiver gets notification (with conversation link)
- [ ] `JOB_COMPLETED` — craftsman receives when customer marks job complete
- [ ] `PAYMENT_RECEIVED` — craftsman receives when payment processed
- [ ] `PAYMENT_CONFIRMED` — customer receives payment confirmation
- [ ] `DISPUTE_OPENED` — other party + admin receives
- [ ] `DISPUTE_RESOLVED` — both parties receive
- [ ] `NEW_REVIEW` — already implemented ✅
- [ ] `ACCOUNT_VERIFIED` — user receives when email verified
- [ ] `JOB_EXPIRED` — customer receives when job deadline passed with no accepted bid

**Files to edit:**
- `src/app/api/jobs/[jobId]/bids/route.ts` (add NEW_BID)
- `src/app/api/jobs/[jobId]/bids/[bidId]/route.ts` (add BID_ACCEPTED, BID_REJECTED)
- `src/app/api/messages/[conversationId]/route.ts` (add NEW_MESSAGE)
- `src/app/api/jobs/[jobId]/complete/route.ts` (add JOB_COMPLETED, PAYMENT triggers)
- Create `src/lib/notifications.ts` helper to centralize all notification creation

---

### 3.3 Complete About Page

**Current state:** `/[locale]/about/page.tsx` is a placeholder.

- [ ] Write about content (mission, story, team, values)
- [ ] Add Arabic + English versions
- [ ] Include: mission statement, how it works (visual), team/founder section, contact info
- [ ] Add translations to `messages/en.json` + `messages/ar.json` under `about.*`

---

### 3.4 Complete Job Lifecycle Edge Cases

- [ ] **Job expiry:** When `deadline` passes with no ACCEPTED bid → auto-close job or notify customer
  - Create a cron job or Next.js scheduled function (Vercel Cron)
  - `PUT /api/jobs/expire` — find and close expired open jobs
- [ ] **Withdraw bid:** Already UI-exists, ensure notification fires correctly
- [ ] **Re-open job:** If accepted craftsman cancels → allow customer to re-open job to new bids
- [ ] **Job images display:** `Job.images` is stored as JSON string — verify all display locations correctly parse it with `JSON.parse()`
- [ ] **Edit job:** PATCH endpoint exists but no edit page — create `/my-jobs/[jobId]/edit`
- [ ] **Delete job:** Confirm that deleting a job with accepted bids notifies the craftsman

---

### 3.5 Advanced Search & Filtering

**Current state:** Find Jobs has category, governorate, search filters. Missing important filters.

- [ ] **Budget range filter:** min/max slider input → pass to `filterJobsSchema`
- [ ] **Date range filter:** posted in last 7/30/90 days
- [ ] **Job status filter:** Open only vs All (for public browsing)
- [ ] **Sort options:** Newest, Oldest, Budget High→Low, Budget Low→High, Most Bids
- [ ] **Craftsmen page filters:**
  - Rating filter (4+ stars)
  - Availability (available now)
  - Years of experience range
  - Online/offline status
- [ ] **Search suggestions:** As user types, show matching job titles (debounced)
- [ ] **Save search / bookmarks:** Let users save filter presets
- [ ] Update `filterJobsSchema` in `src/lib/validations/job.ts`
- [ ] Update `src/app/api/jobs/route.ts` to handle new filter params

---

### 3.6 Improve Registration Flow

- [ ] **Step 5 (Craftsman) — "Categories" not mandatory:** Require at least 1 category selected
- [ ] **Profile image upload during registration:** Currently only optional text fields
- [ ] **Phone number format validation:** Add regex for Syrian numbers (+963...)
- [ ] **Terms acceptance checkbox:** Show T&C link, require tick before final submit
- [ ] **Registration success redirect:** After email verification, auto-fill name on login

---

## 4. PHASE 3 — Security Hardening

---

### 4.1 HTTP Security Headers

- [ ] Add to `next.config.ts`:
  ```ts
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
    ]
  }]
  ```
- [ ] Configure CSP to allow: Cloudinary images, Pusher, Stripe, Google Fonts
- [ ] Test CSP in browser — no console violations

---

### 4.2 Input Sanitization

- [ ] Install `dompurify` or `xss` package
- [ ] Sanitize all user-generated text before storing:
  - Job titles, descriptions
  - Chat messages
  - Bio, business names
  - Review text
- [ ] Sanitize before displaying in `dangerouslySetInnerHTML` contexts (if any)

---

### 4.3 File Upload Security

- [ ] Validate MIME type on server (not just extension) — read file magic bytes
- [ ] Add virus scanning (Cloudinary offers this as add-on, or ClamAV)
- [ ] Delete Cloudinary file when: portfolio item deleted, job deleted, profile picture replaced
  - Implement `deleteCloudinaryImage(publicId)` helper
  - Call in: `DELETE /api/portfolio/[id]`, `DELETE /api/jobs/[jobId]`, `PATCH /api/users/me`
- [ ] Rate limit uploads: max 10 images per user per hour

---

### 4.4 API Security Improvements

- [ ] Add `X-Request-ID` header to all responses for tracing
- [ ] Never return stack traces in production error responses
- [ ] Audit all `select` clauses in Prisma queries — ensure passwords never returned
- [ ] Add `zod.safeParse` to ALL API routes (a few may be missing)
- [ ] Implement request ID logging for audit trail
- [ ] Add Cloudinary signature verification on upload responses

---

### 4.5 Stripe Security

- [ ] Verify webhook signature on EVERY call to `POST /api/payments/webhook`
  - ✅ Already implemented, but double-check `stripe.webhooks.constructEvent` is called before any processing
- [ ] Ensure PaymentIntent amount matches expected bid amount (prevent manipulation)
- [ ] Add idempotency keys to PaymentIntent creation
- [ ] Store Stripe customer ID on User model for returning customers

---

## 5. PHASE 4 — Admin Panel

The current admin panel (`/admin`) is a bare-bones dashboard. For a live marketplace, admins need full control.

---

### 5.1 User Management

- [ ] **User list page** `/admin/users`:
  - Search by name/email
  - Filter by role (CUSTOMER/CRAFTSMAN/ADMIN)
  - Filter by status (active/inactive/unverified)
  - Pagination
- [ ] **User detail page** `/admin/users/[userId]`:
  - Full profile info
  - Activity stats (jobs posted, bids made, reviews given/received)
  - Action buttons: Activate, Deactivate, Delete, Promote to Admin
  - View all their jobs, bids, reviews
- [ ] **API:** `GET /api/admin/users`, `GET /api/admin/users/[userId]`
- [ ] **Delete user:** Soft-delete with data retention

---

### 5.2 Job Management

- [ ] **Job list page** `/admin/jobs`:
  - All jobs across all users
  - Filter by status, category, governorate
  - Search by title
- [ ] **Job detail** `/admin/jobs/[jobId]`:
  - View full job + all bids
  - Edit any field
  - Delete job (with notification to customer)
  - Feature/unfeature job on landing page
- [ ] **Flagged jobs queue:** Jobs reported by users as inappropriate
- [ ] **API:** `GET /api/admin/jobs`, `DELETE /api/admin/jobs/[jobId]`, `PATCH /api/admin/jobs/[jobId]`

---

### 5.3 Review Moderation

- [ ] **Review list** `/admin/reviews`:
  - All reviews, sortable by rating, date
  - Filter by: low ratings (1-2 stars), flagged reviews
- [ ] **Actions:** Delete review, flag, restore
- [ ] **API:** `GET /api/admin/reviews`, `DELETE /api/admin/reviews/[reviewId]`

---

### 5.4 Payment Reports

- [ ] **Payments list** `/admin/payments`:
  - All payments across platform
  - Filter by: status (PENDING/COMPLETED/FAILED/REFUNDED), method, date range
  - Export to CSV
- [ ] **Manual payment confirmation** (for Cash/Bank transfers):
  - Queue of PENDING payments
  - Admin confirms → marks COMPLETED, notifies parties
- [ ] **Revenue stats:** Total collected, by month, by payment method
- [ ] **Refund action:** Admin can initiate Stripe refund + mark refunded
- [ ] **API:** `GET /api/admin/payments`, `PATCH /api/admin/payments/[paymentId]`

---

### 5.5 Dispute Management

- [ ] **Disputes list** `/admin/disputes`:
  - Open disputes queue
  - Status filter
- [ ] **Dispute detail** `/admin/disputes/[disputeId]`:
  - View all evidence, messages
  - Communicate with both parties
  - Set resolution + status
- [ ] See Phase 2 Dispute API (above)

---

### 5.6 Analytics Dashboard

- [ ] Replace static stats with real-time charts:
  - New registrations per day (last 30 days)
  - Jobs posted per week
  - Bids per job (average)
  - Conversion rate (job posted → completed)
  - Revenue per month
  - Most popular categories
  - Top craftsmen by rating
  - Geographic heatmap (jobs by governorate)
- [ ] Use a charting library: `recharts` or `chart.js`
- [ ] **API:** `GET /api/admin/analytics?range=30d`

---

### 5.7 Content Moderation Tools

- [ ] **Reported content queue:** Users can flag jobs/messages/profiles
  - Add "Report" button on JobCard, ProfileHeader, MessageBubble
  - `POST /api/reports` — create report
  - Admin sees all reports `/admin/reports`
- [ ] **Profanity filter:** Block slurs/inappropriate content in Arabic + English
  - Use `bad-words` npm package + Arabic word list
  - Apply on: job descriptions, chat messages, bio, business name, reviews

---

## 6. PHASE 5 — UX & Feature Polish

---

### 6.1 Missing UI Components

- [ ] **Textarea component** — `src/components/ui/Textarea.tsx`:
  - Currently raw `<textarea>` is used in PostJobForm — extract into reusable component
  - Same styling system as `Input.tsx`, with label + error props
- [ ] **DatePicker component** — for job deadline selection:
  - Currently a raw `<input type="date">` — replace with a styled date picker
  - Block past dates, show calendar
- [ ] **Image Lightbox** — for job image galleries:
  - Click thumbnail → full-screen overlay with next/prev navigation
  - Use `yet-another-react-lightbox` or `react-image-lightbox`
- [ ] **Confirm Dialog** — reusable modal for destructive actions:
  - "Delete this job?", "Withdraw bid?", "Remove portfolio item?"
  - Currently uses browser `confirm()` — replace with styled modal
- [ ] **Pagination component** — reusable across Jobs, Admin lists, etc.
- [ ] **Empty state components** — consistent "no results" illustration + message
- [ ] **Loading skeletons** — add more skeleton variants (JobCard, BidCard, ProfileHeader)

---

### 6.2 Craftsman Enhancements

- [ ] **Availability status:** Toggle "Available for work" / "Busy" — show on profile + craftsmen list
- [ ] **Response time badge:** "Usually responds within 2 hours" based on message data
- [ ] **Completion rate:** % of accepted bids that were completed — display on profile
- [ ] **Categories management on profile:** Let craftsman add/remove categories post-registration
- [ ] **Business hours:** Optional schedule (Mon-Fri 9am-6pm etc.)
- [ ] **Service radius:** Set delivery/travel radius on a map or by governorate list
- [ ] **Verification badge:** Admin can manually verify craftsman (license, insurance) → shows badge

---

### 6.3 Customer Enhancements

- [ ] **Saved/Bookmarked craftsmen:** Heart icon on craftsman card → saved list
  - `FavoriteCraftsman` model in DB
  - `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/[id]`
  - `/[locale]/favorites` page
- [ ] **Job templates:** Customer can duplicate a previous job
  - "Post similar job" button on job detail
- [ ] **Re-hire a craftsman:** Direct hire option after completed job
  - Quick-post job addressed to specific craftsman
- [ ] **Budget history:** See what others paid for similar jobs (anonymized)

---

### 6.4 Messaging Improvements

- [ ] **Typing indicator:** "Ahmad is typing..." — via Pusher presence channel
- [ ] **Read receipts:** Show "Read" / tick icon on messages
- [ ] **File attachments:** Upload images/docs directly in chat
  - Use existing `/api/upload` endpoint
- [ ] **Message search:** Search within a conversation
- [ ] **Conversation archive:** Archive old conversations
- [ ] **Block user:** Block from messaging and bidding
  - `BlockedUser` model
  - Admin can see blocked relationships

---

### 6.5 Bidding Improvements

- [ ] **Counter-offer:** Customer can propose a different price to craftsman
- [ ] **Bid expiry:** Craftsman can set a bid expiry ("offer valid for 3 days")
- [ ] **Bid comparison view:** Side-by-side comparison of multiple bids for customer
- [ ] **Questions on bid:** Craftsman can ask job-related questions before bidding
- [ ] **Edit bid:** Craftsman can update price/message before acceptance

---

### 6.6 Reviews & Ratings

- [ ] **Craftsman-to-customer review:** Currently only customer reviews craftsman
  - After job complete, craftsman can also leave review for customer
  - Add `reviewedByType: CUSTOMER | CRAFTSMAN` to Review model
- [ ] **Review response:** Craftsman can reply to a review (one reply per review)
  - `ReviewReply` model or add `reply` + `repliedAt` to Review
- [ ] **Rating breakdown:** Show sub-ratings (quality, punctuality, communication)
  - Schema has `qualityRating`, `punctualityRating` — wire them into UI
- [ ] **Review photos:** Allow attaching 1-2 photos to a review (proof of work)

---

### 6.7 SEO & Metadata

- [ ] Add dynamic `generateMetadata` to all public pages:
  - `/jobs/[jobId]` — title from job.title, description from job.description
  - `/craftsmen` — static meta
  - `/profile/[userId]` — craftsman name, bio
  - `/find-jobs` — static meta with keywords
- [ ] Create `sitemap.ts` at `src/app/sitemap.ts` with dynamic routes:
  - All active jobs
  - All craftsman profiles
  - Static pages (about, terms, privacy, contact)
- [ ] Add Open Graph images (og:image):
  - Site-wide fallback og image (1200x630 PNG)
  - Per-job og image via Next.js `ImageResponse`
- [ ] Add `robots.txt` with proper rules:
  - Allow: all public pages
  - Disallow: /api/, /admin/, /messages/, /notifications/, /payment/
- [ ] Add structured data (JSON-LD):
  - `LocalBusiness` schema for site
  - `JobPosting` schema for job detail pages
  - `Person` schema for craftsman profiles

---

### 6.8 Performance

- [ ] **Redis caching** for expensive queries:
  - Category list (changes rarely)
  - Job listing page 1 (high traffic, cache 60s)
  - Craftsman list
- [ ] **Infinite scroll** on Find Jobs instead of pagination (or keep pagination — choose one)
- [ ] **Lazy loading** for images below the fold (already using Next/Image but verify)
- [ ] **Bundle analyzer:** `npm install --save-dev @next/bundle-analyzer` — identify large chunks
- [ ] **Service Worker / PWA:**
  - Install prompt for mobile users
  - Offline fallback page
  - Cache static assets
  - Use `next-pwa` package

---

## 7. PHASE 5.5 — Google & SEO Präsenz ⭐

> Das ist alles was dazu führt, dass deine Seite **professionell auf Google erscheint** —
> mit Name, Logo, Sternebewertungen, Job-Anzeigen, Breadcrumbs und mehr.
> Diese Dinge nennt man **Structured Data**, **Schema Markup**, **Meta Tags** und **Search Console**.

---

### Begriffe erklärt (was sind diese Dinge?)

| Begriff | Was es ist | Wo man es sieht |
|---------|-----------|-----------------|
| **Schema Markup / JSON-LD** | Unsichtbarer Code, der Google erklärt was die Seite bedeutet | In Google Search-Ergebnissen als "Rich Results" |
| **Rich Results / Rich Snippets** | Erweiterte Google-Ergebnisse mit Sternen, Bildern, Preisen | Direkt in der Google-Suche unter dem Titel |
| **Open Graph (og:)** | Meta-Tags die steuern wie Links auf WhatsApp/Facebook/Twitter aussehen | Vorschau beim Teilen eines Links |
| **Google Search Console** | Google's eigenes Tool — zeigt wie deine Seite in Google rankt | Nur für den Website-Besitzer sichtbar |
| **Google Business Profile** | Das Business-Kästchen das rechts in Google erscheint (Name, Adresse, Bewertungen) | Rechts neben den Google-Suchergebnissen |
| **Sitemap** | Eine XML-Datei die Google alle Seiten auflistet | Nicht sichtbar — nur für Google |
| **robots.txt** | Sagt Google welche Seiten es crawlen darf | Nicht sichtbar — nur für Google |
| **Favicon** | Das kleine Icon im Browser-Tab und in Google | Browser-Tab oben links + Google-Ergebnisse |
| **og:image** | Das Vorschaubild wenn jemand deinen Link teilt | WhatsApp, Facebook, Twitter, iMessage |
| **Knowledge Panel** | Das große Info-Kästchen über Marken in Google | Rechts in Google wenn man nach der Marke sucht |
| **Sitelinks** | Sub-Links die unter dem Haupt-Ergebnis erscheinen (z.B. "Jobs finden", "Anmelden") | Direkt unter dem ersten Google-Ergebnis |
| **Canonical URL** | Sagt Google welche URL die "echte" ist (verhindert Duplicate Content) | Nicht sichtbar |
| **hreflang** | Sagt Google: "Diese Seite gibt es auf Arabisch UND Englisch" | Nicht sichtbar — beeinflusst welche Sprache Google zeigt |

---

### 7.1 Was bereits vorhanden ist ✅

| Element | Status |
|---------|--------|
| Basic `<title>` + `<meta description>` | ✅ in `layout.tsx` |
| Open Graph `og:title`, `og:description`, `og:siteName` | ✅ in `layout.tsx` |
| Twitter Card meta tags | ✅ in `layout.tsx` |
| `hreflang` alternates (ar/en) | ✅ in `layout.tsx` |
| `sitemap.xml` (statische Seiten + offene Jobs) | ✅ `src/app/sitemap.ts` |
| `robots.txt` | ✅ `src/app/robots.ts` |
| `metadataBase` für absolute URLs | ✅ in `layout.tsx` |

### Was FEHLT ❌

| Element | Status |
|---------|--------|
| **Favicon** (`.ico`, `.png`) | ❌ `/public/` Ordner ist komplett leer! |
| **og:image Datei** (`/og-image.png`) | ❌ Datei existiert nicht — nur der Pfad ist eingetragen |
| **Apple Touch Icon** (iOS Homescreen) | ❌ Fehlt |
| **Web App Manifest** (`manifest.json`) | ❌ Fehlt |
| **JSON-LD Schema Markup** (Organization, WebSite, JobPosting etc.) | ❌ Komplett fehlend |
| **Craftsman-Profile in Sitemap** | ❌ Fehlt — nur Jobs enthalten |
| **Google Search Console** Verifizierung | ❌ Nicht eingerichtet |
| **Google Business Profile** | ❌ Nicht erstellt |
| **Dynamische Metadata** auf Job- und Profil-Seiten | ❌ Nur auf Landing page |
| **Strukturierte Daten auf Job-Seiten** (Google Jobs Integration) | ❌ Fehlt — SEHR wichtig! |

---

### 7.2 Favicon & App Icons (höchste Priorität)

**Warum wichtig:** Ohne Favicon wirkt die Seite unprofessionell. Google zeigt das Favicon direkt in den Suchergebnissen neben dem Seitentitel.

#### Was du brauchst:
- [ ] Design ein **Logo/Icon** für My Hammer Syria (Hammer-Symbol + grüne Farbe `#12bc6c`)
- [ ] Erstelle diese Dateien und lege sie in `/public/`:

| Datei | Größe | Verwendung |
|-------|-------|-----------|
| `favicon.ico` | 32×32px | Browser-Tab (ältere Browser) |
| `favicon-16x16.png` | 16×16px | Kleine Browser-Tabs |
| `favicon-32x32.png` | 32×32px | Standard Browser-Tab |
| `apple-touch-icon.png` | 180×180px | iOS Homescreen |
| `android-chrome-192x192.png` | 192×192px | Android Homescreen |
| `android-chrome-512x512.png` | 512×512px | Android Splash Screen |
| `og-image.png` | 1200×630px | WhatsApp/Facebook/Twitter Vorschau |
| `og-image-ar.png` | 1200×630px | Arabische Version des Vorschaubilds |

#### Tools zum Erstellen:
- [favicon.io](https://favicon.io) — gibt dir alle Größen auf einmal
- [realfavicongenerator.net](https://realfavicongenerator.net) — sehr detailliert
- Figma / Canva für das Design

#### Danach in `src/app/[locale]/layout.tsx` ergänzen:
```ts
icons: {
  icon: [
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  ],
  apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  shortcut: '/favicon.ico',
},
manifest: '/manifest.json',
```

---

### 7.3 Web App Manifest (`/public/manifest.json`)

**Warum wichtig:** Erlaubt Nutzern die Seite als App auf dem Handy zu speichern ("Add to Home Screen"). Auch wichtig für Google.

- [ ] Datei erstellen: `/public/manifest.json`
```json
{
  "name": "My Hammer Syria",
  "short_name": "مطرقتي",
  "description": "منصة الحرفيين في سوريا",
  "start_url": "/ar",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#12bc6c",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

### 7.4 JSON-LD Schema Markup — Die wichtigste SEO-Maßnahme

**Was ist JSON-LD?** Ein unsichtbares Script-Tag das du in den HTML-Code einfügst. Google liest es und versteht dadurch VIEL besser was deine Seite ist — und zeigt dann "Rich Results" in der Suche.

**Wie es aussieht:** Statt normalem Suchergebnis zeigt Google dann Sternen, Bilder, Job-Details direkt in der Suche an.

#### 7.4.1 Organization Schema (Seiten-weit — in `layout.tsx`)

**Bewirkt:** Google kennt dein Unternehmen, zeigt Logo im Knowledge Panel, "Sitelinks" unter deinem Haupt-Ergebnis.

- [ ] Füge dieses Schema in `src/app/[locale]/layout.tsx` ein:
```tsx
// Nach den anderen Importen
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Hammer Syria",
  "alternateName": "مطرقتي سوريا",
  "url": "https://myhammersyria.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://myhammersyria.com/android-chrome-512x512.png",
    "width": 512,
    "height": 512
  },
  "description": "منصة الحرفيين في سوريا — ابحث عن حرفيين موثوقين أو انشر وظيفتك اليوم",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@myhammersyria.com",
    "availableLanguage": ["Arabic", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/myhammersyria",   // wenn vorhanden
    "https://www.instagram.com/myhammersyria"   // wenn vorhanden
  ]
};

// Im JSX unter <html>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

#### 7.4.2 WebSite Schema (für Sitelinks Searchbox)

**Bewirkt:** Google zeigt eine Suchleiste direkt in den Suchergebnissen wenn jemand nach "My Hammer Syria" sucht. Auch wichtig für die Sitelinks (Sub-Links unter dem Hauptergebnis).

- [ ] In `layout.tsx` ergänzen:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "My Hammer Syria",
  "alternateName": "مطرقتي سوريا",
  "url": "https://myhammersyria.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://myhammersyria.com/ar/find-jobs?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

#### 7.4.3 JobPosting Schema — AUF JEDER JOB-SEITE (sehr wichtig!)

**Bewirkt:** Google Jobs Integration! Deine Job-Anzeigen erscheinen direkt in der **Google Jobs Suche** (das ist wie ein gratis Job-Portal direkt in Google). Sehr viel Traffic möglich!

- [ ] Datei: `src/app/[locale]/jobs/[jobId]/page.tsx` — `generateMetadata` ergänzen + Schema hinzufügen:
```tsx
// Im Page-Component:
const jobSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": job.title,
  "description": job.description,
  "datePosted": job.createdAt.toISOString(),
  "validThrough": job.deadline?.toISOString(),
  "employmentType": "CONTRACTOR",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "My Hammer Syria",
    "sameAs": "https://myhammersyria.com"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": job.governorate,
      "addressCountry": "SY"
    }
  },
  "baseSalary": job.budgetMin ? {
    "@type": "MonetaryAmount",
    "currency": job.currency,
    "value": {
      "@type": "QuantitativeValue",
      "minValue": job.budgetMin,
      "maxValue": job.budgetMax,
      "unitText": "TOTAL"
    }
  } : undefined
};

// Im JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />
```

#### 7.4.4 Person + AggregateRating Schema — AUF CRAFTSMAN-PROFIL-SEITEN

**Bewirkt:** Sternebewertungen erscheinen direkt in Google-Suchergebnissen wenn jemand den Handwerker sucht.

- [ ] Datei: `src/app/[locale]/profile/[userId]/page.tsx`
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ahmad's Plumbing (My Hammer Syria)",
  "image": "https://res.cloudinary.com/.../avatar.jpg",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "23",
    "bestRating": "5",
    "worstRating": "1"
  },
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Damascus",
    "addressCountry": "SY"
  }
}
```

#### 7.4.5 BreadcrumbList Schema — AUF ALLEN UNTERSEITEN

**Bewirkt:** Google zeigt "My Hammer Syria > Jobs finden > Klempner in Damaskus" als Breadcrumb in den Suchergebnissen — erhöht die Click-Through-Rate enorm.

- [ ] Auf Job-Detail-Seite:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myhammersyria.com/en" },
    { "@type": "ListItem", "position": 2, "name": "Find Jobs", "item": "https://myhammersyria.com/en/find-jobs" },
    { "@type": "ListItem", "position": 3, "name": "Plumbing Job in Damascus" }
  ]
}
```

#### 7.4.6 FAQPage Schema — AUF DER LANDING PAGE oder ABOUT PAGE

**Bewirkt:** Google zeigt ausklappbare FAQ-Antworten direkt in den Suchergebnissen.

- [ ] Erstelle FAQ-Sektion mit häufigen Fragen:
  - "Wie finde ich einen Handwerker in Syrien?"
  - "Wie viel kostet ein Klempner in Damaskus?"
  - "Wie funktioniert die Bezahlung?"
  - "Kann ich mein Geld zurückbekommen?"

---

### 7.5 Dynamische Metadata auf allen Seiten

Aktuell hat nur das Root-Layout Metadata. Alle anderen Seiten erben nur den Template-Titel.

**Fehlende `generateMetadata` Funktionen:**

- [ ] `src/app/[locale]/jobs/[jobId]/page.tsx`:
  ```ts
  export async function generateMetadata({ params }) {
    const job = await prisma.job.findUnique(...);
    return {
      title: locale === 'ar' ? job.titleAr || job.title : job.title,
      description: job.description.slice(0, 160),
      openGraph: {
        title: job.title,
        description: job.description.slice(0, 160),
        images: job.images ? [JSON.parse(job.images)[0]] : ['/og-image.png'],
      }
    };
  }
  ```

- [ ] `src/app/[locale]/profile/[userId]/page.tsx`:
  ```ts
  // Title: "Ahmad Al-Hassan — Klempner | My Hammer Syria"
  // Description: craftsman.bio.slice(0, 160)
  // og:image: craftsman.user.image || '/og-image.png'
  ```

- [ ] `src/app/[locale]/find-jobs/page.tsx` — statische optimierte Meta-Tags mit Keywords

- [ ] `src/app/[locale]/craftsmen/page.tsx` — statische optimierte Meta-Tags

- [ ] `src/app/[locale]/about/page.tsx` — sobald Content steht

- [ ] `src/app/[locale]/contact/page.tsx` — statische Meta-Tags

- [ ] `src/app/[locale]/(auth)/login/page.tsx` — `noindex` setzen (Login-Seiten sollen nicht in Google)
  ```ts
  robots: { index: false, follow: false }
  ```

- [ ] Gleiche `noindex` für: `/register`, `/forgot-password`, `/reset-password`, `/my-jobs`, `/my-bids`, `/messages`, `/notifications`, `/payment/*`, `/admin/*`

---

### 7.6 Sitemap vervollständigen

**Was fehlt in `src/app/sitemap.ts`:**
- [ ] Craftsman-Profile hinzufügen:
  ```ts
  const craftsmen = await prisma.craftsmanProfile.findMany({
    where: { user: { isActive: true } },
    select: { userId: true, updatedAt: true },
  });
  // /en/profile/[userId] + /ar/profile/[userId]
  ```
- [ ] Kategorien-Seiten hinzufügen (wenn eigene Seiten existieren)
- [ ] `terms`, `privacy` Seiten zu Sitemap hinzufügen
- [ ] `priority` und `changeFrequency` optimieren

---

### 7.7 robots.txt verbessern

**Aktuell** blockiert `/messages/`, `/notifications/` etc. — gut. Aber:
- [ ] `/profile/edit` blockieren (bereits blockiert ✅)
- [ ] Sicherstellen dass `/ar/` und `/en/` beide gecrawlt werden können
- [ ] `Crawl-delay` hinzufügen wenn Server langsam: `Crawl-delay: 2`

---

### 7.8 Google Search Console einrichten

**Google Search Console** ist das wichtigste Tool — zeigt dir wie Google deine Seite sieht.

- [ ] Gehe zu: [search.google.com/search-console](https://search.google.com/search-console)
- [ ] Klicke "Neue Property hinzufügen"
- [ ] Gib deine Domain ein: `myhammersyria.com`
- [ ] **Verifizierung** — wähle eine Methode:
  - **DNS-Methode** (empfohlen): Füge einen TXT-Eintrag bei deinem Domain-Anbieter hinzu
  - **HTML-Datei**: Lade eine Datei in `/public/google-verification-xxx.html` hoch
  - **Meta-Tag**: Füge `<meta name="google-site-verification" content="xxx">` in `layout.tsx` hinzu
- [ ] Nach Verifizierung:
  - [ ] Sitemap einreichen: Gehe zu "Sitemaps" → `https://myhammersyria.com/sitemap.xml` eintragen
  - [ ] Warte 1-2 Wochen bis Google gecrawlt hat
  - [ ] Prüfe "Coverage" — sind alle Seiten indexiert?
  - [ ] Prüfe "Core Web Vitals" — Performance-Probleme erkennen
  - [ ] Prüfe "Rich Results" Status — werden deine Schema-Markups erkannt?

**Wichtige Berichte in Search Console:**
- **Performance** — welche Keywords bringen Traffic, wie oft geklickt
- **Coverage** — welche Seiten sind indexiert / haben Fehler
- **Enhancements** — Rich Results Status (JobPosting, BreadcrumbList etc.)
- **Core Web Vitals** — LCP, FID, CLS Werte

---

### 7.9 Google Business Profile (Knowledge Panel)

**Damit erscheint rechts in Google das große Info-Kästchen** mit Name, Adresse, Öffnungszeiten, Bewertungen.

- [ ] Gehe zu: [business.google.com](https://business.google.com)
- [ ] Neues Business erstellen:
  - Business-Name: "My Hammer Syria"
  - Kategorie: "Online marketplace" oder "Employment agency"
  - Website: `https://myhammersyria.com`
  - Telefon (falls vorhanden)
  - Adresse (Syrien)
- [ ] Verifizierung abschließen (per Post-Postkarte oder Telefon)
- [ ] Bilder hochladen: Logo, Banner, Screenshots der App
- [ ] Beschreibung auf Arabisch + Englisch
- [ ] Erste Bewertungen sammeln (von Bekannten/Testern)

---

### 7.10 Social Media & Verlinkung (für Domain Authority)

Google rankt Seiten höher wenn viele andere Seiten auf sie verlinken.

- [ ] **Facebook-Seite** erstellen: `facebook.com/myhammersyria`
  - Website-URL eintragen
  - Kategorien: Job marketplace, Home services
- [ ] **Instagram** erstellen: `instagram.com/myhammersyria`
  - Link in Bio setzen
- [ ] **LinkedIn Company Page** erstellen (besonders für B2B-Aspekte)
- [ ] **Twitter/X** Account
- [ ] Alle Social-Links im Footer der Webseite verlinken
- [ ] Alle Social-Links im `Organization` Schema einsetzen (sameAs Array)
- [ ] Link von Wikipedia eintragen (wenn relevant)

---

### 7.11 Google Analytics & Tag Manager

**Damit siehst du wie Nutzer deine Seite benutzen** — welche Seiten besucht werden, wie lange, woher sie kommen.

- [ ] Google Analytics 4 (GA4) Konto erstellen: [analytics.google.com](https://analytics.google.com)
  - Neues Property erstellen für `myhammersyria.com`
  - Measurement ID notieren: `G-XXXXXXXXXX`
- [ ] Installieren in Next.js:
  ```bash
  npm install @next/third-parties
  ```
  ```tsx
  // In layout.tsx:
  import { GoogleAnalytics } from '@next/third-parties/google';
  // Im Body:
  <GoogleAnalytics gaId="G-XXXXXXXXXX" />
  ```
- [ ] Wichtige Events tracken:
  - [ ] Job veröffentlicht
  - [ ] Angebot abgegeben
  - [ ] Registrierung abgeschlossen
  - [ ] Zahlung abgeschlossen
  - [ ] Kontaktformular gesendet
- [ ] **Cookie-Banner** wenn EU-Nutzer erwartet werden (DSGVO)
  - Tracking erst nach Zustimmung aktivieren
- [ ] Env var: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

---

### 7.12 Open Graph Image erstellen

**Datei fehlt!** Der Code referenziert `/og-image.png` aber die Datei existiert nicht im `/public/` Ordner.

- [ ] Erstelle ein 1200×630px Bild mit:
  - My Hammer Syria Logo/Name
  - Kurzer Slogan auf Arabisch: "ابحث عن حرفيين موثوقين في سوريا"
  - Grüner Hintergrund `#12bc6c` oder professioneller Design
  - Hammer-Icon oder Handwerker-Bild
- [ ] Speichere als `/public/og-image.png`
- [ ] Optional: Arabische Version `/public/og-image-ar.png`
- [ ] In `layout.tsx` aktualisieren:
  ```ts
  openGraph: {
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'My Hammer Syria' }
    ]
  }
  ```
- [ ] Teste mit [opengraph.xyz](https://www.opengraph.xyz) — gib deine URL ein und sehe wie der Link aussieht

---

### 7.13 Rich Results Tester

Nachdem alles implementiert ist:
- [ ] Teste JSON-LD Schema auf: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
  - Gib eine Job-URL ein → prüfe ob `JobPosting` erkannt wird
  - Gib eine Profil-URL ein → prüfe ob `LocalBusiness` + `AggregateRating` erkannt wird
  - Gib die Startseite ein → prüfe ob `Organization` + `WebSite` erkannt wird
- [ ] Teste Open Graph auf: [opengraph.xyz](https://www.opengraph.xyz)
- [ ] Prüfe Mobile-Freundlichkeit: [search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)
- [ ] Prüfe Page Speed: [pagespeed.web.dev](https://pagespeed.web.dev)
  - Ziel: > 80 auf Mobile, > 90 auf Desktop

---

### 7.14 Keyword-Strategie (Was soll Google für euch anzeigen?)

Damit Google dich bei den richtigen Suchanfragen zeigt:

**Primäre Keywords (Arabisch):**
- حرفيين في سوريا (craftsmen in Syria)
- سباك دمشق (plumber Damascus)
- كهربائي حلب (electrician Aleppo)
- نجار في سوريا (carpenter Syria)
- مطرقة سوريا (hammer Syria)

**Primäre Keywords (Englisch):**
- craftsmen Syria
- handyman Damascus
- find plumber Syria
- post job Syria
- home services Syria

- [ ] Diese Keywords in Meta-Descriptions einbauen (natürlich klingend)
- [ ] Keywords in H1/H2 Überschriften auf Landingpage verwenden
- [ ] Blog-Sektion langfristig für Content-Marketing (z.B. "Wie finde ich einen guten Klempner in Damaskus?")

---

### Google & SEO Zusammenfassung — Prioritätsliste

| Aufgabe | Aufwand | Wirkung | Priorität |
|---------|---------|---------|-----------|
| Favicon & Icons erstellen | 1h | Sehr hoch | 🔴 KRITISCH |
| og:image erstellen | 2h | Sehr hoch | 🔴 KRITISCH |
| Google Search Console einrichten | 30min | Sehr hoch | 🔴 KRITISCH |
| Sitemap einreichen | 10min | Sehr hoch | 🔴 KRITISCH |
| Organization + WebSite JSON-LD | 1h | Hoch | 🟠 HOCH |
| JobPosting JSON-LD auf Job-Seiten | 2h | Sehr hoch | 🟠 HOCH |
| Dynamische Metadata auf Job/Profil | 2h | Hoch | 🟠 HOCH |
| Google Business Profile | 1h | Hoch | 🟠 HOCH |
| Person + AggregateRating JSON-LD | 1h | Mittel | 🟡 MITTEL |
| BreadcrumbList JSON-LD | 1h | Mittel | 🟡 MITTEL |
| Web App Manifest | 30min | Mittel | 🟡 MITTEL |
| Google Analytics 4 | 1h | Mittel | 🟡 MITTEL |
| Social Media Accounts | 2h | Mittel | 🟡 MITTEL |
| FAQPage JSON-LD | 1h | Niedrig | 🟢 NIEDRIG |
| Keyword-optimierte Texte | 4h+ | Hoch (langfristig) | 🟢 NIEDRIG |
| Blog/Content Marketing | Fortlaufend | Sehr hoch (langfristig) | 🟢 NIEDRIG |

---

## 8. PHASE 6 — Infrastructure & Deployment

---

### 7.1 Database Setup (Production)

- [ ] Create production PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- [ ] Set `DATABASE_URL` (pooler connection) and `DIRECT_URL` (direct connection)
- [ ] Run `npm run db:migrate` on production DB
- [ ] Run `npm run db:seed` (categories + admin user only, NOT test data)
- [ ] Enable **point-in-time recovery** (Neon: built-in, backup retention 7 days min)
- [ ] Set up **daily database backups** → export to S3/Cloudflare R2
- [ ] **Connection pooling:** Use PgBouncer (Neon) or Prisma Accelerate
- [ ] Add database monitoring: slow query alerts > 1000ms

---

### 7.2 Vercel Deployment

- [ ] Create Vercel project → connect GitHub repo
- [ ] Set all environment variables in Vercel dashboard (see Section 10)
- [ ] Configure custom domain: `myhammersyria.com` or similar
  - Set up `www` + apex domain
  - SSL certificate (Vercel handles automatically)
- [ ] Set up **preview deployments** for PRs (Vercel default)
- [ ] Configure build settings:
  - Framework: Next.js
  - Node version: 20.x
  - Build command: `npm run build`
  - Output directory: `.next`
- [ ] Enable Vercel Speed Insights + Analytics (free on hobby plan)
- [ ] Set up **Vercel Cron Jobs** for:
  - Job expiry check (daily at midnight)
  - Notification digest emails (weekly)
  - Cleanup expired tokens (daily)

---

### 7.3 Third-Party Service Setup

#### Cloudinary (Image Storage)
- [ ] Create production Cloudinary account
- [ ] Create separate upload preset for production
- [ ] Enable **Cloudinary Image Moderation** add-on (NSFW filter)
- [ ] Set up Cloudinary folders: `/jobs/`, `/portfolios/`, `/avatars/`
- [ ] Configure image transformations (auto-format, auto-quality)
- [ ] Set storage quota alerts

#### Pusher (Real-time)
- [ ] Create production Pusher app (separate from dev app)
- [ ] Choose region closest to users (EU or Middle East)
- [ ] Enable **Pusher Beams** if mobile push notifications needed
- [ ] Configure channel authorization (`/api/pusher/auth`) with production keys

#### Stripe (Payments)
- [ ] Switch from Test mode to Live mode in Stripe dashboard
- [ ] Register webhook endpoint: `https://yourdomain.com/api/payments/webhook`
- [ ] Enable events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Configure Stripe for SYP currency (may need to check Stripe's supported currencies)
  - Note: Stripe may not support SYP directly — use USD only, or manual conversion
- [ ] Test payment flow with real card in Stripe Live mode
- [ ] Set up Stripe Radar rules for fraud prevention

#### Resend / Email
- [ ] Verify sending domain in Resend dashboard
- [ ] Add SPF, DKIM, DMARC DNS records
- [ ] Create email templates (HTML + text fallback)
- [ ] Test deliverability via mail-tester.com (aim for 10/10)

---

### 7.4 Monitoring & Alerting

- [ ] **Error monitoring:** Set up [Sentry](https://sentry.io) (free tier: 5,000 errors/month)
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
  - Capture: unhandled exceptions, API 500 errors, Stripe webhook failures
  - Alert: Slack or email for high-severity errors
- [ ] **Uptime monitoring:** [Better Uptime](https://betteruptime.com) or UptimeRobot (free)
  - Monitor: `/api/health`, main page
  - Alert: SMS/email if down > 1 minute
- [ ] **Performance monitoring:**
  - Core Web Vitals tracking (Vercel Speed Insights)
  - Alert if LCP > 2.5s or CLS > 0.1
- [ ] **Database monitoring:**
  - Neon: built-in metrics (connections, query time)
  - Alert if DB connection pool > 80% used

---

### 7.5 Domain & DNS Setup

- [ ] Register domain (if not done): `myhammersyria.com` / `myhammersyria.sy`
- [ ] DNS records needed:
  - `A` record → Vercel IP
  - `CNAME www` → Vercel
  - `MX` records → email provider (Resend/Mailgun)
  - `TXT` records → SPF, DKIM for email auth
  - `TXT` → domain verification for Stripe, Google etc.
- [ ] Configure `NEXTAUTH_URL=https://myhammersyria.com` in production env

---

### 7.6 Legal & Compliance

- [ ] **Privacy Policy** — already exists (`/privacy`) — review for accuracy:
  - List all data collected (name, email, images, payment info)
  - List all third parties (Stripe, Cloudinary, Pusher, Google Analytics)
  - Add data deletion request instructions
  - Add Syrian data protection compliance notes
- [ ] **Terms of Service** — already exists (`/terms`) — review:
  - Dispute resolution terms
  - Payment terms (platform fee if any)
  - Prohibited activities (spam, fraud, abuse)
  - Account suspension/termination policy
- [ ] **Cookie Policy** — add cookie consent banner (GDPR if targeting EU)
- [ ] **Platform fee decision:** Decide if marketplace takes commission (10%? 5%?)
  - If yes: implement fee calculation in Payment model
  - Update Terms to reflect this

---

### 7.7 Pre-Launch Testing Checklist

#### Functional Tests (manual or automated)
- [ ] Register as Customer → verify email → login → post job → receive bids → accept bid → pay → leave review
- [ ] Register as Craftsman → verify email → login → find job → submit bid → receive acceptance → complete job → receive review
- [ ] Forgot password → receive email → reset → login
- [ ] Upload profile image, portfolio images, job images → confirm Cloudinary storage
- [ ] Send messages → confirm real-time delivery (Pusher)
- [ ] All admin actions work correctly
- [ ] All Arabic/RTL pages render correctly
- [ ] Mobile responsive on iOS Safari + Android Chrome
- [ ] All payment methods flow correctly

#### Load Testing
- [ ] Use [k6](https://k6.io) or [Artillery](https://artillery.io):
  - Simulate 100 concurrent users browsing jobs
  - Simulate 50 simultaneous bids being submitted
  - Simulate 20 simultaneous chat messages
- [ ] Database: confirm no slow queries (all < 200ms under load)
- [ ] Pusher: confirm real-time delivery under load

#### Security Testing
- [ ] Try SQL injection on all search/filter inputs
- [ ] Try XSS in job title, description, chat messages
- [ ] Try to access other users' data (IDOR test)
- [ ] Try to bypass payment (manipulate amount in request)
- [ ] Try to register with same email twice
- [ ] Verify rate limiting works (hammer login endpoint)

---

## 9. PHASE 7 — Post-Launch Monitoring

---

### 8.1 First Week Checklist
- [ ] Monitor Sentry for any runtime errors
- [ ] Check Stripe for any payment failures
- [ ] Check Pusher usage — ensure within plan limits
- [ ] Check Cloudinary usage — storage and bandwidth
- [ ] Monitor database connections (Neon dashboard)
- [ ] Read user feedback (contact form / social media)
- [ ] Check Core Web Vitals in Google Search Console

---

### 8.2 Ongoing Maintenance

**Daily:**
- [ ] Check error logs (Sentry)
- [ ] Review dispute queue
- [ ] Approve pending Cash/Bank payments
- [ ] Moderate any flagged content

**Weekly:**
- [ ] Review admin analytics dashboard
- [ ] Check Stripe payouts and reconcile
- [ ] Database backup verification
- [ ] Review user growth metrics

**Monthly:**
- [ ] Security dependency updates: `npm audit fix`
- [ ] Review and renew any API service plans
- [ ] Revenue report generation
- [ ] Platform fee reconciliation

---

### 8.3 Growth Features (Post-Launch V2)

- [ ] **Mobile App** — React Native or Flutter (share API)
- [ ] **SMS Notifications** — via Twilio for Syrian mobile numbers
- [ ] **Pro craftsman plan** — featured placement, analytics
- [ ] **Job matching algorithm** — AI-powered craftsman recommendations
- [ ] **Video verification** — craftsman identity + portfolio video
- [ ] **Multi-language support** — Kurdish, Armenian (Syrian minorities)
- [ ] **Map view** — show jobs/craftsmen on Syria governorate map
- [ ] **Invoice generation** — PDF invoices for completed jobs

---

## 10. File-Level TODO Index

Every file with stubbed, incomplete, or TODO code — **verified by reading the actual source code**:

| File | Issue | Priority |
|------|-------|----------|
| `src/app/api/auth/forgot-password/route.ts:39` | Email NOT sent — console.log only | CRITICAL |
| `src/app/api/contact/route.ts:33` | Email NOT sent — console.log only | CRITICAL |
| `src/app/[locale]/about/page.tsx` | Empty placeholder page | HIGH |
| `src/app/[locale]/payment/checkout/page.tsx` | Cash/Bank/Syriatel — no backend | CRITICAL |
| `src/app/api/payments/webhook/route.ts` | REFUNDED status never triggered | HIGH |
| `src/lib/utils.ts` | Default locale `"en"` — verify all callers pass locale | MEDIUM |
| `src/components/jobs/PostJobForm.tsx` | No Textarea component (raw textarea) | LOW |
| `src/app/api/portfolio/[id]/route.ts` | Cloudinary image NOT deleted on portfolio remove | HIGH |
| `src/app/api/users/me/route.ts` | Old profile image NOT deleted on avatar replace | HIGH |
| `prisma/schema.prisma` | No Dispute model | HIGH |
| `prisma/schema.prisma` | No EmailVerification model | CRITICAL |
| `prisma/schema.prisma` | No FavoriteCraftsman model | LOW |
| `prisma/schema.prisma` | Payment.method not typed as enum | HIGH |
| `src/middleware.ts` | No rate limiting in middleware | HIGH |
| `next.config.ts` | No security headers (CSP, HSTS, etc.) | HIGH |
| All API routes | No rate limiting applied | CRITICAL |
| `src/lib/notifications.ts` | Doesn't exist — notification creation scattered | MEDIUM |
| `messages/en.json` | No `auth.emailRequired` key (using hardcoded string) | LOW |
| `src/app/[locale]/(auth)/forgot-password/page.tsx` | Now fixed ✅ | DONE |
| `src/components/jobs/PostJobForm.tsx` | shouldFocus now fixed ✅ | DONE |
| `src/app/[locale]/(customer)/my-jobs/page.tsx` | Button text now fixed ✅ | DONE |
| `src/lib/utils.ts` | Default locale now fixed ✅ | DONE |
| `src/app/[locale]/(craftsman)/my-bids/page.tsx` | Locale now passed ✅ | DONE |

---

### VERIFIED HARDCODED ENGLISH STRINGS (confirmed by reading the files)

These are REAL bugs found by reading the actual code. All Arabic users see English text here:

| File | Hardcoded English Text | Fix needed |
|------|----------------------|------------|
| `src/app/[locale]/payment/success/page.tsx:25` | `"Your payment has been processed successfully."` | Add `t("successMessage")` key |
| `src/app/[locale]/payment/success/page.tsx:31` | `"View Job"` | Add `t("viewJob")` key |
| `src/app/[locale]/payment/success/page.tsx:35` | `"My Jobs"` link text | Add `t("myJobs")` key |
| `src/app/[locale]/payment/cancel/page.tsx:7` | `"Payment Cancelled"` in generateMetadata | Add `t("cancelledTitle")` |
| `src/app/[locale]/payment/cancel/page.tsx:22` | `"Payment Cancelled"` heading | Use `t("cancelledTitle")` |
| `src/app/[locale]/payment/cancel/page.tsx:24` | `"Your payment was cancelled. No charges were made."` | Add `t("cancelledMessage")` |
| `src/app/[locale]/payment/cancel/page.tsx:30` | `"Try Again"` button | Add `t("tryAgain")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:26` | `"Passwords do not match."` | Use `t("errors.passwordsDoNotMatch")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:31` | `"Invalid reset link. Please request a new one."` | Add `t("errors.invalidResetLink")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:64` | `"Reset Password"` h1 heading | Add `t("resetPassword")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:73` | `"Your password has been reset. Redirecting to login…"` | Add `t("passwordResetSuccess")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:84` | `label="New Password"` | Add `t("newPassword")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:93` | `label="Confirm Password"` | Add `t("confirmPasswordLabel")` |
| `src/app/[locale]/(auth)/reset-password/page.tsx:101` | `"Reset Password"` button | Use `t("resetPassword")` |
| `src/app/[locale]/not-found.tsx:15` | `"The page you are looking for does not exist."` | Add `t("errors.notFoundDescription")` |
| `src/app/not-found.tsx:7` | `"Page not found"` (whole page in English) | Add `errors.404` key + use translations |
| `src/app/not-found.tsx:8` | `"Go back home"` | Use `t("errors.goHome")` |
| `src/app/[locale]/error.tsx:23` | `"Something went wrong. Please try again."` fallback | Add `t("errors.serverErrorDescription")` |
| `src/app/[locale]/error.tsx:27` | `"Try again"` button | Add `t("errors.tryAgain")` |

### MISSING TRANSLATION KEYS (need to be added to en.json AND ar.json)

These keys are used in the code but DON'T EXIST in `messages/en.json` or `messages/ar.json`:

```json
// Add under "payment":
"successMessage": "Your payment has been processed successfully.",
"viewJob": "View Job",
"myJobs": "My Jobs",
"cancelledTitle": "Payment Cancelled",
"cancelledMessage": "Your payment was cancelled. No charges were made.",
"tryAgain": "Try Again"

// Add under "auth":
"resetPassword": "Reset Password",
"newPassword": "New Password",
"confirmPasswordLabel": "Confirm Password",
"passwordResetSuccess": "Your password has been reset. Redirecting to login…",
"errors": {
  "invalidResetLink": "Invalid reset link. Please request a new one."
}

// Add under "errors":
"notFoundDescription": "The page you are looking for does not exist.",
"serverErrorDescription": "Something went wrong. Please try again.",
"tryAgain": "Try again"
```

### PLACEHOLDER DATA IN TRANSLATION FILES (need real values before launch)

Found in `messages/en.json` and `messages/ar.json`:
- `payment.bankAccount`: `"Account: XXXX-XXXX-XXXX"` — needs real bank account number
- `payment.bankIban`: `"IBAN: SY00 0000 0000 0000"` — needs real IBAN
- `footer.copyright`: `"© 2024 My Hammer Syria"` — year wrong (should be 2025 or dynamic)

### MISSING SECURITY HEADERS in `next.config.mjs`

Confirmed by reading the file — it only has `compress: true` and image patterns. Missing:
```js
// All of these need to be added to next.config.mjs:
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    // HSTS + CSP must be added when deployed to HTTPS
  ]
}]
```

---

## 11. Environment Variables Checklist

All variables needed for production. Copy from `.env.example`.

### Database
- [ ] `DATABASE_URL` — PostgreSQL connection string (with pooler, e.g. Neon)
- [ ] `DIRECT_URL` — Direct PostgreSQL connection (for migrations)

### Authentication
- [ ] `AUTH_SECRET` — Random 32-byte string: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` — Full production URL: `https://myhammersyria.com`

### Email
- [ ] `RESEND_API_KEY` — From Resend dashboard
- [ ] `EMAIL_FROM` — Verified sender: `noreply@myhammersyria.com`
- [ ] `ADMIN_EMAIL` — Where contact form emails are delivered

### Real-time (Pusher)
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_KEY`
- [ ] `PUSHER_SECRET`
- [ ] `PUSHER_CLUSTER`
- [ ] `NEXT_PUBLIC_PUSHER_KEY`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`

### Payments (Stripe)
- [ ] `STRIPE_SECRET_KEY` — Live key: `sk_live_...`
- [ ] `STRIPE_PUBLISHABLE_KEY` — Live key: `pk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` — From Stripe webhook dashboard: `whsec_...`

### Images (Cloudinary)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### Rate Limiting (Upstash Redis)
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

### Error Monitoring (Sentry)
- [ ] `SENTRY_DSN`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_ORG`
- [ ] `SENTRY_PROJECT`
- [ ] `SENTRY_AUTH_TOKEN`

### App Config
- [ ] `NEXT_PUBLIC_APP_URL` — `https://myhammersyria.com`
- [ ] `NODE_ENV` — `production`

### Optional (OAuth)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

### Analytics & SEO
- [ ] `NEXT_PUBLIC_GA_ID` — Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`)
- [ ] `NEXT_PUBLIC_APP_URL` — Vollständige URL für Schema Markup (`https://myhammersyria.com`)
- [ ] `GOOGLE_SITE_VERIFICATION` — Search Console Verifizierungs-Token (optional als Meta-Tag)

---

## 12. Full Feature Matrix

Complete view of every feature and its status:

| Feature | Status | Priority | Phase |
|---------|--------|----------|-------|
| User registration (Customer) | ✅ Done | — | — |
| User registration (Craftsman) | ✅ Done | — | — |
| Email verification | ❌ Missing | CRITICAL | 2 |
| Login / logout | ✅ Done | — | — |
| Forgot password (flow) | ✅ Done | — | — |
| Forgot password (email) | ❌ Missing | CRITICAL | 1 |
| Rate limiting | ❌ Missing | CRITICAL | 1 |
| Post a job (4-step) | ✅ Done | — | — |
| Edit a job | ⚠️ API only, no page | MEDIUM | 2 |
| Delete a job | ✅ Done | — | — |
| Browse jobs | ✅ Done | — | — |
| Advanced search/filters | ⚠️ Partial | MEDIUM | 2 |
| Job expiry | ❌ Missing | MEDIUM | 2 |
| Submit a bid | ✅ Done | — | — |
| Edit a bid | ❌ Missing | LOW | 5 |
| Withdraw a bid | ✅ Done | — | — |
| Accept/reject bid | ✅ Done | — | — |
| Counter-offer | ❌ Missing | LOW | 5 |
| Mark job complete | ✅ Done | — | — |
| Leave review (customer) | ✅ Done | — | — |
| Leave review (craftsman) | ❌ Missing | MEDIUM | 5 |
| Review response | ❌ Missing | LOW | 5 |
| Real-time chat | ✅ Done | — | — |
| Typing indicators | ❌ Missing | LOW | 5 |
| File attachments in chat | ❌ Missing | LOW | 5 |
| Read receipts | ❌ Missing | LOW | 5 |
| Block user | ❌ Missing | MEDIUM | 5 |
| Craftsman profile | ✅ Done | — | — |
| Portfolio management | ✅ Done | — | — |
| Availability status | ❌ Missing | MEDIUM | 5 |
| Verification badge | ❌ Missing | MEDIUM | 4 |
| Saved craftsmen | ❌ Missing | LOW | 5 |
| Stripe payment | ✅ Done | — | — |
| Cash payment | ⚠️ UI only | CRITICAL | 1 |
| Bank transfer | ⚠️ UI only | CRITICAL | 1 |
| Syriatel Cash | ⚠️ UI only | HIGH | 1 |
| Refunds | ❌ Missing | HIGH | 4 |
| Dispute resolution | ❌ Missing | HIGH | 2 |
| Notifications (all types) | ⚠️ Partial | HIGH | 2 |
| Email notifications | ❌ Missing | MEDIUM | 2 |
| Push notifications | ❌ Missing | LOW | 7 |
| Admin dashboard (basic) | ✅ Done | — | — |
| Admin — user management | ⚠️ Partial | HIGH | 4 |
| Admin — job management | ❌ Missing | HIGH | 4 |
| Admin — review moderation | ❌ Missing | HIGH | 4 |
| Admin — payment reports | ❌ Missing | HIGH | 4 |
| Admin — dispute queue | ❌ Missing | HIGH | 4 |
| Admin — analytics charts | ❌ Missing | MEDIUM | 4 |
| Content moderation | ❌ Missing | MEDIUM | 4 |
| Security headers (CSP) | ❌ Missing | HIGH | 3 |
| Input sanitization (XSS) | ❌ Missing | HIGH | 3 |
| Cloudinary image cleanup | ❌ Missing | HIGH | 3 |
| Sentry error monitoring | ❌ Missing | HIGH | 6 |
| Uptime monitoring | ❌ Missing | HIGH | 6 |
| SEO metadata (all pages) | ⚠️ Partial | MEDIUM | 5 |
| Sitemap (dynamic) | ⚠️ Static | MEDIUM | 5 |
| Open Graph images | ❌ Missing | LOW | 5 |
| Structured data (JSON-LD) | ❌ Missing | LOW | 5 |
| About page (content) | ❌ Missing | MEDIUM | 2 |
| Terms of service | ✅ Done | — | — |
| Privacy policy | ✅ Done | — | — |
| Contact form (email) | ❌ Missing | HIGH | 1 |
| Cookie consent banner | ❌ Missing | MEDIUM | 6 |
| Arabic RTL support | ✅ Done | — | — |
| Bilingual content | ✅ Done | — | — |
| Mobile responsive | ✅ Done | — | — |
| Image lightbox | ❌ Missing | LOW | 5 |
| PWA / installable | ❌ Missing | LOW | 7 |
| Google OAuth | ❌ Missing | LOW | 5 |
| **Favicon & App Icons** | ❌ public/ ist leer! | CRITICAL | 5.5 |
| **og:image Datei** | ❌ Datei fehlt | CRITICAL | 5.5 |
| **Organization JSON-LD** | ❌ Missing | HIGH | 5.5 |
| **WebSite JSON-LD** (Sitelinks Searchbox) | ❌ Missing | HIGH | 5.5 |
| **JobPosting JSON-LD** (Google Jobs) | ❌ Missing | HIGH | 5.5 |
| **Person + AggregateRating JSON-LD** | ❌ Missing | MEDIUM | 5.5 |
| **BreadcrumbList JSON-LD** | ❌ Missing | MEDIUM | 5.5 |
| **Web App Manifest** | ❌ Missing | MEDIUM | 5.5 |
| **Google Search Console** einrichten | ❌ Not done | CRITICAL | 5.5 |
| **Google Business Profile** | ❌ Not done | HIGH | 5.5 |
| **Google Analytics 4** | ❌ Missing | MEDIUM | 5.5 |
| **Dynamische Metadata** (Job + Profil Seiten) | ❌ Missing | HIGH | 5.5 |
| **noindex** auf Auth/Private Seiten | ❌ Missing | MEDIUM | 5.5 |
| **Craftsmen in Sitemap** | ❌ Missing | MEDIUM | 5.5 |
| **Social Media Accounts** | ❌ Not done | MEDIUM | 5.5 |
| Unit tests | ❌ Missing | HIGH | 6 |
| Integration tests | ❌ Missing | HIGH | 6 |
| E2E tests | ❌ Missing | MEDIUM | 6 |
| Load testing | ❌ Missing | HIGH | 6 |
| Database backups | ❌ Missing | CRITICAL | 6 |
| CDN configuration | ❌ Missing | MEDIUM | 6 |

---

## Summary: Launch Checklist (Minimum Viable Launch)

These are the **absolute minimum** items before any real users can use this site:

### Translations & Text (CONFIRMED bugs — Arabic users see English)
- [ ] Fix hardcoded English in `payment/success/page.tsx` (3 strings)
- [ ] Fix hardcoded English in `payment/cancel/page.tsx` (4 strings + metadata)
- [ ] Fix hardcoded English in `reset-password/page.tsx` (7 strings)
- [ ] Fix hardcoded English in `not-found.tsx` (both files)
- [ ] Fix hardcoded English in `error.tsx` (2 strings)
- [ ] Add all missing translation keys to `messages/en.json` + `messages/ar.json`
- [ ] Replace placeholder bank account "XXXX-XXXX-XXXX" with real data
- [ ] Fix copyright year (2024 → current)

### Critical Features
- [ ] **Email delivery** — password reset + contact form (currently console.log only)
- [ ] **Rate limiting** — brute force protection on login/register/forgot-password
- [ ] **Email verification** — confirm email on registration
- [ ] **Cash/Bank/Syriatel payment backends** — UI exists but no backend
- [ ] **Favicon & icons** — `/public/` folder is completely empty
- [ ] **og:image file** — referenced in code but file does not exist

### Security
- [ ] **Security headers** — add X-Frame-Options, X-Content-Type-Options, Referrer-Policy to `next.config.mjs`
- [ ] **Cloudinary cleanup** — delete images on portfolio/avatar removal (currently orphaned)
- [ ] **Notification system** — all bid/job/payment events must trigger notifications

### Infrastructure
- [ ] **Sentry** — know when things break in production
- [ ] **Database backups** — never lose user data
- [ ] **Stripe webhook** — register production endpoint, switch to live keys
- [ ] **Google Search Console** — submit sitemap so Google can find the site

Everything else can be shipped in updates after the initial launch.
