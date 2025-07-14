/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import Posts from '@/pages/Posts.vue'
import Profile from '@/pages/Profile.vue'
import Login from '@/pages/Login.vue'

const routes = [
  { path: '/Login', component: Login },
  { path: '/Posts', component: Posts, meta: { requiresAuth: true } },
  { path: '/Profile', component: Profile, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Funcon para verificar si el token ha expirado
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch (e) {
    console.error('Invalid token format', e)
    return true // Treat invalid tokens as expired
  }
}

// Navegacion global para verificar autenticación
// y redirigir a la página de inicio de sesión si es necesario
// y redirigir a la página de posts si ya está autenticado
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = token && !isTokenExpired(token)
  if (to.meta.requiresAuth && !isAuthenticated) {
    localStorage.removeItem('token')
    return next({ path: '/Login' })
  }
  if (to.path === '/Login' && isAuthenticated) {
    return next({ path: '/Posts' })
  }
  next()
})


// Workaround for https://github.com/vitejs/vite/issues/11804
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
    console.error(err)
  }
})
//De esta manera se evita el error de importación dinámica de módulos en Vuetify pero no es la mejor solución ya que forzamos y el plugin 

// router.isReady().then(() => {
//   localStorage.removeItem('vuetify:dynamic-reload')
// })
// console.log(router.getRoutes())
// const postRoute = router.getRoutes().find(r => r.path === '/Posts')
// if (postRoute) postRoute.meta.requiresAuth = true

// const profileRoute = router.getRoutes().find(r => r.path === '/Profile')
// if (profileRoute) profileRoute.meta.requiresAuth = true

export default router
