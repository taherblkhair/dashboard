import api from './api'

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
