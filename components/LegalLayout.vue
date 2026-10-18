<script setup lang="ts">
import { ShieldCheck, ArrowLeft } from "lucide-vue-next";
defineProps<{ eyebrow: string; heading: string; description?: string; thin?: boolean; updated?: string }>();
const root = ref<HTMLElement>();
useLegalMotion(root);
</script>
<template>
  <div ref="root" class="legal-page" :class="{ 'legal-thin': thin }">
    <div class="legal-dark"><SiteHeader variant="dark" cta-to="/#book" /></div>
    <main id="main-content" tabindex="-1">
      <section class="legal-hero">
        <div class="legal-grid" aria-hidden="true" /><div class="legal-arc" aria-hidden="true" />
        <div class="container legal-hero-inner">
          <div>
            <NuxtLink to="/" class="legal-back"><ArrowLeft :size="15" aria-hidden="true" />Back to home</NuxtLink>
            <p class="eyebrow">{{ eyebrow }}</p><h1>{{ heading }}</h1>
            <p v-if="description" class="legal-intro">{{ description }}</p>
            <slot name="hero" />
          </div>
          <div class="legal-hero-art" aria-hidden="true">
            <svg viewBox="0 0 300 160" fill="none"><path d="M0 100H90Q120 100 120 70V40Q120 20 145 20H300" stroke="#7eaaff" stroke-opacity=".45" /><circle cx="145" cy="20" r="4" fill="#acd0ff" /></svg>
            <div><ShieldCheck :size="42" :stroke-width="1.2" /></div>
          </div>
        </div>
      </section>
      <div class="legal-body"><slot /></div>
      <slot name="closing" />
      <p v-if="updated" class="legal-updated container">Last updated: <time :datetime="updated">{{ updated }}</time></p>
    </main>
    <SiteFooter />
  </div>
</template>
<style scoped>
.legal-page { background: #f5f6f5; color: #192c42; }
.legal-dark, .legal-hero { background: rgb(var(--navy)); color: #f8faff; }
.legal-hero { position: relative; isolation: isolate; overflow: clip; }
.legal-hero-inner { min-height: 45svh; display: grid; grid-template-columns: 1fr 260px; gap: 70px; align-items: center; padding-block: 38px 80px; }
.legal-back { display: inline-flex; align-items: center; gap: 8px; color: #b9cce9; font-size: 13px; min-height: 44px; margin-bottom: 18px; }
.legal-hero .eyebrow { color: #97baff; margin-bottom: 20px; }
.legal-hero h1 { font: 600 clamp(38px, 4.3vw, 58px)/1.1 "DM Sans", sans-serif; letter-spacing: -.045em; max-width: 770px; text-wrap: balance; }
.legal-intro { max-width: 720px; color: #bdcadb; font-size: 17px; line-height: 1.65; margin-top: 22px; }
.legal-grid { position: absolute; inset: 0; z-index: -1; background: linear-gradient(#a5c6ff09 1px, transparent 1px), linear-gradient(90deg, #a5c6ff09 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse at 85% 40%, #000, transparent 75%); }
.legal-arc { position: absolute; z-index: -1; width: 800px; height: 800px; right: -430px; top: -200px; border: 1px solid #3576d84d; border-radius: 50%; box-shadow: -40px 0 100px #1554c015, inset 30px 0 70px #1554c015; }
.legal-hero-art { position: relative; height: 200px; display: grid; place-items: center; }
.legal-hero-art > svg { position: absolute; width: 300px; height: 160px; inset: 20px auto auto -20px; }
.legal-hero-art > div { display: grid; place-items: center; width: 132px; height: 132px; color: #accbff; border: 1px solid #bad5ff30; border-radius: 22px; background: linear-gradient(145deg, #38597a66, #16283c88); box-shadow: 0 24px 70px #0003, inset 0 1px 0 #fff1; transform: rotate(-9deg); backdrop-filter: blur(10px); }
.legal-body { padding-bottom: 80px; }
.legal-updated { color: #526277; font-size: 13px; padding-block: 28px; }
.legal-page :deep(a:focus-visible), .legal-page :deep(button:focus-visible), .legal-page :deep(summary:focus-visible) { outline: 3px solid #608fff; outline-offset: 4px; }
.legal-thin .legal-hero-inner { min-height: 300px; padding-bottom: 58px; }
.legal-page :deep([data-legal-reveal]) { transition: opacity .65s var(--ease), transform .65s var(--ease); transition-delay: calc(var(--index, 0) * 65ms); }
.legal-page :deep(.legal-pending) { opacity: 0; transform: translateY(18px); }
@media (max-width: 1023px) { .legal-hero-inner { grid-template-columns: 1fr 180px; gap: 32px; } .legal-hero-art > svg { width: 220px; } }
@media (max-width: 760px) { .legal-hero-inner { min-height: 0; padding-block: 20px 72px; grid-template-columns: 1fr; gap: 0; } .legal-hero-art { display: none; } .legal-hero h1 { font-size: 39px; } .legal-intro { font-size: 16px; } .legal-back { margin-bottom: 14px; } .legal-thin .legal-hero-inner { min-height: 0; padding-bottom: 48px; } .legal-body { padding-bottom: 48px; } }
@media (prefers-reduced-motion: reduce) { .legal-page :deep(*) { animation: none !important; transition: none !important; } .legal-page :deep(.legal-pending) { opacity: 1; transform: none; } }
@media print {
  .legal-page { background: #fff !important; color: #000 !important; }
  .legal-dark, .legal-page :deep(.site-footer), .legal-back, .legal-hero-art, .legal-grid, .legal-arc, .legal-page :deep(.conditions-closing), .legal-page :deep(.privacy-toc) { display: none !important; }
  .legal-hero { background: #fff; color: #000; }
  .legal-hero-inner, .legal-thin .legal-hero-inner { min-height: 0; display: block; padding: 10px 0 24px; }
  .legal-hero h1 { font-size: 28px; }
  .legal-intro, .legal-hero .eyebrow, .legal-updated { color: #000; }
  .container { width: 100%; max-width: none; }
  .legal-body { padding: 0; }
  .legal-page :deep(*) { animation: none !important; transition: none !important; box-shadow: none !important; text-shadow: none !important; }
  .legal-page :deep(.legal-pending) { opacity: 1; transform: none; }
}
</style>
