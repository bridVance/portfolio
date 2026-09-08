import { test, expect } from "@playwright/test";

// Every interactive control in every demo, driven the way a visitor would.
//
// The suite previously asserted the demo pages *rendered*, which is why a cart
// panel that could not close and three buttons with no handler all shipped
// green. A control that looks pressable and does nothing is worse in a
// portfolio piece than not having it: the whole claim is that these work.

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("sauce: cart adds, totals, closes and reaches the demo step", async ({ page }) => {
  await page.goto("/demo/sauce");

  const cart = page.getByRole("complementary", { name: "Your cart" });
  await expect(cart).toBeHidden();

  await page.getByRole("button", { name: /add to cart — smoked chilli/i }).click();
  await expect(cart).toBeVisible();
  await expect(page.getByRole("button", { name: /^cart \(1\)$/i })).toBeVisible();

  // Two of a 420 bottle: 840 subtotal, 42 GST, 90 delivery under the threshold.
  await page.getByRole("button", { name: /one more smoked chilli/i }).click();
  await expect(cart).toContainText("₹840");

  // Five per item per order, enforced where quantity changes rather than only
  // on the button — a cart reached 14 of one sauce before this.
  const more = cart.getByRole("button", { name: /one more smoked chilli/i });
  for (let i = 0; i < 8; i++) if (await more.isEnabled()) await more.click();
  await expect(cart).toContainText(/max 5 per order/i);
  await expect(more).toBeDisabled();
  await expect(cart).toContainText("₹2,100"); // 5 x 420, not more

  await cart.getByRole("button", { name: /one fewer smoked chilli/i }).click();
  await expect(more).toBeEnabled();

  await cart.getByRole("button", { name: "Checkout" }).click();
  await expect(cart).toContainText(/nothing was charged/i);

  // The regression that started this: the panel must actually close.
  await cart.getByRole("button", { name: "Close" }).click();
  await expect(cart).toBeHidden();
});

test("dates: pack size repriced, basket opens, closes and counts", async ({ page }) => {
  await page.goto("/demo/dates");

  const basket = page.getByRole("complementary", { name: "Your basket" });
  await expect(basket).toBeHidden();

  // Medjool at 640 base: 500g is 1.9x, 1kg is 3.6x.
  await expect(page.getByText("₹1,216").first()).toBeVisible();
  await page.getByRole("button", { name: "1kg" }).click();
  await expect(page.getByText("₹2,304").first()).toBeVisible();

  await page.getByRole("button", { name: /add medjool/i }).click();
  await expect(basket).toBeVisible();
  await expect(page.getByRole("button", { name: /basket · 1/i })).toBeVisible();

  await basket.getByRole("button", { name: /one more medjool/i }).click();
  await expect(basket).toContainText("₹4,608");

  const moreDates = basket.getByRole("button", { name: /one more medjool/i });
  for (let i = 0; i < 8; i++) if (await moreDates.isEnabled()) await moreDates.click();
  await expect(moreDates).toBeDisabled();
  await expect(basket).toContainText(/max 5/i);

  await basket.getByRole("button", { name: "Close" }).click();
  await expect(basket).toBeHidden();
});

test("distributor: tier applies, credit blocks, order submits", async ({ page }) => {
  await page.goto("/demo/distributor");

  const qty = page.getByLabel(/quantity of chilli oil/i);
  // Scoped to the row: the tier badge is one cell of one product, and a bare
  // text match would also see the column header and the other five rows.
  const row = page.getByRole("row").filter({ hasText: "Chilli oil" });
  await expect(row).toContainText("50+");

  // Typed, not filled: fill() assigns .value directly, which slips past React's
  // value tracker so onChange never fires — the DOM showed 240 while the
  // component still held 60 and the row still priced at the 50+ tier.
  const type = async (v: string) => {
    await qty.click();
    await qty.press("ControlOrMeta+a");
    await qty.pressSequentially(v);
  };

  await type("240"); // 20 cases of 12 — the step rejects off-step values
  await expect(qty).toHaveValue("240");
  await expect(row).toContainText("200+");

  // Far beyond the available credit must disable submission, not silently pass.
  await type("4800");
  await expect(page.getByText(/over your available credit/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit order" })).toBeDisabled();

  // A quantity beyond stock must be impossible to enter, not merely flagged:
  // 24,852 against 620 in stock priced at sixteen crore before this.
  const tamarind = page.getByLabel(/quantity of tamarind paste/i);
  await tamarind.click();
  await tamarind.pressSequentially("24852");
  await expect(tamarind).toHaveValue("620");
  await expect(page.getByText(/all 620 in stock/i).first()).toBeVisible();
  await tamarind.press("ControlOrMeta+a");
  await tamarind.pressSequentially("120");
  await expect(tamarind).toHaveValue("120");

  await type("60");
  await page.getByRole("button", { name: "Submit order" }).click();
  await expect(page.getByText(/order so-4482 raised/i)).toBeVisible();
  await page.getByRole("button", { name: /start a new order/i }).click();
  await expect(page.getByText(/enter a quantity to start/i)).toBeVisible();
});

test("clinic: practitioner, day and slot drive the confirmation", async ({ page }) => {
  await page.goto("/demo/clinic");

  const confirm = page.getByRole("button", { name: /confirm booking/i });
  await expect(confirm).toBeDisabled();

  await page.getByRole("button", { name: /dr vivek menon/i }).click();
  await page.getByRole("button", { name: "Wed 10" }).click();

  const slot = page.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first();
  await slot.click();
  await expect(confirm).toBeEnabled();

  await confirm.click();
  await expect(page.getByText(/booked with dr vivek menon/i)).toBeVisible();
  await expect(page.getByText(/nothing was scheduled/i)).toBeVisible();
});

test("restaurant: the three-step funnel carries its state", async ({ page }) => {
  await page.goto("/demo/restaurant");

  await page.getByRole("button", { name: "4", exact: true }).click();
  await page.getByRole("button", { name: "19:45" }).click();
  await expect(page.getByRole("heading", { name: /table for 4, saturday at 19:45/i })).toBeVisible();

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText(/table held for 15 minutes/i)).toBeVisible();

  await page.getByRole("button", { name: /start again/i }).click();
  await expect(page.getByRole("group").filter({ hasText: /how many of you/i })).toBeVisible();
});

test("watches: listings swap the provenance, consigning explains itself", async ({ page }) => {
  await page.goto("/demo/watches");

  await expect(page.getByRole("heading", { name: "Diver, 1969" })).toBeVisible();
  await page.getByRole("button", { name: /field watch, 1965/i }).click();
  await expect(page.getByRole("heading", { name: "Field watch, 1965" })).toBeVisible();
  // An unverified listing must say so rather than imply a check happened.
  await expect(page.getByText(/archive check is still open/i)).toBeVisible();

  await page.getByRole("button", { name: /consign a watch/i }).click();
  await expect(page.getByText(/nothing was sent/i)).toBeVisible();
});
