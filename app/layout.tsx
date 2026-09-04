import type { Metadata } from "next";
import { fontVars } from "./fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { SkipLink } from "@/components/ui/SkipLink";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "BridVance", template: "%s — BridVance" },
  description: "A studio building distinctive web front-ends and agentic automation systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-fg">
        <ThemeProvider>
          <SkipLink />
          <Nav />
          <main id="main" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
