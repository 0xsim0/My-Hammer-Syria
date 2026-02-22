import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://myhammersyria.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/profile/edit", "/post-job", "/my-jobs", "/my-bids"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
