import { defineStore } from "pinia";
export interface Application {
  name: string;
  email: string;
  phone: string;
  companyName: string;
}
/** Calendly `event_scheduled` payload: URIs only, no date or time. */
export interface Booking {
  eventUri: string;
  inviteeUri: string;
}
export const trackingKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;
export const useFunnelStore = defineStore("funnel", {
  state: () => ({
    application: null as Application | null,
    /** True once the lead function accepted the current application. */
    submitted: false,
    booking: null as Booking | null,
    tracking: {} as Record<string, string>,
    hydrated: false,
  }),
  actions: {
    hydrate() {
      if (this.hydrated || import.meta.server) return;
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("solvenek-funnel") || "{}",
        );
        this.application = saved.application ? {
          name: saved.application.name || "",
          email: saved.application.email || "",
          phone: saved.application.phone || "",
          companyName: (saved.application.companyName || "").trim(),
        } : null;
        // Bookings saved by the old mock calendar have no inviteeUri.
        this.submitted = !!saved.submitted;
        this.booking = saved.booking?.inviteeUri ? saved.booking : null;
        this.tracking = saved.tracking || {};
      } catch {
        try {
          sessionStorage.removeItem("solvenek-funnel");
        } catch {
          // Storage unavailable.
        }
      }
      this.hydrated = true;
    },
    persist() {
      if (import.meta.server) return;
      try {
        sessionStorage.setItem(
          "solvenek-funnel",
          JSON.stringify({
            application: this.application,
            submitted: this.submitted,
            booking: this.booking,
            tracking: this.tracking,
          }),
        );
      } catch {
        // Storage blocked (private mode, quotas): keep the in-memory state.
      }
    },
    captureTracking(query: Record<string, unknown>) {
      const found = Object.fromEntries(
        trackingKeys
          .filter((key) => typeof query[key] === "string" && query[key])
          .map((key) => [key, query[key] as string]),
      );
      if (!Object.keys(found).length) return;
      // A new campaign click replaces the previous attribution set.
      this.tracking = found;
      this.persist();
    },
    setApplication(value: Application) {
      this.application = value;
      this.submitted = true;
      this.booking = null;
      this.persist();
    },
    setBooking(value: Booking) {
      this.booking = value;
      this.persist();
    },
  },
});
