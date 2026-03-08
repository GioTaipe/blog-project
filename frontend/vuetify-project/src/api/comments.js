import api from './axiosConfig'

/**
 * Obtener todos los comentarios de un post
 */
export async function getComments (postId) {
  try {
    const { data } = await api.get(`/comments/${postId}`)
    // Axios ya parsea el JSON, devolvemos la data directamente
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener comentarios')
  }
}

/**
 * Crear un nuevo comentario
 */
export async function createComment (postId, content) {
  try {
    // No necesitamos pasar el token, el interceptor de Axios lo hace por nosotros
    const { data } = await api.post(`/comments/createComment/${postId}`, { content })
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al crear el comentario')
  }
}

/**
 * Eliminar un comentario
 */
export async function deleteCommentApi (commentId) {
  try {
    const { data } = await api.delete(`/comments/${commentId}`)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar el comentario')
  }
}
