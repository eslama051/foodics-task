<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-[-7px]">*</span>
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :min="min"
      :max="max"
      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700"
      :class="{ 'no-spinners': type === 'number' }"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const model = defineModel<string | number>()
</script>

<style scoped>
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinners[type='number'] {
  -moz-appearance: textfield;
}

/* Hide seconds in time input but keep minutes */
input[type='time']::-webkit-datetime-edit-second-field,
input[type='time']::-webkit-datetime-edit-millisecond-field {
  display: none;
}

input[type='time'] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

/* Make time input icon white in dark mode */
input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

@media (prefers-color-scheme: dark) {
  input[type='time']::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
}

</style>
