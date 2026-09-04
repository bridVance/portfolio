import { render, screen, act } from "@testing-library/react";

let ioCb: ((entries: Array<{ isIntersecting: boolean }>) => void) | null;

beforeEach(() => {
  ioCb = null;
  class IO {
    constructor(fn: (e: Array<{ isIntersecting: boolean }>) => void) {
      ioCb = fn;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  global.IntersectionObserver = IO;
});

import { Reveal } from "./Reveal";

test("children render in the DOM immediately, inside a .bv-rise wrapper (no data-shown yet)", () => {
  const { container } = render(
    <Reveal delay={0.24}>
      <p>alpha</p>
    </Reveal>
  );
  expect(screen.getByText("alpha")).toBeInTheDocument();
  const el = container.firstElementChild as HTMLElement;
  expect(el).toHaveClass("bv-rise");
  expect(el.hasAttribute("data-shown")).toBe(false);
  expect(el.style.transitionDelay).toBe("0.24s");
  expect(el.className).toContain("bv-rise");
});

test("forwards className and reveals (data-shown) once intersecting", () => {
  const { container } = render(
    <Reveal className="mx-auto max-w-4xl">
      <p>beta</p>
    </Reveal>
  );
  const el = container.firstElementChild as HTMLElement;
  expect(el).toHaveClass("bv-rise", "mx-auto", "max-w-4xl");
  expect(el.hasAttribute("data-shown")).toBe(false);
  act(() => ioCb?.([{ isIntersecting: true }]));
  expect(el.hasAttribute("data-shown")).toBe(true);
});
