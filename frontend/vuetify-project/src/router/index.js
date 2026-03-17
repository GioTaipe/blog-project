/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
// Componentes
import Login from '@/pages/Login.vue'
import GoogleCallback from '@/pages/GoogleCallback.vue'
import Posts from '@/pages/Posts.vue'
import Profile from '@/pages/Profile.vue'
import PublicProfile from '@/pages/PublicProfile.vue'
import { useAuthStore } from '@/stores/authStore' // Importamos el store de Pinia

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', name: '/Login', component: Login },
  { path: '/auth/google/callback', name: 'GoogleCallback', component: GoogleCallback },
  {
    path: '/Posts',
    name: '/Posts',
    component: Posts,
    meta: { requiresAuth: true },
  },
  {
    path: '/Profile',
    name: '/Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/user/:id',
    name: '/user/:id',
    component: PublicProfile,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

/**
 * Navegación global protegida
 * Centralizamos la lógica usando el AuthStore de Pinia
 */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Verificamos si el usuario tiene sesión activa mediante el getter del Store
  const isAuthenticated = auth.isLoggedIn

  // Caso 1: La ruta requiere autenticación y el usuario NO está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Forzamos limpieza por seguridad (opcional ya que logout lo hace)
    auth.logout()
    return next({ name: '/Login' })
  }

  // Caso 2: El usuario intenta ir al Login teniendo ya una sesión activa
  if (to.path === '/Login' && isAuthenticated) {
    return next({ name: '/Posts' })
  }

  // En cualquier otro caso, permitimos la navegación
  next()
})

/**
 * Manejo de errores de importación dinámica
 * Específico para corregir fallos de carga de módulos en entornos Vite/Vuetify
 */
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error('Router error:', err)
  }
})

// Limpieza del flag de recarga cuando el router está listo
router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
