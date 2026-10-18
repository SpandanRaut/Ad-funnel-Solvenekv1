<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import PrepChecklist from '~/components/confirmed/PrepChecklist.vue';
import ConfirmedVideo from '~/components/confirmed/ConfirmedVideo.vue';
import ConfirmedExpectations from '~/components/confirmed/ConfirmedExpectations.vue';
import ConfirmedResults from '~/components/confirmed/ConfirmedResults.vue';
import ConfirmedFaq from '~/components/confirmed/ConfirmedFaq.vue';
useSiteSeo('/confirmed');
const { completed: booking } = useBookingGate();
const config = useRuntimeConfig().public;
const root = ref<HTMLElement>();
const videoPrepared = ref(false);
useConfirmedMotion(root);
</script>
<template>
  <div ref="root" class="confirmed-page">
    <SiteHeader variant="dark" />
    <main v-if="booking" id="main-content" class="container confirmation-main" tabindex="-1">
      <section class="confirmation-hero" aria-labelledby="confirmed-heading" data-motion-loops>
        <div class="confirmation-copy">
          <div class="booking-confirmed"><span class="confirmation-seal"><Check :size="25" :stroke-width="2" aria-hidden="true" /></span><p class="eyebrow">CONFIRMED</p></div>
          <h1 id="confirmed-heading"><span><span>You’re booked.</span></span> <span><span>Here’s what</span></span> <span><span>happens next.</span></span></h1>
          <p class="confirmation-subcopy">Your meeting details have been sent to your email. Open the invite in your email and click Add to Calendar.</p>
          <PrepChecklist :video-prepared="videoPrepared" />
        </div>
        <div class="confirmation-media">
          <div class="video-shell glass"><i class="border-beam" aria-hidden="true" /><ConfirmedVideo @prepared="videoPrepared = true" /></div>
          <div class="call-details"><h2>Your call details</h2><div><p><Icon name="CalendarDays" :size="17" /><span>Date and time are in your confirmation email</span></p><p><Icon name="Clock" :size="17" />30 minutes</p><p><Icon name="Video" :size="17" />Google Meet</p></div></div>
        </div>
      </section>
      <ConfirmedExpectations />
      <ConfirmedResults />
      <ConfirmedFaq />
      <section class="contact-band glass">
        <Icon name="MessageCircle" :size="36" /><div><h2>Still have questions?</h2><p>If you have any questions before the call,<br />feel free to reply to your confirmation email.</p></div>
        <a class="primary-button" :href="`mailto:${config.contactEmail}`">Contact Us<Icon name="ArrowRight" :size="17" /></a>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
