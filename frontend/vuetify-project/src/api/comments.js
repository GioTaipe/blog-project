import api from './axiosConfig'

/**
 * Obtener todos los comentarios de un post
 */
export async function getComments (postId) {
  const { data } = await api.get(`/comments/${postId}`)
  return data
}

/**
 * Crear un nuevo comentario
 */
export async function createComment (postId, content) {
  const { data } = await api.post(`/comments/createComment/${postId}`, { content })
  return data
}

/**
 * Eliminar un comentario
 */
export async function deleteCommentApi (commentId) {
  const { data } = await api.delete(`/comments/${commentId}`)
  return data
}
