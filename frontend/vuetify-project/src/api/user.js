import api from './axiosConfig'

/**
 * Obtener perfil del usuario autenticado
 */
export async function getUserProfile () {
  try {
    const { data } = await api.get('/users/me')
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener perfil')
  }
}

/**
 * Buscar usuarios por nombre
 */
export async function searchUsers (query) {
  try {
    const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al buscar usuarios')
  }
}

/**
 * Obtener perfil público de un usuario por ID
 */
export async function getPublicProfile (userId) {
  try {
    const { data } = await api.get(`/users/${userId}`)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener perfil público')
  }
}

/**
 * Eliminar el perfil de usuario
 */
export async function deleteUserProfile () {
  try {
    const { data } = await api.delete('/users/me')
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar perfil')
  }
}

/**
 * Actualizar datos básicos del usuario (Nombre, email, etc.)
 */
export async function updateUser (userData) {
  try {
    const { data } = await api.put('/users/me', userData)
    return data.user
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar usuario')
  }
}

/**
 * Actualizar la imagen de perfil (Cloudinary)
 */
export async function updateProfileImage (file) {
  try {
    const formData = new FormData()
    formData.append('profilePic', file)

    const { data } = await api.put('/users/me/profile-image', formData)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar imagen de perfil')
  }
}

/**
 * Actualizar la imagen del banner del perfil (Cloudinary)
 */
export async function updateBannerImage (file) {
  try {
    const formData = new FormData()
    formData.append('bannerImage', file)

    const { data } = await api.put('/users/me/banner-image', formData)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar imagen del banner')
  }
}
