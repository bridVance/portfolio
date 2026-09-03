import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = process.env.ANALYZE === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
};

export default withBundleAnalyzer({ enabled: analyze })(nextConfig);
