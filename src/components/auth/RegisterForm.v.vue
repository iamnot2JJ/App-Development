<template>
  <AuthLayout
    title="Create an Account"
    subtitle="Join our community to access resources"
    footerText="Already have an account?"
    footerLinkText="Sign in"
    footerLink="/login"
  >
    <form @submit.prevent="handleRegister">
      <div class="mb-3">
        <label for="name" class="form-label">Full Name</label>
        <input
          type="text"
          class="form-control"
          id="name"
          v-model="userData.name"
          :class="{ 'is-invalid': v$.userData.name.$error }"
        />
        <div v-if="v$.userData.name.$error" class="invalid-feedback">
          {{ v$.userData.name.$errors[0].$message }}
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email Address</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="userData.email"
          :class="{ 'is-invalid': v$.userData.email.$error }"
        />
        <div v-if="v$.userData.email.$error" class="invalid-feedback">
          {{ v$.userData.email.$errors[0].$message }}
        </div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="password"
          v-model="userData.password"
          :class="{ 'is-invalid': v$.userData.password.$error }"
        />
        <div v-if="v$.userData.password.$error" class="invalid-feedback">
          {{ v$.userData.password.$errors[0].$message }}
        </div>
      </div>

      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          type="password"
          class="form-control"
          id="confirmPassword"
          v-model="userData.confirmPassword"
          :class="{ 'is-invalid': v$.userData.confirmPassword.$error }"
        />
        <div v-if="v$.userData.confirmPassword.$error" class="invalid-feedback">
          {{ v$.userData.confirmPassword.$errors[0].$message }}
        </div>
      </div>

      <div class="mb-3 form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="terms"
          v-model="userData.acceptedTerms"
          :class="{ 'is-invalid': v$.userData.acceptedTerms.$error }"
        />
        <label class="form-check-label" for="terms">
          I agree to the <a href="#">Terms and Conditions</a>
        </label>
        <div v-if="v$.userData.acceptedTerms.$error" class="invalid-feedback">
          {{ v$.userData.acceptedTerms.$errors[0].$message }}
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          Create Account
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </form>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, sameAs } from '@/utils/validators'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from './AuthLayout.vue'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const userData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
})

const rules = {
  userData: {
    name: { required },
    email: { required, email },
    password: {
      required,
      minLength: minLength(8),
      strongPassword: (value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) ||
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    },
    confirmPassword: {
      required,
      sameAsPassword: sameAs(userData.password) || 'Passwords do not match',
    },
    acceptedTerms: {
      required,
      sameAs: sameAs(true) || 'You must accept the terms and conditions',
    },
  },
}

const v$ = useVuelidate(rules, { userData })

const handleRegister = async () => {
  const isValid = await v$.value.$validate()

  if (!isValid) return

  try {
    loading.value = true
    errorMessage.value = ''

    await authStore.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Registration failed. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>
