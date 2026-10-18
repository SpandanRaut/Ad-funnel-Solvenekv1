import { analyticsEvents, cleanAnalyticsEvent, privacyAllowsAnalytics } from "~/composables/analyticsEvents";
import type { AnalyticsMessage } from "~/composables/analyticsEvents";

type Pixel = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push?: Pixel; loaded?: boolean; version?: string };
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[]; _fbq?: Pixel };

export default defineNuxtPlugin((nuxt) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();
  const analytics = useAnalytics();
  const browser = window as AnalyticsWindow;
  const ga = /^G-[A-Z0-9]+$/i.test(config.gaId) ? config.gaId : "";
  const pixel = /^\d+$/.test(config.metaPixelId) ? config.metaPixelId : "";
  const allowed = () => privacyAllowsAnalytics(navigator, window.doNotTrack);
  let ready = false;
  const queue: AnalyticsMessage[] = [];
  function send(message: AnalyticsMessage) {
    if (!allowed()) return;
    const mapping = analyticsEvents[message.name];
    if (ga && browser.gtag) {
      const path = String(message.params.page_path || router.currentRoute.value.path);
      const safePath = ["/", "/conditions", "/privacy", "/confirmed"].includes(path) ? path : "/404";
      // Explicitly replace automatic URLs/referrers to exclude query strings and fragments.
      browser.gtag("event", mapping.ga, { ...message.params, page_location: `${location.origin}${safePath}`, page_referrer: "" });
    }
    if (pixel && window.fbq) window.fbq(mapping.standard ? "track" : "trackCustom", mapping.meta, message.params);
  }
  if (!import.meta.dev && (ga || pixel)) {
    window.__solvenekAnalytics = raw => {
      if (!allowed()) return;
      const message = cleanAnalyticsEvent(raw.name, raw.params);
      if (!message) return;
      if (ready) send(message);
      else if (queue.length < 100) queue.push(message);
    };
  }
  const script = (src: string) => {
    if (!allowed()) return;
    const element = document.createElement("script");
    element.src = src; element.async = true;
    document.head.appendChild(element);
  };
  function load() {
    if (import.meta.dev || !allowed() || (!ga && !pixel)) { queue.length = 0; return; }
    if (ga) {
      browser.dataLayer ||= [];
      // gtag consumes an Arguments object, rather than a plain dataLayer event.
      // eslint-disable-next-line prefer-rest-params
      browser.gtag = function () { browser.dataLayer!.push(arguments); };
      browser.gtag("js", new Date());
      const safePath = cleanAnalyticsEvent("page_view", { page_path: router.currentRoute.value.path })!.params.page_path;
      browser.gtag("config", ga, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: `${location.origin}${safePath}`, page_referrer: "" });
      script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`);
    }
    if (pixel) {
      const fbq: Pixel = Object.assign((...args: unknown[]) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
      fbq.push = fbq;
      window.fbq = fbq; browser._fbq = fbq;
      fbq("set", "autoConfig", false, pixel);
      fbq("init", pixel);
      script("https://connect.facebook.net/en_US/fbevents.js");
    }
    ready = true;
    queue.splice(0).forEach(send);
  }
  let lastView = "";
  const pageView = (path: string, key = path) => {
    if (lastView === key) return;
    lastView = key;
    analytics.track("page_view", { page_path: path });
  };
  router.afterEach((to, from, failure) => { if (!nuxt.isHydrating && !failure && to.fullPath !== from.fullPath) pageView(to.path, to.fullPath); });
  nuxt.hook("app:error", () => { if (!nuxt.isHydrating) pageView("/404"); });
  nuxt.hook("app:error:cleared", () => pageView(router.currentRoute.value.path, router.currentRoute.value.fullPath));
  function click(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const target = event.target;
    const cta = target.closest(".header-cta, .landing-final button, .mobile-calendar-cta button, .conditions-closing .primary-button");
    if (cta) analytics.track("cta_click", { location: cta.matches(".header-cta") ? "header" : cta.closest(".conditions-closing") ? "conditions" : cta.closest(".mobile-calendar-cta") ? "sticky" : "final" });
    if (target.closest("a.conditions")) analytics.track("conditions_link_click");
    const faq = target.closest("#faq .faq-row button");
    if (faq) analytics.track("faq_toggle", { index: Array.from(document.querySelectorAll("#faq .faq-row button")).indexOf(faq) });
  }
  document.addEventListener("click", click, true);
  nuxt.hook("app:mounted", () => {
    pageView(router.currentRoute.value.path, router.currentRoute.value.fullPath);
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 2000 });
    else setTimeout(load, 500);
  });
  if (import.meta.hot) import.meta.hot.dispose(() => { document.removeEventListener("click", click, true); delete window.__solvenekAnalytics; });
});
