import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge, Card, CardContent, Button, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import MyJobsTabs from "./MyJobsTabs";

export async function generateMetadata() {
  const t = await getTranslations("jobs.myJobs");
  return { title: t("title") };
}

async function JobsList({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const t = await getTranslations("jobs");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const whereClause: {
    customerId: string;
    status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  } = { customerId: session.user.id };
  const validStatuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
  if (
    searchParams.status &&
    (validStatuses as readonly string[]).includes(searchParams.status)
  ) {
    whereClause.status = searchParams.status as typeof validStatuses[number];
  }

  const jobsFromDb = await prisma.job.findMany({
    where: whereClause,
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  const jobs = jobsFromDb.map((job) => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
  }));

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-5xl" aria-hidden="true">
          📋
        </div>
        <p className="text-gray-500">{t("myJobs.noJobs")}</p>
        <Button asChild>
          <Link href="/post-job">{t("myJobs.postFirst")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job) => (
        <Link key={job.id} href={`/my-jobs/${job.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {job.title}
                  </h2>
                  <Badge variant={job.status as "OPEN"}>
                    {t(`status.${job.status}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                  {job.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span>{job.governorate}</span>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-24" />
      ))}
    </div>
  );
}

export default async function MyJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("jobs.myJobs");
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <Button asChild size="sm">
          <Link href="/post-job">{t("postFirst")}</Link>
        </Button>
      </div>

      <MyJobsTabs currentStatus={params.status} />

      <div className="mt-6">
        <Suspense fallback={<JobsListSkeleton />}>
          <JobsList searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
