import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: t("terms") };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {isAr ? "آخر تحديث: يناير 2025" : "Last updated: January 2025"}
      </p>

      <div className="space-y-8 text-gray-700">
        {isAr ? (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                1. قبول الشروط
              </h2>
              <p className="leading-relaxed">
                باستخدام منصة My Hammer Syria، فإنك توافق على الالتزام بهذه
                الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم
                استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                2. الخدمات المقدمة
              </h2>
              <p className="leading-relaxed">
                تعمل المنصة كوسيط بين العملاء والحرفيين. نحن لسنا طرفاً في أي
                اتفاقية بين العميل والحرفي، ولا نضمن جودة الخدمات المقدمة.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                3. مسؤوليات المستخدم
              </h2>
              <ul className="list-disc space-y-2 ps-6">
                <li>تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                <li>الحفاظ على سرية بيانات الدخول</li>
                <li>عدم استخدام المنصة لأغراض غير مشروعة</li>
                <li>احترام حقوق المستخدمين الآخرين</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                4. المدفوعات والأسعار
              </h2>
              <p className="leading-relaxed">
                الأسعار المعروضة قابلة للتفاوض بين العميل والحرفي. المنصة غير
                مسؤولة عن أي نزاعات مالية تنشأ بين الطرفين. يجب إتمام الدفع
                وفق الطريقة المتفق عليها.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                5. التقييمات والمراجعات
              </h2>
              <p className="leading-relaxed">
                التقييمات يجب أن تكون صادقة وتعكس تجربة حقيقية. يحق للمنصة
                إزالة أي تقييم مضلل أو غير لائق.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                6. إنهاء الخدمة
              </h2>
              <p className="leading-relaxed">
                يحق للمنصة إنهاء أو تعليق حساب أي مستخدم يخالف هذه الشروط دون
                إشعار مسبق.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                7. التواصل
              </h2>
              <p>
                لأي استفسارات حول هذه الشروط، تواصل معنا عبر{" "}
                <Link
                  href="/contact"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  صفحة التواصل
                </Link>
                .
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By using My Hammer Syria, you agree to be bound by these Terms
                and Conditions. If you do not agree to any part of them, please
                do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                2. Services Provided
              </h2>
              <p className="leading-relaxed">
                The platform acts as an intermediary between customers and
                craftsmen. We are not a party to any agreement between a
                customer and a craftsman, and we do not guarantee the quality of
                services provided.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                3. User Responsibilities
              </h2>
              <ul className="list-disc space-y-2 ps-6">
                <li>Provide accurate and truthful information when registering</li>
                <li>Keep login credentials confidential</li>
                <li>Not use the platform for illegal purposes</li>
                <li>Respect the rights of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                4. Payments and Pricing
              </h2>
              <p className="leading-relaxed">
                Prices displayed are negotiable between the customer and the
                craftsman. The platform is not responsible for any financial
                disputes arising between the parties. Payment must be completed
                via the agreed method.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                5. Ratings and Reviews
              </h2>
              <p className="leading-relaxed">
                Reviews must be honest and reflect a genuine experience. The
                platform reserves the right to remove any misleading or
                inappropriate review.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                6. Termination
              </h2>
              <p className="leading-relaxed">
                The platform may terminate or suspend any user account that
                violates these terms without prior notice.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                7. Contact
              </h2>
              <p>
                For any inquiries about these terms, contact us via the{" "}
                <Link
                  href="/contact"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  Contact page
                </Link>
                .
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
