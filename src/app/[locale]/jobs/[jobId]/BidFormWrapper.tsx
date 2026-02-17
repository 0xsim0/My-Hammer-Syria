"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Select,
  SelectItem,
} from "@/components/ui";
import { CURRENCIES } from "@/lib/constants";

export default function BidFormWrapper({ jobId }: { jobId: string }) {
  const t = useTranslations("bids");
  const tCommon = useTranslations("common");

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("SYP");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          currency,
          estimatedDays: Number(estimatedDays),
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || tCommon("error"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t("price")}
          type="number"
          min="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Select
          label={t("currency")}
          value={currency}
          onValueChange={setCurrency}
        >
          {CURRENCIES.map((c) => (
            <SelectItem key={c} value={c}>
              {tCommon(`currency.${c}`)}
            </SelectItem>
          ))}
        </Select>
        <Input
          label={t("estimatedDays")}
          type="number"
          min="1"
          required
          value={estimatedDays}
          onChange={(e) => setEstimatedDays(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bid-message" className="text-sm font-medium text-gray-700">
          {t("message")}
        </label>
        <textarea
          id="bid-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        />
      </div>

      <Button type="submit" isLoading={loading} className="self-end">
        {t("submit")}
      </Button>
    </form>
  );
}
