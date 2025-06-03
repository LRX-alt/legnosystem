<template>
  <div class="space-y-6">
    <!-- Header Fornitori -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Fornitori</h1>
        <p class="text-gray-600">Fornitori e ordini - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Fornitore
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Fornitori Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.fornitoriAttivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ShoppingCartIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Ordini Aperti</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.ordiniAperti }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Ordini</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.valoreOrdini.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <TruckIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">In Consegna</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.inConsegna }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri e Azioni -->
    <div class="card">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca fornitori..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select v-model="selectedCategory" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutte le categorie</option>
          <option value="legno">Legno e Derivati</option>
          <option value="ferramenta">Ferramenta</option>
          <option value="isolanti">Isolanti</option>
          <option value="coperture">Coperture</option>
          <option value="trasporti">Trasporti</option>
        </select>
        <select v-model="selectedStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti gli stati</option>
          <option value="attivo">Attivo</option>
          <option value="sospeso">Sospeso</option>
          <option value="inattivo">Non Attivo</option>
        </select>
        <button @click="showComparationModal = true" class="btn-secondary px-6 py-2">
          📊 Confronta Prezzi
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
          <span v-if="tab.count" class="ml-2 bg-gray-100 text-gray-900 py-1 px-2 rounded-full text-xs">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content: Lista Fornitori -->
    <div v-if="activeTab === 'fornitori'" class="space-y-6">
      <!-- Desktop: Tabella -->
      <div class="hidden lg:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornitore</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valutazione</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordini Anno</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="fornitore in filteredFornitori" :key="fornitore.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span class="text-primary-600 font-bold text-sm">{{ fornitore.iniziali }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ fornitore.nome }}</div>
                      <div class="text-sm text-gray-500">{{ fornitore.citta }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryColor(fornitore.categoria)">
                    {{ getCategoryLabel(fornitore.categoria) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex">
                      <StarIcon v-for="i in 5" :key="i" 
                               :class="i <= fornitore.rating ? 'text-yellow-400' : 'text-gray-300'" 
                               class="w-4 h-4" />
                    </div>
                    <span class="ml-2 text-sm text-gray-600">({{ fornitore.rating }}/5)</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ fornitore.ordiniAnno }} ordini<br/>
                  <span class="text-xs text-gray-500">€{{ fornitore.valoreAnno.toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(fornitore.stato)">
                    {{ getStatusLabel(fornitore.stato) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button @click="viewFornitore(fornitore)" class="text-primary-600 hover:text-primary-700">
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button @click="editFornitore(fornitore)" class="text-gray-600 hover:text-gray-700">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="createOrder(fornitore)" class="text-green-600 hover:text-green-700">
                    <ShoppingCartIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile: Cards -->
      <div class="lg:hidden grid grid-cols-1 gap-4">
        <div v-for="fornitore in filteredFornitori" :key="fornitore.id" class="card">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span class="text-primary-600 font-bold">{{ fornitore.iniziali }}</span>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-semibold text-gray-900">{{ fornitore.nome }}</h3>
                <p class="text-xs text-gray-600">{{ fornitore.citta }}</p>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(fornitore.stato)">
              {{ getStatusLabel(fornitore.stato) }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Categoria:</span>
              <span class="font-medium">{{ getCategoryLabel(fornitore.categoria) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Valutazione:</span>
              <div class="flex items-center">
                <div class="flex">
                  <StarIcon v-for="i in 5" :key="i" 
                           :class="i <= fornitore.rating ? 'text-yellow-400' : 'text-gray-300'" 
                           class="w-4 h-4" />
                </div>
                <span class="ml-1 text-xs">({{ fornitore.rating }})</span>
              </div>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Ordini 2024:</span>
              <span class="font-medium">{{ fornitore.ordiniAnno }} - €{{ fornitore.valoreAnno.toLocaleString() }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <button @click="viewFornitore(fornitore)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Visualizza
            </button>
            <div class="flex space-x-2">
              <button @click="editFornitore(fornitore)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="createOrder(fornitore)" class="text-green-500 hover:text-green-700">
                <ShoppingCartIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Ordini -->
    <div v-if="activeTab === 'ordini'" class="space-y-6">
      <div class="grid grid-cols-1 gap-6">
        <div v-for="ordine in ordini" :key="ordine.id" class="card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Ordine #{{ ordine.numero }}</h3>
              <p class="text-sm text-gray-600">{{ ordine.fornitore }} - {{ formatDate(ordine.dataOrdine) }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getOrderStatusColor(ordine.stato)">
              {{ getOrderStatusLabel(ordine.stato) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Valore Ordine</p>
              <p class="text-lg font-bold text-gray-900">€{{ ordine.valore.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Articoli</p>
              <p class="text-lg font-bold text-gray-900">{{ ordine.articoli }} pz</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Consegna Prevista</p>
              <p class="text-lg font-bold" :class="isScaduto(ordine.consegnaPrevista) ? 'text-red-600' : 'text-gray-900'">
                {{ formatDate(ordine.consegnaPrevista) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Progresso</p>
              <div class="flex items-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-primary-500 h-2 rounded-full" :style="`width: ${ordine.progresso}%`"></div>
                </div>
                <span class="text-sm font-medium">{{ ordine.progresso }}%</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <button @click="viewOrder(ordine)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Dettagli Ordine
            </button>
            <div class="flex space-x-2">
              <button v-if="ordine.stato === 'ordinato'" @click="trackOrder(ordine)" class="btn-secondary text-sm py-1 px-3">
                📍 Traccia
              </button>
              <button v-if="ordine.stato === 'spedito'" @click="confirmDelivery(ordine)" class="btn-primary text-sm py-1 px-3">
                ✅ Conferma Consegna
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo Fornitore -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Fornitore</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="addFornitore" class="space-y-6">
            <!-- Info Base -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ragione Sociale *</label>
                <input v-model="newFornitore.nome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select v-model="newFornitore.categoria" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona categoria</option>
                  <option value="legno">Legno e Derivati</option>
                  <option value="ferramenta">Ferramenta</option>
                  <option value="isolanti">Isolanti</option>
                  <option value="coperture">Coperture</option>
                  <option value="trasporti">Trasporti</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Partita IVA *</label>
                <input v-model="newFornitore.partitaIva" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Codice Fiscale</label>
                <input v-model="newFornitore.codiceFiscale" type="text"
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Indirizzo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo *</label>
              <textarea v-model="newFornitore.indirizzo" rows="2" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Città *</label>
                <input v-model="newFornitore.citta" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">CAP *</label>
                <input v-model="newFornitore.cap" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                <input v-model="newFornitore.provincia" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Contatti -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                <input v-model="newFornitore.telefono" type="tel" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input v-model="newFornitore.email" type="email" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Fornitore
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  TruckIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showAddModal = ref(false)
const showComparationModal = ref(false)
const activeTab = ref('fornitori')
const searchTerm = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// Stats
const stats = ref({
  fornitoriAttivi: 15,
  ordiniAperti: 8,
  valoreOrdini: 145000,
  inConsegna: 5
})

// Tabs
const tabs = ref([
  { id: 'fornitori', name: 'Fornitori', count: 15 },
  { id: 'ordini', name: 'Ordini', count: 23 },
  { id: 'listini', name: 'Listini', count: 8 }
])

// Nuovo Fornitore
const newFornitore = ref({
  nome: '',
  categoria: '',
  partitaIva: '',
  codiceFiscale: '',
  indirizzo: '',
  citta: '',
  cap: '',
  provincia: '',
  telefono: '',
  email: ''
})

// Dati Fornitori
const fornitori = ref([
  {
    id: 1,
    nome: 'LegnoAlp Spa',
    iniziali: 'LA',
    categoria: 'legno',
    partitaIva: '12345678901',
    indirizzo: 'Via Industria 15',
    citta: 'Bolzano',
    cap: '39100',
    provincia: 'BZ',
    telefono: '+39 0471 123456',
    email: 'ordini@legnoalp.it',
    rating: 5,
    stato: 'attivo',
    ordiniAnno: 24,
    valoreAnno: 89500,
    tempoConsegna: 7
  },
  {
    id: 2,
    nome: 'Segheria Montana Srl',
    iniziali: 'SM',
    categoria: 'legno',
    partitaIva: '98765432109',
    indirizzo: 'Strada Montana 82',
    citta: 'Trento',
    cap: '38123',
    provincia: 'TN',
    telefono: '+39 0461 987654',
    email: 'info@segheriamont.it',
    rating: 4,
    stato: 'attivo',
    ordiniAnno: 18,
    valoreAnno: 67200,
    tempoConsegna: 5
  },
  {
    id: 3,
    nome: 'Isolanti Nord Srl',
    iniziali: 'IN',
    categoria: 'isolanti',
    partitaIva: '11223344556',
    indirizzo: 'Via Nazionale 234',
    citta: 'Verona',
    cap: '37100',
    provincia: 'VR',
    telefono: '+39 045 567890',
    email: 'vendite@isolantinord.com',
    rating: 4,
    stato: 'attivo',
    ordiniAnno: 12,
    valoreAnno: 34800,
    tempoConsegna: 3
  }
])

// Ordini
const ordini = ref([
  {
    id: 1,
    numero: '2024-001',
    fornitore: 'LegnoAlp Spa',
    dataOrdine: '2024-01-15',
    consegnaPrevista: '2024-01-22',
    valore: 12500,
    articoli: 15,
    stato: 'consegnato',
    progresso: 100
  },
  {
    id: 2,
    numero: '2024-002',
    fornitore: 'Segheria Montana Srl',
    dataOrdine: '2024-01-16',
    consegnaPrevista: '2024-01-21',
    valore: 8900,
    articoli: 23,
    stato: 'spedito',
    progresso: 80
  },
  {
    id: 3,
    numero: '2024-003',
    fornitore: 'Isolanti Nord Srl',
    dataOrdine: '2024-01-17',
    consegnaPrevista: '2024-01-20',
    valore: 5600,
    articoli: 8,
    stato: 'ordinato',
    progresso: 30
  }
])

// Computed
const filteredFornitori = computed(() => {
  let result = fornitori.value

  if (searchTerm.value) {
    result = result.filter(f => 
      f.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      f.citta.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    result = result.filter(f => f.categoria === selectedCategory.value)
  }

  if (selectedStatus.value) {
    result = result.filter(f => f.stato === selectedStatus.value)
  }

  return result
})

// Methods
const getCategoryColor = (categoria) => {
  const colors = {
    'legno': 'bg-green-100 text-green-800',
    'ferramenta': 'bg-blue-100 text-blue-800',
    'isolanti': 'bg-yellow-100 text-yellow-800',
    'coperture': 'bg-purple-100 text-purple-800',
    'trasporti': 'bg-orange-100 text-orange-800'
  }
  return colors[categoria] || 'bg-gray-100 text-gray-800'
}

const getCategoryLabel = (categoria) => {
  const labels = {
    'legno': 'Legno',
    'ferramenta': 'Ferramenta',
    'isolanti': 'Isolanti',
    'coperture': 'Coperture',
    'trasporti': 'Trasporti'
  }
  return labels[categoria] || categoria
}

const getStatusColor = (stato) => {
  const colors = {
    'attivo': 'bg-green-100 text-green-800',
    'sospeso': 'bg-yellow-100 text-yellow-800',
    'inattivo': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'attivo': 'Attivo',
    'sospeso': 'Sospeso',
    'inattivo': 'Non Attivo'
  }
  return labels[stato] || stato
}

const getOrderStatusColor = (stato) => {
  const colors = {
    'ordinato': 'bg-blue-100 text-blue-800',
    'spedito': 'bg-yellow-100 text-yellow-800',
    'consegnato': 'bg-green-100 text-green-800',
    'annullato': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getOrderStatusLabel = (stato) => {
  const labels = {
    'ordinato': 'Ordinato',
    'spedito': 'Spedito',
    'consegnato': 'Consegnato',
    'annullato': 'Annullato'
  }
  return labels[stato] || stato
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const isScaduto = (dateString) => {
  return new Date(dateString) < new Date()
}

const viewFornitore = (fornitore) => {
  alert(`📋 Dettagli ${fornitore.nome}:\n\n📍 ${fornitore.indirizzo}, ${fornitore.citta}\n📞 ${fornitore.telefono}\n📧 ${fornitore.email}\n⭐ Rating: ${fornitore.rating}/5\n📦 Ordini 2024: ${fornitore.ordiniAnno}\n💰 Valore: €${fornitore.valoreAnno.toLocaleString()}`)
}

const editFornitore = (fornitore) => {
  alert(`✏️ Modifica fornitore ${fornitore.nome} - Funzionalità in implementazione`)
}

const createOrder = (fornitore) => {
  alert(`🛒 Nuovo ordine per ${fornitore.nome}\n\n⏱️ Tempo consegna: ${fornitore.tempoConsegna} giorni\n⭐ Rating: ${fornitore.rating}/5\n\n📋 Sistema ordini in implementazione`)
}

const viewOrder = (ordine) => {
  alert(`📦 Ordine #${ordine.numero}\n\n🏭 Fornitore: ${ordine.fornitore}\n💰 Valore: €${ordine.valore.toLocaleString()}\n📦 Articoli: ${ordine.articoli}\n📅 Consegna: ${formatDate(ordine.consegnaPrevista)}\n📊 Progresso: ${ordine.progresso}%`)
}

const trackOrder = (ordine) => {
  alert(`📍 Tracking Ordine #${ordine.numero}\n\n🚚 Stato: In preparazione\n📦 Pacco preparato: ${ordine.progresso}%\n📍 Posizione: Magazzino fornitore\n⏰ Aggiornamento: 2 ore fa`)
}

const confirmDelivery = (ordine) => {
  ordine.stato = 'consegnato'
  ordine.progresso = 100
  alert(`✅ Consegna confermata!\n\nOrdine #${ordine.numero} ricevuto e verificato.`)
}

const addFornitore = () => {
  if (!newFornitore.value.nome || !newFornitore.value.categoria) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const nuovoFornitore = {
    id: Date.now(),
    ...newFornitore.value,
    iniziali: newFornitore.value.nome.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2),
    rating: 0,
    stato: 'attivo',
    ordiniAnno: 0,
    valoreAnno: 0,
    tempoConsegna: 7
  }

  fornitori.value.push(nuovoFornitore)
  stats.value.fornitoriAttivi++

  // Reset form
  newFornitore.value = {
    nome: '',
    categoria: '',
    partitaIva: '',
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    email: ''
  }

  closeAddModal()
  alert(`✅ Fornitore "${nuovoFornitore.nome}" aggiunto con successo!`)
}

const closeAddModal = () => {
  showAddModal.value = false
  newFornitore.value = {
    nome: '',
    categoria: '',
    partitaIva: '',
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    email: ''
  }
}
</script> 