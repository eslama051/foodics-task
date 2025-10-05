import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const addToast = (msg: string, toastType: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastId

    const toast: Toast = {
      id,
      message: msg,
      type: toastType
    }

    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (msg: string) => addToast(msg, 'success')
  const error = (msg: string) => addToast(msg, 'error')
  const info = (msg: string) => addToast(msg, 'info')

  return { toasts, success, error, info, removeToast }
}
