import api from './axiosConfig'

/**
 * Obtener perfil del usuario autenticado
 */
export async function getUserProfile () {
  const { data } = await api.get('/users/me')
  return data
}

/**
 * Buscar usuarios por nombre
 */
export async function searchUsers (query) {
  const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
  return data
}

/**
 * Obtener perfil público de un usuario por ID
 */
export async function getPublicProfile (userId) {
  const { data } = await api.get(`/users/${userId}`)
  return data
}

/**
 * Eliminar el perfil de usuario
 */
export async function deleteUserProfile () {
  const { data } = await api.delete('/users/me')
  return data
}

/**
 * Actualizar datos básicos del usuario (Nombre, email, etc.)
 */
export async function updateUser (userData) {
  const { data } = await api.put('/users/me', userData)
  return data.user
}

/**
 * Actualizar la imagen de perfil (Cloudinary)
 */
export async function updateProfileImage (file) {
  const formData = new FormData()
  formData.append('profilePic', file)

  const { data } = await api.put('/users/me/profile-image', formData)
  return data
}

/**
 * Eliminar la imagen de perfil
 */
export async function deleteProfileImage () {
  const { data } = await api.delete('/users/me/profile-image')
  return data
}

/**
 * Actualizar la imagen del banner del perfil (Cloudinary)
 */
export async function updateBannerImage (file) {
  const formData = new FormData()
  formData.append('bannerImage', file)

  const { data } = await api.put('/users/me/banner-image', formData)
  return data
}
