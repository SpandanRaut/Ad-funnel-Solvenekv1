import { ref, watch, onMounted, onBeforeUnmount, type Ref } from "vue";
import type { CalendlyStage } from "./useCalendlyStage";

/** Measure natural block heights even while their grid row is collapsed. */
export function useAdaptiveCalendar(left: Ref<HTMLElement | undefined>, stage: Ref<CalendlyStage>, cardHeight: Ref<number>) {
  const showSupport = ref(true);
  const showTopics = ref(false);
  const showQuotes = ref(false);
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let desktop: MediaQueryList | undefined;
  function measure() {
    frame = 0;
    const root = left.value;
    if (root && desktop?.matches) {
      // If the supporting column itself exceeds the viewport, let its top
      // scroll away before pinning its bottom. Otherwise sticky top strands
      // the last topic/quote below the screen for the entire tall time list.
      const header = parseFloat(getComputedStyle(root).getPropertyValue("--landing-header-height")) || 100;
      root.style.top = `${Math.min(header + 24, window.innerHeight - root.offsetHeight - 24)}px`;
    } else root?.style.removeProperty("top");
    if (!root || !desktop?.matches || stage.value === "date") {
      showSupport.value = true; showTopics.value = false; showQuotes.value = false;
      return;
    }
    const size = (name: string) => root.querySelector<HTMLElement>(`[data-measure="${name}"]`)?.scrollHeight ?? 0;
    const anchor = size("anchor");
    const support = size("support") + 24;
    const topics = size("topics") + 28;
    const quotes = size("quotes") + 24;
    const available = cardHeight.value;
    const details = stage.value === "details";
    const canShowTopics = anchor + topics + (details ? 0 : support) <= available;
    showSupport.value = !details || !canShowTopics;
    showTopics.value = canShowTopics;
    showQuotes.value = details && canShowTopics && anchor + topics + quotes <= available;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
  watch([stage, cardHeight], schedule, { flush: "post" });
  onMounted(() => {
    desktop = matchMedia("(min-width: 1024px)");
    desktop.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    observer = new ResizeObserver(schedule);
    if (left.value) observer.observe(left.value);
    left.value?.querySelectorAll("[data-measure]").forEach((el) => observer!.observe(el));
    schedule();
  });
  onBeforeUnmount(() => { observer?.disconnect(); desktop?.removeEventListener("change", schedule); window.removeEventListener("resize", schedule); cancelAnimationFrame(frame); });
  return { showSupport, showTopics, showQuotes };
}
