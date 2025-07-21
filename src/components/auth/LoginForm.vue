<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">登录您的账户</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">电子邮箱</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="credentials.email"
                  :class="{ 'is-invalid': v$.credentials.email.$error }"
                />
                <div v-if="v$.credentials.email.$error" class="invalid-feedback">
                  {{ v$.credentials.email.$errors[0].$message }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="credentials.password"
                  :class="{ 'is-invalid': v$.credentials.password.$error }"
                />
                <div v-if="v$.credentials.password.$error" class="invalid-feedback">
                  {{ v$.credentials.password.$errors[0].$message }}
                </div>
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                  登录
                </button>
              </div>

              <div class="mt-3 text-center">
                <p>还没有账户？ <router-link to="/register">立即注册</router-link></p>
              </div>

              <div v-if="errorMessage" class="alert alert-danger mt-3">
                {{ errorMessage }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@/utils/validators'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const credentials = reactive({
  email: '',
  password: '',
})

const rules = {
  credentials: {
    email: { required, email },
    password: { required, minLength: minLength(6) },
  },
}

const v$ = useVuelidate(rules, { credentials })

const handleLogin = async () => {
  const isValid = await v$.value.$validate()

  if (!isValid) return

  try {
    loading.value = true
    errorMessage.value = ''

    await authStore.login(credentials)

    // 重定向或转到仪表盘
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (error) {
    errorMessage.value = '登录失败，请检查您的凭证'
  } finally {
    loading.value = false
  }
}
</script>
