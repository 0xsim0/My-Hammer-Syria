import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";

const SERVICE_CATEGORIES = [
  { key: "plumbing", emoji: "🔧", slug: "plumbing" },
  { key: "electrical", emoji: "⚡", slug: "electrical" },
  { key: "painting", emoji: "🎨", slug: "painting" },
  { key: "carpentry", emoji: "🪚", slug: "carpentry" },
  { key: "tiling", emoji: "🧱", slug: "tiling" },
  { key: "ac_heating", emoji: "❄️", slug: "ac-heating" },
  { key: "cleaning", emoji: "🧹", slug: "cleaning" },
  { key: "moving", emoji: "🚚", slug: "moving" },
  { key: "gardening", emoji: "🌿", slug: "gardening" },
  { key: "blacksmithing", emoji: "🔨", slug: "blacksmithing" },
  { key: "aluminum", emoji: "🪟", slug: "aluminum" },
  { key: "plastering", emoji: "🏗️", slug: "plastering" },
  { key: "roofing", emoji: "🏠", slug: "roofing" },
  { key: "general", emoji: "🛠️", slug: "general" },
] as const;

const CATEGORY_NAMES_AR: Record<string, string> = {
  plumbing: "سباكة",
  electrical: "كهرباء",
  painting: "دهان",
  carpentry: "نجارة",
  tiling: "بلاط وسيراميك",
  ac_heating: "تكييف وتدفئة",
  cleaning: "تنظيف",
  moving: "نقل أثاث",
  gardening: "حدائق",
  blacksmithing: "حدادة",
  aluminum: "ألمنيوم",
  plastering: "جبس وقصارة",
  roofing: "عزل وأسقف",
  general: "أعمال عامة",
};

const CATEGORY_NAMES_EN: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  painting: "Painting",
  carpentry: "Carpentry",
  tiling: "Tiling & Ceramics",
  ac_heating: "AC & Heating",
  cleaning: "Cleaning",
  moving: "Moving",
  gardening: "Gardening",
  blacksmithing: "Blacksmithing",
  aluminum: "Aluminum & Glass",
  plastering: "Plastering",
  roofing: "Roofing & Insulation",
  general: "General Work",
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
      <p className="text-center text-gray-500 py-8">
        {locale === "ar" ? "لا توجد طلبات حالياً" : "No jobs available yet"}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {job.title}
                </h3>
                <Badge variant={job.status as "OPEN"}>
                  {tJobs(`status.${job.status}` as never)}
                </Badge>
              </div>
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {job.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{job.governorate}</span>
                {job.budgetMin != null && (
                  <span>
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-40" />
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

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const isRTL = locale === "ar";
  const categoryNames = isRTL ? CATEGORY_NAMES_AR : CATEGORY_NAMES_EN;

  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        {/* Decorative pattern inspired by Syrian geometric art */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 800 400"
            fill="none"
            aria-hidden="true"
          >
            <pattern
              id="hero-pattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path d="M40 0L80 40L40 80L0 40Z" stroke="white" strokeWidth="1" fill="none" />
              <circle cx="40" cy="40" r="8" stroke="white" strokeWidth="1" fill="none" />
            </pattern>
            <rect width="800" height="400" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg text-primary-100 sm:text-xl">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/post-job"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-base font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                {t("hero.postJob")}
              </Link>
              <Link
                href="/find-jobs"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg border-2 border-white/80 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation sm:w-auto"
              >
                {t("hero.findWork")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { value: "500+", label: t("hero.stats.craftsmen") },
                { value: "1,000+", label: t("hero.stats.jobs") },
                { value: "14", label: t("hero.stats.cities") },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-primary-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 start-0 end-0">
          <svg viewBox="0 0 1440 64" fill="none" className="w-full text-white" aria-hidden="true">
            <path d="M0 32C360 64 720 0 1440 32V64H0V32Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="how-it-works-heading"
            className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            {t("howItWorks.title")}
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(["step1", "step2", "step3", "step4"] as const).map(
              (step, idx) => (
                <article key={step} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                    {idx + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {t(`howItWorks.${step}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
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
        className="bg-gray-50 py-16 sm:py-20"
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="categories-heading"
            className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            {t("categories.title")}
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/find-jobs?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation"
              >
                <span
                  className="text-3xl transition-transform group-hover:scale-110"
                  role="img"
                  aria-hidden="true"
                >
                  {cat.emoji}
                </span>
                <span className="text-center text-xs font-medium text-gray-700 group-hover:text-primary-700">
                  {categoryNames[cat.key]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section
        className="bg-white py-16 sm:py-20"
        aria-labelledby="featured-jobs-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2
              id="featured-jobs-heading"
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
            >
              {t("featuredJobs.title")}
            </h2>
            <Link
              href="/find-jobs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
            >
              {t("featuredJobs.viewAll")} &rarr;
            </Link>
          </div>

          <div className="mt-8">
            <Suspense fallback={<FeaturedJobsSkeleton />}>
              <FeaturedJobs />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── CTA for Craftsmen ── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-800 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t("cta.craftsman.title")}
          </h2>
          <p className="mt-3 text-lg text-primary-100">
            {t("cta.craftsman.description")}
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 touch-manipulation"
          >
            {t("cta.craftsman.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
