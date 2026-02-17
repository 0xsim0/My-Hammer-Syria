"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Modal";
import { CURRENCY_SYMBOLS } from "@/lib/constants";

type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

interface BidCardProps {
  bid: {
    id: string;
    price: number;
    currency: string;
    estimatedDays: number;
    message: string;
    status: BidStatus;
    craftsman: {
      id: string;
      name: string;
      image?: string | null;
      avgRating?: number;
      totalReviews?: number;
    };
  };
  jobId: string;
  isCustomer?: boolean;
  isOwnBid?: boolean;
  className?: string;
}

export function BidCard({
  bid,
  jobId,
  isCustomer,
  isOwnBid,
  className,
}: BidCardProps) {
  const t = useTranslations("bids");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"ACCEPTED" | "REJECTED" | "WITHDRAWN" | null>(null);
  const [loading, setLoading] = useState(false);

  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-SY" : "en-US",
    { style: "decimal", maximumFractionDigits: 0 }
  ).format(bid.price);

  const symbol = CURRENCY_SYMBOLS[bid.currency] || bid.currency;
  const isLongMessage = bid.message.length > 150;
  const displayMessage = !expanded && isLongMessage ? bid.message.slice(0, 150) + "..." : bid.message;

  const handleStatusUpdate = async (status: "ACCEPTED" | "REJECTED" | "WITHDRAWN") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/bids/${bid.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(tCommon("success"));
        setConfirmAction(null);
      } else {
        toast.error(tCommon("error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmLabels: Record<string, { title: string; description: string; variant: "primary" | "destructive" }> = {
    ACCEPTED: { title: t("accept"), description: t("accept") + "?", variant: "primary" },
    REJECTED: { title: t("reject"), description: t("reject") + "?", variant: "destructive" },
    WITHDRAWN: { title: t("withdraw"), description: t("withdraw") + "?", variant: "destructive" },
  };

  return (
    <>
      <Card className={cn("p-4", className)}>
        <div className="flex flex-col gap-3">
          {/* Craftsman info */}
          <div className="flex items-center gap-3">
            <Avatar
              src={bid.craftsman.image}
              name={bid.craftsman.name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">
                {bid.craftsman.name}
              </p>
              {bid.craftsman.avgRating != null && (
                <div className="flex items-center gap-1">
                  <StarRatingDisplay rating={bid.craftsman.avgRating} size={14} />
                  {bid.craftsman.totalReviews != null && (
                    <span className="text-xs text-gray-500">
                      ({bid.craftsman.totalReviews})
                    </span>
                  )}
                </div>
              )}
            </div>
            <Badge variant={bid.status}>{t(`status.${bid.status}`)}</Badge>
          </div>

          {/* Price and estimated days */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-900">
              {formattedPrice} {symbol}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock size={14} aria-hidden="true" />
              {bid.estimatedDays} {t("estimatedDays").toLowerCase()}
            </span>
          </div>

          {/* Message */}
          <div className="text-sm text-gray-700">
            <p>{displayMessage}</p>
            {isLongMessage && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-primary-600 hover:underline"
              >
                {expanded ? tCommon("close") : tCommon("seeMore")}
              </button>
            )}
          </div>

          {/* Actions */}
          {bid.status === "PENDING" && (
            <div className="flex gap-2 pt-1">
              {isCustomer && (
                <>
                  <Button
                    size="sm"
                    onClick={() => setConfirmAction("ACCEPTED")}
                  >
                    {t("accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmAction("REJECTED")}
                  >
                    {t("reject")}
                  </Button>
                </>
              )}
              {isOwnBid && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmAction("WITHDRAWN")}
                >
                  {t("withdraw")}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <DialogRoot open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction && confirmLabels[confirmAction]?.title}
            </DialogTitle>
            <DialogDescription>
              {confirmAction && confirmLabels[confirmAction]?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{tCommon("cancel")}</Button>
            </DialogClose>
            <Button
              variant={confirmAction ? confirmLabels[confirmAction]?.variant : "primary"}
              isLoading={loading}
              onClick={() => confirmAction && handleStatusUpdate(confirmAction)}
            >
              {tCommon("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
