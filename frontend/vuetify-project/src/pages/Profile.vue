<template>
  <v-container class="custom-container">
    <!-- SECCIÓN PERFIL -->
    <div class="form-container mb-6">
      <v-row>
        <v-col cols="12" md="3" class="d-flex flex-column align-center pr-md-4">
          <v-avatar size="120" class="mb-2">
            <img cover height="120" width="120" :src="user.profileImage || defaultAvatar" alt="Avatar" />
          </v-avatar>
          <v-btn class="post-button" @click="avatarDialog = true">Cambiar avatar</v-btn>
        </v-col>

        <v-col cols="12" md="9">
          <h2>{{ user.name }}</h2>
          <p>Email: {{ user.email }}</p>
          <p v-if="user.bio">Bio: {{ user.bio }}</p>
          <v-btn class="post-button" @click="openEditDialog">✏️ Editar perfil</v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- SECCIÓN PUBLICACIONES -->
    <div class="form-container mb-6">
      <h3 class="mb-4">Mis publicaciones</h3>
      <v-row>
        <v-col cols="12" md="12" v-for="post in userPosts" :key="post.id">
          <div class="form-container mb-4">
            <v-img v-if="post.fileUrl" :src="post.fileUrl" class="rounded-lg mx-auto my-2" width="220" height="220" cover />
            <div class="post-content">{{ post.content }}</div>
            <v-btn class="post-button" @click="confirmDelete(post._id)">Eliminar</v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- DIALOGO PARA CONFIRMAR ELIMINACIÓN DE PUBLICACIÓN -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <div class="form-container">
        <div class="title">¿Eliminar publicación?</div>
        <p>¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.</p>
        <div class="d-flex justify-end mt-4" style="gap: 8px">
          <v-btn class="post-button" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn class="post-button" color="error" @click="deletePost">Eliminar</v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- DIALOGO PARA EDITAR PERFIL -->
    <v-dialog v-model="editDialog" max-width="500">
      <div class="form-container">
        <div class="title">Editar perfil</div>
        <v-text-field v-model="editForm.name" label="Nombre" />
        <v-text-field v-model="editForm.email" label="Email" />
        <v-textarea v-model="editForm.bio" label="Biografía" />
        <div class="d-flex justify-end mt-4" style="gap: 8px">
          <v-btn class="post-button" @click="editDialog = false">Cancelar</v-btn>
          <v-btn class="post-button" color="primary" @click="saveProfile">Guardar</v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- SECCIÓN PARA SELECCIONAR AVATAR -->
    <v-dialog v-model="avatarDialog" max-width="600">
      <div class="form-container">
        <div class="title">Selecciona tu avatar</div>
        <v-row>
          <v-col v-for="avatar in avatars" :key="avatar" cols="6" md="3" class="d-flex justify-center">
            <v-card :elevation="selectedAvatar === avatar ? 12 : 2" class="pa-2" @click="selectAvatar(avatar)">
              <v-img :src="`/avatars/${avatar}`" height="100" width="100" class="rounded-circle" />
            </v-card>
          </v-col>
        </v-row>
        <div class="d-flex justify-end mt-4" style="gap: 8px">
          <v-btn class="post-button" @click="avatarDialog = false">Cerrar</v-btn>
          <v-btn class="post-button" color="primary" @click="updateAvatar(`/avatars/${selectedAvatar}`)">Guardar</v-btn>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserProfile } from '@/api/user'
import { getMyArticles } from '@/api/posts'
import { deletePostApi } from '@/api/posts'
import { updateUser } from '@/api/user'

const user = ref([])
const userPosts = ref([])
const defaultAvatar = '/avatars/avatar-default.png'

const editDialog = ref(false)
const avatarDialog = ref(false)
const selectedAvatar = ref('')

const deleteDialog = ref(false)
const postToDelete = ref(null)


const avatars = [
  'Avatar1.png',
  'Avatar2.png',
  'Avatar3.png',
  'Avatar4.png'
]

const editForm = ref({
  name: '',
  email: '',
  bio: ''
})

const openEditDialog = () => {
  editForm.value = { ...user.value }
  editDialog.value = true
}

const saveProfile = () => {
  user.value = { ...editForm.value }
  editDialog.value = false
  updateUser(editForm.value)
}

const deletePost = async (id) => {
  try {
    await deletePostApi(postToDelete.value)
    userPosts.value = await getMyArticles()
    deleteDialog.value = false
  } catch (err) {
    alert('Error al eliminar la publicación: ' + err.message)
  }
}

const confirmDelete = (id) => { 
  postToDelete.value = id
  deleteDialog.value = true
}


const selectAvatar = (avatar) => {
  selectedAvatar.value = avatar
  console.log(`Avatar seleccionado: ${avatar}`);

}

const updateAvatar = (avatarUrl) => {
  user.value.profileImage = avatarUrl
  avatarDialog.value = false
  updateUser({ profileImage: avatarUrl })
}

onMounted(async () => {
  try {
    user.value = await getUserProfile()
    userPosts.value = await getMyArticles()
  } catch (err) {
    alert('Error al cargar publicaciones: ' + err.message)
  }
})
</script>

<style scoped>
.rounded-circle {
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s ease;
}

.rounded-circle:hover {
  transform: scale(1.05);
}
</style>
<style scoped>
.custom-container {
  padding-top: 32px;
}

.form-container {
  width: 100%;
  max-width: 780px;
  margin: auto;
  border-radius: 0.75rem;
  background-color: #1f2937;
  padding: 1.5rem;
  color: #f9fafb;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 15px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.post-content {
  margin: 1rem 0;
}

.post-button {
  background-color: #a5b4fc;
  color: #111827;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.post-button:hover {
  background-color: #818cf8;
}

.rounded-circle {
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s ease;
}

.rounded-circle:hover {
  transform: scale(1.05);
}
</style>
