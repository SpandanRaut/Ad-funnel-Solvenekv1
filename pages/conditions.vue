<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "lucide-vue-next";
import { guaranteeConditions, SITE_UPDATED } from "~/composables/siteContent";
import { hero } from "~/data/landing";
import GuaranteeRing from "~/components/conditions/GuaranteeRing.vue";
import ConditionVisual from "~/components/conditions/ConditionVisual.vue";
useSiteSeo("/conditions");
const config = useRuntimeConfig().public;
const root = ref<HTMLElement>();
const active = ref(0);
useWalkthroughMotion(root, active);
const stats = [
  { value: 90, prefix: "", caption: "days" },
  { value: 8, prefix: "", caption: "booked estimates a month as a starting point" },
  { value: 24, prefix: "", caption: "over the 90 days" },
  { value: 30, end: 50, prefix: "$", caption: "a day ad spend" },
];
const parts = (value: string) => value.split(/(\$30–50\/day|90 days|\b24\b|\b8\b)/g).map(part => ({ text: part, bold: /^(\$30–50\/day|90 days|24|8)$/.test(part) }));
</script>
<template>
  <div ref="root" class="conditions-page" :style="{ '--active': active }">
    <SiteHeader variant="dark" cta-to="/#book" />
    <main id="main-content" tabindex="-1">
      <section class="conditions-hero container">
        <div class="conditions-intro">
          <NuxtLink to="/" class="conditions-back"><ArrowLeft :size="15" aria-hidden="true" />Back to home</NuxtLink>
          <p class="eyebrow">THE FINE PRINT</p>
          <h1 aria-label="How the 90-day guarantee works."><span class="title-line"><span>How the 90-day</span></span><span class="title-line"><span> guarantee works.</span></span></h1>
          <p class="conditions-subcopy">{{ hero.subhead }}</p>
        </div>
        <div class="ring-region" data-count-region><GuaranteeRing /></div>
      </section>
      <div class="terms-region container" data-count-region>
        <div class="key-terms">
          <div v-for="stat in stats" :key="stat.caption" class="key-term">
            <div class="term-figure"><span class="term-final">{{ stat.prefix }}{{ stat.value }}<template v-if="stat.end">–{{ stat.end }}</template></span><span class="term-counter" aria-hidden="true">{{ stat.prefix }}<span :data-ui-count="stat.value">{{ stat.value }}</span><template v-if="stat.end">–<span :data-ui-count="stat.end">{{ stat.end }}</span></template></span></div>
            <p>{{ stat.caption }}</p>
          </div>
        </div>
      </div>
      <div class="journey-bridge container" aria-hidden="true"><svg viewBox="0 0 1200 156" preserveAspectRatio="none" fill="none"><path d="M995 0 V16 C995 92 588 38 588 120 V156" /><path class="bridge-light" d="M995 0 V16 C995 92 588 38 588 120 V156" /></svg></div>
      <section class="conditions-walkthrough container" aria-label="THE FINE PRINT">
        <div class="stage-column" aria-hidden="true">
          <div class="conditions-stage">
            <div class="stage-orbit" /><div class="stage-grid" />
            <div class="stage-caption"><span>{{ guaranteeConditions[active]!.group }}</span><span>0{{ active + 1 }} / 06</span></div>
            <div class="stage-scenes">
              <div v-for="(_,index) in guaranteeConditions" :key="index" class="stage-scene" :class="{ 'is-active visual-playing': active === index }"><ConditionVisual :step="index + 1" /></div>
            </div>
            <div class="stage-meter"><i v-for="index in 6" :key="index" :class="{ filled: index <= active + 1 }" /></div>
          </div>
        </div>
        <div class="conditions-reading">
          <nav class="condition-rail" aria-label="THE FINE PRINT"><div class="rail-track"><i /></div><NuxtLink v-for="(condition,index) in guaranteeConditions" :key="condition.id" :to="`/conditions#${condition.id}`" :aria-label="`0${index + 1}`" :aria-current="active === index ? 'step' : undefined" :style="{ '--node': index }"><span>0{{ index + 1 }}</span><i /></NuxtLink></nav>
          <ol class="condition-list">
            <li v-for="(condition,index) in guaranteeConditions" :id="condition.id" :key="condition.id" class="condition-row" :class="{ 'is-active': active === index }" :data-step="index" tabindex="-1">
              <span class="ghost-number" aria-hidden="true">0{{ index + 1 }}</span>
              <p v-if="index === 0 || index === 1 || index === 5" class="condition-group eyebrow">{{ condition.group }}</p>
              <div class="mobile-visual"><ConditionVisual :step="index + 1" /></div>
              <div class="condition-copy"><p><template v-for="(part,partIndex) in parts(condition.text)" :key="partIndex"><strong v-if="part.bold">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template></p></div>
            </li>
          </ol>
        </div>
      </section>
      <section class="conditions-closing">
        <div class="closing-connector" aria-hidden="true"><svg viewBox="0 0 1200 160" preserveAspectRatio="none" fill="none"><path d="M588 0 V30 C588 130 1110 25 1110 160" /></svg></div>
        <div class="container closing-inner"><div><h2>Questions about<br /> these conditions?</h2><p v-if="config.contactEmail">or email us at <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></p></div><NuxtLink to="/#book" class="primary-button">See if We’re a Fit<ArrowRight :size="17" aria-hidden="true" /></NuxtLink></div>
      </section>
      <p class="conditions-updated container">Last updated: <time :datetime="SITE_UPDATED">{{ SITE_UPDATED }}</time></p>
    </main>
    <SiteFooter />
  </div>
