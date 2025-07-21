<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <img
          src="@/assets/logo.png"
          alt="MindCare Logo"
          height="40"
          class="d-inline-block align-text-top me-2"
        />
        MindCare
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/resources">Resources</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">About Us</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li v-if="userRole === roles.ADMIN" class="nav-item">
            <router-link class="nav-link" to="/admin">Admin</router-link>
          </li>
        </ul>

        <div class="d-flex">
          <div v-if="isAuthenticated" class="dropdown">
            <button
              class="btn btn-outline-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <span class="me-2">{{ userName }}</span>
              <i class="bi bi-person-circle"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="bi bi-person me-2"></i>Profile
                </router-link>
              </li>
              <li>
                <button class="dropdown-item" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>

          <div v-else class="d-flex gap-2">
            <router-link to="/login" class="btn btn-outline-light">Login</router-link>
            <router-link to="/register" class="btn btn-light">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)
const roles = computed(() => authStore.roles)
const userName = computed(() => authStore.user?.name || 'User')

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
.navbar {
  padding: 0.8rem 1rem;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
  position: relative;
}

.nav-link.router-link-exact-active {
  color: #fff !important;
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #fff;
  border-radius: 2px;
}
</style>
