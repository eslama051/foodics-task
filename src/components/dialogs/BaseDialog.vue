<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
        <!-- Backdrop -->
        <div @click.self="handleBackdrop" class="absolute inset-0 bg-black/50"></div>

        <!-- Dialog -->
        <div
          :class="`relative bg-white dark:bg-gray-950 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full ${width} mx-4 max-h-[90vh] flex flex-col`"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
          >
            <slot name="header">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h3>
            </slot>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 flex-1 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  backdrop?: boolean
  width?: string
}

interface Emits {
  (e: 'hide'): void
}

const props = withDefaults(defineProps<Props>(), {
  backdrop: true,
  width: 'max-w-md',
})

const emit = defineEmits<Emits>()

const handleBackdrop = () => {
  if (props.backdrop) {
    emit('hide')
  }
}

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
