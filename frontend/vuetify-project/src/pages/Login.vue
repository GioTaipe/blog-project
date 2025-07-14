<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 justify-center">
            {{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <!-- Registro: nombre -->
              <v-text-field
                v-if="!isLogin"
                v-model="name"
                label="Nombre completo"
                required
              />

              <!-- Email -->
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                required
              />

              <!-- Contraseña -->
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
              />

              <!-- Confirmar contraseña (solo para registro) -->
              <v-text-field
                v-if="!isLogin"
                v-model="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                required
              />

              <v-btn type="submit" color="primary" block>
                {{ isLogin ? 'Entrar' : 'Registrarse' }}
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-btn text @click="toggleForm">
              {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
      const data= await loginUser(email.value, password.value)
      auth.login(data.token, data.user)
      router.push('/posts')
    } else {
      if (password.value !== confirmPassword.value) {
        alert('Las contraseñas no coinciden')
        return
      }

      const data = await registerUser(name.value, email.value, password.value)
      alert('Cuenta creada correctamente, ahora inicia sesión')
      toggleForm()
    }
  } catch (err) {
    alert(err.message)
  }
}
</script>
