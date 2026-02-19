"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isRTL =
    typeof document !== "undefined"
      ? document.documentElement.dir === "rtl"
      : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate sending (no backend endpoint for contact form yet)
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    toast.success(
      isRTL ? "تم إرسال رسالتك بنجاح!" : "Your message has been sent!"
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {isRTL ? "تواصل معنا" : "Contact Us"}
      </h1>
      <p className="mb-10 text-gray-600">
        {isRTL
          ? "نحن هنا للمساعدة. تواصل معنا وسنرد عليك في أقرب وقت."
          : "We are here to help. Reach out and we will get back to you soon."}
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact info */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Mail className="h-5 w-5 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? "البريد الإلكتروني" : "Email"}
                  </p>
                  <a
                    href="mailto:support@myhammersyria.com"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    support@myhammersyria.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Phone className="h-5 w-5 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? "الهاتف" : "Phone"}
                  </p>
                  <a
                    href="tel:+963112345678"
                    className="text-sm text-primary-600 hover:underline"
                    dir="ltr"
                  >
                    +963-11-234-5678
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? "العنوان" : "Address"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "دمشق، سوريا" : "Damascus, Syria"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-primary-50 p-5">
            <p className="text-sm font-medium text-primary-900">
              {isRTL
                ? "ساعات العمل: من الأحد إلى الخميس، 9 صباحاً - 5 مساءً"
                : "Working hours: Sunday to Thursday, 9 AM - 5 PM"}
            </p>
          </div>
        </div>

        {/* Contact form */}
        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="text-5xl" aria-hidden="true">
                  ✅
                </div>
                <p className="font-medium text-gray-900">
                  {isRTL ? "تم إرسال رسالتك!" : "Message sent!"}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL
                    ? "سنتواصل معك قريباً."
                    : "We will get back to you shortly."}
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  {isRTL ? "إرسال رسالة أخرى" : "Send another message"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isRTL ? "أرسل لنا رسالة" : "Send us a message"}
                </h2>

                <Input
                  label={isRTL ? "الاسم" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label={isRTL ? "البريد الإلكتروني" : "Email"}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {isRTL ? "الرسالة" : "Message"}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    placeholder={
                      isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."
                    }
                  />
                </div>

                <Button type="submit" isLoading={sending} className="w-full">
                  {isRTL ? "إرسال" : "Send"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
