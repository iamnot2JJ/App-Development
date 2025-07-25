import { defineStore } from 'pinia'

export const useRatingsStore = defineStore('ratings', {
  state: () => ({
    ratings: [],
  }),

  getters: {
    getAverageRating: (state) => (resourceId) => {
      const resourceRatings = state.ratings.filter((r) => r.resourceId === resourceId)
      if (resourceRatings.length === 0) return 0

      const sum = resourceRatings.reduce((acc, rating) => acc + rating.score, 0)
      return Math.round((sum / resourceRatings.length) * 10) / 10
    },

    getRatingCount: (state) => (resourceId) => {
      return state.ratings.filter((r) => r.resourceId === resourceId).length
    },

    getUserRating: (state) => (resourceId, userId) => {
      return state.ratings.find((r) => r.resourceId === resourceId && r.userId === userId)
    },
  },

  actions: {
    initializeStore() {
      const storedRatings = localStorage.getItem('ratings')

      if (storedRatings) {
        this.ratings = JSON.parse(storedRatings)
      }
    },

    addRating(rating) {
      // Remove existing rating from same user for same resource
      this.ratings = this.ratings.filter(
        (r) => !(r.resourceId === rating.resourceId && r.userId === rating.userId),
      )

      const newRating = {
        id: Date.now(),
        ...rating,
        createdAt: new Date().toISOString(),
      }

      this.ratings.push(newRating)
      localStorage.setItem('ratings', JSON.stringify(this.ratings))

      return newRating
    },
  },
})
