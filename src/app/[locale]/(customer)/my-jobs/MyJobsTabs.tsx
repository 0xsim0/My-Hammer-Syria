"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { JOB_STATUSES } from "@/lib/constants";

export default function MyJobsTabs({
  currentStatus,
}: {
  currentStatus?: string;
}) {
  const t = useTranslations("jobs");

  const tabs = [
    { key: undefined, label: "All" },
    ...JOB_STATUSES.map((s) => ({ key: s, label: t(`status.${s}`) })),
  ];

  return (
    <nav aria-label="Job status filter" className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.key;
        const href = tab.key ? `/my-jobs?status=${tab.key}` : "/my-jobs";

        return (
          <Link
            key={tab.key ?? "all"}
            href={href}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
              isActive
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
