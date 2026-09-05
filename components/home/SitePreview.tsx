/**
 * Decorative miniature of a site being browsed — the visual half of the
 * "Design" panel (§5.1). Pure markup plus one CSS keyframe (`.bv-scroll` in
 * globals.css): no JS, no dependencies, nothing added to the bundle. The page
 * inside the frame drifts upward and back on a loop; under reduced motion it
 * rests at the top. `aria-hidden` — the panel's heading and link carry the
 * meaning, this is illustration.
 */
export function SitePreview() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-surface"
    >
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="ml-2 h-2 w-20 rounded-full bg-line" />
      </div>

      {/* the "page", taller than the frame so the loop has somewhere to go */}
      <div className="bv-scroll flex flex-col gap-2.5 p-3">
        <div
          className="h-16 rounded"
          style={{
            background:
              "linear-gradient(135deg, #ffd36b 0%, #ff7a9c 55%, #8b5cf6 100%)",
          }}
        />
        <div className="h-2 w-3/4 rounded-full bg-line" />
        <div className="h-2 w-1/2 rounded-full bg-line" />
        <div className="mt-1 grid grid-cols-2 gap-2.5">
          <div className="h-11 rounded bg-surface-2" />
          <div className="h-11 rounded bg-surface-2" />
          <div className="h-11 rounded bg-surface-2" />
          <div className="h-11 rounded bg-surface-2" />
        </div>
        <div className="mt-1 h-2 w-2/3 rounded-full bg-line" />
        <div className="h-16 rounded bg-surface-2" />
        <div className="h-2 w-1/2 rounded-full bg-line" />
        <div className="h-11 rounded bg-surface-2" />
      </div>

      {/* soften the bottom edge so the loop doesn't hard-cut */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
