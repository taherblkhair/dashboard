<template>
  <div id="app" dir="rtl" class="font-arabic bg-gray-50 min-h-screen">
    <AppNavbar v-if="!hideLayout" @toggle-sidebar="toggleSidebar" />
    <div :class="['flex', hideLayout ? '' : 'pt-16', 'h-screen']">
      <!-- أضف h-screen -->
      <AppSidebar v-if="!hideLayout" :is-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
      <main
        class="flex-1 p-6 transition-all duration-300 overflow-auto"
        :class="{ 'mr-64': sidebarOpen && !hideLayout }"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppSidebar from './components/AppSidebar.vue'

// غير القيمة إلى true لتكون مفتوحة افتراضياً
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const route = useRoute()
// hide layout (navbar + sidebar) when a route sets meta.hideLayout = true
const hideLayout = computed(() =>
  route.matched.some((r) => (r.meta as { hideLayout?: boolean })?.hideLayout === true),
)
</script>
