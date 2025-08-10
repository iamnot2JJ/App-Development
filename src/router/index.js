import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/public/HomeView.vue'
import ResourcesView from '../views/public/ResourcesView.vue'
import AboutView from '../views/public/AboutView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import AuthTest from '../views/admin/AuthTest.vue'
import DataTablesView from '../views/DataTablesView.vue'
import AppointmentBookingSimple from '../views/AppointmentBookingSimple.vue'
import AuthLayout from '../components/auth/AuthLayout.vue'

// Lazy load components for better performance
const MapComponent = () => import('../components/geo/MapComponent.vue')
const ExportComponent = () => import('../components/export/ExportComponent.vue')
const AppointmentBooking = () => import('../components/booking/AppointmentBooking.vue')
const InteractiveDataTable = () => import('../components/ui/InteractiveDataTable.vue')
const AIChatPage = () => import('../views/AIChatPage-simple.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Home - Migrant Health Charity' },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: ResourcesView,
    meta: { title: 'Resources - Migrant Health Charity' },
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { title: 'About Us - Migrant Health Charity' },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthLayout,
    meta: { title: 'Sign In - Migrant Health Charity' },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Admin Dashboard - Migrant Health Charity',
    },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: {
      title: 'Admin Login - Migrant Health Charity',
    },
  },
  {
    path: '/auth-test',
    name: 'AuthTest',
    component: AuthTest,
    meta: {
      title: 'Auth Test - Migrant Health Charity',
    },
  },
  {
    path: '/map',
    name: 'Map',
    component: MapComponent,
    meta: { title: 'Healthcare Map - Migrant Health Charity' },
  },
  {
    path: '/export',
    name: 'Export',
    component: ExportComponent,
    meta: {
      requiresAuth: true,
      title: 'Data Export - Migrant Health Charity',
    },
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: AppointmentBooking,
    meta: {
      requiresAuth: true,
      title: 'Book Appointment - Migrant Health Charity',
    },
  },
  {
    path: '/book-appointment',
    name: 'BookAppointment',
    component: AppointmentBookingSimple,
    meta: {
      title: 'Book Appointment - Migrant Health Charity',
    },
  },
  {
    path: '/data-tables',
    name: 'DataTables',
    component: InteractiveDataTable,
    meta: {
      requiresAuth: true,
      title: 'Data Tables - Migrant Health Charity',
    },
  },
  {
    path: '/data-demo',
    name: 'DataDemo',
    component: DataTablesView,
    meta: {
      title: 'Data Tables Demo - Migrant Health Charity',
    },
  },
  {
    path: '/ai-chat',
    name: 'AIChatPage',
    component: AIChatPage,
    meta: {
      title: 'AI Health Assistant - Migrant Health Charity',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page Not Found - Migrant Health Charity' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll behavior for better UX
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
    return
  }

  // Check admin requirements
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirect to admin login if trying to access admin pages
    if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
      next('/admin/login')
      return
    }
    // Otherwise redirect to home
    next('/')
    return
  }

  next()
})

// Global after guards for analytics, etc.
router.afterEach((to, from) => {
  // Track page views (would integrate with analytics service)
  console.log(`Navigation: ${from.path} → ${to.path}`)

  // Announce navigation for screen readers
  const announcement = `Navigated to ${to.meta.title || to.name}`
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  liveRegion.textContent = announcement
  document.body.appendChild(liveRegion)

  setTimeout(() => {
    document.body.removeChild(liveRegion)
  }, 1000)
})

export default router
