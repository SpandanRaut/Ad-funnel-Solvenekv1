<script setup lang="ts">
import type { Testimonial } from "~/data/landing";
defineProps<{
  items: Testimonial[];
  label: string;
  compact?: boolean;
  /** "load": part of the hero fade-in; "scroll": fades in when scrolled to. */
  reveal: "load" | "scroll";
}>();
</script>
<template>
  <section
    v-if="items.length"
    v-reveal="reveal === 'scroll'"
    class="testimonials"
    :class="{ compact, reveal: reveal === 'load' }"
    :aria-label="label"
  >
    <figure v-for="item in items" :key="item.business" class="testimonial">
      <p v-if="item.result" class="testimonial-result">{{ item.result }}</p>
      <blockquote>“{{ item.quote }}”</blockquote>
      <figcaption>
        {{ item.name }}<span>{{ item.role }}, {{ item.business }}</span>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.testimonials {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 30px 0 26px;
}
.testimonials.reveal {
  animation-delay: 250ms;
}
.testimonial {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 12px;
  /* Solid, like .flow-card, so it reads where the hero's angled edge ends. */
  background: linear-gradient(115deg, rgb(15 24 36 / 0.95), rgb(8 17 27 / 0.92));
  border: 1px solid rgb(var(--white) / 0.1);
  color: rgb(var(--white));
}
.testimonial-result {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: rgb(117 176 255);
}
.testimonial blockquote {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: rgb(var(--white) / 0.88);
}
.testimonial figcaption {
  margin-top: auto;
  font-size: 12px;
  font-weight: 600;
}
.testimonial figcaption span {
  display: block;
  font-weight: 400;
  color: rgb(var(--white) / 0.62);
}
.compact {
  gap: 12px;
  margin: 18px 0 0;
}
.compact .testimonial {
  padding: 14px 16px;
  gap: 8px;
}
.compact blockquote {
  font-size: 12px;
}
.compact figcaption {
  font-size: 11px;
}
@media (hover: hover) {
  .testimonial {
    transition: transform 180ms ease-out;
  }
  .testimonial:hover {
    transform: translateY(-2px);
  }
}
@media (max-width: 760px) {
  /* Featured quotes scroll sideways so the form stays close to the top. */
  .testimonials:not(.compact) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    margin: 26px 0 22px;
  }
  .testimonials:not(.compact)::-webkit-scrollbar {
    display: none;
  }
  .testimonials:not(.compact) .testimonial {
    flex: 0 0 86%;
    scroll-snap-align: start;
  }
  .compact {
    grid-template-columns: 1fr;
  }
}
</style>
