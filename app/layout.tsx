import { fontVars } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
