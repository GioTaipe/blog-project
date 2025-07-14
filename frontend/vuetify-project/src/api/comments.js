const API_BASE = 'http://localhost:3001/api'

// obtener todos los comentarios de un post
export async function getComments(postId) {
  console.log("Fetching comments for postId:", postId);
  
  const res = await fetch(`${API_BASE}/comments/${postId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al obtener comentarios')
  return data
}
// crear un nuevo comentario
export async function createComment(postId, content) {
  console.log("Creating comment for postId:", postId, "with comment:", content);
  
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/comments/createComment/${postId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({content})
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al crear el comentario')
  return data
}
// eliminar un comentario
export async function deleteComment(postId, commentId) {
  console.log("Removing comment with commentId:", commentId, "for postId:", postId);
  
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/comments/${postId}/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al eliminar el comentario')
  return data
}