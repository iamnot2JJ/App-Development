import { defineStore } from 'pinia'

export const useResourcesStore = defineStore('resources', {
  state: () => ({
    resources: [],
  }),

  getters: {
    getResourceById: (state) => (id) => {
      return state.resources.find((resource) => resource.id === id)
    },
  },

  actions: {
    initializeStore() {
      const storedResources = localStorage.getItem('resources')

      if (storedResources) {
        this.resources = JSON.parse(storedResources)
      } else {
        this.resources = [
          {
            id: 1,
            title: 'Healthcare Access Guide',
            description:
              'Comprehensive guide to accessing healthcare services as a migrant in Australia.',
            category: 'Healthcare',
            content:
              'This guide provides essential information about Medicare eligibility, bulk-billing clinics, and emergency services available to migrants.',
            createdAt: new Date().toISOString(),
            author: 'Migrant Health Team',
          },
          {
            id: 2,
            title: 'Mental Health Support Services',
            description:
              'Directory of mental health services specifically designed for migrant communities.',
            category: 'Mental Health',
            content:
              'Find culturally appropriate mental health services, including multilingual counselors and community support groups.',
            createdAt: new Date().toISOString(),
            author: 'Community Wellness Team',
          },
          {
            id: 3,
            title: 'Legal Rights and Services',
            description: 'Understanding your legal rights and available legal aid services.',
            category: 'Legal Aid',
            content:
              'Learn about your legal rights as a migrant, including workplace rights, housing rights, and access to legal assistance.',
            createdAt: new Date().toISOString(),
            author: 'Legal Advisory Team',
          },
        ]
        localStorage.setItem('resources', JSON.stringify(this.resources))
      }
    },

    addResource(resource) {
      const newResource = {
        id: Date.now(),
        ...resource,
        createdAt: new Date().toISOString(),
      }

      this.resources.push(newResource)
      localStorage.setItem('resources', JSON.stringify(this.resources))

      return newResource
    },

    updateResource(id, updatedResource) {
      const index = this.resources.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.resources[index] = { ...this.resources[index], ...updatedResource }
        localStorage.setItem('resources', JSON.stringify(this.resources))
      }
    },

    deleteResource(id) {
      this.resources = this.resources.filter((r) => r.id !== id)
      localStorage.setItem('resources', JSON.stringify(this.resources))
    },
  },
})
