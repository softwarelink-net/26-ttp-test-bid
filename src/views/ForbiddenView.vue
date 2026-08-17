<template>
  <div class="max-w-xl">
    <p class="kicker">403 Forbidden</p>
    <h2 class="font-display text-3xl mt-3">当前角色无权访问该资源</h2>
    <p class="mt-4 text-slate-400 leading-relaxed">
      身份 <span class="text-sky-200">{{ auth.roleLabel }}</span>
      不能进入 <span class="font-mono text-slate-200">{{ route.query.from || '/admin/settings' }}</span>。
      请返回授权工作区或使用具备相应权限的演示账号。
    </p>
    <RouterLink :to="auth.homePath" class="btn-cyan mt-8 inline-flex">返回授权页面</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
</script>
