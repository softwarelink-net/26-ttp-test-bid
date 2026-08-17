<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-auto" role="img" aria-label="TDMA slot allocation">
    <rect :width="width" :height="height" fill="#070d1c" />
    <text x="16" y="22" fill="#64748b" font-size="11" font-family="IBM Plex Mono, monospace">
      TDMA ROUND {{ roundUs }} µs · SLOT {{ currentSlot }} / {{ slots.length - 1 }}
    </text>
    <g v-for="s in slots" :key="s.slot">
      <rect
        :x="xOf(s.slot)"
        :y="44"
        :width="slotW - 3"
        :height="52"
        :fill="fillOf(s)"
        :opacity="s.slot === currentSlot ? 1 : 0.72"
        :stroke="s.slot === currentSlot ? '#38bdf8' : 'transparent'"
        stroke-width="1.5"
      />
      <text :x="xOf(s.slot) + 6" :y="64" fill="#e2e8f0" font-size="11" font-family="Rajdhani, sans-serif">
        {{ s.slot }}
      </text>
      <text :x="xOf(s.slot) + 6" :y="82" fill="#94a3b8" font-size="9" font-family="IBM Plex Mono, monospace">
        {{ s.owner }}
      </text>
    </g>
    <rect x="16" y="112" :width="plotW" height="28" fill="#0b1329" />
    <rect
      :x="16 + (currentSlot / slots.length) * plotW"
      y="112"
      :width="slotW"
      height="28"
      fill="#0284c7"
      opacity="0.35"
    />
    <text x="16" y="158" fill="#64748b" font-size="10" font-family="IBM Plex Mono, monospace">
      GCU 0–3 · BPCU 4–7 · BG 8 · SPARE 9–15
    </text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  slots: { type: Array, default: () => [] },
  currentSlot: { type: Number, default: 0 },
  roundUs: { type: Number, default: 10000 },
})

const width = 960
const height = 172
const plotW = 928
const slotW = computed(() => plotW / Math.max(props.slots.length, 1))

function xOf(slot) {
  return 16 + slot * slotW.value
}

function fillOf(s) {
  if (s.owner === 'GCU') return '#0284c7'
  if (s.owner === 'BPCU') return '#0e7490'
  if (s.owner === 'BG') return '#10b981'
  return '#1e293b'
}
</script>
