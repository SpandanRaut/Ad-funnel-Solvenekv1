import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { initialCalendlyState, reduceCalendlyStage, STAGE_SETTLE_MS, type StageMessage } from "./calendlyStage";
export type { CalendlyStage } from "./calendlyStage";

/** Transport/timing only; stage decisions live in the pure reducer. */
export function useCalendlyStage(embed: Ref<HTMLElement | undefined>) {
  let state = initialCalendlyState();
  const stage = ref(state.stage);
  const height = ref<number>();
  const booked = ref(false);
  let frame = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function dispatch(message: StageMessage) {
    state = reduceCalendlyStage(state, message);
    stage.value = state.stage;
    booked.value = state.booked;
    if (!frame && height.value !== state.height) {
      frame = requestAnimationFrame(() => { frame = 0; height.value = state.height; });
    }
    clearTimeout(timer);
    if (state.pending) {
      timer = setTimeout(() => dispatch({ event: "settle", at: performance.now() }), STAGE_SETTLE_MS + 1);
    }
  }
  function receive(message: MessageEvent) {
    if (message.origin !== "https://calendly.com") return;
    const iframe = embed.value?.querySelector("iframe");
    if (!iframe || message.source !== iframe.contentWindow) return;
    const { event, payload } = message.data || {};
    if (typeof event === "string" && event.startsWith("calendly.")) dispatch({ event, payload, at: performance.now() });
  }
  onMounted(() => window.addEventListener("message", receive));
  onBeforeUnmount(() => {
    window.removeEventListener("message", receive);
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  });
  return { stage, height, booked };
}
