import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener() {}, removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

test("button announces the action and cycles", async () => {
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const btn = screen.getByRole("button");
  expect(btn).toHaveAccessibleName(/theme/i);
  await userEvent.click(btn);
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});
