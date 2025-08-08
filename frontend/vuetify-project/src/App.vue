<template>
  <v-app>
    <Navbar v-if="isLoggedIn" />
    <router-view />
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/app'

const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth) 
</script>

