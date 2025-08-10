<template>
  <div class="not-found-container">
    <div class="container-fluid py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6 text-center">
          <div class="error-content">
            <!-- Error illustration -->
            <div class="error-illustration mb-4">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-labelledby="error-title"
              >
                <title id="error-title">404 Error Illustration</title>
                <circle cx="100" cy="100" r="80" stroke="#e9ecef" stroke-width="2" fill="none" />
                <path
                  d="M70 70 L130 130 M130 70 L70 130"
                  stroke="#dc3545"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <text
                  x="100"
                  y="170"
                  text-anchor="middle"
                  font-size="24"
                  font-weight="bold"
                  fill="#6c757d"
                >
                  404
                </text>
              </svg>
            </div>

            <h1 class="display-4 fw-bold text-primary mb-3">Page Not Found</h1>

            <p class="lead text-muted mb-4">
              We're sorry, but the page you're looking for doesn't exist or has been moved.
            </p>

            <div class="error-actions">
              <button @click="goHome" class="btn btn-primary btn-lg me-3 mb-2" type="button">
                <i class="fas fa-home me-2" aria-hidden="true"></i>
                Go Home
              </button>

              <button @click="goBack" class="btn btn-outline-secondary btn-lg mb-2" type="button">
                <i class="fas fa-arrow-left me-2" aria-hidden="true"></i>
                Go Back
              </button>
            </div>

            <!-- Search suggestions -->
            <div class="search-suggestions mt-5">
              <h3 class="h5 mb-3">You might be looking for:</h3>
              <div class="row g-3">
                <div class="col-6 col-md-4">
                  <router-link
                    to="/"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-home text-primary mb-2 d-block"></i>
                    <small class="text-muted">Home</small>
                  </router-link>
                </div>

                <div class="col-6 col-md-4">
                  <router-link
                    to="/resources"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-book text-primary mb-2 d-block"></i>
                    <small class="text-muted">Resources</small>
                  </router-link>
                </div>

                <div class="col-6 col-md-4">
                  <router-link
                    to="/map"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-map-marker-alt text-primary mb-2 d-block"></i>
                    <small class="text-muted">Healthcare Map</small>
                  </router-link>
                </div>

                <div class="col-6 col-md-4">
                  <router-link
                    to="/appointments"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-calendar-alt text-primary mb-2 d-block"></i>
                    <small class="text-muted">Appointments</small>
                  </router-link>
                </div>

                <div class="col-6 col-md-4">
                  <router-link
                    to="/about"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-info-circle text-primary mb-2 d-block"></i>
                    <small class="text-muted">About Us</small>
                  </router-link>
                </div>

                <div class="col-6 col-md-4">
                  <router-link
                    to="/auth"
                    class="suggestion-card d-block p-3 text-decoration-none border rounded hover-lift"
                  >
                    <i class="fas fa-sign-in-alt text-primary mb-2 d-block"></i>
                    <small class="text-muted">Sign In</small>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Contact support -->
            <div class="contact-support mt-5 p-4 bg-light rounded">
              <h3 class="h6 mb-2">Still need help?</h3>
              <p class="text-muted mb-3">
                If you believe this is an error or need assistance, please contact our support team.
              </p>
              <a
                href="mailto:support@migranthealthcharity.org"
                class="btn btn-sm btn-outline-primary"
              >
                <i class="fas fa-envelope me-1" aria-hidden="true"></i>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 2) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Accessibility: Focus management
onMounted(() => {
  // Announce to screen readers
  const announcement = 'Page not found. You are on the 404 error page.'
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', 'assertive')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  liveRegion.textContent = announcement
  document.body.appendChild(liveRegion)

  setTimeout(() => {
    document.body.removeChild(liveRegion)
  }, 2000)
})
</script>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.error-content {
  animation: fadeInUp 0.6s ease-out;
}

.error-illustration svg {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.suggestion-card {
  transition: all 0.2s ease;
  background: white;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: inherit;
}

.suggestion-card i {
  font-size: 1.5rem;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.contact-support {
  border: 1px solid #dee2e6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .not-found-container {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }

  .suggestion-card {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .contact-support {
    background: #2d3748;
    border-color: #4a5568;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .suggestion-card {
    border-width: 2px;
  }

  .suggestion-card:hover {
    border-color: #0066cc;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .error-content,
  .suggestion-card,
  .hover-lift:hover {
    animation: none;
    transition: none;
    transform: none;
  }
}

/* Print styles */
@media print {
  .not-found-container {
    background: white;
    min-height: auto;
  }

  .error-actions,
  .search-suggestions,
  .contact-support {
    display: none;
  }
}
</style>
