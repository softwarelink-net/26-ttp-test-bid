<template>
  <div>
    <section class="relative overflow-hidden min-h-[calc(100vh-40px)] slot-sweep">
      <img :src="hero" alt="GCU 与 BPCU 机载电源试验台" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-[#070b16]/90 via-[#070b16]/50 to-transparent" />

      <div class="relative z-10 flex min-h-[calc(100vh-40px)] flex-col justify-end px-6 pb-16 pt-24 md:px-16 lg:px-24">
        <p class="font-display text-3xl md:text-5xl tracking-wide text-sky-100">陕西航空电气有限责任公司</p>
        <h1 class="mt-4 max-w-3xl font-display text-4xl md:text-6xl leading-[1.05] text-white">
          基于GCU、BPCU设备的TTP需求测试验证平台
        </h1>
        <p class="mt-5 max-w-xl text-base md:text-lg text-slate-200/90">
          SAE AS6802 双余度总线 · 纳秒同步 · 可控 Slot 故障注入
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink v-if="auth.isAuthenticated" :to="auth.homePath" class="btn-cyan">进入工作台</RouterLink>
          <RouterLink v-else to="/login" class="btn-cyan">进入验证平台</RouterLink>
          <a href="#bid-body" class="btn-ghost">阅读招标公告</a>
          <RouterLink v-if="auth.isAuthenticated && auth.canAccess('tests')" to="/tests" class="btn-ghost">只读测试报告</RouterLink>
        </div>
      </div>
    </section>

    <section id="bid-body" class="px-6 py-16 md:px-16 lg:px-24 bg-[#0b1329]">
      <p class="kicker">0730-2611010439/01</p>
      <h2 class="font-display mt-3 text-3xl md:text-4xl">招标公告全文</h2>
      <p class="mt-3 max-w-3xl text-slate-400 leading-relaxed">{{ bid?.summary }}</p>

      <dl class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6 text-sm">
        <div>
          <dt class="text-slate-500">标题</dt>
          <dd class="mt-1">{{ bid?.title }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">项目发包方</dt>
          <dd class="mt-1">{{ bid?.buyer }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">项目编号</dt>
          <dd class="mt-1 font-mono">{{ bid?.project_id }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">项目发布时间</dt>
          <dd class="mt-1 font-mono">{{ bid?.published_at }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">投标截止</dt>
          <dd class="mt-1 font-mono text-amber-200">{{ countdownText }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-slate-500">关键词</dt>
          <dd class="mt-1 text-slate-300">{{ (bid?.keywords || []).join(' · ') }}</dd>
        </div>
      </dl>

      <div class="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h3 class="font-display text-2xl">技术要点</h3>
          <p class="mt-4 text-slate-400 leading-relaxed">{{ bid?.technical_points }}</p>
          <h3 class="font-display text-2xl mt-10">技术创新性</h3>
          <p class="mt-4 text-slate-400 leading-relaxed">{{ bid?.innovation }}</p>
        </div>
        <aside>
          <h3 class="font-display text-2xl">投标资格与节点</h3>
          <ol class="mt-4 space-y-2 text-sm text-slate-300">
            <li v-for="(q, i) in bid?.qualifications || []" :key="q.id">{{ i + 1 }}. {{ q.label }}</li>
          </ol>
          <ul class="mt-6 space-y-2 text-sm font-mono text-slate-400">
            <li v-for="t in bid?.timeline || []" :key="t.when">{{ t.when }} — {{ t.what }}</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="px-6 py-16 md:px-16 lg:px-24 border-t border-slate-800">
      <p class="kicker">Traceability</p>
      <h2 class="font-display mt-2 text-3xl">需求—用例双向追溯</h2>
      <p class="mt-3 max-w-2xl text-slate-400">九项招标测试条目映射至 AS6802 / ICD-Rev4 通过准则，供评标只读核查。</p>
      <table class="mt-8 w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">编号</th>
            <th class="py-2 text-left font-medium">类别</th>
            <th class="py-2 text-left font-medium">标题</th>
            <th class="py-2 text-left font-medium">标准</th>
            <th class="py-2 text-left font-medium">通过准则</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in matrix" :key="row.id" class="border-b border-slate-800/70">
            <td class="py-2.5 font-mono text-sky-300">{{ row.id }}</td>
            <td class="py-2.5">{{ row.category_name }}</td>
            <td class="py-2.5 pr-4">{{ row.title }}</td>
            <td class="py-2.5 font-mono text-xs text-slate-400">{{ row.standard_ref }}</td>
            <td class="py-2.5 text-slate-400">{{ row.pass_criteria }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'
import hero from '@/assets/hero-gcu-lab.jpg'

const auth = useAuthStore()

const bid = ref(null)
const countdown = ref(null)
const matrix = [
  { id: 'TC-01', category_name: '应用层通信', title: 'GCU模式控制与指令收发周期符合性验证', standard_ref: 'AS6802 / ICD-Rev4', pass_criteria: '指令周期间隔<=10ms，零丢包' },
  { id: 'TC-02', category_name: '调度表配置', title: 'MEDL调度表与ICD多节点时序解析测试', standard_ref: 'DO-254 / ICD-Rev4', pass_criteria: '16个Slot完全对齐无冲突' },
  { id: 'TC-03', category_name: '时间同步', title: 'TTP双网冷启动及纳秒级时钟同步收敛测试', standard_ref: 'SAE AS6802 Sec 5.2', pass_criteria: '同步建立时间<120ms，抖动<200ns' },
  { id: 'TC-04', category_name: '节点启动', title: '主控总线冷启动与仲裁服务恢复测试', standard_ref: 'SAE AS6802 Sec 6.1', pass_criteria: '总线冷启动时间<=50ms' },
  { id: 'TC-05', category_name: '数据通信', title: '双余度通道A/B无缝热切换与端到端时延测试', standard_ref: 'TTP-Spec-C2', pass_criteria: '端到端时延<1.2ms，切换丢失帧=0' },
  { id: 'TC-06', category_name: '物理层传输', title: 'TDMA调度机制与差分电平信号完整性测试', standard_ref: 'EIA-485 / AS6802', pass_criteria: '差分电平2.0V~3.3V，眼图无遮挡' },
  { id: 'TC-07', category_name: '稳定性注入', title: '指定Slot CRC校验错误与短路故障注入容错测试', standard_ref: 'DO-160G / AS6802', pass_criteria: 'BPCU在1个TDMA周期内完成隔离并报警' },
  { id: 'TC-08', category_name: '数据监控', title: '多速率数据帧捕获及全量历史存储解析测试', standard_ref: 'TTP-Analyzer-V2', pass_criteria: '100%帧存储与无损解析' },
  { id: 'TC-09', category_name: '中断时序', title: 'TTP Driver/TD-COM驱动层中断潜伏与CPU开销实测', standard_ref: 'DO-178C DAL-A', pass_criteria: '中断服务例程(ISR)耗时<45us' },
]
let timer = 0

const countdownText = computed(() => {
  if (!countdown.value) return bid.value?.deadline || '2026/09/03 17:00:00'
  if (countdown.value.isExpired) return '已截止'
  return `${countdown.value.remainDays}天 ${countdown.value.remainHours}时 ${countdown.value.remainMinutes}分`
})

async function load() {
  try {
    const data = await api.tender()
    bid.value = data.bid
    countdown.value = data.countdown
  } catch {
    bid.value = {
      title: '基于GCU、BPCU设备的TTP需求测试验证平台招标公告',
      buyer: '陕西航空电气有限责任公司',
      project_id: '0730-2611010439/01',
      published_at: '2026/08/13 18:01:59',
      deadline: '2026/09/03 17:00:00',
      keywords: ['陕西航空电气有限责任公司', 'TTP需求测试', 'GCU测试', 'BPCU设备', 'TTP总线', '航空电气招标'],
      summary:
        '陕西航空电气有限责任公司采购基于GCU、BPCU设备的TTP需求测试验证平台一套，用于机载电源系统控制器研制及迭代过程中的TTP总线需求测试、同步时序测试及故障注入验证。',
      technical_points:
        '覆盖GCU/BPCU应用层通信、集群规划与调度表、单双网时间同步与恢复、冷启动测试、双余度通信与抖动分析、TDMA物理层信号测试、多场景硬件级故障注入、总线监控与存储、Driver/TD-COM中断时序与运行开销实测。',
      innovation:
        '高安全航空嵌入式总线确定性测试、FPGA级纳秒时序捕获、动态ICD/MEDL映射解析与纳秒级Slot可控硬件故障注入。',
      qualifications: [],
      timeline: [],
    }
  }
}

onMounted(() => {
  load()
  timer = window.setInterval(load, 30000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>
