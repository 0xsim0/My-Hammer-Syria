import { Inter, Lalezar } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://myhammersyria.com";
  return {
    title: {
      default: "My Hammer Syria | مطرقتي سوريا",
      template: "%s | My Hammer Syria",
    },
    description:
      locale === "ar"
        ? "منصة الحرفيين في سوريا — ابحث عن حرفيين موثوقين أو انشر وظيفتك اليوم"
        : "Find skilled craftsmen in Syria or post a job — My Hammer Syria connects customers with trusted professionals.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SY" : "en_US",
      url: baseUrl,
      siteName: "My Hammer Syria",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "My Hammer Syria" }],
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      languages: { ar: `${baseUrl}/ar`, en: `${baseUrl}/en` },
    },
  };
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lalezar = Lalezar({ subsets: ["arabic", "latin"], weight: "400", variable: "--font-lalezar" });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${inter.variable} ${lalezar.variable}`}
    >
      <body className={isRTL ? "font-arabic" : "font-sans"}>
        <SessionProvider>
          <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
            >
              {isRTL ? "انتقل للمحتوى الرئيسي" : "Skip to main content"}
            </a>
            <Navbar />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
            <MobileNav />
            <Toaster position={isRTL ? "bottom-left" : "bottom-right"} />
          </NextIntlClientProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
