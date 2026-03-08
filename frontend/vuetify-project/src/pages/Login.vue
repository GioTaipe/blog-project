<template>
  <v-container class="fill-height login-bg" fluid>
    <v-row align="center" justify="center">
      <div class="form-container">
        <img alt="Logo POSTEA" class="logo-login" src="/favicon.ico">
        <div class="title">
          {{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <v-expand-transition>
            <div v-if="!isLogin" class="input-group">
              <label for="name">Nombre completo</label>
              <input id="name" v-model="name" required type="text">
            </div>
          </v-expand-transition>

          <div class="input-group">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="email" required type="email">
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <input id="password" v-model="password" required type="password">
          </div>

          <v-expand-transition>
            <div v-if="!isLogin" class="input-group">
              <label for="confirmPassword">Confirmar contraseña</label>
              <input id="confirmPassword" v-model="confirmPassword" required type="password">
            </div>
          </v-expand-transition>

          <button class="sign" :disabled="loading" type="submit">
            <v-progress-circular
              v-if="loading"
              class="mr-2"
              indeterminate
              size="20"
              width="2"
            />
            {{ isLogin ? 'Entrar' : 'Registrarse' }}
          </button>
        </form>

        <p class="signup">
          <a href="#" @click.prevent="toggleForm">
            {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
          </a>
        </p>
      </div>
    </v-row>

    <v-snackbar
      v-model="showSuccess"
      color="#0A66C2"
      location="bottom"
      rounded="pill"
      timeout="3000"
    >
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar
      v-model="showError"
      color="error"
      location="bottom"
      rounded="pill"
      timeout="4000"
    >
      <v-icon start>mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { loginUser, registerUser } from '@/api/auth'
  import { useAuthStore } from '@/stores/authStore'

  // --- ESTADOS ---
  const authStore = useAuthStore()
  const router = useRouter()

  const isLogin = ref(true)
  const loading = ref(false)

  // Campos del formulario
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')

  // Feedback UI
  const showSuccess = ref(false)
  const showError = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')

  // --- MÉTODOS ---

  const toggleForm = () => {
    isLogin.value = !isLogin.value
    errorMessage.value = ''
  }

  const handleSubmit = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      if (isLogin.value) {
        // LÓGICA DE LOGIN
        const data = await loginUser(email.value, password.value)

        // Guardamos Token y Usuario en Pinia (y LocalStorage via action)
        authStore.login(data.token, data.user)
        console.log(data.user)

        successMessage.value = `¡Bienvenido de nuevo, ${data.user.name}!`
        showSuccess.value = true

        // Pequeña pausa para que el usuario vea el éxito antes de redirigir
        setTimeout(() => router.push('/posts'), 1000)
      } else {
        // LÓGICA DE REGISTRO
        if (password.value !== confirmPassword.value) {
          throw new Error('Las contraseñas no coinciden')
        }

        await registerUser(name.value, email.value, password.value)

        successMessage.value = 'Registro exitoso. Ya puedes iniciar sesión.'
        showSuccess.value = true
        isLogin.value = true // Cambiamos a vista login
        password.value = ''
        confirmPassword.value = ''
      }
    } catch (error) {
      // Axios interceptor ya nos da el mensaje limpio en err.message
      errorMessage.value = error.message
      showError.value = true
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
/* (Mantenemos tus estilos que son excelentes) */
.login-bg {
  background-color: #F3F2EF;
}

.logo-login {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #F3F2EF;
  object-fit: cover;
  margin: 0 auto 1.2rem auto;
  display: block;
  box-shadow: 0 0 0 3px #0A66C2;
}

.form-container {
  width: 100%;
  max-width: 420px;
  border-radius: 0.75rem;
  background-color: #FFFFFF;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
}

.form {
  margin-top: 1.5rem;
}

.input-group {
  margin-top: 0.75rem;
}

.input-group label {
  display: block;
  color: #666666;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.input-group input {
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #E0E0E0;
  padding: 0.75rem 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #0A66C2;
}

.sign {
  margin-top: 1.5rem;
  width: 100%;
  background-color: #0A66C2;
  padding: 0.75rem;
  color: #FFFFFF;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
}

.sign:disabled {
  background-color: #8EBBDF;
  cursor: not-allowed;
}

.signup {
  text-align: center;
  margin-top: 1.5rem;
}

.signup a {
  color: #0A66C2;
  text-decoration: none;
  font-weight: 600;
}
</style>