</template>
<style scoped>
.conditions-page { background: rgb(var(--navy)); color: #edf3ff; overflow: clip; --condition-step: 46svh; }
.conditions-page .container { max-width: 1200px; }
.conditions-hero { position: relative; display: grid; grid-template-columns: 1.12fr 1fr; gap: 8%; align-items: center; min-height: 64svh; padding-block: 24px 68px; }
.conditions-hero::after { content: ''; position: absolute; bottom: 0; right: 17.08%; width: 1px; height: 72px; background: linear-gradient(transparent,#75a6ff32); }
.conditions-back { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; font-size: 12px; color: #a9bedb; margin-bottom: 32px; }
.conditions-intro > .eyebrow { color: #84adf0; margin-bottom: 22px; }
.conditions-intro h1 { font: 500 clamp(39px,4.1vw,62px)/1.08 "DM Sans",sans-serif; letter-spacing: -.052em; margin-right: -30px; }
.title-line { display: block; overflow: clip; padding-bottom: .12em; margin-bottom: -.12em; }
.title-line > span { display: block; }
.motion-ready .title-line > span { animation: conditions-title .7s var(--ease) both; }
.motion-ready .title-line:nth-child(2) > span { animation-delay: .09s; }
.conditions-subcopy { color: #acbed6; font-size: 16px; line-height: 1.75; max-width: 53ch; margin-top: 26px; text-wrap: pretty; }
.ring-region { width: 100%; }
.terms-region { position: relative; z-index: 1; }
.key-terms { position: relative; display: grid; grid-template-columns: repeat(4,1fr); border-block: 1px solid #91b8ff38; background: linear-gradient(110deg,#1b304655,#13243833); box-shadow: 0 25px 70px #0002; backdrop-filter: blur(12px); overflow: hidden; }
.key-terms::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg,transparent 40%,#94bdff0e 50%,transparent 60%); transform: translateX(-100%); pointer-events: none; }
.motion-ready .in-view .key-terms::after { animation: terms-sweep 1.1s var(--ease) .3s both; }
.key-term { padding: 28px 32px 30px; position: relative; }
.key-term + .key-term::before { content: ''; position: absolute; left: 0; top: 30px; bottom: 30px; width: 1px; background: #8fb5ee30; }
.term-figure { position: relative; font-size: 53px; font-weight: 500; line-height: 1; letter-spacing: -.055em; color: #e3edff; font-variant-numeric: tabular-nums; }
.key-term:last-child .term-figure { color: #91b7ff; }
.term-final { opacity: 0; }
.term-counter { position: absolute; top: 0; left: 0; }
.key-term p { color: #a4b7d1; font-size: 12px; line-height: 1.6; max-width: 24ch; margin-top: 14px; }
.journey-bridge { height: 156px; position: relative; }
.journey-bridge svg { width: 100%; height: 100%; overflow: visible; }
.journey-bridge path { stroke: #75a6ff32; stroke-width: 1; }
.journey-bridge .bridge-light { stroke: #5790f4a0; stroke-dasharray: 140 1200; filter: drop-shadow(0 0 4px #4383ff); animation: connector-travel 7s linear infinite; }
.conditions-walkthrough { display: grid; grid-template-columns: 44% 51%; gap: 5%; position: relative; padding-bottom: 20px; }
.stage-column { position: relative; }
.conditions-stage { position: sticky; top: 124px; height: min(470px,calc(100svh - 172px)); isolation: isolate; display: flex; flex-direction: column; justify-content: space-between; }
.stage-grid { position: absolute; inset: 18% -8%; z-index: -1; background-image: linear-gradient(#86abdf0b 1px,transparent 1px),linear-gradient(90deg,#86abdf0b 1px,transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(ellipse,#000,transparent 72%); }
.stage-orbit { position: absolute; width: 95%; aspect-ratio: 1; border: 1px solid #4f80c322; border-radius: 50%; top: 5%; left: -6%; z-index: -1; box-shadow: inset 0 0 50px #0553fd08; }
.stage-caption { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 14px 22px; font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #9db6d9; border-top: 1px solid #7797c333; }
.stage-caption > span:last-child { color: #7993b9; white-space: nowrap; font-variant-numeric: tabular-nums; }
.stage-scenes { position: relative; flex: 1; min-height: 0; margin-block: 10px; }
.stage-scene { position: absolute; inset: 0; opacity: 0; transform: translateY(12px) scale(.975); transition: opacity .45s var(--ease),transform .45s var(--ease); pointer-events: none; }
.stage-scene.is-active { opacity: 1; transform: none; }
.stage-meter { display: flex; gap: 5px; padding: 15px 22px; }
.stage-meter i { flex: 1; height: 1px; background: #7491b52a; }
.stage-meter i.filled { background: #79a7f1; box-shadow: 0 0 8px #4383ff55; }
.conditions-reading { position: relative; min-width: 0; }
.condition-list { padding: 0 0 0 52px; margin: 0; list-style: none; }
.condition-row { position: relative; min-height: var(--condition-step); display: flex; flex-direction: column; justify-content: center; padding: 70px 0; scroll-margin-top: 124px; isolation: isolate; }
.ghost-number { position: absolute; top: 26px; left: -8px; font: 500 clamp(120px,12vw,170px)/1 "DM Sans",sans-serif; letter-spacing: -.08em; color: transparent; -webkit-text-stroke: 1px #88b6fb20; z-index: -1; user-select: none; }
.condition-group { color: #99b9e6; margin-bottom: 25px; font-size: 10px; }
.condition-copy p { font-size: clamp(22px,2.1vw,30px); line-height: 1.35; letter-spacing: -.025em; color: #edf3ff; transition: opacity .45s var(--ease); }
.condition-copy strong { color: #b7d2ff; font-weight: 700; }
#ad-spend .condition-copy strong { white-space: nowrap; }
.motion-ready .condition-row:not(.is-active) .condition-copy p { opacity: .53; }
.condition-row:focus-visible { outline: 2px solid #a5c9ff; outline-offset: 9px; }
.condition-rail { position: absolute; inset: 0 auto 0 0; width: 30px; }
.rail-track { position: absolute; top: calc(var(--condition-step)/2); bottom: calc(var(--condition-step)/2); left: 0; width: 1px; background: #6d96cc35; }
.rail-track > i { position: absolute; inset: 0; background: #76a6fb; box-shadow: 0 0 9px #4383ff66; transform: scaleY(calc(var(--active) / 5)); transform-origin: top; transition: transform .6s var(--ease); }
.condition-rail a { position: absolute; top: calc((var(--node) + .5) * var(--condition-step)); width: 44px; height: 44px; left: -22px; transform: translateY(-50%); display: grid; place-items: center; color: #7894ba; font-size: 9px; }
.condition-rail a > span { position: absolute; left: -9px; transform: translateX(-100%); opacity: 0; transition: opacity .45s var(--ease); }
.condition-rail a > i { width: 7px; height: 7px; border: 1px solid #7ca4da; border-radius: 50%; background: #102033; }
.condition-rail a[aria-current] > i { background: #c4dcff; border-color: #d8e9ff; box-shadow: 0 0 0 5px #548eff16,0 0 22px #4383ffaa; }
.condition-rail a[aria-current] > span,.condition-rail a:hover > span,.condition-rail a:focus-visible > span { opacity: 1; }
.mobile-visual { display: none; }
.conditions-closing { position: relative; padding-block: 140px 70px; border-bottom: 1px solid #a1bfff19; isolation: isolate; }
.conditions-closing::before { content: ''; position: absolute; inset: 15% 0 0 45%; z-index: -1; background: radial-gradient(ellipse at 85% 70%,#1357ce18,transparent 65%); }
.closing-connector { position: absolute; inset: 0 max(60px,calc((100vw - 1200px)/2)) auto; height: 160px; z-index: -1; }
.closing-connector svg { width: 100%; height: 100%; }
.closing-connector path { stroke: #699ef952; }
.closing-inner { display: flex; align-items: center; justify-content: space-between; gap: 36px; }
.conditions-closing h2 { font: 500 clamp(32px,3.7vw,52px)/1.1 "DM Sans",sans-serif; letter-spacing: -.045em; }
.conditions-closing .primary-button { min-width: 184px; flex-shrink: 0; }
.conditions-closing p { color: #a8bedc; font-size: 13px; margin-top: 22px; }
.conditions-closing p a { text-decoration: underline; text-underline-offset: 3px; }
.conditions-updated { color: #9baec6; font-size: 11px; padding-block: 25px; }
.conditions-page :deep(a:focus-visible) { outline: 2px solid #b7d2ff; outline-offset: 5px; }
.tab-hidden :deep(*),.tab-hidden :deep(*)::after,.motion-paused :deep(*),.motion-paused :deep(*)::after { animation-play-state: paused !important; }
@keyframes conditions-title { from { transform: translateY(105%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes terms-sweep { to { transform: translateX(100%); } }
@keyframes connector-travel { to { stroke-dashoffset: -1340; } }
@media(min-width:1024px) { .condition-row { height: var(--condition-step); min-height: 345px; } .conditions-page { --condition-step: max(345px,46svh); } }
@media(max-width:1199px) and (min-width:1024px) { .conditions-hero { gap: 4%; } .conditions-intro h1 { font-size: 43px; } .conditions-subcopy { font-size: 15px; } .conditions-stage { top: 116px; } .condition-list { padding-left: 40px; } .key-term { padding-inline: 25px; } }
@media(max-width:1023px) {
 .conditions-page { --condition-step: 430px; }
 .conditions-hero { min-height: 580px; gap: 3%; padding-block: 10px 55px; }
 .conditions-intro h1 { font-size: clamp(34px,4.9vw,48px); }
 .conditions-subcopy { font-size: 14px; }
 .conditions-back { margin-bottom: 24px; }
 .key-terms { grid-template-columns: repeat(2,1fr); }
 .key-term { padding: 24px 28px; }
 .key-term:nth-child(3)::before { display: none; }
 .key-term:nth-child(n+3) { border-top: 1px solid #8fb5ee25; }
 .key-term p { max-width: 25ch; }
 .journey-bridge { height: 88px; }
 .journey-bridge svg { display: none; }
 .journey-bridge::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 1px; background: #699ef952; }
 .stage-column { display: none; }
 .conditions-walkthrough { display: block; }
 .condition-list { padding-left: 32px; }
 .condition-row { min-height: 430px; padding: 24px 24px 36px; margin-bottom: 28px; border: 1px solid #8bb1e62b; border-radius: 8px; background: linear-gradient(135deg,#182b3f66,#0c192766); justify-content: start; }
 .condition-group { margin-bottom: 12px; }
 .mobile-visual { display: block; height: 155px; flex-shrink: 0; margin-block: 8px 26px; }
 .ghost-number { top: auto; bottom: 25px; left: auto; right: 18px; font-size: 110px; }
 .condition-copy p { font-size: clamp(22px,3vw,28px); max-width: 34ch; }
 .rail-track { top: 215px; bottom: 243px; }
 .condition-rail::before { content: ''; position: absolute; left: 0; top: 0; height: 215px; width: 1px; background: #6d96cc35; }
 .condition-rail a { top: calc(var(--node) * 458px + 215px); }
 .condition-rail a > span { left: 28px; transform: none; font-size: 8px; }
 .conditions-closing { padding-top: 80px; }
 .closing-connector { height: 100px; left: 36px; right: 36px; }
}
@media(max-width:600px) {
 .conditions-hero { grid-template-columns: 1fr; gap: 20px; min-height: 0; padding-block: 0 66px; }
 .conditions-hero::after { right: auto; left: 0; height: 30px; }
 .conditions-back { margin-bottom: 22px; }
 .conditions-intro > .eyebrow { margin-bottom: 18px; }
 .conditions-intro h1 { font-size: clamp(36px,9.2vw,50px); margin: 0; }
 .conditions-subcopy { margin-top: 22px; font-size: 15px; }
 .ring-region { margin-top: 5px; display: grid; justify-items: center; }
 .key-term { padding: 24px 20px; }
 .term-figure { font-size: 45px; }
 .key-term p { font-size: 11px; margin-top: 12px; }
 .key-term + .key-term::before { top: 24px; bottom: 24px; }
 .condition-list { padding-left: 22px; }
 .condition-row { padding: 22px 18px 30px; }
 .condition-copy p { font-size: 22px; line-height: 1.4; }
 .mobile-visual { margin-inline: -12px; }
 .closing-inner { flex-direction: column; align-items: start; gap: 30px; }
 .conditions-closing { padding-block: 68px 48px; }
 .conditions-closing h2 { font-size: 38px; }
 .closing-connector { left: 20px; right: 20px; height: 230px; }
}
@media(prefers-reduced-motion:reduce) {
 .conditions-page :deep(*),.conditions-page :deep(*)::before,.conditions-page :deep(*)::after { animation: none !important; transition: none !important; }
 .stage-scene { transform: none; transition: opacity .15s ease !important; }
 .term-final { opacity: 1; }
 .term-counter { display: none; }
 .bridge-light { display: none; }
}
@media print {
 .conditions-page { background: #fff !important; color: #000 !important; overflow: visible; }
 .conditions-page :deep(*) { animation: none !important; transition: none !important; box-shadow: none !important; text-shadow: none !important; outline: none !important; }
 .conditions-page :deep(.site-header),.conditions-page :deep(.site-footer),.conditions-back,.ring-region,.stage-column,.condition-rail,.journey-bridge,.mobile-visual,.ghost-number,.conditions-closing { display: none !important; }
 .conditions-hero::after { display: none; }
 .conditions-page .container { width: 100%; max-width: none; }
 .conditions-hero { display: block; padding: 10px 0 24px; min-height: 0; }
 .conditions-intro h1 { font-size: 28px; }
 .title-line { display: inline; }
 .title-line + .title-line::before { content: ' '; }
 .conditions-subcopy,.conditions-intro > .eyebrow,.conditions-updated { color: #000; }
 .key-terms { grid-template-columns: repeat(4,1fr); background: #fff; border-color: #999; }
 .key-term { padding: 14px; }
 .term-figure { font-size: 28px; color: #000 !important; }
 .term-final { opacity: 1; }
 .term-counter { display: none; }
 .key-term p { color: #000; }
 .key-term + .key-term::before { background: #999; }
 .conditions-walkthrough { display: block; padding-top: 20px; }
 .condition-list { padding-left: 28px; list-style: decimal; }
 .condition-row { display: list-item; height: auto; min-height: 0; padding: 18px 0; margin: 0; border: none; background: #fff; break-inside: avoid; opacity: 1; }
 .condition-copy p,.condition-copy strong,.condition-group { color: #000; opacity: 1 !important; }
 .condition-copy p { font-size: 15px; line-height: 1.6; max-width: none; }
 .condition-group { margin-bottom: 8px; }
}
</style>
