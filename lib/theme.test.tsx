import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { choice, resolved, cycle } = useTheme();
  return (
    <button onClick={cycle} data-choice={choice} data-resolved={resolved}>
      cycle
    </button>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({
    matches: q.includes("dark"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

test("defaults to system and resolves from prefers-color-scheme", () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  const btn = screen.getByRole("button");
  expect(btn).toHaveAttribute("data-choice", "system");
  expect(btn).toHaveAttribute("data-resolved", "dark");
});

test("cycle goes light -> dark -> system and stamps data-theme + persists", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  const btn = screen.getByRole("button");
  const user = userEvent.setup();

  await user.click(btn); // system -> light
  expect(btn).toHaveAttribute("data-choice", "light");
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("bv-theme")).toBe("light");

  await user.click(btn); // light -> dark
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

  await user.click(btn); // dark -> system
  expect(btn).toHaveAttribute("data-choice", "system");
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  expect(localStorage.getItem("bv-theme")).toBe("system");
});

test("reads a persisted choice on mount", () => {
  localStorage.setItem("bv-theme", "light");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByRole("button")).toHaveAttribute("data-choice", "light");
});
