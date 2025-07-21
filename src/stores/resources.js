import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveToStorage, getFromStorage } from '@/utils/storage'

export const useResourcesStore = defineStore('resources', () => {
  const resources = ref(getFromStorage('resources') || [])

  // Initialize with sample data if empty
  if (resources.value.length === 0) {
    resources.value = [
      {
        id: 'res-001',
        title: 'Managing Anxiety in Daily Life',
        content: 'Practical techniques to reduce anxiety and improve your daily functioning...',
        category: 'Anxiety',
        date: new Date(2025, 5, 15),
        views: 42,
      },
      {
        id: 'res-002',
        title: 'Mindfulness Meditation Guide',
        content: 'Step-by-step guide to starting your mindfulness meditation practice...',
        category: 'Mindfulness',
        date: new Date(2025, 4, 22),
        views: 35,
      },
      {
        id: 'res-003',
        title: 'Building Resilience During Tough Times',
        content: 'Learn how to develop resilience and cope with challenging situations...',
        category: 'Resilience',
        date: new Date(2025, 6, 1),
        views: 28,
      },
    ]
    saveToStorage('resources', resources.value)
  }

  // Get all resources
  const allResources = computed(() => resources.value)

  // Get featured resources (top viewed)
  const featuredResources = computed(() => {
    return [...resources.value].sort((a, b) => b.views - a.views).slice(0, 3)
  })

  // Get resources by category
  const resourcesByCategory = (category) => {
    return resources.value.filter((resource) => resource.category === category)
  }

  // Get resource by ID
  const getResourceById = (id) => {
    return resources.value.find((resource) => resource.id === id)
  }

  // Add a new resource
  const addResource = (resource) => {
    resource.id = `res-${Date.now().toString().slice(-6)}`
    resource.date = new Date()
    resource.views = 0
    resources.value.unshift(resource)
    saveToStorage('resources', resources.value)
    return resource.id
  }

  // Update a resource
  const updateResource = (id, updates) => {
    const index = resources.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      resources.value[index] = { ...resources.value[index], ...updates }
      saveToStorage('resources', resources.value)
      return true
    }
    return false
  }

  // Increment view count for a resource
  const incrementViewCount = (id) => {
    const resource = getResourceById(id)
    if (resource) {
      resource.views = (resource.views || 0) + 1
      saveToStorage('resources', resources.value)
    }
  }

  // Get all categories
  const allCategories = computed(() => {
    const categories = new Set()
    resources.value.forEach((resource) => categories.add(resource.category))
    return Array.from(categories)
  })

  return {
    resources,
    allResources,
    featuredResources,
    resourcesByCategory,
    getResourceById,
    addResource,
    updateResource,
    incrementViewCount,
    allCategories,
  }
})
