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
    const data = error.response?.data
    const status = error.response?.status

    // Extraer mensaje: desde message, o desde el array errors de express-validator
    let message = data?.message
      || data?.errors?.[0]?.msg
      || 'Error de conexión con el servidor'

    // Si el token expiró (401), cerrar sesión automáticamente
    if (status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }

    const apiError = new Error(message)
    apiError.status = status
    return Promise.reject(apiError)
  },
)

export default api
