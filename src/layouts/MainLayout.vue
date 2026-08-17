<template>
  <div class="min-h-[calc(100vh-40px)] flex flex-col bg-bus-void">
    <header class="border-b border-slate-800 bg-[#0b1329]/95">
      <div class="h-14 px-4 md:px-8 flex items-center gap-4">
        <RouterLink to="/dashboard" class="shrink-0">
          <p class="font-display text-[15px] tracking-wide text-sky-100">陕航电气 · TTP</p>
          <p class="text-[10px] text-slate-500 font-mono">0730-2611010439/01</p>
        </RouterLink>

        <nav class="flex-1 flex items-center gap-1 overflow-x-auto text-sm">
          <RouterLink
            v-for="item in visibleNav"
            :key="item.to"
            :to="item.to"
            class="px-3 py-4 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap"
            active-class="nav-active"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div
          class="hidden md:flex items-center gap-2 px-2.5 py-1 border border-emerald-700/50 bg-emerald-950/40 text-[11px] text-emerald-300"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-bus-sync sync-dot" />
          CLUSTER SYNC {{ syncLabel }}
        </div>

        <div class="relative" @mouseleave="menuOpen = false">
          <button class="text-right" type="button" @click="menuOpen = !menuOpen">
            <p class="text-xs">{{ auth.displayName }}</p>
            <p class="text-[10px] text-slate-500">{{ auth.roleLabel }}</p>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-1 w-44 border border-slate-700 bg-[#101a33] text-sm z-20"
          >
            <p class="px-3 py-2 text-[11px] text-slate-500 border-b border-slate-800">{{ auth.user?.department }}</p>
            <button class="w-full text-left px-3 py-2 hover:bg-white/5" type="button" @click="onLogout">退出会话</button>
          </div>
        </div>
      </div>
      <div class="px-4 md:px-8 h-8 flex items-center text-[11px] text-slate-500 border-t border-slate-800/80">
        <span>陕航电气</span>
        <span class="mx-2 text-slate-700">/</span>
        <span v-for="(crumb, i) in crumbs" :key="crumb">
          <span>{{ crumb }}</span>
          <span v-if="i < crumbs.length - 1" class="mx-2 text-slate-700">/</span>
        </span>
      </div>
    </header>

    <main class="flex-1 overflow-auto p-5 md:p-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/stores/api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const syncLabel = ref('LOCKED')
let timer = 0

const nav = [
  { to: '/bid-notice', name: 'bid-notice', label: '招标公告' },
  { to: '/dashboard', name: 'dashboard', label: '总线监视' },
  { to: '/tests', name: 'tests', label: '测试套件' },
  { to: '/fault-injection', name: 'fault-injection', label: '故障注入' },
  { to: '/admin/settings', name: 'admin-settings', label: '系统配置' },
]

const visibleNav = computed(() => nav.filter((item) => item.name === 'bid-notice' || auth.canAccess(item.name)))

const crumbs = computed(() => {
  const title = route.meta.title || '工作台'
  return ['验证平台', title]
})

async function pollSync() {
  try {
    const data = await api.ttpStatus()
    syncLabel.value = data.sync_state || 'LOCKED'
  } catch {
    syncLabel.value = 'DEGRADED'
  }
}

onMounted(() => {
  pollSync()
  timer = window.setInterval(pollSync, 4000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

async function onLogout() {
  menuOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>
