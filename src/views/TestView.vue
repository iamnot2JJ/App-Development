<template>
  <div class="test-view">
    <div class="container py-5">
      <h1>Test Page</h1>
      <p>This is a simple test page to verify routing works.</p>
      <p>Current time: {{ currentTime }}</p>
      <div class="mt-3">
        <router-link to="/" class="btn btn-primary me-2">Go to Home</router-link>
        <router-link to="/about" class="btn btn-secondary me-2">Go to About</router-link>
        <router-link to="/resources" class="btn btn-success">Go to Resources</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'TestView',
  setup() {
    const currentTime = ref('')

    onMounted(() => {
      currentTime.value = new Date().toLocaleString()
    })

    return {
      currentTime,
    }
  },
}
</script>

<style scoped>
.test-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>
