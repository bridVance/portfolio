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
  "frame-ancestors 'none'",
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
  // ones and most scanners actually look for.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withBundleAnalyzer({ enabled: analyze })(nextConfig);
