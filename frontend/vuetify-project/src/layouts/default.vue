<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main :style="{ backgroundColor: isLoginPage ? '#0a1628' : '#f4f7fe' }">
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

  const isLoginPage = computed(() => route.path === '/Login')

  const showNavbar = computed(() => {
    return !isLoginPage.value || auth.isLoggedIn
  })
</script>
