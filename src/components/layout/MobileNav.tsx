"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { Home, Briefcase, Plus, MessageSquare, User } from "lucide-react";

export default function MobileNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;

  type NavItem = {
    href: string;
    label: string;
    icon: typeof Home;
    isCenter?: boolean;
  };

  const items: NavItem[] = [
    { href: "/", label: t("home"), icon: Home },
    {
      href: role === "CUSTOMER" ? "/my-jobs" : "/find-jobs",
      label: role === "CUSTOMER" ? t("myJobs") : t("findJobs"),
      icon: Briefcase,
    },
    { href: "/post-job", label: t("postJob"), icon: Plus, isCenter: true },
    { href: "/messages", label: t("messages"), icon: MessageSquare },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-gray-100 bg-white/98 pb-safe shadow-[0_-1px_12px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
      <nav
        aria-label="Mobile navigation"
        className="flex items-end justify-around px-2 py-1.5"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex -mt-5 flex-col items-center gap-1"
                aria-label={item.label}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/40 active:scale-95">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-semibold text-primary-600">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors duration-150 ${
                active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 ${
                  active
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-primary-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
