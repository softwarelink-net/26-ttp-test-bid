<template>
  <div class="space-y-8">
    <section>
      <p class="kicker">AS6802 · Dual Channel</p>
      <h2 class="font-display mt-2 text-3xl">GCU-BPCU-FlightPower-Cluster</h2>
      <p class="mt-2 max-w-2xl text-sm text-slate-400">
        当前 Slot {{ status.current_slot }} · Round {{ status.current_round }} · 同步 {{ status.sync_state }} · 主时钟
        {{ status.sync_master }}
      </p>
    </section>

    <TdmaSlotMap
      :slots="status.slots || []"
      :current-slot="status.current_slot || 0"
      :round-us="status.cluster?.tdma_round_us || 10000"
    />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <p class="text-[11px] uppercase tracking-bus text-slate-500 mb-3">Jitter / E2E latency</p>
        <JitterChart :jitter="status.jitter_ns || 80" :latency="status.latency_us || 400" />
      </div>
      <dl class="grid grid-cols-2 gap-x-6 gap-y-5 text-sm content-start">
        <div>
          <dt class="text-slate-500">CH-A</dt>
          <dd class="font-mono text-sky-300">{{ status.channel_a_mbps }} Mbps</dd>
        </div>
        <div>
          <dt class="text-slate-500">CH-B</dt>
          <dd class="font-mono text-emerald-300">{{ status.channel_b_mbps }} Mbps</dd>
        </div>
        <div>
          <dt class="text-slate-500">GCU</dt>
          <dd>{{ status.gcu_state }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">BPCU</dt>
          <dd>{{ status.bpcu_state }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">抖动</dt>
          <dd class="font-mono">{{ status.jitter_ns }} ns</dd>
        </div>
        <div>
          <dt class="text-slate-500">时延</dt>
          <dd class="font-mono">{{ status.latency_us }} µs</dd>
        </div>
      </dl>
    </div>

    <section>
      <h3 class="font-display text-xl mb-4">MEDL 调度表</h3>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">Slot</th>
            <th class="py-2 text-left font-medium">Owner</th>
            <th class="py-2 text-left font-medium">Role</th>
            <th class="py-2 text-left font-medium">Ch</th>
            <th class="py-2 text-left font-medium">ICD</th>
            <th class="py-2 text-left font-medium">Bytes</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in status.slots"
            :key="s.slot"
            class="border-b border-slate-800/70"
            :class="s.slot === status.current_slot ? 'bg-sky-950/40' : ''"
          >
            <td class="py-2 font-mono">{{ s.slot }}</td>
            <td>{{ s.owner }}</td>
            <td class="font-mono text-xs">{{ s.role }}</td>
            <td>{{ s.channel }}</td>
            <td>{{ s.payload }}</td>
            <td class="font-mono">{{ s.bytes }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '@/stores/api'
import TdmaSlotMap from '@/components/TdmaSlotMap.vue'
import JitterChart from '@/components/JitterChart.vue'

const status = ref({ slots: [], cluster: {} })
let timer = 0

async function tick() {
  try {
    status.value = await api.ttpStatus()
  } catch {
    /* keep last */
  }
}

onMounted(() => {
  tick()
  timer = window.setInterval(tick, 700)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>
