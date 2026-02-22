import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import FindJobsSearch from "./FindJobsSearch";

export async function generateMetadata() {
  const t = await getTranslations("jobs.list");
  return { title: t("title") };
}

async function JobResults({
  searchParams,
}: {
  searchParams: {
    categoryId?: string;
    governorate?: string;
    search?: string;
    page?: string;
  };
}) {
  const t = await getTranslations("jobs");
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
    _count?: { bids: number };
    createdAt: string;
    category?: { name: string } | null;
  }> = [];

  let totalPages = 1;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const params = new URLSearchParams({ status: "OPEN" });
    if (searchParams.categoryId) params.set("categoryId", searchParams.categoryId);
    if (searchParams.governorate) params.set("governorate", searchParams.governorate);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.page) params.set("page", searchParams.page);

    const res = await fetch(`${baseUrl}/api/jobs?${params}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      jobs = data.jobs || [];
      totalPages = data.totalPages || 1;
    }
  } catch {
    // Show empty state
  }

  const currentPage = Number(searchParams.page) || 1;

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
                  <span>{formatRelativeDate(job.createdAt, locale)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/find-jobs?${new URLSearchParams({
                ...searchParams,
                page: String(page),
              })}`}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
                page === currentPage
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
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
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string;
    governorate?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const t = await getTranslations("jobs.list");
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <FindJobsSearch
            currentCategory={params.categoryId}
            currentGovernorate={params.governorate}
            currentSearch={params.search}
          />
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={<JobResultsSkeleton />}>
            <JobResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
