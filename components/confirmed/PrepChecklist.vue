<script setup lang="ts">
import { Check, Mail } from 'lucide-vue-next';
const props = defineProps<{ videoPrepared: boolean }>();
const { track } = useAnalytics();
const items = [
  { id: 'invite', label: 'Open the invite in your email' },
  { id: 'calendar', label: 'Click Add to Calendar' },
  { id: 'video', label: 'Watch the intro video' },
];
const checked = ref([false, false, false]);
const count = computed(() => checked.value.filter(Boolean).length);
const celebrate = ref(false);
function toggle(index: number, value: boolean) {
  if (checked.value[index] === value) return;
  checked.value[index] = value;
  celebrate.value = count.value === 3;
  try { sessionStorage.setItem('solvenek-confirmed-prep', JSON.stringify(checked.value)); } catch { /* Session persistence is optional. */ }
  track('confirmed_checklist', { item: items[index]!.id, completed_count: count.value });
}
watch(() => props.videoPrepared, value => { if (value) toggle(2, true); });
onMounted(() => {
  try {
    const value = JSON.parse(sessionStorage.getItem('solvenek-confirmed-prep') || 'null');
    if (Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'boolean')) checked.value = value;
  } catch { /* Keep the usable default when storage is unavailable. */ }
});
</script>
<template>
  <section class="prep glass" :class="{ complete: count === 3 }" aria-labelledby="prep-heading">
    <div class="prep-heading">
      <h2 id="prep-heading">{{ count === 3 ? 'You’re all set.' : 'Your prep checklist' }}<Check v-if="count === 3" class="complete-check" :class="{ celebrate }" :size="18" aria-hidden="true" /></h2>
      <div class="prep-progress" aria-hidden="true">
        <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" /><circle class="progress-value" cx="24" cy="24" r="21" pathLength="3" stroke-dasharray="3" :stroke-dashoffset="3-count" /></svg><span>{{ count }}/3</span>
      </div>
    </div>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ count }} of 3 done</p>
    <div v-for="(item,index) in items" :key="item.id" class="prep-item">
      <label :for="`prep-${item.id}`"><input :id="`prep-${item.id}`" type="checkbox" :checked="checked[index]" @change="toggle(index,($event.target as HTMLInputElement).checked)" /><span>{{ item.label }}</span></label>
      <p v-if="index === 0" class="invite-note"><Mail class="mail-open" :size="17" aria-hidden="true" /><span>Calendly has emailed you a calendar invite with the meeting link.</span></p>
    </div>
  </section>
</template>
<style scoped>
.prep { padding: 20px 24px; margin-top: 26px; }
.prep-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.prep h2 { font-size: 17px; font-weight: 600; letter-spacing: -.4px; display: flex; gap: 10px; align-items: center; }
.prep-progress { width: 44px; height: 44px; position: relative; flex-shrink: 0; display: grid; place-items: center; }
.prep-progress svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); fill: none; stroke: #8aade330; stroke-width: 2; }
.prep-progress .progress-value { stroke: #83adff; stroke-linecap: round; }
.prep-progress span { font-size: 11px; font-variant-numeric: tabular-nums; color: #bdcfee; }
.prep-item + .prep-item { margin-top: 13px; }
label { display: flex; align-items: center; gap: 12px; cursor: pointer; min-height: 30px; font-size: 14px; line-height: 1.4; color: #e5edfc; }
input { width: 18px; height: 18px; flex-shrink: 0; margin: 0; accent-color: #497fff; cursor: pointer; }
input:focus-visible { outline: 2px solid #b6d2ff; outline-offset: 5px; }
.invite-note { margin: 5px 0 0 30px; display: flex; align-items: start; gap: 8px; color: #a9bbd4; font-size: 11px; line-height: 1.65; max-width: 35ch; }
.invite-note svg { flex-shrink: 0; margin-top: 2px; }
.mail-open :deep(path:last-child) { transform-origin: center 7px; animation: envelope-open .8s var(--ease) .5s both; }
.complete-check { color: #a5caff; }
.complete-check.celebrate { animation: prep-burst .55s var(--ease); }
@keyframes envelope-open { 50% { transform: scaleY(-.6); } }
@keyframes prep-burst { 40% { transform: scale(1.45); opacity: .5; } }
@media (max-width:767px) { .prep { padding: 16px 18px; margin-top: 20px; } .prep-heading { margin-bottom: 8px; } .prep-progress { width: 36px; height: 36px; } label { min-height: 28px; } .prep-item + .prep-item { margin-top: 10px; } }
@media print { .prep { break-inside: avoid; } }
</style>
