<template>
  <div class="space-y-6">
    <!-- Header Preventivi -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Preventivi</h1>
        <p class="text-gray-600">Pipeline vendite e offerte - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Preventivo
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <DocumentTextIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Preventivi Aperti</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.preventiviAperti }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Pipeline</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.valorePipeline.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ChartBarIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Tasso Conversione</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tassoConversione }}%</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Tempo Medio</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tempoMedio }}gg</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca preventivi..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select v-model="selectedStato" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti gli stati</option>
          <option value="bozza">Bozza</option>
          <option value="inviato">Inviato</option>
          <option value="accettato">Accettato</option>
          <option value="rifiutato">Rifiutato</option>
          <option value="scaduto">Scaduto</option>
        </select>
        <select v-model="selectedCliente" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti i clienti</option>
          <option value="Famiglia Rossi">Famiglia Rossi</option>
          <option value="Industrie SpA">Industrie SpA</option>
          <option value="Comune di Verona">Comune di Verona</option>
        </select>
      </div>
    </div>

    <!-- Lista Preventivi -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <div v-for="preventivo in filteredPreventivi" :key="preventivo.id" class="card hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ preventivo.numero }}</h3>
            <p class="text-sm font-medium text-gray-700">{{ preventivo.cliente }}</p>
            <p class="text-xs text-gray-500">{{ preventivo.contatto }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatoColor(preventivo.stato)">
            {{ getStatoLabel(preventivo.stato) }}
          </span>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-900 mb-1">{{ preventivo.progetto }}</h4>
          <p class="text-xs text-gray-600">{{ preventivo.tipoLavoro }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">Importo</p>
            <p class="text-lg font-bold text-gray-900">€{{ preventivo.importo.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Data Invio</p>
            <p class="text-sm font-medium text-gray-900">{{ formatDate(preventivo.dataInvio) }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-1">Scadenza</p>
          <p class="text-sm font-medium" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
            {{ formatDate(preventivo.scadenza) }}
            <span v-if="isScaduto(preventivo.scadenza)" class="text-xs ml-1">(Scaduto)</span>
          </p>
        </div>

        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="viewPreventivo(preventivo)" class="w-full btn-primary py-2 text-sm">Visualizza</button>
          <div class="grid grid-cols-2 gap-2">
            <button @click="editPreventivo(preventivo)" class="btn-secondary py-2 text-sm">Modifica</button>
            <button @click="sendPreventivo(preventivo)" class="bg-accent-500 hover:bg-accent-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Invia
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div class="hidden lg:block card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progetto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Invio</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="preventivo in filteredPreventivi" :key="preventivo.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ preventivo.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ preventivo.cliente }}</div>
                  <div class="text-sm text-gray-500">{{ preventivo.contatto }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ preventivo.progetto }}</div>
                  <div class="text-sm text-gray-500">{{ preventivo.tipoLavoro }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                €{{ preventivo.importo.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(preventivo.dataInvio) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
                {{ formatDate(preventivo.scadenza) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatoColor(preventivo.stato)">
                  {{ getStatoLabel(preventivo.stato) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewPreventivo(preventivo)" class="text-primary-600 hover:text-primary-900">Visualizza</button>
                  <button @click="editPreventivo(preventivo)" class="text-gray-600 hover:text-gray-900">Modifica</button>
                  <button @click="sendPreventivo(preventivo)" class="text-accent-600 hover:text-accent-900">Invia</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showAddModal = ref(false)
const searchTerm = ref('')
const selectedStato = ref('')
const selectedCliente = ref('')

// Stats
const stats = ref({
  preventiviAperti: 15,
  valorePipeline: 425000,
  tassoConversione: 72,
  tempoMedio: 14
})

// Dati preventivi
const preventivi = ref([
  {
    id: 1,
    numero: 'PRV-2024-001',
    cliente: 'Famiglia Rossi',
    contatto: 'mario.rossi@email.com',
    progetto: 'Tetto Villa Rossi',
    tipoLavoro: 'Rifacimento Completo',
    importo: 85000,
    dataInvio: '2024-01-10',
    scadenza: '2024-02-10',
    stato: 'accettato'
  },
  {
    id: 2,
    numero: 'PRV-2024-002',
    cliente: 'Industrie SpA',
    contatto: 'info@industriespa.it',
    progetto: 'Copertura Capannone',
    tipoLavoro: 'Nuova Costruzione',
    importo: 125000,
    dataInvio: '2024-01-15',
    scadenza: '2024-02-15',
    stato: 'inviato'
  },
  {
    id: 3,
    numero: 'PRV-2024-003',
    cliente: 'Comune di Verona',
    contatto: 'tecnico@comune.verona.it',
    progetto: 'Restauro Tetto Storico',
    tipoLavoro: 'Restauro Conservativo',
    importo: 75000,
    dataInvio: '2024-01-20',
    scadenza: '2024-02-20',
    stato: 'bozza'
  }
])

// Computed
const filteredPreventivi = computed(() => {
  let result = preventivi.value

  if (searchTerm.value) {
    result = result.filter(p => 
      p.numero.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.progetto.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStato.value) {
    result = result.filter(p => p.stato === selectedStato.value)
  }

  if (selectedCliente.value) {
    result = result.filter(p => p.cliente === selectedCliente.value)
  }

  return result
})

// Methods
const getStatoColor = (stato) => {
  const colors = {
    'bozza': 'bg-gray-100 text-gray-800',
    'inviato': 'bg-blue-100 text-blue-800',
    'accettato': 'bg-green-100 text-green-800',
    'rifiutato': 'bg-red-100 text-red-800',
    'scaduto': 'bg-yellow-100 text-yellow-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'bozza': 'Bozza',
    'inviato': 'Inviato',
    'accettato': 'Accettato',
    'rifiutato': 'Rifiutato',
    'scaduto': 'Scaduto'
  }
  return labels[stato] || stato
}

const isScaduto = (scadenza) => {
  return new Date(scadenza) < new Date()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewPreventivo = (preventivo) => {
  console.log('Visualizza preventivo:', preventivo)
}

const editPreventivo = (preventivo) => {
  console.log('Modifica preventivo:', preventivo)
}

const sendPreventivo = (preventivo) => {
  console.log('Invia preventivo:', preventivo)
}
</script> 