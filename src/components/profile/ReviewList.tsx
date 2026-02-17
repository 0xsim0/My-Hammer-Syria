"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StarRatingDisplay } from "@/components/ui/StarRating";

interface Review {
  id: string;
  rating: number;
  qualityRating?: number | null;
  punctualityRating?: number | null;
  comment?: string | null;
  createdAt: string | Date;
  reviewer: {
    name: string;
    image?: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  className?: string;
}

export function ReviewList({
  reviews,
  hasMore,
  onLoadMore,
  loadingMore,
  className,
}: ReviewListProps) {
  const t = useTranslations("profile");
  const tReviews = useTranslations("reviews");
  const locale = useLocale();

  if (reviews.length === 0) {
    return (
      <div className={cn("py-8 text-center text-gray-500", className)}>
        {t("noReviews")}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {reviews.map((review) => {
        const date = new Intl.DateTimeFormat(
          locale === "ar" ? "ar-SY" : "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        ).format(new Date(review.createdAt));

        return (
          <div
            key={review.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar
                src={review.reviewer.image}
                name={review.reviewer.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-gray-900">
                    {review.reviewer.name}
                  </p>
                  <span className="shrink-0 text-xs text-gray-500">{date}</span>
                </div>

                <StarRatingDisplay rating={review.rating} size={14} className="mt-1" />

                {/* Sub-ratings */}
                {(review.qualityRating != null || review.punctualityRating != null) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                    {review.qualityRating != null && (
                      <span className="flex items-center gap-1">
                        {tReviews("quality")}:
                        <StarRatingDisplay rating={review.qualityRating} size={12} />
                      </span>
                    )}
                    {review.punctualityRating != null && (
                      <span className="flex items-center gap-1">
                        {tReviews("punctuality")}:
                        <StarRatingDisplay rating={review.punctualityRating} size={12} />
                      </span>
                    )}
                  </div>
                )}

                {review.comment && (
                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            isLoading={loadingMore}
          >
            {tReviews("submit").replace("Submit Review", "Load More")}
          </Button>
        </div>
      )}
    </div>
  );
}
