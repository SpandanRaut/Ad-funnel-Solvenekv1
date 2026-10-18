<script setup lang="ts">
import { Megaphone, Filter, MessageCircle, Calendar } from "lucide-vue-next";
const processIcons = { Megaphone, Filter, MessageCircle, Calendar };
import { useLandingMotion } from "~/composables/landing/useLandingMotion";
import { landingCalendarFocus } from "~/composables/landing/landingCalendarFocus";
import { useAdaptiveCalendar } from "~/composables/landing/useAdaptiveCalendar";
import type { CalendlyStage } from "~/composables/landing/useCalendlyStage";
import LandingCalendar from "~/components/landing/LandingCalendar.vue";
import LandingFaq from "~/components/landing/LandingFaq.vue";
import { discoveryTopics } from "~/data/discovery";
import { applicationForm, featuredTestimonials, hero as heroCopy, moreTestimonials } from "~/data/landing";
useSiteSeo("/");
useLandingMotion();
useAttentionMotion();
const guaranteePhrase = "your next 30 days of management are on us";
const guaranteeParts = heroCopy.subhead.split(guaranteePhrase);
const heroLeft = ref<HTMLElement>();
const stage = ref<CalendlyStage>("date");
const calendarHeight = ref(740);
const { showSupport, showTopics, showQuotes } = useAdaptiveCalendar(heroLeft, stage, calendarHeight);
function calendarLayout(value: { stage: CalendlyStage; height: number }) {
  const enteringDetails = value.stage === "details" && stage.value !== "details";
  stage.value = value.stage;
  calendarHeight.value = value.height;
  if (enteringDetails && document.getElementById("calendar")!.getBoundingClientRect().top < 0) {
    document.getElementById("calendar")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
}
const flow = [
  {
    name: "ATTRACT",
    icon: "Megaphone",
    title: "Reach Local Homeowners",
    copy: "We put your business in front of homeowners planning kitchen and bathroom remodels.",
  },
  {
    name: "QUALIFY",
    icon: "Filter",
    title: "Filter Out Tire-Kickers",
    copy: "We screen inquiries for project type, budget, and readiness before they reach you.",
  },
  {
    name: "FOLLOW UP",
    icon: "MessageCircle",
    title: "Turn Interest Into Conversations",
    copy: "We follow up with qualified homeowners so promising inquiries don’t go cold.",
  },
  {
    name: "BOOK",
    icon: "Calendar",
    title: "Fill Your Estimate Calendar",
    copy: "Qualified homeowners get scheduled for estimates. You focus on winning the projects.",
  },
];
</script>
<template>
  <div class="landing-page premium-landing">
    <div @click="landingCalendarFocus"><SiteHeader variant="dark" /></div>
    <main id="main-content" tabindex="-1">
      <div class="landing-dark">
        <div class="hero-grid" aria-hidden="true" />
        <div class="landing-arc" aria-hidden="true" />
        <section class="container hero">
          <div ref="heroLeft" class="hero-copy">
            <div class="hero-anchor" data-measure="anchor">
              <p class="eyebrow hero-enter">{{ heroCopy.eyebrow }}</p>
              <h1 class="hero-enter">
                <span class="headline-mask"><span><span class="nowrap">8–12</span> More Qualified <span class="nowrap">Kitchen &amp; Bath</span> Estimates.</span></span> <span class="headline-mask highlight"><span class="headline-highlight">{{ heroCopy.headlineHighlight }}</span></span>
              </h1>
            </div>
            <div class="hero-support adaptive-slot"
                 :class="{ expanded: showSupport }"
                 :inert="!showSupport">
              <div class="slot-clip">
                <div data-measure="support">
                  <div class="guarantee-strip hero-enter">
                    <Icon name="ShieldCheck" :size="21" />
                    <i class="shield-ripple" aria-hidden="true" /><i class="shield-ripple" aria-hidden="true" />
                    <div class="guarantee-copy">{{ guaranteeParts[0] }}<span class="guarantee-marker"><template v-for="(word,index) in guaranteePhrase.split(' ')" :key="index">{{ index ? ' ' : '' }}<span class="marker-word" :style="{ '--word': index }">{{ word }}{{ index === guaranteePhrase.split(' ').length - 1 ? guaranteeParts[1] : '' }}</span></template></span> <a class="conditions" href="/conditions" target="_blank" rel="noopener">{{ heroCopy.conditionsLabel }}<span class="sr-only"> (opens in a new tab)</span></a></div>
                  </div>
                  <ul class="outcome-chips hero-enter"><li v-for="item in heroCopy.bullets" :key="item"><Icon name="Check" :size="14" />{{ item }}</li></ul>
                  <div class="proof-line hero-enter" tabindex="0">
                    <div class="avatar-stack" aria-hidden="true"><span>SR</span><span>PS</span><span>UK</span></div>
                    <div><p>The same system generated <span class="proof-figure"><strong><span class="proof-number"><span class="proof-value">$17,000</span><span class="proof-counter" aria-hidden="true" data-proof-value="money" data-value="$0" /></span> in <span class="proof-number"><span class="proof-value">11</span><span class="proof-counter" aria-hidden="true" data-proof-value="weeks" data-value="0" /></span> weeks</strong></span> for Simca Laboratories. Now built for kitchen &amp; bath remodelers.</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="adaptive-topics adaptive-slot"
                 :class="{ expanded: showTopics }"
                 :inert="!showTopics">
              <div class="slot-clip">
                <section data-measure="topics">
                  <h2>What we'll cover</h2><article v-for="(topic, index) in discoveryTopics"
                                                    :key="topic.title"
                                                    class="adaptive-topic"
                                                    :style="{ '--index': index }">
                    <Icon :name="topic.icon" :size="24" /><div><h3>{{ topic.title }}</h3><p>{{ topic.copy }}</p></div>
                  </article>
                </section>
              </div>
            </div>
            <div class="adaptive-quotes adaptive-slot"
                 :class="{ expanded: showQuotes }"
                 :inert="!showQuotes">
              <div class="slot-clip"><div data-measure="quotes"><figure v-for="item in moreTestimonials" :key="item.business"><blockquote>{{ item.quote }}</blockquote><figcaption>{{ item.name }}<span>{{ item.role }}, {{ item.business }}</span></figcaption></figure></div></div>
            </div>
          </div>
          <div id="application" class="calendar-stage">
            <div class="calendar-glow" aria-hidden="true" />
            <div class="stack-sheet stack-sheet-back" aria-hidden="true" />
            <div class="stack-sheet stack-sheet-front" aria-hidden="true" />
            <div class="calendar-arrival"><div id="book" class="calendar-frame" tabindex="-1"><div class="border-beam" aria-hidden="true" /><LandingCalendar @layout="calendarLayout" /></div></div>
          </div>
        </section><section id="approach"
                           class="container process-story"
                           aria-label="Our acquisition process">
          <svg class="story-line measured-story-line" data-measured-svg fill="none" aria-hidden="true">
            <path data-path-track class="path-track" />
            <path data-process-path class="path-light" />
            <g data-path-nodes class="path-nodes" />
            <g data-process-dot class="process-dot"><circle class="dot-halo" r="12" /><circle r="4" fill="#dbeaff" /></g>
          </svg>
          <article v-for="(item, index) in flow"
                   :key="item.name"
                   data-reveal
                   class="story-card"
                   :style="{ '--index': index }">
            <div class="story-number">0{{ index + 1 }}</div><component :is="processIcons[item.icon as keyof typeof processIcons]" :size="32" :stroke-width="1.6" aria-hidden="true" />
            <div class="story-card-copy"><p class="story-label">{{ item.name }}</p><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div>
          </article>
        </section>
      </div>
      <section class="landing-results" aria-label="Client results">
        <div class="container results-bento">
          <figure v-for="(item, index) in [featuredTestimonials[1], featuredTestimonials[0], ...moreTestimonials]"
                  :key="item.business"
                  class="bento-card"
                  :class="{ 'stat-card': item.result, 'lead-stat': index === 0 }"
                  data-reveal
                  data-spotlight
                  :style="{ '--index': index }">
            <h2 v-if="item.result"
                class="result-heading"
                :aria-label="item.result">
              <span class="result-number"
                    aria-hidden="true"
                    :data-count="Number(item.result.split(' ')[0].replace(/[^0-9]/g, ''))">{{ item.result.split(' ')[0] }}</span>
              <span class="result-caption" aria-hidden="true">{{ item.result.slice(item.result.indexOf(' ') + 1) }}</span>
            </h2>
            <span v-else
                  class="quote-glyph"
                  aria-hidden="true">&ldquo;</span>
            <blockquote>{{ item.quote }}</blockquote>
            <figcaption><span class="author-avatar" aria-hidden="true">{{ item.name.split(' ').map(part => part[0]).slice(0, 2).join('') }}</span><div>{{ item.name }}<span>{{ item.role }}, {{ item.business }}</span></div></figcaption>
          </figure>
        </div>
      </section>
      <LandingFaq />
      <section class="landing-final">
        <div class="container close-inner" data-reveal>
          <h2>{{ applicationForm.title }}</h2><button type="button"
                                                      class="primary-button"
                                                      @click="landingCalendarFocus">
            See if We're a Fit <Icon name="ArrowRight" :size="17" />
          </button>
        </div>
      </section>
    </main>
    <SiteFooter />
    <div class="mobile-calendar-cta" inert>
      <button type="button"
              class="primary-button"
              @click="landingCalendarFocus">
        See if We're a Fit <Icon name="ArrowRight" :size="17" />
      </button>
    </div>
  </div>
</template>
<style scoped src="~/assets/css/landing/premium.css" />
<style scoped src="~/assets/css/landing/attention.css" />
<style scoped>
/* Copy fit only: the approved lower sections and calendar behavior are unchanged. */
.premium-landing .hero h1 { font-size: clamp(34px, 3vw, 43px); line-height: 1.12; letter-spacing: -1.6px; text-wrap: balance; }
.premium-landing .hero h1 .headline-highlight { display: inline; color: rgb(var(--brand)); box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.hero-copy .eyebrow { margin-bottom: 18px; }
.guarantee-strip { margin-top: 20px; padding: 14px 16px; line-height: 1.55; }
a.conditions { font-size: inherit; text-decoration: underline; text-underline-offset: 3px; }
.outcome-chips { display: grid; gap: 8px; margin: 20px 0; }
.outcome-chips li { display: flex; align-items: start; padding: 0; border: 0; border-radius: 0; background: none; font-size: 15px; line-height: 1.45; animation: hero-enter .7s var(--ease) both; }
.outcome-chips li:nth-child(1) { animation-delay: 310ms; }
.outcome-chips li:nth-child(2) { animation-delay: 370ms; }
.outcome-chips li:nth-child(3) { animation-delay: 430ms; }
.outcome-chips li:nth-child(4) { animation-delay: 490ms; }
.outcome-chips svg { margin-top: 4px; }
.proof-line p { font-size: 13px; font-weight: 400; max-width: none; }
.proof-line strong { font-weight: 700; }
#book:focus-visible { outline: 3px solid #91b7ff; outline-offset: 5px; }
@media (max-width: 1199px) and (min-width: 1024px) { .premium-landing .hero h1 { font-size: 34px; } }
@media (max-width: 1023px) { .premium-landing .hero h1 { font-size: clamp(32px, 5vw, 43px); } .outcome-chips { margin-block: 28px 20px; } }
@media (max-width: 767px) { .premium-landing .hero h1 { font-size: clamp(29px, 7.5vw, 38px); line-height: 1.12; letter-spacing: -1px; } .guarantee-strip { margin-top: 20px; } .outcome-chips li { font-size: 15px; } }
@media (max-height: 800px) and (min-width: 1024px) { .hero-copy .eyebrow { margin-bottom: 12px; } .guarantee-strip { margin-top: 12px; padding-block: 12px; } .outcome-chips { gap: 6px; margin-block: 12px; } }
.nowrap { white-space: nowrap; }
.premium-landing .hero h1 .headline-mask { display: block; }
.premium-landing .hero h1 .headline-mask > span { display: block; text-wrap: balance; }
.premium-landing .hero h1 .headline-mask.highlight > span { color: rgb(var(--brand)); }
.premium-landing .hero h1 .headline-mask:first-child span { color: #f8faff; }
.process-story { row-gap: 24px; }
.story-card { min-height: 230px; gap: 0 18px; }
.story-card .story-label { color: #a4bce0; font-size: 11px; line-height: 1.4; font-weight: 600; letter-spacing: 2px; margin: 4px 40px 12px 0; }
.story-card h3 { color: #f8faff; font-size: 20px; line-height: 1.25; font-weight: 600; letter-spacing: -.35px; margin: 0 0 12px; }
.story-card p { max-width: none; }
.story-number { top: 20px; right: 18px; }
@media (max-width: 1199px) and (min-width: 768px) { .story-card { padding: 28px 22px; grid-template-columns: 32px 1fr; gap: 0 14px; } }
@media (max-width: 767px) { .story-card { padding: 26px 20px; grid-template-columns: 28px 1fr; gap: 0 12px; min-height: 230px; } .story-card > svg { width: 28px; } .story-card h3 { font-size: 19px; } .premium-landing .hero h1 .headline-mask > span { animation: headline-enter .8s var(--ease) both; } .premium-landing .hero h1 .headline-mask:nth-child(2) > span { animation-delay: 70ms; } .headline-mask.highlight > span::after { display: block; } }
</style>

<style scoped>
.process-story { isolation: isolate; }
.process-story .measured-story-line { display: block; position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; }
.process-story .story-card { background: rgb(17 31 47 / .65); backdrop-filter: blur(3px); }
.process-story .path-track { stroke: #7199cc55; }
.path-nodes :deep(circle) { fill: #6991c7; opacity: .55; }
.path-nodes :deep(circle.is-lit) { fill: #c6dfff; opacity: 1; filter: drop-shadow(0 0 7px #609cff); }
.process-dot.at-rest { animation: process-rest 2.6s var(--ease) infinite; transform-box: fill-box; transform-origin: center; }
.process-dot.at-rest .dot-halo { animation: process-halo 2.6s var(--ease) infinite; transform-box: fill-box; transform-origin: center; }
.path-paused .process-dot,.path-paused .dot-halo { animation-play-state: paused; }
@keyframes process-rest { 50% { opacity: .6; } }
@keyframes process-halo { 50% { transform: scale(1.35); } }
@media (prefers-reduced-motion: reduce) { .process-dot { display: none; } }
</style>
