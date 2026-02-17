"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRatingDisplay } from "@/components/ui/StarRating";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    image?: string | null;
    role: "CUSTOMER" | "CRAFTSMAN";
    governorate?: string | null;
    avgRating?: number;
    totalReviews?: number;
    createdAt: string | Date;
    craftsmanProfile?: {
      businessName?: string | null;
      isAvailable?: boolean;
    } | null;
  };
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  className?: string;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  onEditClick,
  className,
}: ProfileHeaderProps) {
  const t = useTranslations("profile");
  const tGov = useTranslations("governorates");
  const locale = useLocale();

  const memberSince = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SY" : "en-US",
    { year: "numeric", month: "long" }
  ).format(new Date(user.createdAt));

  const isCraftsman = user.role === "CRAFTSMAN";

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-start", className)}>
      <Avatar src={user.image} name={user.name} size="xl" />

      <div className="min-w-0 flex-1 text-center sm:text-start">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <Badge>
            {isCraftsman ? t("isAvailable").replace("Available for Work", "Craftsman") : "Customer"}
          </Badge>
          {isCraftsman && user.craftsmanProfile?.isAvailable && (
            <Badge variant="OPEN">
              <CheckCircle size={12} aria-hidden="true" className="me-1" />
              {t("isAvailable")}
            </Badge>
          )}
        </div>

        {isCraftsman && user.craftsmanProfile?.businessName && (
          <p className="mt-1 text-sm text-gray-600">
            {user.craftsmanProfile.businessName}
          </p>
        )}

        {/* Rating */}
        {user.avgRating != null && user.avgRating > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
            <StarRatingDisplay rating={user.avgRating} />
            <span className="text-sm text-gray-500">
              ({user.totalReviews ?? 0} {t("totalReviews").toLowerCase()})
            </span>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 sm:justify-start">
          {user.governorate && (
            <span className="flex items-center gap-1">
              <MapPin size={14} aria-hidden="true" />
              {tGov(user.governorate)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={14} aria-hidden="true" />
            {t("joinedAt")} {memberSince}
          </span>
        </div>
      </div>

      {isOwnProfile && (
        <Button variant="outline" size="sm" onClick={onEditClick}>
          {t("edit")}
        </Button>
      )}
    </div>
  );
}
