import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
})

// Interceptor para Inyectar el Token
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Interceptor para Manejo Global de Errores
api.interceptors.response.use(
  response => response,
  error => {
    const customError = {
      message:
        error.response?.data?.message || 'Error de conexión con el servidor',
      status: error.response?.status,
    }

    // Si el token expiró (401), podemos cerrar sesión automáticamente
    if (customError.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }

    return Promise.reject(customError)
  },
)

export default api
