<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <div class="form-container">
        <img src="/favicon.ico" alt="Logo POSTEA" class="logo-login" />
        <div class="title">
          {{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="input-group" v-if="!isLogin">
            <label for="name">Nombre completo</label>
            <input id="name" v-model="name" type="text" required />
          </div>

          <div class="input-group">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="email" type="email" required />
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <input id="password" v-model="password" type="password" required />
          </div>

          <div class="input-group" v-if="!isLogin">
            <label for="confirmPassword">Confirmar contraseña</label>
            <input id="confirmPassword" v-model="confirmPassword" type="password" required />
          </div>

          <button class="sign" type="submit">
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

    <!-- ✅ Snackbar de éxito -->
    <v-snackbar
      v-model="showSuccess"
      location="bottom"
      color="green-darken-2"
      timeout="3000"
      rounded="pill"
    >
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { loginUser, registerUser } from '@/api/auth'
import { useAuthStore } from '@/stores/app'

const auth = useAuthStore()
const router = useRouter()
const isLogin = ref(true)

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// ✅ Snackbar
const showSuccess = ref(false)
const successMessage = ref('')

const toggleForm = () => {
  isLogin.value = !isLogin.value
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      const data = await loginUser(email.value, password.value)
      auth.login(data.token, data.user)
      router.push('/posts')
    } else {
      if (password.value !== confirmPassword.value) {
        alert('Las contraseñas no coinciden')
        return
      }

      const data = await registerUser(name.value, email.value, password.value)

      // ✅ Mostrar mensaje de éxito
      successMessage.value = '¡Usuario registrado con éxito!'
      showSuccess.value = true

      toggleForm()
    }
  } catch (err) {
    alert(err.message)
  }
}
</script>


<style scoped>
.logo-login {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #D5ECD4;
  object-fit: cover;
  margin: 0 auto 1.2rem auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.11);
}

.form-container {
  width: 100%;
  max-width: 420px;
  border-radius: 0.75rem;
  background-color: #D5ECD4;
  padding: 2rem;
  color: #6B6054;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 15px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #6B6054;
}

.form {
  margin-top: 1.5rem;
}

.input-group {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.input-group label {
  display: block;
  color: #6B6054;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #A1B0AB;
  outline: none;
  background-color: #C3DAC3;
  padding: 0.75rem 1rem;
  color: #2e2e2e;
  transition: border-color 0.2s ease;
}

.input-group input:focus {
  border-color: #929487;
}

.sign {
  margin-top: 1.5rem;
  display: block;
  width: 100%;
  background-color: #929487;
  padding: 0.75rem;
  text-align: center;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sign:hover {
  background-color: #6B6054;
}

.signup {
  text-align: center;
  font-size: 0.75rem;
  color: #6B6054;
  margin-top: 1.5rem;
}

.signup a {
  color: #6B6054;
  text-decoration: none;
  font-size: 14px;
}

.signup a:hover {
  text-decoration: underline;
  color: #929487;
}

/* ✅ Responsive */
@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }

  .title {
    font-size: 1.4rem;
  }

  .sign {
    padding: 0.6rem;
    font-size: 0.95rem;
  }

  .input-group input {
    padding: 0.6rem 0.9rem;
    font-size: 0.9rem;
  }
}
</style>

