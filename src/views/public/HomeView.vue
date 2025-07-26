<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-4 fw-bold mb-4">Welcome to MigrantCare</h1>
            <p class="lead mb-4">
              Supporting migrant communities with essential health resources, mental wellness
              support, and community connections across Australia.
            </p>
            <div class="d-flex gap-3">
              <router-link to="/resources" class="btn btn-light btn-lg">
                Explore Resources
              </router-link>
              <router-link
                to="/auth"
                class="btn btn-outline-light btn-lg"
                v-if="!authStore.isAuthenticated"
              >
                Join Community
              </router-link>
            </div>
          </div>
          <div class="col-md-6">
            <div class="hero-stats bg-white text-dark p-4 rounded shadow">
              <h3 class="text-primary mb-3">Community Impact</h3>
              <div class="row text-center">
                <div class="col-4">
                  <h4 class="text-primary">{{ stats.totalUsers }}</h4>
                  <small>Community Members</small>
                </div>
                <div class="col-4">
                  <h4 class="text-primary">{{ stats.totalResources }}</h4>
                  <small>Resources Available</small>
                </div>
                <div class="col-4">
                  <h4 class="text-primary">{{ stats.averageRating }}</h4>
                  <small>Average Rating</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-6 fw-bold">Our Services</h2>
          <p class="lead text-muted">Comprehensive support for migrant communities</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-for="service in services" :key="service.id">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <div class="service-icon mb-3">
                  <i :class="service.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ service.title }}</h5>
                <p class="card-text">{{ service.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Resources -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="display-6 fw-bold">Latest Resources</h2>
          <router-link to="/resources" class="btn btn-primary"> View All Resources </router-link>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-for="resource in latestResources" :key="resource.id">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <span class="badge bg-secondary mb-2">{{ resource.category }}</span>
                <h5 class="card-title">{{ resource.title }}</h5>
                <p class="card-text">{{ resource.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">By {{ resource.author }}</small>
                  <div class="rating-preview">
                    <span class="stars">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="star"
                        :class="{ filled: star <= ratingsStore.getAverageRating(resource.id) }"
                      >
                        ★
                      </span>
                    </span>
                    <small class="text-muted ms-1">
                      ({{ ratingsStore.getRatingCount(resource.id) }})
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-5 bg-primary text-white">
      <div class="container text-center">
        <h2 class="display-6 fw-bold mb-4">Ready to Get Started?</h2>
        <p class="lead mb-4">
          Join our community and access resources tailored for migrant families
        </p>
        <router-link to="/auth" class="btn btn-light btn-lg" v-if="!authStore.isAuthenticated">
          Create Your Account
        </router-link>
        <router-link to="/resources" class="btn btn-light btn-lg" v-else>
          Browse Resources
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useResourcesStore } from '../../stores/resources.js'
import { useRatingsStore } from '../../stores/ratings.js'

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore()
    const resourcesStore = useResourcesStore()
    const ratingsStore = useRatingsStore()

    const services = [
      {
        id: 1,
        title: 'Healthcare Access',
        description:
          'Navigate the Australian healthcare system with confidence. Find bulk-billing clinics, understand Medicare, and access emergency services.',
        icon: 'fas fa-heart',
      },
      {
        id: 2,
        title: 'Mental Health Support',
        description:
          'Access culturally appropriate mental health services, counseling, and community support groups designed for migrant communities.',
        icon: 'fas fa-brain',
      },
      {
        id: 3,
        title: 'Legal Assistance',
        description:
          'Understand your rights and access legal aid services. Get help with workplace rights, housing, and immigration matters.',
        icon: 'fas fa-balance-scale',
      },
    ]

    const stats = computed(() => ({
      totalUsers: authStore.users.length,
      totalResources: resourcesStore.resources.length,
      averageRating:
        resourcesStore.resources.length > 0
          ? (
              resourcesStore.resources.reduce(
                (sum, resource) => sum + ratingsStore.getAverageRating(resource.id),
                0,
              ) / resourcesStore.resources.length
            ).toFixed(1)
          : '0.0',
    }))

    const latestResources = computed(() => {
      return resourcesStore.resources.slice(0, 3)
    })

    onMounted(() => {
      authStore.initializeStore()
      resourcesStore.initializeStore()
      ratingsStore.initializeStore()
    })

    return {
      authStore,
      resourcesStore,
      ratingsStore,
      services,
      stats,
      latestResources,
    }
  },
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3f73 100%);
}

.hero-stats {
  backdrop-filter: blur(10px);
}

.service-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.stars {
  color: #ddd;
}

.star.filled {
  color: #ffc107;
}

@media (max-width: 768px) {
  .hero-section {
    text-align: center;
  }

  .hero-stats {
    margin-top: 2rem;
  }
}
</style>
