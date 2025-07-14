<template>
  <v-footer
    app
    height="40"
  >
    <span class="text-caption">&copy; {{ new Date().getFullYear() }} Mi Blog</span>

    <div class="d-flex justify-end">
      <v-btn icon size="40" :href="'https://github.com/GioTaipe'" target="_blank">
        <v-icon size="18">mdi-github</v-icon>
      </v-btn>
      <v-btn icon size="40" :href="'https://www.linkedin.com/in/geovanny-tipan-taipe-47a2371a1/'" target="_blank">
        <v-icon size="18">mdi-linkedin</v-icon>
      </v-btn>
    </div>
  </v-footer>
</template>

<script setup>
  
</script>

<style scoped>
  
</style>
