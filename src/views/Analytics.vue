<template>
  <div class="space-y-6">
    <!-- Header Analytics -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Analytics Aziendali</h1>
        <p class="text-gray-600 text-base">Reports e analisi performance - Legnosystem.bio</p>
      </div>
      <div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <div class="w-full sm:w-48">
          <select v-model="selectedPeriod" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 3 mesi</option>
            <option value="1y">Anno corrente</option>
          </select>
        </div>
        <button class="w-full sm:w-auto btn-primary py-3 text-base font-medium"
                title="Esporta report in PDF">
          <DocumentArrowDownIcon class="w-5 h-5 mr-2" />
          Esporta Report
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Fatturato Periodo</p>
            <p class="text-2xl font-bold text-gray-900">€{{ kpis.fatturato.toLocaleString() }}</p>
            <p class="text-sm" :class="kpis.fatturatoChange >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ kpis.fatturatoChange >= 0 ? '+' : '' }}{{ kpis.fatturatoChange }}% vs periodo prec.
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Progetti Completati</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.progettiCompletati }}</p>
            <p class="text-sm" :class="kpis.progettiChange >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ kpis.progettiChange >= 0 ? '+' : '' }}{{ kpis.progettiChange }}% vs periodo prec.
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UserGroupIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Nuovi Clienti</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.nuoviClienti }}</p>
            <p class="text-sm" :class="kpis.clientiChange >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ kpis.clientiChange >= 0 ? '+' : '' }}{{ kpis.clientiChange }}% vs periodo prec.
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Ore Lavorate</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.oreLavorate }}</p>
            <p class="text-sm" :class="kpis.oreChange >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ kpis.oreChange >= 0 ? '+' : '' }}{{ kpis.oreChange }}% vs periodo prec.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Grafico Fatturato -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Andamento Fatturato</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <ChartBarIcon class="w-12 h-12 text-primary-500 mx-auto mb-2" />
            <p class="text-base text-gray-600">Grafico fatturato mensile</p>
            <p class="text-sm text-gray-400">(Integrazione Chart.js in sviluppo)</p>
          </div>
        </div>
      </div>

      <!-- Grafico Progetti -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Pipeline Progetti</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <PresentationChartLineIcon class="w-12 h-12 text-accent-500 mx-auto mb-2" />
            <p class="text-base text-gray-600">Stato avanzamento progetti</p>
            <p class="text-sm text-gray-400">(Integrazione Chart.js in sviluppo)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Team -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Team</h3>
      <div v-for="performance in teamPerformance" :key="performance.id" class="card hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {{ performance.iniziali }}
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900">{{ performance.nome }}</h4>
            <p class="text-base text-gray-600">{{ performance.ruolo }}</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getValutazioneColor(performance.valutazione)">
            {{ performance.valutazione }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">Ore Totali</p>
            <p class="text-lg font-bold text-gray-900">{{ performance.oreTotali }}h</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">Progetti</p>
            <p class="text-lg font-bold text-gray-900">{{ performance.progetti }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">Efficienza</p>
            <p class="text-lg font-bold text-primary-600">{{ performance.efficienza }}%</p>
          </div>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between text-base mb-1">
            <span class="text-gray-600">Efficienza</span>
            <span class="font-medium">{{ performance.efficienza }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-primary-500 h-3 rounded-full transition-all duration-300" :style="`width: ${performance.efficienza}%`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div class="hidden lg:block card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Team</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Dipendente</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Ore Totali</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Progetti</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Efficienza</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Valutazione</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="performance in teamPerformance" :key="performance.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {{ performance.iniziali }}
                  </div>
                  <div>
                    <div class="text-base font-medium text-gray-900">{{ performance.nome }}</div>
                    <div class="text-base text-gray-500">{{ performance.ruolo }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ performance.oreTotali }}h</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ performance.progetti }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-primary-500 h-2 rounded-full" :style="`width: ${performance.efficienza}%`"></div>
                  </div>
                  <span class="text-base text-gray-900">{{ performance.efficienza }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getValutazioneColor(performance.valutazione)">
                  {{ performance.valutazione }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Materiali e Clienti - Mobile Optimized -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
      <!-- Top Materiali -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Materiali più Utilizzati</h3>
        <div class="space-y-4">
          <div v-for="materiale in topMateriali" :key="materiale.nome" class="flex items-center justify-between">
            <div class="flex items-center flex-1 min-w-0">
              <div class="w-4 h-4 rounded-full mr-3 flex-shrink-0" :style="`background-color: ${materiale.color}`"></div>
              <span class="text-sm font-medium text-gray-900 truncate">{{ materiale.nome }}</span>
            </div>
            <div class="flex items-center ml-4">
              <div class="w-20 sm:w-24 bg-gray-200 rounded-full h-2 mr-3">
                <div class="h-2 rounded-full" :style="`width: ${materiale.percentuale}%; background-color: ${materiale.color}`"></div>
              </div>
              <span class="text-sm text-gray-600 whitespace-nowrap">{{ materiale.quantita }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Clienti -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Clienti Top per Fatturato</h3>
        <div class="space-y-4">
          <div v-for="cliente in topClienti" :key="cliente.nome" class="flex items-center justify-between">
            <div class="flex items-center flex-1 min-w-0">
              <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                {{ cliente.iniziali }}
              </div>
              <span class="text-sm font-medium text-gray-900 truncate">{{ cliente.nome }}</span>
            </div>
            <div class="text-right ml-4">
              <div class="text-sm font-semibold text-gray-900">€{{ cliente.fatturato.toLocaleString() }}</div>
              <div class="text-xs text-gray-500">{{ cliente.progetti }} progetti</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  DocumentArrowDownIcon,
  CurrencyEuroIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  PresentationChartLineIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const selectedPeriod = ref('30d')

// KPI - resettati a 0
const kpis = ref({
  fatturato: 0,
  fatturatoChange: 0,
  progettiCompletati: 0,
  progettiChange: 0,
  nuoviClienti: 0,
  clientiChange: 0,
  oreLavorate: 0,
  oreChange: 0
})

// Performance team - vuoto, da caricare da Firestore
const teamPerformance = ref([])

// Top Materiali - vuoto, da caricare da Firestore
const topMateriali = ref([])

// Top Clienti - vuoto, da caricare da Firestore
const topClienti = ref([])

// Methods
const getValutazioneColor = (valutazione) => {
  const colors = {
    'Eccellente': 'bg-green-100 text-green-800',
    'Ottimo': 'bg-blue-100 text-blue-800',
    'Buono': 'bg-yellow-100 text-yellow-800',
    'Sufficiente': 'bg-gray-100 text-gray-800'
  }
  return colors[valutazione] || 'bg-gray-100 text-gray-800'
}
</script> 