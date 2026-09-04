import { render, screen } from "@testing-library/react";

let reduce = false;
let lastProps: Record<string, unknown> | null = null;

vi.mock("framer-motion", () => ({
  useReducedMotion: () => reduce,
  motion: {
    div: (props: Record<string, unknown>) => {
      lastProps = props;
      const { initial: _initial, whileInView: _whileInView, viewport: _viewport, transition: _transition, ...rest } = props;
      return <div {...(rest as Record<string, unknown>)} />;
    },
  },
}));

import { Reveal } from "./Reveal";

beforeEach(() => {
  reduce = false;
  lastProps = null;
});

test("renders children (visible) under reduced motion, no motion wrapper", () => {
  reduce = true;
  render(
    <Reveal>
      <p>alpha</p>
    </Reveal>
  );
  expect(screen.getByText("alpha")).toBeVisible();
  expect(lastProps).toBeNull();
});

test("animates once mounted and forwards `delay` into the transition", async () => {
  render(
    <Reveal delay={0.24}>
      <p>beta</p>
    </Reveal>
  );
  expect(await screen.findByText("beta")).toBeVisible();
  expect((lastProps?.transition as { delay?: number })?.delay).toBe(0.24);
});