<style scoped>
.confirmed-page { background: rgb(var(--navy)); color: #edf3ff; overflow: clip; }
.confirmed-page :deep(h1),.confirmed-page :deep(h2),.confirmed-page :deep(h3),.confirmed-page :deep(blockquote) { font-family: "DM Sans",sans-serif; }
.confirmed-page :deep(.glass) { border: 1px solid #82a9e137; border-radius: 16px; background: rgb(20 36 55 / .66); box-shadow: inset 0 1px 0 #c0d6ff0a; backdrop-filter: blur(12px); }
.confirmed-page :deep(.expect-card.glass) { background: rgb(17 31 47 / .65); backdrop-filter: blur(3px); }
.confirmed-page :deep(.result-card.lead-stat) { background: #152a46; border-color: #42679c; }
.confirmation-main { max-width: 1200px; padding-block: 36px 72px; }
.confirmation-hero { display: grid; grid-template-columns: 1fr 1.05fr; gap: 64px; align-items: center; padding-bottom: 68px; }
.booking-confirmed { display: flex; align-items: center; gap: 14px; margin-bottom: 23px; }
.confirmation-seal { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: #fff; background: rgb(var(--brand)); }
.confirmation-seal::after { content: ''; position: absolute; inset: 0; border: 1px solid #93bbff; border-radius: inherit; animation: ring-burst .9s var(--ease) .15s both; }
.confirmation-seal :deep(polyline),.confirmation-seal :deep(path) { stroke-dasharray: 30; stroke-dashoffset: 0; animation: check-draw .6s var(--ease) both; }
.booking-confirmed .eyebrow { font-size: 10px; color: #91b5ff; }
h1 { font-size: clamp(38px,4.3vw,61px); font-weight: 500; line-height: 1.06; letter-spacing: -.055em; }
h1 > span { display: block; overflow: clip; padding-bottom: .13em; margin-bottom: -.13em; }
h1 > span > span { display: block; animation: title-rise .7s var(--ease) both; }
h1 > span + span { color: #7da7ff; margin-top: 7px; }
h1 > span:nth-child(2) > span { animation-delay: .09s; }
h1 > span:nth-child(3) > span { animation-delay: .18s; }
.confirmation-subcopy { color: #b4c4da; font-size: 15px; line-height: 1.75; margin-top: 23px; max-width: 46ch; }
.confirmation-media { align-self: center; min-width: 0; }
.confirmed-page .video-shell { position: relative; padding: 6px; border-color: #6397f06b; box-shadow: 0 0 65px #1d63f51c,inset 0 1px 0 #bad5ff20; overflow: hidden; }
.border-beam { position: absolute; z-index: 2; top: 0; left: 0; width: 35%; height: 2px; background: linear-gradient(90deg,transparent,#b2d3ff,transparent); animation: border-travel 7s linear infinite; }
.call-details { padding: 19px 3px 0; }
.call-details h2 { font-size: 12px; font-weight: 600; color: #dbe7f8; margin-bottom: 13px; }
.call-details > div { display: flex; flex-wrap: wrap; gap: 12px 24px; }
.call-details p { display: flex; align-items: center; gap: 8px; color: #adbed6; font-size: 11px; line-height: 1.5; }
.call-details p:first-child { flex-basis: 100%; }
.call-details svg { color: #89a8d5; flex-shrink: 0; }
.confirmed-page :deep(.expect-section),.confirmed-page :deep(.confirmed-results),.confirmed-page :deep(.answer-wall) { padding-top: 52px; margin-bottom: 64px; border-top: 1px solid #89afe02b; }
.confirmed-page :deep(section > .eyebrow) { color: #8fa9ce; font-size: 10px; margin-bottom: 12px; }
.confirmed-page :deep(section > h2),.confirmed-page :deep(.answer-group > h2) { font-size: clamp(27px,3vw,36px); letter-spacing: -.045em; font-weight: 500; line-height: 1.2; }
.contact-band { display: flex; align-items: center; gap: 24px; padding: 32px; }
.contact-band > svg { color: #82aaff; flex-shrink: 0; }
.contact-band h2 { font-size: 26px; font-weight: 500; letter-spacing: -.8px; margin-bottom: 9px; }
.contact-band p { color: #b0c1d9; font-size: 13px; line-height: 1.7; }
.contact-band .primary-button { margin-left: auto; min-width: 155px; gap: 12px; }
.primary-button:focus-visible { outline: 2px solid #c0d7ff; outline-offset: 5px; }
.motion-offscreen :deep(*),.motion-offscreen :deep(*)::before,.motion-offscreen :deep(*)::after,.tab-hidden :deep(*),.tab-hidden :deep(*)::before,.tab-hidden :deep(*)::after { animation-play-state: paused !important; }
@keyframes check-draw { from { stroke-dashoffset: 30; } }
@keyframes ring-burst { from { transform: scale(.9); opacity: .8; } to { transform: scale(1.9); opacity: 0; } }
@keyframes title-rise { from { transform: translateY(105%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes border-travel { from { transform: translateX(-110%); } to { transform: translateX(400%); } }
@media (min-width:1200px) { .call-details > div { flex-wrap: nowrap; gap: 16px; } .call-details p:first-child { flex-basis: auto; max-width: 230px; } }
@media (min-width:1024px) and (max-width:1199px) { .confirmation-hero { gap: 34px; } h1 { font-size: 46px; } }
@media (max-width:1023px) { .confirmation-hero { grid-template-columns: 1fr; gap: 32px; } .confirmation-copy { max-width: 620px; } .confirmation-media { max-width: 680px; width: 100%; } .wide-break { display: none; } }
@media (max-width:767px) { .confirmation-main { padding-top: 22px; padding-bottom: 40px; } .confirmation-hero { gap: 27px; padding-bottom: 38px; } .booking-confirmed { margin-bottom: 20px; } .confirmation-seal { width: 38px; height: 38px; } h1 { font-size: clamp(34px,9.1vw,48px); line-height: 1.09; } .confirmation-subcopy { font-size: 14px; margin-top: 18px; } .call-details { padding-top: 16px; } .call-details > div { gap: 12px 24px; } .confirmed-page :deep(.expect-section),.confirmed-page :deep(.confirmed-results),.confirmed-page :deep(.answer-wall) { padding-top: 32px; margin-bottom: 40px; } .contact-band { padding: 24px; gap: 16px; flex-wrap: wrap; } .contact-band > svg { width: 28px; } .contact-band h2 { font-size: 23px; } .contact-band p { font-size: 12px; } .contact-band .primary-button { margin: 8px 0 0 44px; min-width: 140px; } }
@media (prefers-reduced-motion:reduce) { h1 > span > span { animation: confirmed-fade .2s ease both; } .confirmation-seal::after,.border-beam { display: none; } }
@keyframes confirmed-fade { from { opacity: .6; } to { opacity: 1; } }
@media print { .confirmed-page { color: #111; background: #fff; overflow: visible; } .confirmed-page :deep(*) { color: #111 !important; animation: none !important; opacity: 1 !important; transform: none !important; backdrop-filter: none !important; } .confirmed-page :deep(.glass) { background: #fff; border-color: #aaa; box-shadow: none; } .confirmation-hero { display: block; } .confirmation-media { margin-top: 24px; } .border-beam,.confirmation-seal::after { display: none; } }
</style>
