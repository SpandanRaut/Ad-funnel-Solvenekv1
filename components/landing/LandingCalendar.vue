<script setup lang="ts">
import { useCalendlyStage } from "~/composables/landing/useCalendlyStage";
import { internationalPhone } from "~/utils/application";
const CALENDLY_ORIGIN = "https://calendly.com";
const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";
const store = useFunnelStore();
const bookingGate = useBookingGate();
const analytics = useAnalytics();
const calendlyUrl = useRuntimeConfig().public.calendlyUrl;
const embed = ref<HTMLElement>();

const ready = ref(false);
const failure = ref(false);
const { stage, height, booked } = useCalendlyStage(embed);
watch(stage, value => analytics.track("calendly_stage", { stage: value === "date" ? "day" : value }), { immediate: true });
const emit = defineEmits<{ layout: [value: { stage: "date" | "time" | "details"; height: number; booked: boolean }] }>();
const card = ref<HTMLElement>();
let observer: ResizeObserver | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let active = true;
let removeScriptListeners = () => {};
useHead({
  link: [
    { rel: "preconnect", href: CALENDLY_ORIGIN },
    { rel: "preconnect", href: "https://assets.calendly.com", crossorigin: "" },
  ],
  script: [{ src: WIDGET_SRC, async: true }],
});
function report() {
  emit("layout", { stage: stage.value, height: card.value?.offsetHeight ?? 740, booked: booked.value });
}
watch([stage, booked], report, { flush: "post" });
watch(ready, (loaded) => { if (loaded) { failure.value = false; clearTimeout(timeout); } });
watch(height, (value) => { if (value) ready.value = true; });
let scheduled = false;
interface CalendlyWidget {
  initInlineWidget(options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: {
      name?: string;
      email?: string;
      customAnswers?: Record<string, string>;
    };
    utm?: Record<string, string>;
  }): void;
}
const calendly = () =>
  (window as unknown as { Calendly?: CalendlyWidget }).Calendly;
function loadWidget() {
  if (calendly()) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = WIDGET_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    const loaded = () => { removeScriptListeners(); resolve(); };
    const failed = () => { removeScriptListeners(); reject(new Error("widget.js")); };
    removeScriptListeners = () => {
      script!.removeEventListener("load", loaded);
      script!.removeEventListener("error", failed);
    };
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
  });
}
function embedUrl() {
  const url = new URL(calendlyUrl);
  // Preserve existing URL values and the event type; only fill missing options.
  for (const [key, value] of Object.entries({ hide_event_type_details: "1", hide_gdpr_banner: "1", background_color: "ffffff", text_color: "0a0f18", primary_color: "0553fd" })) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}
async function onMessage(message: MessageEvent) {
  if (message.origin !== CALENDLY_ORIGIN) return;
  const frame = embed.value?.querySelector("iframe");
  if (!frame || message.source !== frame.contentWindow) return;
  const { event, payload } = (message.data || {}) as {
    event?: string;
    payload?: {
      event?: { uri?: string };
      invitee?: { uri?: string };
    };
  };
  if (event === "calendly.event_type_viewed") ready.value = true;
  // Only a completed booking redirects; date or time selection does not.
  if (event !== "calendly.event_scheduled" || scheduled) return;
  const eventUri = payload?.event?.uri;
  const inviteeUri = payload?.invitee?.uri;
  if (!eventUri || !inviteeUri) return;
  scheduled = true;
  store.setBooking({ eventUri, inviteeUri });
  await bookingGate.complete(message.data);
  analytics.track("booking_complete");
  trackOnce(
    `schedule:${inviteeUri}`,
    "Schedule",
    `schedule-${inviteeUri.split("/").pop()}`,
    { content_name: "strategy_call_booked" },
  );
  await navigateTo("/confirmed");
}
onMounted(async () => {
  window.addEventListener("message", onMessage);
  observer = new ResizeObserver(report);
  if (card.value) observer.observe(card.value);
  report();
  timeout = setTimeout(() => { if (!ready.value) failure.value = true; }, 8000);
  try {
    await loadWidget();
  } catch {
    failure.value = true;
    return;
  }
  const widget = calendly();
  if (!active || !embed.value || !widget) return;
  const application = store.application;
  const utmNames: Record<string, string> = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    utm_content: "utmContent",
    utm_term: "utmTerm",
  };
  widget.initInlineWidget({
    url: embedUrl(),
    parentElement: embed.value,
    // a1/a2 fill the event type's invitee questions in order: Company Name,
    // Phone Number. Industry (a3) is no longer asked on the form.
    prefill: application
      ? {
          name: application.name.trim(),
          email: application.email.trim(),
          customAnswers: {
            a1: application.companyName.trim(),
            a2: internationalPhone(application.phone),
          },
        }
      : {},
    utm: Object.fromEntries(
      Object.entries(store.tracking)
        .filter(([key]) => key in utmNames)
        .map(([key, value]) => [utmNames[key]!, value]),
    ),
  });
  embed.value.querySelector("iframe")?.setAttribute("title", "Schedule a strategy call");
  embed.value.querySelector("iframe")?.addEventListener("load", () => {
    if (height.value) ready.value = true;
  });
});
onBeforeUnmount(() => {
  active = false;
  window.removeEventListener("message", onMessage);
  observer?.disconnect();
  clearTimeout(timeout);
  removeScriptListeners();
});
</script>
<template>
  <section id="calendar"
           ref="card"
           class="calendar-card"
           tabindex="-1"
           aria-labelledby="calendar-title"
           :data-stage="stage"
           :aria-busy="!ready && !failure">
    <header class="calendar-heading">
      <h2 id="calendar-title">Select a time for your discovery call</h2>
      <div class="calendar-meta"><span><Icon name="Clock" :size="15" />30 minutes</span><span><Icon name="Video" :size="15" />Google Meet</span></div>
      <LandingCalendlyProgress :stage="stage" />
    </header>
    <div class="calendar-viewport"
         :class="{ ready }"
         :style="height ? { height: `${height}px` } : undefined">
      <div ref="embed"
           class="calendar-inline"
           :style="height ? { height: `${height}px` } : undefined" />
      <div v-if="!ready"
           class="calendar-skeleton"
           aria-hidden="true">
        <div class="skeleton-month" /><div class="skeleton-week"><i v-for="n in 7" :key="n" /></div><div class="skeleton-days"><i v-for="n in 35" :key="n" /></div><div class="skeleton-zone" />
      </div>
      <p v-if="!ready && !failure"
         class="calendar-status"
         aria-live="polite">
        Loading available times&hellip;
      </p>
      <p v-if="failure"
         role="alert"
         class="calendar-status calendar-failure">
        The calendar couldn't load. <a :href="calendlyUrl"
                                       target="_blank"
                                       rel="noopener">Open the booking page</a>
      </p>
    </div>
  </section>
