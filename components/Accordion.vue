<script setup lang="ts">
defineProps<{ question: string; answer: string }>();
const open = ref(false);
const id = useId();
</script>
<template>
  <div class="accordion">
    <h3>
      <button :aria-expanded="open" :aria-controls="id" @click="open = !open">
        {{ question
        }}<Icon name="ChevronDown" :size="18" :class="{ rotated: open }" />
      </button>
    </h3>
    <div :id="id" class="accordion-content" :class="{ open }" :inert="!open">
      <div>
        <p>{{ answer }}</p>
      </div>
    </div>
  </div>
</template>
