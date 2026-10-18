<script setup lang="ts">
import { CalendarDays, Clock, UserRound, Check } from "lucide-vue-next";
import type { CalendlyStage } from "~/composables/landing/calendlyStage";
const props = defineProps<{ stage: CalendlyStage }>();
const steps = [
  { label: "Day", icon: CalendarDays },
  { label: "Time", icon: Clock },
  { label: "Details", icon: UserRound },
];
const current = computed(() => ["date", "time", "details"].indexOf(props.stage));
const root = ref<HTMLElement>();
const inView = ref(false);
const tabVisible = ref(true);
let observer: IntersectionObserver | undefined;
function visibility() { tabVisible.value = !document.hidden; }
onMounted(() => {
  visibility();
  document.addEventListener("visibilitychange", visibility);
  observer = new IntersectionObserver(([entry]) => { inView.value = entry?.isIntersecting ?? false; });
  if (root.value) observer.observe(root.value);
});
onBeforeUnmount(() => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); });
</script>
<template>
  <div ref="root" class="calendly-progress" :class="{ paused: !inView || !tabVisible }">
    <ol class="progress-graphic" aria-hidden="true">
      <li v-for="(step, index) in steps" :key="step.label"
          class="progress-step" :class="{ active: index === current, done: index < current }">
        <div v-if="index < 2" class="progress-connector"
             :class="{ momentum: index === current }"
             :style="{ '--fill': index < current ? 1 : index === current ? .35 : 0 }">
          <div class="connector-track"><i class="connector-fill"><i class="connector-sheen" /></i></div>
          <i class="connector-position"><i class="connector-head" /></i>
        </div>
        <span class="progress-node">
          <i class="node-fill" />
          <i class="node-ripples"><i /><i /></i>
          <component :is="step.icon" class="node-icon node-muted" :size="14" :stroke-width="1.8" />
          <component :is="step.icon" class="node-icon node-white" :size="14" :stroke-width="1.8" />
          <span class="node-check"><span><Check :size="15" :stroke-width="2.4" /></span></span>
        </span>
        <span class="progress-label">
          <span class="label-upcoming">{{ step.label }}</span>
          <span class="label-active">{{ step.label }}</span>
          <span class="label-done">{{ step.label }}</span>
        </span>
      </li>
    </ol>
    <span class="progress-status" aria-live="polite" aria-atomic="true">Step {{ current + 1 }} of 3: {{ steps[current]!.label }}</span>
  </div>
</template>
<style scoped>
.calendly-progress { margin: 14px 0 10px; }
.progress-graphic { display: grid; grid-template-columns: repeat(3,1fr); list-style: none; padding: 0; margin: 0; height: 56px; }
.progress-step { position: relative; display: flex; align-items: center; flex-direction: column; gap: 6px; }
.progress-node { position: relative; width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid #cbd4e2; border-radius: 50%; background: #fff; isolation: isolate; }
.node-fill { position: absolute; inset: -1px; border-radius: inherit; background: rgb(var(--brand)); opacity: 0; transition: opacity .25s var(--ease); z-index: -1; }
.active .node-fill, .done .node-fill { opacity: 1; }
.node-icon { position: absolute; transition: opacity .2s var(--ease); }
.node-muted { color: #657286; }
.node-white { color: #fff; opacity: 0; }
.active .node-muted, .done .node-muted, .done .node-white { opacity: 0; }
.active .node-white { opacity: 1; }
.node-ripples { position: absolute; inset: 0; opacity: 0; transition: opacity .25s var(--ease); pointer-events: none; }
.node-ripples::before { content: ''; position: absolute; inset: -6px; background: radial-gradient(circle,#0553fd26,transparent 72%); }
.node-ripples > i { position: absolute; inset: -1px; border: 1px solid rgb(var(--brand) / .3); border-radius: 50%; animation: node-ripple 2.4s var(--ease) infinite paused; }
.node-ripples > i:nth-child(2) { animation-delay: 1.2s; }
.active .node-ripples { opacity: 1; }
.active .node-ripples > i { animation-play-state: running; }
.node-check { display: grid; place-items: center; color: #fff; opacity: 0; transform: scale(.85); transition: opacity .2s var(--ease),transform .15s var(--ease); }
.node-check > span { display: grid; transform: scale(1); transition: transform .15s var(--ease); }
.done .node-check { opacity: 1; transform: scale(1.06); }
.done .node-check > span { transform: scale(.9434); transition-delay: .15s; }
.node-check :deep(path) { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset .3s var(--ease); }
.done .node-check :deep(path) { stroke-dashoffset: 0; }
.progress-label { display: grid; font-size: 12px; line-height: 18px; font-weight: 500; transition: transform .25s var(--ease); }
.progress-label > span { grid-area: 1/1; transition: opacity .25s var(--ease); }
.label-upcoming { color: #657286; }
.label-active { color: rgb(var(--brand)); opacity: 0; }
.label-done { color: rgb(var(--ink)); opacity: 0; }
.active .progress-label { transform: translateY(-1px); }
.active .label-upcoming,.done .label-upcoming { opacity: 0; }
.active .label-active,.done .label-done { opacity: 1; }
.progress-connector { position: absolute; top: 12px; left: calc(50% + 22px); width: calc(100% - 44px); height: 3px; }
.connector-track { position: absolute; inset: 0; border-radius: 3px; background: #e2e8f1; overflow: hidden; }
.connector-fill { display: block; height: 100%; background: rgb(var(--brand)); transform: scaleX(var(--fill)); transform-origin: left; transition: transform .6s var(--ease); overflow: hidden; border-radius: inherit; }
.connector-sheen { position: absolute; inset: 0; background: linear-gradient(90deg,transparent,#ffffffb3,transparent); transform: translateX(-110%); animation: connector-sheen 2.4s var(--ease) infinite paused; opacity: 0; transition: opacity .2s var(--ease); }
.connector-position { position: absolute; inset: 0; transform: translateX(calc(var(--fill) * 100%)); transition: transform .6s var(--ease); pointer-events: none; }
.connector-head { position: absolute; left: -3px; top: -1.5px; width: 6px; height: 6px; border-radius: 50%; background: rgb(var(--brand)); box-shadow: 0 0 7px #0553fd66; opacity: 0; transition: opacity .25s var(--ease); }
.momentum .connector-sheen,.momentum .connector-head { opacity: 1; }
.momentum .connector-sheen { animation-play-state: running; }
.progress-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.paused .node-ripples > i,.paused .connector-sheen { animation-play-state: paused; }
@keyframes node-ripple { 0% { transform: scale(1); opacity: .5; } 80%,100% { transform: scale(1.8); opacity: 0; } }
@keyframes connector-sheen { to { transform: translateX(110%); } }
@media (max-height:800px) and (min-width:1024px) { .calendly-progress { margin-top: 10px; margin-bottom: 6px; } }
@media (prefers-reduced-motion:reduce) {
  .node-ripples,.connector-sheen,.connector-head { display: none; }
  .node-check,.node-check > span,.active .progress-label { transform: none; }
  .node-check,.node-check > span,.node-icon,.node-fill,.progress-label > span { transition: opacity .15s ease-out; }
  .node-check :deep(path) { stroke-dashoffset: 0; transition: none; }
  .connector-fill,.connector-position { transition: none; }
}
</style>
