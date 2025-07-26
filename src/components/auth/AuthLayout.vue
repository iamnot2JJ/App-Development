<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <ul class="nav nav-pills nav-justified mb-4">
              <li class="nav-item">
                <button
                  class="nav-link w-100"
                  :class="{ active: activeTab === 'login' }"
                  @click="activeTab = 'login'"
                >
                  Login
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link w-100"
                  :class="{ active: activeTab === 'register' }"
                  @click="activeTab = 'register'"
                >
                  Register
                </button>
              </li>
            </ul>

            <LoginForm v-if="activeTab === 'login'" @success="handleAuthSuccess" />
            <RegisterForm v-else @success="handleAuthSuccess" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

export default {
  name: 'AuthLayout',
  components: {
    LoginForm,
    RegisterForm,
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('login')

    const handleAuthSuccess = () => {
      router.push('/')
    }

    return {
      activeTab,
      handleAuthSuccess,
    }
  },
}
</script>
