/** Browser booking receipt, never an identity or an authorization token. */
export interface BookingReceipt {
  completedAt: number;
  date: string | null;
  timeRange: { start: string; end: string } | null;
  timezone: string | null;
  meetingType: "Google Meet";
}
export const BOOKING_COOKIE = "solvenek-booking";
export const BOOKING_TTL = 24 * 60 * 60;

export function validBookingReceipt(value: unknown, now = Date.now()): value is BookingReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  const keys = ["completedAt", "date", "timeRange", "timezone", "meetingType"];
  if (Object.keys(receipt).length !== keys.length || !keys.every(key => key in receipt)) return false;
  if (typeof receipt.completedAt !== "number" || !Number.isFinite(receipt.completedAt) ||
      receipt.completedAt > now || now - receipt.completedAt >= BOOKING_TTL * 1000) return false;
  if (receipt.date !== null && (typeof receipt.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(receipt.date) || !Number.isFinite(Date.parse(receipt.date)))) return false;
  if (receipt.timeRange !== null) {
    if (!receipt.timeRange || typeof receipt.timeRange !== "object") return false;
    const range = receipt.timeRange as Record<string, unknown>;
    if (Object.keys(range).length !== 2 || ![range.start, range.end].every(time => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return false;
  }
  if (receipt.timezone !== null) {
    if (typeof receipt.timezone !== "string" || receipt.timezone.length > 80) return false;
    try { new Intl.DateTimeFormat("en", { timeZone: receipt.timezone }); } catch { return false; }
  }
  return receipt.meetingType === "Google Meet";
}

export function decodeBookingReceipt(raw: string): BookingReceipt | null {
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw));
    return validBookingReceipt(value) ? value : null;
  } catch { return null; }
}

/** Calendly's completion message contains URIs, not the booked date/time. */
export function receiptFromScheduledEvent(data: unknown, now = Date.now()): BookingReceipt | null {
  if (!data || typeof data !== "object") return null;
  const message = data as { event?: unknown; payload?: { event?: { uri?: unknown }; invitee?: { uri?: unknown } } };
  if (message.event !== "calendly.event_scheduled" ||
      typeof message.payload?.event?.uri !== "string" || !message.payload.event.uri ||
      typeof message.payload?.invitee?.uri !== "string" || !message.payload.invitee.uri) return null;
  return { completedAt: now, date: null, timeRange: null, timezone: null, meetingType: "Google Meet" };
}
