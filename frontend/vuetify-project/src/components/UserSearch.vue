<template>
  <div class="user-search">
    <div class="search-container">
      <v-text-field v-model="searchQuery" class="search-input" density="compact" hide-details
        placeholder="Buscar usuarios..." prepend-inner-icon="mdi-magnify" variant="outlined" @focus="showResults = true"
        @input="handleSearch" />

      <div v-if="showResults && searchResults.length > 0" class="search-results">
        <div v-for="user in searchResults" :key="user._id" class="search-result-item" @click="goToProfile(user._id)">
          <div class="search-avatar" :style="avatarGradient(user.name)">
            {{ getInitials(user.name) }}
            <img v-if="user.profileImage" class="avatar-img" :src="user.profileImage" alt="" referrerpolicy="no-referrer" />
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="showResults && searchQuery.length > 0 && !loading" class="search-results">
        <div class="no-results">No se encontraron usuarios</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchUsers } from '@/api/user'

const router = useRouter()

const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
const loading = ref(false)

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const gradients = [
  'linear-gradient(135deg,#6c63ff,#a78bfa)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#1d5fd1,#4b8aff)',
]

const avatarGradient = (name) => {
  if (!name) return { background: gradients[0] }
  const idx = name.charCodeAt(0) % gradients.length
  return { background: gradients[idx] }
}

let debounceTimeout = null

const handleSearch = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  if (searchQuery.value.trim().length === 0) {
    searchResults.value = []
    return
  }

  debounceTimeout = setTimeout(async () => {
    try {
      loading.value = true
      searchResults.value = await searchUsers(searchQuery.value)
    } catch (error) {
      console.error('Error searching users:', error)
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

const goToProfile = userId => {
  showResults.value = false
  searchQuery.value = ''
  searchResults.value = []
  router.push(`/user/${userId}`)
}

const handleClickOutside = event => {
  const container = document.querySelector('.user-search')
  if (container && !container.contains(event.target)) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-search {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-input {
  font-size: 0.85rem;
  width: 100%;
}

.search-input :deep(.v-field) {
  border-radius: 24px !important; /* Forma de píldora completa */
  background-color: #F3F2EF !important;
  padding-inline-start: 12px !important;
}

.search-input :deep(.v-field__outline) {
  --v-field-border-width: 1px;
  display: none; /* Opcional: oculta el borde exterior */
}

/* Aseguramos que el foco también mantenga la forma */
.search-input :deep(.v-field--focused) {
  background-color: #FFFFFF !important;
  box-shadow: 0 0 0 2px #0A66C2; /* Un borde sutil al escribir */
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  max-height: 300px;
  overflow-y: auto;
  z-index: 9999 !important;
  visibility: visible;
  margin-top: 4px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;
}

.search-result-item:hover {
  background-color: #F3F2EF;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.search-avatar {
  width: 40px; height: 40px;
  border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .82rem; font-weight: 700; color: white;
  overflow: hidden;
  position: relative;
}
.search-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}
</style>
