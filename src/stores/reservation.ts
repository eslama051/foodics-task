import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/composables/useApi'

interface Table {
  id: string
  name: string
  capacity: number
  accepts_reservations?: boolean
}

interface Section {
  id: string
  name: string
  tables: Table[]
}

export interface ReservationTimes {
  saturday?: string[][]
  sunday?: string[][]
  monday?: string[][]
  tuesday?: string[][]
  wednesday?: string[][]
  thursday?: string[][]
  friday?: string[][]
}

export interface Branch {
  id: string
  name: string
  reference?: string
  opening_from: string
  opening_to: string
  reservation_duration: string | number
  accepts_reservations: boolean
  sections: Section[]
  reservation_times: ReservationTimes
}

export const useReservationStore = defineStore('reservation', () => {
  const { get, put } = useApi()

  const branches = ref<Branch[]>([])
  const loadingBranches = ref(false)

  const fetchBranches = async () => {
    try {
      loadingBranches.value = true
      const response = await get<{ data: Branch[] }>('/branches?include[0]=sections&include[1]=sections.tables')
      branches.value = response.data
    } catch (err) {
      throw { error: err }
    } finally {
      loadingBranches.value = false
    }
  }


  const toggleBranchReservations = async (enable: boolean) => {
    const branchesToUpdate = enable ? disabledBranches.value : availableBranches.value

    // Promise.allSettled approach
    const promises = branchesToUpdate.map(async (branch) => {
      await put(`/branches/${branch.id}`, {
        accepts_reservations: enable
      })

      const branchIndex = branches.value.findIndex(b => b.id === branch.id)
      if (branchIndex !== -1 && branches.value[branchIndex]) {
        branches.value[branchIndex].accepts_reservations = enable
      }

      return { branch: branch.name, status: 'success' }
    })

    const settledResults = await Promise.allSettled(promises)

    return settledResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Extract branch name from the error if possible, or use a generic message
        return {
          status: 'failed',
          error: result.reason
        }
      }
    })

    // Sequential approach - slower but we can detect which ones have failed
    // const results = []
    // for await (const branch of branchesToUpdate) {
    //   try {
    //     await put(`/branches/${branch.id}`, {
    //       accepts_reservations: enable
    //     })
    //
    //     const branchIndex = branches.value.findIndex(b => b.id === branch.id)
    //
    //     if (branchIndex !== -1 && branches.value[branchIndex]) {
    //       branches.value[branchIndex].accepts_reservations = enable
    //     }
    //
    //     results.push({ branch: branch.name, status: 'success' })
    //   } catch (err) {
    //     results.push({ branch: branch.name, status: 'failed', error: err })
    //   }
    // }
    // return results

    // Promise.all approach - faster but all-or-nothing
    // const promises = branchesToUpdate.map(async (branch) => {
    //   try {
    //     await put(`/branches/${branch.id}`, {
    //       accepts_reservations: enable
    //     })
    //
    //     const branchIndex = branches.value.findIndex(b => b.id === branch.id)
    //     if (branchIndex !== -1 && branches.value[branchIndex]) {
    //       branches.value[branchIndex].accepts_reservations = enable
    //     }
    //
    //     return { branch: branch.name, status: 'success' }
    //   } catch (err) {
    //     return { branch: branch.name, status: 'failed', error: err }
    //   }
    // })
    //
    // return await Promise.all(promises)
  }

  const enableSelectedBranchReservations = async (selectedBranches: string[]) => {
    // Promise.allSettled approach
    const promises = selectedBranches.map(async (branchID) => {
      await put(`/branches/${branchID}`, {
        accepts_reservations: true
      })

      const branchIndex = branches.value.findIndex(b => b.id === branchID)

      if (branchIndex !== -1 && branches.value[branchIndex]) {
        branches.value[branchIndex].accepts_reservations = true
      }

      return { status: 'success' }
    })

    const settledResults = await Promise.allSettled(promises)

    return settledResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          status: 'failed',
          error: result.reason
        }
      }
    })

    // Sequential approach - slower but we can detect which ones have failed
    // const results = []
    // for await (const branchID of selectedBranches) {
    //   try {
    //     await put(`/branches/${branchID}`, {
    //       accepts_reservations: true
    //     })
    //
    //     const branchIndex = branches.value.findIndex(b => b.id === branchID)
    //
    //     if (branchIndex !== -1 && branches.value[branchIndex]) {
    //       branches.value[branchIndex].accepts_reservations = true
    //     }
    //
    //     results.push({ status: 'success' })
    //   } catch (err) {
    //     results.push({ status: 'failed', error: err })
    //   }
    // }
    // return results
  }

  const updateBranch = async (branch: Branch) => {
    try {
      const updateData = {
        reservation_duration: parseInt(branch.reservation_duration.toString()),
        reservation_times: branch.reservation_times,
        sections: branch.sections
      }

      await put(`/branches/${branch.id}`, updateData)

      const branchIndex = branches.value.findIndex(b => b.id === branch.id)
      if (branchIndex !== -1) {
        branches.value[branchIndex] = { ...branch }
      }
    } catch (err) {
      throw { error: err }
    }
  }

  const toggleSingleBranch = async (branchId: string, enable: boolean) => {
    try {
      await put(`/branches/${branchId}`, {
        accepts_reservations: enable
      })

      const branchIndex = branches.value.findIndex(b => b.id === branchId)
      if (branchIndex !== -1 && branches.value[branchIndex]) {
        branches.value[branchIndex].accepts_reservations = enable
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  const availableBranches = computed(() =>
    branches.value
      .filter(branch => branch.accepts_reservations)
      .map(branch => ({
        ...branch,
        numberOfTables: branch.sections.reduce((total, section) => {

          return total + section.tables.filter(table => table.accepts_reservations).length
        }, 0
        )
      }))
  )

  const disabledBranches = computed(() =>
    branches.value.filter(branch => !branch.accepts_reservations)
  )

  return {
    branches,
    availableBranches,
    disabledBranches,
    loadingBranches,
    fetchBranches,
    toggleBranchReservations,
    enableSelectedBranchReservations,
    updateBranch,
    toggleSingleBranch
  }
})
