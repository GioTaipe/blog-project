<template>
  <div class="callback-page">
    <div class="callback-content">
      <div class="callback-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
      </div>
      <span class="callback-brand">Blog<span>Vibe</span></span>
      <div v-if="!error" class="callback-spinner"></div>
      <p class="callback-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { googleLoginWithCode } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const message = ref('Autenticando con Google...')
const error = ref(false)

const GOOGLE_CALLBACK_PATH = '/auth/google/callback'

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const errorParam = params.get('error')

  if (errorParam) {
    error.value = true
    message.value = 'Se canceló el inicio de sesión con Google'
    setTimeout(() => router.push('/Login'), 2000)
    return
  }

  if (!code) {
    error.value = true
    message.value = 'No se recibió respuesta de Google'
    setTimeout(() => router.push('/Login'), 2000)
    return
  }

  try {
    const redirectUri = `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
    const data = await googleLoginWithCode(code, redirectUri)

    if (!data?.token || !data?.user) {
      throw new Error('Respuesta inválida del servidor')
    }

    authStore.login(data.token, data.user)
    message.value = `Bienvenido, ${data.user.name}!`
    setTimeout(() => router.push('/Posts'), 1200)
  } catch (err) {
    console.error('Google callback error:', err)
    error.value = true
    message.value = err.message || 'Error al iniciar sesión con Google'
    setTimeout(() => router.push('/Login'), 3000)
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
}
.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both;
}
.callback-icon {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(29,95,209,.4);
}
.callback-icon svg {
  width: 28px; height: 28px;
  fill: white;
}
.callback-brand {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
}
.callback-brand span { color: #4b8aff; }
.callback-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(75,138,255,.2);
  border-top-color: #4b8aff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(32px); }
  to   { opacity:1; transform:translateY(0); }
}
.callback-text {
  font-family: 'DM Sans', sans-serif;
  font-size: .92rem;
  color: #c9d7f5;
}
</style>
