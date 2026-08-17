<template>
  <div class="space-y-8">
    <section class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="kicker">Nine tender items</p>
        <h2 class="font-display mt-2 text-3xl">测试套件与符合性引擎</h2>
        <p class="mt-2 text-sm text-slate-400">覆盖应用 ICD、时间同步、冷启动、端到端时延、物理层、故障注入、嗅探与中断剖析。</p>
      </div>
      <label v-if="canExecute" class="text-xs text-slate-400">
        ICD 导入
        <input type="file" accept=".xml,.json,.icd" class="mt-1 block text-xs" @change="onIcd" />
      </label>
    </section>

    <p v-if="icdMsg" class="text-sm text-emerald-300">{{ icdMsg }}</p>
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

    <table class="w-full text-sm">
      <thead class="text-[11px] text-slate-500 border-b border-slate-800">
        <tr>
          <th class="py-2 text-left font-medium">ID</th>
          <th class="py-2 text-left font-medium">类别</th>
          <th class="py-2 text-left font-medium">标题 / 通过准则</th>
          <th class="py-2 text-left font-medium">对象</th>
          <th class="py-2 text-left font-medium">状态</th>
          <th v-if="canExecute" class="py-2 text-left font-medium" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="tc in cases" :key="tc.id" class="border-b border-slate-800/70 align-top">
          <td class="py-3 font-mono text-sky-300">{{ tc.id }}</td>
          <td class="py-3">{{ tc.category_name }}</td>
          <td class="py-3 pr-4">
            <p>{{ tc.title }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ tc.standard_ref }} · {{ tc.pass_criteria }}</p>
          </td>
          <td class="py-3 font-mono text-xs">{{ tc.target_device }}</td>
          <td class="py-3">
            <span :class="statusClass(tc.status)">{{ tc.status }}</span>
          </td>
          <td v-if="canExecute" class="py-3">
            <button class="btn-ghost !py-1 !text-xs" type="button" :disabled="running === tc.id" @click="run(tc.id)">
              {{ running === tc.id ? '执行中' : '运行' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <section>
      <h3 class="font-display text-xl mb-3">历史执行记录</h3>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">时间</th>
            <th class="py-2 text-left font-medium">用例</th>
            <th class="py-2 text-left font-medium">结果</th>
            <th class="py-2 text-left font-medium">抖动</th>
            <th class="py-2 text-left font-medium">时延</th>
            <th class="py-2 text-left font-medium">摘要</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ex in executions" :key="ex.id" class="border-b border-slate-800/70">
            <td class="py-2 font-mono text-xs">{{ ex.created_at }}</td>
            <td class="py-2 font-mono">{{ ex.test_case_id }}</td>
            <td class="py-2" :class="ex.result === 'passed' ? 'text-emerald-300' : 'text-red-300'">{{ ex.result }}</td>
            <td class="py-2 font-mono">{{ ex.measured_sync_jitter_ns }} ns</td>
            <td class="py-2 font-mono">{{ ex.measured_latency_us }} µs</td>
            <td class="py-2 text-slate-400">{{ ex.log_summary }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const cases = ref([])
const executions = ref([])
const running = ref('')
const error = ref('')
const icdMsg = ref('')
const canExecute = computed(() => auth.role === 'admin' || auth.role === 'engineer')

function statusClass(s) {
  if (s === 'passed') return 'text-emerald-300'
  if (s === 'failed') return 'text-red-300'
  if (s === 'running') return 'text-amber-300'
  return 'text-slate-400'
}

async function load() {
  const data = await api.tests()
  cases.value = data.cases || []
  executions.value = data.executions || []
}

async function run(id) {
  running.value = id
  error.value = ''
  try {
    await api.runTest(id)
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    running.value = ''
  }
}

async function onIcd(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  try {
    const data = await api.importIcd({ filename: file.name, message_count: 24 })
    icdMsg.value = `已解析 ${data.parsed.filename} · ${data.parsed.messages} 条消息对齐 ${data.parsed.aligned_slots} Slot`
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>
