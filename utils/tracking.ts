declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type PixelEvent = "PageView" | "Lead" | "Schedule";

/**
 * Sends a Meta Pixel standard event. `eventId` lets a future Conversions API
 * integration deduplicate the event. Does nothing when the pixel is not configured.
 */
export function track(
  event: PixelEvent,
  eventId: string,
  params: Record<string, unknown> = {},
) {
  // The provider-agnostic layer owns page views and scheduled conversions.
  // Keep this legacy form adapter without forwarding identity or booking IDs.
  void eventId; void params;
  if (import.meta.client && event === "Lead") useAnalytics().track("application_submit");
}

/** Like `track`, but sends the event only once per browser session for `key`. */
export function trackOnce(
  key: string,
  event: PixelEvent,
  eventId: string,
  params: Record<string, unknown> = {},
) {
  const storageKey = `solvenek-tracked:${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // Storage unavailable: still send the event.
  }
  track(event, eventId, params);
}
