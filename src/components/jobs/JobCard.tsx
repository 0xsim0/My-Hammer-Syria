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
      <Card
        className={cn(
          "h-full p-0 overflow-hidden",
          "group-hover:border-primary-200/60",
          "group-hover:shadow-[0_8px_24px_0_rgba(0,153,82,0.10),0_2px_8px_-2px_rgba(0,153,82,0.08)]",
          "group-hover:-translate-y-0.5",
          "motion-reduce:group-hover:translate-y-0"
        )}
      >
        {/* Top accent strip – only visible on OPEN jobs */}
        {job.status === "OPEN" && (
          <div className="h-0.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />
        )}

        <div className="flex flex-col gap-3 p-5">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors duration-200">
              {job.title}
            </h3>
            <JobStatusBadge status={job.status} />
          </div>

          {/* Category */}
          {job.category && (
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
              <Tag size={13} aria-hidden="true" className="shrink-0 text-primary-500" />
              <span className="truncate font-medium text-gray-600">{job.category.name}</span>
            </div>
          )}

          {/* Governorate */}
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={13} aria-hidden="true" className="shrink-0 text-primary-500" />
            <span className="truncate">{tGov(job.governorate)}</span>
          </div>

          {/* Budget */}
          <div className="mt-0.5">
            {budgetNegotiable ? (
              <span className="text-sm text-gray-400 italic">Budget negotiable</span>
            ) : (
              <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md inline-block">
                {budgetDisplay}
              </span>
            )}
          </div>

          {/* Footer: bids, date, avatar */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-0.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                <Gavel size={11} aria-hidden="true" />
                {job.bidCount ?? 0}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} aria-hidden="true" />
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
