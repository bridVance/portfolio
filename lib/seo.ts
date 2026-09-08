import type { Metadata } from "next";
import { envOr } from "./env";

const EXAMPLE_URL = "https://bridvance.example";
// envOr, not `??`: a variable set to an empty string is not undefined, and the
// fallback would be skipped in favour of "" — which is what silently broke
// enquiry delivery. The production guard below still refuses a blank value
// outright; this only stops dev and test crashing on `new URL(path, "")`.
const SITE_URL = envOr("SITE_URL", EXAMPLE_URL);

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
  /** Set on a route that is still only a header — see ROUTES `thin`. */
  noindex?: boolean;
}): Metadata {
  const url = new URL(opts.path, SITE_URL).toString();
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: `${opts.title} — BridVance`, description: opts.description, url },
    // follow, not nofollow: the page is thin, its links are still worth walking.
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
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
