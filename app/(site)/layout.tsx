import type { Metadata } from "next";
import { fontVars } from "../fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { SkipLink } from "@/components/ui/SkipLink";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "BridVance", template: "%s — BridVance" },
  description:
    "An independent AI agency building agents, assistants and the interfaces people use them through.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <noscript>
          <style>{`.bv-rise{opacity:1!important;transform:none!important}.bv-turn{opacity:1!important;transform:none!important}.bv-wipe{animation:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-fg">
        <ThemeProvider>
          <SkipLink />
          <Nav />
          <main id="main" tabIndex={-1} className="flex-1 pt-[var(--bv-nav-h)]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
