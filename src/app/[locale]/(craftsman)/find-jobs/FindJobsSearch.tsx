"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardContent,
  Select,
  SelectItem,
} from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { Search } from "lucide-react";

export default function FindJobsSearch({
  currentCategory,
  currentGovernorate,
  currentSearch,
}: {
  currentCategory?: string;
  currentGovernorate?: string;
  currentSearch?: string;
}) {
  const t = useTranslations("jobs.list.filter");
  const tCommon = useTranslations("common");
  const tGov = useTranslations("governorates");
  const router = useRouter();

  const [search, setSearch] = useState(currentSearch || "");
  const [category, setCategory] = useState(currentCategory || "");
  const [governorate, setGovernorate] = useState(currentGovernorate || "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (governorate) params.set("governorate", governorate);
    router.push(`/find-jobs?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setGovernorate("");
    router.push("/find-jobs");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        {/* Search */}
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tCommon("search")}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <button
            onClick={applyFilters}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation"
            aria-label={tCommon("search")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
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

        <div className="flex gap-2">
          <Button onClick={applyFilters} size="sm" className="flex-1">
            {tCommon("filter")}
          </Button>
          <Button onClick={clearFilters} size="sm" variant="ghost">
            {tCommon("clear")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
