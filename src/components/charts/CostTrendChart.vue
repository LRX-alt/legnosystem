<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
    <!-- Controlli per il periodo -->
    <div class="mt-4 flex justify-center space-x-2">
      <button 
        v-for="period in periods" 
        :key="period.value"
        @click="setPeriod(period.value)"
        :class="[
          'px-3 py-1 text-xs rounded-lg border transition-colors',
          selectedPeriod === period.value 
            ? 'bg-primary-500 text-white border-primary-500' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >
        {{ period.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { 
  Chart, 
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale, 
  Tooltip, 
  Legend, 
  LineController,
  Title
} from 'chart.js'

// Registra i componenti necessari per il grafico lineare
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, LineController, Title)

const props = defineProps({
  costi: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chart = null

// Periodi disponibili
const periods = [
  { value: '7', label: '7 giorni' },
  { value: '30', label: '30 giorni' },
  { value: '90', label: '90 giorni' }
]

const selectedPeriod = ref('30')

// Colori per le categorie
const colors = {
  dipendenti: '#f97316', // orange-500
  materiali: '#3b82f6',  // blue-500
  mezzi: '#8b5cf6',      // purple-500
  lavori: '#10b981'      // green-500
}

// Calcola i dati per il grafico
const chartData = computed(() => {
  const days = parseInt(selectedPeriod.value)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  // Crea array di date
  const dates = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate).toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Raggruppa costi per data e categoria
  const costiPerData = {}
  dates.forEach(date => {
    costiPerData[date] = {
      dipendenti: 0,
      materiali: 0,
      mezzi: 0,
      lavori: 0
    }
  })

  // Popola i dati
  props.costi.forEach(costo => {
    const data = new Date(costo.data)
    if (data >= startDate && data <= endDate) {
      const dateStr = data.toISOString().split('T')[0]
      if (costiPerData[dateStr] && costiPerData[dateStr].hasOwnProperty(costo.categoria)) {
        costiPerData[dateStr][costo.categoria] += costo.costoTotale
      }
    }
  })

  // Prepara i dataset
  const datasets = [
    {
      label: 'Dipendenti',
      data: dates.map(date => costiPerData[date].dipendenti),
      borderColor: colors.dipendenti,
      backgroundColor: colors.dipendenti + '20',
      tension: 0.4,
      fill: false
    },
    {
      label: 'Materiali',
      data: dates.map(date => costiPerData[date].materiali),
      borderColor: colors.materiali,
      backgroundColor: colors.materiali + '20',
      tension: 0.4,
      fill: false
    },
    {
      label: 'Mezzi',
      data: dates.map(date => costiPerData[date].mezzi),
      borderColor: colors.mezzi,
      backgroundColor: colors.mezzi + '20',
      tension: 0.4,
      fill: false
    },
    {
      label: 'Lavori',
      data: dates.map(date => costiPerData[date].lavori),
      borderColor: colors.lavori,
      backgroundColor: colors.lavori + '20',
      tension: 0.4,
      fill: false
    }
  ]

  return {
    labels: dates.map(date => formatDate(date)),
    datasets
  }
})

// Formatta la data
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit' 
  })
}

// Formatta la valuta
const formatCurrency = (value) => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Imposta il periodo
const setPeriod = (period) => {
  selectedPeriod.value = period
  if (chart) {
    chart.data = chartData.value
    chart.update()
  }
}

// Inizializza il grafico
const initChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  chart = new Chart(ctx, {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: €${formatCurrency(value)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Data'
          },
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Costo (€)'
          },
          beginAtZero: true,
          ticks: {
            callback: (value) => `€${formatCurrency(value)}`
          }
        }
      },
      animation: {
        duration: 1000
      }
    }
  })
}

// Watch per aggiornamenti dei dati
watch([() => props.costi, chartData], () => {
  if (chart) {
    chart.data = chartData.value
    chart.update()
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initChart()
})
</script>

<style scoped>
/* Stili per il canvas */
canvas {
  max-height: 280px;
}
</style> 