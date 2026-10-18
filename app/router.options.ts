import type { RouterConfig } from "@nuxt/schema";

let navigation = 0;
export default <RouterConfig>{
  async scrollBehavior(to, from, savedPosition) {
    const current = ++navigation;
    if (savedPosition) return { ...savedPosition, behavior: "instant" };
    if (!to.hash) return to.path === from.path ? false : { top: 0, left: 0, behavior: "instant" };
    let id: string;
    try { id = decodeURIComponent(to.hash.slice(1)); } catch { return false; }
    // Page transitions, hydration, and the error boundary can all defer the target.
    const deadline = Date.now() + 5000;
    let target: HTMLElement | null = null;
    while (current === navigation && Date.now() < deadline) {
      target = document.getElementById(id);
      if (target && document.querySelector("main")?.contains(target) && !target.closest(".page-leave-active")) break;
      target = null;
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    if (!target || current !== navigation) return false;
    await document.fonts.ready;
    // Let the page transition and initial layout observers settle before
    // calculating an absolute position (the calendar can resize above FAQ).
    let previous = -1;
    let stableSince = performance.now();
    const settling = performance.now() + 2000;
    while (current === navigation && performance.now() < settling) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const top = target.getBoundingClientRect().top + window.scrollY;
      if (Math.abs(top - previous) > .5) stableSince = performance.now();
      if (performance.now() - stableSince >= 200) break;
      previous = top;
    }
    if (!target.isConnected || current !== navigation) return false;
    const header = document.querySelector<HTMLElement>(".site-header");
    const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return {
      el: target,
      top: offset,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    };
  },
};
