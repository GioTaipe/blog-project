import { defineStore } from 'pinia'
import { createComment, deleteCommentApi } from '@/api/comments'
import { createPost, deletePostApi, getPosts, toggleLike } from '@/api/posts'
import { useAuthStore } from '@/stores/authStore'

export const usePostStore = defineStore('posts', {
  state: () => ({
    posts: [],
    loading: false,
    loadingMore: false,
    publishing: false,
    page: 1,
    hasMore: true,
  }),

  actions: {
    // Obtener la primera página de posts
    async fetchPosts () {
      this.loading = true
      try {
        this.page = 1
        const { posts, hasMore } = await getPosts(1)
        this.posts = posts
          .filter(post => post.authorId !== null)
          .map(post => ({ ...post, newComment: '' }))
        this.hasMore = hasMore
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cargar más posts (siguiente página)
    async loadMorePosts () {
      this.loadingMore = true
      try {
        const nextPage = this.page + 1
        const { posts, hasMore } = await getPosts(nextPage)
        const newPosts = posts
          .filter(post => post.authorId !== null)
          .map(post => ({ ...post, newComment: '' }))
        this.posts.push(...newPosts)
        this.page = nextPage
        this.hasMore = hasMore
      } catch (error) {
        throw error
      } finally {
        this.loadingMore = false
      }
    },

    // Crear un nuevo post (insercion local, sin refetch)
    async createPostAction (postContent, file) {
      this.publishing = true
      try {
        const data = await createPost({ content: postContent, file })
        const auth = useAuthStore()
        const newPost = {
          ...data.post,
          authorId: {
            _id: auth.userId,
            name: auth.userName,
            profileImage: auth.userProfileImage || '',
          },
          comments: [],
          createdAt: new Date().toISOString(),
          newComment: '',
        }
        this.posts.unshift(newPost)
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
