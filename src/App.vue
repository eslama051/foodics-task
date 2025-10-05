<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layouts/AppHeader.vue'
import BaseToast from '@/components/layouts/BaseToast.vue'
import { useTheme } from '@/composables/useTheme'

const { init } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <BaseToast />
  </div>
</template>
