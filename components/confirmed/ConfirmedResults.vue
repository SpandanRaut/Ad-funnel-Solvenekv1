<script setup lang="ts">
import { featuredTestimonials, moreTestimonials } from '~/data/landing';
const testimonials = [featuredTestimonials[1]!,featuredTestimonials[0]!,...moreTestimonials];
</script>
<template>
  <section class="confirmed-results" aria-labelledby="results-heading">
    <p class="eyebrow">RESULTS</p><h2 id="results-heading">What clients say</h2>
    <div class="results-bento">
      <figure v-for="(item,index) in testimonials" :key="item.business" class="result-card glass" :class="{ 'stat-card': item.result, 'lead-stat': index === 0 }" data-confirmed-reveal :style="{ '--stagger': index % 2 }">
        <h3 v-if="item.result" class="result-heading"><span class="result-number">{{ item.result.split(' ')[0] }}</span><span class="result-caption">{{ item.result.slice(item.result.indexOf(' ')+1) }}</span></h3>
        <span v-else class="quote-glyph" aria-hidden="true">“</span>
        <blockquote>{{ item.quote }}</blockquote>
        <figcaption><span class="author-avatar" aria-hidden="true">{{ item.name.split(' ').map(part => part[0]).slice(0,2).join('') }}</span><div>{{ item.name }}<span>{{ item.role }}, {{ item.business }}</span></div></figcaption>
      </figure>
    </div>
  </section>
</template>
<style scoped>
.results-bento { display: grid; grid-template-columns: repeat(12,minmax(0,1fr)); gap: 24px; margin-top: 28px; }
.result-card { grid-column: span 6; margin: 0; padding: 36px; display: flex; flex-direction: column; }
.stat-card { grid-column: span 5; }
.lead-stat { grid-column: span 7; background: #152a46; border-color: #42679c; }
.result-heading { margin: 0; font-weight: 500; }
.result-number { display: block; font-size: clamp(64px,6vw,88px); line-height: 1; letter-spacing: -5px; color: #83adff; }
.lead-stat .result-number { font-size: clamp(80px,8vw,112px); letter-spacing: -6px; }
.result-caption { display: block; font-size: 16px; line-height: 1.5; max-width: 400px; margin-top: 16px; color: #d2e0f4; }
blockquote { color: #b9c9de; font-size: 16px; line-height: 1.7; margin: 28px 0 32px; }
.result-card:not(.stat-card) blockquote { margin-top: 0; font-size: 18px; }
.quote-glyph { font-size: 84px; line-height: 1; color: #719edb; height: 66px; }
figcaption { display: flex; align-items: center; gap: 12px; margin-top: auto; font-size: 13px; font-weight: 600; line-height: 1.6; }
figcaption div > span { display: block; color: #a7b9d0; font-size: 11px; font-weight: 400; }
.author-avatar { display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border: 1px solid #7295c54d; border-radius: 50%; background: #2a4264; color: #ccddf7; font-size: 11px; }
.result-card:nth-child(2) .author-avatar { background: #294740; }
.result-card:nth-child(3) .author-avatar { background: #403451; }
.result-card:nth-child(4) .author-avatar { background: #4a3d31; }
@media (max-width:767px) { .results-bento { grid-template-columns: 1fr; gap: 16px; } .result-card,.stat-card,.lead-stat { grid-column: auto; padding: 26px; } .lead-stat .result-number { font-size: 84px; } blockquote { font-size: 15px; } .result-card:not(.stat-card) blockquote { font-size: 17px; } }
@media print { .result-card { break-inside: avoid; } }
</style>
