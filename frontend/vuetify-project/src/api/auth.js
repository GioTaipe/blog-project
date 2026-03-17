import api from './axiosConfig'

/**
 * Iniciar sesión de usuario
 */
export async function loginUser (email, password) {
  const { data } = await api.post('/users/login', { email, password })
  return data
}

/**
 * Login con Google (flujo redirect — authorization code)
 */
export async function googleLoginWithCode (code, redirectUri) {
  const { data } = await api.post('/auth/google', { code, redirectUri })
  return data
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser (name, email, password) {
  const { data } = await api.post('/users/register', { name, email, password })
  return data
}
