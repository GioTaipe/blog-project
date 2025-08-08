const API_BASE = 'https://blog-project-4dku.onrender.com/api/users'

// Funciones para manejar la autenticación y el perfil de usuario
export async function getUserProfile() {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
  const data = await res.json()
  
  if (!res.ok) throw new Error(data.message || 'Error al obtener perfil')
  return data
}

// Función para eliminar el perfil de usuario
export async function deleteUserProfile() {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_BASE}/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al eliminar perfil')
  return data 
} 

// Función para actualizar los datos del usuario
export async function updateUser(userData) {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_BASE}/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  })
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario')
  return data
}
