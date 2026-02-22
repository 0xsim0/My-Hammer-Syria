import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { prisma } from "@/lib/prisma";

// Emoji map keyed by category slug (covers both seed slugs and legacy slugs)
const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: "🔧",
  electrical: "⚡",
  carpentry: "🪚",
  painting: "🎨",
  tiling: "🧱",
  hvac: "❄️",
  "ac-heating": "❄️",
  masonry: "🏗️",
  welding: "🔩",
  cleaning: "🧹",
  moving: "🚚",
  garden: "🌿",
  gardening: "🌿",
  roofing: "🏠",
  appliance: "🔌",
  security: "🔐",
  blacksmithing: "🔨",
  aluminum: "🪟",
  plastering: "🏗️",
  general: "🛠️",
};

async function FeaturedJobs() {
  const t = await getTranslations("landing");
  const tJobs = await getTranslations("jobs");
  const locale = await getLocale();

  let jobs: Array<{
    id: string;
    title: string;
    description: string;
    governorate: string;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    status: string;
    category: { name: string } | null;
    createdAt: string;
  }> = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs?status=OPEN&limit=6`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      jobs = data.jobs || [];
    }
  } catch {
    // Silently fail - show empty state
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
          🛠️
        </div>
        <p className="text-base font-medium text-gray-500">
          {locale === "ar" ? "لا توجد طلبات حالياً" : "No jobs available yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
          <Card className="h-full overflow-hidden border border-gray-200 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary-200 group-hover:shadow-lg">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-600" />
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
                  {job.title}
                </h3>
                <Badge variant={job.status as "OPEN"}>
                  {tJobs(`status.${job.status}` as never)}
                </Badge>
              </div>
              <p className="mb-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">📍</span>
                  {job.governorate}
                </span>
                {job.budgetMin != null && (
                  <span className="flex items-center gap-1 font-medium text-primary-600">
                    <span aria-hidden="true">💰</span>
                    {job.budgetMin.toLocaleString()}
                    {job.budgetMax ? `–${job.budgetMax.toLocaleString()}` : ""}{" "}
                    {job.currency === "SYP" ? "ل.س" : "$"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function FeaturedJobsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-44" />
      ))}
    </div>
  );
}

export async function generateMetadata() {
  const t = await getTranslations("landing");
  return {
    title: t("hero.title"),
    description: t("hero.subtitle"),
  };
}

async function ServiceCategories({ locale }: { locale: string }) {
  let categories: Array<{
    id: string;
    slug: string;
    name: string;
    nameAr: string;
    icon?: string | null;
  }> = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      categories = await res.json();
    }
  } catch {
    // Silently fail
  }

  if (categories.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {categories.map((cat) => {
        const emoji = cat.icon || CATEGORY_EMOJI[cat.slug] || "🛠️";
        const label = locale === "ar" ? cat.nameAr : cat.name;
        return (
          <Link
            key={cat.slug}
            href={`/find-jobs?categoryId=${cat.id}`}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors duration-200 group-hover:bg-primary-100">
              <span
                className="text-2xl transition-transform duration-200 group-hover:scale-110"
                role="img"
                aria-hidden="true"
              >
                {emoji}
              </span>
            </div>
            <span className="text-center text-xs font-semibold text-gray-700 leading-tight group-hover:text-primary-700 transition-colors duration-200">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const locale = await getLocale();

  // Load real stats from DB
  const [craftsmenCount, jobsCount] = await Promise.all([
    prisma.user.count({ where: { role: "CRAFTSMAN", isActive: true } }),
    prisma.job.count(),
  ]).catch(() => [0, 0]);

  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
        {/* Decorative geometric pattern inspired by Syrian art */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <svg
            className="h-full w-full"
            viewBox="0 0 800 500"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="hero-pattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path d="M40 0L80 40L40 80L0 40Z" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="40" cy="40" r="10" stroke="white" strokeWidth="1" fill="none" />
                <circle cx="40" cy="40" r="3" fill="white" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#hero-pattern)" />
          </svg>
        </div>

        {/* Radial glow in center */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            {/* Trust badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-secondary-400 animate-pulse" aria-hidden="true" />
              {locale === "ar" ? "منصة الحرفيين الموثوقة في سوريا" : "Syria's Trusted Craftsmen Platform"}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-lg text-primary-100 sm:text-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/post-job"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-primary-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                <span className="me-2" aria-hidden="true">🔨</span>
                {t("hero.postJob")}
              </Link>
              <Link
                href="/find-jobs"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                <span className="me-2" aria-hidden="true">🔍</span>
                {t("hero.findWork")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6">
              {[
                { value: craftsmenCount > 0 ? `${craftsmenCount}+` : "500+", label: t("hero.stats.craftsmen"), icon: "👷" },
                { value: jobsCount > 0 ? `${jobsCount}+` : "1,000+", label: t("hero.stats.jobs"), icon: "📋" },
                { value: "14", label: t("hero.stats.cities"), icon: "🏙️" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary-200 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 start-0 end-0">
          <svg viewBox="0 0 1440 72" fill="none" className="w-full text-white" aria-hidden="true" preserveAspectRatio="none">
            <path d="M0 36C240 72 480 0 720 36C960 72 1200 0 1440 36V72H0V36Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-16 sm:py-24" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
              {locale === "ar" ? "كيف يعمل" : "How It Works"}
            </span>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              {t("howItWorks.title")}
            </h2>
          </div>

          <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connector line (desktop only) */}
            <div className="absolute top-7 start-0 end-0 hidden h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent lg:block" aria-hidden="true" />

            {(["step1", "step2", "step3", "step4"] as const).map(
              (step, idx) => (
                <article key={step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-xl font-extrabold text-white shadow-lg shadow-primary-200">
                    {idx + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">
                    {t(`howItWorks.${step}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {t(`howItWorks.${step}.description`)}
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Service Categories ── */}
      <section
        className="bg-gray-50 py-16 sm:py-24"
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
              {locale === "ar" ? "التخصصات" : "Services"}
            </span>
            <h2
              id="categories-heading"
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              {t("categories.title")}
            </h2>
            <p className="mt-3 text-base text-gray-500">
              {locale === "ar"
                ? "اختر التخصص الذي تحتاجه وتواصل مع الحرفي المناسب"
                : "Choose the specialty you need and connect with the right craftsman"}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} variant="card" className="h-24" />
                ))}
              </div>
            }
          >
            <ServiceCategories locale={locale} />
          </Suspense>
        </div>
      </section>

      {/* ── Trust / Why Us ── */}
      <section className="bg-white py-16 sm:py-24" aria-labelledby="trust-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-secondary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-700">
              {locale === "ar" ? "لماذا نحن" : "Why Choose Us"}
            </span>
            <h2
              id="trust-heading"
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              {locale === "ar" ? "منصة تستحق ثقتك" : "A Platform You Can Trust"}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "✅",
                titleAr: "حرفيون موثوقون",
                titleEn: "Verified Craftsmen",
                descAr: "جميع الحرفيين لدينا موثقون ومراجَعون من قبل الفريق",
                descEn: "All craftsmen are verified and reviewed by our team",
              },
              {
                icon: "💬",
                titleAr: "تواصل مباشر",
                titleEn: "Direct Communication",
                descAr: "تحدث مع الحرفي مباشرةً عبر نظام المراسلة الآمن",
                descEn: "Talk directly with craftsmen through our secure messaging",
              },
              {
                icon: "⭐",
                titleAr: "تقييمات شفافة",
                titleEn: "Transparent Reviews",
                descAr: "اقرأ تقييمات حقيقية من عملاء سابقين قبل الاختيار",
                descEn: "Read genuine reviews from previous customers before choosing",
              },
            ].map((item) => (
              <div
                key={item.titleEn}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-2xl transition-colors duration-200 group-hover:bg-primary-100">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    {locale === "ar" ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section
        className="bg-gray-50 py-16 sm:py-24"
        aria-labelledby="featured-jobs-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
                {locale === "ar" ? "أحدث الطلبات" : "Latest Jobs"}
              </span>
              <h2
                id="featured-jobs-heading"
                className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
              >
                {t("featuredJobs.title")}
              </h2>
            </div>
            <Link
              href="/find-jobs"
              className="hidden items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-lg sm:flex"
            >
              {t("featuredJobs.viewAll")}
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="mt-8">
            <Suspense fallback={<FeaturedJobsSkeleton />}>
              <FeaturedJobs />
            </Suspense>
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/find-jobs"
              className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {t("featuredJobs.viewAll")}
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA for Craftsmen ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 py-20 sm:py-28">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="20" stroke="white" strokeWidth="1" fill="none" />
                <circle cx="30" cy="30" r="8" stroke="white" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#cta-pattern)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <span aria-hidden="true">🔨</span>
            {locale === "ar" ? "للحرفيين المحترفين" : "For Professional Craftsmen"}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {t("cta.craftsman.title")}
          </h2>
          <p className="mt-4 text-lg text-primary-100 leading-relaxed">
            {t("cta.craftsman.description")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-10 py-3.5 text-base font-bold text-primary-700 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-primary-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation"
            >
              {t("cta.craftsman.button")}
            </Link>
            <Link
              href="/find-jobs"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white touch-manipulation"
            >
              {locale === "ar" ? "تصفح الطلبات" : "Browse Jobs"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
