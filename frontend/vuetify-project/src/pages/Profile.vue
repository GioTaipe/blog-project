<template>
  <v-container class="custom-container">
    <div class="profile-banner" :style="bannerStyle">
      <div v-if="isOwner" class="banner-actions">
        <v-btn 
          class="banner-upload-btn" 
          icon 
          size="small"
          @click="triggerBannerUpload"
        >
          <v-icon size="20">mdi-camera</v-icon>
        </v-btn>
        <input
          ref="bannerInput"
          accept="image/*"
          style="display: none"
          type="file"
          @change="handleBannerChange"
        >
      </div>
    </div>

    <div class="profile-card">
      <div class="profile-header">
        <v-avatar class="profile-avatar" size="140">
          <v-img :src="user?.profileImage || defaultAvatar" />
        </v-avatar>
      </div>

      <div class="profile-info">
        <div class="profile-name-row">
          <h1 class="profile-name">{{ user?.name || 'Usuario' }}</h1>
          <v-btn v-if="isOwner" class="edit-btn" size="small" @click="openEditDialog">
            <v-icon size="16" start>mdi-pencil</v-icon>
            EDITAR
          </v-btn>
        </div>

        <div class="profile-contact">
          <v-icon color="#666666" size="18">mdi-email-outline</v-icon>
          <span>{{ user?.email }}</span>
        </div>

        <p v-if="user?.bio" class="profile-bio">{{ user.bio }}</p>

        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-number">{{ userPosts.length }}</span>
            <span class="stat-label">Publicaciones</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalLikes }}</span>
            <span class="stat-label">Likes recibidos</span>
          </div>
        </div>
      </div>

      <div class="profile-actions-mobile">
        <v-btn v-if="isOwner" class="edit-btn" @click="openEditDialog">
          <v-icon size="18" start>mdi-pencil</v-icon>
          EDITAR PERFIL
        </v-btn>
      </div>
    </div>

    <div class="activity-section">
      <h3 class="activity-title">Mis publicaciones</h3>

      <div v-if="userPosts.length === 0" class="text-center py-8">
        <v-icon color="#666666" size="48">mdi-post-outline</v-icon>
        <p>No hay publicaciones aún</p>
      </div>

      <div v-else>
        <div v-for="post in userPosts" :key="post._id" class="post-card">
            <div class="post-header d-flex align-center">
              <v-avatar class="mr-3" size="44">
                <v-img :src="user?.profileImage || defaultAvatar" />
              </v-avatar>

              <div class="post-header-info flex-grow-1">
                <span class="post-author-name">{{ user?.name }}</span>
                <span class="post-meta">{{ formatDate(post.createdAt) }}</span>
              </div>

              <v-menu v-if="user?._id === auth.userId">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    class="post-menu-btn"
                    icon
                    size="small"
                    variant="text"
                  >
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="confirmDelete(post._id)">
                    <template #prepend>
                      <v-icon color="error" size="small">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Eliminar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="post-body">
              <p class="post-content">{{ post.content }}</p>
            </div>

            <v-img v-if="post.fileUrl" class="post-media" cover :src="post.fileUrl" />

            <div class="post-counters">
              <span v-if="post.likes?.length">
                <v-icon color="#0A66C2" size="14">mdi-heart</v-icon>
                {{ post.likes.length }}
              </span>
              <span v-if="post.comments?.length" class="ml-3">
                {{ post.comments.length }} comentarios
              </span>
            </div>

            <div class="post-footer">
              <button class="action-btn" :class="{ 'active': isLikedByUser(post) }" @click="handleLike(post._id)">
                <v-icon size="18">{{ isLikedByUser(post) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                Me gusta
              </button>
              <button class="action-btn" @click="toggleComments(post._id)">
                <v-icon size="18">mdi-comment-outline</v-icon>
                Comentar
              </button>
            </div>

            <v-expand-transition>
              <div v-if="visibleComments[post._id]" class="comments-section">
                <v-textarea
                  v-model="post.newComment"
                  class="mt-2"
                  density="compact"
                  hide-details
                  label="Escribe un comentario..."
                  rows="2"
                  variant="outlined"
                />
                <v-btn
                  class="comment-btn mt-3"
                  :loading="commenting"
                  size="small"
                  @click="submitComment(post._id, post.newComment)"
                >
                  Comentar
                </v-btn>

                <v-list v-if="post.comments?.length" class="comments-list">
                  <v-list-item v-for="comment in post.comments" :key="comment._id" class="comment-item px-0">
                    <div class="d-flex align-start w-100">
                      <div class="comment-avatar" @click="goToPublicProfile(comment.author?._id)">
                        <v-avatar class="mr-2 mt-1" size="32">
                          <v-img :src="comment.author?.profileImage || '/avatars/avatar-default.png'" />
                        </v-avatar>
                      </div>

                      <div class="flex-grow-1">
                        <div class="comment-bubble">
                          <div class="d-flex justify-space-between align-center mb-1">
                            <span class="comment-name" @click="goToPublicProfile(comment.author?._id)">{{ comment.author?.name }}</span>
                            <v-icon
                              v-if="comment.author?._id === auth.userId"
                              class="delete-icon"
                              size="16"
                              @click="removeComment(post._id, comment._id)"
                            >
                              mdi-delete
                            </v-icon>
                          </div>
                          <p class="comment-content-text">{{ comment.content }}</p>
                        </div>
                        <span class="comment-date-sub">{{ formatDate(comment.createdAt) }}</span>
                      </div>
                    </div>
                  </v-list-item>
                </v-list>
                <p v-else class="no-comments mt-4">No hay comentarios aún</p>
              </div>
            </v-expand-transition>
          </div>
        </div>
      </div>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" rounded="pill" timeout="3000">
      <v-icon start>{{ snackbarIcon }}</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>

    <v-dialog v-model="editDialog" max-width="500">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">Editar perfil</v-card-title>
        <v-card-text class="text-center">
          <div class="profile-image-upload">
            <div class="image-container" @click="triggerImageUpload">
              <v-avatar size="120">
                <v-img :src="imagePreview || editForm.profileImage || defaultAvatar" />
              </v-avatar>
              <div class="camera-overlay">
                <v-icon color="white" size="32">mdi-camera</v-icon>
              </div>
            </div>
            <input
              ref="profileImageInput"
              accept="image/*"
              style="display: none"
              type="file"
              @change="handleImageChange"
            >
            <span class="change-photo-text" @click="triggerImageUpload">cambiar foto de perfil</span>
          </div>

          <v-text-field
            v-model="editForm.name"
            class="mt-4"
            density="comfortable"
            label="Nombre"
            variant="outlined"
          />
          <v-textarea
            v-model="editForm.bio"
            density="comfortable"
            label="Biografía"
            rows="3"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
          <v-btn class="save-btn" :loading="saving" @click="saveProfile">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">¿Eliminar publicación?</v-card-title>
        <v-card-text>¿Estás seguro de que quieres eliminar esta publicación?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deletePost">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { deletePostApi, getMyArticles, toggleLike } from '@/api/posts'
  import { createComment, deleteCommentApi } from '@/api/comments'
  import { getUserProfile, updateProfileImage, updateUser, updateBannerImage } from '@/api/user'
  import { useAuthStore } from '@/stores/authStore'

  const router = useRouter()
  const auth = useAuthStore()

  const user = ref(null)
  const userPosts = ref([])
  const defaultAvatar = '/avatars/avatar-default.png'

  const editDialog = ref(false)
  const deleteDialog = ref(false)
  const postToDelete = ref(null)
  const saving = ref(false)

  // Profile image upload
  const profileImageInput = ref(null)
  const newProfileImage = ref(null)
  const imagePreview = ref(null)

  // Banner image upload
  const bannerInput = ref(null)
  const newBannerImage = ref(null)
  const bannerPreview = ref(null)

  // Comments
  const visibleComments = ref({})
  const commenting = ref(false)

  const bannerStyle = computed(() => {
    const bannerUrl = user.value?.bannerImage || user.value?.banner || user.value?.bannerUrl || user.value?.bannerImageUrl
    if (bannerUrl) {
      return { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    return { backgroundColor: '#0A66C2' }
  })

  const isOwner = computed(() => user.value?._id === auth.userId)
  
  const totalLikes = computed(() => {
    return userPosts.value.reduce((sum, post) => {
      return sum + (post.likes?.length || 0)
    }, 0)
  })

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')
  const snackbarIcon = ref('mdi-check-circle')

  const editForm = ref({
    name: '',
    email: '',
    bio: '',
  })

  const showNotification = (message, color = 'success', icon = 'mdi-check-circle') => {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbarIcon.value = icon
    showSnackbar.value = true
  }

  const formatDate = dateStr => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const triggerBannerUpload = () => {
    bannerInput.value?.click()
  }

  const handleBannerChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const result = await updateBannerImage(file)
        user.value.bannerImage = result.bannerImage || result.user?.bannerImage
        bannerPreview.value = URL.createObjectURL(file)
        showNotification('Banner actualizado')
      } catch (error) {
        showNotification('Error al actualizar el banner', 'error', 'mdi-alert-circle')
      }
    }
  }

  const isLikedByUser = post => post.likes?.includes(auth.userId)

  const handleLike = async postId => {
    try {
      const result = await toggleLike(postId)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) {
        post.likes = result.likes
      }
    } catch {
      showNotification('Error al procesar like', 'error', 'mdi-alert-circle')
    }
  }

  const toggleComments = postId => {
    visibleComments.value[postId] = !visibleComments.value[postId]
  }

  const submitComment = async (postId, content) => {
    if (!content?.trim()) return
    commenting.value = true
    try {
      const result = await createComment(postId, content)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) {
        if (!post.comments) post.comments = []
        post.comments.push(result.comment || result)
      }
      post.newComment = ''
    } catch {
      showNotification('Error al publicar comentario', 'error', 'mdi-alert-circle')
    } finally {
      commenting.value = false
    }
  }

  const removeComment = async (postId, commentId) => {
    try {
      await deleteCommentApi(commentId)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) {
        post.comments = post.comments.filter(c => c._id !== commentId)
      }
      showNotification('Comentario eliminado')
    } catch {
      showNotification('No se pudo eliminar el comentario', 'error', 'mdi-alert-circle')
    }
  }

  const goToPublicProfile = userId => {
    router.push(`/profile/${userId}`)
  }

  onMounted(async () => {
    const isValid = await auth.validateToken()
    if (!isValid) {
      showNotification('Sesión expirada, por favor inicia sesión nuevamente', 'error', 'mdi-alert-circle')
      return
    }

    try {
      user.value = await getUserProfile()
      userPosts.value = await getMyArticles()
    } catch {
      showNotification('Error al cargar el perfil', 'error', 'mdi-alert-circle')
    }
  })

  const triggerImageUpload = () => {
    profileImageInput.value?.click()
  }

  const handleImageChange = event => {
    const file = event.target.files[0]
    if (file) {
      newProfileImage.value = file
      imagePreview.value = URL.createObjectURL(file)
    }
  }

  const saveProfile = async () => {
    try {
      saving.value = true

      // 1. Si hay nueva imagen, subirla
      if (newProfileImage.value) {
        const result = await updateProfileImage(newProfileImage.value)
        // Actualizamos el objeto local y el de la tienda
        const newUrl = result.user?.profileImage || result.profileImage
        user.value.profileImage = newUrl
        auth.user.profileImage = newUrl
      }

      // 2. Actualizar datos de texto
      const payload = {
        name: editForm.value.name,
        bio: editForm.value.bio,
      }
      await updateUser(payload)

      // Sincronizar estados
      user.value = { ...user.value, ...payload }
      auth.user.name = payload.name

      // Actualizar localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(auth.user))

      editDialog.value = false
      imagePreview.value = null
      showNotification('Perfil actualizado')
    } catch (error) {
      showNotification('Error al guardar: ' + error.message, 'error', 'mdi-alert-circle')
    } finally {
      saving.value = false
    }
  }

  const openEditDialog = () => {
    editForm.value = { ...user.value }
    newProfileImage.value = null
    imagePreview.value = null
    editDialog.value = true
  }

  const confirmDelete = id => {
    postToDelete.value = id
    deleteDialog.value = true
  }

  const deletePost = async () => {
    try {
      await deletePostApi(postToDelete.value)
      userPosts.value = userPosts.value.filter(p => p._id !== postToDelete.value)
      deleteDialog.value = false
      showNotification('Publicación eliminada')
    } catch {
      showNotification('Error al eliminar', 'error', 'mdi-alert-circle')
    }
  }
