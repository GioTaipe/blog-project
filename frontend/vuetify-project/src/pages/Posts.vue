<template>
  <v-container class="custom-container">
    <div class="feed-container">
      <div class="create-post-card">
        <div class="create-input-wrapper" @click="focusInput">
          <v-avatar class="mr-3" color="grey-lighten-2" size="40">
            <v-img v-if="auth.userProfileImage" alt="Profile" :src="auth.userProfileImage" />
            <v-img v-else alt="Default Profile" src="/avatars/avatar-default.png" />
          </v-avatar>
          <input
            ref="postInput"
            v-model="newPostData.content"
            class="create-input"
            :placeholder="`¿Qué estás pensando, ${auth.userName}?`"
            @focus="showActions = true"
          >
        </div>

        <v-expand-transition>
          <div v-if="showActions || newPostData.content" class="create-actions">
            <div class="action-buttons">
              <button class="action-btn" @click="triggerFileSelect">
                <v-icon color="#0A66C2" size="20">mdi-image-multiple</v-icon>
                <span>FOTO</span>
              </button>
            </div>
            <input
              ref="fileInput"
              accept="image/*,video/*"
              style="display: none"
              type="file"
              @change="handleFileChange"
            >
            <v-btn
              class="publish-btn"
              :disabled="!newPostData.content.trim() && !newPostData.file"
              :loading="publishing"
              @click="publishPost"
            >
              Publicar
            </v-btn>
          </div>
        </v-expand-transition>

        <div v-if="newPostData.fileName" class="file-selected">
          <v-icon class="mr-1" size="16">mdi-paperclip</v-icon>
          {{ newPostData.fileName }}
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular color="#0A66C2" indeterminate size="48" />
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-8">
        <v-icon color="#666666" size="64">mdi-post-outline</v-icon>
        <p class="empty-text mt-4">No hay publicaciones aún. ¡Sé el primero en publicar!</p>
      </div>

      <div v-else>
        <div v-for="post in posts" :key="post._id" class="post-card">
          <div class="post-header">
            <div class="author-avatar" @click="goToPublicProfile(post.authorId?._id)">
              <v-avatar class="mr-3" size="44">
                <v-img :src="post.authorId?.profileImage || '/avatars/avatar-default.png'" />
              </v-avatar>
            </div>
            <div class="post-header-info flex-grow-1">
              <span class="post-author-name" @click="goToPublicProfile(post.authorId?._id)">{{ post.authorId?.name }}</span>
              <span class="post-meta">{{ formatDate(post.createdAt) }}</span>
            </div>
            <v-menu v-if="post.authorId?._id === auth.userId">
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
                <v-list-item @click="confirmDeletePost(post._id)">
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
              <v-icon size="20">{{ isLikedByUser(post) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
              Me gusta
            </button>
            <button class="action-btn" @click="toggleComments(post._id)">
              <v-icon size="20">mdi-comment-outline</v-icon>
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

    <v-snackbar v-model="showError" color="error" rounded="pill">
      {{ errorMessage }}
    </v-snackbar>

    <v-snackbar v-model="showSuccess" color="success" rounded="pill">
      {{ successMessage }}
    </v-snackbar>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title>¿Eliminar publicación?</v-card-title>
        <v-card-text>Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" @click="deletePost">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore' // Cambiado a app según tu store anterior
  import { usePostStore } from '@/stores/postStore'

  const router = useRouter()
  const auth = useAuthStore()
  const postStore = usePostStore()

  // --- ESTADOS LOCALES DE UI ---
  const postInput = ref(null)
  const fileInput = ref(null)
  const showActions = ref(false)
  const visibleComments = ref({})

  // --- FEEDBACK Y DIÁLOGOS ---
  const showError = ref(false)
  const errorMessage = ref('')
  const showSuccess = ref(false)
  const successMessage = ref('')
  const deleting = ref(false)
  const commenting = ref(false)
  const showDeleteDialog = ref(false)
  const postToDelete = ref(null)

  // --- DATOS DEL FORMULARIO ---
  const newPostData = ref({
    content: '',
    file: null,
    fileName: '',
  })

  // --- COMPUTED ---
  const posts = computed(() => postStore.posts)
  const loading = computed(() => postStore.loading)
  const publishing = computed(() => postStore.publishing)

  // --- FUNCIONES ---

  const formatDate = dateString => {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  const goToPublicProfile = userId => {
    if (userId) {
      router.push(`/user/${userId}`)
    }
  }

  onMounted(async () => {
    try {
      await postStore.fetchPosts()
    } catch {
      errorMessage.value = 'Error al cargar las publicaciones'
      showError.value = true
    }
  })

  const focusInput = () => postInput.value?.focus()
  const triggerFileSelect = () => fileInput.value.click()

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      newPostData.value.file = file
      newPostData.value.fileName = file.name
    }
  }

  const publishPost = async () => {
    try {
      await postStore.createPostAction(newPostData.value.content, newPostData.value.file)
      newPostData.value = { content: '', file: null, fileName: '' }
      showActions.value = false
      successMessage.value = '¡Publicación compartida!'
      showSuccess.value = true
    } catch (error) {
      errorMessage.value = error.message || 'Error al publicar'
      showError.value = true
    }
  }

  const handleLike = async id => {
    try {
      await postStore.handleToggleLike(id)
    } catch (error) {
      console.error('Error en like:', error)
    }
  }

  const toggleComments = postId => {
    visibleComments.value[postId] = !visibleComments.value[postId]
  }

  const confirmDeletePost = id => {
    postToDelete.value = id
    showDeleteDialog.value = true
  }

  const deletePost = async () => {
    deleting.value = true
    try {
      await postStore.deletePost(postToDelete.value)
      showDeleteDialog.value = false
      successMessage.value = 'Post eliminado correctamente'
      showSuccess.value = true
    } catch {
      errorMessage.value = 'No se pudo eliminar el post'
      showError.value = true
    } finally {
      deleting.value = false
    }
  }

  const submitComment = async (postId, content) => {
    if (!content?.trim()) return
    commenting.value = true
    try {
      await postStore.addComment(postId, content)
      successMessage.value = 'Comentario añadido'
      showSuccess.value = true
    } catch {
      errorMessage.value = 'Error al publicar comentario'
      showError.value = true
    } finally {
      commenting.value = false
    }
  }

  const removeComment = async (postId, commentId) => {
    try {
      await postStore.removeComment(postId, commentId)
      successMessage.value = 'Comentario eliminado'
      showSuccess.value = true
    } catch {
      errorMessage.value = 'No se pudo eliminar el comentario'
      showError.value = true
    }
  }

  const isLikedByUser = post => post.likes?.includes(auth.userId)
</script>

<style scoped>
.custom-container {
  padding-top: 32px;
  background-color: #F3F2EF;
  min-height: 100vh;
}

.feed-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Create Post Card */
.create-post-card {
  width: 100%;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
}

.create-input-wrapper {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.create-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
}

.create-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid #F0F0F0;
  background-color: #FAFAFA;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  font-size: 0.75rem;
  font-weight: 600;
}

