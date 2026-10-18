/** The provider event-name mapping lives here for the ad team. */
export const analyticsEvents = {
  page_view: { ga: "page_view", meta: "PageView", standard: true },
  cta_click: { ga: "cta_click", meta: "cta_click", standard: false },
  conditions_link_click: { ga: "conditions_link_click", meta: "conditions_link_click", standard: false },
  calendly_stage: { ga: "calendly_stage", meta: "calendly_stage", standard: false },
  faq_toggle: { ga: "faq_toggle", meta: "faq_toggle", standard: false },
  booking_complete: { ga: "generate_lead", meta: "Schedule", standard: true },
  confirmed_checklist: { ga: "confirmed_checklist", meta: "confirmed_checklist", standard: false },
  confirmed_video: { ga: "confirmed_video", meta: "confirmed_video", standard: false },
  // Compatibility with the unused legacy application form; no identity payload.
  application_submit: { ga: "generate_lead", meta: "Lead", standard: true },
} as const;
export type AnalyticsEvent = keyof typeof analyticsEvents;
export interface AnalyticsMessage { name: AnalyticsEvent; params: Record<string, string | number> }

export function privacyAllowsAnalytics(signals: { globalPrivacyControl?: boolean; doNotTrack?: string | null; msDoNotTrack?: string | null }, windowDnt?: string | null) {
  const dnt = signals.doNotTrack || signals.msDoNotTrack || windowDnt;
  return signals.globalPrivacyControl !== true && !["1", "yes"].includes(String(dnt).toLowerCase());
}

/** Allowlist values, not just field names: never accept arbitrary booking data. */
export function cleanAnalyticsEvent(name: unknown, params: unknown = {}): AnalyticsMessage | null {
  if (typeof name !== "string" || !Object.hasOwn(analyticsEvents, name)) return null;
  const input = params && typeof params === "object" ? params as Record<string, unknown> : {};
  const safe: Record<string, string | number> = {};
  if (name === "confirmed_checklist") {
    if (!["invite", "calendar", "video"].includes(String(input.item)) || !Number.isInteger(input.completed_count) || Number(input.completed_count) < 0 || Number(input.completed_count) > 3) return null;
    safe.item = String(input.item);
    safe.completed_count = Number(input.completed_count);
  }
  if (name === "confirmed_video") {
    if (!["play", "complete"].includes(String(input.action))) return null;
    safe.action = String(input.action);
  }
  if (name === "page_view") safe.page_path = ["/", "/conditions", "/privacy", "/confirmed"].includes(String(input.page_path)) ? String(input.page_path) : "/404";
  if (name === "cta_click") {
    if (!["header", "final", "sticky", "conditions"].includes(String(input.location))) return null;
    safe.location = String(input.location);
  }
  if (name === "calendly_stage") {
    if (!["day", "time", "details"].includes(String(input.stage))) return null;
    safe.stage = String(input.stage);
  }
  if (name === "faq_toggle") {
    if (!Number.isInteger(input.index) || Number(input.index) < 0 || Number(input.index) > 100) return null;
    safe.index = Number(input.index);
  }
  return { name: name as AnalyticsEvent, params: safe };
}
