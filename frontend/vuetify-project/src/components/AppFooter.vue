<template>
  <v-footer app class="footer" height="40">
    <div class="footer-content">
      <span class="text-caption">&copy; {{ new Date().getFullYear() }} BlogVibe</span>
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
  background-color: rgba(255,255,255,.92) !important;
  backdrop-filter: blur(18px);
  padding: 1rem;
  border-top: 1px solid #dde6f7;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #6b83b0;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
