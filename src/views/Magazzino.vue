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
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '@/stores/firestore'
import { useFirestore } from '@/composables/useFirestore'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth'

// Stores e composables
const firestoreStore = useFirestoreStore()
const firestore = useFirestore()
const authStore = useAuthStore()
const { success, error, confirm } = usePopup()

// Stato della pagina
const showAddModal = ref(false)
const showEditModal = ref(false)
const searchTerm = ref('')
const selectedCategory = ref('')

// Computed per materiali da Firestore store
const materiali = computed(() => firestoreStore.materiali)

// Stats calcolate dai dati Firestore
const stats = computed(() => ({
  totaleArticoli: materiali.value.length,
  valoreTotale: materiali.value.reduce((total, m) => total + (m.quantita * m.prezzoUnitario), 0),
  sottoScorta: materiali.value.filter(m => m.quantita <= (m.scorteMinime || 0)).length
}))

// Nuovo materiale
const newMateriale = ref({
  codice: '',
  nome: '',
  descrizione: '',
  categoria: '',
  unita: '',
  quantita: 0,
  prezzoUnitario: 0,
  scorteMinime: 0
})

// Materiale in modifica
const editingMateriale = ref({
  id: null,
  codice: '',
  nome: '',
  descrizione: '',
  categoria: '',
  unita: '',
  quantita: 0,
  prezzoUnitario: 0,
  scorteMinime: 0
})

