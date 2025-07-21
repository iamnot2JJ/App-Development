import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/public/HomeView.vue'),
    meta: { title: '心理健康支持中心' },
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('@/views/public/ResourcesView.vue'),
    meta: { title: '资源中心' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/auth/LoginForm.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/components/auth/RegisterForm.vue'),
    meta: { requiresAuth: false, title: '注册' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/protected/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['member', 'admin'] },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/public/AboutView.vue'),
    meta: { title: '关于我们' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} | 心理健康支持`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
