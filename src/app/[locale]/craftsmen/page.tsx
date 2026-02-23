import { Suspense } from "react";
import { getTranslations, getLocale, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Avatar, Badge, Card, CardContent, Skeleton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { Star, MapPin } from "lucide-react";

const CRAFTSMEN_PER_PAGE = 12;

export async function generateMetadata() {
  return { title: "Find Craftsmen" };
}

interface SearchParams {
  category?: string;
  governorate?: string;
  sortBy?: string;
  page?: string;
}

async function CraftsmenResults({
  searchParams,
  locale,
}: {
  searchParams: SearchParams;
  locale: string;
}) {
  const t = await getTranslations("craftsmen");
  const isRTL = locale === "ar";

  const category = searchParams.category;
  const governorate = searchParams.governorate;
  const sortBy = searchParams.sortBy || "rating";
  const page = Math.max(1, Number(searchParams.page || "1"));

  const where: Record<string, unknown> = {
    user: { isActive: true },
  };

  if (governorate) {
    where.user = { ...(where.user as object), governorate };
  }

  if (category) {
    where.categories = { some: { slug: category } };
  }

  const orderBy =
    sortBy === "rating"
      ? { user: { avgRating: "desc" as const } }
      : sortBy === "reviews"
      ? { user: { totalReviews: "desc" as const } }
      : { createdAt: "desc" as const };

  const [craftsmen, total] = await Promise.all([
    prisma.craftsmanProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            governorate: true,
            avgRating: true,
            totalReviews: true,
          },
        },
        categories: {
          select: { id: true, name: true, nameAr: true, slug: true, icon: true },
        },
      },
      orderBy,
      skip: (page - 1) * CRAFTSMEN_PER_PAGE,
      take: CRAFTSMEN_PER_PAGE,
    }),
    prisma.craftsmanProfile.count({ where }),
  ]);

  const totalPages = Math.ceil(total / CRAFTSMEN_PER_PAGE);

  if (craftsmen.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-gray-500">{t("noCraftsmen")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {craftsmen.map((craftsman) => {
          const displayName = isRTL
            ? craftsman.user.nameAr || craftsman.user.name
            : craftsman.user.name;
          return (
            <Link key={craftsman.id} href={`/profile/${craftsman.user.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={craftsman.user.name || ""} src={craftsman.user.image} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{displayName}</p>
                      {craftsman.user.governorate && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {craftsman.user.governorate}
                        </p>
                      )}
                    </div>
                  </div>

                  {craftsman.user.avgRating > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span className="font-medium">{craftsman.user.avgRating.toFixed(1)}</span>
                      <span className="text-gray-400">({craftsman.user.totalReviews})</span>
                    </div>
                  )}

                  {craftsman.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {craftsman.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat.id} variant="default" className="text-xs">
                          {isRTL ? cat.nameAr : cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {craftsman.isAvailable !== undefined && (
                    <span className={`text-xs font-medium ${craftsman.isAvailable ? "text-green-600" : "text-gray-400"}`}>
                      {craftsman.isAvailable
                        ? t("available")
                        : t("unavailable")}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/craftsmen?${new URLSearchParams({ ...(category ? { category } : {}), ...(governorate ? { governorate } : {}), sortBy, page: String(p) }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

async function CraftsmenFilters({ 
  searchParams,
  locale 
}: { 
  searchParams: SearchParams;
  locale: string;
}) {
  const t = await getTranslations("craftsmen");
  const isRTL = locale === "ar";
  const category = searchParams.category;
  const sortBy = searchParams.sortBy || "rating";

  // Fetch categories for filter
  const categories = await prisma.category.findMany({ 
    where: { isActive: true }, 
    orderBy: { name: "asc" },
    select: { slug: true, name: true, nameAr: true },
  });

  // Get total count
  const where: Record<string, unknown> = { user: { isActive: true } };
  if (category) {
    where.categories = { some: { slug: category } };
  }
  const total = await prisma.craftsmanProfile.count({ where });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("title")}
        </h1>
        <span className="text-sm text-gray-500">{total} {t("count")}</span>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-8 flex flex-wrap gap-3">
        <select
          name="category"
          defaultValue={category || ""}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {isRTL ? cat.nameAr : cat.name}
            </option>
          ))}
        </select>

        <select
          name="sortBy"
          defaultValue={sortBy}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <option value="rating">{t("highestRated")}</option>
          <option value="reviews">{t("mostReviews")}</option>
          <option value="newest">{t("newest")}</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {t("filter")}
        </button>
      </form>
    </>
  );
}

function CraftsmenSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-40" />
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <>
      <Skeleton variant="text" className="mb-6 h-8 w-48" />
      <div className="mb-8 flex flex-wrap gap-3">
        <Skeleton variant="card" className="h-10 w-32" />
        <Skeleton variant="card" className="h-10 w-32" />
        <Skeleton variant="card" className="h-10 w-24" />
      </div>
    </>
  );
}

export default async function CraftsmenPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  
  const params_awaited = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<FiltersSkeleton />}>
        <CraftsmenFilters searchParams={params_awaited} locale={locale} />
      </Suspense>

      <Suspense fallback={<CraftsmenSkeleton />}>
        <CraftsmenResults searchParams={params_awaited} locale={locale} />
      </Suspense>
    </div>
  );
}
