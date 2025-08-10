<template>
  <div class="resources-view">
    <div class="container py-5">
      <!-- Header -->
      <div class="text-center mb-5">
        <h1 class="display-4 fw-bold">Community Resources</h1>
        <p class="lead text-secondary">
          Comprehensive resources to support migrant communities in Australia
        </p>
      </div>

      <!-- Search and Filter -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Search resources..."
              v-model="searchQuery"
              @input="validateSearch"
            />
            <button class="btn btn-outline-primary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div class="text-danger mt-1" v-if="searchError">
            {{ searchError }}
          </div>
        </div>
        <div class="col-md-4">
          <select class="form-select" v-model="selectedCategory">
            <option value="">All Categories</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Legal Aid">Legal Aid</option>
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
          </select>
        </div>
      </div>

      <!-- Resources Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="resource in filteredResources" :key="resource.id">
          <div class="card h-100 shadow-sm resource-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary">{{ resource.category }}</span>
                <small class="text-secondary">{{ formatDate(resource.createdAt) }}</small>
              </div>

              <h5 class="card-title">{{ resource.title }}</h5>
              <p class="card-text">{{ resource.description }}</p>

              <div class="resource-content mb-3">
                <SanitizedContent :content="resource.content.substring(0, 150) + '...'" />
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <small class="text-secondary">By {{ resource.author }}</small>
                <button class="btn btn-sm btn-outline-primary" @click="toggleExpanded(resource.id)">
                  {{ expandedResources.includes(resource.id) ? 'Show Less' : 'Read More' }}
                </button>
              </div>

              <!-- Expanded Content -->
              <div v-if="expandedResources.includes(resource.id)" class="expanded-content mb-3">
                <hr />
                <SanitizedContent :content="resource.content" />
              </div>

              <!-- Rating Widget -->
              <RatingWidget :resourceId="resource.id" />
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredResources.length === 0" class="text-center py-5">
        <i class="fas fa-search display-1 text-secondary mb-3"></i>
        <h3>No resources found</h3>
        <p class="text-secondary">Try adjusting your search criteria or browse all resources.</p>
        <button class="btn btn-primary" @click="clearFilters">Clear Filters</button>
      </div>

      <!-- Add Resource Button (Admin Only) -->
      <div class="text-center mt-5" v-if="authStore.isAdmin">
        <button class="btn btn-success btn-lg" @click="showAddForm = !showAddForm">
          <i class="fas fa-plus"></i> Add New Resource
        </button>
      </div>

      <!-- Add Resource Form (Admin Only) -->
      <div v-if="showAddForm && authStore.isAdmin" class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">Add New Resource</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="addResource">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Title</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': newResourceErrors.title }"
                  v-model="newResource.title"
                  required
                />
                <div class="invalid-feedback" v-if="newResourceErrors.title">
                  {{ newResourceErrors.title }}
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Category</label>
                <select
                  class="form-select"
                  :class="{ 'is-invalid': newResourceErrors.category }"
                  v-model="newResource.category"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Legal Aid">Legal Aid</option>
                  <option value="Education">Education</option>
                  <option value="Employment">Employment</option>
                </select>
                <div class="invalid-feedback" v-if="newResourceErrors.category">
                  {{ newResourceErrors.category }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                class="form-control"
                :class="{ 'is-invalid': newResourceErrors.description }"
                v-model="newResource.description"
                rows="3"
                required
              ></textarea>
              <div class="invalid-feedback" v-if="newResourceErrors.description">
                {{ newResourceErrors.description }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Content</label>
              <textarea
                class="form-control"
                :class="{ 'is-invalid': newResourceErrors.content }"
                v-model="newResource.content"
                rows="6"
                required
              ></textarea>
              <div class="invalid-feedback" v-if="newResourceErrors.content">
                {{ newResourceErrors.content }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Author</label>
              <input type="text" class="form-control" v-model="newResource.author" required />
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-success">Add Resource</button>
              <button type="button" class="btn btn-secondary" @click="cancelAdd">Cancel</button>
            </div>
          </form>
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
import RatingWidget from '../../components/ratings/RatingWidget.vue'
import SanitizedContent from '../../components/security/SanitizedContent.vue'

export default {
  name: 'ResourcesView',
  components: {
    RatingWidget,
    SanitizedContent,
  },
  setup() {
    const authStore = useAuthStore()
    const resourcesStore = useResourcesStore()
    const ratingsStore = useRatingsStore()

    const searchQuery = ref('')
    const selectedCategory = ref('')
    const expandedResources = ref([])
    const showAddForm = ref(false)
    const searchError = ref('')

    const newResource = reactive({
      title: '',
      category: '',
      description: '',
      content: '',
      author: '',
    })

    const newResourceErrors = reactive({})

    const filteredResources = computed(() => {
      let filtered = resourcesStore.resources

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (resource) =>
            resource.title.toLowerCase().includes(query) ||
            resource.description.toLowerCase().includes(query) ||
            resource.content.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        filtered = filtered.filter((resource) => resource.category === selectedCategory.value)
      }

      return filtered
    })

    const validateSearch = () => {
      searchError.value = ''

      if (searchQuery.value.length > 0 && searchQuery.value.length < 2) {
        searchError.value = 'Search query must be at least 2 characters long'
      }

      // Basic XSS prevention
      if (/<script|javascript:|on\w+=/i.test(searchQuery.value)) {
        searchError.value = 'Invalid search query'
        searchQuery.value = searchQuery.value.replace(/<script|javascript:|on\w+=/gi, '')
      }
    }

    const validateNewResource = () => {
      const errors = {}

      if (!newResource.title.trim()) {
        errors.title = 'Title is required'
      } else if (newResource.title.length < 5) {
        errors.title = 'Title must be at least 5 characters long'
      }

      if (!newResource.category) {
        errors.category = 'Category is required'
      }

      if (!newResource.description.trim()) {
        errors.description = 'Description is required'
      } else if (newResource.description.length < 20) {
        errors.description = 'Description must be at least 20 characters long'
      }

      if (!newResource.content.trim()) {
        errors.content = 'Content is required'
      } else if (newResource.content.length < 50) {
        errors.content = 'Content must be at least 50 characters long'
      }

      Object.assign(newResourceErrors, errors)
      return Object.keys(errors).length === 0
    }

    const addResource = () => {
      // Clear previous errors
      Object.keys(newResourceErrors).forEach((key) => delete newResourceErrors[key])

      if (!validateNewResource()) return

      try {
        // Sanitize inputs
        const sanitizedResource = {
          title: authStore.sanitizeInput(newResource.title.trim()),
          category: newResource.category,
          description: authStore.sanitizeInput(newResource.description.trim()),
          content: authStore.sanitizeInput(newResource.content.trim()),
          author: authStore.sanitizeInput(
            newResource.author.trim() || authStore.user.firstName + ' ' + authStore.user.lastName
          ),
        }

        resourcesStore.addResource(sanitizedResource)

        // Reset form
        Object.keys(newResource).forEach((key) => {
          newResource[key] = ''
        })

        showAddForm.value = false
      } catch (error) {
        console.error('Error adding resource:', error)
      }
    }

    const cancelAdd = () => {
      showAddForm.value = false
      Object.keys(newResource).forEach((key) => {
        newResource[key] = ''
      })
      Object.keys(newResourceErrors).forEach((key) => delete newResourceErrors[key])
    }

    const toggleExpanded = (resourceId) => {
      const index = expandedResources.value.indexOf(resourceId)
      if (index > -1) {
        expandedResources.value.splice(index, 1)
      } else {
        expandedResources.value.push(resourceId)
      }
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      searchError.value = ''
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
      searchQuery,
      selectedCategory,
      expandedResources,
      showAddForm,
      searchError,
      newResource,
      newResourceErrors,
      filteredResources,
      validateSearch,
      addResource,
      cancelAdd,
      toggleExpanded,
      clearFilters,
      formatDate,
    }
  },
}
</script>

<style scoped>
.resource-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.expanded-content {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

.resource-content {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Enhanced text readability */
.card-title {
  color: #2c3e50 !important;
  font-weight: 600;
}

.card-text {
  color: #495057 !important;
  line-height: 1.6;
}

.display-4 {
  color: #2c3e50 !important;
}

.lead {
  color: #6c757d !important;
  font-weight: 500;
}

.text-secondary {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .col-md-8,
  .col-md-4 {
    margin-bottom: 1rem;
  }
}
</style>
