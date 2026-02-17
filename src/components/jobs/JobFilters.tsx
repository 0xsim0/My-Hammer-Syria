"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { Select, SelectItem } from "@/components/ui/Select";
import { GOVERNORATES, CURRENCIES, JOB_STATUSES } from "@/lib/constants";

interface Category {
  id: string;
  name: string;
}

interface JobFiltersProps {
  categories: Category[];
  role?: "CUSTOMER" | "CRAFTSMAN";
  className?: string;
}

export function JobFilters({ categories, role, className }: JobFiltersProps) {
  const t = useTranslations("jobs.list.filter");
  const tGov = useTranslations("governorates");
  const tStatus = useTranslations("jobs.status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categoryId") || "";
  const currentGovernorate = searchParams.get("governorate") || "";
  const currentCurrency = searchParams.get("currency") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("?");
  };

  const hasFilters =
    currentCategory || currentGovernorate || currentCurrency || currentStatus;

  const statusOptions =
    role === "CRAFTSMAN" ? (["OPEN"] as const) : JOB_STATUSES;

  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      {/* Category */}
      <Select
        label={t("category")}
        placeholder={tCommon("selectOption")}
        value={currentCategory}
        onValueChange={(v) => updateParam("categoryId", v)}
        aria-label={t("category")}
      >
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </Select>

      {/* Governorate */}
      <Select
        label={t("governorate")}
        placeholder={tCommon("selectOption")}
        value={currentGovernorate}
        onValueChange={(v) => updateParam("governorate", v)}
        aria-label={t("governorate")}
      >
        {GOVERNORATES.map((gov) => (
          <SelectItem key={gov} value={gov}>
            {tGov(gov)}
          </SelectItem>
        ))}
      </Select>

      {/* Currency radio group */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700">
          {t("currency")}
        </legend>
        <div className="flex items-center gap-3">
          {CURRENCIES.map((cur) => (
            <label
              key={cur}
              className="flex cursor-pointer items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="currency"
                value={cur}
                checked={currentCurrency === cur}
                onChange={() => updateParam("currency", currentCurrency === cur ? "" : cur)}
                className="text-primary-600 focus:ring-primary-500"
                aria-label={`${t("currency")}: ${tCommon(`currency.${cur}`)}`}
              />
              {tCommon(`currency.${cur}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Status */}
      <Select
        label={tStatus("OPEN").replace("Open", "Status")}
        placeholder={tCommon("selectOption")}
        value={currentStatus}
        onValueChange={(v) => updateParam("status", v)}
        aria-label="Status filter"
      >
        {statusOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {tStatus(s)}
          </SelectItem>
        ))}
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          aria-label={tCommon("clear")}
        >
          <X size={14} aria-hidden="true" />
          {tCommon("clear")}
        </Button>
      )}
    </div>
  );
}
