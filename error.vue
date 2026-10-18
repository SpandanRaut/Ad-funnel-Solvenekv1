<script setup lang="ts">
import type { NuxtError } from "#app";
import { Compass, CalendarX, Link2Off } from "lucide-vue-next";

const props = defineProps<{ error: NuxtError }>();
const missing = computed(() => props.error.statusCode === 404);
const copy = computed(() => missing.value ? {
  eyebrow: "ERROR 404",
  heading: "This page isn't on the calendar.",
  description: "The link may be broken, or the page may have moved.",
  action: "Back to home",
} : {
  eyebrow: "SOMETHING WENT WRONG",
  heading: "That didn't go as planned.",
  description: "Please try again in a moment.",
  action: "Try again",
});
useSiteSeo("error");
const shell = ref<HTMLElement>();
const scene = ref<HTMLElement>();
const active = ref(false);
let dispose = () => {};
const router = useRouter();
async function recover(redirect = "/") {
  const target = router.resolve(redirect);
  // Fatal middleware errors can push the displayed URL without committing
  // router.currentRoute. Force replacement even when it still reports '/'.
  await router.replace({ path: target.path, query: target.query, hash: target.hash, force: true });
  await clearError();
}
// Nuxt's app-level error boundary must be cleared when following a header link.
function followLink(event: MouseEvent) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
  if (!link || link.target || link.origin !== location.origin || link.hash === "#main-content" || !["/", "/conditions", "/privacy"].includes(link.pathname)) return;
  event.preventDefault();
  event.stopPropagation();
  void recover(link.pathname + link.search + link.hash);
}
onMounted(() => {
  const root = shell.value!;
  const main = scene.value!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  let inView = true;
  let frame = 0;
  const updateActive = () => { active.value = inView && !document.hidden; };
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateActive(); });
  observer.observe(main);
  const header = root.querySelector<HTMLElement>("header")!;
  const resize = new ResizeObserver(() => root.style.setProperty("--error-header", `${header.offsetHeight}px`));
  resize.observe(header);
  const move = (event: PointerEvent) => {
    if (!pointer.matches || reduced.matches || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const box = main.getBoundingClientRect();
      main.style.setProperty("--spot-x", `${event.clientX - box.left - box.width * .5}px`);
      main.style.setProperty("--spot-y", `${event.clientY - box.top - box.height * .24}px`);
      main.style.setProperty("--tilt-x", `${Math.max(-6, Math.min(6, -(event.clientY - box.top - box.height / 2) / box.height * 12))}deg`);
      main.style.setProperty("--tilt-y", `${Math.max(-6, Math.min(6, (event.clientX - box.left - box.width / 2) / box.width * 12))}deg`);
    });
  };
  const leave = () => { main.style.setProperty("--tilt-x", "0deg"); main.style.setProperty("--tilt-y", "0deg"); };
  main.addEventListener("pointermove", move, { passive: true });
  main.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", updateActive);
  dispose = () => {
    observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
    main.removeEventListener("pointermove", move); main.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", updateActive);
  };
});
onBeforeUnmount(() => dispose());
</script>

