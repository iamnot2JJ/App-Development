<template>
  <div class="api-access-view container py-5">
    <h1 class="mb-4">API Access</h1>
    <div class="card shadow mb-4">
      <div class="card-body">
        <h5>Public API Endpoints</h5>
        <ul>
          <li><strong>GET /api/resources</strong> - Get all resources</li>
          <li><strong>GET /api/resources/:id</strong> - Get resource by ID</li>
        </ul>
        <div class="mt-4">
          <label for="resourceId" class="form-label">Test Resource API:</label>

          <input
            id="resourceId"
            v-model="resourceId"
            t
            y
            pe="number"
            class="form-c o ntrol mb-2"
            placeholder="Enter
r         esource ID"
          />
          <button
            class="btn btn-primary me-2"
            @click="
              fetchA
              llResources
            "
          >
            Fetch All Resources
          </button>
          <button class="btn btn-success" @click="fetchResourceById">Fetch Resource By ID</button>
        </div>
      </div>
    </div>
    <div v-if="apiResult" class="alert alert-info mt-3">
      <pre>{{ apiResult }}</pre>
    </div>
    <div v-if="apiError" class="alert alert-danger mt-3">{{ apiError }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ApiAccessView',
  setup() {
    const resourceId = ref('')
    const apiResult = ref('')
    const apiError = ref('')

    async function fetchAllResources() {
      apiResult.value = ''
      apiError.value = ''
      try {
        const res = await fetch('/api/resources')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        apiResult.value = JSON.stringify(data, null, 2)
      } catch (e) {
        apiError.value = 'Failed to fetch resources.'
      }
    }

    async function fetchResourceById() {
      apiResult.value = ''
      apiError.value = ''
      if (!resourceId.value) {
        apiError.value = 'Please enter a resource ID.'
        return
      }
      try {
        const res = await fetch(`/api/resources/${resourceId.value}`)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        apiResult.value = JSON.stringify(data, null, 2)
      } catch (e) {
        apiError.value = 'Failed to fetch resource.'
      }
    }

    return {
      resourceId,
      apiResult,
      apiError,
      fetchAllResources,
      fetchResourceById,
    }
  },
}
</script>

<style scoped>
.api-access-view {
  min-height: 300px;
}
pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}
</style>
