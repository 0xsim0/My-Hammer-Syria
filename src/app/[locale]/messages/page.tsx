"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar, Card, CardContent, Skeleton } from "@/components/ui";
import { formatRelativeDate } from "@/lib/utils";

interface ConversationParticipant {
  id: string;
  name: string;
  nameAr?: string | null;
  image?: string | null;
}

interface Conversation {
  id: string;
  lastMessage?: { content: string; sender: { id: string; name: string } } | null;
  updatedAt: string;
  participants: ConversationParticipant[];
  job?: { id: string; title: string; titleAr?: string | null } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const t = useTranslations("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl" aria-hidden="true">
            💬
          </div>
          <p className="text-gray-500">{t("noConversations")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conv) => {
            const otherUser = conv.participants[0];
            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar
                      name={otherUser?.name ?? ""}
                      src={otherUser?.image}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {otherUser?.name ?? ""}
                        </p>
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatRelativeDate(conv.updatedAt)}
                        </span>
                      </div>
                      {conv.job && (
                        <p className="text-xs text-primary-600 truncate">
                          {conv.job.title}
                        </p>
                      )}
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-medium text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
