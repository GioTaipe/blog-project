const API_BASE = 'https://blog-project-4dku.onrender.com/api'

// obtener todos los posts
export async function getPosts() {
  const res = await fetch(`${API_BASE}/articles/getAllArticles`)
  const data = await res.json()
  
  if (data.success) {
    return data.articles;
  } else {
    console.error('Error en getPosts:', data.message);
    return []; // devolver array vacío en caso de error
  }
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
   if (data.success) {
    return data.articles; // ✅ devolvemos solo los artículos
  } else {
    console.error("Error al obtener artículos del usuario:", data.message);
    return [];
  }
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
