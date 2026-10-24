import api from './client'

export const getTryOn = (productId) =>
  api.get(`/tryon/?product=${productId}`)
export const createTryOn = (formData, productId) =>
  api.post(`/tryon/?product=${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getTryOnResult = (id) => api.get(`/tryon/result/${id}/`)
