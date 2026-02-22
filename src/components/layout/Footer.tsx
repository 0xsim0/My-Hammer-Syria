"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Hammer, ExternalLink } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const logoText = isRTL ? "مطرقتي سوريا" : "My Hammer Syria";
  const tagline = isRTL
    ? "منصة ربط العملاء بالحرفيين في سوريا"
    : "Connecting customers with craftsmen in Syria";

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-sm">
                <Hammer className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                {logoText}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              {tagline}
            </p>
            {/* Decorative accent */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="h-1 w-6 rounded-full bg-primary-500" />
              <span className="h-1 w-3 rounded-full bg-primary-300" />
              <span className="h-1 w-1.5 rounded-full bg-primary-200" />
            </div>
          </div>

          {/* Links column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {isRTL ? "روابط" : "Links"}
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/about", label: t("about") },
                { href: "/contact", label: t("contact") },
                { href: "/terms", label: t("terms") },
                { href: "/privacy", label: t("privacy") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-primary-600"
                >
                  <span className="h-px w-0 bg-primary-500 transition-all duration-200 group-hover:w-3" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social + CTA column */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {isRTL ? "تابعنا" : "Follow us"}
            </h3>
            <div className="flex gap-2.5">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-150 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md"
              >
                <svg
                  className="h-4.5 w-4.5 h-[18px] w-[18px]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="#"
                aria-label="Twitter"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-150 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-150 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            {/* CTA */}
            <div className="mt-2 rounded-xl border border-primary-100 bg-primary-50 p-4">
              <p className="text-xs font-medium text-primary-800">
                {isRTL ? "هل أنت حرفي؟" : "Are you a craftsman?"}
              </p>
              <Link
                href="/register"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                {isRTL ? "انضم مجاناً" : "Join for free"}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400">{t("copyright")}</p>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <span className="h-2 w-2 rounded-full bg-white ring-1 ring-gray-300" />
            <span className="h-2 w-2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </footer>
  );
}
