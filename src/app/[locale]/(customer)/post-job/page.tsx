import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import PostJobForm from "./PostJobForm";

export async function generateMetadata() {
  const t = await getTranslations("jobs.post");
  return { title: t("title") };
}

export default async function PostJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/find-jobs");

  const t = await getTranslations("jobs.post");
  const tNav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-sm text-gray-500">
          <li>
            <Link
              href="/"
              className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
            >
              {tNav("home")}
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </li>
          <li aria-current="page" className="font-medium text-gray-900">
            {t("title")}
          </li>
        </ol>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <PostJobForm />
    </div>
  );
}
