<script setup lang="ts">
import { CalendarDays, ChartNoAxesCombined, CircleHelp, Clock, Handshake, MessagesSquare, ShieldCheck, Wallet } from 'lucide-vue-next';
import { confirmedFaq, objectionFaq } from '~/data/faq';
// Source answers marked TODO are unapproved and must never be published.
const before = objectionFaq.filter(item => !item.todo);
const identicalCost = before.some(item => item.question === 'What does it cost?' && confirmedFaq.some(other => other.question === 'How much does it cost?' && other.answer === item.answer));
const questions = confirmedFaq.filter(item => !(identicalCost && item.question === 'How much does it cost?'));
const groups = [ { heading: 'Before your call', items: before, primary: true }, { heading: 'Questions you might have', items: questions, primary: false } ];
function topic(question: string) {
  if (/cost/i.test(question)) return Wallet;
  if (/guarantee|perform/i.test(question)) return ShieldCheck;
  if (/reschedule|cancel/i.test(question)) return CalendarDays;
  if (/ROI|leads/i.test(question)) return ChartNoAxesCombined;
  if (/busy|soon/i.test(question)) return Clock;
  if (/quality|different/i.test(question)) return Handshake;
  if (/sales/i.test(question)) return MessagesSquare;
  return CircleHelp;
}
</script>
<template>
  <section id="faq" class="answer-wall" tabindex="-1">
    <section v-for="group in groups.filter(item => item.items.length)" :key="group.heading" class="answer-group" :class="{ primary: group.primary }" :aria-labelledby="group.primary ? 'before-heading' : 'questions-heading'">
      <h2 :id="group.primary ? 'before-heading' : 'questions-heading'">{{ group.heading }}</h2>
      <div class="answer-grid">
        <article v-for="(item,index) in group.items" :key="item.question" class="answer-card glass" :class="{ 'answer-long': item.answer.length > 280 }" data-confirmed-reveal data-confirmed-spotlight :style="{ '--stagger': index % 3 }">
          <span class="topic-chip"><component :is="topic(item.question)" :size="21" :stroke-width="1.6" aria-hidden="true" /></span>
          <h3>{{ item.question }}</h3><p>{{ item.answer }}</p>
        </article>
      </div>
    </section>
  </section>
</template>
<style scoped>
.answer-wall { scroll-margin-top: 116px; }
.answer-group + .answer-group { margin-top: 48px; }
.answer-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; margin-top: 28px; }
.primary .answer-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24px; }
.answer-card { position: relative; isolation: isolate; overflow: hidden; padding: 26px; transition: transform .25s var(--ease); }
.primary .answer-card { padding: 32px; }
.answer-card::before { content: ''; position: absolute; z-index: -1; width: 440px; height: 440px; top: -220px; left: -220px; background: radial-gradient(circle,#477fe51f,transparent 65%); transform: translate(var(--spot-x,0px),var(--spot-y,0px)); opacity: 0; pointer-events: none; transition: opacity .25s var(--ease); }
.answer-card::after { content: ''; position: absolute; inset: 0; border: 1px solid #94bcff88; border-radius: inherit; opacity: 0; pointer-events: none; transition: opacity .25s var(--ease); }
.topic-chip { width: 40px; height: 40px; display: grid; place-items: center; color: #9dbfff; background: #568bfa17; border-radius: 10px; margin-bottom: 23px; }
h3 { font-size: 16px; font-weight: 600; line-height: 1.45; letter-spacing: -.25px; margin-bottom: 13px; }
.answer-card p { font-size: 14px; line-height: 1.75; color: #afc0d7; }
.primary h3 { font-size: 19px; }
.answer-long { grid-column: span 2; }
@media (hover:hover) and (pointer:fine) { .answer-card:hover { transform: translateY(-3px); } .answer-card:hover::before,.answer-card:hover::after { opacity: 1; } }
@media (max-width:1023px) { .answer-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media (max-width:767px) { .answer-grid,.primary .answer-grid { grid-template-columns: 1fr; gap: 14px; } .answer-long { grid-column: auto; } .answer-card { padding: 24px; } .topic-chip { margin-bottom: 18px; } }
@media (prefers-reduced-motion:reduce) { .answer-card::before { display: none; } .answer-card:hover { transform: none; } }
@media print { .answer-grid,.primary .answer-grid { display: block; } .answer-card { break-inside: avoid; margin-bottom: 16px; } .answer-card::before,.answer-card::after { display: none; } }
</style>
