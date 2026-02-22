"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, Input, Card, CardHeader, CardContent } from "@/components/ui";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errors.general"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("errors.general"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm">
            My Hammer Syria
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            {t("forgotPassword")}
          </h1>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-4xl" aria-hidden="true">📧</div>
              <p className="text-sm text-gray-700">
                If an account with that email exists, a password reset link has been sent.
              </p>
              <Link href="/login" className="text-sm font-medium text-primary-600 hover:underline">
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && (
                <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-600">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <Input
                label={t("email")}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button type="submit" isLoading={loading} className="w-full">
                Send Reset Link
              </Button>
              <p className="text-center text-sm text-gray-600">
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm">
                  {t("backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
