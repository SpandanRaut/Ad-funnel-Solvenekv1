<script setup lang="ts">
const config = useRuntimeConfig().public;
</script>
<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <BrandLockup variant="reversed" />
      <p>AI growth systems<br />for service businesses.</p>
      <div class="footer-right">
        <nav aria-label="Footer navigation">
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <span class="footer-contact"><span>Contact</span> <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></span>
        </nav>
        <small
          >© {{ new Date().getFullYear() }} Solvenek. All rights
          reserved.</small
        >
      </div>
    </div>
  </footer>
</template>
<style scoped>
.footer-right { text-align: right; }
.footer-right nav { align-items: center; flex-wrap: wrap; gap: 12px 28px; }
.footer-contact { display: inline-flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.footer-contact > span { opacity: .74; }
.footer-contact a { text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 767px) {
  .footer-right { align-items: flex-start; flex-direction: column; text-align: left; }
  .footer-right nav { justify-content: flex-start; }
}
</style>
