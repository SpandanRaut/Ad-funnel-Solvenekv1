import type { Ref } from "vue";

export function useLegalMotion(root: Ref<HTMLElement | undefined>) {
  let dispose = () => {};
  onMounted(() => {
    if (!root.value) return;
    const el = root.value;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const frames = new Set<number>();
    function frame(fn: FrameRequestCallback) {
      const id = requestAnimationFrame(time => { frames.delete(id); fn(time); });
      frames.add(id);
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.remove("legal-pending"); target.classList.add("legal-visible");
        observer.unobserve(target);
        target.querySelectorAll<HTMLElement>("[data-legal-count]").forEach(number => {
          if (reduced.matches) return;
          const value = Number(number.dataset.legalCount);
          const start = performance.now();
          const count = (time: number) => {
            const progress = Math.min(1, (time - start) / 1100);
            number.textContent = `${Math.round(value * (1 - (1 - progress) ** 3))}`;
            if (progress < 1) frame(count);
          };
          frame(count);
        });
      }
    }, { threshold: .12 });
    el.querySelectorAll<HTMLElement>("[data-legal-reveal]").forEach(target => {
      if (!reduced.matches && target.getBoundingClientRect().top >= innerHeight) target.classList.add("legal-pending");
      observer.observe(target);
    });
    const timeline = el.querySelector<HTMLElement>("[data-timeline]");
    let scheduled = false;
    const update = () => {
      scheduled = false;
      if (!timeline) return;
      const box = timeline.getBoundingClientRect();
      const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .85 - box.top) / (box.height + innerHeight * .15)));
      timeline.style.setProperty("--progress", `${progress}`);
    };
    const scroll = () => { if (!scheduled) { scheduled = true; frame(update); } };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    scroll();
    dispose = () => { observer.disconnect(); frames.forEach(cancelAnimationFrame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  });
  onBeforeUnmount(() => dispose());
}
