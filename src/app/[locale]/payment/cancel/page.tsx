import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { XCircle } from "lucide-react";

export async function generateMetadata() {
  return { title: "Payment Cancelled" };
}

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: { job_id?: string };
}) {
  const t = await getTranslations("payment");
  const jobId = searchParams.job_id;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <XCircle className="h-20 w-20 text-red-400" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="mt-2 text-gray-600">
          Your payment was cancelled. No charges were made.
        </p>
      </div>
      <div className="flex gap-3">
        {jobId && (
          <Button asChild>
            <Link href={`/payment/checkout?jobId=${jobId}`}>Try Again</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/my-jobs">My Jobs</Link>
        </Button>
      </div>
    </div>
  );
}
