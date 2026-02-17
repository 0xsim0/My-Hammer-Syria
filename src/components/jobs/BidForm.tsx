"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createBidSchema, type CreateBidInput } from "@/lib/validations/bid";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/lib/constants";

interface BidFormProps {
  jobId: string;
}

export function BidForm({ jobId }: BidFormProps) {
  const t = useTranslations("bids");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBidInput>({
    resolver: zodResolver(createBidSchema),
    defaultValues: {
      currency: "SYP",
    },
  });

  const message = watch("message") || "";
  const currency = watch("currency") || "SYP";

  const onSubmit = async (data: CreateBidInput) => {
    const res = await fetch(`/api/jobs/${jobId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(t("success"));
      reset();
    } else {
      const err = await res.json().catch(() => null);
      toast.error(err?.message || tCommon("error"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h3 className="text-lg font-semibold text-gray-900">{t("title")}</h3>

      {/* Price + Currency */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label={`${t("price")} (${CURRENCY_SYMBOLS[currency]})`}
            type="number"
            min={1}
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
          />
        </div>
        <fieldset>
          <legend className="sr-only">{t("currency")}</legend>
          <div className="flex items-center gap-2 pb-1">
            {CURRENCIES.map((cur) => (
              <label key={cur} className="flex cursor-pointer items-center gap-1 text-sm">
                <input
                  type="radio"
                  value={cur}
                  checked={currency === cur}
                  onChange={() => setValue("currency", cur)}
                  className="text-primary-600 focus:ring-primary-500"
                  aria-label={`${t("currency")}: ${cur}`}
                />
                {cur}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Estimated Days */}
      <Input
        label={t("estimatedDays")}
        type="number"
        min={1}
        max={365}
        error={errors.estimatedDays?.message}
        {...register("estimatedDays", { valueAsNumber: true })}
      />

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bid-message" className="text-sm font-medium text-gray-700">
          {t("message")}
        </label>
        <textarea
          id="bid-message"
          rows={4}
          placeholder={t("messagePlaceholder")}
          aria-describedby={errors.message ? "bid-message-error" : undefined}
          aria-invalid={errors.message ? true : undefined}
          className={cn(
            "flex w-full rounded-lg border bg-white px-3 py-2 text-sm",
            "border-gray-300 text-gray-900 placeholder:text-gray-400",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
            errors.message && "border-red-500 focus-visible:ring-red-500"
          )}
          {...register("message")}
        />
        <div className="flex justify-between text-xs text-gray-500">
          {errors.message ? (
            <p id="bid-message-error" className="text-red-600" role="alert">
              {errors.message.message}
            </p>
          ) : (
            <span />
          )}
          <span>{message.length} / 2000</span>
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
