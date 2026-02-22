"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, Skeleton } from "@/components/ui";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  titleEn: string;
  titleAr: string;
  bodyEn?: string | null;
  bodyAr?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (locale === "ar") {
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // handle silently
    }
  }

  async function markRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // handle silently
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          {unreadCount > 0 && (
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Bell className="h-16 w-16 text-gray-300" aria-hidden="true" />
          <p className="text-gray-500">{t("noNotifications")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {notifications.map((n) => {
            const title = locale === "ar" ? n.titleAr : n.titleEn;
            const body = locale === "ar" ? n.bodyAr : n.bodyEn;
            const content = (
              <div
                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  n.isRead
                    ? "border-gray-200 bg-white"
                    : "border-primary-200 bg-primary-50"
                }`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    n.isRead ? "bg-transparent" : "bg-primary-600"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  {body && (
                    <p className="mt-0.5 text-sm text-gray-600">{body}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {timeAgo(n.createdAt, locale)}
                  </p>
                </div>
              </div>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link as never} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl">
                    {content}
                  </Link>
                ) : (
                  <div className="cursor-pointer">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
