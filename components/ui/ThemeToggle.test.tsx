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

test("is a labelled switch reflecting the resolved theme", () => {
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const sw = screen.getByRole("switch", { name: /dark mode/i });
  // matchMedia mock reports light, no stored choice -> unchecked.
  expect(sw).toHaveAttribute("aria-checked", "false");
});

test("toggles between explicit light and dark, stamping data-theme", async () => {
  const user = userEvent.setup();
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const sw = screen.getByRole("switch");

  await user.click(sw); // light -> dark
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(sw).toHaveAttribute("aria-checked", "true");
  expect(localStorage.getItem("bv-theme")).toBe("dark");

  await user.click(sw); // dark -> light
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(sw).toHaveAttribute("aria-checked", "false");
});
