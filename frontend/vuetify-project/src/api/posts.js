import api from './axiosConfig'

/**
 * Obtener todos los posts
 */
export async function getPosts () {
  console.log('API!!')

  try {
    const { data } = await api.get('/posts/getAllPost')
    console.log(data)

    // Si el backend devuelve { success: true, posts: [...] }
    return data.success ? data.posts : []
  } catch (error) {
    console.error('Error en getPosts:', error.message)
    return []
  }
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

  try {
    const { data } = await api.post('/posts/createPost', formData)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al crear el post')
  }
}

/**
 * Obtener artículos de un usuario específico (Mis artículos)
 */
export async function getMyArticles () {
  try {
    const { data } = await api.get('/posts/my')
    return data.success ? data.posts : []
  } catch (error) {
    console.error('Error al obtener mis artículos:', error.message)
    return []
  }
}

/**
 * Eliminar un artículo por ID
 */
export async function deletePostApi (id) {
  try {
    const { data } = await api.delete(`/posts/${id}`)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar el post')
  }
}

/**
 * Añadir o eliminar un like a un post
 */
export async function toggleLike (postId) {
  try {
    const { data } = await api.post(`/posts/${postId}/like`)
    return data
  } catch (error) {
    throw new Error(error.message || 'Error al procesar el like')
  }
}

/**
 * Obtener artículos de un usuario específico por su ID
 */
export async function getUserPosts (userId) {
  try {
    const { data } = await api.get(`/posts/user/${userId}`)
    return data.success ? data.posts : []
  } catch (error) {
    console.error('Error al obtener artículos del usuario:', error.message)
    return []
  }
}
