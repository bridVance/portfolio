/**
 * `thin: true` marks a route that is still only a PageHeader. It stays in the
 * nav — it is a real destination and the label sets an expectation — but it is
 * kept out of the sitemap and marked noindex, so search engines are not invited
 * to index a page with a title and one sentence on it. Drop the flag as the
 * content lands.
 */
export const ROUTES = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work", thin: true },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products", thin: true },
  { href: "/lab", label: "Lab", thin: true },
  { href: "/contact", label: "Contact" },
] as const;

export const INDEXABLE_ROUTES: readonly string[] = ROUTES.filter(
  (r) => !("thin" in r)
).map((r) => r.href);
