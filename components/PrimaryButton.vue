<script setup lang="ts">
defineProps<{ loading?: boolean; disabled?: boolean; dark?: boolean }>();
</script>
<template>
  <button
    class="primary-button"
    :class="{ 'button-dark': dark }"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" /><slot /><Icon
      v-if="!dark && !loading"
      name="ArrowRight"
      :size="17"
    />
  </button>
</template>
