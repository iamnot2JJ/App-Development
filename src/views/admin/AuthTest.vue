<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3>Authentication Store Test</h3>
          </div>
          <div class="card-body">
            <h5>Auth Store State:</h5>
            <pre>{{ JSON.stringify({
              isAuthenticated: authStore.isAuthenticated,
              isAdmin: authStore.isAdmin,
              currentUser: authStore.user,
              usersCount: authStore.users.length
            }, null, 2) }}</pre>

            <h5 class="mt-4">Available Users:</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in authStore.users" :key="user.id">
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-primary" 
                        @click="testLogin(user.email, user.password)"
                      >
                        Test Login
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="testResult" class="alert" :class="testResult.success ? 'alert-success' : 'alert-danger'">
              {{ testResult.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

export default {
  name: 'AuthTest',
  setup() {
    const authStore = useAuthStore()
    const testResult = ref(null)

    const testLogin = async (email, password) => {
      try {
        console.log('Testing login with:', email, password)
        
        // Test legacy login
        const user = authStore.login(email, password)
        
        testResult.value = {
          success: true,
          message: `Login successful for ${email}. Role: ${user.role}. Is Admin: ${authStore.isAdmin}`
        }
        
        console.log('Login test result:', user)
        
      } catch (error) {
        testResult.value = {
          success: false,
          message: `Login failed: ${error.message}`
        }
        console.error('Login test error:', error)
      }
    }

    return {
      authStore,
      testResult,
      testLogin
    }
  }
}
</script>
