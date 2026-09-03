import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/lib/theme";
import { Nav } from "./Nav";
import { ROUTES } from "@/lib/routes";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener() {}, removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

test("renders a link for every route and the wordmark", () => {
  render(<ThemeProvider><Nav /></ThemeProvider>);
  for (const r of ROUTES) {
    expect(screen.getByRole("link", { name: r.label })).toHaveAttribute("href", r.href);
  }
  expect(screen.getByRole("link", { name: /bridvance/i })).toHaveAttribute("href", "/");
});
