<script setup lang="ts">
import { landingFaq } from "~/data/landingFaq";
const open = ref<Record<number, boolean>>({});
const id = useId();
</script>
<template>
  <section id="faq"
           class="landing-calendar-faq"
           aria-labelledby="landing-faq-title">
    <div class="faq-inner">
      <div class="faq-heading" data-reveal>
        <p class="eyebrow">NOT SURE?</p>
        <h2 id="landing-faq-title">Common questions</h2>
      </div>
      <div class="faq-list">
        <article v-for="(faq, index) in landingFaq"
                 :key="faq.question"
                 class="faq-row"
                 :class="{ open: open[index] }"
                 data-reveal
                 :style="{ '--index': index }">
          <h3>
            <button type="button"
                    :aria-expanded="!!open[index]"
                    :aria-controls="`${id}-${index}`"
                    @click="open[index] = !open[index]">
              <span class="faq-index" aria-hidden="true">0{{ index + 1 }}</span><span class="faq-question">{{ faq.question }}</span><span class="faq-plus" aria-hidden="true"><i /><i /></span>
            </button>
          </h3>
          <div :id="`${id}-${index}`"
               class="faq-answer"
               :inert="!open[index]">
            <div><p>{{ faq.answer }}<template v-if="faq.conditions">{{ ' ' }}<a class="conditions" href="/conditions" target="_blank" rel="noopener">Conditions apply.<span class="sr-only"> (opens in a new tab)</span></a></template></p></div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
<style scoped>
.landing-calendar-faq { background: #f5f6f5; color: #182a3e; padding: 12px 0 100px; }
.faq-inner { width: calc(100% - 80px); max-width: 1240px; margin-inline: auto; display: grid; grid-template-columns: 4fr 8fr; gap: 64px; align-items: start; }
.faq-heading { position: sticky; top: calc(var(--landing-header-height,100px) + 24px); }
.faq-heading .eyebrow { color: #6d7988; font-size: 10px; letter-spacing: 1.8px; margin-bottom: 16px; }
.faq-heading h2 { font: 600 40px/1.12 "DM Sans",sans-serif; letter-spacing: -1.6px; max-width: 300px; }
.conditions { white-space: nowrap; text-decoration: underline; text-underline-offset: 3px; color: rgb(var(--brand)); }
.faq-row { position: relative; border-top: 1px solid #dce3e9; isolation: isolate; transition: opacity .5s var(--ease), transform .5s var(--ease); transition-delay: calc(var(--index) * 60ms); }
.faq-row:last-child { border-bottom: 1px solid #dce3e9; }
.faq-row::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 2px; background: rgb(var(--brand)); transform: scaleY(0); transform-origin: top; transition: transform .4s var(--ease); }
.faq-row::after { content: ''; position: absolute; inset: 0; z-index: -1; background: #eaf0fc; opacity: 0; transition: opacity .4s var(--ease); }
.faq-row.open::before { transform: scaleY(1); }
.faq-row.open::after { opacity: 1; }
.faq-row h3 { margin: 0; font: inherit; }
.faq-row button { display: flex; width: 100%; text-align: left; align-items: center; gap: 22px; position: relative; border: 0; background: none; padding: 28px 20px; cursor: pointer; color: #23364b; transition: transform 220ms var(--ease); }
.faq-row button::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 20px; height: 1px; background: rgb(var(--brand)); transform: scaleX(0); transform-origin: left; transition: transform 220ms var(--ease); }
.faq-row button:hover { transform: translateX(4px); }
.faq-row button:hover::after { transform: scaleX(1); }
.faq-index { color: #8b98aa; font-size: 11px; font-variant-numeric: tabular-nums; }
.faq-question { flex: 1; font: 500 19px/1.4 "DM Sans",sans-serif; }
.open .faq-question { color: rgb(var(--brand)); }
.faq-plus { position: relative; width: 16px; height: 16px; flex-shrink: 0; transition: transform .4s var(--ease); }
.faq-plus i { position: absolute; height: 1px; width: 14px; background: currentColor; top: 7px; left: 1px; }
.faq-plus i:last-child { transform: rotate(90deg); }
.open .faq-plus { transform: rotate(45deg); }
.faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transform: translateY(-12px); transition: grid-template-rows .4s var(--ease), opacity .35s var(--ease), transform .4s var(--ease); }
.open .faq-answer { grid-template-rows: 1fr; opacity: 1; transform: none; }
.faq-answer > div { overflow: hidden; min-height: 0; }
.faq-answer p { padding: 0 52px 26px 56px; font-size: 15px; line-height: 1.7; color: #526277; }
button:focus-visible, a:focus-visible { outline: 3px solid #76a4ff; outline-offset: -3px; border-radius: 4px; }
.will-reveal:not(.is-visible) { opacity: 0; transform: translateY(20px); }
@media (max-width:1023px) { .faq-inner { grid-template-columns: 1fr; gap: 36px; } .faq-heading { position: static; } .faq-heading h2 { max-width: none; } }
@media (max-width:767px) { .landing-calendar-faq { padding-bottom: 56px; } .faq-inner { width: calc(100% - 40px); } .faq-heading h2 { font-size: 34px; } .faq-row button { padding: 24px 12px; gap: 14px; } .faq-question { font-size: 18px; } .faq-answer p { padding: 0 28px 24px 42px; font-size: 14px; } }
@media (prefers-reduced-motion:reduce) { *, *::before, *::after { transition: opacity .15s ease-out !important; } .will-reveal:not(.is-visible) { opacity: 1; transform: none; } }
</style>
