import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { INDEXABLE_ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return INDEXABLE_ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: now,
  }));
}
