"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Button, Input, Card, CardHeader, CardContent } from "@/components/ui";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("errors.invalidCredentials"));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t("errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
          >
            My Hammer Syria
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            {t("login")}
          </h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Input
              label={t("email")}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label={t("password")}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              {t("login")}
            </Button>

            <p className="text-center text-sm text-gray-600">
              {t("dontHaveAccount")}{" "}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
              >
                {t("registerHere")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
