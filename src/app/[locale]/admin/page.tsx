import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui";
import { Users, Briefcase, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import AdminActions from "./AdminActions";

export async function generateMetadata() {
  return { title: "Admin Panel" };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const locale = await getLocale();

  const [totalUsers, totalJobs, totalBids, recentUsers, recentJobs] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.bid.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { postedJobs: true, bids: true } },
      },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        category: { select: { name: true, nameAr: true } },
        customer: { select: { name: true, nameAr: true } },
        _count: { select: { bids: true } },
      },
    }),
  ]);

  const customerCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const craftsmanCount = await prisma.user.count({ where: { role: "CRAFTSMAN" } });
  const openJobsCount = await prisma.job.count({ where: { status: "OPEN" } });

  const stats = [
    { label: locale === "ar" ? "إجمالي المستخدمين" : "Total Users", value: totalUsers, icon: Users, color: "bg-blue-50 text-blue-700" },
    { label: locale === "ar" ? "إجمالي الطلبات" : "Total Jobs", value: totalJobs, icon: Briefcase, color: "bg-green-50 text-green-700" },
    { label: locale === "ar" ? "إجمالي العروض" : "Total Bids", value: totalBids, icon: ShieldCheck, color: "bg-purple-50 text-purple-700" },
    { label: locale === "ar" ? "طلبات مفتوحة" : "Open Jobs", value: openJobsCount, icon: Briefcase, color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        {locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {locale === "ar" ? "إدارة المستخدمين والطلبات" : "Manage users and jobs"}
      </p>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-xl p-5 ${stat.color}`}>
              <Icon className="mb-2 h-6 w-6 opacity-70" aria-hidden="true" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex gap-4 text-sm text-gray-600">
        <span>{locale === "ar" ? "عملاء" : "Customers"}: <strong>{customerCount}</strong></span>
        <span>{locale === "ar" ? "حرفيون" : "Craftsmen"}: <strong>{craftsmanCount}</strong></span>
      </div>

      {/* Users Table */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {locale === "ar" ? "آخر المستخدمين" : "Recent Users"}
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الاسم" : "Name"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الدور" : "Role"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الطلبات/العروض" : "Jobs/Bids"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "إجراء" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/profile/${user.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {locale === "ar" ? (user.nameAr || user.name) : user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : user.role === "CRAFTSMAN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {user._count.postedJobs} / {user._count.bids}
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <ToggleRight className="h-4 w-4" />
                          {locale === "ar" ? "نشط" : "Active"}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500">
                          <ToggleLeft className="h-4 w-4" />
                          {locale === "ar" ? "موقوف" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AdminActions
                        userId={user.id}
                        isActive={user.isActive}
                        role={user.role}
                        currentAdminId={session.user.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Jobs Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {locale === "ar" ? "آخر الطلبات" : "Recent Jobs"}
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "العنوان" : "Title"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "العميل" : "Customer"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الفئة" : "Category"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "العروض" : "Bids"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    {locale === "ar" ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {locale === "ar" ? (job.titleAr || job.title) : job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {locale === "ar"
                        ? (job.customer.nameAr || job.customer.name)
                        : job.customer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.category
                        ? (locale === "ar" ? job.category.nameAr : job.category.name)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{job._count.bids}</td>
                    <td className="px-4 py-3">
                      <Badge variant={job.status as "OPEN"}>
                        {job.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
