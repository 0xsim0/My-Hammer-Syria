"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Hammer,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { unreadCount } = useNotifications(session?.user?.id);
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
        { href: "/craftsmen", label: t("findCraftsmen") },
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
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 border-b border-gray-100/80 bg-white/96 shadow-[0_1px_8px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex flex-shrink-0 items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-200 transition-all duration-200 group-hover:scale-105 group-hover:shadow-primary-300">
            <Hammer className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            {logoText}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                isActive(link.href)
                  ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-1.5 md:flex">
          <LanguageSwitcher />

          {session && (
            <>
              {/* Notification bell */}
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={t("notifications")}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-semibold text-white shadow-sm">
                    {session.user.name?.[0]?.toUpperCase() || (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="max-w-[100px] truncate font-medium">
                    {session.user.name?.split(" ")[0] || t("profile")}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute end-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-100/80">
                      {/* Dropdown header */}
                      <div className="border-b border-gray-100 bg-gradient-to-br from-primary-50 to-white px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user.name || t("profile")}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {t("profile")}
                        </Link>
                        <Link
                          href="/profile/edit"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {t("settings")}
                        </Link>
                        {role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Shield className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            {t("admin")}
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          {t("logout")}
                        </button>
                      </div>
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
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden"
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
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`fixed top-0 z-40 h-full w-72 overflow-y-auto bg-white shadow-2xl md:hidden ${
              isRTL ? "right-0" : "left-0"
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-primary-800 bg-gradient-to-br from-[#064e2c] to-primary-700 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                  <Hammer className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-base font-bold text-white">
                  {logoText}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* User info (if logged in) */}
            {session && (
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white shadow-sm">
                    {session.user.name?.[0]?.toUpperCase() || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-0.5 p-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {isActive(link.href) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  )}
                  {link.label}
                </Link>
              ))}

              {session && (
                <>
                  <div className="my-2 border-t border-gray-100" />
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Bell className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {t("notifications")}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {t("profile")}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t("logout")}
                  </button>
                </>
              )}

              <div className="my-2 border-t border-gray-100" />
              <div className="px-1">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
