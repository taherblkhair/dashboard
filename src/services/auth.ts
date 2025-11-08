import api from './api'

export const authService = {
  // يقوم بإرسال بيانات الدخول ويتوقع توكن في الاستجابة
  login: (data: { email: string; password: string }) => api.post('/login', data),

  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => api.post('/register', data),

  // إذا كان الخادم يدعم logout
  logout: () => api.post('/logout'),
}
