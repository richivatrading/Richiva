import api from './client'

export const getCart = () => api.get('/cart/')
export const addToCart = (productId, quantity = 1) =>
  api.post(`/cart/add/${productId}/`, { quantity })
export const updateCart = (productId, quantity) =>
  api.post(`/cart/update/${productId}/`, { quantity })
export const removeFromCart = (productId) =>
  api.post(`/cart/remove/${productId}/`)
