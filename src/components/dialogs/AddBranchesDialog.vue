<template>
  <BaseDialog :show="show" :backdrop="false" title="Add Branches" @hide="$emit('hide')">
    <div class="space-y-8 mb-4">
      <BaseSelect
        v-model="selectedBranches"
        :options="branchOptions"
        multiple
        label="Branches"
        placeholder="Choose branches..."
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('hide')"> Cancel </BaseButton>
      <BaseButton
        variant="primary"
        :loading="loading"
        :disabled="!isValid || loading"
        @click="handleConfirm"
      >
        Save
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseDialog from './BaseDialog.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseSelect from '../forms/BaseSelect.vue'
import { useReservationStore, type Branch } from '@/stores/reservation'
import { useToast } from '@/composables/useToast'

const store = useReservationStore()
const { enableSelectedBranchReservations } = store

const { success, error } = useToast()

interface Props {
  show: boolean
  disabledBranches: Branch[]
}

const emit = defineEmits<{
  hide: []
  confirm: [selectedBranches: string[]]
}>()

const props = defineProps<Props>()

const selectedBranches = ref<string[]>([])

const branchOptions = computed(() =>
  props.disabledBranches.map((branch) => ({
    value: branch.id,
    label: `${branch.name} (${branch.reference || '-'})`,
  })),
)

const isValid = computed(() => {
  return !!selectedBranches.value.length
})

const loading = ref(false)
const handleConfirm = async () => {
  loading.value = true

  try {
    const results = await enableSelectedBranchReservations(selectedBranches.value)

    const failedBranches = results.filter((r) => r.status === 'failed')
    const successBranches = results.filter((r) => r.status === 'success')

    if (failedBranches.length > 0) {
      error(`Failed to enable ${failedBranches.length} branches`)
    }

    if (successBranches.length > 0) {
      success(`Successfully enabled ${successBranches.length} branches`)
    }
  } catch {
    error('Error enabling reservations')
  } finally {
    loading.value = false
    emit('hide')
  }
}

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      selectedBranches.value = []
    }
  },
)
</script>
