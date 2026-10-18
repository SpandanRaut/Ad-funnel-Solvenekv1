import { cleanAnalyticsEvent, privacyAllowsAnalytics } from "./analyticsEvents";
import type { AnalyticsEvent, AnalyticsMessage } from "./analyticsEvents";

declare global { interface Window { __solvenekAnalytics?: (message: AnalyticsMessage) => void; doNotTrack?: string | null } }
export function useAnalytics() {
  const config = useRuntimeConfig().public;
  function track(name: AnalyticsEvent, params: Record<string, unknown> = {}) {
    if (import.meta.server || !privacyAllowsAnalytics(navigator, window.doNotTrack)) return;
    const message = cleanAnalyticsEvent(name, params);
    if (!message) return;
    if (import.meta.dev) {
      if (config.analyticsDebug === "1") console.info("[analytics]", message.name, message.params);
      return;
    }
    try { window.__solvenekAnalytics?.(message); } catch {
      // Optional telemetry must never interrupt booking or navigation.
    }
  }
  return { track };
}
