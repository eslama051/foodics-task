import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const updateDOM = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateDOM()
  }

  const init = () => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    isDark.value = saved === 'dark' || (!saved && prefersDark)
    updateDOM()
  }

  return { isDark, toggle, init }
}
