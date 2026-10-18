<script setup lang="ts">
const video = ref<HTMLVideoElement>();
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
  <div class="founder-video">
    <video
      ref="video"
      :src="source"
      :muted="muted"
      playsinline
      preload="metadata"
      aria-label="Introduction video from our founder"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @timeupdate="current = video?.currentTime || 0"
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
          <Icon :name="playing ? 'Pause' : 'Play'" :size="15" /></button
        ><span>{{ format(current) }} / {{ format(duration) }}</span
        ><button
          :aria-label="muted ? 'Unmute video' : 'Mute video'"
          class="volume-control"
          @click="muted = !muted"
        >
          <Icon :name="muted ? 'VolumeX' : 'Volume2'" :size="17" /></button
        ><button aria-label="Fullscreen video" @click="fullScreen">
          <Icon name="Maximize" :size="15" /></button
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
