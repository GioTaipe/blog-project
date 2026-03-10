import api from './axiosConfig'

/**
 * Iniciar sesión de usuario
 */
export async function loginUser (email, password) {
  const { data } = await api.post('/users/login', { email, password })
  return data
}

/**
 * Login con Google
 */
export async function googleLogin (credential) {
  const { data } = await api.post('/auth/google', { credential })
  return data
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser (name, email, password) {
  const { data } = await api.post('/users/register', { name, email, password })
  return data
}
