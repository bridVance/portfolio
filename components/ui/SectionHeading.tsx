import type { ReactNode } from "react";
import { Mark } from "./Mark";

type Props = {
  label: string;
  children: ReactNode;
  as?: "h2" | "h3";
  id?: string;
  /** Running section number, e.g. "01". Decorative — omit and the row closes up. */
  index?: string;
};

/**
 * Section opener (§8.3): a hairline, then the checkmark mark + a running section
 * number + a mono uppercase label, then the heading in the display face. The
 * label names a real section — not decoration.
 */
export function SectionHeading({
  label,
  children,
  as: Tag = "h2",
  id,
  index,
}: Props) {
  return (
    <div className="border-t border-line pt-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
        <Mark className="h-3.5 w-3.5 text-accent" />
        {index ? (
          <span aria-hidden className="text-fg">
            {index}
            <span className="px-2 text-line">/</span>
          </span>
        ) : null}
        {label}
      </p>
      <Tag id={id} className="mt-3 text-2xl font-medium md:text-3xl">
        {children}
      </Tag>
    </div>
  );
}
