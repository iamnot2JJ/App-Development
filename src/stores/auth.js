import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    users: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    initializeStore() {
      const storedUser = localStorage.getItem('currentUser')
      const storedUsers = localStorage.getItem('users')

      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }

      if (storedUsers) {
        this.users = JSON.parse(storedUsers)
      } else {
        // Initialize with default admin user
        this.users = [
          {
            id: 1,
            email: 'admin@migranthelp.org',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            registeredAt: new Date().toISOString(),
          },
        ]
        localStorage.setItem('users', JSON.stringify(this.users))
      }
    },

    register(userData) {
      // Validate required fields
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('All fields are required')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate password strength
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Check if user already exists
      if (this.users.find((u) => u.email === userData.email)) {
        throw new Error('User with this email already exists')
      }

      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'user',
        registeredAt: new Date().toISOString(),
      }

      this.users.push(newUser)
      localStorage.setItem('users', JSON.stringify(this.users))

      return newUser
    },

    login(email, password) {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const user = this.users.find((u) => u.email === email && u.password === password)

      if (!user) {
        throw new Error('Invalid email or password')
      }

      this.user = user
      localStorage.setItem('currentUser', JSON.stringify(user))

      return user
    },

    logout() {
      this.user = null
      localStorage.removeItem('currentUser')
    },

    sanitizeInput(input) {
      return input.replace(/[<>]/g, '')
    },
  },
})
