import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: t("privacy") };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {isAr ? "آخر تحديث: يناير 2025" : "Last updated: January 2025"}
      </p>

      <div className="space-y-8 text-gray-700">
        {isAr ? (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                1. المعلومات التي نجمعها
              </h2>
              <p className="leading-relaxed">
                عند التسجيل في المنصة، نجمع المعلومات التالية:
              </p>
              <ul className="mt-2 list-disc space-y-1 ps-6">
                <li>الاسم والبريد الإلكتروني ورقم الهاتف</li>
                <li>المحافظة والموقع الجغرافي التقريبي</li>
                <li>بيانات الاستخدام والتفاعل مع المنصة</li>
                <li>معلومات الجهاز والمتصفح</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                2. كيف نستخدم معلوماتك
              </h2>
              <ul className="list-disc space-y-2 ps-6">
                <li>لتوفير وتحسين خدمات المنصة</li>
                <li>للتواصل معك بشأن حسابك وطلباتك</li>
                <li>لعرض نتائج بحث مناسبة بناءً على موقعك</li>
                <li>لمنع الاحتيال وضمان أمان المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                3. مشاركة المعلومات
              </h2>
              <p className="leading-relaxed">
                لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك بيانات محدودة
                مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة (مثل خدمات
                الدفع ومزودي السحابة)، وذلك بشكل مشروع وبما يتوافق مع الغرض
                من الجمع.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                4. أمان البيانات
              </h2>
              <p className="leading-relaxed">
                نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير
                المصرح به. تُشفَّر كلمات المرور وبيانات الدفع الحساسة.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                5. ملفات تعريف الارتباط (Cookies)
              </h2>
              <p className="leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك.
                يمكنك تعطيلها من إعدادات متصفحك، لكن ذلك قد يؤثر على بعض
                وظائف المنصة.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                6. حقوقك
              </h2>
              <p className="leading-relaxed">يحق لك:</p>
              <ul className="mt-2 list-disc space-y-1 ps-6">
                <li>الوصول إلى معلوماتك الشخصية وتعديلها</li>
                <li>طلب حذف حسابك وبياناتك</li>
                <li>الاعتراض على معالجة بياناتك في حالات معينة</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                7. التواصل
              </h2>
              <p>
                لأي استفسارات حول هذه السياسة،{" "}
                <Link
                  href="/contact"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  تواصل معنا
                </Link>
                .
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                1. Information We Collect
              </h2>
              <p className="leading-relaxed">
                When you register on the platform, we collect the following
                information:
              </p>
              <ul className="mt-2 list-disc space-y-1 ps-6">
                <li>Name, email address, and phone number</li>
                <li>Governorate and approximate geographic location</li>
                <li>Usage data and interaction with the platform</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc space-y-2 ps-6">
                <li>To provide and improve platform services</li>
                <li>To communicate with you about your account and requests</li>
                <li>To show relevant search results based on your location</li>
                <li>To prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                3. Information Sharing
              </h2>
              <p className="leading-relaxed">
                We do not sell your personal information to third parties. We
                may share limited data with service providers who help us operate
                the platform (such as payment services and cloud providers), in a
                lawful manner consistent with the purpose of collection.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                4. Data Security
              </h2>
              <p className="leading-relaxed">
                We take appropriate security measures to protect your information
                from unauthorized access. Passwords and sensitive payment data
                are encrypted.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                5. Cookies
              </h2>
              <p className="leading-relaxed">
                We use cookies to improve your experience and remember your
                preferences. You can disable them in your browser settings, but
                this may affect some platform functionality.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                6. Your Rights
              </h2>
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="mt-2 list-disc space-y-1 ps-6">
                <li>Access and edit your personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Object to processing of your data in certain cases</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                7. Contact
              </h2>
              <p>
                For any inquiries about this policy,{" "}
                <Link
                  href="/contact"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  contact us
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
