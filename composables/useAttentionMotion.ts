/** One page-view timeline. Adaptive calendar changes never restart it. */
export function useAttentionMotion() {
  let dispose = () => {};
  onMounted(() => {
    const root = document.querySelector<HTMLElement>(".premium-landing");
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const frames = new Set<number>();
    const visible = new Set<Element>();
    let resumeCount: (() => void) | undefined;
    const started = performance.now();
    const later = (fn: () => void, delay: number) => {
      const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay);
      timers.add(timer);
    };
    const sync = () => {
      root.querySelectorAll<HTMLElement>(".guarantee-strip, .proof-line, .calendar-stage").forEach(el => {
        el.classList.toggle("attention-paused", document.hidden || !visible.has(el));
      });
      const proof = root.querySelector(".proof-line")!;
      if (!document.hidden && visible.has(proof) && resumeCount) {
        const resume = resumeCount; resumeCount = undefined; resume();
      }
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
        const el = entry.target as HTMLElement;
        if (!entry.isIntersecting || el.dataset.attentionStarted) continue;
        el.dataset.attentionStarted = "true";
        const delay = Number(el.dataset.attentionDelay);
        later(() => {
          el.classList.add("attention-on");
          if (!el.matches(".proof-line") || reduced.matches) return;
          const money = el.querySelector<HTMLElement>('[data-proof-value="money"]')!;
          const weeks = el.querySelector<HTMLElement>('[data-proof-value="weeks"]')!;
          el.classList.add("proof-counting");
          let elapsed = 0;
          let previous = performance.now();
          const count = (time: number) => {
            if (!document.hidden && visible.has(el)) elapsed += time - previous;
            previous = time;
            const progress = Math.min(1, elapsed / 700);
            const eased = 1 - (1 - progress) ** 3;
            money.dataset.value = `$${Math.round(17000 * eased).toLocaleString("en-US")}`;
            weeks.dataset.value = String(Math.round(11 * eased));
            if (progress < 1) {
              if (!document.hidden && visible.has(el)) {
                const id = requestAnimationFrame(t => { frames.delete(id); count(t); }); frames.add(id);
              } else resumeCount = () => { previous = performance.now(); count(previous); };
            } else { el.classList.remove("proof-counting"); el.classList.add("proof-complete"); }
          };
          count(performance.now());
        }, reduced.matches ? 0 : Math.max(0, 700 + delay - (performance.now() - started)));
      }
      sync();
    }, { threshold: .15 });
    root.querySelectorAll<HTMLElement>(".guarantee-strip, .proof-line, .calendar-stage").forEach(el => {
      el.dataset.attentionDelay = el.matches(".guarantee-strip") ? "900" : el.matches(".proof-line") ? "1700" : "2400";
      observer.observe(el);
    });
    document.addEventListener("visibilitychange", sync);
    dispose = () => { observer.disconnect(); timers.forEach(clearTimeout); frames.forEach(cancelAnimationFrame); document.removeEventListener("visibilitychange", sync); };
  });
  onBeforeUnmount(() => dispose());
}