<template>
  <div ref="shell" class="error-shell" :class="{ 'is-active': active }" @click.capture="followLink">
    <SiteAccessibility />
    <SiteHeader variant="dark" />
    <main ref="scene" class="error-scene">
      <div class="error-grid" aria-hidden="true" />
      <div class="error-arc" aria-hidden="true" />
      <div v-if="missing" class="error-digits" aria-hidden="true">
        <div class="digit-base"><span class="digit-text">404</span></div>
        <div class="digit-blur"><span class="digit-text">404</span></div>
        <div class="digit-spotlight"><span class="digit-text">404</span></div>
        <div class="digit-sheen"><span class="digit-text">404</span></div>
      </div>
      <div class="container error-content">
        <div class="error-copy">
          <p class="eyebrow error-enter" style="--delay: 120ms">{{ copy.eyebrow }}</p>
          <h1 class="error-enter" style="--delay: 190ms">{{ copy.heading }}</h1>
          <p class="error-description error-enter" style="--delay: 260ms">{{ copy.description }}</p>
          <div class="error-actions error-enter" style="--delay: 330ms">
            <NuxtLink v-if="missing" to="/" class="primary-button">{{ copy.action }}<Icon name="ArrowRight" :size="17" /></NuxtLink>
            <button v-else class="primary-button" @click="recover()">{{ copy.action }}<Icon name="ArrowRight" :size="17" /></button>
            <NuxtLink to="/#faq" class="error-secondary">Common questions<Icon name="ArrowRight" :size="16" /></NuxtLink>
          </div>
        </div>
        <div class="error-art" aria-hidden="true">
          <div class="error-art-inner">
            <svg class="lost-connector" viewBox="0 0 520 460" fill="none">
              <path d="M140 130 C140 240 180 270 275 270 M322 270 C420 270 420 300 420 345" stroke="#5792ff" stroke-opacity=".3" />
              <path d="M260 270 H275 M322 270 H337" stroke="#8bb4ff" stroke-width="2" />
              <g class="lost-dot"><circle r="12" fill="#538cff" opacity=".1" /><circle r="5" fill="#619dff" opacity=".3" /><circle r="2.5" fill="#c4dcff" /></g>
            </svg>
            <div class="error-card card-compass"><div class="glass-card"><Compass :size="44" :stroke-width="1.2" /></div></div>
            <div class="error-card card-calendar"><div class="glass-card"><CalendarX :size="44" :stroke-width="1.2" /></div></div>
            <div class="error-card card-link"><div class="glass-card"><Link2Off :size="40" :stroke-width="1.2" /></div></div>
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.error-shell { --error-header: 100px; background: rgb(var(--navy)); color: #f8faff; }
.error-scene { position: relative; isolation: isolate; overflow: clip; min-height: calc(100svh - var(--error-header)); display: grid; align-items: center; --spot-x: 0px; --spot-y: 0px; --tilt-x: 0deg; --tilt-y: 0deg; }
.error-grid { position: absolute; inset: 0; z-index: -2; background-image: linear-gradient(#a5c6ff0b 1px, transparent 1px), linear-gradient(90deg, #a5c6ff0b 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); }
.error-arc { position: absolute; z-index: -2; width: 960px; height: 960px; right: -560px; top: -80px; border: 1px solid #2e6dce55; border-radius: 50%; box-shadow: inset 35px 0 100px #1254c014, -45px 0 150px #1254c00d; }
.error-digits { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; font: 700 clamp(140px, 24vw, 320px)/1 "DM Sans", sans-serif; letter-spacing: -.075em; }
.digit-text { position: absolute; inset: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 2%; background: linear-gradient(160deg, #c1d8ff, #3b7ff9 80%); background-clip: text; color: transparent; -webkit-text-stroke: 1px #88b6ff; }
.digit-base, .digit-blur, .digit-spotlight, .digit-sheen { position: absolute; inset: 0; }
.digit-base { opacity: .07; animation: digits-arrive 1s var(--ease) both; }
.digit-blur { filter: blur(12px); opacity: 0; animation: digits-blur 1s var(--ease) both; }
.digit-spotlight { opacity: .22; mask-image: radial-gradient(ellipse 220px 180px at 50% 24%, #000, transparent 100%); transform: translate3d(var(--spot-x), var(--spot-y), 0); }
.digit-spotlight .digit-text { transform: translate3d(calc(-1 * var(--spot-x)), calc(-1 * var(--spot-y)), 0); }
.digit-sheen { opacity: .16; mask-image: linear-gradient(110deg, transparent 42%, #000 49%, transparent 56%); animation: sheen 12s linear infinite; }
.digit-sheen .digit-text { animation: sheen-counter 12s linear infinite; }
.error-content { display: grid; grid-template-columns: 1.15fr 1fr; align-items: center; gap: 36px; padding-block: 110px 120px; }
.error-copy { position: relative; z-index: 1; }
.error-copy .eyebrow { color: #91b7ff; margin-bottom: 24px; letter-spacing: 2px; }
.error-copy h1 { max-width: 620px; font: 600 clamp(38px, 4.3vw, 62px)/1.08 "DM Sans", sans-serif; letter-spacing: -.045em; text-wrap: balance; }
.error-description { color: #b5c2d3; line-height: 1.7; margin-top: 24px; font-size: 15px; }
.error-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-top: 34px; }
.error-actions .primary-button { min-width: 0; padding: 16px 23px; gap: 16px; font-size: 14px; }
.error-secondary { display: inline-flex; align-items: center; gap: 9px; color: #c3d5f3; font-size: 13px; padding-block: 12px; }
.error-shell a:focus-visible, .error-shell button:focus-visible { outline: 3px solid #91b7ff; outline-offset: 5px; }
.error-enter { animation: copy-arrive .75s var(--ease) both; animation-delay: var(--delay); }
.error-art { position: relative; width: 100%; max-width: 520px; aspect-ratio: 520 / 460; perspective: 900px; }
.error-art-inner { position: absolute; inset: 0; transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y)); transition: transform .45s var(--ease); }
.lost-connector { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 0 5px #548fff55); }
.lost-dot { animation: lost-lead 6s linear infinite; }
.error-card { position: absolute; width: 30%; aspect-ratio: 1; animation: card-arrive 1.1s var(--ease) both; }
.card-compass { left: 11%; top: 9%; --rotation: -11deg; animation-delay: .26s; }
.card-calendar { right: 4%; top: 58%; --rotation: 9deg; animation-delay: .4s; }
.card-link { left: 44%; top: 27%; width: 25%; --rotation: 7deg; animation-delay: .33s; }
.glass-card { width: 100%; height: 100%; display: grid; place-items: center; border: 1px solid #b2ceff30; border-radius: 22px; color: #a8c8ff; background: linear-gradient(140deg, #263f5c99, #101f30cc); box-shadow: inset 0 1px 0 #d7e7ff12, 0 25px 65px #0004; backdrop-filter: blur(12px); transform: rotate(var(--rotation)); animation: card-float 7s ease-in-out infinite; }
.card-link .glass-card { animation-duration: 6s; animation-delay: -2s; color: #6e9de9; }
.card-calendar .glass-card { animation-duration: 9s; animation-delay: -4s; }
.error-shell:not(.is-active) .glass-card, .error-shell:not(.is-active) .lost-dot, .error-shell:not(.is-active) .digit-sheen, .error-shell:not(.is-active) .digit-sheen .digit-text, .error-shell:not(.is-active) .digit-spotlight, .error-shell:not(.is-active) .digit-spotlight .digit-text { animation-play-state: paused; }
@keyframes digits-arrive { from { opacity: 0; transform: scale(.94); } to { opacity: .07; transform: scale(1); } }
@keyframes digits-blur { from { opacity: .14; transform: scale(.94); } to { opacity: 0; transform: scale(1); } }
@keyframes copy-arrive { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes card-arrive { from { opacity: 0; transform: translate3d(22px, 35px, 0) rotate(8deg); } to { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); } }
@keyframes card-float { 0%, 100% { transform: translateY(-8px) rotate(var(--rotation)); } 50% { transform: translateY(8px) rotate(var(--rotation)); } }
@keyframes lost-lead { 0% { transform: translate(140px, 130px); opacity: 0; } 8% { transform: translate(140px, 155px); opacity: 1; } 30% { transform: translate(155px, 224px); opacity: 1; } 52% { transform: translate(213px, 266px); opacity: 1; } 65% { transform: translate(275px, 270px); opacity: 1; } 67%, 72% { transform: translate(275px, 270px); opacity: .1; } 69%, 75% { transform: translate(275px, 270px); opacity: .85; } 80%, 100% { transform: translate(275px, 270px); opacity: 0; } }
@keyframes sheen { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes sheen-counter { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
@keyframes spotlight-drift { 0%, 100% { transform: translate(-14%, -6%); } 50% { transform: translate(14%, 8%); } }
@keyframes spotlight-counter { 0%, 100% { transform: translate(14%, 6%); } 50% { transform: translate(-14%, -8%); } }
@media (hover: none), (pointer: coarse) {
  .digit-spotlight { animation: spotlight-drift 14s ease-in-out infinite; }
  .digit-spotlight .digit-text { animation: spotlight-counter 14s ease-in-out infinite; }
  .error-art-inner { transform: none; }
}
@media (max-width: 1100px) {
  .error-content { gap: 12px; grid-template-columns: 1.2fr 1fr; }
  .error-copy h1 { font-size: clamp(38px, 4.5vw, 50px); }
  .error-actions { gap: 18px; }
}
@media (max-width: 760px) {
  .error-shell { --error-header: 80px; }
  .error-content { grid-template-columns: 1fr; gap: 28px; padding-block: 68px 42px; }
  .error-copy h1 { max-width: 520px; font-size: clamp(37px, 8vw, 48px); }
  .error-copy .eyebrow { margin-bottom: 20px; }
  .error-description { margin-top: 20px; max-width: 340px; }
  .error-actions { margin-top: 26px; gap: 14px 20px; }
  .error-art { width: 100%; max-width: 400px; height: 220px; aspect-ratio: auto; margin-inline: auto; }
  .error-art-inner { transform: none; }
  .card-link { display: none; }
  .error-card { width: 105px; }
  .card-compass { top: 10px; left: 12%; }
  .card-calendar { top: 90px; right: 10%; }
  .lost-connector { width: 350px; height: 310px; left: calc(50% - 175px); top: -45px; }
  .glass-card { border-radius: 18px; }
  .error-digits .digit-text { padding-top: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .error-shell *, .error-shell *::before, .error-shell *::after { animation: none !important; transition: opacity .15s ease !important; }
  .digit-blur, .digit-sheen { display: none; }
  .digit-spotlight { opacity: .06; transform: none; }
  .digit-spotlight .digit-text, .error-art-inner { transform: none; }
  .lost-dot { transform: translate(275px, 270px); opacity: .6; }
}
</style>
