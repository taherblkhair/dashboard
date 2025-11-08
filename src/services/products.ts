import api from './api'

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: FormData | Record<string, unknown>) => api.post('/products', data),
  update: (id: number, data: FormData | Record<string, unknown>) =>
    api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}
