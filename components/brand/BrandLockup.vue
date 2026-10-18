<script setup lang="ts">
import BrandMark from "./BrandMark.vue";
withDefaults(defineProps<{ variant?: "color" | "reversed" }>(), { variant: "color" });
const entering = ref(false);
const consumed = useState("solvenek-brand-intro", () => false);
onMounted(() => {
  if (consumed.value) return;
  consumed.value = true;
  try {
    if (sessionStorage.getItem("solvenek-brand-intro")) return;
    sessionStorage.setItem("solvenek-brand-intro", "1");
  } catch { /* Keep the in-memory once-only behavior when storage is unavailable. */ }
  entering.value = true;
});
</script>
<template>
  <NuxtLink to="/" class="wordmark brand-lockup" aria-label="Solvenek">
    <BrandMark :variant="variant" :enter="entering" @animationend="entering = false" />
    <span>SOLVENEK</span>
  </NuxtLink>
</template>
<style scoped>
.brand-lockup { display: inline-flex; align-items: center; gap: 11px; flex-shrink: 0; }
.brand-lockup:focus-visible { outline: 2px solid currentColor; outline-offset: 6px; border-radius: 2px; }
.brand-lockup :deep(.brand-mark) { height: 28px; width: auto; flex-shrink: 0; overflow: visible; }
.brand-lockup:hover :deep(.mark-navy), .brand-lockup:focus-visible :deep(.mark-navy) { transform: translate(-16px, -16px); }
.brand-lockup:hover :deep(.mark-blue), .brand-lockup:focus-visible :deep(.mark-blue) { transform: translate(16px, 16px); }
@media (max-width: 767px) { .brand-lockup { gap: 10px; } .brand-lockup :deep(.brand-mark) { height: 24px; } }
</style>
