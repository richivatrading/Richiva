import api from './client'

export const getProducts = (params = {}) => api.get('/products/', { params })
export const getProduct = (id) => api.get(`/products/${id}/`)
export const getCategories = () => api.get('/products/categories/')
export const getCategory = (id) => api.get(`/products/categories/${id}/`)
