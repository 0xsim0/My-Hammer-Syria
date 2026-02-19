"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isRTL = locale === "ar";
  const logoText = isRTL ? "مطرقتي سوريا" : "My Hammer Syria";
  const role = session?.user?.role;

  type NavLink = { href: string; label: string };

  function getLinks(): NavLink[] {
    if (!session) {
      return [
        { href: "/", label: t("home") },
        { href: "/find-jobs", label: t("findJobs") },
        { href: "/login", label: t("login") },
        { href: "/register", label: t("register") },
      ];
    }

    const links: NavLink[] = [{ href: "/", label: t("home") }];

    if (role === "CUSTOMER") {
      links.push(
        { href: "/my-jobs", label: t("myJobs") },
        { href: "/post-job", label: t("postJob") },
        { href: "/messages", label: t("messages") }
      );
    } else if (role === "CRAFTSMAN") {
      links.push(
        { href: "/find-jobs", label: t("findJobs") },
        { href: "/my-bids", label: t("myBids") },
        { href: "/messages", label: t("messages") }
      );
    }

    if (role === "ADMIN") {
      links.push({ href: "/admin", label: t("admin") });
    }

    return links;
  }

  const links = getLinks();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 text-xl font-bold text-primary-600">
          {logoText}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />

          {session && (
            <>
              {/* Notification bell */}
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={t("notifications")}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    {session.user.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute end-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" aria-hidden="true" />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        Settings
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Shield className="h-4 w-4" aria-hidden="true" />
                          {t("admin")}
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {t("logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`fixed top-0 z-40 h-full w-72 overflow-y-auto bg-white shadow-xl md:hidden ${
              isRTL ? "right-0" : "left-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <span className="text-lg font-bold text-primary-600">
                {logoText}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {session && (
                <>
                  <hr className="my-2 border-gray-100" />
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("notifications")}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("profile")}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    {t("logout")}
                  </button>
                </>
              )}

              <hr className="my-2 border-gray-100" />
              <LanguageSwitcher />
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
