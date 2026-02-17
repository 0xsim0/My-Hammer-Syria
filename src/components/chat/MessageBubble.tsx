"use client";

import React from "react";
import { useLocale } from "next-intl";
import { CheckCheck } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface MessageBubbleProps {
  content: string;
  timestamp: string | Date;
  isOwn: boolean;
  isRead?: boolean;
  imageUrl?: string | null;
  className?: string;
}

export function MessageBubble({
  content,
  timestamp,
  isOwn,
  isRead,
  imageUrl,
  className,
}: MessageBubbleProps) {
  const locale = useLocale();

  const time = new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

  return (
    <div
      className={cn(
        "flex",
        isOwn ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "rounded-ee-sm bg-primary-600 text-white"
            : "rounded-es-sm bg-gray-100 text-gray-900"
        )}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="mb-2 max-h-48 rounded-lg object-cover"
          />
        )}

        {content && (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            isOwn ? "justify-end text-white/70" : "text-gray-400"
          )}
        >
          <span>{time}</span>
          {isOwn && isRead && (
            <CheckCheck size={14} aria-hidden="true" className="text-white/70" />
          )}
        </div>
      </div>
    </div>
  );
}
