"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  Select,
  SelectItem,
} from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { User, Wrench } from "lucide-react";

type Role = "CUSTOMER" | "CRAFTSMAN";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tGov = useTranslations("governorates");
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filledCount = [name, email, password, confirmPassword, governorate].filter(
    Boolean
  ).length;
  const totalFields = 5;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!role) return;

    if (password.length < 8) {
      setError(t("errors.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errors.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
          governorate,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("email")) {
          setError(t("errors.emailAlreadyExists"));
        } else {
          setError(data.error || t("../common.error"));
        }
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t("../common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
          >
            My Hammer Syria
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            {t("register")}
          </h1>
        </CardHeader>

        <CardContent>
          {/* Role selector */}
          <fieldset className="mb-6">
            <legend className="mb-3 text-sm font-medium text-gray-700">
              {t("role")}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["CUSTOMER", "CRAFTSMAN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 touch-manipulation ${
                    role === r
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                  aria-pressed={role === r}
                >
                  {r === "CUSTOMER" ? (
                    <User className="h-8 w-8" aria-hidden="true" />
                  ) : (
                    <Wrench className="h-8 w-8" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium">
                    {r === "CUSTOMER" ? t("customer") : t("craftsman")}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {role && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Progress bar */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-primary-500 transition-all"
                    style={{
                      width: `${(filledCount / totalFields) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {filledCount}/{totalFields}
                </span>
              </div>

              <Input
                label={t("name")}
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={
                  password.length > 0 && password.length < 8
                    ? t("errors.passwordTooShort")
                    : undefined
                }
                error={
                  password.length > 0 && password.length < 8
                    ? t("errors.passwordTooShort")
                    : undefined
                }
              />

              <Input
                label={t("confirmPassword")}
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  confirmPassword.length > 0 && password !== confirmPassword
                    ? t("errors.passwordsDoNotMatch")
                    : undefined
                }
              />

              <Input
                label={`${t("phone")} (${t("../common.optional")})`}
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Select
                label={t("governorate")}
                value={governorate}
                onValueChange={setGovernorate}
                placeholder={t("../common.selectOption")}
              >
                {GOVERNORATES.map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {tGov(gov)}
                  </SelectItem>
                ))}
              </Select>

              <Button type="submit" isLoading={loading} className="mt-2 w-full">
                {t("register")}
              </Button>

              <p className="text-center text-sm text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded-sm"
                >
                  {t("loginHere")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
