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

export default api
