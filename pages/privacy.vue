<script setup lang="ts">
// TODO(legal-review): Owner/counsel must confirm identity, contact details, retention and applicable rights before publication.
import { privacySections } from "~/composables/privacyContent";
useSiteSeo("/privacy");
const config = useRuntimeConfig().public;
const active = ref<string>(privacySections[0].id);
let frame = 0;
let dispose = () => {};
onMounted(() => {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".privacy-section"));
  function update() {
    frame = 0;
    let current: string | undefined = sections[0]?.id;
    for (const section of sections) if (section.getBoundingClientRect().top <= Math.min(200, innerHeight * .25)) current = section.id;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 8) current = sections.at(-1)?.id;
    if (current) active.value = current;
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
  dispose = () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
});
onBeforeUnmount(() => dispose());
</script>
<template>
  <LegalLayout eyebrow="PRIVACY POLICY" heading="Privacy Policy" description="How we handle your information." thin>
    <template #hero><p v-if="config.legalEffectiveDate" class="privacy-effective">Effective date: <time :datetime="config.legalEffectiveDate">{{ config.legalEffectiveDate }}</time></p></template>
    <div class="container privacy-layout">
      <aside class="privacy-toc">
        <nav class="desktop-contents" aria-label="Contents"><p>Contents</p><NuxtLink v-for="section in privacySections" :key="section.id" :to="`/privacy#${section.id}`" :aria-current="active === section.id ? 'location' : undefined">{{ section.title }}</NuxtLink></nav>
        <details class="mobile-contents"><summary>Contents</summary><nav aria-label="Contents"><NuxtLink v-for="section in privacySections" :key="section.id" :to="`/privacy#${section.id}`" :aria-current="active === section.id ? 'location' : undefined">{{ section.title }}</NuxtLink></nav></details>
      </aside>
      <div class="privacy-reading">
        <section v-for="(section, index) in privacySections" :id="section.id" :key="section.id" class="privacy-section" data-legal-reveal :style="{ '--index': index % 3 }" :aria-labelledby="`${section.id}-heading`">
          <h2 :id="`${section.id}-heading`">{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <template v-if="section.id === 'who-we-are'">
            <p v-if="config.legalName">Legal name: {{ config.legalName }}</p>
            <p v-if="config.businessAddress">Business address: {{ config.businessAddress }}</p>
          </template>
          <template v-if="section.id === 'sharing'">
            <p><a href="https://calendly.com/legal/privacy-notice" target="_blank" rel="noopener">Calendly privacy notice<span class="sr-only"> (opens in a new tab)</span></a></p>
            <p v-if="config.gaId">Google Analytics records page views, button use, calendar stages, FAQ interactions and completed bookings. <a href="https://policies.google.com/privacy">Google privacy policy</a></p>
            <p v-if="config.metaPixelId">Meta Pixel records page views and interactions, including Schedule when a booking is completed. <a href="https://www.facebook.com/privacy/policy/">Meta privacy policy</a></p>
            <p v-if="!config.gaId && !config.metaPixelId">Analytics and advertising pixels are not enabled on this site.</p>
          </template>
          <p v-if="section.id === 'contact' && config.contactEmail"><a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></p>
        </section>
      </div>
    </div>
  </LegalLayout>
</template>
<style scoped>
.privacy-effective { color: #acbed8; font-size: 13px; margin-top: 20px; }
.privacy-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 78px; align-items: start; padding-top: 64px; }
.privacy-toc { position: sticky; top: 32px; }
.desktop-contents { display: flex; flex-direction: column; border-left: 1px solid #d7e0ec; }
.desktop-contents > p { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #65758c; margin: 0 0 18px 18px; }
.privacy-toc a { display: block; color: #52667e; font-size: 13px; padding: 9px 18px; border-left: 2px solid transparent; margin-left: -1px; line-height: 1.5; }
.privacy-toc a[aria-current] { color: #1e50ad; border-left-color: #0553fd; background: #eaf0fb; }
.privacy-reading { max-width: 68ch; font-size: 17px; line-height: 1.8; }
.privacy-section { scroll-margin-top: 120px; padding-bottom: 34px; margin-bottom: 34px; border-bottom: 1px solid #dce4ec; }
.privacy-section:last-child { border: 0; margin-bottom: 0; padding-bottom: 0; }
.privacy-section h2 { font: 600 27px/1.25 "DM Sans", sans-serif; letter-spacing: -.6px; margin-bottom: 20px; }
.privacy-section p { margin-top: 16px; color: #445870; }
.privacy-section a { color: #1c53b9; text-decoration: underline; text-underline-offset: 4px; overflow-wrap: anywhere; }
.mobile-contents { display: none; }
@media (max-width: 1023px) { .privacy-layout { gap: 40px; grid-template-columns: 190px minmax(0, 1fr); } }
@media (max-width: 760px) { .privacy-layout { grid-template-columns: 1fr; gap: 36px; padding-top: 34px; } .privacy-toc { position: static; } .desktop-contents { display: none; } .mobile-contents { display: block; border: 1px solid #d6e0ec; border-radius: 12px; background: #fff; } .mobile-contents summary { padding: 16px 20px; font-size: 15px; font-weight: 500; cursor: pointer; min-height: 44px; } .mobile-contents nav { padding: 0 14px 14px; } .privacy-reading { font-size: 17px; } .privacy-section h2 { font-size: 25px; } }
@media print { .privacy-layout { display: block; padding: 0; } .privacy-toc { display: none; } .privacy-reading { max-width: none; font-size: 12pt; } .privacy-section { padding-bottom: 14px; margin-bottom: 14px; } .privacy-section h2 { break-after: avoid; font-size: 18pt; } .privacy-section p, .privacy-section a, .privacy-effective { color: #000; } }
</style>