// Computed
const filteredMateriali = computed(() => {
  let result = materiali.value

  if (searchTerm.value) {
    result = result.filter(m => 
      m.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      m.codice.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    result = result.filter(m => m.categoria === selectedCategory.value)
  }

  return result
})

// Methods
const getCategoryColor = (categoria) => {
  const colors = {
    travi: 'bg-primary-100 text-primary-800',
    tavole: 'bg-accent-100 text-accent-800',
    isolanti: 'bg-wood-light text-primary-800',
    ferramenta: 'bg-gray-100 text-gray-800',
    accessori: 'bg-blue-100 text-blue-800'
  }
  return colors[categoria] || 'bg-gray-100 text-gray-800'
}

const editMateriale = (materiale) => {
  editingMateriale.value = {
    id: materiale.id,
    codice: materiale.codice,
    nome: materiale.nome,
    descrizione: materiale.descrizione,
    categoria: materiale.categoria,
    unita: materiale.unita,
    quantita: materiale.quantita,
    prezzoUnitario: materiale.prezzoUnitario,
    scorteMinime: materiale.scorteMinime
  }
  showEditModal.value = true
}

const deleteMateriale = async (id) => {
  const confirmed = await confirm('Eliminare Materiale', 'Sei sicuro di voler eliminare questo materiale? Questa azione non può essere annullata.')
  if (confirmed) {
    try {
      const result = await firestoreStore.deleteDocument('materiali', id)
      if (result.success) {
        // Ricarica i materiali per aggiornare la lista
        await firestoreStore.loadMateriali()
        success('Materiale eliminato con successo!', '✅ Eliminazione Completata')
      } else {
        error('Errore durante l\'eliminazione del materiale', '❌ Errore')
      }
    } catch (err) {
      console.error('Errore eliminazione materiale:', err)
      error('Errore durante l\'eliminazione del materiale', '❌ Errore')
    }
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newMateriale.value = {
    codice: '',
    nome: '',
    descrizione: '',
    categoria: '',
    unita: '',
    quantita: 0,
    prezzoUnitario: 0,
    scorteMinime: 0
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMateriale.value = {
    id: null,
    codice: '',
    nome: '',
    descrizione: '',
    categoria: '',
    unita: '',
    quantita: 0,
    prezzoUnitario: 0,
    scorteMinime: 0
  }
}

const saveMateriale = async () => {
  if (!newMateriale.value.codice || !newMateriale.value.nome || !newMateriale.value.categoria) {
    error('Compila tutti i campi obbligatori!', '❌ Validazione')
    return
  }

  // Verifica se il codice esiste già
  if (materiali.value.some(m => m.codice === newMateriale.value.codice)) {
    error('Codice materiale già esistente!', '❌ Codice Duplicato')
    return
  }

  // 🔐 Verifica autenticazione
  console.log('🔐 Stato autenticazione:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user?.email,
    userId: authStore.user?.uid
  })

  if (!authStore.isAuthenticated) {
    error('Devi essere autenticato per salvare materiali!', '❌ Non Autenticato')
    return
  }

  try {
    console.log('🚀 Iniziando salvataggio materiale...', newMateriale.value)
    
    const nuovoMateriale = {
      codice: newMateriale.value.codice,
      nome: newMateriale.value.nome,
      descrizione: newMateriale.value.descrizione,
      categoria: newMateriale.value.categoria,
      unita: newMateriale.value.unita,
      quantita: newMateriale.value.quantita,
      prezzoUnitario: newMateriale.value.prezzoUnitario,
      scorteMinime: newMateriale.value.scorteMinime
    }

    console.log('📦 Dati da salvare:', nuovoMateriale)
    
    const result = await firestoreStore.createMateriale(nuovoMateriale)
    console.log('📝 Risultato salvataggio:', result)
    
    if (result.success) {
      console.log('✅ Materiale salvato su Firestore, ricarico lista...')
      // Ricarica i materiali per aggiornare la lista
      await firestoreStore.loadMateriali()
      console.log('📋 Lista materiali ricaricata:', firestoreStore.materiali.length, 'elementi')
      closeAddModal()
      success(`Materiale "${nuovoMateriale.nome}" aggiunto con successo!`, '✅ Materiale Aggiunto')
    } else {
      console.error('❌ Errore nel salvataggio:', result.error)
      error('Errore durante il salvataggio del materiale', '❌ Errore')
    }
  } catch (err) {
    console.error('❌ Eccezione durante salvataggio materiale:', err)
    error('Errore durante il salvataggio del materiale', '❌ Errore')
  }
}

const saveEditMateriale = async () => {
  if (!editingMateriale.value.codice || !editingMateriale.value.nome || !editingMateriale.value.categoria) {
    error('Compila tutti i campi obbligatori!', '❌ Validazione')
    return
  }

  // Verifica se il codice esiste già (escludendo se stesso)
  if (materiali.value.some(m => m.codice === editingMateriale.value.codice && m.id !== editingMateriale.value.id)) {
    error('Codice materiale già esistente!', '❌ Codice Duplicato')
    return
  }

  try {
    const materialeAggiornato = {
      codice: editingMateriale.value.codice,
      nome: editingMateriale.value.nome,
      descrizione: editingMateriale.value.descrizione,
      categoria: editingMateriale.value.categoria,
      unita: editingMateriale.value.unita,
      quantita: editingMateriale.value.quantita,
      prezzoUnitario: editingMateriale.value.prezzoUnitario,
      scorteMinime: editingMateriale.value.scorteMinime
    }

    const result = await firestoreStore.updateDocument('materiali', editingMateriale.value.id, materialeAggiornato)
    if (result.success) {
      // Ricarica i materiali per aggiornare la lista
      await firestoreStore.loadMateriali()
      closeEditModal()
      success(`Materiale "${materialeAggiornato.nome}" modificato con successo!`, '✅ Materiale Aggiornato')
    } else {
      error('Errore durante l\'aggiornamento del materiale', '❌ Errore')
    }
  } catch (err) {
    console.error('Errore aggiornamento materiale:', err)
    error('Errore durante l\'aggiornamento del materiale', '❌ Errore')
  }
}

// Funzione per configurare i permessi utente automaticamente
const setupUserPermissions = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.uid) {
    console.warn('⚠️ Utente non autenticato, impossibile configurare permessi')
    return false
  }

  try {
    const userId = authStore.user.uid
    const email = authStore.user.email
    
    console.log('🔧 Configurando permessi utente per:', email)
    
    // Crea/aggiorna il profilo utente con i permessi necessari
    const userProfile = {
      email: email,
      role: 'manager', // Ruolo che permette gestione materiali
      permissions: [
        'manage_materiali',
        'manage_cantieri', 
        'view_dipendenti',
        'manage_clienti'
      ],
      displayName: authStore.user.displayName || email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Salva il profilo in Firestore
    const result = await firestoreStore.updateDocument('userProfiles', userId, userProfile)
    
    if (result.success) {
      console.log('✅ Permessi utente configurati correttamente')
      success('Permessi utente configurati! Ora puoi gestire i materiali.', '✅ Setup Completato')
      return true
    } else {
      console.error('❌ Errore configurazione permessi:', result.error)
      return false
    }
  } catch (err) {
    console.error('❌ Errore setup permessi:', err)
    return false
  }
}

// Carica i materiali all'avvio del componente
onMounted(async () => {
  console.log('🏗️ Magazzino: Inizializzazione componente...')
  
  // 🔧 Setup permessi utente (una tantum)
  if (authStore.isAuthenticated) {
    await setupUserPermissions()
  }
  
  // 🧪 Test connessione Firestore
  try {
    console.log('🧪 Testando connessione Firestore...')
    const testResult = await firestoreStore.testFirestoreConnection()
    console.log('🧪 Risultato test Firestore:', testResult)
  } catch (testErr) {
    console.error('❌ Test Firestore fallito:', testErr)
  }
  
  try {
    console.log('📡 Caricando materiali da Firestore...')
    const result = await firestoreStore.loadMateriali()
    console.log('📋 Risultato caricamento materiali:', result)
    console.log('📦 Materiali caricati nello store:', firestoreStore.materiali.length)
    console.log('📝 Lista materiali:', firestoreStore.materiali)
  } catch (err) {
    console.error('❌ Errore caricamento materiali:', err)
    error('Errore durante il caricamento dei materiali', '❌ Errore Caricamento')
  }
})
</script> 