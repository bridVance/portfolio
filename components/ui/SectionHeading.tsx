import type { ReactNode } from "react";
import { Mark } from "./Mark";

type Props = {
  label: string;
  children: ReactNode;
  as?: "h2" | "h3";
  id?: string;
};

/**
 * Section opener (§8.3): a hairline, then the checkmark mark + a mono uppercase
 * label, then the heading in the display face. The label names a real section —
 * not decoration.
 */
export function SectionHeading({ label, children, as: Tag = "h2", id }: Props) {
  return (
    <div className="border-t border-line pt-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
        <Mark className="h-3.5 w-3.5 text-accent" />
        {label}
      </p>
      <Tag id={id} className="mt-3 text-2xl font-medium md:text-3xl">
        {children}
      </Tag>
    </div>
  );
}
