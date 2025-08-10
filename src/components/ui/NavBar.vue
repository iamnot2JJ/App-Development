<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="container">
      <!-- Brand/Logo -->
      <router-link class="navbar-brand fw-bold" to="/" @click="closeNavbar">
        <i class="fas fa-heart text-light me-2" aria-hidden="true"></i>
        <span class="brand-text">MigrantCare</span>
      </router-link>

      <!-- Mobile toggle button -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation menu"
        @click="toggleNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation content -->
      <div class="collapse navbar-collapse" id="navbarNav" ref="navbarCollapse">
        <!-- Main navigation links -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link
              to="/"
              class="nav-link"
              :class="{ active: $route.name === 'Home' }"
              @click="closeNavbar"
            >
              <i class="fas fa-home me-1" aria-hidden="true"></i>
              Home
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/resources"
              class="nav-link"
              :class="{ active: $route.name === 'Resources' }"
              @click="closeNavbar"
            >
              <i class="fas fa-book me-1" aria-hidden="true"></i>
              Resources
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/map"
              class="nav-link"
              :class="{ active: $route.name === 'Map' }"
              @click="closeNavbar"
            >
              <i class="fas fa-map-marker-alt me-1" aria-hidden="true"></i>
              Healthcare Map
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/ai-chat"
              class="nav-link"
              :class="{ active: $route.name === 'AIChatPage' }"
              @click="closeNavbar"
            >
              <i class="fas fa-robot me-1" aria-hidden="true"></i>
              AI Assistant
            </router-link>
          </li>

          <!-- Authenticated user links -->
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <router-link
                to="/appointments"
                class="nav-link"
                :class="{ active: $route.name === 'Appointments' }"
                @click="closeNavbar"
              >
                <i class="fas fa-calendar-alt me-1" aria-hidden="true"></i>
                Appointments
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                to="/data-tables"
                class="nav-link"
                :class="{ active: $route.name === 'DataTables' }"
                @click="closeNavbar"
              >
                <i class="fas fa-table me-1" aria-hidden="true"></i>
                Data Tables
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                to="/export"
                class="nav-link"
                :class="{ active: $route.name === 'Export' }"
                @click="closeNavbar"
              >
                <i class="fas fa-download me-1" aria-hidden="true"></i>
                Export
              </router-link>
            </li>
          </template>

          <li class="nav-item">
            <router-link
              to="/about"
              class="nav-link"
              :class="{ active: $route.name === 'About' }"
              @click="closeNavbar"
            >
              <i class="fas fa-info-circle me-1" aria-hidden="true"></i>
              About
            </router-link>
          </li>

          <!-- Admin link -->
          <li class="nav-item" v-if="authStore.isAdmin">
            <router-link
              to="/admin"
              class="nav-link"
              :class="{ active: $route.name === 'AdminDashboard' }"
              @click="closeNavbar"
            >
              <i class="fas fa-cog me-1" aria-hidden="true"></i>
              Admin
            </router-link>
          </li>
        </ul>

        <!-- User authentication section -->
        <ul class="navbar-nav">
          <!-- Login link for unauthenticated users -->
          <li class="nav-item" v-if="!authStore.isAuthenticated">
            <router-link
              to="/auth"
              class="nav-link btn btn-outline-light btn-sm px-3"
              @click="closeNavbar"
            >
              <i class="fas fa-sign-in-alt me-1" aria-hidden="true"></i>
              Sign In
            </router-link>
          </li>

          <!-- User dropdown for authenticated users -->
          <li class="nav-item dropdown" v-else>
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              :aria-label="`User menu for ${
                authStore.user?.displayName || authStore.user?.firstName || 'User'
              }`"
            >
              <!-- User avatar or icon -->
              <div class="user-avatar me-2">
                <img
                  v-if="authStore.user?.photoURL"
                  :src="authStore.user.photoURL"
                  :alt="`${
                    authStore.user.displayName || authStore.user.firstName || 'User'
                  } avatar`"
                  class="rounded-circle"
                  width="32"
                  height="32"
                />
                <i v-else class="fas fa-user-circle" aria-hidden="true"></i>
              </div>
              <span class="user-name">
                {{ authStore.user?.displayName || authStore.user?.firstName || 'User' }}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end">
              <!-- User info -->
              <li>
                <h6 class="dropdown-header">
                  <i class="fas fa-user me-1" aria-hidden="true"></i>
                  {{ authStore.user?.displayName || authStore.user?.firstName || 'User' }}
                </h6>
              </li>
              <li>
                <span class="dropdown-item-text text-muted small">
                  <i class="fas fa-shield-alt me-1" aria-hidden="true"></i>
                  {{ authStore.user?.role || 'User' }}
                </span>
              </li>
              <li><hr class="dropdown-divider" /></li>

              <!-- Profile link (if implemented) -->
              <li>
                <a class="dropdown-item" href="#" @click.prevent="goToProfile">
                  <i class="fas fa-user-edit me-2" aria-hidden="true"></i>
                  Profile Settings
                </a>
              </li>

              <li><hr class="dropdown-divider" /></li>

              <!-- Logout -->
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                  <i class="fas fa-sign-out-alt me-2" aria-hidden="true"></i>
                  Sign Out
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Spacer for fixed navbar -->
  <div class="navbar-spacer"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navbarCollapse = ref(null)
const isNavbarOpen = ref(false)

// Close navbar on mobile after navigation
const closeNavbar = () => {
  if (navbarCollapse.value && window.innerWidth < 992) {
    const bsCollapse = new bootstrap.Collapse(navbarCollapse.value, {
      toggle: false,
    })
    bsCollapse.hide()
    isNavbarOpen.value = false
  }
}

// Toggle navbar state
const toggleNavbar = () => {
  isNavbarOpen.value = !isNavbarOpen.value
}

// Logout function
const logout = async () => {
  try {
    await authStore.logout()
    closeNavbar()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Profile function (placeholder)
const goToProfile = () => {
  closeNavbar()
  // TODO: Implement profile page
  console.log('Profile page not yet implemented')
}

// Close navbar when clicking outside
const handleClickOutside = (event) => {
  if (navbarCollapse.value && !navbarCollapse.value.contains(event.target) && isNavbarOpen.value) {
    closeNavbar()
  }
}

// Close navbar on route change
const unwatchRoute = router.afterEach(() => {
  closeNavbar()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  unwatchRoute()
})
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1030;
}

.navbar-spacer {
  height: 56px; /* Adjust based on navbar height */
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-link {
  border-radius: 0.375rem;
  margin: 0 0.25rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background-color: #ffc107;
  border-radius: 1px;
}

.user-avatar img {
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-avatar i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  min-width: 220px;
}

.dropdown-header {
  color: #495057;
  font-weight: 600;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24;
}

/* Mobile optimizations */
@media (max-width: 991.98px) {
  .navbar-nav {
    padding: 1rem 0;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
  }

  .dropdown-menu {
    position: static;
    float: none;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 0.375rem;
    margin: 0.5rem 0;
  }

  .dropdown-item {
    color: rgba(255, 255, 255, 0.9);
  }

  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .nav-link {
    border: 1px solid transparent;
  }

  .nav-link:hover,
  .nav-link.active {
    border-color: white;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .dropdown-item {
    transition: none;
  }

  .nav-link:hover,
  .dropdown-item:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .navbar {
    display: none;
  }

  .navbar-spacer {
    display: none;
  }
}
</style>
