import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

export default async function NotFoundPage() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-gray-200" aria-hidden="true">
        404
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{t("404")}</h1>
      <p className="mt-2 text-gray-600">
        The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}
