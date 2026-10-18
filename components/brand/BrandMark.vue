<script setup lang="ts">
withDefaults(defineProps<{ variant?: "color" | "reversed"; enter?: boolean; pulse?: boolean }>(), { variant: "color", enter: false, pulse: false });
</script>
<template>
  <svg class="brand-mark" :class="[variant, { entering: enter, pulse }]" viewBox="0 0 300 376" width="22.34" height="28" aria-hidden="true" focusable="false">
    <path class="mark-navy" d="M145.5 1 Q153 -1 161 3 L233 45 L96 128 Q83 136 83 147 Q83 158 96 165 L133.5 187.5 L133.5 276.5 L20 209 Q1 198 1 181 L1 108 Q1 88 18 77 L137 5 Q141 2 145.5 1Z" />
    <path class="mark-blue" d="M170 94 L283 161 Q298 170 298 187 L298 273 Q298 287 284 297 L165 371 Q151 380 136 372 L67 331 L205 247 Q217 240 217 228 Q217 218 207 211 L170 188Z" />
  </svg>
</template>
<style scoped>
.brand-mark { --mark-navy: #001d61; --mark-blue: #1d5ef0; display: block; overflow: visible; }
.brand-mark.reversed { --mark-navy: #eaf0ff; }
.mark-navy { fill: var(--mark-navy); }
.mark-blue { fill: var(--mark-blue); }
path { transition: transform 200ms var(--ease, ease); }
.entering .mark-navy { animation: mark-navy-enter 600ms var(--ease, ease) both; }
.entering .mark-blue { animation: mark-blue-enter 600ms var(--ease, ease) both; }
.pulse { animation: brand-pulse 1800ms ease-in-out infinite; }
@keyframes mark-navy-enter { from { opacity: 0; transform: translate(-80px, -80px); } to { opacity: 1; transform: translate(0, 0); } }
@keyframes mark-blue-enter { from { opacity: 0; transform: translate(80px, 80px); } to { opacity: 1; transform: translate(0, 0); } }
@keyframes brand-pulse { 50% { opacity: .55; transform: scale(.97); } }
@media (prefers-reduced-motion: reduce) { .brand-mark, path { animation: none !important; transition: none !important; transform: none !important; } }
</style>