.publish-btn {
  background-color: #0A66C2 !important;
  color: #FFFFFF !important;
  text-transform: none;
  border-radius: 24px !important;
}

/* Post Card */
.post-card {
  margin-bottom: 2rem;
  border-radius: 8px;
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
}

.author-avatar {
  cursor: pointer;
  transition: opacity 0.2s;
}

.author-avatar:hover {
  opacity: 0.8;
}

.post-author-name {
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s;
}

.post-author-name:hover {
  color: #0A66C2;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
}

.post-author-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.post-meta {
  font-size: 0.75rem;
  color: #666666;
  display: block;
}

.post-body {
  padding: 0 1.25rem 1rem 1.25rem;
}

.post-content {
  line-height: 1.5;
  white-space: pre-wrap;
}

.post-counters {
  padding: 0.5rem 1.25rem;
  font-size: 0.8rem;
  color: #666666;
  border-bottom: 1px solid #F0F0F0;
}

.post-footer {
  display: flex;
  justify-content: space-around;
  padding: 0.25rem 0;
}

/* --- ESTILO DE BURBUJA DE COMENTARIOS --- */
.comments-section {
  padding: 1rem 1.25rem;
  background-color: #FAFAFA;
  border-top: 1px solid #F0F0F0;
}

.comment-bubble {
  background-color: #F2F2F2;
  border-radius: 0 12px 12px 12px;
  padding: 8px 12px;
  display: inline-block;
  max-width: 95%;
}

.comment-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: #000000;
  margin-right: 12px;
}

.comment-content-text {
  font-size: 0.9rem;
  color: #333333;
  margin: 0;
  line-height: 1.4;
}

.comment-date-sub {
  display: block;
  font-size: 0.7rem;
  color: #666666;
  margin-top: 4px;
  margin-left: 8px;
}

.comment-avatar {
  cursor: pointer;
  transition: opacity 0.2s;
}

.comment-avatar:hover {
  opacity: 0.8;
}

.comment-name {
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}

.comment-name:hover {
  color: #0A66C2;
}

.delete-icon {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-icon:hover {
  opacity: 1;
  color: #F44336 !important;
}

.no-comments {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
}
</style>
