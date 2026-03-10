<template>
  <main class="page">
    <!-- COMPOSER -->
    <div class="composer" :class="{ focused: composerFocused }">
      <div class="composer-header">
        <div class="composer-avatar">
          {{ userInitials }}
          <img v-if="auth.userProfileImage" class="avatar-img" :src="auth.userProfileImage" alt="" referrerpolicy="no-referrer" />
        </div>
        <textarea
          ref="postInput"
          v-model="newPostData.content"
          class="composer-textarea"
          :placeholder="`Que tienes en mente hoy, ${auth.userName}?`"
          rows="3"
          @blur="composerFocused = false"
          @focus="composerFocused = true"
        ></textarea>
      </div>

      <div v-if="imagePreview" class="composer-img-preview">
        <img :src="imagePreview" alt="preview" />
        <button class="composer-img-remove" title="Quitar imagen" @click="removeImage">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="composer-footer">
        <div class="composer-tools">
          <button class="composer-tool" title="Imagen" @click="triggerFileSelect">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
        </div>
        <input
          ref="fileInput"
          accept="image/*"
          style="display: none"
          type="file"
          @change="handleFileChange"
        >
        <button
          class="btn-publish"
          :disabled="(!newPostData.content.trim() && !newPostData.file) || publishing"
          @click="publishPost"
        >
          <v-progress-circular v-if="publishing" color="white" indeterminate size="14" width="2" />
          <svg v-else viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Publicar
        </button>
      </div>
    </div>

    <!-- FEED HEADER -->
    <div class="feed-header">
      <span class="feed-title">Publicaciones recientes</span>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular color="#1d5fd1" indeterminate size="44" />
    </div>

    <!-- EMPTY -->
    <div v-else-if="posts.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="56" height="56" stroke="#6b83b0" stroke-width="1.5" fill="none">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
      <p>No hay publicaciones aun. Se el primero en publicar!</p>
    </div>

    <!-- FEED -->
    <div v-else>
      <div v-for="(post, index) in posts" :key="post._id" class="post-card" :style="{ animationDelay: `${index * 0.05}s` }" >
        <div class="post-header">
          <div class="post-author" @click="goToPublicProfile(post.authorId?._id)">
            <div class="post-avatar" :style="avatarGradient(post.authorId?.name)">
              {{ getInitials(post.authorId?.name) }}
              <img v-if="post.authorId?.profileImage" class="avatar-img" :src="post.authorId.profileImage" alt="" referrerpolicy="no-referrer" />
            </div>
            <div class="post-author-info">
              <div class="post-author-name">{{ post.authorId?.name }}</div>
              <div class="post-meta">
                <span>{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>
          </div>
          <v-menu v-if="post.authorId?._id === auth.userId">
            <template #activator="{ props }">
              <button v-bind="props" class="post-more">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </template>
            <v-list density="compact" class="dropdown-menu">
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
          <p v-if="post.content" class="post-text">{{ post.content }}</p>
          <img v-if="post.fileUrl" class="post-image" :src="post.fileUrl" alt="post image" />
        </div>

        <div class="post-actions">
          <button
            class="action-btn like-btn"
            :class="{ liked: isLikedByUser(post) }"
            @click="handleLike(post._id)"
          >
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="action-count">{{ post.likes?.length || 0 }}</span>
          </button>
          <button
            class="action-btn comment-btn"
            :class="{ open: visibleComments[post._id] }"
            @click="toggleComments(post._id)"
          >
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
                    <button
                      v-if="comment.author?._id === auth.userId"
                      class="comment-delete"
                      @click="removeComment(post._id, comment._id)"
                    >
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
              <div class="comment-input-avatar">
                {{ userInitials }}
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

      <!-- LOAD MORE -->
      <div class="load-more-container">
        <button v-if="hasMore" class="btn-load-more" :disabled="loadingMore" @click="loadMore">
          <v-progress-circular v-if="loadingMore" indeterminate size="16" width="2" color="#1d5fd1" class="mr-2" />
          {{ loadingMore ? 'Cargando...' : 'Ver mas publicaciones' }}
        </button>
        <p v-else class="up-to-date">Ya estas al dia</p>
      </div>
    </div>

    <!-- SNACKBARS -->
    <v-snackbar v-model="showError" color="error" rounded="pill" timeout="3000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
    <v-snackbar v-model="showSuccess" color="#1d5fd1" rounded="pill" timeout="3000">
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="showDeleteDialog" max-width="420">
      <v-card class="delete-dialog">
        <v-card-title class="dialog-title">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Eliminar publicacion?
        </v-card-title>
        <v-card-text>Esta accion no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" variant="elevated" @click="deletePost">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { usePostStore } from '@/stores/postStore'

  const router = useRouter()
  const auth = useAuthStore()
  const postStore = usePostStore()

  const postInput = ref(null)
  const fileInput = ref(null)
  const composerFocused = ref(false)
  const visibleComments = ref({})
  const imagePreview = ref(null)

  const showError = ref(false)
  const errorMessage = ref('')
  const showSuccess = ref(false)
  const successMessage = ref('')
  const deleting = ref(false)
  const showDeleteDialog = ref(false)
  const postToDelete = ref(null)

  const newPostData = ref({ content: '', file: null, fileName: '' })

  const posts = computed(() => postStore.posts)
  const loading = computed(() => postStore.loading)
  const publishing = computed(() => postStore.publishing)
  const hasMore = computed(() => postStore.hasMore)
  const loadingMore = computed(() => postStore.loadingMore)

  const userInitials = computed(() => {
    const name = auth.user?.name || ''
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  })

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

  const formatDate = dateString => {
    if (!dateString) return ''
    const now = new Date()
    const date = new Date(dateString)
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

  const goToPublicProfile = userId => {
    if (userId) router.push(`/user/${userId}`)
  }

  onMounted(async () => {
    try {
      await postStore.fetchPosts()
    } catch {
      errorMessage.value = 'Error al cargar las publicaciones'
      showError.value = true
    }
  })

  const triggerFileSelect = () => fileInput.value.click()

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      newPostData.value.file = file
      newPostData.value.fileName = file.name
      imagePreview.value = URL.createObjectURL(file)
    }
  }

  const removeImage = () => {
    newPostData.value.file = null
    newPostData.value.fileName = ''
    imagePreview.value = null
    if (fileInput.value) fileInput.value.value = ''
  }

  const publishPost = async () => {
    try {
      await postStore.createPostAction(newPostData.value.content, newPostData.value.file)
      newPostData.value = { content: '', file: null, fileName: '' }
      imagePreview.value = null
      successMessage.value = 'Publicacion compartida!'
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
      successMessage.value = 'Post eliminado'
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
    try {
      await postStore.addComment(postId, content)
    } catch {
      errorMessage.value = 'Error al publicar comentario'
      showError.value = true
    }
  }

  const removeComment = async (postId, commentId) => {
    try {
      await postStore.removeComment(postId, commentId)
    } catch {
      errorMessage.value = 'No se pudo eliminar el comentario'
      showError.value = true
    }
  }

  const isLikedByUser = post => post.likes?.includes(auth.userId)

  const loadMore = async () => {
    try {
      await postStore.loadMorePosts()
    } catch {
      errorMessage.value = 'Error al cargar mas publicaciones'
      showError.value = true
    }
  }
</script>

<style scoped>
.page {
  max-width: 680px; margin: 0 auto;
  padding: 32px 16px 80px;
  font-family: 'DM Sans', sans-serif;
}

/* ── Composer ── */
.composer {
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(10,22,40,.07);
  overflow: hidden;
  margin-bottom: 24px;
  transition: box-shadow 0.28s cubic-bezier(.4,0,.2,1), border-color 0.28s cubic-bezier(.4,0,.2,1);
}
.composer.focused {
  border-color: #1d5fd1;
  box-shadow: 0 0 0 4px rgba(29,95,209,.12), 0 2px 16px rgba(10,22,40,.07);
}

.composer-header {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 18px 20px 0;
}
.composer-avatar {
  width: 40px; height: 40px;
  border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: .85rem; font-weight: 600;
  overflow: hidden;
  position: relative;
}
.composer-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.composer-textarea {
  flex: 1;
  border: none; outline: none; resize: none;
  font-family: 'DM Sans', sans-serif;
  font-size: .95rem; line-height: 1.6;
  color: #0d1f3c;
  background: transparent;
  min-height: 70px;
  padding: 8px 0 0;
}
.composer-textarea::placeholder { color: #b0bfd8; }

.composer-img-preview {
  margin: 12px 20px 0;
  position: relative;
}
.composer-img-preview img {
  width: 100%; max-height: 260px;
  object-fit: cover;
  border-radius: 10px;
  border: 1.5px solid #dde6f7;
}
.composer-img-remove {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: rgba(0,0,0,.55);
  border: none; border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.28s;
}
.composer-img-remove:hover { background: rgba(229,83,83,.85); }

.composer-footer {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 20px 16px;
  border-top: 1px solid #dde6f7;
  margin-top: 12px;
}
.composer-tools { display: flex; gap: 4px; }
.composer-tool {
  width: 36px; height: 36px;
  border: none; border-radius: 10px;
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
  color: #6b83b0;
}
.composer-tool:hover { background: #f0f4ff; color: #1d5fd1; }
.composer-tool svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.8; }

.btn-publish {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 22px;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
  border: none; border-radius: 100px;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem; font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(29,95,209,.3);
  transition: 0.28s cubic-bezier(.4,0,.2,1);
}
.btn-publish:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(29,95,209,.4); }
.btn-publish:active { transform: translateY(0); }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-publish svg { width: 15px; height: 15px; stroke: white; fill: none; stroke-width: 2.5; }

/* ── Feed header ── */
.feed-header {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 2px;
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
.empty-state p { margin-top: 16px; font-size: .9rem; line-height: 1.6; }

/* ── Post card ── */
.post-card {
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(10,22,40,.07);
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.28s, border-color 0.28s;
  animation: slideIn .4s cubic-bezier(.4,0,.2,1) both;
}
@keyframes slideIn {
  from { opacity:0; transform: translateY(14px); }
  to   { opacity:1; transform: translateY(0); }
}
.post-card:hover { box-shadow: 0 6px 28px rgba(10,22,40,.1); }

.post-header {
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
.post-meta {
  font-size: .75rem; color: #6b83b0;
  display: flex; align-items: center; gap: 6px;
}
.post-more {
  width: 32px; height: 32px;
  border: none; border-radius: 50%;
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.28s;
  color: #6b83b0;
}
.post-more:hover { background: #f0f4ff; }
.post-more svg { width: 18px; height: 18px; fill: currentColor; }

/* Post body */
.post-body { padding: 0 18px 14px; }
.post-text {
  font-size: .92rem; line-height: 1.7;
  color: #2d4270;
  white-space: pre-wrap;
  margin-bottom: 14px;
}
.post-image {
  width: 100%; max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

/* Post actions */
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
  color: #6b83b0;
  cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
}
.action-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 2; transition: 0.28s; }
.action-btn:hover { background: #f0f4ff; }
.action-count { font-variant-numeric: tabular-nums; }

/* Like */
.like-btn:hover { color: #e53e6a; background: #fff0f4; }
.like-btn.liked { color: #e53e6a; background: #fff0f4; }
.like-btn.liked svg { fill: #e53e6a; stroke: #e53e6a; }

/* Comment btn */
.comment-btn:hover { color: #1d5fd1; background: rgba(29,95,209,.12); }
.comment-btn.open { color: #1d5fd1; background: rgba(29,95,209,.12); }

/* ── Comments section ── */
.comments-section {
  border-top: 1.5px solid #f4f7fe;
  background: #f0f4ff;
}
.comments-list { padding: 14px 18px 0; }
.comment-item {
  display: flex; gap: 10px;
  margin-bottom: 14px;
}
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
.comment-name {
  font-size: .8rem; font-weight: 600;
  color: #0d1f3c; cursor: pointer;
}
.comment-name:hover { color: #1d5fd1; }
.comment-delete {
  background: none; border: none; cursor: pointer;
  opacity: 0.4; transition: opacity 0.2s;
  display: flex; align-items: center;
}
.comment-delete:hover { opacity: 1; color: #e53e6a; }
.comment-text { font-size: .83rem; color: #2d4270; line-height: 1.55; }
.comment-time { font-size: .72rem; color: #6b83b0; margin-top: 5px; }
.no-comments {
  text-align: center; padding: 16px;
  font-size: .85rem; color: #6b83b0;
}

/* Comment input */
.comment-input-row {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px 14px;
}
.comment-input-avatar {
  width: 32px; height: 32px;
  border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #1d5fd1, #4b8aff);
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
  cursor: pointer;
  transition: 0.28s;
  flex-shrink: 0;
}
.comment-send:hover:not(:disabled) { background: #4b8aff; transform: scale(1.05); }
.comment-send:disabled { opacity: 0.4; cursor: not-allowed; }
.comment-send svg { width: 13px; height: 13px; stroke: white; fill: none; stroke-width: 2.5; }

/* ── Load more ── */
.load-more-container {
  display: flex; justify-content: center;
  padding: 24px 0 8px;
}
.btn-load-more {
  display: flex; align-items: center; justify-content: center;
  padding: 12px 32px;
  background: white;
  border: 1.5px solid #dde6f7;
  border-radius: 100px;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem; font-weight: 600;
  color: #1d5fd1;
  cursor: pointer;
  transition: 0.28s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 2px 12px rgba(10,22,40,.06);
}
.btn-load-more:hover:not(:disabled) {
  background: #f0f4ff;
  border-color: #1d5fd1;
  box-shadow: 0 4px 18px rgba(29,95,209,.15);
}
.btn-load-more:disabled { opacity: 0.6; cursor: not-allowed; }
.up-to-date {
  font-size: .88rem; font-weight: 500;
  color: #6b83b0;
  padding: 8px 0;
}

/* ── Dialog ── */
.delete-dialog { border-radius: 16px !important; }
.dialog-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem; font-weight: 600;
  display: flex; align-items: center;
}
.dropdown-menu { border-radius: 12px !important; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .page { padding: 20px 10px 60px; }
}
</style>
