<template>
  <v-container>
    <!-- SECCIÓN PERFIL -->
    <v-card class="mb-6 pa-4">
      <v-row>
        <v-col cols="12" md="3" class="d-flex flex-column align-center pr-md-4">
          <v-avatar size="120" class="mb-2">
            <img cover height="120" width="120" :src="user.profileImage || defaultAvatar" alt="Avatar" />
          </v-avatar>
          <v-btn @click="avatarDialog = true">Cambiar avatar</v-btn>
        </v-col>

        <v-col cols="12" md="9">
          <h2>{{ user.name }}</h2>
          <p>Email: {{ user.email }}</p>
          <p v-if="user.bio">Bio: {{ user.bio }}</p>
          <v-btn @click="openEditDialog">✏️ Editar perfil</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- SECCIÓN PUBLICACIONES -->
    <h3 class="mb-4">Mis publicaciones</h3>
    <v-row>
      <v-col cols="12" md="12" v-for="post in userPosts" :key="post.id">
        <v-card class="mb-4">
          <v-img v-if="post.fileUrl" :src="post.fileUrl" class="rounded-lg mx-auto my-2" width="220" height="220"
            cover />
          <v-card-text>{{ post.content }}</v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="confirmDelete(post._id)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIALOGO PARA CONFIRMAR ELIMINACIÓN DE PUBLICACIÓN -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar publicación?</v-card-title>
        <v-card-text>¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede
          deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deletePost">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOGO PARA EDITAR PERFIL -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Editar perfil</v-card-title>
        <v-card-text>
          <v-text-field v-model="editForm.name" label="Nombre" />
          <v-text-field v-model="editForm.email" label="Email" />
          <v-textarea v-model="editForm.bio" label="Biografía" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProfile">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- SECCIÓN PARA SELECCIONAR AVATAR -->
  <v-dialog v-model="avatarDialog" max-width="600">
    <v-card>
      <v-card-title class="text-h5">Selecciona tu avatar</v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="avatar in avatars" :key="avatar" cols="6" md="3" class="d-flex justify-center">
            <v-card :elevation="selectedAvatar === avatar ? 12 : 2" class="pa-2" @click="selectAvatar(avatar)">
              <v-img :src="`/avatars/${avatar}`" height="100" width="100" class="rounded-circle" />
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="avatarDialog = false">Cerrar</v-btn>
        <v-btn color="primary" @click="updateAvatar(`/avatars/${selectedAvatar}`)">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