</template>
<style scoped>
.calendar-card { position: relative; background: #fff; border-radius: 19px; color: rgb(var(--ink)); outline: none; overflow: hidden; scroll-margin-top: calc(var(--landing-header-height, 100px) + 24px); }
.calendar-card:focus-visible { box-shadow: inset 0 0 0 3px rgb(var(--brand)); }
.calendar-heading { padding: 22px 24px 0; }
.calendar-heading h2 { font: 700 23px/1.2 "DM Sans",sans-serif; letter-spacing: -.6px; }
.calendar-meta { display: flex; align-items: center; gap: 24px; margin-top: 10px; font-size: 12px; color: #606d7e; }
.calendar-meta span { display: inline-flex; align-items: center; gap: 7px; }
.calendar-viewport { position: relative; height: 602px; min-height: 540px; overflow: hidden; transition: height .4s var(--ease); }
.calendar-inline { height: 100%; width: 100%; opacity: 0; transition: opacity .35s var(--ease); }
.calendar-inline :deep(iframe) { display: block; width: 100%; height: 100%; border: 0; }
.ready .calendar-inline { opacity: 1; }
.calendar-skeleton { position: absolute; inset: 24px 38px 30px; overflow: hidden; background: #fff; }
.calendar-skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg,transparent 25%,#ffffffaa 50%,transparent 75%); transform: translateX(-100%); animation: skeleton-sweep 1.8s var(--ease) infinite; }
.skeleton-month { height: 19px; width: 40%; margin: 20px auto 40px; border-radius: 5px; background: #edf1f7; }
.skeleton-week, .skeleton-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 18px; margin-bottom: 20px; }
.skeleton-week i { height: 9px; border-radius: 3px; background: #e8eef6; }
.skeleton-days i { aspect-ratio: 1; border-radius: 50%; background: #f0f4f9; }
.skeleton-days i:nth-child(3n) { background: #e7effc; }
.skeleton-zone { width: 45%; height: 14px; margin-top: 30px; border-radius: 4px; background: #edf1f7; }
.calendar-status { position: absolute; bottom: 15px; left: 18px; right: 18px; font-size: 12px; color: #667487; text-align: center; }
.calendar-failure { padding: 12px; background: #fff; border: 1px solid #dce5f5; border-radius: 8px; }
.calendar-failure a { color: rgb(var(--brand)); text-decoration: underline; text-underline-offset: 3px; }
@keyframes skeleton-sweep { to { transform: translateX(100%); } }
:global(.calendar-stage.is-offscreen) .calendar-skeleton::after { animation-play-state: paused; }
@media (max-height:800px) and (min-width:1024px) { .calendar-heading { padding: 16px 20px 0; } .calendar-heading h2 { font-size: 21px; } .calendar-meta { margin-top: 8px; } }
@media (max-width:767px) { .calendar-heading { padding: 20px 20px 0; } .calendar-heading h2 { font-size: 22px; } .calendar-skeleton { inset-inline: 24px; } .skeleton-week, .skeleton-days { gap: 12px; } }
@media (prefers-reduced-motion:reduce) { .calendar-viewport { transition: none; } .calendar-inline { transition: opacity .15s ease-out; } .calendar-skeleton::after { animation: none; } }
</style>
