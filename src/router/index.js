import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/public/HomeView.vue'
import ResourcesView from '../views/public/ResourcesView.vue'
import AboutView from '../views/public/AboutView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AuthLayout from '../components/auth/AuthLayout.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/resources',
    name: 'Resources',
    component: ResourcesView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthLayout,
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/auth'
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return '/'
  }
})

export default router
