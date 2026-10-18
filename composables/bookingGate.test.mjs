import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_TTL, decodeBookingReceipt, receiptFromScheduledEvent, validBookingReceipt } from "./bookingGate.ts";

const now = Date.now();
const event = { event: "calendly.event_scheduled", payload: { event: { uri: "test-event" }, invitee: { uri: "test-invitee", name: "Private name", email: "private@example.test", phone: "+15555555555" } } };
const receipt = receiptFromScheduledEvent(event, now);
test("completed event creates a valid receipt without identity or URI fields", () => {
  assert.equal(validBookingReceipt(receipt, now), true);
  assert.deepEqual(receipt, { completedAt: now, date: null, timeRange: null, timezone: null, meetingType: "Google Meet" });
  assert.deepEqual(decodeBookingReceipt(encodeURIComponent(JSON.stringify(receipt))), receipt);
});
test("missing, malformed, expired, future, and identity-bearing receipts are rejected", () => {
  for (const value of [undefined, null, false, [], {}, "true", { ...receipt, completedAt: now - BOOKING_TTL * 1000 }, { ...receipt, completedAt: now + 1 }, { ...receipt, completedAt: NaN }, { ...receipt, email: "private@example.test" }, { ...receipt, date: "bad" }, { ...receipt, timeRange: { start: "25:00", end: "10:00" } }, { ...receipt, timezone: "bad-zone" }]) {
    assert.equal(validBookingReceipt(value, now), false);
  }
  for (const value of ["%", "%E0%A4%A", "{", "null", "true", "%7B%22completedAt%22%3A1%7D"]) assert.equal(decodeBookingReceipt(value), null);
});
test("date/time detail fields validate independently of the session store", () => {
  assert.equal(validBookingReceipt({ ...receipt, date: "2026-10-19", timeRange: { start: "09:00", end: "09:30" }, timezone: "Asia/Kathmandu" }, now), true);
});
test("selection, incomplete messages and invalid payloads never create a receipt", () => {
  for (const value of [null, {}, { ...event, event: "calendly.date_and_time_selected" }, { ...event, payload: {} }, { ...event, payload: { event: { uri: 123 }, invitee: { uri: "test" } } }]) assert.equal(receiptFromScheduledEvent(value, now), null);
});
test("a later booking overwrites the timestamp without retaining previous payload data", () => {
  const updated = receiptFromScheduledEvent(event, now + 1000);
  assert.equal(updated.completedAt, now + 1000);
  assert.equal(validBookingReceipt(updated, now + 1000), true);
  assert.deepEqual(Object.keys(updated), Object.keys(receipt));
});
