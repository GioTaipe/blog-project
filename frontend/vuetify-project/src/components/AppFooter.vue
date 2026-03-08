<template>
  <v-footer app class="footer" height="40">
    <div class="footer-content">
      <span class="text-caption">&copy; {{ new Date().getFullYear() }} Mi Blog</span>
      <v-btn :href="'https://github.com/GioTaipe'" icon size="35" target="_blank">
        <v-icon size="18">mdi-github</v-icon>
      </v-btn>
      <v-btn :href="'https://imgeovannydev.vercel.app/'" icon size="35" target="_blank">
        <v-icon size="18">mdi-web</v-icon>
      </v-btn>
      <v-btn :href="'https://www.linkedin.com/in/geovanny-tipan-taipe-47a2371a1/'" icon size="35" target="_blank">
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
  background-color: #FFFFFF;
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #666666;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
