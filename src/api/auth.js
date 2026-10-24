import api from './client'

export const register = (data) => api.post('/accounts/register/', data)
export const login = (data) => api.post('/accounts/login/', data)
export const logout = () => api.post('/accounts/logout/')
export const getMe = () => api.get('/accounts/me/')
export const verifyOtp = (data) => api.post('/accounts/verify-otp/', data)
export const resendOtp = (data) => api.post('/accounts/resend-otp/', data)
export const forgotPassword = (data) => api.post('/accounts/forgot-password/', data)
export const resetPassword = (data) => api.post('/accounts/reset-password/', data)


