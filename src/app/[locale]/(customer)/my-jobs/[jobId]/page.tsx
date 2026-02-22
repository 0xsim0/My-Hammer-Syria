"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Skeleton,
  StarRatingInput,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronRight, MessageCircle, Check, X } from "lucide-react";

interface Bid {
  id: string;
  price: number;
  currency: string;
  estimatedDays: number;
  message: string;
  status: string;
  createdAt: string;
  craftsman: {
    id: string;
    name: string;
    image?: string | null;
    avgRating?: number;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  governorate: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deadline?: string | null;
  category?: { name: string } | null;
  bids: Bid[];
  review?: { id: string } | null;
  conversation?: { id: string } | null;
}

export default function JobManagePage({
  params,
}: {
  params: { jobId: string; locale: string };
}) {
  const t = useTranslations("jobs");
  const tBids = useTranslations("bids");
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const jobId = params.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchJob(jobId);
  }, [jobId]);

  async function fetchJob(id: string) {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleBidAction(bidId: string, action: "accept" | "reject") {
    setActionLoading(bidId);
    try {
      await fetch(`/api/jobs/${jobId}/bids/${bidId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "accept" ? "ACCEPTED" : "REJECTED" }),
      });
      fetchJob(jobId);
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete() {
    if (!confirm(t("complete.confirm"))) return;
    setActionLoading("complete");
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      fetchJob(jobId);
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("review");
    try {
      await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          rating,
          comment: reviewComment,
        }),
      });
      setShowReview(false);
      fetchJob(jobId);
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton variant="text" className="mb-4 h-8 w-64" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">{tCommon("noResults")}</p>
        <Button asChild variant="outline">
          <Link href="/my-jobs">{tCommon("back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm">
              {tNav("home")}
            </Link>
          </li>
          <li><ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /></li>
          <li>
            <Link href="/my-jobs" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm">
              {t("myJobs.title")}
            </Link>
          </li>
          <li><ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /></li>
          <li aria-current="page" className="font-medium text-gray-900 truncate max-w-[200px]">
            {job.title}
          </li>
        </ol>
      </nav>

      {/* Job details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant={job.status as "OPEN"}>{t(`status.${job.status}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{t("detail.governorate")}: {job.governorate}</span>
            {job.budgetMin != null && (
              <span>
                {t("detail.budget")}: {formatCurrency(job.budgetMin, job.currency)}
                {job.budgetMax ? ` – ${formatCurrency(job.budgetMax, job.currency)}` : ""}
              </span>
            )}
            {job.deadline && (
              <span>{t("detail.deadline")}: {formatDate(job.deadline)}</span>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            {job.status === "IN_PROGRESS" && (
              <Button
                onClick={handleComplete}
                isLoading={actionLoading === "complete"}
              >
                {t("complete.button")}
              </Button>
            )}
            {job.conversation?.id && (
              <Button asChild variant="outline">
                <Link href={`/messages/${job.conversation.id}`}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {tNav("messages")}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bids */}
      <section aria-labelledby="bids-heading">
        <h2 id="bids-heading" className="mb-4 text-lg font-semibold text-gray-900">
          {t("detail.bids")} ({job.bids.length})
        </h2>

        {job.bids.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("detail.noBids")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {job.bids.map((bid) => (
              <Card key={bid.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={bid.craftsman.name} src={bid.craftsman.image} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/profile/${bid.craftsman.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
                        >
                          {bid.craftsman.name}
                        </Link>
                        <Badge variant={bid.status as "PENDING"}>
                          {tBids(`status.${bid.status}`)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{bid.message}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(bid.price, bid.currency)}
                        </span>
                        <span>
                          {bid.estimatedDays} {bid.estimatedDays === 1 ? "day" : "days"}
                        </span>
                        <span>{formatDate(bid.createdAt)}</span>
                      </div>

                      {bid.status === "PENDING" && job.status === "OPEN" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBidAction(bid.id, "accept")}
                            isLoading={actionLoading === bid.id}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                            {tBids("accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBidAction(bid.id, "reject")}
                            isLoading={actionLoading === bid.id}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            {tBids("reject")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Review form */}
      {job.status === "COMPLETED" && !job.review && (
        <section className="mt-8" aria-labelledby="review-heading">
          <h2 id="review-heading" className="mb-4 text-lg font-semibold text-gray-900">
            {tReviews("title")}
          </h2>

          {!showReview ? (
            <Button onClick={() => setShowReview(true)} variant="outline">
              {tReviews("submit")}
            </Button>
          ) : (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleReview} className="flex flex-col gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {tReviews("rating")}
                    </label>
                    <StarRatingInput value={rating} onChange={setRating} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="review-comment" className="text-sm font-medium text-gray-700">
                      {tReviews("comment")}
                    </label>
                    <textarea
                      id="review-comment"
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={tReviews("commentPlaceholder")}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
                    />
                  </div>
                  <div className="flex gap-2 self-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowReview(false)}
                    >
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      isLoading={actionLoading === "review"}
                      disabled={rating === 0}
                    >
                      {tReviews("submit")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
