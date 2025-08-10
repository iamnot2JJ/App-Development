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
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super-admin',
    isSuperAdmin: (state) => state.user?.role === 'super-admin',
  },

  actions: {
    async initializeStore() {
      console.log('Initializing auth store...')
      this.loading = true

      // Initialize legacy users for admin login - always ensure these exist
      const defaultUsers = [
        {
          id: 1,
          email: 'admin@migrantcare.org',
          password: 'Admin123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          registeredAt: new Date().toISOString(),
        },
        {
          id: 2,
          email: 'junjiezhou@monash.edu',
          password: 'FIT5032Admin!',
          firstName: 'Junjie',
          lastName: 'Zhou',
          role: 'admin',
          registeredAt: new Date().toISOString(),
        },
        {
          id: 3,
          email: 'superadmin@migrantcare.org',
          password: 'SuperAdmin123!',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super-admin',
          registeredAt: new Date().toISOString(),
        },
      ]

      // Always use default users for admin accounts
      this.users = defaultUsers
      localStorage.setItem('users', JSON.stringify(this.users))
      console.log('Admin users initialized:', this.users)

      // Check for existing current user
      const storedCurrentUser = localStorage.getItem('currentUser')
      if (storedCurrentUser) {
        try {
          this.user = JSON.parse(storedCurrentUser)
          console.log('Restored current user:', this.user)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('currentUser')
        }
      }

      // Firebase auth state listener
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
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
          } catch (error) {
            console.error('Firebase auth error:', error)
          }
        }
        this.loading = false
      })

      this.loading = false
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
      console.log('Login attempt:', email)
      console.log('Available users:', this.users)
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const user = this.users.find((u) => u.email === email && u.password === password)
      console.log('Found user:', user)

      if (!user) {
        console.log('Login failed - user not found or password mismatch')
        throw new Error('Invalid email or password')
      }

      this.user = user
      localStorage.setItem('currentUser', JSON.stringify(user))
      console.log('Login successful, user set:', this.user)

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
