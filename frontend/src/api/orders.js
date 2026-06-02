import apiClient from './client'

export const ordersApi = {
  getAll: (params = {}) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  delete: (id) => apiClient.delete(`/orders/${id}`),
}
