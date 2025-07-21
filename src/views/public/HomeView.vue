<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section bg-primary text-white py-5">
      <div class="container py-5">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Mental Health Support When You Need It</h1>
            <p class="lead mb-4">
              Access free resources, connect with professionals, and find community support for your
              mental health journey.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <router-link to="/resources" class="btn btn-light btn-lg px-4"
                >Explore Resources</router-link
              >
              <router-link
                v-if="!isAuthenticated"
                to="/register"
                class="btn btn-outline-light btn-lg px-4"
                >Join Our Community</router-link
              >
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <div class="position-relative">
              <div
                class="rounded-circle bg-light opacity-25 position-absolute top-0 start-0"
                style="width: 300px; height: 300px"
              ></div>
              <div
                class="rounded-circle bg-light opacity-25 position-absolute bottom-0 end-0"
                style="width: 200px; height: 200px"
              ></div>
              <img
                src="@/assets/hero-image.png"
                alt="Mental Health Support"
                class="img-fluid position-relative"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Resources Section -->
    <section class="py-5">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Featured Resources</h2>
          <p class="lead text-muted">Discover our most helpful mental health resources</p>
        </div>

        <div class="row g-4">
          <div v-for="resource in featuredResources" :key="resource.id" class="col-md-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <span class="badge bg-primary mb-2">{{ resource.category }}</span>
                <h5 class="card-title">{{ resource.title }}</h5>
                <p class="card-text text-muted">{{ resource.description }}</p>
              </div>
              <div class="card-footer bg-white border-0">
                <router-link :to="`/resources#${resource.id}`" class="btn btn-outline-primary"
                  >Read More</router-link
                >
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5">
          <router-link to="/resources" class="btn btn-primary px-4">View All Resources</router-link>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="bg-light py-5">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Community Stories</h2>
          <p class="lead text-muted">Hear from people who found support through our platform</p>
        </div>

        <div class="row g-4">
          <div v-for="(testimonial, index) in testimonials" :key="index" class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <div
                    class="bg-secondary rounded-circle me-3"
                    style="width: 50px; height: 50px"
                  ></div>
                  <div>
                    <h6 class="mb-0">{{ testimonial.name }}</h6>
                    <small class="text-muted">{{ testimonial.role }}</small>
                  </div>
                </div>
                <p class="card-text">"{{ testimonial.content }}"</p>
                <div class="rating mt-3">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ active: star <= testimonial.rating }"
                    >★</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-5 bg-primary text-white">
      <div class="container py-5 text-center">
        <h2 class="fw-bold mb-4">Join Our Support Community Today</h2>
        <p class="lead mb-4">
          Register now to access personalized resources, track your progress, and connect with
          others
        </p>
        <router-link v-if="!isAuthenticated" to="/register" class="btn btn-light btn-lg px-5"
          >Get Started</router-link
        >
        <router-link v-else to="/dashboard" class="btn btn-light btn-lg px-5"
          >Go to Dashboard</router-link
        >
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const featuredResources = ref([
  {
    id: 'res-001',
    title: 'Managing Anxiety in Daily Life',
    description: 'Practical techniques to reduce anxiety and improve your daily functioning.',
    category: 'Anxiety',
  },
  {
    id: 'res-002',
    title: 'Mindfulness Meditation Guide',
    description: 'Step-by-step guide to starting your mindfulness meditation practice.',
    category: 'Mindfulness',
  },
  {
    id: 'res-003',
    title: 'Building Resilience During Tough Times',
    description: 'Learn how to develop resilience and cope with challenging situations.',
    category: 'Resilience',
  },
])

const testimonials = ref([
  {
    name: 'Sarah T.',
    role: 'Community Member',
    content:
      'The resources here helped me understand my anxiety better and gave me practical tools to manage it.',
    rating: 5,
  },
  {
    name: 'James L.',
    role: 'Support Volunteer',
    content:
      'As a volunteer, I appreciate how easy it is to connect with those in need of support through this platform.',
    rating: 4,
  },
  {
    name: 'Emma K.',
    role: 'Therapist',
    content:
      'This platform provides valuable resources that complement my therapy sessions with clients.',
    rating: 5,
  },
])
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.active {
  color: gold;
}

.card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: none;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
