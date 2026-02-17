"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Tag, Gavel, Calendar } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { JobStatusBadge } from "./JobStatusBadge";
import { CURRENCY_SYMBOLS } from "@/lib/constants";

type JobStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    status: JobStatus;
    governorate: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    currency: string;
    createdAt: string | Date;
    bidCount?: number;
    category?: {
      id: string;
      name: string;
      icon?: string;
    };
    customer?: {
      name: string;
      image?: string | null;
    };
  };
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const t = useTranslations("jobs");
  const tGov = useTranslations("governorates");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SY" : "en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetDisplay = (() => {
    const symbol = CURRENCY_SYMBOLS[job.currency] || job.currency;
    if (job.budgetMin && job.budgetMax) {
      return `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)} ${symbol}`;
    }
    if (job.budgetMin) {
      return `${formatCurrency(job.budgetMin)}+ ${symbol}`;
    }
    if (job.budgetMax) {
      return `${formatCurrency(job.budgetMax)} ${symbol}`;
    }
    return t("detail.budget") + ": " + tCommon("selectOption").replace("...", "") + "negotiable";
  })();

  const budgetNegotiable = !job.budgetMin && !job.budgetMax;

  const postedDate = new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(job.createdAt));

  return (
    <Link href={`/jobs/${job.id}`} className={cn("block group", className)}>
      <Card className="h-full p-4 transition-shadow duration-200 group-hover:shadow-md motion-reduce:transition-none">
        <div className="flex flex-col gap-3">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold text-gray-900 line-clamp-2">
              {job.title}
            </h3>
            <JobStatusBadge status={job.status} />
          </div>

          {/* Category */}
          {job.category && (
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
              <Tag size={14} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{job.category.name}</span>
            </div>
          )}

          {/* Governorate */}
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={14} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{tGov(job.governorate)}</span>
          </div>

          {/* Budget */}
          <div className="text-sm font-medium text-gray-900">
            {budgetNegotiable ? (
              <span className="text-gray-500 italic">Budget negotiable</span>
            ) : (
              budgetDisplay
            )}
          </div>

          {/* Footer: bids, date, avatar */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex min-w-0 items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Gavel size={12} aria-hidden="true" />
                {job.bidCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} aria-hidden="true" />
                {postedDate}
              </span>
            </div>

            {job.customer && (
              <Avatar
                src={job.customer.image}
                name={job.customer.name}
                size="sm"
              />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
