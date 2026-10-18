import { expect, test } from "@playwright/test";
import { guaranteeConditions, siteSeo } from "../composables/siteContent";

test.beforeEach(async ({ page }) => {
  await page.route("https://assets.calendly.com/**", route => route.fulfill({ contentType: "text/javascript", body: "window.Calendly={initInlineWidget(o){const f=document.createElement('iframe');f.src=o.url;o.parentElement.appendChild(f)}}" }));
  await page.route("https://calendly.com/**", route => route.fulfill({ contentType: "text/html", body: "<body><script>parent.postMessage({event:'calendly.event_type_viewed'},'*');parent.postMessage({event:'calendly.page_height',payload:{height:'602px'}},'*')</script>" }));
});

test("six rendered conditions are verbatim, public and printable", async ({ page }) => {
  const response = await page.goto("/conditions");
  expect(response!.status()).toBe(200);
  await expect(page.locator(".condition-copy p")).toHaveText(guaranteeConditions.map(item => item.text));
  for (const item of guaranteeConditions) await expect(page.locator(`#${item.id}`)).toHaveCount(1);
  await expect(page.locator("header .header-cta")).toHaveAttribute("href", "/#book");
  await expect(page.locator("header .header-cta")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".condition-copy p")).toHaveText(guaranteeConditions.map(item => item.text));
  for (const row of await page.locator(".condition-row").all()) await expect(row).toHaveCSS("opacity", "1");
});

test("approved hero copy, highlight, proof emphasis and avatars", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("8–12 More Qualified Kitchen & Bath Estimates. Booked on Your Calendar. Every Month.");
  await expect(page.locator(".headline-highlight")).toHaveText("Booked on Your Calendar. Every Month.");
  await expect(page.locator(".outcome-chips li")).toHaveText(["Exclusive homeowner inquiries. Never sold to other contractors.", "First qualified estimates targeted within 21 days.", "We run the ads, follow up with leads, and book your estimates.", "No ads, funnels, or follow-up systems for you to build."]);
  await expect(page.locator(".proof-line p")).toHaveText("The same system generated $17,000 in 11 weeks for Simca Laboratories. Now built for kitchen & bath remodelers.");
  await expect(page.locator(".proof-line strong")).toHaveText("$17,000 in 11 weeks");
  await expect(page.locator(".proof-line p")).toHaveCSS("font-weight", "400");
  await expect(page.locator(".avatar-stack span")).toHaveText(["SR", "PS", "UK"]);
});

test("conditions open in a new tab and preserve the booking page", async ({ page }) => {
  await page.goto("/");
  const link = page.locator(".guarantee-strip a.conditions");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener");
  await expect(link).toHaveAccessibleName("Conditions apply. (opens in a new tab)");
  const popupPromise = page.waitForEvent("popup");
  await link.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveURL(/\/conditions$/);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#calendar")).toBeVisible();
  await popup.close();
});

for (const path of ["/", "/conditions", "/privacy", "/confirmed", "/unknown"]) {
  test(`head tags, landmarks and media accessibility on ${path}`, async ({ page, context, baseURL }) => {
    if (path === "/confirmed") await context.addCookies([{ name: "solvenek-booking", value: encodeURIComponent(JSON.stringify({ completedAt: Date.now(), date: null, timeRange: null, timezone: null, meetingType: "Google Meet" })), url: baseURL!, sameSite: "Lax" }]);
    const response = await page.goto(path);
    if (path === "/") await page.locator(".calendar-inline iframe").waitFor();
    const meta = siteSeo[path === "/unknown" ? "error" : path as keyof typeof siteSeo];
    await expect(page).toHaveTitle(meta.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", meta.description);
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeLessThanOrEqual(155);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    const noindex = path === "/confirmed" || path === "/unknown";
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", noindex ? "noindex,nofollow" : "index,follow");
    if (path === "/unknown") expect(response!.status()).toBe(404);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(path);
    for (const property of ["title", "description", "type", "url", "site_name", "image", "image:width", "image:height", "image:alt"]) await expect(page.locator(`meta[property="og:${property}"]`)).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical!);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    expect(await page.locator("img:not([alt]), iframe:not([title]), iframe[title='']").count()).toBe(0);
    const headingOrder = await page.locator("h1,h2,h3,h4,h5,h6").evaluateAll(nodes => nodes.map(node => Number(node.tagName.slice(1))));
    for (let index = 1; index < headingOrder.length; index++) expect(headingOrder[index]).toBeLessThanOrEqual(headingOrder[index - 1]! + 1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
}

test("legal CTAs and direct book hash focus the existing calendar wrapper", async ({ page }) => {
  await page.goto("/conditions");
  await page.locator(".conditions-closing .primary-button").click();
  await expect(page).toHaveURL(/\/#book$/);
  await expect(page.locator("#book")).toBeFocused();
  await page.goto("/#book");
  await expect(page.locator("#book")).toBeFocused();
  await page.goto("/privacy");
  await page.locator("header .faq-link").click();
  await expect(page).toHaveURL(/\/#faq$/);
  await expect(page.locator("#faq")).toBeFocused();
});

test("privacy contents work on desktop and mobile", async ({ page }) => {
  await page.goto("/privacy#cookies");
  await expect(page.locator("#cookies")).toBeFocused();
  await expect(page.locator('.desktop-contents a[href="/privacy#cookies"]')).toHaveAttribute("aria-current", "location");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/privacy");
  await page.locator(".mobile-contents summary").click();
  await page.locator('.mobile-contents a[href="/privacy#your-rights"]').click();
  await expect(page.locator("#your-rights")).toBeFocused();
});

test("robots and sitemap contain the public routes and exclude confirmation", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /"); expect(robots).toContain("Disallow: /confirmed"); expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap.xml/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/conditions", "/privacy"]) expect(sitemap).toContain(`${path}</loc>`);
  expect(sitemap).not.toContain("/confirmed");
  expect((sitemap.match(/<url>/g) || []).length).toBe(3);
});
