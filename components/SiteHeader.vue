<script setup lang="ts">
withDefaults(defineProps<{ variant?: "dark" | "light"; ctaTo?: string }>(), {
  variant: "light",
  ctaTo: "/#approach",
});
const route = useRoute();
</script>
<template>
  <header class="site-header" :class="variant">
    <div class="container header-inner">
      <BrandLockup :variant="variant === 'dark' ? 'reversed' : 'color'" />
      <nav aria-label="Main navigation">
        <NuxtLink :to="route.path === '/confirmed' ? '/confirmed#faq' : '/#faq'" class="faq-link">FAQ</NuxtLink>
        <NuxtLink v-if="variant === 'dark'" :to="ctaTo" class="header-cta">
          See if We're a Fit <Icon name="ArrowRight" :size="14" />
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
<style scoped>
.site-header.dark nav > a.header-cta { display: inline-flex; min-height: 44px; }
/* Keep both remaining destinations available in the compact navigation. */
@media (max-width: 420px) {
  .site-header.dark nav > a.faq-link { display: inline-flex; }
  .site-header nav { gap: 12px; }
  .header-cta { gap: 6px; padding-inline: 10px; }
}
</style>
