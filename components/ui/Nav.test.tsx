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

test("renders a link for every non-home route, plus the wordmark as the home affordance", () => {
  render(<ThemeProvider><Nav /></ThemeProvider>);
  for (const r of ROUTES.filter((r) => r.href !== "/")) {
    expect(screen.getByRole("link", { name: r.label })).toHaveAttribute("href", r.href);
  }
  // "Home" is not a nav link — the "BridVance" wordmark is the way back home.
  expect(screen.queryByRole("link", { name: "Home" })).toBeNull();
  expect(screen.getByRole("link", { name: /bridvance/i })).toHaveAttribute("href", "/");
});

test("the wordmark link carries the brand mark", () => {
  render(
    <ThemeProvider>
      <Nav />
    </ThemeProvider>
  );
  const wordmark = screen.getByRole("link", { name: /bridvance/i });
  expect(wordmark.querySelector("svg")).not.toBeNull();
});
