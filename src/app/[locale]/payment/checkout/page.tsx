"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
} from "@/components/ui";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
} from "lucide-react";

const METHOD_ICONS: Record<string, React.ReactNode> = {
  STRIPE: <CreditCard className="h-5 w-5" aria-hidden="true" />,
  CASH: <Banknote className="h-5 w-5" aria-hidden="true" />,
  BANK_TRANSFER: <Building2 className="h-5 w-5" aria-hidden="true" />,
  SYRIATEL_CASH: <Smartphone className="h-5 w-5" aria-hidden="true" />,
};

export default function CheckoutPage() {
  const t = useTranslations("payment");
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;
  const currency = searchParams.get("currency") || "SYP";
  const jobId = searchParams.get("jobId") || "";

  const [method, setMethod] = useState<string>("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handlePayment() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          amount,
          currency,
          method,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("failed"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("failed"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl" aria-hidden="true">
          ✅
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("success")}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      {/* Amount display */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-5">
          <span className="text-sm font-medium text-gray-600">
            {t("amount")}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(amount, currency)}
          </span>
        </CardContent>
      </Card>

      {/* Payment method tabs */}
      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-medium text-gray-700">
          {t("method")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
                method === m
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
              aria-pressed={method === m}
            >
              {METHOD_ICONS[m]}
              <span className="text-xs font-medium text-center">
                {t(`methods.${m}`)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Method-specific content */}
      <Card className="mb-6">
        <CardContent className="p-5">
          {method === "STRIPE" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-gray-700">
                {t("cardDetails")}
              </p>
              <Input placeholder="1234 5678 9012 3456" label="Card number" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="MM/YY" label="Expiry" />
                <Input placeholder="123" label="CVC" />
              </div>
            </div>
          )}

          {method === "CASH" && (
            <div className="text-center">
              <Banknote className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-600">
                Pay the craftsman in cash upon completion of the work. Both
                parties will confirm the transaction in the app.
              </p>
            </div>
          )}

          {method === "BANK_TRANSFER" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-900">Bank Details:</p>
                <p className="mt-1 text-gray-600">Bank: Commercial Bank of Syria</p>
                <p className="text-gray-600">Account: XXXX-XXXX-XXXX</p>
                <p className="text-gray-600">IBAN: SY00 0000 0000 0000</p>
              </div>
              <div>
                <label
                  htmlFor="receipt-upload"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t("uploadReceipt")}
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="block w-full text-sm text-gray-500 file:me-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                />
              </div>
            </div>
          )}

          {method === "SYRIATEL_CASH" && (
            <div className="text-center">
              <Smartphone className="mx-auto h-12 w-12 text-orange-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-600">
                Transfer to Syriatel Cash number: <strong>0944 XXX XXX</strong>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Include the job reference in the transfer note.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handlePayment}
        isLoading={loading}
        className="w-full"
        size="lg"
      >
        {t("pay")}
      </Button>
    </div>
  );
}
