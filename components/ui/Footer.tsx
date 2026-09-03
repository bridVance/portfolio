import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-mono">BridVance — design &amp; agentic automation</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="hover:text-fg">
              {r.label}
            </Link>
          ))}
          <a href="#main" className="hover:text-fg">Back to top</a>
        </nav>
      </div>
    </footer>
  );
}
