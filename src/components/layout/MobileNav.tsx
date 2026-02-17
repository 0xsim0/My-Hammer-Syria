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
      href: role === "CUSTOMER" ? "/my-jobs" : "/jobs",
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
    <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-gray-200 bg-white pb-safe md:hidden">
      <nav aria-label="Mobile navigation" className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex -mt-4 flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-transform hover:scale-105">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="mt-0.5 text-[10px] font-medium text-primary-600">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 ${
                active ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
