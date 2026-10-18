<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  name: string;
  placeholder?: string;
  type?: string;
  error?: string;
  optional?: boolean;
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  minlength?: number;
  maxlength?: number;
  liveError?: boolean;
}>();
defineEmits<{ "update:modelValue": [value: string]; blur: [] }>();
</script>
<template>
  <div class="form-field" :aria-live="liveError ? 'polite' : undefined">
    <label :for="name"
      >{{ label }}<span v-if="optional"> (optional)</span></label
    ><select
      v-if="options"
      :id="name"
      :value="modelValue"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${name}-error` : undefined"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
      @blur="$emit('blur')"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option">
        {{ option }}
      </option>
      </select
    ><input
      v-else
      :id="name"
      :name="name"
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :minlength="minlength"
      :maxlength="maxlength"
      :autocomplete="
        (
          {
            name: 'name',
            email: 'email',
            phone: 'tel',
            website: 'url',
            companyName: 'organization',
          } as Record<string, string>
        )[name]
      "
      :aria-invalid="!!error"
      :aria-describedby="error ? `${name}-error` : undefined"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      @blur="$emit('blur')"
    /><Transition name="error"
      >
      <p v-if="error" :id="`${name}-error`" class="field-error">
        {{ error }}
      </p>
      </Transition
    >
  </div>
</template>
