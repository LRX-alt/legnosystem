<template>
  <div class="space-y-6">
    <!-- Header Clienti -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Clienti</h1>
        <p class="text-gray-600">Anagrafica e storico progetti - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Cliente
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <UserGroupIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Clienti Totali</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.clientiTotali }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Fatturato Annuo</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.fatturatoAnnuo.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Progetti Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.progettiAttivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <StarIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Soddisfazione</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.soddisfazione }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca clienti..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
          />
        </div>
        <div class="w-full sm:w-40">
          <select v-model="selectedTipo" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti i tipi</option>
            <option value="privato">Privato</option>
            <option value="azienda">Azienda</option>
            <option value="ente-pubblico">Ente Pubblico</option>
          </select>
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStato" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivo</option>
            <option value="potenziale">Potenziale</option>
            <option value="inattivo">Inattivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista Clienti -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <div v-for="cliente in filteredClienti" :key="cliente.id" class="card hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {{ cliente.iniziali }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ cliente.nome }}</h3>
            <p class="text-base text-gray-600 truncate">{{ cliente.email }}</p>
          </div>
          <div class="flex flex-col items-end space-y-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getTipoColor(cliente.tipo)">
              {{ getTipoLabel(cliente.tipo) }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(cliente.stato)">
              {{ getStatoLabel(cliente.stato) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Progetti</p>
            <p class="text-lg font-bold text-gray-900">{{ cliente.numeroProgetti }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Valore Totale</p>
            <p class="text-lg font-bold text-gray-900">€{{ cliente.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-1">Ultimo Contatto</p>
          <p class="text-base font-medium text-gray-900">{{ formatDate(cliente.ultimoContatto) }}</p>
        </div>

        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="viewCliente(cliente)" 
                  class="w-full btn-primary py-3 text-base font-medium"
                  title="Visualizza dettagli cliente">
            👤 Visualizza Cliente
          </button>
          <button @click="editCliente(cliente)" 
                  class="w-full btn-secondary py-3 text-base font-medium"
                  title="Modifica dati cliente">
            ✏️ Modifica
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div class="hidden lg:block card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Progetti</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Valore Totale</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Ultimo Contatto</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cliente in filteredClienti" :key="cliente.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {{ cliente.iniziali }}
                  </div>
                  <div>
                    <div class="text-base font-medium text-gray-900">{{ cliente.nome }}</div>
                    <div class="text-base text-gray-500">{{ cliente.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getTipoColor(cliente.tipo)">
                  {{ getTipoLabel(cliente.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ cliente.numeroProgetti }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">€{{ cliente.valoreTotale.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ formatDate(cliente.ultimoContatto) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(cliente.stato)">
                  {{ getStatoLabel(cliente.stato) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-medium">
                <div class="flex space-x-2">
                  <button @click="viewCliente(cliente)" 
                          class="text-primary-600 hover:text-primary-900"
                          title="Visualizza dettagli cliente">
                    Visualizza
                  </button>
                  <button @click="editCliente(cliente)" 
                          class="text-gray-600 hover:text-gray-900"
                          title="Modifica dati cliente">
                    Modifica
                  </button>
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
  UserGroupIcon, 
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showAddModal = ref(false)
const searchTerm = ref('')
const selectedTipo = ref('')
const selectedStato = ref('')

// Stats
const stats = ref({
  clientiTotali: 47,
  fatturatoAnnuo: 485000,
  progettiAttivi: 8,
  soddisfazione: 96
})

// Dati clienti
const clienti = ref([
  {
    id: 1,
    nome: 'Famiglia Rossi',
    email: 'mario.rossi@email.com',
    telefono: '331 123 4567',
    iniziali: 'FR',
    tipo: 'privato',
    stato: 'attivo',
    numeroProgetti: 2,
    valoreTotale: 125000,
    ultimoContatto: '2024-01-15',
    indirizzo: 'Via delle Rose 12, Milano'
  },
  {
    id: 2,
    nome: 'Industrie SpA',
    email: 'info@industriespa.it',
    telefono: '02 234 5678',
    iniziali: 'IS',
    tipo: 'azienda',
    stato: 'attivo',
    numeroProgetti: 3,
    valoreTotale: 285000,
    ultimoContatto: '2024-01-20',
    indirizzo: 'Zona Industriale Nord, Bergamo'
  }
])

// Computed
const filteredClienti = computed(() => {
  let result = clienti.value

  if (searchTerm.value) {
    result = result.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedTipo.value) {
    result = result.filter(c => c.tipo === selectedTipo.value)
  }

  if (selectedStato.value) {
    result = result.filter(c => c.stato === selectedStato.value)
  }

  return result
})

// Methods
const getTipoColor = (tipo) => {
  const colors = {
    'privato': 'bg-blue-100 text-blue-800',
    'azienda': 'bg-green-100 text-green-800',
    'ente-pubblico': 'bg-purple-100 text-purple-800'
  }
  return colors[tipo] || 'bg-gray-100 text-gray-800'
}

const getTipoLabel = (tipo) => {
  const labels = {
    'privato': 'Privato',
    'azienda': 'Azienda',
    'ente-pubblico': 'Ente Pubblico'
  }
  return labels[tipo] || tipo
}

const getStatoColor = (stato) => {
  const colors = {
    'attivo': 'bg-green-100 text-green-800',
    'potenziale': 'bg-yellow-100 text-yellow-800',
    'inattivo': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'attivo': 'Attivo',
    'potenziale': 'Potenziale',
    'inattivo': 'Inattivo'
  }
  return labels[stato] || stato
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewCliente = (cliente) => {
  console.log('Visualizza cliente:', cliente)
}

const editCliente = (cliente) => {
  console.log('Modifica cliente:', cliente)
}
</script> 