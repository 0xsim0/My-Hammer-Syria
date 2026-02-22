"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const METHOD_ICONS: Record<string, React.ReactNode> = {
  STRIPE: <CreditCard className="h-5 w-5" aria-hidden="true" />,
  CASH: <Banknote className="h-5 w-5" aria-hidden="true" />,
  BANK_TRANSFER: <Building2 className="h-5 w-5" aria-hidden="true" />,
  SYRIATEL_CASH: <Smartphone className="h-5 w-5" aria-hidden="true" />,
};

/** Inner form — must be inside <Elements> to use useStripe/useElements */
function StripeCardForm({
  jobId,
  amount,
  onSuccess,
}: {
  jobId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const t = useTranslations("payment");
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStripePayment() {
    if (!stripe || !elements) return;
    setError("");
    setLoading(true);

    try {
      // 1. Create payment intent on the server (always USD)
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, amount, currency: "usd" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("failed"));
        return;
      }

      const { clientSecret } = await res.json();

      // 2. Confirm card payment via Stripe.js
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) {
        setError(stripeError.message || t("failed"));
        return;
      }

      onSuccess();
    } catch {
      setError(t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-gray-700">{t("cardDetails")}</p>
      <p className="text-xs text-gray-500">{t("payableInUsd")}</p>
      <div className="rounded-lg border border-gray-300 px-3 py-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#111827",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button onClick={handleStripePayment} isLoading={loading} className="w-full" size="lg">
        {t("pay")}
      </Button>
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("payment");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;
  const currency = searchParams.get("currency") || "SYP";
  const jobId = searchParams.get("jobId") || "";

  const [method, setMethod] = useState<string>("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleNonStripePayment() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, amount, currency: "usd" }),
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
        <div className="text-5xl" aria-hidden="true">✅</div>
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
          <span className="text-sm font-medium text-gray-600">{t("amount")}</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(amount, currency)}
          </span>
        </CardContent>
      </Card>

      {/* Payment method tabs */}
      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-medium text-gray-700">{t("method")}</legend>
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
        <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Method-specific content */}
      <Card className="mb-6">
        <CardContent className="p-5">
          {method === "STRIPE" && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                jobId={jobId}
                amount={amount}
                onSuccess={() => setSuccess(true)}
              />
            </Elements>
          )}

          {method === "CASH" && (
            <div className="text-center">
              <Banknote className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-600">
                {t("cashDescription")}
              </p>
            </div>
          )}

          {method === "BANK_TRANSFER" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-900">{t("bankDetailsTitle")}</p>
                <p className="mt-1 text-gray-600">{t("bankName")}</p>
                <p className="text-gray-600">{t("bankAccount")}</p>
                <p className="text-gray-600">{t("bankIban")}</p>
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
                {t("syriatelTransfer")} <strong>0944 XXX XXX</strong>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t("syriatelNote")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {method !== "STRIPE" && (
        <Button
          onClick={handleNonStripePayment}
          isLoading={loading}
          className="w-full"
          size="lg"
        >
          {t("pay")}
        </Button>
      )}
    </div>
  );
}
