<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-title class="text-h6">POSTEA</v-app-bar-title>

    <v-spacer />

    <v-btn text to="/Posts">Posts</v-btn>
    <v-btn text to="/Profile">Profile</v-btn>
    <v-btn text @click="logout">Logout</v-btn>
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
