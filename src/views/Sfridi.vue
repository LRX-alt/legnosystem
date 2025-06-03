<template>
  <div class="space-y-6">
    <!-- Header Sfridi -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-display font-bold text-primary-800">Gestione Sfridi</h1>
        <p class="text-gray-600 text-sm sm:text-base">Materiali di ritorno dal cantiere - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <ArrowPathRoundedSquareIcon class="w-5 h-5 mr-2" />
        Registra Sfrido
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CubeIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Sfridi Disponibili</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.disponibili }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-accent-600 font-medium">+12% questo mese</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Totale</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">€{{ stats.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-gray-600">Stimato al 70%</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ArrowUturnRightIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Riutilizzati</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.riutilizzati }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-green-600 font-medium">85% efficienza</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Da Smaltire</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.daSmaltire }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-yellow-600 font-medium">Attenzione</span>
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
            placeholder="Cerca sfridi..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
          />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStato" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti gli stati</option>
            <option value="disponibile">Disponibile</option>
            <option value="riutilizzato">Riutilizzato</option>
            <option value="da-smaltire">Da Smaltire</option>
            <option value="smaltito">Smaltito</option>
          </select>
        </div>
        <div class="w-full sm:w-52">
          <select v-model="selectedCantiere" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti i cantieri</option>
            <option value="villa-rossi">Villa Rossi</option>
            <option value="capannone-industriale">Capannone Industriale</option>
            <option value="tetto-storico">Tetto Storico</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista Sfridi - Mobile -->
    <div class="block lg:hidden space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Materiali di Recupero</h3>
      <div v-for="sfrido in filteredSfridi" :key="sfrido.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-12 h-12 bg-wood-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-primary-600 text-base font-bold">{{ sfrido.codice }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-lg font-semibold text-gray-900 truncate">{{ sfrido.nome }}</h4>
              <p class="text-base text-gray-600 truncate">{{ sfrido.dimensioni }}</p>
              <p class="text-sm text-gray-500">Da: {{ sfrido.cantiere }}</p>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2 ml-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(sfrido.stato)">
              {{ getStatoLabel(sfrido.stato) }}
            </span>
            <span class="text-sm text-gray-500">{{ formatDate(sfrido.dataRitorno) }}</span>
          </div>
        </div>

        <!-- Dettagli Quantità -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Quantità</p>
            <p class="text-lg font-bold text-gray-900">{{ sfrido.quantita }}</p>
            <p class="text-sm text-gray-500">{{ sfrido.unita }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Condizione</p>
            <p class="text-base font-medium" :class="getCondizioneColor(sfrido.condizione)">{{ sfrido.condizione }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Valore Stimato</p>
            <p class="text-lg font-bold text-primary-600">€{{ sfrido.valoreStimato.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Note -->
        <div v-if="sfrido.note" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500 mb-1">Note</p>
          <p class="text-base text-gray-700">{{ sfrido.note }}</p>
        </div>

        <!-- Azioni Mobile -->
        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button v-if="sfrido.stato === 'disponibile'" @click="riutilizzaSfrido(sfrido)" 
                  class="w-full btn-primary py-3 text-base font-medium"
                  title="Riutilizza questo materiale">
            ♻️ Riutilizza
          </button>
          <button v-if="sfrido.stato === 'disponibile'" @click="marcaSmaltimento(sfrido)" 
                  class="w-full btn-secondary py-3 text-base font-medium"
                  title="Marca per smaltimento">
            🗑️ Marca per Smaltimento
          </button>
          <button @click="editSfrido(sfrido)" 
                  class="w-full btn-secondary py-3 text-base font-medium"
                  title="Modifica sfrido">
            ✏️ Modifica
          </button>
        </div>
      </div>
    </div>

    <!-- Tabella Sfridi - Desktop -->
    <div class="hidden lg:block">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Materiali di Recupero</h3>
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Materiale</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Quantità</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Condizione</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Valore</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th class="px-6 py-4 text-right text-base font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sfrido in filteredSfridi" :key="sfrido.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center mr-4">
                      <span class="text-primary-600 text-base font-medium">{{ sfrido.codice }}</span>
                    </div>
                    <div>
                      <div class="text-base font-medium text-gray-900">{{ sfrido.nome }}</div>
                      <div class="text-base text-gray-500">{{ sfrido.dimensioni }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-base text-gray-900">{{ sfrido.cantiere }}</div>
                  <div class="text-base text-gray-500">{{ formatDate(sfrido.dataRitorno) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ sfrido.quantita }} {{ sfrido.unita }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-base font-medium" :class="getCondizioneColor(sfrido.condizione)">{{ sfrido.condizione }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">€{{ sfrido.valoreStimato.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(sfrido.stato)">
                    {{ getStatoLabel(sfrido.stato) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-base font-medium space-x-2">
                  <button v-if="sfrido.stato === 'disponibile'" @click="riutilizzaSfrido(sfrido)" 
                          class="text-green-600 hover:text-green-900"
                          title="Riutilizza questo materiale">
                    Riutilizza
                  </button>
                  <button v-if="sfrido.stato === 'disponibile'" @click="marcaSmaltimento(sfrido)" 
                          class="text-yellow-600 hover:text-yellow-900"
                          title="Marca per smaltimento">
                    Smaltisci
                  </button>
                  <button @click="editSfrido(sfrido)" 
                          class="text-primary-600 hover:text-primary-900"
                          title="Modifica sfrido">
                    Modifica
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Aggiungi Sfrido -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Registra Nuovo Sfrido</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveSfrido" class="space-y-6">
            <!-- Nome e Codice -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
                <input
                  v-model="nuovoSfrido.nome"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
                <input
                  v-model="nuovoSfrido.codice"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Cantiere e Data -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cantiere di Provenienza</label>
                <select
                  v-model="nuovoSfrido.cantiere"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">Seleziona cantiere</option>
                  <option value="Villa Rossi">Villa Rossi</option>
                  <option value="Capannone Industriale">Capannone Industriale</option>
                  <option value="Tetto Storico">Tetto Storico</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Ritorno</label>
                <input
                  v-model="nuovoSfrido.dataRitorno"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Dimensioni -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dimensioni</label>
              <input
                v-model="nuovoSfrido.dimensioni"
                type="text"
                placeholder="es. 200x50x30mm"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Quantità e Unità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità</label>
                <input
                  v-model.number="nuovoSfrido.quantita"
                  type="number"
                  min="1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unità di Misura</label>
                <select
                  v-model="nuovoSfrido.unita"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pz">Pezzi</option>
                  <option value="m²">Metri quadri</option>
                  <option value="m³">Metri cubi</option>
                  <option value="ml">Metri lineari</option>
                  <option value="kg">Chilogrammi</option>
                </select>
              </div>
            </div>

            <!-- Condizione e Valore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Condizione</label>
                <select
                  v-model="nuovoSfrido.condizione"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="Ottima">Ottima</option>
                  <option value="Buona">Buona</option>
                  <option value="Discreta">Discreta</option>
                  <option value="Scadente">Scadente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valore Stimato (€)</label>
                <input
                  v-model.number="nuovoSfrido.valoreStimato"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea
                v-model="nuovoSfrido.note"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                placeholder="Eventuali note sul materiale..."
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Registra Sfrido
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
  ArrowPathRoundedSquareIcon,
  CubeIcon,
  CurrencyEuroIcon,
  ArrowUturnRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showAddModal = ref(false)
const searchTerm = ref('')
const selectedStato = ref('')
const selectedCantiere = ref('')

// Nuovo sfrido
const nuovoSfrido = ref({
  nome: '',
  codice: '',
  cantiere: '',
  dataRitorno: '',
  dimensioni: '',
  quantita: 1,
  unita: 'pz',
  condizione: 'Buona',
  valoreStimato: 0,
  note: ''
})

// Stats
const stats = ref({
  disponibili: 42,
  valoreTotale: 8500,
  riutilizzati: 18,
  daSmaltire: 6
})

// Dati sfridi
const sfridi = ref([
  {
    id: 1,
    codice: 'SFR001',
    nome: 'Travi Abete',
    dimensioni: '200x80x3000mm',
    cantiere: 'Villa Rossi',
    quantita: 8,
    unita: 'pz',
    condizione: 'Ottima',
    valoreStimato: 320.00,
    stato: 'disponibile',
    dataRitorno: '2024-01-15',
    note: 'Tagliate ma perfette per piccoli progetti'
  },
  {
    id: 2,
    codice: 'SFR002',
    nome: 'Tavole Larice',
    dimensioni: '25x150x2500mm',
    cantiere: 'Capannone Industriale',
    quantita: 15,
    unita: 'pz',
    condizione: 'Buona',
    valoreStimato: 225.00,
    stato: 'riutilizzato',
    dataRitorno: '2024-01-12',
    note: 'Riutilizzate per scaffalature'
  },
  {
    id: 3,
    codice: 'SFR003',
    nome: 'Isolante Termico',
    dimensioni: '1200x600x100mm',
    cantiere: 'Villa Rossi',
    quantita: 12,
    unita: 'm²',
    condizione: 'Discreta',
    valoreStimato: 84.00,
    stato: 'da-smaltire',
    dataRitorno: '2024-01-10',
    note: 'Tagliato irregolarmente, difficile riutilizzo'
  },
  {
    id: 4,
    codice: 'SFR004',
    nome: 'Pannelli OSB',
    dimensioni: '2500x1250x18mm',
    cantiere: 'Tetto Storico',
    quantita: 6,
    unita: 'pz',
    condizione: 'Ottima',
    valoreStimato: 150.00,
    stato: 'disponibile',
    dataRitorno: '2024-01-08',
    note: 'Pannelli quasi integri, ottimi per riutilizzo'
  }
])

// Computed
const filteredSfridi = computed(() => {
  let result = sfridi.value

  if (searchTerm.value) {
    result = result.filter(s => 
      s.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      s.codice.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStato.value) {
    result = result.filter(s => s.stato === selectedStato.value)
  }

  if (selectedCantiere.value) {
    result = result.filter(s => s.cantiere.toLowerCase().includes(selectedCantiere.value.toLowerCase()))
  }

  return result
})

// Methods
const getStatoColor = (stato) => {
  const colors = {
    'disponibile': 'bg-green-100 text-green-800',
    'riutilizzato': 'bg-blue-100 text-blue-800',
    'da-smaltire': 'bg-yellow-100 text-yellow-800',
    'smaltito': 'bg-gray-100 text-gray-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'disponibile': 'Disponibile',
    'riutilizzato': 'Riutilizzato',
    'da-smaltire': 'Da Smaltire',
    'smaltito': 'Smaltito'
  }
  return labels[stato] || stato
}

const getCondizioneColor = (condizione) => {
  const colors = {
    'Ottima': 'text-green-600',
    'Buona': 'text-blue-600',
    'Discreta': 'text-yellow-600',
    'Scadente': 'text-red-600'
  }
  return colors[condizione] || 'text-gray-600'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const riutilizzaSfrido = (sfrido) => {
  sfrido.stato = 'riutilizzato'
  alert(`✅ Sfrido "${sfrido.nome}" marcato come riutilizzato!`)
}

const marcaSmaltimento = (sfrido) => {
  sfrido.stato = 'da-smaltire'
  alert(`⚠️ Sfrido "${sfrido.nome}" marcato per smaltimento`)
}

const editSfrido = (sfrido) => {
  alert(`✏️ Modifica sfrido: ${sfrido.nome}\n\nFunzione in sviluppo`)
}

const saveSfrido = () => {
  const newId = Math.max(...sfridi.value.map(s => s.id)) + 1
  sfridi.value.unshift({
    ...nuovoSfrido.value,
    id: newId,
    stato: 'disponibile'
  })
  
  // Reset form
  nuovoSfrido.value = {
    nome: '',
    codice: '',
    cantiere: '',
    dataRitorno: '',
    dimensioni: '',
    quantita: 1,
    unita: 'pz',
    condizione: 'Buona',
    valoreStimato: 0,
    note: ''
  }
  
  closeAddModal()
  alert('✅ Sfrido registrato con successo!')
}

const closeAddModal = () => {
  showAddModal.value = false
}
</script> 