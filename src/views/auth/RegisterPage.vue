<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 class="text-center text-2xl font-bold text-gray-900">تسجيل حساب جديد</h2>

      <!-- رسالة النجاح -->
      <div v-if="success" class="p-3 bg-green-100 text-green-700 text-sm rounded">
        تم إنشاء الحساب بنجاح ✅
      </div>

      <!-- رسالة الخطأ -->
      <div v-if="error" class="p-3 bg-red-100 text-red-700 text-sm rounded">
        {{ error }}
      </div>

      <form @submit.prevent="registerUser" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm mb-1">الاسم</label>
          <input
            type="text"
            v-model="form.name"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="محمد أحمد"
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            v-model="form.email"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-1">كلمة المرور</label>
          <input
            type="password"
            v-model="form.password"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="***********"
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            v-model="form.password_confirmation"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
          تسجيل
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { authService } from '@/services/auth'
import { setAuthToken } from '@/services/api'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const registerUser = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await authService.register(form)

    // استخراج التوكن من الاستجابة
    const token = response?.data?.token
    if (token) {
      setAuthToken(token)
    }

    success.value = true

    // توجيه إلى الصفحة المقصودة بعد التسجيل إذا وُجدت
    const redirect = (route.query.redirect as string) || '/dashboard'
    setTimeout(() => {
      router.push(redirect) // غيرها حسب مسارك
    }, 1200)
  } catch (err: unknown) {
    const axiosNs = axios as unknown as { isAxiosError?: (payload: unknown) => boolean }
    if (axiosNs.isAxiosError && axiosNs.isAxiosError(err)) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      error.value = axiosErr.response?.data?.message || axiosErr.message || 'حدث خطأ أثناء التسجيل'
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = String(err)
    }
  } finally {
    loading.value = false
  }
}
</script>
