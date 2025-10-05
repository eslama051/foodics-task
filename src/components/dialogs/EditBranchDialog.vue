<template>
  <BaseDialog :show="show" :backdrop="false" :title="title" @hide="$emit('hide')" width="max-w-xl">
    <div class="space-y-4">
      <div
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div class="flex items-start">
          <div class="text-sm text-blue-800 dark:text-blue-200">
            Branch working hours are
            {{ `${formData?.opening_from} - ${formData?.opening_to}` }}
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <BaseInput
          required
          v-model="formData.reservation_duration as string"
          type="number"
          label="Reservation Duration (minutes)"
          placeholder="Enter duration in minutes"
        />

        <BaseSelect
          v-model="selectedTables"
          :options="allTablesOptions"
          multiple
          label="Tables"
          placeholder="Select tables that accept reservations..."
        />

        <div class="space-y-4 mt-8">
          <div v-for="(day, index) in weekDays" :key="day" class="space-y-2">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3 capitalize">
                {{ day }}
              </h3>
              <button
                v-if="!index"
                class="text-primary dark:text-orange-500"
                @click="applyFirstDayToAll"
              >
                Apply On All Days
              </button>
            </div>
            <TimeSlotCard
              :opening-from="formData.opening_from"
              :opening-to="formData.opening_to"
              v-model="formData.reservation_times[day as keyof ReservationTimes] as string[][]"
            />
            <!-- Validation Errors  -->
            <div v-if="dayValidationErrors[day]" class="ml-4">
              <div
                v-for="error in dayValidationErrors[day]"
                :key="error"
                class="text-sm text-red-600 dark:text-red-400 flex items-start"
              >
                <span class="text-red-500 mr-2">•</span>
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('hide')"> Cancel </BaseButton>
      <BaseButton variant="primary" :loading="loading" :disabled="!isFormValid" @click="handleSave">
        Save
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseDialog from './BaseDialog.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../forms/BaseInput.vue'
import BaseSelect from '../forms/BaseSelect.vue'
import TimeSlotCard from '../forms/TimeSlotCard.vue'
import type { Branch, ReservationTimes } from '@/stores/reservation'
import { useReservationStore } from '@/stores/reservation'
import { useToast } from '@/composables/useToast'

interface Props {
  show: boolean
  branch: Branch | null
}

const title = computed(() => `Edit ${formData.value?.name} branch reservation settings`)

const emit = defineEmits<{
  hide: []
}>()

const props = defineProps<Props>()

const store = useReservationStore()
const { updateBranch } = store
const { success, error } = useToast()

const loading = ref(false)

const formData = ref<Branch>({
  id: '',
  name: '',
  reference: '',
  opening_from: '',
  opening_to: '',
  accepts_reservations: false,
  reservation_duration: '',
  sections: [],
  reservation_times: {
    friday: [],
    monday: [],
    sunday: [],
    tuesday: [],
    saturday: [],
    thursday: [],
    wednesday: [],
  },
})

const selectedTables = ref<string[]>([])

const weekDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const filAllDays = (reservationTimes: ReservationTimes | null) => {
  const result: ReservationTimes = {}
  weekDays.forEach((day) => {
    result[day as keyof ReservationTimes] = reservationTimes?.[day as keyof ReservationTimes] || []
  })
  return result
}

const allTablesOptions = computed(() => {
  const tables = []
  for (const section of formData.value.sections) {
    for (const table of section.tables) {
      tables.push({
        value: table.id,
        label: `${section.name} - ${table.name}`,
      })
    }
  }
  return tables
})

const dayValidationErrors = computed(() => {
  const errors: Record<string, string[]> = {}

  weekDays.forEach((day) => {
    const dayErrors: string[] = []
    const slots: string[][] = formData.value.reservation_times[day as keyof ReservationTimes] || []

    // Check for empty slots
    const hasEmptySlots = slots.some((slot) => !slot[0] || !slot[1])
    if (hasEmptySlots) {
      dayErrors.push('Please fill in all time slots or remove empty ones')
    }

    // Check for invalid time ranges (end time before start time)
    const invalidTimeRanges = slots.some((slot) => {
      if (slot[0] && slot[1]) {
        const start = parseInt(slot[0].replace(':', ''))
        const end = parseInt(slot[1].replace(':', ''))
        return end <= start
      }
      return false
    })
    if (invalidTimeRanges) {
      dayErrors.push('End time must be after start time')
    }

    // Check for intersections
    const validSlots = slots.filter((slot) => slot[0] && slot[1])
    for (let i = 0; i < validSlots.length; i++) {
      for (let j = i + 1; j < validSlots.length; j++) {
        const slot1 = validSlots[i] as [string, string]
        const slot2 = validSlots[j] as [string, string]

        const start1 = parseInt(slot1[0].replace(':', ''))
        const end1 = parseInt(slot1[1].replace(':', ''))
        const start2 = parseInt(slot2[0].replace(':', ''))
        const end2 = parseInt(slot2[1].replace(':', ''))

        if (start1 < end2 && end1 > start2) {
          dayErrors.push('Time slots cannot overlap')
          break
        }
      }
      if (dayErrors.some((error) => error.includes('overlap'))) break
    }

    if (dayErrors.length > 0) {
      errors[day] = dayErrors
    }
  })

  return errors
})

const isFormValid = computed(() => {
  return !!(
    Object.keys(dayValidationErrors.value).length === 0 && formData.value.reservation_duration
  )
})

const applyFirstDayToAll = () => {
  const saturdayTimes = formData.value.reservation_times.saturday
  weekDays.forEach((day) => {
    if (day !== 'saturday') {
      formData.value.reservation_times[day as keyof ReservationTimes] = JSON.parse(
        JSON.stringify(saturdayTimes),
      )
    }
  })
}

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return
  }
  loading.value = true
  try {
    await updateBranch(formData.value)

    success('Branch reservation settings updated successfully')
    emit('hide')
  } catch {
    error('An error occurred while updating branch settings')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.branch,
  (branch) => {
    if (branch) {
      formData.value = {
        id: branch.id,
        name: branch.name,
        reference: branch.reference || '',
        opening_from: branch.opening_from,
        opening_to: branch.opening_to,
        reservation_duration: branch.reservation_duration,
        accepts_reservations: branch.accepts_reservations,
        sections: JSON.parse(JSON.stringify(branch.sections)),
        reservation_times: filAllDays(branch.reservation_times || {}),
      }

      // Set selected tables  with accepts_reservations = true
      const acceptingTables = []
      for (const section of branch.sections) {
        for (const table of section.tables) {
          if (table.accepts_reservations) {
            acceptingTables.push(table.id)
          }
        }
      }
      selectedTables.value = acceptingTables
    }
  },
  { immediate: true },
)

watch(
  selectedTables,
  (newSelectedTables) => {
    for (const section of formData.value.sections) {
      for (const table of section.tables) {
        table.accepts_reservations = newSelectedTables.includes(table.id)
      }
    }
  },
  { deep: true },
)

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      formData.value = {
        id: '',
        name: '',
        reference: '',
        opening_from: '',
        opening_to: '',
        accepts_reservations: false,
        reservation_duration: '',
        sections: [],
        reservation_times: {
          friday: [],
          monday: [],
          sunday: [],
          tuesday: [],
          saturday: [],
          thursday: [],
          wednesday: [],
        },
      }
      selectedTables.value = []
    }
  },
)
</script>
