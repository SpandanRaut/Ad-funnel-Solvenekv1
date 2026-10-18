// v-reveal: fades a section up once as it scrolls into view. Content is
// visible in the server-rendered HTML; only sections still below the fold
// after hydration are hidden, so nothing on screen flashes or shifts.
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined;
  nuxtApp.vueApp.directive<HTMLElement, boolean | undefined>("reveal", {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (binding.value === false || !("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        el.getBoundingClientRect().top < window.innerHeight) return;
      observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("reveal-pending");
          observer!.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -8% 0px" });
      el.classList.add("reveal-pending");
      // Hide instantly, then enable the transition for the reveal itself.
      void el.offsetWidth;
      el.classList.add("reveal-scroll");
      observer.observe(el);
    },
    beforeUnmount(el) {
      observer?.unobserve(el);
    },
  });
});
