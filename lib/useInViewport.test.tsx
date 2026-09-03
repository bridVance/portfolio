import { render, act } from "@testing-library/react";
import { useRef } from "react";
import { useInViewport } from "./useInViewport";

let cb: (entries: Array<{ isIntersecting: boolean }>) => void;

beforeEach(() => {
  cb = () => {};
  class IO {
    constructor(fn: typeof cb) { cb = fn; }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  global.IntersectionObserver = IO;
});

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewport(ref, { once: true });
  return <div ref={ref} data-inview={inView ? "yes" : "no"} />;
}

test("flips to true on intersection and stays (once)", () => {
  const { container } = render(<Probe />);
  const el = container.firstChild as HTMLElement;
  expect(el).toHaveAttribute("data-inview", "no");
  act(() => cb([{ isIntersecting: true }]));
  expect(el).toHaveAttribute("data-inview", "yes");
  act(() => cb([{ isIntersecting: false }]));
  expect(el).toHaveAttribute("data-inview", "yes");
});
