<template>
  <div class="space-y-6">
    <!-- Header Magazzino - Mobile Optimized -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-display font-bold text-primary-800">Gestione Magazzino</h1>
        <p class="text-gray-600 text-sm sm:text-base">Inventario materiali - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <PlusIcon class="w-5 h-5 mr-2" />
        Aggiungi Materiale
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <CubeIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Totale Articoli</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.totaleArticoli }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Totale</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">€{{ stats.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Sotto Scorta</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.sottoScorta }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri e Ricerca -->
    <div class="card">
      <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca materiali..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
          />
        </div>
        <div class="w-full sm:w-52">
          <select v-model="selectedCategory" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutte le categorie</option>
            <option value="travi">Travi</option>
            <option value="tavole">Tavole</option>
            <option value="isolanti">Isolanti</option>
            <option value="ferramenta">Ferramenta</option>
            <option value="accessori">Accessori</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista Materiali -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <div v-for="materiale in filteredMateriali" :key="materiale.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-12 h-12 bg-wood-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 truncate">{{ materiale.nome }}</h3>
              <p class="text-base text-gray-600 truncate">{{ materiale.descrizione }}</p>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2 ml-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getCategoryColor(materiale.categoria)">
              {{ materiale.categoria }}
            </span>
            <span v-if="materiale.quantita > materiale.scorteMinime" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Disponibile
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
              Sotto scorta
            </span>
          </div>
        </div>

        <!-- Info Grid Mobile -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Quantità</p>
            <p class="text-lg font-bold text-gray-900">{{ materiale.quantita }} {{ materiale.unita }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Prezzo/Unità</p>
            <p class="text-lg font-bold text-gray-900">€{{ materiale.prezzoUnitario.toFixed(2) }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-1">Valore Totale</p>
          <p class="text-xl font-bold text-primary-600">€{{ (materiale.quantita * materiale.prezzoUnitario).toFixed(2) }}</p>
        </div>

        <!-- Azioni Mobile -->
        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="editMateriale(materiale)" 
                  class="w-full btn-primary py-2 text-base font-medium"
                  title="Modifica materiale">
            ✏️ Modifica Materiale
          </button>
          <button @click="deleteMateriale(materiale.id)" 
                  class="w-full btn-secondary py-2 text-base font-medium text-red-600 border-red-300 hover:bg-red-50"
                  title="Elimina materiale">
            🗑️ Elimina
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
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Materiale
              </th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Quantità
              </th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Prezzo/Unità
              </th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Valore Totale
              </th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th class="px-6 py-4 text-right text-base font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="materiale in filteredMateriali" :key="materiale.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center mr-4">
                    <span class="text-primary-600 text-base font-medium">{{ materiale.codice }}</span>
                  </div>
                  <div>
                    <div class="text-base font-medium text-gray-900">{{ materiale.nome }}</div>
                    <div class="text-base text-gray-500">{{ materiale.descrizione }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getCategoryColor(materiale.categoria)">
                  {{ materiale.categoria }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                {{ materiale.quantita }} {{ materiale.unita }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                €{{ materiale.prezzoUnitario.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                €{{ (materiale.quantita * materiale.prezzoUnitario).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="materiale.quantita > materiale.scorteMinime" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Disponibile
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Sotto scorta
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                <button @click="editMateriale(materiale)" 
                        class="text-primary-600 hover:text-primary-900 mr-3"
                        title="Modifica materiale">
                  Modifica
                </button>
                <button @click="deleteMateriale(materiale.id)" 
                        class="text-red-600 hover:text-red-900"
                        title="Elimina materiale">
                  Elimina
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Aggiungi Materiale -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Aggiungi Nuovo Materiale</h3>
            <button @click="closeAddModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveMateriale" class="space-y-6">
            <!-- Codice e Nome -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Codice *</label>
                <input v-model="newMateriale.codice" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Nome *</label>
                <input v-model="newMateriale.nome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Descrizione *</label>
              <input v-model="newMateriale.descrizione" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
            </div>

            <!-- Categoria e Unità -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Categoria *</label>
                <select v-model="newMateriale.categoria" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona categoria</option>
                  <option value="travi">Travi</option>
                  <option value="tavole">Tavole</option>
                  <option value="isolanti">Isolanti</option>
                  <option value="ferramenta">Ferramenta</option>
                  <option value="accessori">Accessori</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Unità di Misura *</label>
                <select v-model="newMateriale.unita" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona unità</option>
                  <option value="pz">Pezzi (pz)</option>
                  <option value="m">Metri (m)</option>
                  <option value="m²">Metri Quadri (m²)</option>
                  <option value="m³">Metri Cubi (m³)</option>
                  <option value="kg">Chilogrammi (kg)</option>
                  <option value="conf">Confezioni (conf)</option>
                </select>
              </div>
            </div>

            <!-- Quantità, Prezzo e Scorte -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Quantità *</label>
                <input v-model.number="newMateriale.quantita" type="number" min="0" step="0.01" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Prezzo Unitario (€) *</label>
                <input v-model.number="newMateriale.prezzoUnitario" type="number" min="0" step="0.01" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Scorte Minime *</label>
                <input v-model.number="newMateriale.scorteMinime" type="number" min="0" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                📦 Aggiungi Materiale
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Materiale -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Materiale</h3>
            <button @click="closeEditModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveEditMateriale" class="space-y-6">
            <!-- Codice e Nome -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Codice *</label>
                <input v-model="editingMateriale.codice" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Nome *</label>
                <input v-model="editingMateriale.nome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Descrizione *</label>
              <input v-model="editingMateriale.descrizione" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
            </div>

            <!-- Categoria e Unità -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Categoria *</label>
                <select v-model="editingMateriale.categoria" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona categoria</option>
                  <option value="travi">Travi</option>
                  <option value="tavole">Tavole</option>
                  <option value="isolanti">Isolanti</option>
                  <option value="ferramenta">Ferramenta</option>
                  <option value="accessori">Accessori</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Unità di Misura *</label>
                <select v-model="editingMateriale.unita" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona unità</option>
                  <option value="pz">Pezzi (pz)</option>
                  <option value="m">Metri (m)</option>
                  <option value="m²">Metri Quadri (m²)</option>
                  <option value="m³">Metri Cubi (m³)</option>
                  <option value="kg">Chilogrammi (kg)</option>
                  <option value="conf">Confezioni (conf)</option>
                </select>
              </div>
            </div>

            <!-- Quantità, Prezzo e Scorte -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Quantità *</label>
                <input v-model.number="editingMateriale.quantita" type="number" min="0" step="0.01" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Prezzo Unitario (€) *</label>
                <input v-model.number="editingMateriale.prezzoUnitario" type="number" min="0" step="0.01" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Scorte Minime *</label>
                <input v-model.number="editingMateriale.scorteMinime" type="number" min="0" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                ✏️ Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  CubeIcon, 
  CurrencyEuroIcon, 
  ExclamationTriangleIcon, 
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'

// Inizializza gli store e i composables
const firestoreStore = useFirestoreStore()
const { success, error, confirm } = usePopup()

// Stato del componente
const showAddModal = ref(false)
const showEditModal = ref(false)
const searchTerm = ref('')
const selectedCategory = ref('')

const newMateriale = ref({
  codice: '',
  nome: '',
  descrizione: '',
  categoria: 'travi',
  unita: 'pz',
  quantita: 0,
  prezzoUnitario: 0,
  scorteMinime: 10,
  fornitore: '',
  posizione: ''
})

const editingMateriale = ref(null)

// Dati dal Firestore store
const materiali = computed(() => firestoreStore.materiali)

// Calcoli e filtri
const filteredMateriali = computed(() => {
  return materiali.value.filter(materiale => {
    const search = searchTerm.value.toLowerCase()
    const categoryMatch = !selectedCategory.value || materiale.categoria === selectedCategory.value
    const searchMatch = !search || 
                        materiale.nome.toLowerCase().includes(search) ||
                        materiale.descrizione.toLowerCase().includes(search) ||
                        materiale.codice.toLowerCase().includes(search)
    return categoryMatch && searchMatch
  })
})

const stats = computed(() => {
  return {
    totaleArticoli: materiali.value.length,
    valoreTotale: materiali.value.reduce((total, m) => total + (m.quantita * m.prezzoUnitario), 0),
    sottoScorta: materiali.value.filter(m => m.quantita <= (m.scorteMinime || 0)).length
  }
})

// Funzioni modale
const closeAddModal = () => {
  showAddModal.value = false
  resetNewMateriale()
}

const resetNewMateriale = () => {
  newMateriale.value = {
    codice: '',
    nome: '',
    descrizione: '',
    categoria: 'travi',
    unita: 'pz',
    quantita: 0,
    prezzoUnitario: 0,
    scorteMinime: 10,
    fornitore: '',
    posizione: ''
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMateriale.value = null
}

// Funzioni CRUD
const saveMateriale = async () => {
  if (!newMateriale.value.codice || !newMateriale.value.nome) {
    error('Codice e Nome sono campi obbligatori.', 'Errore Validazione')
    return
  }
  const result = await firestoreStore.addDocument('materiali', newMateriale.value)
  if (result.success) {
    success('Materiale aggiunto con successo!')
    closeAddModal()
    await firestoreStore.loadMateriali()
  } else {
    error('Errore durante l\'aggiunta del materiale.', result.error)
  }
}

const editMateriale = (materiale) => {
  editingMateriale.value = { ...materiale }
  showEditModal.value = true
}

const saveEditMateriale = async () => {
  if (!editingMateriale.value) return
  const result = await firestoreStore.updateDocument('materiali', editingMateriale.value.id, editingMateriale.value)
  if (result.success) {
    success('Materiale aggiornato con successo!')
    closeEditModal()
    await firestoreStore.loadMateriali()
    
    // 🚀 AGGIORNAMENTO AUTOMATICO: Aggiorna i costi dei cantieri che usano questo materiale
    await updateCantieriCostsForMaterial(editingMateriale.value.id)
  } else {
    error('Errore durante l\'aggiornamento del materiale.', result.error)
  }
}

const deleteMateriale = async (id) => {
  const isConfirmed = await confirm('Sei sicuro?', 'Vuoi davvero eliminare questo materiale? L\'azione è irreversibile.')
  if (isConfirmed) {
    const result = await firestoreStore.deleteDocument('materiali', id)
    if (result.success) {
      success('Materiale eliminato con successo.')
      await firestoreStore.loadMateriali()
    } else {
      error('Errore durante l\'eliminazione.', result.error)
    }
  }
}

// 🚀 AGGIORNAMENTO AUTOMATICO: Aggiorna i costi dei cantieri che usano un materiale specifico
const updateCantieriCostsForMaterial = async (materialeId) => {
  if (!materialeId) return
  
  try {
    console.log('🔄 Aggiornamento costi cantieri per materiale modificato:', materialeId)
    
    // Carica tutti i cantieri
    await firestoreStore.loadCantieri()
    
    // Per ogni cantiere, verifica se usa questo materiale e aggiorna i costi
    for (const cantiere of firestoreStore.cantieri) {
      try {
        const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiere.id)
        
        if (materialiResult.success && materialiResult.data) {
          // Verifica se questo cantiere usa il materiale modificato
          const usaMateriale = materialiResult.data.some(m => m.materialeId === materialeId)
          
          if (usaMateriale) {
            // Aggiorna i costi di questo cantiere
            await autoUpdateSingleCantiereCosts(cantiere.id)
          }
        }
      } catch (error) {
        console.error(`Errore aggiornamento costi cantiere ${cantiere.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Errore aggiornamento costi cantieri per materiale:', error)
  }
}

// Funzione helper per aggiornare i costi di un singolo cantiere
const autoUpdateSingleCantiereCosts = async (cantiereId) => {
  if (!cantiereId) return
  
  try {
    // Carica i timesheet per questo cantiere
    const timesheetResult = await firestoreStore.loadCollection('timesheet', [
      { field: 'cantiereId', operator: '==', value: cantiereId }
    ])
    
    let costoManodopera = 0
    if (timesheetResult.success && timesheetResult.data) {
      costoManodopera = timesheetResult.data.reduce((acc, entry) => {
        const oreLavorate = entry.oreLavorate || entry.ore || 0
        const costoOrario = entry.costoOrario || 0
        return acc + (oreLavorate * costoOrario)
      }, 0)
    }
    
    // Carica i materiali per questo cantiere
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiereId)
    let costoMateriali = 0
    if (materialiResult.success && materialiResult.data) {
      costoMateriali = materialiResult.data.reduce((acc, materiale) => {
        const quantita = materiale.quantitaUtilizzata || materiale.quantitaRichiesta || 0
        const prezzo = materiale.prezzoUnitario || 0
        return acc + (quantita * prezzo)
      }, 0)
    }
    
    // Aggiorna i costi nel cantiere
    const updateData = {
      costiAccumulati: {
        manodopera: Math.round(costoManodopera * 100) / 100,
        materiali: Math.round(costoMateriali * 100) / 100,
        totale: Math.round((costoManodopera + costoMateriali) * 100) / 100
      },
      updatedAt: new Date()
    }
    
    await firestoreStore.updateDocument('cantieri', cantiereId, updateData)
    
    console.log(`✅ Costi aggiornati per cantiere ${cantiereId}:`, updateData.costiAccumulati)
    
  } catch (error) {
    console.error('Errore aggiornamento costi singolo cantiere:', error)
  }
}

// Funzioni di utility
const getCategoryColor = (category) => {
  const colors = {
    'travi': 'bg-primary-100 text-primary-800',
    'tavole': 'bg-yellow-100 text-yellow-800',
    'isolanti': 'bg-blue-100 text-blue-800',
    'ferramenta': 'bg-gray-200 text-gray-800',
    'accessori': 'bg-purple-100 text-purple-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

// Lifecycle Hooks
onMounted(async () => {
  await firestoreStore.loadMateriali();
});
</script> 