</script>

<style scoped>
.custom-container {
  padding-top: 0;
  background-color: #F3F2EF;
  min-height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}

/* Banner */
.profile-banner {
  height: 200px;
  border-radius: 0 0 8px 8px;
  position: relative;
  transition: background 0.3s ease;
  background-color: #0A66C2;
}

.banner-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  z-index: 100;
}

.banner-upload-btn {
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: #333 !important;
}

/* Profile Card */
.profile-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  margin-top: -55px;
  padding: 0 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.profile-avatar {
  border: 4px solid #FFFFFF;
  margin-top: -60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: white;
}

.profile-actions-desktop {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
}

.edit-btn {
  background-color: transparent !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  border-radius: 24px !important;
}

.profile-actions-desktop {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
}

.profile-actions-mobile {
  display: none;
}

.edit-btn {
  background-color: transparent !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  border-radius: 24px !important;
}

.settings-btn {
  color: #666666 !important;
}

.profile-name-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0.5rem;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
}

.profile-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.profile-bio {
  color: #333;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #F0F0F0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: #666666;
}

/* Tabs */
.profile-tabs {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  margin-bottom: 1.5rem;
}

.tab-item {
  flex: 1;
  padding: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.tab-item.active {
  color: #0A66C2;
  border-bottom-color: #0A66C2;
}

/* Post Card Corregida */
.post-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  margin-bottom: 1.5rem;
}

