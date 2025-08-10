import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config.js'
import DOMPurify from 'dompurify'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    users: [],
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async initializeStore() {
      this.loading = true

      // Listen for auth state changes
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            this.user = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data(),
            }
          } else {
            // Create user document if it doesn't exist
            const userData = {
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              role: 'user',
              registeredAt: new Date().toISOString(),
            }
            await setDoc(doc(db, 'users', firebaseUser.uid), userData)
            this.user = { id: firebaseUser.uid, ...userData }
          }
        } else {
          this.user = null
        }
        this.loading = false
      })

      // Initialize legacy users for backwards compatibility
      const storedUsers = localStorage.getItem('users')
      if (storedUsers) {
        this.users = JSON.parse(storedUsers)
      } else {
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

    async registerWithFirebase(userData) {
      try {
        this.loading = true
        this.error = null

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

        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        )

        // Save additional user data to Firestore
        const userDoc = {
          email: this.sanitizeInput(userData.email),
          firstName: this.sanitizeInput(userData.firstName),
          lastName: this.sanitizeInput(userData.lastName),
          role: 'user',
          registeredAt: new Date().toISOString(),
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)

        this.user = {
          id: userCredential.user.uid,
          ...userDoc,
        }

        return this.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithFirebase(email, password) {
      try {
        this.loading = true
        this.error = null

        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        // User data will be set automatically by onAuthStateChanged

        return userCredential.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle() {
      try {
        this.loading = true
        this.error = null

        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)

        // Check if user document exists, create if not
        const userDoc = await getDoc(doc(db, 'users', result.user.uid))
        if (!userDoc.exists()) {
          const userData = {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || 'User',
            lastName: result.user.displayName?.split(' ')[1] || '',
            role: 'user',
            registeredAt: new Date().toISOString(),
          }
          await setDoc(doc(db, 'users', result.user.uid), userData)
        }

        return result.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logoutFromFirebase() {
      try {
        await signOut(auth)
        this.user = null
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    // Legacy methods for backwards compatibility
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
      if (typeof input !== 'string') return input
      // Use DOMPurify for enhanced sanitization
      return DOMPurify.sanitize(input.replace(/[<>]/g, ''))
    },
  },
})
