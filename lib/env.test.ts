import { envOr } from "./env";

const NAME = "TEST_ONLY_ENV";

afterEach(() => {
  delete process.env[NAME];
});

test("uses the value when there is one", () => {
  process.env[NAME] = "set@example.com";
  expect(envOr(NAME, "fallback")).toBe("set@example.com");
});

test("falls back when the variable is unset", () => {
  expect(envOr(NAME, "fallback")).toBe("fallback");
});

test("falls back when the variable is set but empty", () => {
  // The case `??` misses, and the one a hosting dashboard produces.
  process.env[NAME] = "";
  expect(envOr(NAME, "fallback")).toBe("fallback");
});

test("falls back when the variable is only whitespace", () => {
  process.env[NAME] = "   ";
  expect(envOr(NAME, "fallback")).toBe("fallback");
});

test("trims a value that carries stray whitespace", () => {
  process.env[NAME] = "  set@example.com\n";
  expect(envOr(NAME, "fallback")).toBe("set@example.com");
});
