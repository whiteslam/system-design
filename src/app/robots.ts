import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env.server";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/projects/",
          "/generate/",
          "/settings/",
          "/blueprints/",
          "/studio/",
          "/analysis/",
          "/scaling/",
          "/security/",
          "/costs/",
          "/devops/",
          "/simulations/",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
