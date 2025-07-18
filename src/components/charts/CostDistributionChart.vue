<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
    <!-- Legend personalizzata -->
    <div class="mt-4 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
      <div v-for="(item, index) in chartData.labels" :key="index" 
           class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
           @click="toggleDataset(index)">
        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"></div>
        <span class="text-sm font-medium text-gray-700">{{ item }}</span>
        <span class="text-sm text-gray-500">€{{ formatCurrency(chartData.datasets[0].data[index]) }}</span>
        <span class="text-xs text-gray-400">({{ calculatePercentage(chartData.datasets[0].data[index]) }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  DoughnutController,
  Title
} from 'chart.js'

// Registra i componenti necessari per il grafico a torta
Chart.register(ArcElement, Tooltip, Legend, DoughnutController, Title)

const props = defineProps({
  costi: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chart = null

// Colori per le categorie
const colors = {
  dipendenti: '#f97316', // orange-500
  materiali: '#3b82f6',  // blue-500
  mezzi: '#8b5cf6',      // purple-500
  lavori: '#10b981'      // green-500
}

// Calcola i dati per il grafico
const chartData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [],
    borderColor: [],
    borderWidth: 2
  }]
})

// Aggiorna i dati del grafico
const updateChartData = () => {
  const costiPerCategoria = {
    dipendenti: 0,
    materiali: 0,
    mezzi: 0,
    lavori: 0
  }

  // Raggruppa i costi per categoria
  props.costi.forEach(costo => {
    if (costiPerCategoria.hasOwnProperty(costo.categoria)) {
      costiPerCategoria[costo.categoria] += costo.costoTotale
    }
  })

  // Filtra solo le categorie con costi > 0
  const labels = []
  const data = []
  const backgroundColor = []
  const borderColor = []

  Object.entries(costiPerCategoria).forEach(([categoria, valore]) => {
    if (valore > 0) {
      const categoriaLabel = {
        dipendenti: 'Dipendenti',
        materiali: 'Materiali',
        mezzi: 'Mezzi',
        lavori: 'Lavori'
      }[categoria]

      labels.push(categoriaLabel)
      data.push(valore)
      backgroundColor.push(colors[categoria])
      borderColor.push('#ffffff')
    }
  })

  chartData.value = {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderColor,
      borderWidth: 2
    }]
  }
}

// Formatta la valuta
const formatCurrency = (value) => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Calcola la percentuale
const calculatePercentage = (value) => {
  const total = chartData.value.datasets[0].data.reduce((sum, val) => sum + val, 0)
  return total > 0 ? Math.round((value / total) * 100) : 0
}

// Toggle dataset (per interattività)
const toggleDataset = (index) => {
  if (chart) {
    const meta = chart.getDatasetMeta(0)
    meta.data[index].hidden = !meta.data[index].hidden
    chart.update()
  }
}

// Inizializza il grafico
const initChart = () => {
  if (chart) {
    chart.destroy()
  }

  if (!chartCanvas.value) {
    return
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Usiamo la legend personalizzata
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: €${formatCurrency(value)} (${percentage}%)`
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  })
}

// Watch per aggiornamenti dei dati
watch(() => props.costi, () => {
  updateChartData()
  if (chart) {
    chart.data = chartData.value
    chart.update()
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  updateChartData()
  initChart()
})
</script>

<style scoped>
/* Stili per il canvas */
canvas {
  max-height: 280px;
}
</style> 