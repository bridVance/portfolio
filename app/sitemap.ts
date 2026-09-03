import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", "/work", "/lab", "/automation", "/contact"].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: now,
  }));
}
