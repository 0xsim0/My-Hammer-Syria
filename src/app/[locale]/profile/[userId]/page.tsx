import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  StarRatingDisplay,
  Skeleton,
  Button,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string; nameAr?: string | null; image?: string | null };
}

interface UserProfile {
  id: string;
  name: string;
  nameAr?: string | null;
  image?: string | null;
  role: string;
  governorate?: string | null;
  avgRating?: number | null;
  totalReviews?: number | null;
  isVerified?: boolean;
  createdAt: string;
  craftsmanProfile?: {
    businessName?: string | null;
    businessNameAr?: string | null;
    bio?: string | null;
    bioAr?: string | null;
    yearsExperience?: number | null;
    isAvailable?: boolean;
    categories?: Array<{ id: string; name: string; nameAr: string }>;
    portfolioItems?: Array<{ id: string; imageUrl: string }>;
  } | null;
  reviewsReceived?: Review[];
}

async function ProfileContent({ userId }: { userId: string }) {
  const t = await getTranslations("profile");
  const locale = await getLocale();

  let user: UserProfile | null = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const userRes = await fetch(`${baseUrl}/api/users/${userId}`, {
      next: { revalidate: 60 },
    });
    if (userRes.ok) user = await userRes.json();
  } catch {
    // handle
  }

  const reviews: Review[] = user?.reviewsReceived ?? [];

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">
          {locale === "ar" ? "المستخدم غير موجود" : "User not found"}
        </p>
        <Button asChild variant="outline">
          <Link href="/">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        </Button>
      </div>
    );
  }

  const isCraftsman = user.role === "CRAFTSMAN";
  const profile = user.craftsmanProfile;
  const displayName = locale === "ar" && user.nameAr ? user.nameAr : user.name;
  const businessName = locale === "ar" && profile?.businessNameAr
    ? profile.businessNameAr
    : profile?.businessName;
  const bio = locale === "ar" && profile?.bioAr ? profile.bioAr : profile?.bio;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar name={displayName} src={user.image} size="xl" />
            <div className="flex-1 text-center sm:text-start">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {businessName && (
                <p className="text-sm text-gray-600">{businessName}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 sm:justify-start">
                {user.governorate && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {user.governorate}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {t("joinedAt")} {formatDate(user.createdAt, locale)}
                </span>
              </div>

              {isCraftsman && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {user.avgRating != null && user.avgRating > 0 && (
                    <div className="inline-flex items-center gap-1">
                      <StarRatingDisplay rating={user.avgRating} />
                      <span className="text-sm text-gray-600">
                        ({user.totalReviews ?? 0})
                      </span>
                    </div>
                  )}
                  {profile?.yearsExperience != null && (
                    <span className="text-sm text-gray-600">
                      {profile.yearsExperience} {t("yearsExperience")}
                    </span>
                  )}
                  <Badge variant={profile?.isAvailable ? "ACCEPTED" : "default"}>
                    {profile?.isAvailable ? t("isAvailable") : t("notAvailable")}
                  </Badge>
                </div>
              )}

              {bio && (
                <p className="mt-3 text-sm text-gray-700">{bio}</p>
              )}
            </div>
          </div>

          {/* Categories */}
          {isCraftsman && profile?.categories && profile.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.categories.map((cat) => (
                <Badge key={cat.id}>
                  {locale === "ar" ? cat.nameAr : cat.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio */}
      {isCraftsman && profile?.portfolioItems && profile.portfolioItems.length > 0 && (
        <section aria-labelledby="portfolio-heading" className="mb-6">
          <h2 id="portfolio-heading" className="mb-4 text-lg font-semibold text-gray-900">
            {t("portfolio")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {profile.portfolioItems.map((item, i) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                <img
                  src={item.imageUrl}
                  alt={`${displayName} - ${t("portfolio")} ${i + 1}`}
                  className="h-full w-full object-cover"
                  width={300}
                  height={300}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="mb-4 text-lg font-semibold text-gray-900">
          {t("reviews")} ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("noReviews")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => {
            const reviewerName =
              locale === "ar" && review.reviewer.nameAr
                ? review.reviewer.nameAr
                : review.reviewer.name;
            return (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={reviewerName}
                      src={review.reviewer.image}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {reviewerName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt, locale)}
                        </span>
                      </div>
                      <StarRatingDisplay rating={review.rating} />
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-700">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton variant="card" className="mb-6 h-40" />
      <Skeleton variant="text" className="mb-4 h-8 w-32" />
      <div className="flex flex-col gap-4">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const t = await getTranslations("profile");
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/users/${userId}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const user = await res.json();
      return { title: `${user.name} - ${t("title")}` };
    }
  } catch {
    // fallback
  }
  return { title: t("title") };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent userId={userId} />
    </Suspense>
  );
}
