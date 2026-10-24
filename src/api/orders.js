import api from './client'

export const getOrders = () => api.get('/orders/')
export const getOrder = (id) => api.get(`/orders/${id}/`)
export const checkout = (data) => api.post('/orders/checkout/', data)
export const verifyPayment = (orderId, pidx) =>
  api.post(`/orders/${orderId}/verify/`, { pidx })
export const getOrderSuccess = (id) => api.get(`/orders/${id}/success/`)
