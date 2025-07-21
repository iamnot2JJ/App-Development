<template>
  <div class="dashboard">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="fw-bold mb-1">Welcome, {{ userName }}</h1>
          <p class="lead text-muted mb-0">Here's your personalized dashboard</p>
        </div>
        <div class="text-end">
          <p class="mb-1">Last login: {{ formatDate(lastLogin) }}</p>
          <router-link to="/profile" class="btn btn-outline-primary btn-sm"
            >Edit Profile</router-link
          >
        </div>
      </div>

      <div class="row mb-5">
        <div class="col-md-4 mb-4 mb-md-0">
          <div class="card border-0 bg-primary text-white shadow">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Resources Viewed</h5>
                  <div class="display-4 fw-bold">24</div>
                </div>
                <i class="bi bi-journal-bookmark fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4 mb-md-0">
          <div class="card border-0 bg-success text-white shadow">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Your Ratings</h5>
                  <div class="display-4 fw-bold">8</div>
                </div>
                <i class="bi bi-star fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 bg-info text-white shadow">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Progress Streak</h5>
                  <div class="display-4 fw-bold">12</div>
                </div>
                <i class="bi bi-lightning-charge fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8 mb-5 mb-lg-0">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white border-0">
              <h3 class="fw-bold mb-0">Recently Viewed Resources</h3>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <a
                  v-for="resource in recentResources"
                  :key="resource.id"
                  href="#"
                  class="list-group-item list-group-item-action border-0"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ resource.title }}</h5>
                    <small class="text-muted">{{ formatDate(resource.viewedDate) }}</small>
                  </div>
                  <p class="mb-1 text-muted">{{ resource.description }}</p>
                  <div>
                    <span class="badge bg-primary me-1">{{ resource.category }}</span>
                    <span class="badge bg-light text-dark">
                      <i class="bi bi-star-fill text-warning me-1"></i>{{ resource.rating }}
                    </span>
                  </div>
                </a>
              </div>
            </div>
            <div class="card-footer bg-white border-0 text-end">
              <router-link to="/resources" class="btn btn-outline-primary"
                >View All Resources</router-link
              >
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-white border-0">
              <h3 class="fw-bold mb-0">Your Activity</h3>
            </div>
            <div class="card-body">
              <div class="activity-chart bg-light rounded p-3 mb-4" style="height: 200px">
                <!-- Chart placeholder -->
                <div class="d-flex align-items-center justify-content-center h-100">
                  <div class="text-center text-muted">
                    <i class="bi bi-bar-chart fs-1 mb-2"></i>
                    <p>Activity chart visualization</p>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold">Weekly Goal</h5>
                  <p class="mb-0">Complete 5 activities this week</p>
                </div>
                <div class="progress flex-grow-1 mx-4" style="height: 10px">
                  <div class="progress-bar bg-success" style="width: 60%"></div>
                </div>
                <span class="fw-bold">3/5</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white border-0">
              <h3 class="fw-bold mb-0">Recommended For You</h3>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <a
                  v-for="resource in recommendedResources"
                  :key="resource.id"
                  href="#"
                  class="list-group-item list-group-item-action border-0"
                >
                  <div class="d-flex align-items-center">
                    <div class="bg-primary rounded me-3" style="width: 40px; height: 40px"></div>
                    <div>
                      <h6 class="mb-0">{{ resource.title }}</h6>
                      <small class="text-muted">{{ resource.category }}</small>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-white border-0">
              <h3 class="fw-bold mb-0">Community Updates</h3>
            </div>
            <div class="card-body">
              <div class="d-flex mb-3">
                <div class="flex-shrink-0">
                  <div class="bg-secondary rounded-circle" style="width: 40px; height: 40px"></div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="fw-bold">New Support Group</h6>
                  <p class="small text-muted mb-0">
                    Join our new anxiety management group starting next week
                  </p>
                </div>
              </div>

              <div class="d-flex mb-3">
                <div class="flex-shrink-0">
                  <div class="bg-secondary rounded-circle" style="width: 40px; height: 40px"></div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="fw-bold">Expert Q&A Session</h6>
                  <p class="small text-muted mb-0">
                    Dr. Smith will answer your questions about mindfulness
                  </p>
                </div>
              </div>

              <div class="d-flex">
                <div class="flex-shrink-0">
                  <div class="bg-secondary rounded-circle" style="width: 40px; height: 40px"></div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="fw-bold">New Resources Added</h6>
                  <p class="small text-muted mb-0">
                    Check out our latest resources on building resilience
                  </p>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-0">
              <a href="#" class="btn btn-outline-primary w-100">View All Updates</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userName = computed(() => authStore.user?.name || 'User')
const lastLogin = computed(() => new Date())

const recentResources = ref([
  {
    id: 'res-005',
    title: 'Breathing Techniques for Stress Relief',
    description: 'Simple breathing exercises to reduce stress in minutes',
    category: 'Stress Management',
    rating: 4.7,
    viewedDate: new Date(2025, 6, 18),
  },
  {
    id: 'res-003',
    title: 'Mindful Eating Practices',
    description: 'How to develop a healthier relationship with food',
    category: 'Mindfulness',
    rating: 4.5,
    viewedDate: new Date(2025, 6, 15),
  },
  {
    id: 'res-008',
    title: 'Building Emotional Resilience',
    description: 'Strategies to strengthen your emotional resilience',
    category: 'Resilience',
    rating: 4.8,
    viewedDate: new Date(2025, 6, 10),
  },
])

const recommendedResources = ref([
  { id: 'rec-001', title: 'Sleep Hygiene Guide', category: 'Wellness' },
  { id: 'rec-002', title: 'Managing Social Anxiety', category: 'Anxiety' },
  { id: 'rec-003', title: 'Journaling for Mental Health', category: 'Self-Care' },
  { id: 'rec-004', title: 'Cognitive Behavioral Techniques', category: 'Therapy' },
])

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.dashboard .card {
  border-radius: 12px;
  overflow: hidden;
}

.list-group-item {
  padding: 1.25rem 0;
  border-bottom: 1px solid #eee;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>
