<template>
  <div class="relative min-h-[calc(100vh-40px)] overflow-hidden">
    <img :src="hero" alt="" class="absolute inset-0 h-full w-full object-cover" />
    <div class="absolute inset-0 bg-[#070b16]/80" />

    <div class="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col justify-center px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10">
      <div class="max-w-xl pb-10">
        <p class="font-display text-3xl text-sky-100">陕西航空电气有限责任公司</p>
        <h1 class="mt-4 font-display text-4xl text-white md:text-5xl">TTP 验证平台身份鉴别</h1>
        <p class="mt-4 text-slate-300">超级管理员、航电测试工程师与评标专家按 RBAC 分域进入，会话令牌仅在演示环境签发。</p>
      </div>

      <form class="w-full max-w-md border border-white/10 bg-[#0b1329]/88 p-6" @submit.prevent="submit">
        <label class="block text-xs text-slate-400">
          账号
          <input v-model="username" class="mt-1 w-full border border-slate-600 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-bus-cyan" />
        </label>
        <label class="mt-4 block text-xs text-slate-400">
          口令
          <input v-model="password" type="password" class="mt-1 w-full border border-slate-600 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-bus-cyan" />
        </label>
        <p class="mt-4 text-[11px] leading-relaxed text-slate-500">
          admin / admin123 · engineer / engineer123 · viewer / viewer123
        </p>
        <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>
        <button class="btn-cyan mt-5 w-full" :disabled="loading" type="submit">
          {{ loading ? '鉴别中…' : '进入平台' }}
        </button>
        <RouterLink to="/" class="mt-3 block text-center text-xs text-slate-500 hover:text-slate-300">返回招标公告</RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore, DEFAULT_ROUTES } from '@/stores/auth'
import hero from '@/assets/hero-gcu-lab.jpg'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const username = ref('engineer')
const password = ref('engineer123')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const user = await auth.login({ username: username.value, password: password.value })
    const fallback = DEFAULT_ROUTES[user.role] || '/dashboard'
    router.replace(route.query.redirect || fallback)
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
