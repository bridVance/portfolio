import type { Metadata } from "next";

const EXAMPLE_URL = "https://bridvance.example";
const SITE_URL = process.env.SITE_URL ?? EXAMPLE_URL;

// Fail a real production build loudly if the deploy target was never configured.
// Dev / test / Vitest are untouched (NODE_ENV !== "production"). CI sets SITE_URL
// explicitly on its `build` and `e2e` steps, so it is unaffected. We only hard-
// fail on an *unset* SITE_URL: CI (and local parity runs) deliberately pass the
// `bridvance.example` placeholder while the studio domain is still TBD, so
// treating the example value itself as fatal would break those green paths.
if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  throw new Error(
    "seo.ts: SITE_URL is unset for a production build. Set SITE_URL (the deploy origin, " +
      `e.g. "${EXAMPLE_URL}") before running \`next build\`.`
  );
}

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

// Home needs an absolute <title> (the layout template would otherwise render
// "BridVance — BridVance") plus its own canonical / OG url for "/".
export function pageMetadataHome(opts: {
  absoluteTitle: string;
  description: string;
}): Metadata {
  const url = new URL("/", SITE_URL).toString();
  return {
    title: { absolute: opts.absoluteTitle },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: "BridVance", description: opts.description, url },
  };
}

export { SITE_URL };
