"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
import { createJobSchema, type CreateJobInput } from "@/lib/validations/job";
import {
  GOVERNORATES,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  MAX_IMAGES_PER_JOB,
} from "@/lib/constants";

interface Category {
  id: string;
  name: string;
}

interface PostJobFormProps {
  categories: Category[];
}

const TOTAL_STEPS = 4;

export function PostJobForm({ categories }: PostJobFormProps) {
  const t = useTranslations("jobs.post");
  const tGov = useTranslations("governorates");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      currency: "SYP",
      images: [],
    },
  });

  const description = watch("description") || "";
  const currency = watch("currency") || "SYP";
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");

  const formatBudgetPreview = () => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const fmt = (n: number) =>
      new Intl.NumberFormat(locale === "ar" ? "ar-SY" : "en-US", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(n);

    if (budgetMin && budgetMax) return `${fmt(budgetMin)} - ${fmt(budgetMax)} ${symbol}`;
    if (budgetMin) return `${fmt(budgetMin)}+ ${symbol}`;
    if (budgetMax) return `${fmt(budgetMax)} ${symbol}`;
    return null;
  };

  const stepFields: Record<number, (keyof CreateJobInput)[]> = {
    1: ["title", "categoryId", "description"],
    2: ["governorate"],
    3: [],
    4: [],
  };

  const goNext = async () => {
    const fields = stepFields[step];
    if (fields && fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES_PER_JOB - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.url);
        }
      }
      const updated = [...images, ...uploaded];
      setImages(updated);
      setValue("images", updated);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    setValue("images", updated);
  };

  const onSubmit = async (data: CreateJobInput) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/my-jobs");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <p className="mb-2 text-sm text-gray-500">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < step ? "bg-primary-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Job Details */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <Input
            label={t("jobTitle")}
            placeholder={t("jobTitlePlaceholder")}
            error={errors.title?.message}
            autoComplete="off"
            {...register("title")}
          />

          <Select
            label={t("category")}
            placeholder={tCommon("selectOption")}
            value={watch("categoryId") || ""}
            onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
            error={errors.categoryId?.message}
          >
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder={t("descriptionPlaceholder")}
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={errors.description ? true : undefined}
              className={cn(
                "flex w-full rounded-lg border bg-white px-3 py-2 text-sm",
                "border-gray-300 text-gray-900 placeholder:text-gray-400",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
                errors.description && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("description")}
            />
            <div className="flex justify-between text-xs text-gray-500">
              {errors.description ? (
                <p id="description-error" className="text-red-600" role="alert">
                  {errors.description.message}
                </p>
              ) : (
                <span />
              )}
              <span>{description.length} / 5000</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location & Timing */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <Select
            label={t("governorate")}
            placeholder={tCommon("selectOption")}
            value={watch("governorate") || ""}
            onValueChange={(v) =>
              setValue("governorate", v as CreateJobInput["governorate"], {
                shouldValidate: true,
              })
            }
            error={errors.governorate?.message}
          >
            {GOVERNORATES.map((gov) => (
              <SelectItem key={gov} value={gov}>
                {tGov(gov)}
              </SelectItem>
            ))}
          </Select>

          <Input
            label={t("address")}
            autoComplete="street-address"
            {...register("address")}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="deadline" className="text-sm font-medium text-gray-700">
              {t("deadline")}
            </label>
            <input
              id="deadline"
              type="date"
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm",
                "border-gray-300 text-gray-900",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
              )}
              {...register("deadline")}
            />
          </div>
        </div>
      )}

      {/* Step 3: Budget */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-gray-700">
              {t("currency")}
            </legend>
            <div className="flex items-center gap-4">
              {CURRENCIES.map((cur) => (
                <label key={cur} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={cur}
                    checked={currency === cur}
                    onChange={() => setValue("currency", cur)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  {tCommon(`currency.${cur}`)} ({CURRENCY_SYMBOLS[cur]})
                </label>
              ))}
            </div>
          </fieldset>

          <Input
            label={t("budgetMin")}
            type="number"
            min={0}
            error={errors.budgetMin?.message}
            {...register("budgetMin", { valueAsNumber: true })}
          />

          <Input
            label={t("budgetMax")}
            type="number"
            min={0}
            error={errors.budgetMax?.message}
            {...register("budgetMax", { valueAsNumber: true })}
          />

          {formatBudgetPreview() && (
            <div className="rounded-lg bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">
              {formatBudgetPreview()}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Photos */}
      {step === 4 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t("images")}</p>
            <p className="mb-3 text-xs text-gray-500">
              {images.length}/{MAX_IMAGES_PER_JOB}
            </p>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute end-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                      aria-label={tCommon("delete")}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {images.length < MAX_IMAGES_PER_JOB && (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600">
                {uploading ? (
                  <span className="text-sm">{tCommon("loading")}</span>
                ) : (
                  <>
                    <Upload size={24} aria-hidden="true" />
                    <span className="text-sm">{t("uploadImages")}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={goPrev}>
            {tCommon("back")}
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={goNext}>
            {tCommon("next")}
          </Button>
        ) : (
          <Button type="submit" isLoading={isSubmitting}>
            {t("submit")}
          </Button>
        )}
      </div>
    </form>
  );
}
