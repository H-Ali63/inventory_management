import apiClient from './client'

export const customersApi = {
  getAll: (params = {}) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
}
