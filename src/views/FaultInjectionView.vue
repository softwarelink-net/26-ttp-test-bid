<template>
  <div class="space-y-8">
    <section>
      <p class="kicker">FPGA ns injection</p>
      <h2 class="font-display mt-2 text-3xl">硬件级故障注入沙箱</h2>
      <p class="mt-2 max-w-2xl text-sm text-slate-400">
        在指定 TDMA Slot 注入 CRC 翻转、时隙冲突、收发器短路或终端失配，观察 GCU/BPCU fail-silent 响应与差分波形。
      </p>
    </section>

    <form class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" @submit.prevent="trigger">
      <label class="text-xs text-slate-400">
        故障类型
        <select v-model="form.fault_type" class="mt-1 w-full border border-slate-700 bg-black/30 px-3 py-2 text-sm">
          <option value="CRC_ERROR">Bit-flip CRC error</option>
          <option value="SLOT_COLLISION">Slot mismatch</option>
          <option value="BUS_SHORT">Transceiver short-circuit</option>
          <option value="TERM_MISMATCH">Termination mismatch</option>
        </select>
      </label>
      <label class="text-xs text-slate-400">
        通道
        <select v-model="form.channel" class="mt-1 w-full border border-slate-700 bg-black/30 px-3 py-2 text-sm">
          <option>Channel A</option>
          <option>Channel B</option>
          <option>Both</option>
        </select>
      </label>
      <label class="text-xs text-slate-400">
        Target Slot
        <input v-model.number="form.target_slot" type="number" min="0" max="15" class="mt-1 w-full border border-slate-700 bg-black/30 px-3 py-2 text-sm" />
      </label>
      <button class="btn-cyan" type="submit" :disabled="busy">{{ busy ? '注入中…' : '触发注入' }}</button>
    </form>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-if="last" class="text-sm text-amber-200">
      GCU {{ last.gcu_response_state }} · BPCU {{ last.bpcu_response_state }} · Slot {{ last.target_slot }}
    </p>

    <WaveformCanvas :mode="waveMode" :channel="form.channel" />

    <section>
      <h3 class="font-display text-xl mb-3">注入事件</h3>
      <table class="w-full text-sm">
        <thead class="text-[11px] text-slate-500 border-b border-slate-800">
          <tr>
            <th class="py-2 text-left font-medium">时间</th>
            <th class="py-2 text-left font-medium">类型</th>
            <th class="py-2 text-left font-medium">通道</th>
            <th class="py-2 text-left font-medium">Slot</th>
            <th class="py-2 text-left font-medium">GCU</th>
            <th class="py-2 text-left font-medium">BPCU</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ev in events" :key="ev.id" class="border-b border-slate-800/70">
            <td class="py-2 font-mono text-xs">{{ ev.timestamp }}</td>
            <td class="py-2 font-mono">{{ ev.fault_type }}</td>
            <td class="py-2">{{ ev.channel }}</td>
            <td class="py-2 font-mono">{{ ev.target_slot }}</td>
            <td class="py-2 text-slate-400">{{ ev.gcu_response_state }}</td>
            <td class="py-2 text-slate-400">{{ ev.bpcu_response_state }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/stores/api'
import WaveformCanvas from '@/components/WaveformCanvas.vue'

const form = ref({
  fault_type: 'CRC_ERROR',
  channel: 'Channel A',
  target_slot: 5,
  injection_duration_ms: 10,
})
const events = ref([])
const last = ref(null)
const waveMode = ref('idle')
const busy = ref(false)
const error = ref('')

async function load() {
  const data = await api.faults()
  events.value = data.events || []
}

async function trigger() {
  busy.value = true
  error.value = ''
  try {
    const data = await api.triggerFault(form.value)
    last.value = data.event
    waveMode.value = data.event.wave || 'crc_glitch'
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
