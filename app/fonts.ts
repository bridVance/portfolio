import {
  Familjen_Grotesk,
  Newsreader,
  JetBrains_Mono,
  Archivo,
} from "next/font/google";

/**
 * Statement face — the home page's display composition only. Familjen Grotesk
 * stops at 700, which reads too light at 140px; Archivo goes to 900. Loaded as
 * a single weight so it costs one file and nothing else on the site uses it.
 */
const statement = Archivo({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-statement",
  display: "swap",
});

const display = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVars = `${display.variable} ${body.variable} ${mono.variable} ${statement.variable}`;
