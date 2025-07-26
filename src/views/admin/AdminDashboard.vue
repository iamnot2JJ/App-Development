<template>
  <div class="admin-dashboard">
    <div class="container py-5">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="display-5 fw-bold">Admin Dashboard</h1>
          <p class="text-muted">Manage resources and users</p>
        </div>
        <div class="admin-info">
          <span class="badge bg-success">Admin</span>
          <span class="ms-2">{{ authStore.user.firstName }} {{ authStore.user.lastName }}</span>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalUsers }}</h4>
                  <p class="mb-0">Total Users</p>
                </div>
                <i class="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalResources }}</h4>
                  <p class="mb-0">Resources</p>
                </div>
                <i class="fas fa-book fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalRatings }}</h4>
                  <p class="mb-0">Total Ratings</p>
                </div>
                <i class="fas fa-star fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.averageRating }}</h4>
                  <p class="mb-0">Avg Rating</p>
                </div>
                <i class="fas fa-chart-line fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            User Management
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'resources' }"
            @click="activeTab = 'resources'"
          >
            Resource Management
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'ratings' }"
            @click="activeTab = 'ratings'"
          >
            Ratings Overview
          </button>
        </li>
      </ul>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Registered Users</h5>
            <span class="badge bg-primary">{{ authStore.users.length }} users</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in authStore.users" :key="user.id">
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="user.role === 'admin' ? 'bg-danger' : 'bg-secondary'"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.registeredAt) }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="toggleUserRole(user)"
                        :disabled="user.id === authStore.user.id"
                      >
                        {{ user.role === 'admin' ? 'Demote' : 'Promote' }}
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteUser(user)"
                        :disabled="user.id === authStore.user.id"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Resources Tab -->
      <div v-if="activeTab === 'resources'" class="tab-content">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Resource Management</h5>
            <button class="btn btn-primary" @click="showAddResourceForm = !showAddResourceForm">
              <i class="fas fa-plus"></i> Add Resource
            </button>
          </div>
          <div class="card-body">
            <!-- Add Resource Form -->
            <div v-if="showAddResourceForm" class="border rounded p-3 mb-4 bg-light">
              <h6>Add New Resource</h6>
              <form @submit.prevent="addResource">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Resource Title"
                      v-model="newResource.title"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <select class="form-select" v-model="newResource.category" required>
                      <option value="">Select Category</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Legal Aid">Legal Aid</option>
                      <option value="Education">Education</option>
                      <option value="Employment">Employment</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <textarea
                    class="form-control"
                    placeholder="Resource Description"
                    v-model="newResource.description"
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div class="mb-3">
                  <textarea
                    class="form-control"
                    placeholder="Resource Content"
                    v-model="newResource.content"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success">Add Resource</button>
                  <button type="button" class="btn btn-secondary" @click="cancelAddResource">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Resources List -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Rating</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="resource in resourcesStore.resources" :key="resource.id">
                    <td>
                      <strong>{{ resource.title }}</strong>
                      <br />
                      <small class="text-muted"
                        >{{ resource.description.substring(0, 60) }}...</small
                      >
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ resource.category }}</span>
                    </td>
                    <td>{{ resource.author }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span class="stars me-2">
                          <span
                            v-for="star in 5"
                            :key="star"
                            class="star"
                            :class="{ filled: star <= ratingsStore.getAverageRating(resource.id) }"
                          >
                            ★
                          </span>
                        </span>
                        <small class="text-muted">
                          ({{ ratingsStore.getRatingCount(resource.id) }})
                        </small>
                      </div>
                    </td>
                    <td>{{ formatDate(resource.createdAt) }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="editResource(resource)"
                      >
                        Edit
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteResource(resource)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Ratings Tab -->
      <div v-if="activeTab === 'ratings'" class="tab-content">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Rating Distribution</h5>
              </div>
              <div class="card-body">
                <div
                  v-for="rating in [5, 4, 3, 2, 1]"
                  :key="rating"
                  class="d-flex align-items-center mb-2"
                >
                  <span class="me-2">{{ rating }} ★</span>
                  <div class="progress flex-grow-1 me-2">
                    <div
                      class="progress-bar"
                      :style="{ width: getRatingPercentage(rating) + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted">{{ getRatingCount(rating) }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Recent Ratings</h5>
              </div>
              <div class="card-body">
                <div
                  v-for="rating in recentRatings"
                  :key="rating.id"
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <div>
                    <div class="fw-bold">{{ getResourceTitle(rating.resourceId) }}</div>
                    <small class="text-muted">{{ formatDate(rating.createdAt) }}</small>
                  </div>
                  <div class="stars">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ filled: star <= rating.score }"
                    >
                      ★
                    </span>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useResourcesStore } from '../../stores/resources.js'
import { useRatingsStore } from '../../stores/ratings.js'

export default {
  name: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore()
    const resourcesStore = useResourcesStore()
    const ratingsStore = useRatingsStore()

    const activeTab = ref('users')
    const showAddResourceForm = ref(false)

    const newResource = reactive({
      title: '',
      category: '',
      description: '',
      content: '',
    })

    const stats = computed(() => ({
      totalUsers: authStore.users.length,
      totalResources: resourcesStore.resources.length,
      totalRatings: ratingsStore.ratings.length,
      averageRating:
        ratingsStore.ratings.length > 0
          ? (
              ratingsStore.ratings.reduce((sum, r) => sum + r.score, 0) /
              ratingsStore.ratings.length
            ).toFixed(1)
          : '0.0',
    }))

    const recentRatings = computed(() => {
      return ratingsStore.ratings
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    })

    const toggleUserRole = (user) => {
      if (user.id === authStore.user.id) return

      user.role = user.role === 'admin' ? 'user' : 'admin'
      localStorage.setItem('users', JSON.stringify(authStore.users))
    }

    const deleteUser = (user) => {
      if (user.id === authStore.user.id) return
      if (confirm('Are you sure you want to delete this user?')) {
        const index = authStore.users.findIndex((u) => u.id === user.id)
        if (index > -1) {
          authStore.users.splice(index, 1)
          localStorage.setItem('users', JSON.stringify(authStore.users))
        }
      }
    }

    const addResource = () => {
      if (
        !newResource.title ||
        !newResource.category ||
        !newResource.description ||
        !newResource.content
      ) {
        alert('Please fill in all fields')
        return
      }

      const sanitizedResource = {
        title: authStore.sanitizeInput(newResource.title.trim()),
        category: newResource.category,
        description: authStore.sanitizeInput(newResource.description.trim()),
        content: authStore.sanitizeInput(newResource.content.trim()),
        author: authStore.user.firstName + ' ' + authStore.user.lastName,
      }

      resourcesStore.addResource(sanitizedResource)

      // Reset form
      Object.keys(newResource).forEach((key) => {
        newResource[key] = ''
      })

      showAddResourceForm.value = false
    }

    const cancelAddResource = () => {
      Object.keys(newResource).forEach((key) => {
        newResource[key] = ''
      })
      showAddResourceForm.value = false
    }

    const editResource = (resource) => {
      // Simple implementation - in a real app, you'd open an edit modal
      const newTitle = prompt('Edit title:', resource.title)
      if (newTitle && newTitle.trim()) {
        resourcesStore.updateResource(resource.id, {
          title: authStore.sanitizeInput(newTitle.trim()),
        })
      }
    }

    const deleteResource = (resource) => {
      if (confirm('Are you sure you want to delete this resource?')) {
        resourcesStore.deleteResource(resource.id)
      }
    }

    const getRatingPercentage = (rating) => {
      const totalRatings = ratingsStore.ratings.length
      if (totalRatings === 0) return 0

      const count = ratingsStore.ratings.filter((r) => r.score === rating).length
      return (count / totalRatings) * 100
    }

    const getRatingCount = (rating) => {
      return ratingsStore.ratings.filter((r) => r.score === rating).length
    }

    const getResourceTitle = (resourceId) => {
      const resource = resourcesStore.resources.find((r) => r.id === resourceId)
      return resource ? resource.title : 'Unknown Resource'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    onMounted(() => {
      authStore.initializeStore()
      resourcesStore.initializeStore()
      ratingsStore.initializeStore()
    })

    return {
      authStore,
      resourcesStore,
      ratingsStore,
      activeTab,
      showAddResourceForm,
      newResource,
      stats,
      recentRatings,
      toggleUserRole,
      deleteUser,
      addResource,
      cancelAddResource,
      editResource,
      deleteResource,
      getRatingPercentage,
      getRatingCount,
      getResourceTitle,
      formatDate,
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.stars {
  color: #ddd;
}

.star.filled {
  color: #ffc107;
}

.progress {
  height: 8px;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #2c5aa0;
  border-bottom-color: #2c5aa0;
  background: none;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.775rem;
  }
}
</style>
