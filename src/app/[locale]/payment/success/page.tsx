import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { CheckCircle } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("payment");
  return { title: t("success") };
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { job_id?: string };
}) {
  const t = await getTranslations("payment");
  const jobId = searchParams.job_id;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <CheckCircle className="h-20 w-20 text-green-500" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("success")}</h1>
        <p className="mt-2 text-gray-600">
          Your payment has been processed successfully.
        </p>
      </div>
      <div className="flex gap-3">
        {jobId && (
          <Button asChild>
            <Link href={`/my-jobs/${jobId}`}>View Job</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/my-jobs">My Jobs</Link>
        </Button>
      </div>
    </div>
  );
}
