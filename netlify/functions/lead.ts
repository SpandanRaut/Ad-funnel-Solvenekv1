// POST /.netlify/functions/lead — validates an application and forwards it as
// JSON to LEAD_WEBHOOK_URL (GoHighLevel inbound webhook, Zapier, Google Sheets…).

const MAX_BODY = 10_000;
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

const INDUSTRIES = ["Kitchen & bathroom remodeling", "Other home services", "Other"];

/** Each field: [required, max length, extra check]. */
const FIELDS: Record<string, [boolean, number, ((v: string) => boolean)?]> = {
  name: [true, 100, (v) => v.length >= 2],
  email: [true, 200, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
  phone: [true, 40, (v) => v.replace(/\D/g, "").length >= 7 &&
    v.replace(/\D/g, "").length <= 20],
  company: [true, 100, (v) => v.length >= 2],
  // Budget and industry are no longer asked; kept so the payload keys stay.
  budget: [false, 40],
  industry: [false, 80, (v) => INDUSTRIES.includes(v)],
  otherIndustry: [false, 80],
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * The Apps Script webhook writes cells the way typed input is parsed, so a
 * phone like "+1 555…" became a formula (#ERROR!) and "=…" could inject one.
 * A leading apostrophe makes Sheets keep the text exactly as typed; the
 * apostrophe itself is not part of the cell's displayed value.
 */
const asSheetText = (value: string) =>
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

export default async (request: Request) => {
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { error: "Payload too large" });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  // Honeypot: bots fill the hidden field. Pretend success, forward nothing.
  if (text(body.fax, 200)) return json(200, { ok: true });

  const lead: Record<string, string> = {};
  const invalid: string[] = [];
  for (const [key, [required, max, check]] of Object.entries(FIELDS)) {
    const value = text(body[key], max + 1);
    if (value.length > max || (required && !value) || (value && check && !check(value)))
      invalid.push(key);
    lead[key] = value;
  }
  if (lead.industry === "Other" ? lead.otherIndustry!.length < 2 : lead.otherIndustry)
    invalid.push("otherIndustry");
  if (invalid.length) return json(422, { error: "Invalid fields", fields: invalid });

  const tracking = (body.tracking && typeof body.tracking === "object"
    ? body.tracking : {}) as Record<string, unknown>;
  for (const key of TRACKING_KEYS) lead[key] = text(tracking[key], 500);

  let pageUrl = "";
  try {
    const url = new URL(text(body.pageUrl, 2000));
    if (url.protocol === "https:" || url.protocol === "http:") pageUrl = url.toString();
  } catch {
    // Missing or malformed: send without it.
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.error("LEAD_WEBHOOK_URL is not set");
    return json(500, { error: "Lead capture is not configured" });
  }
  const [firstName = "", ...rest] = lead.name!.split(/\s+/);
  const { otherIndustry, ...fields } = lead;
  const payload = Object.fromEntries(Object.entries({
    ...fields,
    other_industry: otherIndustry,
    first_name: firstName,
    last_name: rest.join(" "),
    page_url: pageUrl,
    event_id: text(body.eventId, 100),
    submitted_at: new Date().toISOString(),
  }).map(([key, value]) => [key, asSheetText(value)]));
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
  } catch (error) {
    console.error("Lead webhook failed:", error);
    return json(502, { error: "Could not deliver lead" });
  }
  return json(200, { ok: true });
};
