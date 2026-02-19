import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: t("about") };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        {isAr ? "عن المنصة" : "About My Hammer Syria"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        {isAr ? (
          <>
            <p className="text-lg leading-relaxed">
              <strong>My Hammer Syria</strong> هي المنصة الرائدة في سوريا لربط
              العملاء بالحرفيين والمقاولين الموثوقين في جميع المحافظات السورية.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">مهمتنا</h2>
            <p>
              نسعى إلى تسهيل الوصول إلى الخدمات الحرفية عالية الجودة، وتمكين
              الحرفيين من عرض مهاراتهم والحصول على فرص عمل حقيقية، مع ضمان
              تجربة آمنة وموثوقة لكلا الطرفين.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">
              لماذا My Hammer Syria؟
            </h2>
            <ul className="list-disc space-y-2 ps-6">
              <li>أكثر من 500 حرفي موثوق في جميع المحافظات</li>
              <li>نظام تقييمات شفاف يساعدك على اختيار الأفضل</li>
              <li>التواصل المباشر بين العميل والحرفي</li>
              <li>دفع آمن بعدة طرق تناسب السوق السوري</li>
              <li>خدمة عملاء متاحة على مدار الساعة</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">
              خدماتنا
            </h2>
            <p>
              نغطي مجموعة واسعة من الخدمات الحرفية تشمل: السباكة، الكهرباء،
              النجارة، الدهان، البلاط، التكييف والتدفئة، التنظيف، نقل الأثاث،
              الحدائق، وغيرها الكثير.
            </p>

            <div className="mt-10 rounded-xl bg-primary-50 p-6">
              <p className="font-medium text-primary-900">
                هل أنت حرفي ماهر؟{" "}
                <Link
                  href="/register"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  انضم إلينا اليوم
                </Link>{" "}
                وابدأ في استقبال الطلبات.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg leading-relaxed">
              <strong>My Hammer Syria</strong> is Syria&apos;s leading platform
              connecting customers with trusted craftsmen and contractors across
              all Syrian governorates.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">
              Our Mission
            </h2>
            <p>
              We aim to simplify access to high-quality craft services, empower
              craftsmen to showcase their skills and find real job opportunities,
              while ensuring a safe and reliable experience for both parties.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">
              Why My Hammer Syria?
            </h2>
            <ul className="list-disc space-y-2 ps-6">
              <li>500+ trusted craftsmen across all governorates</li>
              <li>Transparent rating system to help you choose the best</li>
              <li>Direct communication between customer and craftsman</li>
              <li>Secure payment with multiple methods suited for Syria</li>
              <li>Customer support available around the clock</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-gray-900">
              Our Services
            </h2>
            <p>
              We cover a wide range of craft services including: plumbing,
              electrical, carpentry, painting, tiling, AC &amp; heating,
              cleaning, moving, gardening, and much more.
            </p>

            <div className="mt-10 rounded-xl bg-primary-50 p-6">
              <p className="font-medium text-primary-900">
                Are you a skilled craftsman?{" "}
                <Link
                  href="/register"
                  className="text-primary-600 underline hover:text-primary-700"
                >
                  Join us today
                </Link>{" "}
                and start receiving jobs.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
