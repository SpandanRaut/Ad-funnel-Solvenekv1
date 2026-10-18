<script setup lang="ts">
function skip(event: MouseEvent) {
  event.preventDefault();
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;
  main.id ||= "main-content";
  main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
  main.scrollIntoView({ behavior: "instant", block: "start" });
}
</script>
<template><a class="skip-link" href="#main-content" @click="skip">Skip to content</a></template>
<style scoped>
.skip-link { position: fixed; top: 12px; left: 12px; z-index: 10000; background: #fff; color: #13233a; padding: 14px 20px; border-radius: 6px; transform: translateY(-160%); font-weight: 600; min-height: 44px; }
.skip-link:focus { transform: translateY(0); outline: 3px solid #80aaff; outline-offset: 3px; }
@media print { .skip-link { display: none; } }
</style>
