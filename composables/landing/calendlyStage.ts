export type CalendlyStage = "date" | "time" | "details";

export const STAGE_SETTLE_MS = 125;
export interface StageMessage {
  event: string;
  at: number;
  payload?: { height?: unknown; event?: { uri?: string }; invitee?: { uri?: string } };
}
export interface CalendlyState {
  stage: CalendlyStage;
  height?: number;
  dateHeight?: number;
  detailsHeight?: number;
  timeHeights: number[];
  phase: "picker" | "details";
  pending?: { at: number; height?: number };
  booked: boolean;
  evidence: "initial" | "selection" | "picker" | "details-layout" | "fallback";
}
export function initialCalendlyState(): CalendlyState {
  return { stage: "date", phase: "picker", timeHeights: [], booked: false, evidence: "initial" };
}

/**
 * Measured at 558px / 348px iframe widths: picker 602; times 939 / 1249;
 * details 915 / 989; guests +117 / +138; empty required errors +98.
 * Details -> back emits event_type_viewed twice, then 767, then the final
 * time-list height ~700ms later. A view event means picker PHASE, not day.
 */
export function reduceCalendlyStage(state: CalendlyState, message: StageMessage): CalendlyState {
  const { event, payload, at } = message;
  if (event === "calendly.date_and_time_selected") {
    return { ...state, stage: "details", phase: "details", pending: undefined, detailsHeight: undefined, evidence: "selection" };
  }
  if (event === "calendly.event_type_viewed") {
    return { ...state, phase: "picker", pending: { at } };
  }
  if (event === "calendly.event_scheduled") {
    return payload?.event?.uri && payload?.invitee?.uri ? { ...state, booked: true } : state;
  }
  if (event === "calendly.page_height") {
    const height = parseInt(String(payload?.height ?? ""), 10);
    // Ignore Calendly's 26px/2px boot frames, not just their stage inference.
    if (!Number.isFinite(height) || height < 320) return state;
    if (state.height !== undefined && Math.abs(height - state.height) < 4 && !state.pending
      && !(state.phase === "details" && state.detailsHeight === undefined)) return state;
    return {
      ...state, height,
      dateHeight: state.dateHeight ?? (state.stage === "date" && state.phase === "picker" ? height : undefined),
      pending: { at, height },
    };
  }
  if (event !== "settle" || !state.pending || at - state.pending.at < STAGE_SETTLE_MS) return state;
  const height = state.pending.height;
  const settled = { ...state, pending: undefined };
  if (height === undefined) {
    // A back event without a resize still leaves details. Idle time alone
    // never changes the last known stage.
    return state.phase === "picker" && state.stage === "details"
      ? { ...settled, stage: "time", evidence: "picker" } : settled;
  }
  if (state.phase === "details") {
    if (state.detailsHeight === undefined) return { ...settled, detailsHeight: height };
    const difference = height - state.detailsHeight;
    // A known time-list height is ambiguous even if close to details. Do not
    // mistake that collision for a small font/validation layout change.
    const matchesTime = Math.abs(difference) >= 4 && state.timeHeights.some((value) => Math.abs(height - value) < 4);
    if (!matchesTime && Math.abs(difference - 20) < 4) {
      return { ...settled, detailsHeight: height, evidence: "details-layout" };
    }
    // Only measured guest/validation combinations are trusted, with the same
    // sub-4px tolerance as the wrapper. Unknown changes use the fallback.
    if (!matchesTime && [0, 98, 117, 138, 215, 236].some((delta) => Math.abs(difference - delta) < 4)) {
      return { ...settled, evidence: "details-layout" };
    }
    // Unknown third-party layout: show neutral step 2, not stale details.
    return { ...settled, stage: "time", phase: "picker", evidence: "fallback" };
  }
  if (state.dateHeight === undefined) return settled;
  const growth = height - state.dateHeight;
  // One extra calendar week is ~48px. The 64..90px hysteresis band avoids
  // mistaking it for a time list. Six-row months are tested synthetically.
  const stage = growth <= 64 ? "date" : growth >= 90 ? "time" : state.stage === "details" ? "time" : state.stage;
  const timeHeights = stage === "time" && !state.timeHeights.some((value) => Math.abs(height - value) < 4)
    ? [...state.timeHeights, height] : state.timeHeights;
  return { ...settled, stage, timeHeights, evidence: "picker" };
}
