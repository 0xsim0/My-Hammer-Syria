"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";

type JobStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const t = useTranslations("jobs.status");

  return (
    <Badge variant={status} className={className}>
      {t(status)}
    </Badge>
  );
}
