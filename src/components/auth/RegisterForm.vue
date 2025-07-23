<template>
  <form @submit.prevent="handleRegister">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="firstName" class="form-label">First Name</label>
        <input
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.firstName }"
          id="firstName"
          v-model="formData.firstName"
          required
        />
        <div class="invalid-feedback" v-if="errors.firstName">
          {{ errors.firstName }}
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <label for="lastName" class="form-label">Last Name</label>
        <input
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.lastName }"
          id="lastName"
          v-model="formData.lastName"
          required
        />
        <div class="invalid-feedback" v-if="errors.lastName">
          {{ errors.lastName }}
        </div>
      </div>
    </div>

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
      <div class="form-text">Password must be at least 6 characters long.</div>
    </div>

    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control"
        :class="{ 'is-invalid': errors.confirmPassword }"
        id="confirmPassword"
        v-model="formData.confirmPassword"
        required
      />
      <div class="invalid-feedback" v-if="errors.confirmPassword">
        {{ errors.confirmPassword }}
      </div>
    </div>

    <div class="alert alert-danger" v-if="errors.general">
      {{ errors.general }}
    </div>

    <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
      {{ isLoading ? 'Creating Account...' : 'Register' }}
    </button>
  </form>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

export default {
  name: 'RegisterForm',
  emits: ['success'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isLoading = ref(false)

    const formData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    })

    const errors = reactive({})

    const validateForm = () => {
      const newErrors = {}

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      } else if (formData.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters'
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      } else if (formData.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters'
      }

      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleRegister = async () => {
      // Clear previous errors
      Object.keys(errors).forEach((key) => delete errors[key])

      if (!validateForm()) return

      try {
        isLoading.value = true

        // Sanitize inputs
        const sanitizedData = {
          firstName: authStore.sanitizeInput(formData.firstName.trim()),
          lastName: authStore.sanitizeInput(formData.lastName.trim()),
          email: authStore.sanitizeInput(formData.email),
          password: authStore.sanitizeInput(formData.password),
        }

        await authStore.register(sanitizedData)
        await authStore.login(sanitizedData.email, sanitizedData.password)
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
      handleRegister,
    }
  },
}
</script>
