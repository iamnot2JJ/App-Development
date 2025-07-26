<template>
  <form @submit.prevent="handleLogin">
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input
        type="email"
        class="form-control"
        :class="{ 'is-invalid': errors.email }"
        id="email"
        v-model="formData.email"
        required
      />
      <div class="invalid-feedback" v-if="errors.email">
        {{ errors.email }}
      </div>
    </div>

    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        :class="{ 'is-invalid': errors.password }"
        id="password"
        v-model="formData.password"
        required
      />
      <div class="invalid-feedback" v-if="errors.password">
        {{ errors.password }}
      </div>
    </div>

    <div class="alert alert-danger" v-if="errors.general">
      {{ errors.general }}
    </div>

    <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

export default {
  name: 'LoginForm',
  emits: ['success'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isLoading = ref(false)

    const formData = reactive({
      email: '',
      password: '',
    })

    const errors = reactive({})

    const validateForm = () => {
      const newErrors = {}

      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      }

      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleLogin = async () => {
      // Clear previous errors
      Object.keys(errors).forEach((key) => delete errors[key])

      if (!validateForm()) return

      try {
        isLoading.value = true

        // Sanitize inputs
        const sanitizedEmail = authStore.sanitizeInput(formData.email)
        const sanitizedPassword = authStore.sanitizeInput(formData.password)

        await authStore.login(sanitizedEmail, sanitizedPassword)
        emit('success')
      } catch (error) {
        errors.general = error.message
      } finally {
        isLoading.value = false
      }
    }

    return {
      formData,
      errors,
      isLoading,
      handleLogin,
    }
  },
}
</script>
