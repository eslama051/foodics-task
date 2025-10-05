<template>
  <div class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div class="space-y-3">
      <div v-for="(slot, index) in timeSlots" :key="index" class="space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <BaseInput
              v-model="slot.start"
              type="time"
              placeholder="Start time"
              :min="openingFrom && openingFrom !== '00:00' ? openingFrom : undefined"
              :max="openingTo && openingTo !== '00:00' ? openingTo : undefined"
            />
          </div>
          <span class="text-gray-500 dark:text-gray-400 text-sm">:</span>
          <div>
            <BaseInput
              v-model="slot.end"
              type="time"
              placeholder="End time"
              :min="
                slot.start || (openingFrom && openingFrom !== '00:00' ? openingFrom : undefined)
              "
              :max="openingTo && openingTo !== '00:00' ? openingTo : undefined"
            />
          </div>
          <button
            @click="removeSlot(index)"
            class="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200 flex items-center justify-center w-8 h-8 text-lg font-bold"
            title="Remove time slot"
          >
            ✕
          </button>
        </div>
      </div>

      <button
        v-if="timeSlots.length < 3"
        @click="addSlot"
        class="w-full py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        + Add time slot
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BaseInput from './BaseInput.vue'

interface TimeSlot {
  start: string
  end: string
}

interface Props {
  modelValue: string[][]
  openingFrom?: string
  openingTo?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string[][]]
}>()

const timeSlots = ref<TimeSlot[]>([])
const isUpdatingFromProps = ref(false)

const initSlots = () => {
  isUpdatingFromProps.value = true
  if (!props.modelValue || props.modelValue.length === 0) {
    timeSlots.value = []
  } else {
    timeSlots.value = props.modelValue.map((slot) => ({
      start: slot[0] || '',
      end: slot[1] || '',
    }))
  }
  nextTick(() => {
    isUpdatingFromProps.value = false
  })
}

const emitUpdate = () => {
  if (isUpdatingFromProps.value) return
  const value = timeSlots.value.map((slot) => [slot.start, slot.end])
  emit('update:modelValue', value)
}

watch(() => props.modelValue, initSlots, { immediate: true })

watch(timeSlots, emitUpdate, { deep: true })

const addSlot = () => {
  if (timeSlots.value.length < 3) {
    timeSlots.value.push({ start: '', end: '' })
  }
}

const removeSlot = (index: number) => {
  timeSlots.value.splice(index, 1)
}
</script>
