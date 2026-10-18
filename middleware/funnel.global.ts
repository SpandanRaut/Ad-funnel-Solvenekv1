export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  const lower = path.toLowerCase();
  if (lower === "/schedule" || lower.startsWith("/schedule/")) {
    return navigateTo("/", { replace: true, redirectCode: 301 });
  }
  if (!["/", "/confirmed", "/conditions", "/privacy"].includes(lower)) {
    throw createError({ statusCode: 404, fatal: import.meta.client });
  }
  if (lower === "/confirmed") {
    const gate = useBookingGate();
    if (!gate.completed.value) {
      gate.receipt.value = null;
      return navigateTo("/", { replace: true, redirectCode: 302 });
    }
  }
  if (to.path !== lower) {
    return navigateTo({ path: lower, query: to.query, hash: to.hash }, { replace: true, redirectCode: 301 });
  }
  if (import.meta.client) {
    // Browsers inherit fragments across HTTP redirects. Drop unknown anchors
    // on the public route rather than retaining /confirmed#x as /#x.
    if (lower === "/" && to.hash && !["#faq", "#approach", "#application", "#calendar", "#book"].includes(to.hash)) {
      return navigateTo({ path: "/", query: to.query }, { replace: true });
    }
    const store = useFunnelStore();
    store.hydrate();
    store.captureTracking(to.query);
    const missing = Object.entries(store.tracking).filter(([key]) => !(key in to.query));
    if (missing.length) {
      return navigateTo({ path: to.path, hash: to.hash, query: { ...to.query, ...Object.fromEntries(missing) } }, { replace: true });
    }
  }
});
