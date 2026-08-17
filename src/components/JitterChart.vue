<template>
  <canvas ref="el" class="w-full h-[180px]" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const props = defineProps({
  jitter: { type: Number, default: 80 },
  latency: { type: Number, default: 400 },
})

const el = ref(null)
let chart = null
const jitterHist = []
const latencyHist = []
const labels = []

function pushSample() {
  if (labels.length > 36) {
    labels.shift()
    jitterHist.shift()
    latencyHist.shift()
  }
  labels.push(`${labels.length}`)
  jitterHist.push(props.jitter)
  latencyHist.push(props.latency)
  if (chart) {
    chart.data.labels = [...labels]
    chart.data.datasets[0].data = [...jitterHist]
    chart.data.datasets[1].data = [...latencyHist]
    chart.update('none')
  }
}

onMounted(() => {
  if (!el.value) return
  chart = new Chart(el.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'jitter ns',
          data: jitterHist,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(2,132,199,0.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 1.5,
          yAxisID: 'y',
        },
        {
          label: 'latency µs',
          data: latencyHist,
          borderColor: '#10b981',
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 1.5,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: { display: false },
        y: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: 'rgba(148,163,184,0.08)' },
        },
        y1: {
          position: 'right',
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      },
    },
  })
  pushSample()
})

watch(() => [props.jitter, props.latency], pushSample)

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>
