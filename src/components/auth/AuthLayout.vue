<template>
  <div class="auth-layout bg-light">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="text-center mb-5">
            <router-link to="/">
              <img src="@/assets/logo.png" alt="MindCare Logo" height="60" class="mb-3" />
            </router-link>
            <h2 class="fw-bold">{{ title }}</h2>
            <p class="text-muted">{{ subtitle }}</p>
          </div>

          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
              <slot></slot>
            </div>
          </div>

          <div class="text-center mt-4">
            <p class="text-muted mb-0">{{ footerText }}</p>
            <router-link :to="footerLink" class="fw-medium">{{ footerLinkText }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Authentication',
  },
  subtitle: {
    type: String,
    default: 'Access your account',
  },
  footerText: {
    type: String,
    default: 'Already have an account?',
  },
  footerLinkText: {
    type: String,
    default: 'Sign in',
  },
  footerLink: {
    type: String,
    default: '/login',
  },
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
