"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function AdminActions({
  userId,
  isActive,
  role,
  currentAdminId,
}: {
  userId: string;
  isActive: boolean;
  role: string;
  currentAdminId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  if (userId === currentAdminId) return <span className="text-xs text-gray-400">—</span>;

  async function toggleActive() {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleActive}
      disabled={loading || role === "ADMIN"}
      className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading
        ? "..."
        : isActive
        ? (locale === "ar" ? "إيقاف" : "Deactivate")
        : (locale === "ar" ? "تفعيل" : "Activate")}
    </button>
  );
}
