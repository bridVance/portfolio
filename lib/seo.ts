import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://bridvance.example";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(opts.path, SITE_URL).toString();
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: `${opts.title} — BridVance`, description: opts.description, url },
  };
}

export { SITE_URL };
