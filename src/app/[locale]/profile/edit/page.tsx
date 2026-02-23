"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string;
  nameAr?: string | null;
  phone?: string | null;
  image?: string | null;
  governorate?: string | null;
  role: string;
  craftsmanProfile?: {
    businessName?: string | null;
    businessNameAr?: string | null;
    bio?: string | null;
    bioAr?: string | null;
    yearsExperience?: number | null;
    isAvailable?: boolean;
    categories?: { id: string }[];
  } | null;
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
}

interface PortfolioItem {
  id: string;
  imageUrl: string;
  title?: string | null;
}

export default function EditProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tEdit = useTranslations("profileEdit");
  const locale = useLocale();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [image, setImage] = useState("");

  // Craftsman-specific
  const [businessName, setBusinessName] = useState("");
  const [businessNameAr, setBusinessNameAr] = useState("");
  const [bio, setBio] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const isRTL = locale === "ar";
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch {
      // handle silently
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPortfolio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        toast.error(tEdit("uploadFailed"));
        return;
      }
      const { url } = await uploadRes.json();
      const portfolioRes = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (portfolioRes.ok) {
        const newItem = await portfolioRes.json();
        setPortfolioItems((prev) => [...prev, newItem]);
        toast.success(tEdit("imageAdded"));
      }
    } catch {
      toast.error(tEdit("uploadFailed"));
    } finally {
      setUploadingPortfolio(false);
      e.target.value = "";
    }
  }

  async function handlePortfolioDelete(id: string) {
    try {
      await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // handle silently
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data: UserData = await res.json();
        setUser(data);
        setName(data.name || "");
        setNameAr(data.nameAr || "");
        setPhone(data.phone || "");
        setGovernorate(data.governorate || "");
        setImage(data.image || "");
        if (data.craftsmanProfile) {
          setBusinessName(data.craftsmanProfile.businessName || "");
          setBusinessNameAr(data.craftsmanProfile.businessNameAr || "");
          setBio(data.craftsmanProfile.bio || "");
          setBioAr(data.craftsmanProfile.bioAr || "");
          setYearsExperience(
            data.craftsmanProfile.yearsExperience?.toString() || ""
          );
          setIsAvailable(data.craftsmanProfile.isAvailable ?? true);
          setSelectedCategoryIds(
            (data.craftsmanProfile.categories || []).map((c) => c.id)
          );
          // Load portfolio
          fetch("/api/portfolio")
            .then((r) => r.json())
            .then((d) => setPortfolioItems(d.portfolioItems || []))
            .catch(() => {});
        }
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        name: name.trim() || undefined,
        nameAr: nameAr.trim() || undefined,
        phone: phone.trim() || undefined,
        governorate: governorate || undefined,
        image: image.trim() || undefined,
      };

      if (user?.role === "CRAFTSMAN") {
        body.craftsmanProfile = {
          businessName: businessName.trim() || undefined,
          businessNameAr: businessNameAr.trim() || undefined,
          bio: bio.trim() || undefined,
          bioAr: bioAr.trim() || undefined,
          yearsExperience: yearsExperience
            ? parseInt(yearsExperience, 10)
            : undefined,
          isAvailable,
          categoryIds: selectedCategoryIds,
        };
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(tEdit("profileSaved"));
        router.push(`/profile/${user?.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("edit")}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {tEdit("basicInfo")}
            </h2>

            <Input
              label={tEdit("nameEnglish")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ahmad Al-Hassan"
            />

            <Input
              label={tEdit("nameArabic")}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="أحمد الحسن"
              dir="rtl"
            />

            <Input
              label={tEdit("phoneNumber")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+963-XX-XXXXXXX"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {tEdit("governorate")}
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="">
                  {tEdit("selectGovernorate")}
                </option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={tEdit("profileImageUrl")}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              type="url"
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        {/* Craftsman profile */}
        {user.role === "CRAFTSMAN" && (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {tEdit("professionalProfile")}
              </h2>

              <Input
                label={tEdit("businessNameEnglish")}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <Input
                label={tEdit("businessNameArabic")}
                value={businessNameAr}
                onChange={(e) => setBusinessNameAr(e.target.value)}
                dir="rtl"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {tEdit("bioEnglish")}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {tEdit("bioArabic")}
                </label>
                <textarea
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  rows={3}
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                />
              </div>

              <Input
                label={tEdit("yearsOfExperience")}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                type="number"
                min={0}
                max={50}
              />

              <div className="flex items-center gap-3">
                <input
                  id="isAvailable"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("isAvailable")}
                </label>
              </div>

              {categories.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    {tEdit("specializations")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          {isRTL ? cat.nameAr : cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        {user.role === "CRAFTSMAN" && (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {tEdit("portfolio")}
              </h2>
              {portfolioItems.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <NextImage
                        src={item.imageUrl}
                        alt={item.title || "Portfolio item"}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handlePortfolioDelete(item.id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePortfolioUpload}
                  disabled={uploadingPortfolio}
                />
                {uploadingPortfolio
                  ? tEdit("uploading")
                  : tEdit("addImage")}
              </label>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" isLoading={saving}>
            {tCommon("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
