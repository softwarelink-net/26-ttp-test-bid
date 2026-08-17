<template>
  <canvas ref="el" class="w-full h-[220px] bg-[#070d1c]" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'idle' },
  channel: { type: String, default: 'Channel A' },
})

const el = ref(null)
let raf = 0
let t0 = 0

function draw(ts) {
  const canvas = el.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)
  }
  ctx.fillStyle = '#070d1c'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(2,132,199,0.15)'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 28) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const t = (ts - t0) / 1000
  ctx.beginPath()
  ctx.strokeStyle = props.channel.includes('B') ? '#10b981' : '#38bdf8'
  ctx.lineWidth = 1.6
  for (let x = 0; x < w; x++) {
    const u = x / w
    let y = Math.sin(u * 42 + t * 8) * 0.55
    if (props.mode === 'crc_glitch' && u > 0.42 && u < 0.48) y = (Math.random() - 0.5) * 1.6
    if (props.mode === 'collision' && u > 0.35 && u < 0.55) y += Math.sin(u * 220) * 0.7
    if (props.mode === 'short') y *= 0.12
    if (props.mode === 'reflection') y += Math.sin(u * 18 + t * 3) * 0.35 * Math.exp(-u * 2)
    const py = h / 2 - y * (h * 0.38)
    if (x === 0) ctx.moveTo(x, py)
    else ctx.lineTo(x, py)
  }
  ctx.stroke()
  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  t0 = performance.now()
  raf = requestAnimationFrame(draw)
})

watch(
  () => props.mode,
  () => {
    t0 = performance.now()
  },
)

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>
