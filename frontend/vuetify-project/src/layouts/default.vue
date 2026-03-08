<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main style="background-color: #F3F2EF;">
      <router-view />
    </v-main>
    <AppFooter v-if="showNavbar" />
  </v-app>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppFooter from '@/components/AppFooter.vue'
  import Navbar from '@/components/Navbar.vue'
  import { useAuthStore } from '@/stores/authStore'

  const route = useRoute()
  const auth = useAuthStore()

  const showNavbar = computed(() => {
    const isLoginPage = route.path === '/Login'
    const isAuthenticated = auth.isLoggedIn
    return !isLoginPage || isAuthenticated
  })
</script>
