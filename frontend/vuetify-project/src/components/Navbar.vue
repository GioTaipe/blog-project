<template>
  <v-app-bar app flat class="custom-navbar">
    <v-app-bar-title class="navbar-title">POSTEA</v-app-bar-title>
    <v-spacer />
    <div class="nav-links">
      <router-link to="/Posts" class="nav-btn">Posts</router-link>
      <router-link to="/Profile" class="nav-btn">Perfil</router-link>
      <button class="nav-btn" @click="logout">Salir</button>
    </div>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/app'

const router = useRouter()
const auth = useAuthStore()

const logout = () => {
  auth.logout()
  localStorage.removeItem('token')
  router.push('/Login')
}
</script>

<style>
.navbar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  color: #f9fafb;
  letter-spacing: 4px;
  margin: 0;
  white-space: nowrap;
}

.custom-navbar {
  background-color: #1f2937;
  height: 56px;
  padding: 0 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-btn {
  background-color: transparent;
  border: none;
  padding: 10px 12px;
  color: #f9fafb;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-btn:hover,
.nav-btn:focus {
  background-color: #21262c;
}

@media (max-width: 600px) {
  .nav-links {
    justify-content: flex-end;
    gap: 8px;
  }

  .nav-btn {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}
</style>
