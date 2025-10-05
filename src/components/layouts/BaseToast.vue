<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClasses(toast.type)"
          class="px-4 py-3 rounded-lg shadow-lg border max-w-sm"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span v-if="toast.type === 'success'" class="mr-2">✅</span>
              <span v-else-if="toast.type === 'error'" class="mr-2">❌</span>
              <span v-else class="mr-2">ℹ️</span>
              <span class="text-sm font-medium">{{ toast.message }}</span>
            </div>
            <button @click="removeToast(toast.id)" class="ml-3 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClasses = (type: 'success' | 'error' | 'info') => {
  const classes = {
    success:
      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error:
      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  }
  return classes[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active,
.toast-move {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-active {
  position: absolute;
  right: 0;
}
</style>
