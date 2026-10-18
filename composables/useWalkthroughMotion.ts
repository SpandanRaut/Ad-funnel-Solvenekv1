import type { Ref } from "vue";

/** Intersection-driven focus and one-shot illustrations; no scroll/layout loop. */
export function useWalkthroughMotion(root: Ref<HTMLElement | undefined>, active: Ref<number>) {
  let dispose = () => {};
  onMounted(() => {
    const el = root.value;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const frames = new Set<number>();
    const visible = new Set<Element>();
    const animations = new Map<HTMLElement, { elapsed: number; previous: number; value: number }>();
    let countFrame = 0;
    const frame = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame(t => { frames.delete(id); fn(t); }); frames.add(id); return id;
    };
    function tick(time: number) {
      countFrame = 0;
      for (const [number, data] of animations) {
        if (!document.hidden && visible.has(number.closest("[data-count-region]")!)) data.elapsed += time - data.previous;
        data.previous = time;
        const progress = reduced.matches ? 1 : Math.min(1, data.elapsed / 1200);
        number.textContent = String(Math.round(data.value * (1 - (1 - progress) ** 3)));
        if (progress === 1) animations.delete(number);
      }
      if ([...animations.keys()].some(number => visible.has(number.closest("[data-count-region]")!)) && !document.hidden) countFrame = frame(tick);
    }
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        target.classList.toggle("motion-paused", !entry.isIntersecting);
        if (entry.isIntersecting) {
          visible.add(target);
          animations.forEach((data,number) => { if (target.contains(number)) data.previous = performance.now(); });
        } else visible.delete(target);
        if (!entry.isIntersecting || target.dataset.seen) continue;
        target.dataset.seen = "true";
        target.classList.add("in-view");
        if (target.matches(".condition-row")) target.classList.add("visual-playing");
        if (reduced.matches) continue;
        target.querySelectorAll<HTMLElement>("[data-ui-count]").forEach(number => {
          animations.set(number, { elapsed: 0, previous: performance.now(), value: Number(number.dataset.uiCount) });
        });
      }
      if (animations.size && !countFrame && !document.hidden) countFrame = frame(tick);
    }, { threshold: .18 });
    el.querySelectorAll<HTMLElement>("[data-count-region], .condition-row, .conditions-stage, .conditions-closing, .journey-bridge").forEach(target => visibility.observe(target));
    let focus: IntersectionObserver;
    const observeCentre = () => {
      focus?.disconnect();
      focus = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.isIntersecting);
        if (entry) active.value = Number((entry.target as HTMLElement).dataset.step);
      }, { rootMargin: `${-Math.floor(innerHeight / 2)}px 0px ${1 - Math.ceil(innerHeight / 2)}px 0px`, threshold: 0 });
      el.querySelectorAll(".condition-row").forEach(item => focus.observe(item));
    };
    observeCentre();
    window.addEventListener("resize", observeCentre);
    const sync = () => {
      el.classList.toggle("tab-hidden", document.hidden);
      if (!document.hidden && animations.size && !countFrame) {
        animations.forEach(data => { data.previous = performance.now(); });
        countFrame = frame(tick);
      }
    };
    document.addEventListener("visibilitychange", sync);
    const ring = el.querySelector<HTMLElement>("[data-ring]");
    let tiltPending = false;
    let pointer = { x: 0, y: 0 };
    const tilt = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || event.pointerType === "touch") return;
      const rect = ring!.getBoundingClientRect();
      pointer = { x: Math.max(-5,Math.min(5,(event.clientY - rect.top - rect.height / 2) / rect.height * -10)), y: Math.max(-5,Math.min(5,(event.clientX - rect.left - rect.width / 2) / rect.width * 10)) };
      if (tiltPending) return;
      tiltPending = true;
      frame(() => { tiltPending = false; ring!.style.setProperty("--tilt-x", `${pointer.x}deg`); ring!.style.setProperty("--tilt-y", `${pointer.y}deg`); });
    };
    const reset = () => { ring?.style.setProperty("--tilt-x","0deg"); ring?.style.setProperty("--tilt-y","0deg"); };
    ring?.addEventListener("pointermove",tilt); ring?.addEventListener("pointerleave",reset);
    el.classList.add("motion-ready");
    sync();
    dispose = () => { visibility.disconnect(); focus.disconnect(); frames.forEach(cancelAnimationFrame); document.removeEventListener("visibilitychange",sync); window.removeEventListener("resize",observeCentre); ring?.removeEventListener("pointermove",tilt); ring?.removeEventListener("pointerleave",reset); };
  });
  onBeforeUnmount(() => dispose());
}
