<template>
  <div ref="selectRef" class="relative">
    <div class="relative">
      <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ label }}
      </label>
      <button
        ref="buttonRef"
        @click="toggleDropdown"
        class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left flex items-center justify-between"
      >
        <span class="truncate">{{ displayText }}</span>
        <span class="w-[30px]">
          <ChevronDownIcon />
        </span>
      </button>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="fixed z-[200] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
      :style="dropdownStyle"
    >
      <div
        v-if="options.length === 0"
        class="px-4 py-2 text-gray-500 dark:text-gray-400 text-center text-sm"
      >
        No options available
      </div>
      <div
        v-else
        v-for="option in options"
        :key="option.value"
        @click="selectOption(option)"
        class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-gray-900 dark:text-gray-100 transition-colors duration-150 text-sm"
        :class="{
          'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary': isSelected(
            option.value,
          ),
        }"
      >
        <input
          v-if="multiple"
          type="checkbox"
          :checked="isSelected(option.value)"
          class="mr-3 accent-primary"
          @change="selectOption(option)"
          @click.stop
        />
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import ChevronDownIcon from '@/assets/icons/ChevronDownIcon.vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  options: Option[]
  multiple?: boolean
  label?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
})

const model = defineModel<string | number | string[] | number[]>()
const isOpen = ref(false)
const selectRef = ref<HTMLDivElement>()
const buttonRef = ref<HTMLButtonElement>()
const dropdownStyle = ref({})

const selectedArray = computed(() => (props.multiple ? (model.value as string[]) || [] : []))

const displayText = computed(() => {
  if (props.multiple) {
    if (selectedArray.value.length === 0) {
      return props.placeholder || 'Select options...'
    }
    const selectedLabels = props.options
      .filter((option) => selectedArray.value.includes(option.value as string))
      .map((option) => option.label)
    return selectedLabels.join(', ')
  }

  const option = props.options.find((o) => o.value === model.value)
  return option?.label || props.placeholder || 'Select option...'
})

const isSelected = (value: string | number) => {
  return props.multiple ? selectedArray.value.includes(value as string) : model.value === value
}

const calculatePosition = () => {
  if (!buttonRef.value) return

  const buttonRect = buttonRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = 240

  let top = buttonRect.bottom + 4
  let left = buttonRect.left

  // Check if dropdown would go off screen bottom
  if (top + dropdownHeight > viewportHeight) {
    top = buttonRect.top - dropdownHeight - 4
  }

  // Check if dropdown would go off screen right
  const dropdownWidth = Math.max(buttonRect.width, 200)
  if (left + dropdownWidth > window.innerWidth) {
    left = window.innerWidth - dropdownWidth - 8
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${Math.max(buttonRect.width, 200)}px`,
  }
}

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    calculatePosition()
  }
}

const selectOption = (option: Option) => {
  if (!props.multiple) {
    model.value = option.value
    isOpen.value = false
    return
  }

  const selected = selectedArray.value
  // toggle the selection
  model.value = selected.includes(option.value as string)
    ? selected.filter((v) => v !== option.value)
    : [...selected, option.value as string]
}

const handleClickOutsideOfBaseSelect = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleScroll = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

const handleResize = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideOfBaseSelect)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideOfBaseSelect)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})
</script>
