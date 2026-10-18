<script setup lang="ts">
const emit = defineEmits<{ prepared: []; }>();
const { track } = useAnalytics();
const video = ref<HTMLVideoElement>();
const firstPlay = ref(false);
let prepared = false;
function onPlay() {
  playing.value = true;
  if (!firstPlay.value) { firstPlay.value = true; track('confirmed_video', { action: 'play' }); }
}
function onTime() {
  current.value = video.value?.currentTime || 0;
  if (!prepared && playing.value && current.value >= 10) { prepared = true; emit('prepared'); }
}
function onEnded() {
  playing.value = false;
  if (!prepared) { prepared = true; emit('prepared'); }
  track('confirmed_video', { action: 'complete' });
}
const playing = ref(false);
const muted = ref(false);
const current = ref(0);
const duration = ref(34);
const menu = ref(false);
const videoError = ref(false);
// Web-optimised encode of the Loom recording (1080p H.264, faststart).
const source = "/videos/founder-intro.mp4";
function toggle() {
  if (!video.value) return;
  if (playing.value) video.value.pause();
  else video.value.play().catch(() => (videoError.value = true));
}
function fullScreen() {
  const container = video.value?.parentElement;
  if (container?.requestFullscreen) container.requestFullscreen();
  // iOS Safari only supports fullscreen on the video element itself.
  else
    (
      video.value as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
    )?.webkitEnterFullscreen?.();
}
function seek(event: Event) {
  if (video.value)
    video.value.currentTime = Number((event.target as HTMLInputElement).value);
}
const format = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
</script>
<template>
  <div class="founder-video" :class="{ 'has-played': firstPlay }">
    <video
      ref="video"
      :src="source"
      :muted="muted"
      playsinline
      preload="metadata"
      aria-label="Introduction video from our founder"
      @play="onPlay"
      @pause="playing = false"
      @ended="onEnded"
      @timeupdate="onTime"
      @loadedmetadata="duration = video?.duration || 34"
      @error="videoError = true"
    />
    <div class="video-art" :class="{ hidden: playing }">
      <div class="wave wave-one" />
      <div class="wave wave-two" />
      <div class="video-copy">
        <p class="eyebrow">WATCH BEFORE YOUR CALL</p>
        <h2>A quick introduction<br />from our founder.</h2>
        <p>A 35-second overview of how<br />we work and what to expect.</p>
      </div>
    </div>
    <button
      v-if="!playing"
      class="video-play"
      aria-label="Play introduction video"
      @click="toggle"
    >
      <Icon name="Play" :size="38" />
    </button>
    <p v-if="videoError" class="video-error">Introduction video coming soon.</p>
    <div class="video-controls">
      <div>
        <button
          :aria-label="playing ? 'Pause video' : 'Play video'"
          @click="toggle"
        >
          <Icon :name="playing ? 'Pause' : 'Play'" :size="15" />
        </button
        ><span>{{ format(current) }} / {{ format(duration) }}</span
        ><button
          :aria-label="muted ? 'Unmute video' : 'Mute video'"
          class="volume-control"
          @click="muted = !muted"
        >
          <Icon :name="muted ? 'VolumeX' : 'Volume2'" :size="17" />
        </button
        ><button aria-label="Fullscreen video" @click="fullScreen">
          <Icon name="Maximize" :size="15" />
        </button
        ><button
          aria-label="Video options"
          :aria-expanded="menu"
          @click="menu = !menu"
        >
          <Icon name="MoreVertical" :size="16" />
        </button>
      </div>
      <label
        ><span class="sr-only">Video progress</span
        ><input
          type="range"
          min="0"
          :max="duration"
          :value="current"
          @input="seek"
      /></label>
    </div>
    <div v-if="menu" class="video-menu" aria-label="Playback speed">
      <p>Playback speed</p>
      <button
        v-for="speed in [0.75, 1, 1.25, 1.5]"
        :key="speed"
        @click="
          video && (video.playbackRate = speed);
          menu = false;
        "
      >
        {{ speed }}×
      </button>
    </div>
  </div>
</template>

<style scoped>
.founder-video { min-height: 0; aspect-ratio: 1.4; border-radius: 14px; }
.video-copy { padding: 30px; }
.video-copy h2 { font-family: "DM Sans",sans-serif; font-size: clamp(24px,2.4vw,34px); font-weight: 500; letter-spacing: -1px; }
.video-copy > p:last-child { font-size: 13px; color: #bbcee6; }
.video-play { width: 68px; height: 68px; top: 63%; background: #1c416e; }
.video-play::before { content: ''; position: absolute; inset: -8px; border: 1px solid #91b8ff66; border-radius: 50%; animation: play-pulse 2.6s var(--ease) infinite; }
.has-played .video-play::before { display: none; }
.video-controls button { min-width: 28px; min-height: 32px; display: inline-grid; place-items: center; }
.video-controls input { min-height: 16px; background: transparent; }
.video-controls input::-webkit-slider-runnable-track { height: 3px; background: #ffffff66; }
.video-controls input::-webkit-slider-thumb { margin-top: -1px; }
button:focus-visible,input:focus-visible { outline: 2px solid #b6d2ff; outline-offset: 4px; }
@keyframes play-pulse { 50% { transform: scale(1.12); opacity: .25; } }
@media (max-width:767px) { .founder-video { aspect-ratio: 1.13; } .video-copy { padding: 24px; } .video-copy h2 { font-size: 26px; } .video-play { width: 58px; height: 58px; top: 66%; } }
</style>
