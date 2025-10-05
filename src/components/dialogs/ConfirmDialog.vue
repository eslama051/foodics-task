<template>
  <BaseDialog :show="show" :backdrop="!confirmLoading" :title="title" @hide="$emit('cancel')">
    <div class="text-gray-600 dark:text-gray-300">
      {{ message }}
    </div>

    <template #footer>
      <BaseButton variant="secondary" :disabled="confirmLoading" @click="$emit('cancel')">
        {{ cancelText }}
      </BaseButton>
      <BaseButton :loading="confirmLoading" :variant="confirmVariant" @click="$emit('confirm')">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
import BaseButton from '../ui/BaseButton.vue'

interface Props {
  show: boolean
  title?: string
  message: string
  confirmText?: string
  confirmLoading?: boolean
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
}

defineEmits<{
  confirm: []
  cancel: []
}>()

withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  confirmLoading: false,
  cancelText: 'Cancel',
  confirmVariant: 'primary',
})
</script>
