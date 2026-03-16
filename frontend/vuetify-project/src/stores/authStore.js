import { defineStore } from 'pinia'
import api from '@/api/axiosConfig'
import { updateProfileImage, updateUser } from '@/api/user'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const raw = localStorage.getItem('user')
    let user = null
    try { user = raw ? JSON.parse(raw) : null } catch { user = null }
    return {
      token: localStorage.getItem('token') || null,
      user,
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    userId: state => state.user?._id || null,
    userName: state => state.user?.name || '',
    userProfileImage: state => state.user?.profileImage || null,
  },
  actions: {
    async validateToken () {
      if (!this.token) {
        return false
      }
      try {
        const { data } = await api.get('/users/me')
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
        return true
      } catch {
        this.logout()
        return false
      }
    },

    login (token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async updateProfileData (userData) {
      const updatedUser = await updateUser(userData)
      this.user = updatedUser // Actualiza el estado global
      localStorage.setItem('user', JSON.stringify(updatedUser))
    },

    async updateAvatar (file) {
      const response = await updateProfileImage(file)

      if (this.user) {
        this.user.profileImage = response.user.profileImage
        localStorage.setItem('user', JSON.stringify(this.user))
      }
      return response.user.profileImage
    },

    logout () {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Redirigir al login automáticamente
      router.push('/Login')
    },
  },
})
