import { defineStore } from 'pinia'
import { createComment, deleteCommentApi } from '@/api/comments'
import { createPost, deletePostApi, getPosts, toggleLike } from '@/api/posts'

export const usePostStore = defineStore('posts', {
  state: () => ({
    posts: [],
    loading: false,
    publishing: false,
  }),

  actions: {
    // Obtener todos los posts
    async fetchPosts () {
      this.loading = true
      try {
        const postsData = await getPosts() // Llamamos a la función de la API
        this.posts = postsData
          .filter(post => post.authorId !== null)
          .map(post => ({ ...post, newComment: '' }))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    // Crear un nuevo post
    async createPostAction (postContent, file) {
      this.publishing = true
      try {
        // Llamamos a la API pasando el objeto que espera
        await createPost({ content: postContent, file })
        await this.fetchPosts() // Recargamos para ver el nuevo post
      } catch (error) {
        throw error
      } finally {
        this.publishing = false
      }
    },

    // Dar o quitar Like
    async handleToggleLike (postId) {
      try {
        const data = await toggleLike(postId) // Llamamos a la API
        const index = this.posts.findIndex(p => p._id === postId)
        if (index !== -1) {
          this.posts[index].likes = data.likes // Actualizamos el estado reactivo
        }
      } catch (error) {
        throw error
      }
    },

    // Eliminar un post
    async deletePost (postId) {
      try {
        await deletePostApi(postId) // Llamamos a la API
        this.posts = this.posts.filter(p => p._id !== postId) // Quitamos del estado
      } catch (error) {
        throw error
      }
    },

    async addComment (postId, content) {
      try {
        // 1. Llamada a la API
        const newComment = await createComment(postId, content)

        // 2. Actualización local del estado para que sea instantáneo
        const post = this.posts.find(p => p._id === postId)
        if (post) {
          // Si el backend devuelve el comentario con el autor poblado, lo añadimos
          if (!post.comments) {
            post.comments = []
          }
          post.comments.push(newComment.comment) // Ajusta según la estructura de tu respuesta
          post.newComment = '' // Limpiamos el campo de texto en la UI
        }
      } catch (error) {
        throw error
      }
    },

    async removeComment (postId, commentId) {
      try {
        await deleteCommentApi(commentId)

        // Filtramos el comentario eliminado del estado local
        const post = this.posts.find(p => p._id === postId)
        if (post) {
          post.comments = post.comments.filter(c => c._id !== commentId)
        }
      } catch (error) {
        throw error
      }
    },
  },
})
