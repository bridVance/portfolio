import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = process.env.ANALYZE === "true";
const dev = process.env.NODE_ENV !== "production";

/**
 * "Non-negotiables" on the home page links a visitor to a securityheaders.com
 * scan of this origin, so these have to be real: the section's whole claim is
 * positioning a client can check for themselves.
 *
 * script-src keeps 'unsafe-inline'. Next's hydration bootstrap and the
 * pre-hydration theme script are both inline, and the alternative — per-request
 * nonces — needs middleware and forces every page out of static rendering,
 * which costs more than it buys on a site that ships no third-party script.
 * The directive still does the job it is here for: it pins every *external*
 * script to this origin. Dev additionally needs 'unsafe-eval' for HMR.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  // 'self', not 'none': /work embeds the /demo case studies in iframes, and
  // 'none' refuses framing from every origin including this one.
  "frame-ancestors 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self'" + (dev ? " ws: http://localhost:*" : ""),
  "manifest-src 'self'",
  // Deliberately no `upgrade-insecure-requests`. WebKit applies it to
  // http://localhost as well (Chromium exempts loopback), so the stylesheet is
  // upgraded to a port nothing is listening on and the page loads unstyled —
  // it turned webkit and mobile-safari red against `next start`. It buys
  // nothing here either: Vercel serves https only, HSTS is preloaded, and this
  // CSP already pins every subresource to 'self', so there is no mixed content
  // for it to upgrade.
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Redundant with frame-ancestors for modern browsers, and the thing older
  // ones and most scanners actually look for. SAMEORIGIN rather than DENY for
  // the same reason: DENY blocks the /work embeds too.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A verification build can write somewhere other than .next, so running one
  // no longer replaces the dev server's own build underneath it and leaves the
  // page serving unstyled 404s. `next start` and scripts/assert-bundle.mjs read
  // the same variable.
  //
  // Note: `next build` rewrites next-env.d.ts and tsconfig.json to point at
  // whatever distDir resolved to, so a BUILD_DIR run dirties both. They are
  // committed pointing at .next; restore them after a verification build:
  //   git checkout -- next-env.d.ts tsconfig.json
  distDir: process.env.BUILD_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withBundleAnalyzer({ enabled: analyze })(nextConfig);
