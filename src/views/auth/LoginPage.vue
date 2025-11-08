<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 class="text-center text-2xl font-bold text-gray-900">تسجيل الدخول</h2>

      <!-- رسالة خطأ -->
      <div v-if="error" class="bg-red-100 text-red-700 p-3 text-sm rounded">
        {{ error }}
      </div>

      <form @submit.prevent="loginUser" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full border text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-1">كلمة المرور</label>
          <input
            type="password"
            v-model="password"
            required
            class="w-full border text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="***********"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
        >
          <span
            v-if="loading"
            class="w-4 h-4 animate-spin border-2 border-white border-b-transparent rounded-full ml-2"
          ></span>
          تسجيل الدخول
        </button>
      </form>

      <div class="text-center text-sm text-gray-600">
        ليس لديك حساب؟
        <router-link to="/register" class="text-blue-600 hover:underline">إنشاء حساب</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth'
import { setAuthToken } from '@/services/api'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios' // <-- ضروري لاستخدام isAxiosError

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')

const loginUser = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authService.login({
      email: email.value,
      password: password.value,
    })

    const token = response?.data?.token
    if (!token) {
      throw new Error('لم يتم استلام التوكن من السيرفر')
    }

    setAuthToken(token)
    // إذا وُجد redirect في الاستعلام، عد إلى الصفحة المطلوبة، وإلا اذهب إلى dashboard
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: unknown) {
    // ✳️ استخدم unknown ثم قم بالتضييق
    const axiosNs = axios as unknown as { isAxiosError?: (payload: unknown) => boolean }
    if (axiosNs.isAxiosError && axiosNs.isAxiosError(err)) {
      // بعض تعريفات axios لا تصدر نوع AxiosError بشكل مباشر.
      // نضيق الخطأ إلى شكل بسيط بما يكفي للحصول على رسالة الخادم إن وُجدت.
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = axiosErr.response?.data?.message
      error.value = msg || axiosErr.message || 'خطأ في تسجيل الدخول'
    } else if (err instanceof Error) {
      // أي Error عام
      error.value = err.message
    } else {
      // غير معروف — تحويل إلى نص
      error.value = String(err)
    }
  } finally {
    loading.value = false
  }
}
</script>
