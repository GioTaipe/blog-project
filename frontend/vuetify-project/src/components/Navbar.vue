<template>
  <v-app-bar app class="custom-navbar" flat style="background-color: #FFFFFF;">
    <div class="navbar-content">
      <div class="logo" @click="$router.push('/Posts')">
        <span class="logo-text">BlogVibe</span>
      </div>

      <div v-if="isLoggedIn" class="search-wrapper">
        <UserSearch />
      </div>

      <div v-if="isLoggedIn" class="nav-links">
        <router-link class="nav-btn" to="/Posts">
          <v-icon size="20">mdi-home</v-icon>
          <span>INICIO</span>
        </router-link>

        <v-menu v-model="menuOpen" :close-on-content-click="false" offset-y>
          <template #activator="{ props }">
            <button v-bind="props" class="avatar-btn">
              <v-avatar size="36">
                <v-img :src="userProfileImage || defaultAvatar" />
              </v-avatar>
            </button>
          </template>

          <v-list class="dropdown-menu" min-width="200">
            <v-list-item class="user-info-item">
              <v-list-item-title class="user-name">{{ userName }}</v-list-item-title>
              <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item @click="goToProfile">
              <template #prepend>
                <v-icon size="20">mdi-account</v-icon>
              </template>
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <template #prepend>
                <v-icon size="20">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Salir</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div v-else class="nav-links">
        <router-link class="nav-btn" to="/Login">
          <v-icon size="20">mdi-login</v-icon>
          <span>INGRESAR</span>
        </router-link>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import UserSearch from './UserSearch.vue'

const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)
const defaultAvatar = '/avatars/avatar-default.png'

const isLoggedIn = computed(() => auth.isLoggedIn)
const userName = computed(() => auth.user?.name || '')
const userEmail = computed(() => auth.user?.email || '')
const userProfileImage = computed(() => auth.user?.profileImage || '')

const goToProfile = () => {
  menuOpen.value = false
  router.push('/Profile')
}

const logout = () => {
  menuOpen.value = false
  auth.logout()
}
</script>

<style scoped>
.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: auto;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0A66C2;
  letter-spacing: 0.5px;
}

.custom-navbar {
  background-color: #FFFFFF !important;
  height: 64px;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
}

/* Fuerza al navbar a permitir que el contenido "escape" hacia abajo */
.custom-navbar :deep(.v-toolbar__content) {
  overflow: visible !important;
  width: 100%;
}

.search-wrapper {
  flex: 0 1 400px;
  display: flex;
  justify-content: center;
  /* Aseguramos que el wrapper también permita ver lo que sale de él */
  position: relative; 
  overflow: visible !important;
}

.nav-links {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  padding-left: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: none;
  padding: 8px 12px;
  color: #666666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.nav-btn:hover,
.nav-btn:focus {
  background-color: rgba(10, 102, 194, 0.08);
  color: #0A66C2;
}

.nav-btn .v-icon {
  color: inherit;
}

.avatar-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-btn:hover {
  background-color: rgba(10, 102, 194, 0.08);
}

.dropdown-menu {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.user-info-item {
  padding: 12px 16px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .nav-btn span {
    display: none;
  }

  .search-wrapper {
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .search-wrapper {
    display: none;
  }
}
</style>
