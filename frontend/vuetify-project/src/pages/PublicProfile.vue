<template>
  <main class="page">
    <!-- BANNER -->
    <div class="profile-banner" :style="bannerStyle" />

    <!-- PROFILE CARD -->
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">
            {{ getInitials(user?.name) }}
            <img v-if="user?.profileImage" class="avatar-img" :src="user.profileImage" alt="" referrerpolicy="no-referrer" />
          </div>
        </div>
      </div>

      <div class="profile-info">
        <h1 class="profile-name">{{ user?.name || 'Usuario' }}</h1>

        <p v-if="user?.bio" class="profile-bio">{{ user.bio }}</p>
        <p v-else class="profile-bio no-bio">Sin biografia</p>

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

    <!-- POSTS SECTION -->
    <div class="feed-header">
      <span class="feed-title">Publicaciones de {{ user?.name }}</span>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular color="#1d5fd1" indeterminate size="44" />
    </div>

    <!-- EMPTY -->
    <div v-else-if="userPosts.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="56" height="56" stroke="#6b83b0" stroke-width="1.5" fill="none">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
      <p>No hay publicaciones aun</p>
    </div>

    <!-- FEED -->
    <div v-else>
      <div v-for="(post, index) in userPosts" :key="post._id" class="post-card" :style="{ animationDelay: `${index * 0.05}s` }">
        <div class="post-header-row">
          <div class="post-author" @click="goToPublicProfile(user?._id)">
            <div class="post-avatar" :style="avatarGradient(user?.name)">
              {{ getInitials(user?.name) }}
              <img v-if="user?.profileImage" class="avatar-img" :src="user.profileImage" alt="" referrerpolicy="no-referrer" />
            </div>
            <div class="post-author-info">
              <div class="post-author-name">{{ user?.name }}</div>
              <div class="post-meta">{{ formatDate(post.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="post-body">
          <p v-if="post.content" class="post-text">{{ post.content }}</p>
          <img v-if="post.fileUrl" class="post-image" :src="post.fileUrl" alt="post" />
        </div>

        <div class="post-actions">
          <button class="action-btn like-btn" :class="{ liked: isLikedByUser(post) }" @click="handleLike(post._id)">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="action-count">{{ post.likes?.length || 0 }}</span>
          </button>
          <button class="action-btn comment-btn" :class="{ open: visibleComments[post._id] }" @click="toggleComments(post._id)">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="action-count">{{ post.comments?.length || 0 }}</span>
          </button>
        </div>

        <!-- COMMENTS -->
        <v-expand-transition>
          <div v-if="visibleComments[post._id]" class="comments-section">
            <div v-if="post.comments?.length" class="comments-list">
              <div v-for="comment in post.comments" :key="comment._id" class="comment-item">
                <div class="comment-avatar" :style="avatarGradient(comment.author?.name)" @click="goToPublicProfile(comment.author?._id)">
                  {{ getInitials(comment.author?.name) }}
                  <img v-if="comment.author?.profileImage" class="avatar-img" :src="comment.author.profileImage" alt="" referrerpolicy="no-referrer" />
                </div>
                <div class="comment-bubble">
                  <div class="comment-bubble-header">
                    <span class="comment-name" @click="goToPublicProfile(comment.author?._id)">{{ comment.author?.name }}</span>
                    <button v-if="comment.author?._id === auth.userId" class="comment-delete" @click="removeComment(post._id, comment._id)">
                      <v-icon size="14">mdi-delete</v-icon>
                    </button>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                </div>
              </div>
            </div>
            <p v-else class="no-comments">No hay comentarios aun</p>

            <div class="comment-input-row">
              <div class="comment-input-avatar" :style="avatarGradient(auth.userName)">
                {{ getInitials(auth.userName) }}
                <img v-if="auth.userProfileImage" class="avatar-img" :src="auth.userProfileImage" alt="" referrerpolicy="no-referrer" />
              </div>
              <div class="comment-input-wrap">
                <input
                  v-model="post.newComment"
                  class="comment-input"
                  type="text"
                  placeholder="Escribe un comentario..."
                  @keydown.enter.prevent="submitComment(post._id, post.newComment)"
                />
                <button class="comment-send" :disabled="!post.newComment?.trim()" @click="submitComment(post._id, post.newComment)">
                  <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </div>

    <!-- SNACKBAR -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" rounded="pill" timeout="3000">
      <v-icon start>{{ snackbarIcon }}</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
  </main>
</template>

<script setup>
  import { onMounted, ref, computed, watch } from 'vue'
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

  const visibleComments = ref({})

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

  const bannerStyle = computed(() => {
    const bannerUrl = user.value?.bannerImage
    if (bannerUrl) {
      return { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    return {}
  })

  const totalLikes = computed(() => {
    return userPosts.value.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
  })

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('#1d5fd1')
  const snackbarIcon = ref('mdi-check-circle')

  const showNotification = (message, color = '#1d5fd1', icon = 'mdi-check-circle') => {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbarIcon.value = icon
    showSnackbar.value = true
  }

  const formatDate = dateStr => {
    if (!dateStr) return ''
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return 'ahora mismo'
    if (diffMin < 60) return `hace ${diffMin} min`
    if (diffH < 24) return `hace ${diffH}h`
    if (diffD < 7) return `hace ${diffD}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isLikedByUser = post => post.likes?.includes(auth.userId)

  const handleLike = async postId => {
    try {
      const result = await toggleLike(postId)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) post.likes = result.likes
    } catch {
      showNotification('Error al procesar like', 'error', 'mdi-alert-circle')
    }
  }

  const toggleComments = postId => {
    visibleComments.value[postId] = !visibleComments.value[postId]
  }

  const submitComment = async (postId, content) => {
    if (!content?.trim()) return
    try {
      const result = await createComment(postId, content)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) {
        if (!post.comments) post.comments = []
        post.comments.push(result.comment || result)
        post.newComment = ''
      }
    } catch {
      showNotification('Error al publicar comentario', 'error', 'mdi-alert-circle')
    }
  }

  const removeComment = async (postId, commentId) => {
    try {
      await deleteCommentApi(commentId)
      const post = userPosts.value.find(p => p._id === postId)
      if (post) post.comments = post.comments.filter(c => c._id !== commentId)
      showNotification('Comentario eliminado')
    } catch {
      showNotification('No se pudo eliminar el comentario', 'error', 'mdi-alert-circle')
    }
  }

  const goToPublicProfile = userId => {
    if (userId) router.push(`/user/${userId}`)
  }

  const loadProfile = async (userId) => {
    try {
      loading.value = true
      user.value = null
      userPosts.value = []
      visibleComments.value = {}
      user.value = await getPublicProfile(userId)
      userPosts.value = await getUserPosts(userId)
    } catch {
      showNotification('Error al cargar el perfil', 'error', 'mdi-alert-circle')
    } finally {
      loading.value = false
    }
  }

  watch(() => route.params.id, (newId) => {
    if (newId) loadProfile(newId)
  })

  onMounted(() => {
    loadProfile(route.params.id)
  })
</script>

<style scoped>
.page {
  max-width: 680px; margin: 0 auto;
  padding: 32px 16px 80px;
  font-family: 'DM Sans', sans-serif;
}

/* ── Banner ── */
.profile-banner {
  height: 220px;
  border-radius: 16px;
  position: relative;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(29,95,209,.25);
}

/* ── Profile card ── */
.profile-card {
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 16px;
  margin-top: -50px;
  padding: 0 24px 24px;
  box-shadow: 0 2px 16px rgba(10,22,40,.07);
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  position: relative;
}
.profile-avatar-wrap {
  margin-top: -55px;
}
.profile-avatar {
  width: 120px; height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 2rem; font-weight: 700;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(10,22,40,.15);
  position: relative;
}
.profile-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* ── Profile info ── */
.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0d1f3c;
  margin-top: 12px;
  margin-bottom: 8px;
}
.profile-bio {
  color: #2d4270;
  line-height: 1.65;
  font-size: .92rem;
  margin-bottom: 16px;
}
.profile-bio.no-bio {
  color: #6b83b0;
  font-style: italic;
}
.profile-stats {
  display: flex; gap: 2rem;
  padding-top: 16px;
  border-top: 1.5px solid #f0f4ff;
}
.stat-item { display: flex; flex-direction: column; }
.stat-number { font-size: 1.15rem; font-weight: 700; color: #0d1f3c; }
.stat-label { font-size: .75rem; color: #6b83b0; }

/* ── Feed header ── */
.feed-header {
  margin-bottom: 16px; padding: 0 2px;
}
.feed-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700;
  color: #0d1f3c;
}

/* ── States ── */
.loading-state {
  display: flex; justify-content: center; padding: 60px 0;
}
.empty-state {
  text-align: center; padding: 60px 20px;
  color: #6b83b0;
}
.empty-state p { margin-top: 16px; font-size: .9rem; }

/* ── Post card ── */
.post-card {
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(10,22,40,.07);
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.28s;
  animation: slideIn .4s cubic-bezier(.4,0,.2,1) both;
}
@keyframes slideIn {
  from { opacity:0; transform: translateY(14px); }
  to   { opacity:1; transform: translateY(0); }
}
.post-card:hover { box-shadow: 0 6px 28px rgba(10,22,40,.1); }

.post-header-row {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
}
.post-author { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.post-avatar {
  width: 40px; height: 40px;
  border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .85rem; font-weight: 700;
  color: white; overflow: hidden;
  position: relative;
}
.post-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.post-author-name {
  font-size: .9rem; font-weight: 600;
  color: #0d1f3c; line-height: 1.2;
}
.post-author:hover .post-author-name { color: #1d5fd1; }
.post-meta { font-size: .75rem; color: #6b83b0; }

.post-body { padding: 0 18px 14px; }
.post-text {
  font-size: .92rem; line-height: 1.7;
  color: #2d4270; white-space: pre-wrap;
  margin-bottom: 14px;
}
.post-image {
  width: 100%; max-height: 400px;
  object-fit: cover; border-radius: 10px;
  display: block;
}

/* ── Actions ── */
.post-actions {
  display: flex; align-items: center; gap: 4px;
  padding: 10px 18px 14px;
  border-top: 1px solid #f4f7fe;
}
.action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  border: none; border-radius: 100px;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: .83rem; font-weight: 500;
  color: #6b83b0; cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
}
.action-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 2; transition: 0.28s; }
.action-btn:hover { background: #f0f4ff; }
.action-count { font-variant-numeric: tabular-nums; }
.like-btn:hover { color: #e53e6a; background: #fff0f4; }
.like-btn.liked { color: #e53e6a; background: #fff0f4; }
.like-btn.liked svg { fill: #e53e6a; stroke: #e53e6a; }
.comment-btn:hover { color: #1d5fd1; background: rgba(29,95,209,.12); }
.comment-btn.open { color: #1d5fd1; background: rgba(29,95,209,.12); }

/* ── Comments ── */
.comments-section {
  border-top: 1.5px solid #f4f7fe;
  background: #f0f4ff;
}
.comments-list { padding: 14px 18px 0; }
.comment-item { display: flex; gap: 10px; margin-bottom: 14px; }
.comment-avatar {
  width: 32px; height: 32px;
  border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; color: white;
  cursor: pointer; overflow: hidden;
  position: relative;
}
.comment-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.comment-bubble {
  flex: 1;
  background: white;
  border: 1px solid #dde6f7;
  border-radius: 0 10px 10px 10px;
  padding: 10px 14px;
}
.comment-bubble-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 3px;
}
.comment-name { font-size: .8rem; font-weight: 600; color: #0d1f3c; cursor: pointer; }
.comment-name:hover { color: #1d5fd1; }
.comment-delete {
  background: none; border: none; cursor: pointer;
  opacity: 0.4; transition: opacity 0.2s;
  display: flex; align-items: center;
}
.comment-delete:hover { opacity: 1; color: #e53e6a; }
.comment-text { font-size: .83rem; color: #2d4270; line-height: 1.55; }
.comment-time { font-size: .72rem; color: #6b83b0; margin-top: 5px; }
.no-comments { text-align: center; padding: 16px; font-size: .85rem; color: #6b83b0; }

.comment-input-row {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px 14px;
}
.comment-input-avatar {
  width: 32px; height: 32px;
  border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; color: white;
  overflow: hidden;
  position: relative;
}
.comment-input-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.comment-input-wrap {
  flex: 1;
  display: flex; align-items: center;
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 100px;
  padding: 0 6px 0 14px;
  gap: 8px;
  transition: 0.28s;
}
.comment-input-wrap:focus-within {
  border-color: #1d5fd1;
  box-shadow: 0 0 0 3px rgba(29,95,209,.12);
}
.comment-input {
  flex: 1;
  border: none; outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: .85rem; color: #0d1f3c;
  background: transparent;
  padding: 9px 0;
}
.comment-input::placeholder { color: #b0bfd8; }
.comment-send {
  width: 28px; height: 28px;
  border: none; border-radius: 50%;
  background: #1d5fd1;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.28s; flex-shrink: 0;
}
.comment-send:hover:not(:disabled) { background: #4b8aff; transform: scale(1.05); }
.comment-send:disabled { opacity: 0.4; cursor: not-allowed; }
.comment-send svg { width: 13px; height: 13px; stroke: white; fill: none; stroke-width: 2.5; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .page { padding: 20px 10px 60px; }
  .profile-avatar { width: 100px; height: 100px; font-size: 1.5rem; }
  .profile-avatar-wrap { margin-top: -45px; }
}
</style>
