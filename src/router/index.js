import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { applySiteMeta } from '@/stores/seo'

const AuthLayout = () => import('@/layouts/AuthLayout.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')

const routes = [
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/BidNoticeView.vue'),
        meta: { public: true, title: '招标公告' },
      },
    ],
  },
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { public: true, title: '身份鉴别' },
      },
    ],
  },
  {
    path: '/bid-notice',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'bid-notice',
        component: () => import('@/views/BidNoticeView.vue'),
        meta: { public: true, title: '招标公告' },
      },
    ],
  },
  {
    path: '/dashboard',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'engineer', 'viewer'], title: 'TTP 总线监视' },
      },
    ],
  },
  {
    path: '/tests',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'tests',
        component: () => import('@/views/TestsView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'engineer', 'viewer'], title: '测试套件' },
      },
    ],
  },
  {
    path: '/fault-injection',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'fault-injection',
        component: () => import('@/views/FaultInjectionView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'engineer'], title: '故障注入' },
      },
    ],
  },
  {
    path: '/admin/settings',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'admin-settings',
        component: () => import('@/views/AdminSettingsView.vue'),
        meta: { requiresAuth: true, roles: ['admin'], title: '系统配置' },
      },
    ],
  },
  {
    path: '/403',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'forbidden',
        component: () => import('@/views/ForbiddenView.vue'),
        meta: { requiresAuth: true, title: '403 Forbidden' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  auth.hydrateToken()
  applySiteMeta()

  if (to.meta.public) return true
  if (to.meta.requiresAuth === false) return true

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const roles = to.meta.roles
  if (Array.isArray(roles) && !roles.includes(auth.role)) {
    return { name: 'forbidden', query: { from: to.fullPath } }
  }

  if (to.name && to.name !== 'forbidden' && !auth.canAccess(to.name)) {
    return { name: 'forbidden', query: { from: to.fullPath } }
  }

  return true
})

router.afterEach(() => {
  applySiteMeta()
})

export default router
