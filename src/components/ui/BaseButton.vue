<template>
  <button :class="buttonClasses" :disabled="disabled || loading" v-bind="$attrs">
    <span v-if="loading" class="loading-dots mr-2">...</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'danger'

interface Props {
  variant?: Variant
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
})

const buttonClasses = computed(() => {
  const base =
    'px-4 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary:
      'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  const disabledStyles =
    props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return [base, variants[props.variant], disabledStyles].join(' ')
})
</script>

<style scoped>
.loading-dots {
  animation: loading 1.4s infinite;
}

@keyframes loading {
  0%,
  80%,
  100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}
</style>
