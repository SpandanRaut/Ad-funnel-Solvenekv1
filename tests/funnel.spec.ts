import { test, expect, type Page } from "@playwright/test";

const widget = "window.Calendly={initInlineWidget(o){window.calendlyTestOptions=o;const f=document.createElement('iframe');f.src=o.url;o.parentElement.appendChild(f)}}";
const frame = "<!doctype html><body><script>parent.postMessage({event:'calendly.event_type_viewed'},'*');parent.postMessage({event:'calendly.page_height',payload:{height:'602px'}},'*');</script></body>";
test.beforeEach(async ({ page }) => {
  await page.route("https://assets.calendly.com/**", route => route.fulfill({ contentType: "text/javascript", body: widget }));
  await page.route("https://calendly.com/**", route => route.fulfill({ contentType: "text/html", body: frame }));
});
async function ready(page: Page, url = "/") {
  await page.goto(url);
  await page.frameLocator(".calendar-inline iframe").locator("body").waitFor({ state: "attached" });
}
async function send(page: Page, event: string, payload: Record<string, unknown> = {}) {
  await page.frameLocator(".calendar-inline iframe").locator("body").evaluate((_, message) => parent.postMessage(message, "*"), { event, payload });
}

test("only a source-validated completed booking passes the gate; reload keeps it", async ({ page, context }) => {
  await ready(page, "/?utm_source=meta&utm_campaign=launch");
  await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(".calendar-inline iframe")!;
    const data = { event: "calendly.event_scheduled", payload: { event: { uri: "bad-event" }, invitee: { uri: "bad-invitee" } } };
    window.dispatchEvent(new MessageEvent("message", { origin: "https://invalid.test", source: iframe.contentWindow, data }));
    window.dispatchEvent(new MessageEvent("message", { origin: "https://calendly.com", source: window, data }));
  });
  await send(page, "calendly.event_scheduled", {});
  await send(page, "calendly.date_and_time_selected", {});
  expect(new URL(page.url()).pathname).toBe("/");
  expect((await context.cookies()).some(cookie => cookie.name === "solvenek-booking" && cookie.value !== "null")).toBe(false);
  await page.frameLocator(".calendar-inline iframe").locator("body").evaluate(() => {
    const payload = { event: { uri: "https://api.calendly.com/scheduled_events/TEST" }, invitee: { uri: "https://api.calendly.com/scheduled_events/TEST/invitees/TEST", name: "Private test", email: "private@example.test" } };
    parent.postMessage({ event: "calendly.event_scheduled", payload }, "*");
    parent.postMessage({ event: "calendly.event_scheduled", payload }, "*");
  });
  await expect(page).toHaveURL(/\/confirmed\?/);
  await expect(page).toHaveURL(/utm_source=meta/);
  await expect(page.getByRole("heading", { name: "Your call details" })).toBeVisible();
  const cookie = (await context.cookies()).find(item => item.name === "solvenek-booking")!;
  const receipt = JSON.parse(decodeURIComponent(cookie.value));
  expect(Object.keys(receipt).sort()).toEqual(["completedAt", "date", "meetingType", "timeRange", "timezone"].sort());
  expect(cookie.sameSite).toBe("Lax");
  expect(cookie.path).toBe("/");
  expect(cookie.expires - Date.now() / 1000).toBeGreaterThan(86000);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("solvenek-funnel")!));
  expect(stored.booking.inviteeUri).toContain("/TEST");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your call details" })).toBeVisible();
  await context.clearCookies();
  await page.reload();
  await expect(page.locator(".premium-landing")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");
});

test("legacy session booking data cannot bypass the cookie gate", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("solvenek-funnel", JSON.stringify({ booking: { eventUri: "old-event", inviteeUri: "old-invitee" } })));
  await page.goto("/confirmed");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".premium-landing")).toBeVisible();
});

test("existing persisted prefill and attribution stay in widget options, outside the iframe URL", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("solvenek-funnel", JSON.stringify({ application: { name: "Test Person", email: "test@example.com", phone: "+1 (555) 010-0000", companyName: "Test Co" }, submitted: true, tracking: { utm_source: "meta", utm_campaign: "launch" } })));
  await ready(page, "/?utm_source=meta&utm_campaign=launch");
  const options = await page.evaluate(() => (window as unknown as { calendlyTestOptions: { prefill: unknown; utm: unknown; url: string } }).calendlyTestOptions);
  expect(options.prefill).toEqual({ name: "Test Person", email: "test@example.com", customAnswers: { a1: "Test Co", a2: "+15550100000" } });
  expect(options.utm).toMatchObject({ utmSource: "meta", utmCampaign: "launch" });
  const url = new URL(options.url);
  for (const key of ["name", "email", "phone", "a1", "a2"]) expect(url.searchParams.has(key)).toBe(false);
  await expect(page.locator(".calendar-inline iframe")).toHaveAttribute("title", "Schedule a strategy call");
});

test("existing header, final and sticky CTA targets stay unchanged", async ({ page }) => {
  await ready(page);
  await page.locator("header .header-cta").click();
  await expect(page).toHaveURL(/\/#approach$/);
  await expect(page.locator("#approach")).toBeFocused();
  await page.locator(".landing-final button").click();
  await expect(page.locator("#calendar")).toBeFocused();
  if (page.viewportSize()!.width < 1024) {
    await page.locator("#faq").scrollIntoViewIfNeeded();
    await expect(page.locator(".mobile-calendar-cta")).toHaveClass(/is-shown/);
    await page.locator(".mobile-calendar-cta button").click();
    await expect(page.locator("#calendar")).toBeFocused();
  }
});

test("blocked calendar script retains a visible fallback", async ({ page }) => {
  await page.route("https://assets.calendly.com/**", route => route.abort());
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open the booking page" })).toBeVisible({ timeout: 12000 });
  await expect(page.getByRole("link", { name: "Open the booking page" })).toHaveAttribute("target", "_blank");
  await expect(page.locator("h1")).toHaveText("8–12 More Qualified Kitchen & Bath Estimates. Booked on Your Calendar. Every Month.");
});
