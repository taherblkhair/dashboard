<template>
  <nav class="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
    <!-- أضف fixed و z-50 -->
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <button
            @click="$emit('toggle-sidebar')"
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 class="mr-4 text-xl font-bold text-gray-800">لوحة التحكم</h1>
        </div>

        <div class="flex items-center space-x-4 space-x-reverse">
          <div class="relative">
            <input
              type="text"
              placeholder="بحث..."
              class="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute left-3 top-2.5">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div class="flex items-center space-x-2 space-x-reverse">
            <img class="h-8 w-8 rounded-full" src="https://via.placeholder.com/32" alt="Profile" />
            <span class="text-sm font-medium text-gray-700">المدير</span>
          </div>

          <!-- زر تسجيل الخروج -->
          <div>
            <button
              @click="logoutUser"
              class="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              aria-label="تسجيل الخروج"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

import { useRouter } from 'vue-router'
import { authService, setAuthToken } from '@/services/api'

const router = useRouter()

const logoutUser = async () => {
  try {
    // حاول إخطار السيرفر إذا كان endpoint موجودًا
    if (authService.logout) {
      await authService.logout()
    }
  } catch (e) {
    // لا مانع من تجاهل خطأ الخروج من السيرفر
    console.warn('Logout request failed', e)
  } finally {
    // أزل التوكن محليًا
    setAuthToken(null)
    // أعد التوجيه إلى صفحة الدخول
    router.push({ name: 'login' })
  }
}
</script>
