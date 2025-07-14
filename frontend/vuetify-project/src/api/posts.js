const API_BASE = 'http://localhost:3001/api'

// obtener todos los posts
export async function getPosts() {
  const res = await fetch(`${API_BASE}/articles/getAllArticles`)
  const data = await res.json()
  console.log("🔄 Respuesta del servidor al obtener posts:", data);
  
  if (!res.ok) throw new Error(data.message || 'Error al obtener posts')
  return data
}
// crear un nuevo post
export async function createPost(post) {
  const token = localStorage.getItem('token')
  const formData = new FormData(); 
  formData.append('content', post.content)
  if (post.file) {
    formData.append('image', post.file)
  }
  const res = await fetch(`${API_BASE}/articles/createArticle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  })
  const data = await res.json()
  console.log("🔄 Respuesta del servidor al crear post:", data);
  
  if (!res.ok) throw new Error(data.message || 'Error al crear el post')
  return data
}
// obtener artículos de un usuario específico
export async function getMyArticles() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/articles/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al obtener tus artículos')
  return data
}
// Eliminar un artículo por ID
export async function deletePostApi(id) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al eliminar el post')
  return data
}
// Añadir o eliminar un like a un post
export async function toggleLike(postId, userId) {
  console.log(`🔄 Toggle like for post ${postId} by user ${userId}`);
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE}/articles/${postId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error('Error al hacer like');
  }

  return await response.json();
}
