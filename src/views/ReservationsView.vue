<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h1>
      <div class="flex space-x-3">
        <BaseButton
          v-if="availableBranches.length > 0"
          variant="danger"
          :loading="disableConfirmLoading"
          @click="showDisableConfirm = true"
        >
          Disable Reservations
        </BaseButton>

        <!-- uncomment the button blow for showing a btn that enables all branches  -->

        <!-- <BaseButton -->
        <!--   v-if="disabledBranches.length > 0" -->
        <!--   variant="primary" -->
        <!--   :loading="enableConfirmLoading" -->
        <!--   @click="showEnableConfirm = true" -->
        <!-- > -->
        <!--   Enable Reservations -->
        <!-- </BaseButton> -->
      </div>
    </div>

    <div v-if="loadingBranches" class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-400">Loading branches...</p>
    </div>

    <div v-else class="space-y-6">
      <div
        class="bg-white dark:bg-gray-950 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branches</h2>
        <DataTable
          :headers="headers"
          :data="availableBranches"
          @row-click="openEditDialog"
          empty-message="No branches available for reservations"
        >
          <template #cell-reference="{ value }">
            <span> {{ value || '-' }}</span>
          </template>
          <template #cell-actions="{ item }">
            <div class="flex items-center justify-end gap-2 w-full">
              <BaseButton variant="secondary" @click.stop="openEditDialog(item as Branch)">
                <EditIcon />
              </BaseButton>
              <BaseButton
                class="h-[31px] w-[45px] flex items-center justify-center"
                variant="danger"
                @click.stop="showSingleDisableConfirm(item as Branch)"
              >
                ✕
              </BaseButton>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <div class="fixed bottom-6 right-6">
      <BaseButton
        variant="primary"
        @click="showAddBranchesDialog = true"
        class="rounded-full p-6 shadow-lg text-lg flex gap-2 items-center"
      >
        <PlusIcon />
        Add Branches
      </BaseButton>
    </div>

    <ConfirmDialog
      :show="showDisableConfirm"
      title="Disable Reservations"
      message="Are you sure you want to disable reservations for all branches?"
      confirm-text="Disable"
      :confirm-loading="disableConfirmLoading"
      confirm-variant="danger"
      @confirm="confirmDisableReservations"
      @cancel="showDisableConfirm = false"
    />

    <ConfirmDialog
      :show="showEnableConfirm"
      title="Enable Reservations"
      message="Are you sure you want to enable reservations for all disabled branches?"
      confirm-text="Enable"
      :confirm-loading="enableConfirmLoading"
      confirm-variant="primary"
      @confirm="confirmEnableReservations"
      @cancel="showEnableConfirm = false"
    />

    <ConfirmDialog
      :show="showSingleDisableDialog"
      :title="`Disable ${branchToDisable?.name}`"
      :message="`Are you sure you want to disable reservations for ${branchToDisable?.name}?`"
      confirm-text="Disable"
      :confirm-loading="singleDisableLoading"
      confirm-variant="danger"
      @confirm="confirmSingleDisable"
      @cancel="cancelSingleDisable"
    />

    <AddBranchesDialog
      :show="showAddBranchesDialog"
      :disabled-branches="disabledBranches"
      @hide="showAddBranchesDialog = false"
    />

    <EditBranchDialog :show="showEditDialog" :branch="editingBranch" @hide="closeEditDialog" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useReservationStore, type Branch } from '@/stores/reservation'
import DataTable, { type Header } from '@/components/ui/DataTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import PlusIcon from '@/assets/icons/PlusIcon.vue'
import EditIcon from '@/assets/icons/EditIcon.vue'
import AddBranchesDialog from '@/components/dialogs/AddBranchesDialog.vue'
import EditBranchDialog from '@/components/dialogs/EditBranchDialog.vue'

const store = useReservationStore()

const { availableBranches, disabledBranches, loadingBranches } = storeToRefs(store)
const { fetchBranches, toggleBranchReservations, toggleSingleBranch } = store

const { success, error } = useToast()

const showDisableConfirm = ref(false)
const disableConfirmLoading = ref(false)

const confirmDisableReservations = async () => {
  disableConfirmLoading.value = true

  try {
    const results = await toggleBranchReservations(false)

    const failedBranches = results.filter((r) => r.status === 'failed')
    const successBranches = results.filter((r) => r.status === 'success')

    if (failedBranches.length > 0) {
      error(`Failed to disable ${failedBranches.length} branches`)
    }

    if (successBranches.length > 0) {
      success(`Successfully disabled ${successBranches.length} branches`)
    }
  } catch {
    error('Error disabling reservations')
  } finally {
    disableConfirmLoading.value = false
    showDisableConfirm.value = false
  }
}

const showEnableConfirm = ref(false)
const enableConfirmLoading = ref(false)

const confirmEnableReservations = async () => {
  enableConfirmLoading.value = true

  try {
    const results = await toggleBranchReservations(true)

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
    enableConfirmLoading.value = false
    showEnableConfirm.value = false
  }
}

const headers: Header[] = [
  { key: 'name', label: 'Branch', align: 'left' },
  { key: 'reference', label: 'Reference', align: 'center' },
  { key: 'numberOfTables', label: 'Number of Tables', align: 'center' },
  { key: 'reservation_duration', label: 'Reservation Duration', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const loadBranches = async () => {
  try {
    await fetchBranches()
  } catch {
    error(`Error Loading Branches, Try later!`)
  }
}

const showAddBranchesDialog = ref(false)

const showEditDialog = ref(false)
const editingBranch = ref<Branch | null>(null)

const showSingleDisableDialog = ref(false)
const branchToDisable = ref<Branch | null>(null)
const singleDisableLoading = ref(false)

const openEditDialog = (branch: Branch) => {
  editingBranch.value = branch
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingBranch.value = null
}

const showSingleDisableConfirm = (branch: Branch) => {
  branchToDisable.value = branch
  showSingleDisableDialog.value = true
}

const cancelSingleDisable = () => {
  showSingleDisableDialog.value = false
  branchToDisable.value = null
}

const confirmSingleDisable = async () => {
  if (!branchToDisable.value) return

  singleDisableLoading.value = true

  try {
    const result = await toggleSingleBranch(branchToDisable.value.id, false)
    if (result.success) {
      success(`Successfully disabled ${branchToDisable.value.name}`)
    } else {
      error(`Failed to disable ${branchToDisable.value.name}`)
    }
  } catch {
    error(`Failed to disable ${branchToDisable.value.name}`)
  } finally {
    singleDisableLoading.value = false
    showSingleDisableDialog.value = false
    branchToDisable.value = null
  }
}

onMounted(async () => {
  loadBranches()
})
</script>
