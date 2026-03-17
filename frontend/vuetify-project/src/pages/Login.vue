<template>
  <div class="login-page">
    <!-- Transition overlay -->
    <transition name="overlay-fade">
      <div v-if="redirecting" class="redirect-overlay">
        <div class="redirect-content">
          <div class="redirect-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          </div>
          <span class="redirect-brand">Blog<span>Vibe</span></span>
          <div class="redirect-spinner"></div>
          <p class="redirect-text">{{ successMessage }}</p>
        </div>
      </div>
    </transition>

    <div class="bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="wrapper">
      <!-- Left panel -->
      <div class="panel-left">
        <div class="brand">
          <div class="brand-logo">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
            <span class="brand-name">Blog<span>Vibe</span></span>
          </div>
          <p class="brand-tagline">Tu espacio para escribir</p>
        </div>

        <div class="panel-copy">
          <h2>Comparte tus ideas con el <em>mundo</em></h2>
          <p>Crea, publica y conecta con lectores que comparten tu pasion por las palabras.</p>
        </div>

        <div class="panel-features">
          <div class="feature-pill"><span class="dot"></span> Editor de blogs intuitivo</div>
          <div class="feature-pill"><span class="dot"></span> Comunidad activa</div>
          <div class="feature-pill"><span class="dot"></span> Personaliza tu perfil</div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="panel-right">
        <div class="tabs">
          <button class="tab-btn" :class="{ active: isLogin }" @click="switchTab(true)">Iniciar sesion</button>
          <button class="tab-btn" :class="{ active: !isLogin }" @click="switchTab(false)">Crear cuenta</button>
        </div>

        <!-- LOGIN -->
        <form v-show="isLogin" @submit.prevent="handleSubmit">
          <h2 class="form-title">Bienvenido de nuevo</h2>
          <p class="form-subtitle">Ingresa tus credenciales para continuar</p>

          <div class="input-group">
            <label>Correo electronico</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
              <input v-model="email" type="email" placeholder="tu@correo.com" autocomplete="email" required />
            </div>
          </div>

          <div class="input-group">
            <label>Contrasena</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" required />
              <button class="eye-btn" type="button" tabindex="-1" @click="showPassword = !showPassword">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2">
                  <path v-if="!showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <button class="btn-submit" :disabled="loading" type="submit">
            <v-progress-circular v-if="loading" class="mr-2" indeterminate size="18" width="2" color="white" />
            Iniciar sesion
          </button>

          <div class="divider-or">
            <span>o</span>
          </div>

          <button type="button" class="btn-google" @click="redirectToGoogle">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
        </form>

        <!-- REGISTER -->
        <form v-show="!isLogin" @submit.prevent="handleSubmit">
          <h2 class="form-title">Unete a BlogVibe</h2>
          <p class="form-subtitle">Crea tu cuenta y empieza a publicar hoy</p>

          <div class="input-group">
            <label>Nombre completo</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
              <input v-model="name" type="text" placeholder="Tu nombre" autocomplete="name" required />
            </div>
          </div>

          <div class="input-group">
            <label>Correo electronico</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
              <input v-model="email" type="email" placeholder="tu@correo.com" autocomplete="email" required />
            </div>
          </div>

          <div class="input-group">
            <label>Contrasena</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Min. 6 caracteres" autocomplete="new-password" required />
              <button class="eye-btn" type="button" tabindex="-1" @click="showPassword = !showPassword">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2">
                  <path v-if="!showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>Confirmar contrasena</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Repite tu contrasena" autocomplete="new-password" required />
              <button class="eye-btn" type="button" tabindex="-1" @click="showConfirmPassword = !showConfirmPassword">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2">
                  <path v-if="!showConfirmPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <button class="btn-submit" :disabled="loading" type="submit" style="margin-top:6px">
            <v-progress-circular v-if="loading" class="mr-2" indeterminate size="18" width="2" color="white" />
            Crear cuenta
          </button>

          <div class="divider-or">
            <span>o</span>
          </div>

          <button type="button" class="btn-google" @click="redirectToGoogle">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Registrarse con Google
          </button>
        </form>
      </div>
    </div>

    <v-snackbar v-model="showSuccess" color="#1d5fd1" location="bottom" rounded="pill" timeout="3000">
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showError" color="error" location="bottom" rounded="pill" timeout="4000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { loginUser, registerUser } from '@/api/auth'
  import { useAuthStore } from '@/stores/authStore'

  const authStore = useAuthStore()
  const router = useRouter()

  const isLogin = ref(true)
  const loading = ref(false)
  const redirecting = ref(false)

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const showSuccess = ref(false)
  const showError = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const GOOGLE_CALLBACK_PATH = '/auth/google/callback'

  const redirectToGoogle = () => {
    const redirectUri = `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const switchTab = (login) => {
    isLogin.value = login
    errorMessage.value = ''
    showPassword.value = false
    showConfirmPassword.value = false
  }

  const handleSubmit = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      if (isLogin.value) {
        const data = await loginUser(email.value, password.value)
        authStore.login(data.token, data.user)

        successMessage.value = `Bienvenido de nuevo, ${data.user.name}!`
        redirecting.value = true

        setTimeout(() => router.push('/posts'), 1500)
      } else {
        if (password.value !== confirmPassword.value) {
          throw new Error('Las contrasenas no coinciden')
        }

        await registerUser(name.value, email.value, password.value)

        successMessage.value = 'Registro exitoso. Ya puedes iniciar sesion.'
        showSuccess.value = true
        isLogin.value = true
        password.value = ''
        confirmPassword.value = ''
      }
    } catch (error) {
      errorMessage.value = error.message
      showError.value = true
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

/* Background blobs */
.bg {
  position: fixed; inset: 0; z-index: 0; overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  animation: drift 12s ease-in-out infinite alternate;
}
.blob-1 {
  width: 800px; height: 800px;
  background: radial-gradient(circle, #1d5fd1, #0a1628 70%);
  top: -200px; left: -150px;
  animation-delay: 0s;
}
.blob-2 {
  width: 650px; height: 650px;
  background: radial-gradient(circle, #4b8aff88, transparent 70%);
  bottom: -150px; right: -150px;
  animation-delay: -4s;
}
.blob-3 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #1d5fd166, transparent 70%);
  top: 40%; left: 50%;
  animation-delay: -8s;
}
@keyframes drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.06); }
}

/* Wrapper */
.wrapper {
  position: relative; z-index: 1;
  display: flex;
  width: min(960px, 95vw);
  min-height: 580px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(77,138,255,.18),
    0 40px 100px rgba(0,0,0,.55),
    0 0 60px rgba(29,95,209,.2);
  animation: fadeUp .7s cubic-bezier(.4,0,.2,1) both;
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(32px); }
  to   { opacity:1; transform:translateY(0); }
}

/* Left panel */
.panel-left {
  width: 42%;
  background: linear-gradient(155deg, #1a3a6e 0%, #0a1628 100%);
  padding: 52px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.panel-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='150' cy='150' r='120' stroke='%234b8aff' stroke-width='1' fill='none' opacity='0.12'/%3E%3Ccircle cx='150' cy='150' r='80' stroke='%234b8aff' stroke-width='1' fill='none' opacity='0.1'/%3E%3Ccircle cx='150' cy='150' r='40' stroke='%234b8aff' stroke-width='1' fill='none' opacity='0.08'/%3E%3C/svg%3E") no-repeat center center / 360px;
}

.brand { position: relative; z-index: 1; }
.brand-logo {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.brand-icon {
  width: 38px; height: 38px;
  background: #4b8aff;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(75,138,255,.5);
}
.brand-icon svg { width: 20px; height: 20px; fill: white; }
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
}
.brand-name span { color: #4b8aff; }
.brand-tagline {
  font-size: .82rem;
  color: #c9d7f5;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.panel-copy { position: relative; z-index: 1; }
.panel-copy h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
  margin-bottom: 14px;
}
.panel-copy h2 em {
  font-style: italic;
  color: #4b8aff;
}
.panel-copy p {
  font-size: .88rem;
  color: #c9d7f5;
  line-height: 1.65;
}

.panel-features {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 10px;
}
.feature-pill {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(75,138,255,.2);
  border-radius: 100px;
  width: fit-content;
  color: #c9d7f5;
  font-size: .8rem;
}
.feature-pill .dot {
  width: 7px; height: 7px;
  background: #4b8aff;
  border-radius: 50%;
  box-shadow: 0 0 8px #4b8aff;
}

/* Right panel */
.panel-right {
  flex: 1;
  background: #ffffff;
  padding: 52px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.panel-right::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, #2563eb22, transparent 70%);
  border-radius: 50%;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  background: #f0f4ff;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 34px;
  position: relative;
}
.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem;
  font-weight: 500;
  color: #6b83b0;
  cursor: pointer;
  transition: 0.35s cubic-bezier(.4,0,.2,1);
  position: relative; z-index: 1;
}
.tab-btn.active {
  color: #1d5fd1;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(29,95,209,.12);
}

/* Form */
.form-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.65rem;
  font-weight: 700;
  color: #0d1f3c;
  margin-bottom: 6px;
}
.form-subtitle {
  font-size: .85rem;
  color: #6b83b0;
  margin-bottom: 28px;
}

/* Input groups */
.input-group {
  margin-bottom: 18px;
  position: relative;
}
.input-group label {
  display: block;
  font-size: .78rem;
  font-weight: 500;
  color: #6b83b0;
  margin-bottom: 7px;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.input-wrap {
  position: relative;
  display: flex; align-items: center;
}
.input-wrap > svg {
  position: absolute;
  left: 14px;
  width: 17px; height: 17px;
  stroke: #6b83b0;
  stroke-width: 2;
  fill: none;
  pointer-events: none;
  transition: stroke 0.35s cubic-bezier(.4,0,.2,1);
}
.input-wrap input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #dde6f7;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  color: #0d1f3c;
  background: #f0f4ff;
  transition: 0.35s cubic-bezier(.4,0,.2,1);
  outline: none;
}
.input-wrap input::placeholder { color: #b0bfd8; }
.input-wrap input:focus {
  border-color: #1d5fd1;
  background: white;
  box-shadow: 0 0 0 4px rgba(29,95,209,.1);
}
.input-wrap:focus-within > svg { stroke: #1d5fd1; }

/* Eye toggle */
.eye-btn {
  position: absolute; right: 14px;
  background: none; border: none;
  cursor: pointer; padding: 0;
  display: flex; align-items: center;
}
.eye-btn svg { stroke: #6b83b0; }

/* Submit button */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1d5fd1 0%, #4b8aff 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: .02em;
  position: relative;
  overflow: hidden;
  transition: 0.35s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 6px 24px rgba(29,95,209,.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(.4,0,.2,1);
}
.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(29,95,209,.45);
}
.btn-submit:hover::after { opacity: 1; }
.btn-submit:active { transform: translateY(0); }
.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Divider */
.divider-or {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 20px 0;
}
.divider-or::before,
.divider-or::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dde6f7;
}
.divider-or span {
  font-size: .82rem;
  color: #6b83b0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .06em;
}

/* Google button */
.btn-google {
  width: 100%;
  padding: 12px;
  background: #ffffff;
  border: 1.5px solid #dde6f7;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  font-weight: 500;
  color: #0d1f3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.35s cubic-bezier(.4,0,.2,1);
}
.btn-google:hover {
  background: #f0f4ff;
  border-color: #1d5fd1;
  box-shadow: 0 2px 12px rgba(29,95,209,.1);
}

/* Redirect overlay */
.redirect-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
}
.redirect-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both;
}
.redirect-icon {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(29,95,209,.4);
}
.redirect-icon svg {
  width: 28px; height: 28px;
  fill: white;
}
.redirect-brand {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
}
.redirect-brand span { color: #4b8aff; }
.redirect-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(75,138,255,.2);
  border-top-color: #4b8aff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.redirect-text {
  font-family: 'DM Sans', sans-serif;
  font-size: .92rem;
  color: #c9d7f5;
  margin-top: 4px;
}

/* Overlay transition */
.overlay-fade-enter-active {
  transition: opacity .35s cubic-bezier(.4,0,.2,1);
}
.overlay-fade-leave-active {
  transition: opacity .3s cubic-bezier(.4,0,.2,1);
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 700px) {
  .panel-left { display: none; }
  .panel-right { padding: 40px 28px; }
  .wrapper { min-height: auto; }
}
</style>
