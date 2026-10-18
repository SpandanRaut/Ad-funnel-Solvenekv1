<script setup lang="ts">
import { CalendarCheck, Check, Image, Play } from "lucide-vue-next";
defineProps<{ step: number }>();
</script>
<template>
  <div class="condition-visual" :class="`visual-${step}`" aria-hidden="true">
    <div v-if="step === 1" class="target-art">
      <div class="document glass">
        <div class="document-corner" />
        <i /><i /><svg viewBox="0 0 180 65" fill="none">
          <path
            class="signature"
            d="M9 46C40 9 53 8 42 28S18 53 34 44S73 8 68 26S54 55 77 36S88 22 86 36S120 23 115 34S143 35 168 26"
            pathLength="1"
          />
        </svg>
      </div>
      <div class="target-figures">
        <div><strong>8</strong><span>Per month</span></div>
        <div class="target-gauge"><i /></div>
        <div><strong>24</strong><span>Over 90 days</span></div>
      </div>
    </div>
    <div v-else-if="step === 2" class="spend-art">
      <div class="spend-amount">$30–50<span>/day</span></div>
      <div class="spend-grid">
        <i
          v-for="day in 90"
          :key="day"
          :style="{
            '--cell': ((day - 1) % 15) + Math.floor((day - 1) / 15) * 0.5,
          }"
        />
      </div>
      <div class="spend-duration"><i />90 days<i /></div>
    </div>
    <div v-else-if="step === 3" class="creative-art">
      <div class="creative-track" />
      <div
        v-for="(image, index) in [Image, Play, Image]"
        :key="index"
        class="thumbnail glass"
        :class="`thumbnail-${index}`"
        :style="{ '--thumb': index }"
      >
        <component
          :is="image"
          :size="index === 1 ? 28 : 34"
          :stroke-width="1"
        />
        <div v-if="index !== 1" class="thumbnail-horizon" />
      </div>
      <div class="launch-line"><span>Launch</span><i /></div>
    </div>
    <div v-else-if="step === 4" class="sheet-art glass">
      <div class="sheet-heading"><span>Lead</span><span>Feedback</span></div>
      <div
        v-for="row in 5"
        :key="row"
        class="sheet-row"
        :style="{ '--row': row }"
      >
        <div><i /><i /></div>
        <span><Check :size="15" /><b /></span>
      </div>
    </div>
    <div v-else-if="step === 5" class="weekly-art">
      <CalendarCheck class="weekly-calendar" :size="64" :stroke-width="1" />
      <div class="weekly-track">
        <i /><span
          v-for="week in 13"
          :key="week"
          :style="{ '--week': week }"
          :class="{ 'week-current': week === 7 }"
          ><CalendarCheck v-if="week === 7" :size="25" :stroke-width="1.4"
        /></span>
      </div>
      <span class="weekly-label">Weekly</span>
    </div>
    <div v-else class="fee-art glass">
      <div class="fee-condition">If the target isn’t hit</div>
      <div class="fee-row">
        <span>Management fee · next 30 days</span><strong>on us</strong>
      </div>
      <div class="fee-row"><span>Ad spend</span><span>Still yours</span></div>
    </div>
  </div>
