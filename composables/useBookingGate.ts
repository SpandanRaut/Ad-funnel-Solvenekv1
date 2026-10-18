import { BOOKING_COOKIE, BOOKING_TTL, decodeBookingReceipt, receiptFromScheduledEvent, validBookingReceipt } from "./bookingGate";
import type { BookingReceipt } from "./bookingGate";

export function useBookingGate() {
  const receipt = useCookie<BookingReceipt | null>(BOOKING_COOKIE, {
    path: "/",
    sameSite: "lax",
    maxAge: BOOKING_TTL,
    decode: decodeBookingReceipt,
    default: () => null,
  });
  const completed = computed(() => validBookingReceipt(receipt.value));
  async function complete(data: unknown) {
    const value = receiptFromScheduledEvent(data);
    if (!value) return;
    receipt.value = value;
    // Flush the cookie before route middleware reads it on the next navigation.
    await nextTick();
  }
  return { receipt, completed, complete };
}
