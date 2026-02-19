"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  } | null;
}

export default function EditProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
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

  useEffect(() => {
    fetchUser();
  }, []);

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
        };
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(
          document.documentElement.lang === "ar"
            ? "تم حفظ الملف الشخصي بنجاح"
            : "Profile saved successfully"
        );
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

  const isRTL = document.documentElement.dir === "rtl";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("edit")}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRTL ? "المعلومات الأساسية" : "Basic Information"}
            </h2>

            <Input
              label={isRTL ? "الاسم (بالإنجليزية)" : "Name (English)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ahmad Al-Hassan"
            />

            <Input
              label={isRTL ? "الاسم (بالعربية)" : "Name (Arabic)"}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="أحمد الحسن"
              dir="rtl"
            />

            <Input
              label={isRTL ? "رقم الهاتف" : "Phone Number"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+963-XX-XXXXXXX"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {isRTL ? "المحافظة" : "Governorate"}
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="">
                  {isRTL ? "اختر المحافظة" : "Select Governorate"}
                </option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={isRTL ? "رابط الصورة الشخصية" : "Profile Image URL"}
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
                {isRTL ? "الملف المهني" : "Professional Profile"}
              </h2>

              <Input
                label={isRTL ? "اسم النشاط التجاري (إنجليزي)" : "Business Name (English)"}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <Input
                label={isRTL ? "اسم النشاط التجاري (عربي)" : "Business Name (Arabic)"}
                value={businessNameAr}
                onChange={(e) => setBusinessNameAr(e.target.value)}
                dir="rtl"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {isRTL ? "نبذة عنك (إنجليزي)" : "Bio (English)"}
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
                  {isRTL ? "نبذة عنك (عربي)" : "Bio (Arabic)"}
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
                label={isRTL ? "سنوات الخبرة" : "Years of Experience"}
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