</template>
<style scoped>
.condition-visual {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  align-items: center;
  padding: 22px;
  color: #9fc3ff;
}
.glass {
  background: linear-gradient(135deg, #1d3148aa, #0e1c2dbb);
  border: 1px solid #8fb7ee33;
  box-shadow:
    0 26px 65px #0004,
    inset 0 1px 0 #e2eeff0d;
  backdrop-filter: blur(12px);
}
.target-art {
  position: relative;
  padding: 15px 6px 0;
}
.document {
  position: relative;
  width: 63%;
  height: 180px;
  margin: auto;
  border-radius: 6px 30px 6px 6px;
  padding: 35px 28px;
  transform: rotate(-7deg);
}
.document-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  top: -1px;
  right: -1px;
  border-left: 1px solid #90b7ee44;
  border-bottom: 1px solid #90b7ee44;
  border-radius: 0 24px 0 5px;
  background: #223951;
}
.document > i {
  display: block;
  width: 82%;
  height: 3px;
  background: #7f9db649;
  margin-bottom: 14px;
}
.document > i + i {
  width: 61%;
}
.document svg {
  width: 100%;
  height: 65px;
}
.signature {
  stroke: #a9ccff;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-dasharray: 1;
}
.target-figures {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 36px;
}
.target-figures > div:not(.target-gauge) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.target-figures strong {
  color: #eaf2ff;
  font-weight: 500;
  font-size: 62px;
  line-height: 1;
  letter-spacing: -0.05em;
}
.target-figures span {
  font-size: 11px;
  color: #98afcc;
  white-space: nowrap;
}
.target-gauge {
  position: relative;
  height: 2px;
  flex: 1;
  background: #83b5ff20;
}
.target-gauge > i {
  position: absolute;
  inset: 0;
  background: #4d8fff;
  box-shadow: 0 0 14px #4383ff88;
  transform-origin: left;
}
.spend-art {
  padding: 15px 6px;
}
.spend-amount {
  color: #eaf2ff;
  white-space: nowrap;
  font-size: 76px;
  line-height: 1.1;
  letter-spacing: -0.055em;
  margin-bottom: 30px;
}
.spend-amount > span {
  color: #89a8d4;
  font-size: 23px;
  letter-spacing: -0.025em;
}
.spend-grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 6px;
}
.spend-grid i {
  aspect-ratio: 1;
  border: 1px solid #659cff6b;
  background: #2873f85c;
  border-radius: 2px;
}
.spend-duration {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  margin-top: 24px;
  color: #a7bedc;
}
.spend-duration i {
  height: 1px;
  flex: 1;
  background: #789cc52b;
}
.creative-art {
  display: flex;
  position: relative;
  align-items: center;
  gap: 10px;
  padding: 35px 38px 35px 0;
}
.creative-track {
  position: absolute;
  left: 0;
  right: 20px;
  height: 1px;
  background: #558eea33;
}
.thumbnail {
  position: relative;
  overflow: hidden;
  width: 31%;
  height: 130px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  transform: rotate(-6deg);
}
.thumbnail-1 {
  transform: translateY(-20px) rotate(3deg);
  background: linear-gradient(135deg, #224776, #122a48);
}
.thumbnail-2 {
  transform: rotate(8deg);
}
.thumbnail-horizon {
  position: absolute;
  width: 150%;
  height: 60%;
  bottom: -48%;
  border: 1px solid #92baff20;
  transform: rotate(-25deg);
}
.launch-line {
  position: absolute;
  right: 3px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.launch-line span {
  font-size: 11px;
}
.launch-line i {
  flex: 1;
  width: 1px;
  background: linear-gradient(transparent, #92baff, #92baff22);
}
.sheet-art {
  padding: 24px;
  border-radius: 8px;
  transform: perspective(900px) rotateY(-8deg) rotateX(5deg);
}
.sheet-heading,
.sheet-row {
  display: grid;
  grid-template-columns: 1fr 95px;
  gap: 15px;
}
.sheet-heading {
  padding-bottom: 18px;
  color: #bdd4f4;
  font-size: 11px;
}
.sheet-row {
  align-items: center;
  height: 44px;
  border-top: 1px solid #829fc41b;
}
.sheet-row > div {
  display: flex;
  gap: 8px;
  align-items: center;
}
.sheet-row > div i {
  height: 4px;
  width: 55%;
  border-radius: 2px;
  background: #819bb74d;
}
.sheet-row > div i + i {
  width: 15%;
  background: #819bb720;
}
.sheet-row > span {
  position: relative;
  display: flex;
  width: 38px;
  height: 22px;
  justify-content: center;
  align-items: center;
  border: 1px solid #78acff45;
  border-radius: 3px;
  background: #2368da19;
}
.sheet-row b {
  width: 13px;
  height: 2px;
  background: #8aa3c5;
  position: absolute;
}
.sheet-row svg {
  color: #a8ceff;
}
.weekly-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 44px;
}
.weekly-calendar {
  color: #9ec4ff;
}
.weekly-track {
  display: flex;
  position: relative;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  height: 42px;
}
.weekly-track > i {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: #6894cb66;
}
.weekly-track > span {
  position: relative;
  display: grid;
  place-items: center;
  width: 9px;
  height: 9px;
  border: 1px solid #83a9d8;
  border-radius: 50%;
  background: #142339;
}
.weekly-track > .week-current {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #173c70;
  border-color: #a2c7ff99;
  box-shadow: 0 0 25px #0553fd29;
}
.weekly-label {
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #a7bedc;
}
.fee-art {
  border-radius: 8px;
  padding: 26px;
}
.fee-condition {
  display: inline-block;
  font-size: 11px;
  color: #b8d3ff;
  margin-bottom: 12px;
  border-bottom: 1px solid #82adf17a;
  padding-bottom: 9px;
}
.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  font-size: 13px;
  line-height: 1.7;
  padding-block: 24px;
  color: #bfd0e5;
}
.fee-row + .fee-row {
  border-top: 1px solid #8caace30;
  color: #93a7c2;
}
.fee-row strong {
  color: #d7e7ff;
  font-size: 20px;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 0 20px #4383ff77;
}
.fee-row > span:last-child {
  white-space: nowrap;
}
:global(.conditions-page .visual-playing .signature) {
  animation: signature 0.85s var(--ease) 0.3s both;
}
:global(.conditions-page .visual-playing .target-gauge > i) {
  animation: gauge 0.8s var(--ease) 0.6s both;
}
:global(.conditions-page .visual-playing .spend-grid i) {
  animation: cell-in 0.4s var(--ease) calc(var(--cell) * 45ms) both;
}
:global(.conditions-page .visual-playing .thumbnail) {
  animation: thumbnail-in 0.65s var(--ease) calc(var(--thumb) * 110ms) both;
}
:global(.conditions-page .visual-playing .sheet-row svg) {
  animation: feedback-in 0.4s var(--ease) calc(var(--row) * 140ms) both;
}
:global(.conditions-page .visual-playing .sheet-row b) {
  animation: feedback-out 0.3s var(--ease) calc(var(--row) * 140ms) both;
}
:global(.conditions-page .visual-playing .weekly-track > span) {
  animation: week-pulse 0.65s var(--ease) calc(var(--week) * 75ms) both;
}
:global(.conditions-page .visual-playing .fee-row strong) {
  animation: fee-glow 1.4s var(--ease) both;
}
@keyframes signature {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes gauge {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes cell-in {
  from {
    opacity: 0.15;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes thumbnail-in {
  from {
    opacity: 0;
    transform: translateX(-35px) scale(0.95);
  }
}
@keyframes feedback-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes feedback-out {
  to {
    opacity: 0;
  }
}
@keyframes week-pulse {
  40% {
    opacity: 1;
    transform: scale(1.3);
  }
}
@keyframes fee-glow {
  0% {
    opacity: 0.5;
  }
  50%,
  100% {
    opacity: 1;
  }
}
@media (max-width: 1023px) {
  .condition-visual {
    padding: 10px 16px;
  }
  .target-art {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 0;
  }
  .document {
    width: 105px;
    height: 112px;
    margin: 0;
    padding: 23px 15px;
    flex-shrink: 0;
  }
  .document > i {
    margin-bottom: 9px;
    height: 2px;
  }
  .document svg {
    height: 40px;
  }
  .target-figures {
    gap: 16px;
    margin: 0;
    flex: 1;
    max-width: 225px;
  }
  .target-figures strong {
    font-size: 42px;
  }
  .target-figures span {
    font-size: 9px;
  }
  .spend-art {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 16px;
    align-items: center;
    max-width: 480px;
    width: 100%;
    margin: auto;
  }
  .spend-amount {
    font-size: clamp(26px, 8vw, 34px);
    margin: 0;
  }
  .spend-amount > span {
    font-size: 15px;
  }
  .spend-grid {
    gap: 4px;
  }
  .spend-duration {
    grid-column: 1/-1;
    margin-top: 10px;
    font-size: 10px;
  }
  .creative-art {
    max-width: 380px;
    width: 100%;
    margin: auto;
    padding: 20px 45px 10px 0;
    gap: 12px;
  }
  .thumbnail {
    height: 80px;
  }
  .thumbnail-1 {
    transform: translateY(-10px) rotate(3deg);
  }
  .launch-line {
    top: 3px;
  }
  .sheet-art {
    max-width: 350px;
    width: 100%;
    margin: auto;
    padding: 10px 18px;
  }
  .sheet-heading {
    font-size: 9px;
    padding-bottom: 5px;
  }
  .sheet-row {
    height: 19px;
  }
  .sheet-row > span {
    height: 14px;
    width: 32px;
  }
  .sheet-row svg {
    width: 12px;
    height: 12px;
  }
  .weekly-art {
    gap: 10px;
    max-width: 390px;
    width: 100%;
    margin: auto;
  }
  .weekly-calendar {
    height: 38px;
    width: 38px;
  }
  .weekly-track {
    height: 34px;
  }
  .weekly-track > .week-current {
    width: 34px;
    height: 34px;
    border-radius: 7px;
  }
  .weekly-label {
    font-size: 10px;
  }
  .fee-art {
    max-width: 400px;
    width: 100%;
    margin: auto;
    padding: 12px 18px;
  }
  .fee-condition {
    font-size: 9px;
    margin-bottom: 2px;
    padding-bottom: 5px;
  }
  .fee-row {
    font-size: 10px;
    padding-block: 10px;
  }
  .fee-row strong {
    font-size: 17px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .signature {
    stroke-dashoffset: 0;
  }
  .sheet-row b {
    display: none;
  }
}
</style>
