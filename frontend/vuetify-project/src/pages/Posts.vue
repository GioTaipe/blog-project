<template>
  <v-container>
    <!-- SECCIÓN PUBLICAR POSTS -->
    <v-card class="mb-6">
      <v-textarea v-model="newPost.content" label="¿Qué estás pensando?" rows="3" auto-grow outlined></v-textarea>
      <input ref="fileInput" type="file" accept="image/*,video/*" style="display: none" @change="handleFileChange" />
      <v-row class="align-center justify-space-between mt-2">
        <v-col cols="auto" class="d-flex align-center">
          <v-btn icon @click="triggerFileSelect">
            <v-icon>mdi-camera</v-icon>
          </v-btn>
          <span v-if="newPost.fileName" class="ml-2">{{ newPost.fileName }}</span>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="publishPost">Publicar</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- SECCIÓN MOSTRAR POSTS -->
    <v-row justify="center">
      <v-col cols="12" md="12" v-for="post in posts.filter(Boolean)" :key="post._id">
        <v-card class="mb-4">
          <v-card-subtitle class="d-flex align-center px-4 pb-1">
            <v-avatar size="36" class="mr-2" style="margin-top: 8px;">
              <v-img :src="post.authorId?.profileImage || '/avatars/avatar-default.png'" />
            </v-avatar>
            <span>
              {{ post.authorId?.name }} - {{ formatDate(post.createdAt) }}
            </span>

          </v-card-subtitle>
          <v-img v-if="post.fileUrl" :src="post.fileUrl" class="rounded-lg mx-auto my-2" width="220" height="220"
            cover />
          <v-card-text>{{ post.content }}</v-card-text>
          <v-btn @click="handleLike(post._id)" :color="isLikedByUser(post)" small class="mt-2 mb-2">
            ❤️ {{ post.likes.length }}
          </v-btn>
          <!-- SECCIÓN MOSTRAR COMENTARIOS Y COMENTAR -->
          <v-btn @click="toggleComments(post._id)">
            {{ visibleComments[post._id] ? 'Ocultar comentarios' : 'Ver comentarios' }}
          </v-btn>
          <v-expand-transition>
            <div v-if="visibleComments[post._id]">
              <!-- TEXTAREA PARA COMENTAR -->
              <v-textarea v-model="post.newComment" label="Escribe un comentario..." rows="2" outlined dense
                class="mt-2"></v-textarea>
              <v-btn color="primary" small class="mt-1 mb-2"
                @click="submitComment(post._id, post.newComment)">Comentar</v-btn>

              <!-- LISTA DE COMENTARIOS -->
              <v-list dense>
                <v-list-item v-for="comment in (post.comments || [])" :key="comment._id">
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-2">
                      <v-avatar size="28" class="mr-2" style="margin: 6px;">
                        <v-img :src="comment.author.profileImage || '/avatars/avatar-default.png'" />
                      </v-avatar>
                      <span>{{ comment.author.name }} - {{ formatDate(comment.createdAt) }}</span>
                      <v-spacer></v-spacer>

                      <!-- Mostrar botón solo si es del usuario logueado -->
                      <v-btn v-if="comment.author._id === currentUserId" 
                        @click="removeComment(post._id, comment._id)">
                        eliminar
                      </v-btn>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ comment.content }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </v-card>
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
    console.log("Usuario actual:", currentUserId.value);

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