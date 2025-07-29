<template>
  <v-footer app height="40" class="footer">
    <div class="footer-content">
      <span class="text-caption">&copy; {{ new Date().getFullYear() }} Mi Blog</span>
      <v-btn icon size="35" :href="'https://github.com/GioTaipe'" target="_blank">
        <v-icon size="18">mdi-github</v-icon>
      </v-btn>
      <v-btn icon size="35" :href="'https://imgeovannydev.vercel.app/'" target="_blank">
        <v-icon size="18">mdi-web</v-icon>
      </v-btn>
      <v-btn icon size="35" :href="'https://www.linkedin.com/in/geovanny-tipan-taipe-47a2371a1/'" target="_blank">
        <v-icon size="18">mdi-linkedin</v-icon>
      </v-btn>
    </div>
  </v-footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #A1B0AB; /* tono intermedio suave */
  padding: 1rem;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #6B6054; /* tono fuerte del texto */
  font-size: 0.85rem;
  font-weight: 500;
}
</style>

