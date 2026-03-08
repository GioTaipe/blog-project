import api from './axiosConfig'

/**
 * Iniciar sesión de usuario
 */
export async function loginUser (email, password) {
  try {
    const { data } = await api.post('/users/login', { email, password })
    return data // Axios ya devolvió el JSON parseado
  } catch (error) {
    // Axios guarda el error del backend en error.response.data
    const message = error.response?.data?.message || 'Error al iniciar sesión'
    throw new Error(message)
  }
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser (name, email, password) {
  try {
    const { data } = await api.post('/users/register', { name, email, password })
    return data
  } catch (error) {
    const message = error.response?.data?.message || 'Error al registrar usuario'
    throw new Error(message)
  }
}
