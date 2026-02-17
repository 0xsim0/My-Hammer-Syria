"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BID_STATUSES } from "@/lib/constants";

interface Bid {
  id: string;
  price: number;
  currency: string;
  estimatedDays: number;
  message: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    customer: { name: string };
  };
}

export default function MyBidsPage() {
  const t = useTranslations("bids");
  const tJobs = useTranslations("jobs");
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    async function fetchBids() {
      try {
        const res = await fetch("/api/bids/me");
        if (res.ok) {
          const data = await res.json();
          setBids(data.bids || []);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchBids();
  }, []);

  const filteredBids =
    activeTab === "all"
      ? bids
      : bids.filter((b) => b.status === activeTab);

  const tabs = [
    { key: "all", label: "All" },
    ...BID_STATUSES.map((s) => ({ key: s, label: t(`status.${s}`) })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t("myBids.title")}
      </h1>

      {/* Tabs */}
      <nav aria-label="Bid status filter" className="mb-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
              activeTab === tab.key
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl" aria-hidden="true">
            📝
          </div>
          <p className="text-gray-500">{t("myBids.noBids")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBids.map((bid) => (
            <Link key={bid.id} href={`/jobs/${bid.job.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {bid.job.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {tJobs("detail.postedBy")}: {bid.job.customer.name}
                      </p>
                    </div>
                    <Badge variant={bid.status as "PENDING"}>
                      {t(`status.${bid.status}`)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                    {bid.message}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(bid.price, bid.currency)}
                    </span>
                    <span>
                      {bid.estimatedDays} {bid.estimatedDays === 1 ? "day" : "days"}
                    </span>
                    <span>{formatDate(bid.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
