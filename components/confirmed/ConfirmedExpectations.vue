<script setup lang="ts">
import { mountMeasuredPath } from '~/composables/useMeasuredPath';
const root = ref<HTMLElement>();
const expectations = [
  { icon: 'Search', title: 'A look at your current lead flow', copy: 'Where your projects come from today and what a good job is worth to you.' },
  { icon: 'Lightbulb', title: 'Where Meta ads can fit', copy: 'Which kitchen and bathroom services to lead with in your area.' },
  { icon: 'MessageCircle', title: 'A clear next step', copy: "If it's a fit, we'll outline the plan. If not, we'll tell you." },
];
let dispose = () => {};
onMounted(() => { if (root.value) dispose = mountMeasuredPath(root.value,'.expect-card',true); });
onBeforeUnmount(() => dispose());
</script>
<template>
  <section class="expect-section" aria-labelledby="expect-heading">
    <p class="eyebrow">YOUR STRATEGY CALL</p><h2 id="expect-heading">What to expect on the call</h2>
    <div ref="root" class="expect-flow">
      <svg data-measured-svg class="expect-line" fill="none" aria-hidden="true"><path data-path-track /><path data-process-path /><g data-path-nodes /><g data-process-dot><circle r="5" /></g></svg>
      <article v-for="(item,index) in expectations" :key="item.title" class="expect-card glass">
        <Icon :name="item.icon" :size="25" data-anchor-icon /><span class="eyebrow">0{{ index+1 }}</span>
        <h3>{{ item.title }}</h3><p>{{ item.copy }}</p>
      </article>
    </div>
  </section>
</template>
<style scoped>
.expect-flow { position: relative; isolation: isolate; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 32px; margin-top: 28px; }
.expect-card { position: relative; z-index: 1; padding: 28px; background: rgb(17 31 47 / .65); backdrop-filter: blur(3px); }
.expect-card > svg { color: #8ab2ff; margin-bottom: 20px; }
.expect-card > .eyebrow { position: absolute; top: 30px; right: 28px; color: #9cb3d5; }
h3 { font-size: 19px; line-height: 1.35; letter-spacing: -.5px; margin-bottom: 12px; font-weight: 600; }
.expect-card > p { color: #adbed6; font-size: 14px; line-height: 1.7; }
.expect-line { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; }
[data-path-track] { stroke: #739ee559; stroke-width: 1.5; }
[data-process-path] { stroke: #83b2ff; stroke-width: 1.5; }
[data-path-nodes] :deep(circle) { fill: #718cb6; }
[data-path-nodes] :deep(.is-lit),[data-process-dot] { fill: #cae1ff; filter: drop-shadow(0 0 6px #7daaff); }
.expect-card::after { content: ''; position: absolute; inset: -1px; border: 1px solid #87b3ff88; border-radius: inherit; opacity: 0; pointer-events: none; transition: opacity .5s var(--ease); }
.expect-card.is-lit::after { opacity: 1; }
[data-process-dot].at-rest { animation: rest 2.6s var(--ease) infinite; }
.path-paused [data-process-dot] { animation-play-state: paused; }
@keyframes rest { 50% { opacity: .45; } }
@media (max-width:767px) { .expect-flow { grid-template-columns: 1fr; gap: 20px; } .expect-card { padding: 24px; padding-left: 70px; } .expect-card > svg { position: absolute; left: 24px; top: 27px; } .expect-card > .eyebrow { position: static; display: block; margin-bottom: 10px; } h3 { font-size: 18px; } }
@media (prefers-reduced-motion: reduce) { [data-process-dot] { display: none; } }
</style>
