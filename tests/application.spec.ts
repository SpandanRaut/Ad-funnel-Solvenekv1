import { test, expect } from "@playwright/test";
import handler from "../netlify/functions/lead";
import { startWebhook } from "./lead-bridge";

let webhook: Awaited<ReturnType<typeof startWebhook>>;
test.beforeAll(async () => { webhook = await startWebhook(); });
test.afterAll(() => { webhook.close(); });

test("prerendered landing ships the approved copy and real sections", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("8–12");
  expect(html).toContain("More Qualified");
  expect(html).toContain("Kitchen &amp; Bath");
  expect(html).toContain("Booked on Your Calendar. Every Month.");
  for (const id of ["application", "book", "approach", "faq"]) expect(html).toContain('id="' + id + '"');
  for (const name of ["Pradeep Shrestha", "Sunil Raut", "Ujjwal KC", "Bhaskar Shrestha"]) expect(html).toContain(name);
});

test("legacy lead endpoint still forwards the documented schema to a local receiver", async () => {
  const response = await handler(new Request("http://localhost/.netlify/functions/lead", {
    method: "POST",
    body: JSON.stringify({ name: "Test Person", email: "test@example.com", phone: "555-0100", company: "Test Co", eventId: "test-lead", pageUrl: "https://example.test/", tracking: { utm_source: "meta" } }),
  }));
  expect(response.status).toBe(200);
  const forwarded = webhook.received.at(-1)!;
  expect(forwarded).toMatchObject({ name: "Test Person", first_name: "Test", last_name: "Person", company: "Test Co", email: "test@example.com", phone: "555-0100", budget: "", industry: "", other_industry: "", utm_source: "meta", event_id: "test-lead", page_url: "https://example.test/" });
  expect(Date.parse(forwarded.submitted_at!)).not.toBeNaN();
});

test("values that Sheets would parse as formulas reach the webhook as text", async () => {
  const before = webhook.received.length;
  const response = await handler(new Request("http://localhost/.netlify/functions/lead", {
    method: "POST",
    body: JSON.stringify({ name: '=HYPERLINK("x") Test', email: "test@example.com", phone: "+1 (555) 010-0000", company: "@Test Co", tracking: { utm_source: "-meta" } }),
  }));
  expect(response.status).toBe(200);
  expect(webhook.received).toHaveLength(before + 1);
  expect(webhook.received.at(-1)).toMatchObject({ name: "'=HYPERLINK(\"x\") Test", first_name: "'=HYPERLINK(\"x\")", last_name: "Test", phone: "'+1 (555) 010-0000", company: "'@Test Co", utm_source: "'-meta", email: "test@example.com", budget: "" });
});

test("honeypot submissions are accepted without forwarding", async () => {
  const before = webhook.received.length;
  const response = await handler(new Request("http://localhost/.netlify/functions/lead", { method: "POST", body: JSON.stringify({ fax: "bot" }) }));
  expect(response.status).toBe(200);
  expect(webhook.received).toHaveLength(before);
});

test("legacy endpoint rejects invalid input before contacting the receiver", async () => {
  const before = webhook.received.length;
  expect((await handler(new Request("http://localhost/lead"))).status).toBe(405);
  expect((await handler(new Request("http://localhost/lead", { method: "POST", body: "invalid" }))).status).toBe(400);
  expect((await handler(new Request("http://localhost/lead", { method: "POST", body: "x".repeat(10001) }))).status).toBe(413);
  const invalid = await handler(new Request("http://localhost/lead", { method: "POST", body: "{}" }));
  expect(invalid.status).toBe(422);
  expect(await invalid.json()).toMatchObject({ fields: ["name", "email", "phone", "company"] });
  expect(webhook.received).toHaveLength(before);
});
