import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://myhammersyria.com";

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/en`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/ar`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/en/find-jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/ar/find-jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/en/craftsmen`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/ar/craftsmen`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/en/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/ar/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/en/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/ar/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.flatMap((job) => [
    {
      url: `${baseUrl}/en/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);

  return [...staticRoutes, ...jobRoutes];
}
