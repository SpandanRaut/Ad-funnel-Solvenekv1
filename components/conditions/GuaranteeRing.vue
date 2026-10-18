<template>
  <div class="guarantee-dial" aria-hidden="true" data-ring>
    <div class="dial-grid" />
    <div class="dial-tilt">
      <svg class="dial-svg" viewBox="0 0 360 360" fill="none">
        <circle cx="180" cy="180" r="166" stroke="#91b8ff" stroke-opacity=".13" />
        <circle cx="180" cy="180" r="151" stroke="#91b8ff" stroke-opacity=".15" stroke-dasharray="1 12.2" />
        <circle cx="180" cy="180" r="112" stroke="#91b8ff" stroke-opacity=".08" />
        <g v-for="index in 4" :key="index" :transform="`rotate(${(index + 1) * 90} 180 180)`">
          <path d="M186 48 A132 132 0 0 1 312 174" stroke="#234269" stroke-width="4" />
          <path v-if="index < 4" class="month-arc" d="M186 48 A132 132 0 0 1 312 174" pathLength="1" stroke="#4383ff" stroke-width="4" stroke-linecap="round" :style="{ '--arc': index - 1 }" />
          <path v-else class="conditional-arc" d="M186 48 A132 132 0 0 1 312 174" pathLength="1" stroke="#9dc2ff" stroke-width="2" stroke-dasharray=".025 .028" />
        </g>
        <path d="M180 10V24 M180 336V350 M10 180H24 M336 180H350" stroke="#6c9de7" stroke-opacity=".5" />
      </svg>
      <div class="dial-centre"><span data-ui-count="90">90</span><span>days</span></div>
      <svg class="dial-leader" viewBox="0 0 180 70" fill="none"><path d="M0 0 L45 45 H180" stroke="#78a8ff" stroke-opacity=".55" /><circle cx="0" cy="0" r="3" fill="#aecfff" /></svg>
      <div class="dial-condition">Next 30 days · on us if the target isn’t hit</div>
    </div>
  </div>
</template>
<style scoped>
.guarantee-dial { position: relative; width: min(100%, 460px); aspect-ratio: 1; justify-self: end; isolation: isolate; perspective: 900px; }
.dial-grid { position: absolute; inset: -14%; z-index: -1; background-image: linear-gradient(#8ab4ff09 1px,transparent 1px),linear-gradient(90deg,#8ab4ff09 1px,transparent 1px); background-size: 38px 38px; mask-image: radial-gradient(ellipse,#000 30%,transparent 70%); }
.guarantee-dial::before { content: ''; position: absolute; inset: 12%; border-radius: 50%; background: radial-gradient(ellipse,#0c46b02d,transparent 70%); box-shadow: 0 0 90px #0553fd10; }
.dial-tilt { position: absolute; inset: 0; transform: rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)); transition: transform .6s var(--ease); }
.dial-svg { width: 100%; height: 100%; }
.month-arc { stroke-dasharray: 1; stroke-dashoffset: 0; filter: drop-shadow(0 0 5px #3678ff80); }
:global(.conditions-page.motion-ready .month-arc) { animation: ring-draw .7s var(--ease) calc(.2s + var(--arc) * .5s) both; }
.conditional-arc { animation: arc-breathe 5s ease-in-out 2s infinite; }
.dial-centre { position: absolute; inset: 28%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.dial-centre > span:first-child { font-size: clamp(78px,8vw,118px); line-height: 1; font-weight: 500; letter-spacing: -.07em; color: #f1f6ff; font-variant-numeric: tabular-nums; }
.dial-centre > span:last-child { margin-top: 9px; font-size: 13px; letter-spacing: .18em; color: #97acc9; }
.dial-leader { position: absolute; width: 37%; height: 70px; left: 70%; top: 70%; }
.dial-condition { position: absolute; left: 61%; top: 88%; width: 190px; font-size: 11px; line-height: 1.65; letter-spacing: .015em; color: #bbd3f9; }
@keyframes ring-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes arc-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
@media(max-width:1023px) { .guarantee-dial { width: min(100%,350px); } .dial-condition { left: 57%; top: 88%; width: 150px; font-size: 10px; } .dial-leader { width: 32%; } }
@media(max-width:600px) { .guarantee-dial { width: 280px; justify-self: center; } .dial-centre > span:first-child { font-size: 86px; } }
@media(prefers-reduced-motion:reduce) { .dial-tilt { transform: none; } .month-arc { stroke-dashoffset: 0; } }
</style>
