// src/services/api.ts
import axios from 'axios'

// إنشاء instance لـ axios بالإعدادات الأساسية
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // تأكد من أن البورت 8000 وليس 8080
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// إضافة interceptors لتصحيح الأخطاء
api.interceptors.response.use(
  (response: unknown) => {
    return response
  },
  (error: unknown) => {
    const e = error as { response?: { data?: unknown }; message?: string }
    console.error('API Error:', e.response?.data ?? e.message ?? String(e))
    return Promise.reject(error)
  },
)

// خدمات الأصناف
export const categoryService = {
  // جلب جميع الأصناف
  getAll: () => api.get('/categories'),

  // جلب صنف محدد
  getById: (id: number) => api.get(`/categories/${id}`),

  // إنشاء صنف جديد
  create: (data: FormData) =>
    api.post('/categories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // تحديث صنف
  update: (id: number, data: FormData) =>
    api.post(`/categories/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // حذف صنف
  delete: (id: number) => api.delete(`/categories/${id}`),
}

// src/services/api.ts

export default api

// ----------------------
// Authentication helpers
// ----------------------
const TOKEN_KEY = 'auth_token'

/** Set or clear auth token: saves to localStorage and sets axios default header */
export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      const dh = api.defaults.headers as Record<string, unknown> & {
        common?: Record<string, string>
      }
      dh.common = dh.common || {}
      dh.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem(TOKEN_KEY)
      const dh = api.defaults.headers as Record<string, unknown> & {
        common?: Record<string, string>
      }
      if (dh.common) delete dh.common['Authorization']
    }
  } catch (e) {
    // localStorage may be unavailable in some contexts; fail silently
    console.warn('setAuthToken: unable to access localStorage', e)
  }
}

/** Read token from localStorage */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    console.warn('getAuthToken: unable to access localStorage', e)
    return null
  }
}

// Initialize axios Authorization header from storage if present
const existing = getAuthToken()
if (existing) {
  const dh = api.defaults.headers as Record<string, unknown> & { common?: Record<string, string> }
  dh.common = dh.common || {}
  dh.common['Authorization'] = `Bearer ${existing}`
}

// تصدير خدمات المصادقة
export const authService = {
  // يقوم بإرسال بيانات الدخول ويتوقع توكن في الاستجابة
  login: (data: { email: string; password: string }) => api.post('/login', data),
  // إذا كان الخادم يدعم logout

  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
  api.post('/register', data),

  // إذا كان الخادم يدعم logout
  logout: () => api.post('/logout'),

}
