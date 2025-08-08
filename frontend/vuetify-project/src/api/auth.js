const API_BASE_URL = 'https://blog-project-4dku.onrender.com/api';

// Iniciar sesión de usuario
export async function loginUser(email, password) {
  
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.message || 'Error al iniciar sesión')
  }

  return data
}
// Registrar un nuevo usuario
export async function registerUser(name, email, password) {
  
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })

  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.message || 'Error al registrar usuario')
  }

  return data
}