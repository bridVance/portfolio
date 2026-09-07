import Link from "next/link";
import type { Demo } from "@/lib/demos";

/**
 * One case study, shown as a browser window you can scroll inside.
 *
 * The demo is a real page in an iframe rather than markup inlined here, so its
 * own palette and fonts cannot reach the studio site and the studio's tokens
 * cannot reach it. `loading="lazy"` keeps six documents off the critical path;
 * only frames that come near the viewport ever fetch.
 */
export function DemoFrame({ demo }: { demo: Demo }) {
  const url = `/demo/${demo.slug}`;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div>
          <h3 className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
            {demo.name}
          </h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {demo.sector}
          </p>
          <p className="mt-3 max-w-[52ch] font-body text-muted">{demo.line}</p>
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul role="list" className="mt-4 flex flex-wrap gap-1.5">
            {demo.shows.map((s) => (
              <li
                key={s}
                className="rounded-full bg-chip px-2.5 py-1 font-body text-xs text-fg"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
        {demo.ready ? (
          <Link
            href={url}
            className="shrink-0 self-start rounded-md border border-line px-4 py-2 font-mono text-sm text-fg transition-colors hover:border-accent"
          >
            Open full screen
          </Link>
        ) : null}
      </div>

      {demo.ready ? (
        <div className="border-t border-line bg-surface-2 p-3 md:p-4">
          {/* Window chrome, so the frame reads as a site rather than a panel. */}
          <div className="overflow-hidden rounded-lg border border-node-line bg-node">
            <div
              aria-hidden
              className="flex items-center gap-1.5 border-b border-node-line bg-surface-2 px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-node-line" />
              <span className="h-2 w-2 rounded-full bg-node-line" />
              <span className="h-2 w-2 rounded-full bg-node-line" />
              <span className="ml-2 truncate font-mono text-[0.65rem] text-muted">
                {demo.slug}.example
              </span>
            </div>
            <iframe
              src={url}
              title={`${demo.name} — scrollable demo site`}
              loading="lazy"
              className="block h-[26rem] w-full border-0 bg-white md:h-[34rem]"
            />
          </div>
        </div>
      ) : (
        <p className="border-t border-line bg-surface-2 px-5 py-4 font-body text-sm text-muted md:px-6">
          Being built &mdash; this one is next.
        </p>
      )}
    </article>
  );
}
