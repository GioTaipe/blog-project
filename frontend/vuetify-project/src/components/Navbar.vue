<template>
  <nav class="navbar">
    <div class="nav-inner">

      <a class="nav-brand" href="#" @click.prevent="$router.push('/Posts')">
        <div class="nav-brand-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
        </div>
        <span class="nav-brand-name">Blog<span>Vibe</span></span>
      </a>

      <div v-if="isLoggedIn" class="nav-center">
        <div class="search-wrapper">
          <UserSearch />
        </div>
      </div>

      <div v-if="isLoggedIn" class="nav-right">
        <router-link class="nav-btn nav-btn-active" to="/Posts">
          <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
          <span>Inicio</span>
        </router-link>

        <v-menu v-model="menuOpen" :close-on-content-click="false" offset-y>
          <template #activator="{ props }">
            <button v-bind="props" class="nav-profile">
              <div class="nav-avatar">
                {{ userInitials }}
                <img v-if="userProfileImage" class="avatar-img" :src="userProfileImage" alt="" referrerpolicy="no-referrer" />
              </div>
              <span class="nav-profile-name">{{ userName }}</span>
              <svg class="nav-profile-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </template>

          <v-list class="dropdown-menu" min-width="200">
            <v-list-item class="user-info-item">
              <v-list-item-title class="user-name-text">{{ userName }}</v-list-item-title>
              <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item @click="goToProfile">
              <template #prepend>
                <v-icon size="18">mdi-account</v-icon>
              </template>
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="goToEditProfile">
              <template #prepend>
                <v-icon size="18">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Editar perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <template #prepend>
                <v-icon size="18">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Salir</v-list-item-title>
            </v-list-item>
            <v-list-item @click="goToDeleteAccount">
              <template #prepend>
                <v-icon size="18" color="#e53e6a">mdi-delete</v-icon>
              </template>
              <v-list-item-title class="delete-text">Eliminar cuenta</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div v-else class="nav-right">
        <router-link class="nav-btn nav-btn-ghost" to="/Login">
          <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Ingresar</span>
        </router-link>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import UserSearch from './UserSearch.vue'

const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)
const settingsOpen = ref(false)

const isLoggedIn = computed(() => auth.isLoggedIn)
const userName = computed(() => auth.user?.name || '')
const userEmail = computed(() => auth.user?.email || '')
const userProfileImage = computed(() => auth.user?.profileImage || '')
const userInitials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const goToProfile = () => {
  menuOpen.value = false
  router.push('/Profile')
}

const goToEditProfile = () => {
  settingsOpen.value = false
  router.push('/Profile?action=edit')
}

const goToDeleteAccount = () => {
  settingsOpen.value = false
  router.push('/Profile?action=delete')
}

const logout = () => {
  menuOpen.value = false
  auth.logout()
}
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 1px 0 #dde6f7, 0 4px 24px rgba(10,22,40,.06);
  height: 62px;
  display: flex; align-items: center;
}
.nav-inner {
  width: 100%; padding: 0 24px;
  display: flex; align-items: center;
  gap: 16px;
}

/* Brand */
.nav-brand {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none; flex-shrink: 0;
  margin-right: auto;
}
.nav-brand-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(29,95,209,.3);
}
.nav-brand-icon svg { width: 17px; height: 17px; fill: white; }
.nav-brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem; font-weight: 900;
  color: #0d1f3c; letter-spacing: -.4px;
}
.nav-brand-name span { color: #1d5fd1; }

/* Center */
.nav-center {
  flex: 0 1 400px;
  display: flex; justify-content: center;
}
.search-wrapper {
  width: 100%;
  position: relative;
  overflow: visible !important;
}

/* Nav buttons */
.nav-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  border: none; border-radius: 100px;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem; font-weight: 500;
  cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
  text-decoration: none;
}
.nav-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 2; }
.nav-btn-ghost {
  background: transparent; color: #6b83b0;
}
.nav-btn-ghost:hover {
  background: #f0f4ff; color: #1d5fd1;
}
.nav-btn-active {
  background: rgba(29,95,209,.12); color: #1d5fd1;
}
.nav-btn-icon {
  width: 36px; height: 36px;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #6b83b0;
  cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
}
.nav-btn-icon:hover {
  background: #f0f4ff; color: #1d5fd1;
}
.nav-btn-icon svg {
  width: 19px; height: 19px;
  stroke: currentColor; fill: none; stroke-width: 2;
}
.delete-text { color: #e53e6a; }

/* Right */
.nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: auto; }

/* Profile pill */
.nav-profile {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 12px 5px 5px;
  border: 1.5px solid #dde6f7;
  border-radius: 100px;
  background: white;
  cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
}
.nav-profile:hover { border-color: #1d5fd1; box-shadow: 0 0 0 3px rgba(29,95,209,.12); }
.nav-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: .75rem; font-weight: 600;
  overflow: hidden; flex-shrink: 0;
  position: relative;
}
.nav-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.nav-profile-name { font-size: .85rem; font-weight: 500; color: #0d1f3c; }
.nav-profile-chevron { width: 14px; height: 14px; stroke: #6b83b0; fill: none; stroke-width: 2.5; }

/* Dropdown */
.dropdown-menu {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(10,22,40,.12) !important;
}
.user-info-item { padding: 12px 16px; }
.user-name-text { font-weight: 600; color: #0d1f3c; }

@media (max-width: 768px) {
  .nav-btn span { display: none; }
  .nav-profile-name { display: none; }
  .nav-center { max-width: 240px; }
}
@media (max-width: 600px) {
  .nav-center { display: none; }
}
</style>
