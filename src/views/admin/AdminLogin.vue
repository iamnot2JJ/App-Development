<template>
  <div class="admin-login-page">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
      <div class="row justify-content-center w-100">
        <div class="col-xl-6 col-lg-8 col-md-10">
          <div class="card o-hidden border-0 shadow-lg">
            <div class="card-body p-0">
              <div class="row">
                <div class="col-lg-6 d-none d-lg-block bg-admin-image"></div>
                <div class="col-lg-6">
                  <div class="p-5">
                    <div class="text-center">
                      <h1 class="h4 text-gray-900 mb-4">🔐 Admin Portal</h1>
                      <p class="mb-4 text-muted">Access the administrative dashboard</p>
                    </div>

                    <!-- Login Form -->
                    <form @submit.prevent="loginAdmin" class="user">
                      <div class="form-group mb-3">
                        <input
                          type="email"
                          class="form-control form-control-user"
                          id="adminEmail"
                          placeholder="Admin Email Address..."
                          v-model="loginForm.email"
                          required
                          :disabled="loading"
                        />
                      </div>
                      <div class="form-group mb-3">
                        <input
                          type="password"
                          class="form-control form-control-user"
                          id="adminPassword"
                          placeholder="Password"
                          v-model="loginForm.password"
                          required
                          :disabled="loading"
                        />
                      </div>
                      <div class="form-group mb-3">
                        <div class="custom-control custom-checkbox small">
                          <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck"
                            v-model="loginForm.rememberMe"
                          />
                          <label class="custom-control-label" for="customCheck">
                            Remember Me
                          </label>
                        </div>
                      </div>

                      <!-- Error Message -->
                      <div v-if="error" class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ error }}
                      </div>

                      <button
                        type="submit"
                        class="btn btn-primary btn-user btn-block"
                        :disabled="loading"
                      >
                        <span v-if="loading">
                          <i class="fas fa-spinner fa-spin"></i> Logging in...
                        </span>
                        <span v-else>
                          <i class="fas fa-sign-in-alt"></i> Login
                        </span>
                      </button>
                    </form>

                    <hr />

                    <!-- Quick Access Admin Accounts -->
                    <div class="text-center">
                      <h6 class="text-muted mb-3">Quick Access (Demo)</h6>
                      <div class="row">
                        <div class="col-12 mb-2">
                          <button
                            class="btn btn-outline-primary btn-sm w-100"
                            @click="quickLogin('admin@migrantcare.org', 'Admin123!')"
                            :disabled="loading"
                          >
                            Admin Account
                          </button>
                        </div>
                        <div class="col-12 mb-2">
                          <button
                            class="btn btn-outline-success btn-sm w-100"
                            @click="quickLogin('junjiezhou@monash.edu', 'FIT5032Admin!')"
                            :disabled="loading"
                          >
                            Junjie Zhou (Developer)
                          </button>
                        </div>
                        <div class="col-12 mb-2">
                          <button
                            class="btn btn-outline-warning btn-sm w-100"
                            @click="quickLogin('superadmin@migrantcare.org', 'SuperAdmin123!')"
                            :disabled="loading"
                          >
                            Super Admin
                          </button>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div class="text-center">
                      <router-link class="small" to="/">
                        ← Back to Main Site
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const loginForm = ref({
      email: '',
      password: '',
      rememberMe: false
    })

    const loading = ref(false)
    const error = ref('')

    const loginAdmin = async () => {
      try {
        loading.value = true
        error.value = ''

        if (!loginForm.value.email || !loginForm.value.password) {
          throw new Error('Please enter both email and password')
        }

        // First try Firebase login
        try {
          await authStore.loginWithFirebase(loginForm.value.email, loginForm.value.password)
          
          // Check if user is admin
          if (!authStore.isAdmin) {
            throw new Error('Access denied. Admin privileges required.')
          }

          // Success - redirect to admin dashboard
          router.push('/admin')
          return

        } catch (firebaseError) {
          console.log('Firebase login failed, trying legacy login:', firebaseError.message)
          
          // Fallback to legacy login
          try {
            authStore.login(loginForm.value.email, loginForm.value.password)
            
            // Check if user is admin
            if (!authStore.isAdmin) {
              throw new Error('Access denied. Admin privileges required.')
            }

            // Success - redirect to admin dashboard
            router.push('/admin')
            return

          } catch (legacyError) {
            throw new Error(`Login failed: ${legacyError.message}`)
          }
        }

      } catch (err) {
        error.value = err.message || 'Login failed. Please try again.'
        console.error('Admin login error:', err)
      } finally {
        loading.value = false
      }
    }

    const quickLogin = async (email, password) => {
      console.log('Quick login attempt:', email)
      loginForm.value.email = email
      loginForm.value.password = password
      await loginAdmin()
    }

    // Debug: Log available users on component mount
    console.log('Available users in store:', authStore.users)
    console.log('Current user:', authStore.user)
    console.log('Is admin:', authStore.isAdmin)

    return {
      loginForm,
      loading,
      error,
      loginAdmin,
      quickLogin
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-admin-image {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8)),
              url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="admin-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23admin-pattern)"/></svg>');
  background-size: cover;
  background-position: center;
}

.card {
  border-radius: 1rem;
}

.form-control-user {
  border-radius: 10rem;
  padding: 1.5rem 1rem;
  font-size: 0.9rem;
  border: 1px solid #d1d3e2;
}

.form-control-user:focus {
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  border-color: #667eea;
}

.btn-user {
  border-radius: 10rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
}

.btn-block {
  width: 100%;
}

.text-gray-900 {
  color: #5a5c69 !important;
}

.custom-control-input {
  position: absolute;
  left: 0;
  z-index: -1;
  width: 1rem;
  height: 1.25rem;
  opacity: 0;
}

.custom-control-label {
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
}

.custom-control-label::before {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
  content: "";
  background-color: #fff;
  border: 1px solid #adb5bd;
  border-radius: 0.25rem;
}

.custom-control-input:checked ~ .custom-control-label::after {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  width: 1rem;
  height: 1rem;
  content: "";
  background: no-repeat 50%/50% 50%;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='m6.564.75-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e");
}

.custom-control-input:checked ~ .custom-control-label::before {
  color: #fff;
  border-color: #667eea;
  background-color: #667eea;
}

.alert {
  border-radius: 0.5rem;
  border: none;
}

.btn-outline-primary,
.btn-outline-success,
.btn-outline-warning {
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover,
.btn-outline-success:hover,
.btn-outline-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .col-lg-6 {
    width: 100%;
  }
  
  .bg-admin-image {
    display: none !important;
  }
  
  .p-5 {
    padding: 2rem !important;
  }
}
</style>
