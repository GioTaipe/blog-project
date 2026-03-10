import api from './axiosConfig'

/**
 * Obtener todos los posts
 */
export async function getPosts (page = 1) {
  const { data } = await api.get(`/posts/getAllPost?page=${page}`)
  return data.success ? { posts: data.posts, hasMore: data.hasMore } : { posts: [], hasMore: false }
}

/**
 * Crear un nuevo post
 * Axios detecta automáticamente que es FormData y pone el Content-Type correcto
 */
export async function createPost (post) {
  const formData = new FormData()
  formData.append('content', post.content)
  if (post.file) {
    formData.append('image', post.file)
  }

  const { data } = await api.post('/posts/createPost', formData)
  return data
}

/**
 * Obtener artículos de un usuario específico (Mis artículos)
 */
export async function getMyArticles () {
  const { data } = await api.get('/posts/my')
  return data.success ? data.posts : []
}

/**
 * Eliminar un artículo por ID
 */
export async function deletePostApi (id) {
  const { data } = await api.delete(`/posts/${id}`)
  return data
}

/**
 * Añadir o eliminar un like a un post
 */
export async function toggleLike (postId) {
  const { data } = await api.post(`/posts/${postId}/like`)
  return data
}

/**
 * Obtener artículos de un usuario específico por su ID
 */
export async function getUserPosts (userId) {
  const { data } = await api.get(`/posts/user/${userId}`)
  return data.success ? data.posts : []
}
