import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Skeleton,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import BidFormWrapper from "./BidFormWrapper";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  governorate: string;
  address?: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deadline?: string | null;
  images?: string | string[]; // SQLite stores as JSON string
  category?: { name: string } | null;
  _count?: { bids: number };
  createdAt: string;
  customer: {
    id: string;
    name: string;
    image?: string | null;
    createdAt: string;
  };
}

async function JobDetail({ jobId }: { jobId: string }) {
  const t = await getTranslations("jobs");
  const tBids = await getTranslations("bids");
  const tAuth = await getTranslations("auth");
  const tDetail = await getTranslations("jobDetail");
  const locale = await getLocale();
  const session = await auth();

  let job: Job | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      job = await res.json();
    }
  } catch {
    // Not found
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">{tDetail("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/find-jobs">{t("list.title")}</Link>
        </Button>
      </div>
    );
  }

  const isCraftsman = session?.user?.role === "CRAFTSMAN";
  const isOpen = job.status === "OPEN";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <article>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {job.title}
          </h1>
          <Badge variant={job.status as "OPEN"} className="shrink-0 text-sm">
            {t(`status.${job.status}`)}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Images gallery */}
            {(() => {
              const parsedImages: string[] = typeof job.images === "string"
                ? JSON.parse(job.images || "[]")
                : (job.images || []);
              return parsedImages.length > 0 ? (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {parsedImages.map((img: string, i: number) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                      >
                        <img
                          src={img}
                          alt={`${job.title} - ${i + 1}`}
                          className="h-full w-full object-cover"
                          width={300}
                          height={300}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              ) : null;
            })()}

            {/* Bid form */}
            {isCraftsman && isOpen && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {tBids("title")}
                  </h2>
                </CardHeader>
                <CardContent>
                  <BidFormWrapper jobId={job.id} />
                </CardContent>
              </Card>
            )}

            {!session && isOpen && (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <p className="text-gray-600">
                    {tDetail("loginToBid")}
                  </p>
                  <Button asChild>
                    <Link href="/login">{tAuth("login")}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Job info */}
            <Card>
              <CardContent className="flex flex-col gap-3 p-5">
                {job.category && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{t("post.category")}</p>
                    <p className="text-sm text-gray-900">{job.category.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">{t("detail.governorate")}</p>
                  <p className="text-sm text-gray-900">{job.governorate}</p>
                </div>
                {job.budgetMin != null && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{t("detail.budget")}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(job.budgetMin, job.currency)}
                      {job.budgetMax
                        ? ` – ${formatCurrency(job.budgetMax, job.currency)}`
                        : ""}
                    </p>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{t("detail.deadline")}</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(job.deadline, locale)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">{t("detail.postedAt")}</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(job.createdAt, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">{t("detail.bids")}</p>
                  <p className="text-sm text-gray-900">{job._count?.bids ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer info */}
            <Card>
              <CardContent className="p-5">
                <p className="mb-3 text-xs font-medium text-gray-500 uppercase">
                  {t("detail.postedBy")}
                </p>
                <Link
                  href={`/profile/${job.customer.id}`}
                  className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
                >
                  <Avatar
                    name={job.customer.name}
                    src={job.customer.image}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {job.customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(job.customer.createdAt, locale)}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton variant="text" className="mb-6 h-10 w-72" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton variant="card" className="h-48" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const job = await res.json();
      return { title: job.title };
    }
  } catch {
    // fallback
  }
  return { title: "Job Details" };
}

export default async function PublicJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetail jobId={jobId} />
    </Suspense>
  );
}
