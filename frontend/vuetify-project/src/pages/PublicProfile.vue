<template>
  <v-container class="custom-container">
    <div class="profile-banner" :style="bannerStyle" />

    <div class="profile-card">
      <div class="profile-header">
        <v-avatar class="profile-avatar" size="140">
          <v-img :src="user?.profileImage || defaultAvatar" />
        </v-avatar>
      </div>

      <div class="profile-info">
        <h1 class="profile-name">{{ user?.name || 'Usuario' }}</h1>

        <p v-if="user?.bio" class="profile-bio">{{ user.bio }}</p>
        <p v-else class="profile-bio">Sin biografía</p>

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
    </div>

    <div class="activity-section">
      <h3 class="activity-title">Publicaciones de {{ user?.name }}</h3>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular color="#0A66C2" indeterminate />
      </div>

      <div v-else-if="userPosts.length === 0" class="text-center py-8">
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
  </v-container>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getUserPosts, toggleLike } from '@/api/posts'
  import { createComment, deleteCommentApi } from '@/api/comments'
  import { getPublicProfile } from '@/api/user'
  import { useAuthStore } from '@/stores/authStore'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const user = ref(null)
  const userPosts = ref([])
  const loading = ref(true)
  const defaultAvatar = '/avatars/avatar-default.png'

  const visibleComments = ref({})
  const commenting = ref(false)

  const bannerStyle = computed(() => {
    const bannerUrl = user.value?.bannerImage
    if (bannerUrl) {
      return { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    return { backgroundColor: '#0A66C2' }
  })
  
  const totalLikes = computed(() => {
    return userPosts.value.reduce((sum, post) => {
      return sum + (post.likes?.length || 0)
    }, 0)
  })

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')
  const snackbarIcon = ref('mdi-check-circle')

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
    const userId = route.params.id

    try {
      loading.value = true
      user.value = await getPublicProfile(userId)
      userPosts.value = await getUserPosts(userId)
    } catch {
      showNotification('Error al cargar el perfil', 'error', 'mdi-alert-circle')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.custom-container {
  padding-top: 0;
  background-color: #F3F2EF;
  min-height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}

.profile-banner {
  height: 200px;
  background-color: #0A66C2;
  border-radius: 0 0 8px 8px;
}

.profile-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  margin-top: -80px;
  padding: 0 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.profile-header {
  display: flex;
  justify-content: center;
  position: relative;
}

.profile-avatar {
  border: 4px solid #FFFFFF;
  margin-top: -70px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: white;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
  text-align: center;
}

.profile-bio {
  color: #333;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #F0F0F0;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: #666666;
}

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

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}
</style>
