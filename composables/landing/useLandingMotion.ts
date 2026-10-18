import { mountMeasuredPath } from "../useMeasuredPath";
import { onMounted, onBeforeUnmount } from "vue";

/** Presentation only. All observers and pointer listeners belong to this page. */
export function useLandingMotion() {
  let dispose = () => {};
  onMounted(() => {
    const root = document.querySelector<HTMLElement>(".premium-landing");
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cleanups: (() => void)[] = [];
    const frames = new Set<number>();
    function frame(callback: FrameRequestCallback) {
      const id = requestAnimationFrame((time) => { frames.delete(id); callback(time); });
      frames.add(id);
      return id;
    }
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-visible");
        reveal.unobserve(el);
        const number = el.querySelector<HTMLElement>("[data-count]");
        if (!number || reduced.matches) continue;
        const value = Number(number.dataset.count);
        const start = performance.now();
        function count(time: number) {
          const progress = Math.min(1, (time - start) / 1400);
          number!.textContent = "$" + Math.round(value * (1 - (1 - progress) ** 4)).toLocaleString("en-US");
          if (progress < 1) frame(count);
        }
        frame(count);
      }
    }, { threshold: 0.12 });
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top >= window.innerHeight && !reduced.matches) el.classList.add("will-reveal");
      reveal.observe(el);
    });
    const calendar = root.querySelector<HTMLElement>(".calendar-stage")!;
    const sticky = root.querySelector<HTMLElement>(".mobile-calendar-cta")!;
    const visibility = new IntersectionObserver(([entry]) => {
      calendar.classList.toggle("is-offscreen", !entry.isIntersecting);
      sticky.classList.toggle("is-shown", !entry.isIntersecting);
      sticky.inert = entry.isIntersecting;
    }, { threshold: 0 });
    visibility.observe(calendar);
    const process = root.querySelector<HTMLElement>(".process-story");
    const disposePath = process ? mountMeasuredPath(process, ".story-card") : () => {};
    const layout = new ResizeObserver(() => {
      const header = root.querySelector<HTMLElement>(".site-header");
      root.style.setProperty("--landing-header-height", `${header?.offsetHeight ?? 100}px`);
    });
    const hero = root.querySelector(".hero");
    const header = root.querySelector(".site-header");
    if (hero) layout.observe(hero);
    if (header) layout.observe(header);
    root.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((el) => {
      let pending = false;
      let hovering = false;
      let pointer: PointerEvent;
      const move = (event: PointerEvent) => {
        if (!fine.matches || reduced.matches) return;
        hovering = true;
        pointer = event;
        if (pending) return;
        pending = true;
        frame(() => {
          pending = false;
          if (!hovering) return;
          const box = el.getBoundingClientRect();
          const x = pointer.clientX - box.left;
          const y = pointer.clientY - box.top;
          el.style.setProperty("--pointer-x", `${x}px`);
          el.style.setProperty("--pointer-y", `${y}px`);
        });
      };
      const leave = () => { hovering = false; };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
    });
    dispose = () => {
      reveal.disconnect(); visibility.disconnect(); layout.disconnect();
      disposePath();
      frames.forEach(cancelAnimationFrame); cleanups.forEach((cleanup) => cleanup());
    };
  });
  onBeforeUnmount(() => dispose());
}
