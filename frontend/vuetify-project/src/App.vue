<template>
  <v-app>
    <Navbar v-if="isLoggedIn" />
    <router-view />
  </v-app>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import Navbar from '@/components/Navbar.vue'
  import { useAuthStore } from '@/stores/authStore'

  const auth = useAuthStore()
  const { isLoggedIn } = storeToRefs(auth)
</script>
