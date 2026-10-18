import { expect, test } from "@playwright/test";
import { BOOKING_COOKIE, receiptFromScheduledEvent } from "../composables/bookingGate";

test.beforeEach(async ({ page }) => {
  // No real bookings or external calendar requests in routing tests.
  await page.route("https://assets.calendly.com/**", route => route.fulfill({
    contentType: "text/javascript",
    body: "window.Calendly={initInlineWidget(){}}",
  }));
});

for (const width of [1440, 1024, 390]) {
  test(`blocked confirmation matches a fresh landing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const hydration: string[] = [];
    page.on("console", message => { if (/hydration/i.test(message.text())) hydration.push(message.text()); });
    const styles = () => page.evaluate(() => {
      const style = (selector: string) => {
        const value = getComputedStyle(document.querySelector(selector)!);
        return [value.color, value.backgroundColor, value.fontFamily, value.fontStyle, value.gridTemplateColumns];
      };
      return { root: document.querySelector(".premium-landing")?.className, header: style("header"), h1: style("h1"), highlight: style(".headline-highlight"), hero: style(".hero") };
    });
    await page.goto("/");
    await expect(page.locator(".calendar-inline")).toBeVisible();
    const fresh = await styles();
    await page.goto("/confirmed");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".calendar-inline")).toBeVisible();
    expect(await styles()).toEqual(fresh);
    await expect(page.locator("header .wordmark")).toBeVisible();
    await expect(page.locator("header .faq-link")).toBeVisible();
    await expect(page.locator("header .header-cta")).toBeVisible();
    expect(hydration).toEqual([]);
  });
}

test("HTTP access decisions, legacy redirects and unknown paths", async ({ request }) => {
  for (const path of ["/confirmed", "/confirmed/", "/CONFIRMED", "/confirmed?x=1"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe("/");
    expect(await response.text()).not.toContain("Your call details");
  }
  for (const path of ["/schedule", "/schedule/", "/schedule/anything"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe("/");
  }
  for (const path of ["/confirmed/extra", "/does-not-exist", "/deep/unknown/path"]) {
    const response = await request.get(path, { headers: { accept: "text/html" } });
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain("ERROR 404");
  }
});

test("valid cookie works without sessionStorage; invalid and expired cookies fail closed", async ({ page, context, baseURL }) => {
  const receipt = receiptFromScheduledEvent({ event: "calendly.event_scheduled", payload: { event: { uri: "test-event" }, invitee: { uri: "test-invitee" } } })!;
  const set = (value: unknown) => context.addCookies([{ name: BOOKING_COOKIE, value: encodeURIComponent(JSON.stringify(value)), url: baseURL!, sameSite: "Lax" }]);
  await set(receipt);
  for (const path of ["/confirmed", "/confirmed/", "/CONFIRMED", "/confirmed?x=1"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Your call details" })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/confirmed");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your call details" })).toBeVisible();
  }
  for (const value of [{}, { ...receipt, completedAt: Date.now() - 86400001 }]) {
    await set(value);
    await page.goto("/confirmed");
    await expect(page).toHaveURL(/\/$/);
  }
  await context.clearCookies();
  await page.goto("/confirmed#x");
  await expect(page).toHaveURL(/\/$/);
});

test("404 recovery, FAQ focus and the header CTA destinations", async ({ page }) => {
  await page.goto("/unknown");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page isn't on the calendar.");
  await page.locator("header .faq-link").click();
  await expect(page).toHaveURL(/\/#faq$/);
  await expect(page.locator("#faq")).toBeFocused();
  await page.goto("/");
  await page.locator("header .header-cta").click();
  await expect(page).toHaveURL(/\/#approach$/);
  await expect(page.locator("#approach")).toBeFocused();
  await expect(page.locator("header nav a")).toHaveCount(2);
});
