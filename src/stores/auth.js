import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { saveToStorage, getFromStorage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getFromStorage('auth_token') || null)
  const user = computed(() => (token.value ? jwtDecode(token.value) : null))

  const roles = {
    ADMIN: 'admin',
    MEMBER: 'member',
    PUBLIC: 'public',
  }

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || roles.PUBLIC)

  function login(credentials) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成JWT令牌
        const authToken = btoa(
          JSON.stringify({
            email: credentials.email,
            role: credentials.email.includes('admin') ? roles.ADMIN : roles.MEMBER,
            name: credentials.email.split('@')[0],
          }),
        )

        token.value = authToken
        saveToStorage('auth_token', authToken)
        resolve({ success: true })
      }, 500)
    })
  }

  function register(userData) {
    // 保存用户到localStorage
    const users = getFromStorage('users') || []
    users.push(userData)
    saveToStorage('users', users)
    return login({ email: userData.email, password: userData.password })
  }

  function logout() {
    token.value = null
    localStorage.removeItem('auth_token')
  }

  return { token, user, isAuthenticated, userRole, roles, login, register, logout }
})
