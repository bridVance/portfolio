type Props = {
  className?: string;
  /** Paint with `--brand-grad` instead of `currentColor` (nav wordmark only). */
  gradient?: boolean;
};

/**
 * The BridVance V/checkmark motif (§8.3): section-divider mark, "how we build"
 * step markers, and the nav wordmark glyph. `currentColor` by default; the
 * `gradient` variant paints `--brand-grad`. Placeholder geometry until the real
 * brand SVG lands — TODO(brand-svg).
 */
export function Mark({ className, gradient = false }: Props) {
  // Static id: only the nav wordmark uses `gradient`, and only once per page.
  const gradId = "bv-mark-grad";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={gradient ? `url(#${gradId})` : "currentColor"}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      )}
      {/* advance + verify: a tick that overshoots into a rising stroke */}
      <path d="M3.5 13l5.5 5.5L20.5 4.5" />
    </svg>
  );
}
