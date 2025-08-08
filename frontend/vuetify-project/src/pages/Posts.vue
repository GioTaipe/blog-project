<template>
  <v-container class="custom-container">
    <!-- SECCIÓN PUBLICAR POSTS -->
    <div class="form-container mb-6">
      <div class="title">¿Qué estás pensando?</div>
      <v-textarea v-model="newPost.content" rows="3" auto-grow outlined></v-textarea>
      <input ref="fileInput" type="file" accept="image/*,video/*" style="display: none" @change="handleFileChange" />
      <div class="file-actions">
        <v-btn icon @click="triggerFileSelect">
          <v-icon>mdi-camera</v-icon>
        </v-btn>
        <span v-if="newPost.fileName" class="ml-2">{{ newPost.fileName }}</span>
        <v-spacer />
        <v-btn class="post-button" @click="publishPost">Publicar</v-btn>
      </div>
    </div>

    <!-- SECCIÓN MOSTRAR POSTS -->
    <v-row justify="center">
      <v-col cols="12" md="8" v-for="post in posts.filter(Boolean)" :key="post._id">
        <div class="form-container mb-4">
          <div class="post-header">
            <v-avatar size="36" class="mr-2">
              <v-img :src="post.authorId?.profileImage || '/avatars/avatar-default.png'" />
            </v-avatar>
            <span>{{ post.authorId?.name }} - {{ formatDate(post.createdAt) }}</span>
          </div>

          <v-img v-if="post.fileUrl" :src="post.fileUrl" class="post-image" cover />

          <div class="post-content">{{ post.content }}</div>

          <div class="post-actions">
            <v-btn @click="handleLike(post._id)" :color="isLikedByUser(post)" class="post-button">
              ❤️ {{ post.likes?.length ?? 0 }}
            </v-btn>

            <v-btn @click="toggleComments(post._id)" class="post-button">
              {{ visibleComments[post._id] ? 'Ocultar comentarios' : 'Ver comentarios' }}
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="visibleComments[post._id]">
              <v-textarea v-model="post.newComment" label="Escribe un comentario..." rows="2" outlined dense
                class="mt-2"></v-textarea>
              <v-btn class="post-button" small @click="submitComment(post._id, post.newComment)">Comentar</v-btn>

              <v-list dense>
                <v-list-item v-for="comment in (post.comments || [])" :key="comment._id">
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-2 comment-header">
                      <v-avatar size="28" class="mr-2">
                        <v-img :src="comment.author.profileImage || '/avatars/avatar-default.png'" />
                      </v-avatar>
                      <span>{{ comment.author.name }} - {{ formatDate(comment.createdAt) }}</span>
                      <v-spacer></v-spacer>
                      <v-icon v-if="comment.author._id === currentUserId" class="delete-icon" small
                        @click="removeComment(post._id, comment._id)">
                        mdi-delete
                      </v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ comment.content }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { getPosts } from '@/api/posts'
import { createPost } from '@/api/posts'
import { createComment } from '@/api/comments'
import { getComments } from '@/api/comments'
import { deleteComment } from '@/api/comments'
import { toggleLike } from '@/api/posts';
import { useAuthStore } from '@/stores/app'
import { computed } from 'vue'


const posts = ref([])
const newPost = ref({
  content: '',
  file: null,
  fileName: '',
})
const fileInput = ref(null)
const visibleComments = ref({})
const auth = useAuthStore()
const currentUserId = computed(() => auth.userId)

onMounted(async () => {
  try {
    posts.value = (await getPosts())
      .filter(post => post.authorId !== null)
      .map(post => ({
        ...post,
        newComment: ''
      }));


  } catch (err) {
    alert('Error al cargar publicaciones: ' + err.message)
  }
})
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    newPost.value.file = file
    newPost.value.fileName = file.name
  }
}

const triggerFileSelect = () => {
  fileInput.value.click()
}

const publishPost = async () => {
  await createPost(newPost.value)
  newPost.value = {
    content: '',
    file: null,
    fileName: '',
  }
  try {
    posts.value = await getPosts()
  } catch (err) {
    alert('Error al recargar publicaciones: ' + err.message)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

const toggleComments = async (postId) => {
  visibleComments.value[postId] = !visibleComments.value[postId]

  if (visibleComments.value[postId]) {
    const post = posts.value.find(p => p.id === postId || p._id === postId)
    if (post && !post.comments) {

      post.comments = await getComments(postId)

    }
  } else {

    const post = posts.value.find(p => p.id === postId || p._id === postId)
    if (post) post.newComment = ''
  }
}

const submitComment = async (postId, content) => {
  if (!content.trim()) return

  try {

    await createComment(postId, content);
    const post = posts.value.find(p => p._id === postId);
    if (post) post.newComment = '';
    post.comments = await getComments(postId);

  } catch (err) {
    alert('Error al comentar: ' + err.message)
  }
}

const removeComment = async (postId, commentId) => {
  try {
    await deleteComment(postId, commentId);
    const post = posts.value.find(p => p._id === postId);
    if (post) {
      post.comments = post.comments.filter(c => c._id !== commentId);
    }
  } catch (err) {
    alert('Error al eliminar comentario: ' + err.message)
  }
}

const isLikedByUser = (post) => {
  return post.likes?.includes(currentUserId)
}

const handleLike = async (postId) => {
  try {

    const updatedPost = await toggleLike(postId, currentUserId.value);
    const index = posts.value.findIndex(p => p._id === postId);
    if (index !== -1) {
      // Solo actualizamos los likes para no perder otros campos
      posts.value[index].likes = updatedPost.likes;
      posts.value[index].newComment = posts.value[index].newComment || '';
    }
  } catch (err) {
    alert('Error al dar like: ' + err.message);
  }
}
</script>
<style scoped>
.custom-container {
  padding-top: 32px;
}

.form-container {
  width: 100%;
  max-width: 780px;
  margin: auto;
  border-radius: 0.75rem;
  background-color: #C3DAC3;
  /* fondo principal del contenedor */
  padding: 1.5rem;
  color: #6B6054;
  /* texto principal */
  box-shadow: 0 0 0 1px rgba(107, 96, 84, 0.1), 0 10px 15px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #6B6054;
}

.file-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-image {
  border-radius: 0.5rem;
  margin: 1rem auto;
  max-width: 220px;
  height: 220px;
  background-color: #D5ECD4;
}

.post-content {
  margin-bottom: 1rem;
  color: #6B6054;
}

.post-actions {
  display: flex;
  gap: 12px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.post-button {
  background-color: #A1B0AB;
  color: #fff;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.post-button:hover {
  background-color: #929487;
}

.comment-header {
  display: flex;
  align-items: center;
}

.delete-icon {
  cursor: pointer;
  color: #f87171;
  font-size: 18px;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.delete-icon:hover {
  color: #ef4444;
}

@media (max-width: 600px) {
  .form-container {
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .title {
    font-size: 1.2rem;
  }
}
</style>
