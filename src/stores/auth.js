import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from './api'

export const ROLE_LABELS = {
  admin: '超级管理员',
  engineer: '航电测试工程师',
  viewer: '审核 / 评标专家',
}

export const DEFAULT_ROUTES = {
  admin: '/admin/settings',
  engineer: '/dashboard',
  viewer: '/bid-notice',
}

export const ROUTE_ROLES = {
  dashboard: ['admin', 'engineer', 'viewer'],
  tests: ['admin', 'engineer', 'viewer'],
  'fault-injection': ['admin', 'engineer'],
  'admin-settings': ['admin'],
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const user = ref(null)

    const isAuthenticated = computed(() => Boolean(token.value && user.value))
    const role = computed(() => user.value?.role || '')
    const displayName = computed(() => user.value?.full_name || '未登录')
    const roleLabel = computed(() => ROLE_LABELS[role.value] || role.value)
    const homePath = computed(() => DEFAULT_ROUTES[role.value] || '/bid-notice')

    function persist(nextToken, nextUser) {
      token.value = nextToken
      user.value = nextUser
      if (nextToken) localStorage.setItem(api.tokenKey, nextToken)
      else localStorage.removeItem(api.tokenKey)
    }

    async function login(payload) {
      const data = await api.login(payload)
      persist(data.token, data.user)
      return data.user
    }

    async function logout() {
      try {
        await api.logout()
      } catch {
        /* ignore */
      }
      persist(null, null)
    }

    function hydrateToken() {
      const t = localStorage.getItem(api.tokenKey)
      if (t && !token.value) token.value = t
    }

    function canAccess(routeName) {
      const roles = ROUTE_ROLES[routeName]
      if (!roles) return true
      return roles.includes(role.value)
    }

    return {
      token,
      user,
      isAuthenticated,
      role,
      displayName,
      roleLabel,
      homePath,
      login,
      logout,
      hydrateToken,
      canAccess,
    }
  },
  {
    persist: {
      key: 'ttp-bid-auth',
      paths: ['token', 'user'],
    },
  },
)
