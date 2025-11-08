<template>
  <div id="app" dir="rtl" class="font-arabic bg-gray-50 min-h-screen">
    <AppNavbar @toggle-sidebar="toggleSidebar" />
    <div class="flex pt-16 h-screen"> <!-- أضف h-screen -->
      <AppSidebar :is-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 p-6 transition-all duration-300 overflow-auto" :class="{ 'mr-64': sidebarOpen }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import AppSidebar from './components/AppSidebar.vue'

// غير القيمة إلى true لتكون مفتوحة افتراضياً
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>
