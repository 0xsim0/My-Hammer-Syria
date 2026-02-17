"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Button,
  Input,
  Card,
  CardContent,
  Select,
  SelectItem,
} from "@/components/ui";
import { GOVERNORATES, CURRENCIES } from "@/lib/constants";

const CATEGORIES = [
  "plumbing",
  "electrical",
  "painting",
  "carpentry",
  "tiling",
  "ac-heating",
  "cleaning",
  "moving",
  "gardening",
  "blacksmithing",
  "aluminum",
  "plastering",
  "roofing",
  "general",
] as const;

export default function PostJobForm() {
  const t = useTranslations("jobs.post");
  const tGov = useTranslations("governorates");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("SYP");
  const [deadline, setDeadline] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          governorate,
          address: address || undefined,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          currency,
          deadline: deadline || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || tCommon("error"));
        return;
      }

      const data = await res.json();
      router.push(`/my-jobs/${data.id || data.job?.id}`);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <Input
            label={t("jobTitle")}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("jobTitlePlaceholder")}
          />

          <Select
            label={t("category")}
            value={category}
            onValueChange={setCategory}
            placeholder={tCommon("selectOption")}
          >
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            />
          </div>

          <Select
            label={t("governorate")}
            value={governorate}
            onValueChange={setGovernorate}
            placeholder={tCommon("selectOption")}
          >
            {GOVERNORATES.map((gov) => (
              <SelectItem key={gov} value={gov}>
                {tGov(gov)}
              </SelectItem>
            ))}
          </Select>

          <Input
            label={t("address")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label={t("budgetMin")}
              type="number"
              min="0"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
            <Input
              label={t("budgetMax")}
              type="number"
              min="0"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
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
          </div>

          <Input
            label={t("deadline")}
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Button type="submit" isLoading={loading} className="mt-2 w-full sm:w-auto sm:self-end">
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
