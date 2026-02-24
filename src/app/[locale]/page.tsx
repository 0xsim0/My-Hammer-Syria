import { Suspense } from "react";
import { getTranslations, getLocale, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  Hammer,
  Wrench,
  ClipboardList,
  Users,
  CheckCircle2,
  ThumbsUp,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Star,
  ChevronRight,
} from "lucide-react";

// Emoji / icon map keyed by category slug
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

// ── Featured Jobs ────────────────────────────────────────────────────────────
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
    const dbJobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      select: {
        id: true,
        title: true,
        description: true,
        governorate: true,
        budgetMin: true,
        budgetMax: true,
        currency: true,
        status: true,
        createdAt: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    jobs = dbJobs.map((job) => ({
      ...job,
      createdAt: job.createdAt.toISOString(),
    }));
  } catch {
    // silent
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
      {jobs.map((job, i) => (
        <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
          <Card
            className={`h-full overflow-hidden card-accent-start border border-gray-100 transition-all duration-250 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-primary-900/8 group-hover:border-primary-200`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors duration-200">
                  {job.title}
                </h3>
                <Badge variant={job.status as "OPEN"} className="shrink-0">
                  {tJobs(`status.${job.status}` as never)}
                </Badge>
              </div>
              <p className="mb-4 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">📍</span>
                  {job.governorate}
                </span>
                {job.budgetMin != null && (
                  <span className="flex items-center gap-1 font-semibold text-primary-600">
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

// ── Service Categories ───────────────────────────────────────────────────────
async function ServiceCategories({ locale }: { locale: string }) {
  let categories: Array<{
    id: string;
    slug: string;
    name: string;
    nameAr: string;
    icon?: string | null;
  }> = [];

  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, nameAr: true, icon: true },
      orderBy: { name: "asc" },
    });
  } catch {
    // silent
  }

  if (categories.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {categories.map((cat) => {
        const emoji = cat.icon || CATEGORY_EMOJI[cat.slug] || "🛠️";
        const label = locale === "ar" ? cat.nameAr : cat.name;
        return (
          <Link
            key={cat.slug}
            href={`/find-jobs?categoryId=${cat.id}`}
            className="chip-hover group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation"
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

// ── Landing Page ─────────────────────────────────────────────────────────────
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);

  const t = await getTranslations("landing");
  const isRTL = locale === "ar";

  const [craftsmenCount, jobsCount] = await Promise.all([
    prisma.user.count({ where: { role: "CRAFTSMAN", isActive: true } }),
    prisma.job.count(),
  ]).catch(() => [0, 0]);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e2c] via-primary-700 to-primary-600">

        {/* Grain / noise texture */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Geometric diamond pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.055]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 800 500" fill="none" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="hero-diamonds" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 4L76 40L40 76L4 40Z" stroke="white" strokeWidth="1.2" fill="none" />
                <circle cx="40" cy="40" r="5" stroke="white" strokeWidth="0.8" fill="none" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#hero-diamonds)" />
          </svg>
        </div>

        {/* Radial center glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,255,255,0.07)_0%,transparent_100%)]" />

        {/* Floating decorative tool icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-6 end-[8%] anim-float opacity-[0.07]">
            <Hammer className="h-40 w-40 text-white" />
          </div>
          <div className="absolute bottom-16 start-[4%] anim-float-b opacity-[0.06]">
            <Wrench className="h-28 w-28 text-white" />
          </div>
          <div className="absolute top-1/3 end-[25%] anim-float-c opacity-[0.04]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
              <path d="M12 2L22 12L12 22L2 12Z" />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">

            {/* Trust badge */}
            <div className="anim-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden="true" />
              {locale === "ar"
                ? "منصة الحرفيين الموثوقة في سوريا"
                : "Syria's Trusted Craftsmen Platform"}
            </div>

            {/* H1 */}
            <h1 className="anim-fade-in-up anim-delay-100 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p className="anim-fade-in-up anim-delay-200 mt-5 text-lg text-primary-100 sm:text-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="anim-fade-in-up anim-delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/post-job"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-lg shadow-black/25 transition-all duration-200 hover:bg-primary-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                <Hammer className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
                {t("hero.postJob")}
              </Link>
              <Link
                href="/find-jobs"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                <Wrench className="h-4 w-4" aria-hidden="true" />
                {t("hero.findWork")}
              </Link>
            </div>

            {/* Stats */}
            <div className="anim-fade-in-up anim-delay-500 mt-14 grid grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  value: craftsmenCount > 0 ? `${craftsmenCount}+` : "500+",
                  label: t("hero.stats.craftsmen"),
                  icon: "👷",
                },
                {
                  value: jobsCount > 0 ? `${jobsCount}+` : "1,000+",
                  label: t("hero.stats.jobs"),
                  icon: "📋",
                },
                {
                  value: "14",
                  label: t("hero.stats.cities"),
                  icon: "🏙️",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/25"
                >
                  <p className="text-2xl font-black text-white sm:text-3xl lg:text-4xl tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary-200 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 start-0 end-0">
          <svg
            viewBox="0 0 1440 64"
            fill="none"
            className="w-full text-white"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path
              d="M0 32C180 64 360 0 540 32C720 64 900 0 1080 32C1260 64 1350 16 1440 32V64H0V32Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-24" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700">
              {locale === "ar" ? "كيف يعمل" : "How It Works"}
            </span>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              {t("howItWorks.title")}
            </h2>
          </div>

          {/* Steps — card grid */}
          <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { key: "step1", Icon: ClipboardList },
                { key: "step2", Icon: Users },
                { key: "step3", Icon: CheckCircle2 },
                { key: "step4", Icon: ThumbsUp },
              ] as const
            ).map(({ key, Icon }, idx) => (
              <article key={key} className="relative">
                <div className="step-card flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  {/* Number + icon row */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-base font-black text-white shadow-md shadow-primary-200">
                      {idx + 1}
                    </div>
                    <Icon className="h-5 w-5 text-primary-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t(`howItWorks.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {t(`howItWorks.${key}.description`)}
                  </p>
                </div>

                {/* Connector arrow between cards (desktop) */}
                {idx < 3 && (
                  <div
                    className="absolute top-1/2 -end-3 z-10 hidden -translate-y-1/2 lg:flex"
                    aria-hidden="true"
                  >
                    <ChevronRight className="h-5 w-5 text-primary-300" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICE CATEGORIES
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gray-50 py-16 sm:py-24"
        aria-labelledby="categories-heading"
      >
        {/* Subtle background dots */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 400 400" fill="none" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#12bc6c" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700">
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
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
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

      {/* ══════════════════════════════════════════
          TRUST / WHY US
      ══════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-24" aria-labelledby="trust-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
              {locale === "ar" ? "لماذا نحن" : "Why Choose Us"}
            </span>
            <h2
              id="trust-heading"
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              {locale === "ar" ? "منصة تستحق ثقتك" : "A Platform You Can Trust"}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: ShieldCheck,
                color: "text-primary-600",
                bg: "bg-primary-50",
                accentBg: "bg-primary-600",
                titleAr: "حرفيون موثوقون",
                titleEn: "Verified Craftsmen",
                descAr: "جميع الحرفيين لدينا موثقون ومراجَعون من قبل الفريق",
                descEn: "All craftsmen are verified and reviewed by our team",
              },
              {
                Icon: MessageCircle,
                color: "text-blue-600",
                bg: "bg-blue-50",
                accentBg: "bg-blue-600",
                titleAr: "تواصل مباشر",
                titleEn: "Direct Communication",
                descAr: "تحدث مع الحرفي مباشرةً عبر نظام المراسلة الآمن",
                descEn: "Talk directly with craftsmen through our secure messaging",
              },
              {
                Icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-50",
                accentBg: "bg-amber-500",
                titleAr: "تقييمات شفافة",
                titleEn: "Transparent Reviews",
                descAr: "اقرأ تقييمات حقيقية من عملاء سابقين قبل الاختيار",
                descEn: "Read genuine reviews from previous customers before choosing",
              },
            ].map((item) => (
              <div
                key={item.titleEn}
                className="step-card group relative overflow-hidden flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                {/* Accent top bar */}
                <div className={`absolute top-0 start-0 end-0 h-0.5 ${item.accentBg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className={`flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-2xl ${item.bg}`}>
                  <item.Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {locale === "ar" ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED JOBS
      ══════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16 sm:py-24" aria-labelledby="featured-jobs-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700">
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
              className="hidden items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-all duration-200 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:flex"
            >
              {t("featuredJobs.viewAll")}
              <ArrowIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            <Suspense fallback={<FeaturedJobsSkeleton />}>
              <FeaturedJobs />
            </Suspense>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/find-jobs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
            >
              {t("featuredJobs.viewAll")}
              <ArrowIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FOR CRAFTSMEN
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e2c] via-primary-700 to-primary-500 py-20 sm:py-28">

        {/* Grain */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <filter id="grain-cta">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-cta)" />
        </svg>

        {/* Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="cta-circles" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="22" stroke="white" strokeWidth="1" fill="none" />
                <circle cx="30" cy="30" r="10" stroke="white" strokeWidth="0.8" fill="none" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#cta-circles)" />
          </svg>
        </div>

        {/* Floating hammer */}
        <div className="pointer-events-none absolute end-[6%] top-[10%] anim-float-b opacity-[0.07]" aria-hidden="true">
          <Hammer className="h-32 w-32 text-white" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Hammer className="h-4 w-4" aria-hidden="true" />
            {locale === "ar" ? "للحرفيين المحترفين" : "For Professional Craftsmen"}
          </div>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {t("cta.craftsman.title")}
          </h2>
          <p className="mt-4 text-lg text-primary-100 leading-relaxed max-w-2xl mx-auto">
            {t("cta.craftsman.description")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-10 py-3.5 text-base font-bold text-primary-700 shadow-lg shadow-black/25 transition-all duration-200 hover:bg-primary-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation"
            >
              {t("cta.craftsman.button")}
            </Link>
            <Link
              href="/find-jobs"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white touch-manipulation"
            >
              {locale === "ar" ? "تصفح الطلبات" : "Browse Jobs"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}
