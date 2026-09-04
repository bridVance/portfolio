import { render, screen, act } from "@testing-library/react";

let ioCb: ((entries: Array<{ isIntersecting: boolean }>) => void) | null;
let reduce: boolean;

beforeEach(() => {
  ioCb = null;
  reduce = false;
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
  window.matchMedia = ((q: string) => ({
    matches: q.includes("reduced-motion") ? reduce : false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

import { Reveal } from "./Reveal";

test("reduced motion: children visible, plain wrapper, no inline transition", () => {
  reduce = true;
  const { container } = render(
    <Reveal>
      <p>alpha</p>
    </Reveal>
  );
  expect(screen.getByText("alpha")).toBeVisible();
  expect((container.firstElementChild as HTMLElement).getAttribute("style")).toBeNull();
});

test("children stay in the DOM before intersection; delay applied; reveal flips on intersect", () => {
  const { container } = render(
    <Reveal delay={0.24}>
      <p>beta</p>
    </Reveal>
  );
  expect(screen.getByText("beta")).toBeInTheDocument();
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.transitionDelay).toBe("0.24s");
  expect(el.style.opacity).toBe("0");
  act(() => ioCb?.([{ isIntersecting: true }]));
  expect(el.style.opacity).toBe("1");
  expect(el.style.transform).toBe("none");
});
