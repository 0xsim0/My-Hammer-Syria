"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/Avatar";

interface Conversation {
  id: string;
  otherUser: {
    name: string;
    image?: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string | Date;
  } | null;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  className?: string;
}

export function ConversationList({ conversations, className }: ConversationListProps) {
  const t = useTranslations("chat");
  const locale = useLocale();

  if (conversations.length === 0) {
    return (
      <div className={cn("py-12 text-center text-gray-500", className)}>
        {t("noConversations")}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-gray-100", className)}>
      {conversations.map((conv) => {
        const timestamp = conv.lastMessage
          ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
            }).format(new Date(conv.lastMessage.createdAt))
          : "";

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <Avatar
              src={conv.otherUser.image}
              name={conv.otherUser.name}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-gray-900">
                  {conv.otherUser.name}
                </p>
                {timestamp && (
                  <span className="shrink-0 text-xs text-gray-400">
                    {timestamp}
                  </span>
                )}
              </div>

              {conv.lastMessage && (
                <p className="truncate text-sm text-gray-500">
                  {conv.lastMessage.content}
                </p>
              )}
            </div>

            {conv.unreadCount != null && conv.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-medium text-white">
                {conv.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
