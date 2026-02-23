import { Suspense } from "react";
import { getTranslations, getLocale, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import FindJobsSearch from "./FindJobsSearch";

const JOBS_PER_PAGE = 12;

export async function generateMetadata() {
  const t = await getTranslations("jobs.list");
  return { title: t("title") };
}

async function JobResults({
  searchParams,
  locale,
}: {
  searchParams: {
    categoryId?: string;
    governorate?: string;
    search?: string;
    page?: string;
  };
  locale: string;
}) {
  const t = await getTranslations("jobs");

  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * JOBS_PER_PAGE;

  let jobs: Array<{
    id: string;
    title: string;
    description: string;
    governorate: string;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    status: string;
    _count?: { bids: number };
    createdAt: Date;
    category?: { name: string } | null;
  }> = [];

  let totalPages = 1;

  try {
    // Build where clause
    const where: Record<string, unknown> = { status: "OPEN" };
    if (searchParams.categoryId) {
      where.categoryId = searchParams.categoryId;
    }
    if (searchParams.governorate) {
      where.governorate = searchParams.governorate;
    }
    if (searchParams.search) {
      where.OR = [
        { title: { contains: searchParams.search, mode: "insensitive" } },
        { description: { contains: searchParams.search, mode: "insensitive" } },
      ];
    }

    // Direct Prisma query - much faster than fetch to API
    const [dbJobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
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
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: JOBS_PER_PAGE,
      }),
      prisma.job.count({ where }),
    ]);

    jobs = dbJobs;
    totalPages = Math.ceil(total / JOBS_PER_PAGE);
  } catch {
    // Show empty state
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-5xl" aria-hidden="true">
          🔍
        </div>
        <p className="text-gray-500">{t("list.noJobs")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900">{job.title}</h2>
                  <Badge variant={job.status as "OPEN"}>
                    {t(`status.${job.status}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {job.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>{job.governorate}</span>
                  {job.category && <span>{job.category.name}</span>}
                  {job.budgetMin != null && (
                    <span>
                      {formatCurrency(job.budgetMin, job.currency)}
                      {job.budgetMax
                        ? ` – ${formatCurrency(job.budgetMax, job.currency)}`
                        : ""}
                    </span>
                  )}
                  {job._count?.bids != null && (
                    <span>
                      {job._count.bids} {t("detail.bids")}
                    </span>
                  )}
                  <span>{formatRelativeDate(job.createdAt.toISOString(), locale)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/find-jobs?${new URLSearchParams({
                ...searchParams,
                page: String(pageNum),
              })}`}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
                pageNum === page
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-current={pageNum === page ? "page" : undefined}
            >
              {pageNum}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

function JobResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-28" />
      ))}
    </div>
  );
}

export default async function FindJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    categoryId?: string;
    governorate?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  
  const t = await getTranslations("jobs.list");
  const params_awaited = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <FindJobsSearch
            currentCategory={params_awaited.categoryId}
            currentGovernorate={params_awaited.governorate}
            currentSearch={params_awaited.search}
          />
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={<JobResultsSkeleton />}>
            <JobResults searchParams={params_awaited} locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