.post-header {
  padding: 1rem 1.25rem;
}

.post-header-info {
  display: flex;
  flex-direction: column;
}

.post-author-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.post-meta {
  font-size: 0.75rem;
  color: #666666;
}

.post-body {
  padding: 0 1.25rem 1rem 1.25rem;
}

.post-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

.post-media {
  width: 100%;
  max-height: 500px;
}

.post-counters {
  padding: 0.75rem 1.25rem;
  font-size: 0.8rem;
  color: #666666;
  border-top: 1px solid #F0F0F0;
}

.post-footer {
  display: flex;
  border-top: 1px solid #F0F0F0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666666;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.action-btn:hover {
  background-color: #F5F5F5;
}

.action-btn.active {
  color: #0A66C2;
}

.comments-section {
  padding: 1rem 1.25rem;
  background-color: #FAFAFA;
}

.comment-btn {
  background-color: #0A66C2 !important;
  color: white !important;
}

.comments-list {
  background: transparent !important;
}

.comment-item {
  background: transparent !important;
}

.comment-avatar {
  cursor: pointer;
}

.comment-avatar:hover {
  opacity: 0.8;
}

.comment-bubble {
  background-color: #F0F0F0;
  border-radius: 12px;
  padding: 8px 12px;
}

.comment-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
}

.comment-name:hover {
  color: #0A66C2;
}

.comment-content-text {
  font-size: 0.85rem;
  color: #333;
  margin: 0;
}

.comment-date-sub {
  font-size: 0.7rem;
  color: #999;
}

.delete-icon {
  cursor: pointer;
  color: #999;
}

.delete-icon:hover {
  color: #f44336;
}

.no-comments {
  color: #999;
  font-size: 0.85rem;
  text-align: center;
}

/* Modal Edit */
.image-container {
  position: relative;
  width: 120px;
  margin: 0 auto;
  cursor: pointer;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: 0.3s;
}

.image-container:hover .camera-overlay {
  opacity: 1;
}

.save-btn {
  background-color: #0A66C2 !important;
  color: white !important;
  border-radius: 20px !important;
}

@media (max-width: 600px) {
  .profile-actions-desktop { display: none; }
  .profile-actions-mobile { display: flex; justify-content: center; width: 100%; }
  .profile-header { flex-direction: column; align-items: center; }
  .profile-avatar { margin-top: -60px; }
}
</style>
