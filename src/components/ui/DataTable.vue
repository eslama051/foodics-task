<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            v-for="header in headers"
            :key="header.key"
            :class="[
              'px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
              header.align === 'center'
                ? 'text-center'
                : header.align === 'right'
                  ? 'text-right'
                  : 'text-left',
            ]"
          >
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="item in data"
          :key="item[props.rowKey]"
          @click="emit('row-click', item)"
          class="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
        >
          <td
            v-for="header in headers"
            :key="header.key"
            :class="[
              'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
              header.align === 'center'
                ? 'text-center'
                : header.align === 'right'
                  ? 'text-right'
                  : 'text-left',
            ]"
          >
            <slot :name="`cell-${header.key}`" :item="item" :value="item[header.key]">
              {{ item[header.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td
            :colspan="headers.length"
            class="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
          >
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface Header {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

type DataItem = Record<string, any>

interface Props {
  headers: Header[]
  data: DataItem[]
  emptyMessage?: string
  rowKey?: string
}

interface Emits {
  (e: 'row-click', item: any): void
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'No data available',
  rowKey: 'id',
})

const emit = defineEmits<Emits>()

defineSlots<{
  [key: `cell-${string}`]: (props: { item: unknown; value: unknown }) => unknown
  actions?: (props: { item: unknown; index: number }) => unknown
}>()
</script>
