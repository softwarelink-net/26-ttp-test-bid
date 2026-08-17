<template>
  <div class="space-y-10">
    <section>
      <p class="kicker">RBAC · D1 · Flags</p>
      <h2 class="font-display mt-2 text-3xl">系统配置</h2>
      <p class="mt-2 text-sm text-slate-400">功能开关、演示库刷新、用户账号与审计日志。仅超级管理员可写。</p>
    </section>

    <p v-if="msg" class="text-sm text-emerald-300">{{ msg }}</p>
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

    <section>
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-display text-xl">Feature Flags</h3>
        <button class="btn-ghost !py-1.5 !text-xs" type="button" @click="seed">刷新演示种子</button>
      </div>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">键</th>
            <th class="py-2 text-left font-medium">值</th>
            <th class="py-2 text-left font-medium">说明</th>
            <th class="py-2 text-left font-medium" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in configs" :key="c.config_key" class="border-b border-slate-800/70">
            <td class="py-2 font-mono text-xs">{{ c.config_key }}</td>
            <td class="py-2">
              <input v-model="c.config_value" class="w-full max-w-xs border border-slate-700 bg-black/30 px-2 py-1 text-sm" />
            </td>
            <td class="py-2 text-slate-400">{{ c.description }}</td>
            <td class="py-2">
              <button class="text-sky-300 text-xs" type="button" @click="save(c)">保存</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h3 class="font-display text-xl mb-3">用户账号</h3>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">账号</th>
            <th class="py-2 text-left font-medium">姓名</th>
            <th class="py-2 text-left font-medium">角色</th>
            <th class="py-2 text-left font-medium">部门</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-slate-800/70">
            <td class="py-2 font-mono">{{ u.username }}</td>
            <td class="py-2">{{ u.full_name }}</td>
            <td class="py-2">{{ u.role_label || u.role }}</td>
            <td class="py-2 text-slate-400">{{ u.department }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h3 class="font-display text-xl mb-3">审计日志</h3>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">时间</th>
            <th class="py-2 text-left font-medium">动作</th>
            <th class="py-2 text-left font-medium">资源</th>
            <th class="py-2 text-left font-medium">载荷</th>
            <th class="py-2 text-left font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id" class="border-b border-slate-800/70">
            <td class="py-2 font-mono text-xs">{{ l.created_at }}</td>
            <td class="py-2">{{ l.action }}</td>
            <td class="py-2 font-mono text-xs">{{ l.resource }}</td>
            <td class="py-2 text-slate-400 truncate max-w-xs">{{ l.payload }}</td>
            <td class="py-2 font-mono text-xs">{{ l.ip_address }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/stores/api'

const configs = ref([])
const users = ref([])
const logs = ref([])
const msg = ref('')
const error = ref('')

async function load() {
  const [c, u, a] = await Promise.all([api.configs(), api.users(), api.audit()])
  configs.value = c.configs || []
  users.value = u.users || []
  logs.value = a.logs || []
}

async function save(c) {
  error.value = ''
  try {
    await api.updateConfig({ config_key: c.config_key, config_value: c.config_value })
    msg.value = `已更新 ${c.config_key}`
    await load()
  } catch (e) {
    error.value = e.message
  }
}

async function seed() {
  try {
    const data = await api.seed()
    msg.value = `种子已刷新 users=${data.stats.users} tests=${data.stats.tests}`
    await load()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>
