import type { Application } from "~/stores/funnel";

const LEAD_ENDPOINT = "/.netlify/functions/lead";

/** Sends the application to the lead function; throws unless it was accepted. */
export async function submitApplication(
  application: Application,
  extra: { tracking: Record<string, string>; eventId: string; fax: string },
) {
  const { companyName, ...fields } = application;
  const response = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    // Finishes even if the visitor closes the tab right after submitting.
    keepalive: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...fields,
      name: fields.name.trim(),
      email: fields.email.trim(),
      company: companyName.trim(),
      // No longer asked; sent empty so the Sheet columns stay aligned.
      budget: "",
      industry: "",
      otherIndustry: "",
      pageUrl: window.location.href,
      ...extra,
    }),
  });
  if (!response.ok) throw new Error(`Lead endpoint responded ${response.status}`);
}
