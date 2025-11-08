import api from './api'

export const salesService = {
  getAll: () => api.get('/sales'),
  getById: (id: number) => api.get(`/sales/${id}`),
  create: (data: Record<string, unknown>) => api.post('/sales', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/sales/${id}`, data),
}

export default salesService
