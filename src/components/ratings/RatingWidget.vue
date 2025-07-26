<template>
  <div class="rating-widget">
    <div class="rating-display mb-2">
      <div class="stars">
        <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= averageRating }">
          ★
        </span>
      </div>
      <span class="rating-text ms-2">
        {{ averageRating.toFixed(1) }} ({{ ratingCount }}
        {{ ratingCount === 1 ? 'review' : 'reviews' }})
      </span>
    </div>

    <div v-if="authStore.isAuthenticated && !userRating" class="rating-form">
      <small class="text-muted d-block mb-2">Rate this resource:</small>
      <div class="stars interactive">
        <span
          v-for="star in 5"
          :key="star"
          class="star"
          :class="{ filled: star <= hoveredRating || star <= selectedRating }"
          @mouseover="hoveredRating = star"
          @mouseleave="hoveredRating = 0"
          @click="submitRating(star)"
        >
          ★
        </span>
      </div>
    </div>

    <div v-else-if="userRating" class="user-rating">
      <small class="text-success">
        Your rating:
        <span class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star small"
            :class="{ filled: star <= userRating.score }"
          >
            ★
          </span>
        </span>
      </small>
    </div>

    <div v-else class="login-prompt">
      <small class="text-muted">
        <router-link to="/auth">Login</router-link> to rate this resource
      </small>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useRatingsStore } from '../../stores/ratings.js'

export default {
  name: 'RatingWidget',
  props: {
    resourceId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const authStore = useAuthStore()
    const ratingsStore = useRatingsStore()

    const hoveredRating = ref(0)
    const selectedRating = ref(0)

    const averageRating = computed(() => {
      return ratingsStore.getAverageRating(props.resourceId)
    })

    const ratingCount = computed(() => {
      return ratingsStore.getRatingCount(props.resourceId)
    })

    const userRating = computed(() => {
      if (!authStore.user) return null
      return ratingsStore.getUserRating(props.resourceId, authStore.user.id)
    })

    const submitRating = async (score) => {
      if (!authStore.user) return

      try {
        await ratingsStore.addRating({
          resourceId: props.resourceId,
          userId: authStore.user.id,
          score: score,
        })

        selectedRating.value = score
      } catch (error) {
        console.error('Error submitting rating:', error)
      }
    }

    onMounted(() => {
      ratingsStore.initializeStore()
    })

    return {
      authStore,
      hoveredRating,
      selectedRating,
      averageRating,
      ratingCount,
      userRating,
      submitRating,
    }
  },
}
</script>

<style scoped>
.rating-widget {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

.stars {
  display: inline-block;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
  cursor: default;
}

.star.filled {
  color: #ffc107;
}

.stars.interactive .star {
  cursor: pointer;
  transition: color 0.2s;
}

.stars.interactive .star:hover {
  color: #ffeb3b;
}

.star.small {
  font-size: 0.9rem;
}

.rating-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.login-prompt a {
  color: #2c5aa0;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}
</style>
