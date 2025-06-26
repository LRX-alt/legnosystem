<template>
  <div class="space-y-6">
    <!-- Header Mezzi -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Mezzi & Attrezzature</h1>
        <p class="text-gray-600">Parco macchine e strumentazione - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Mezzo
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <TruckIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Mezzi Totali</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.totali }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Disponibili</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{{ stats.disponibili }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
            <WrenchScrewdriverIcon class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">In Manutenzione</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.inManutenzione }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg flex-shrink-0">
            <CurrencyEuroIcon class="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Costo Mensile</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">€{{ stats.costoMensile.toLocaleString() }}</p>
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
            placeholder="Cerca mezzi o attrezzature..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedCategory" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutte le categorie</option>
            <option value="veicolo">Veicoli</option>
            <option value="attrezzatura">Attrezzature</option>
            <option value="utensile">Utensili</option>
            <option value="macchinario">Macchinari</option>
          </select>
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti gli stati</option>
            <option value="disponibile">Disponibile</option>
            <option value="in-uso">In Uso</option>
            <option value="manutenzione">Manutenzione</option>
            <option value="fuori-servizio">Fuori Servizio</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grid Mezzi -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="mezzo in filteredMezzi" :key="mezzo.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 rounded-lg flex-shrink-0" :class="getCategoryIcon(mezzo.categoria).bg">
              <component :is="getCategoryIcon(mezzo.categoria).icon" class="w-6 h-6" :class="getCategoryIcon(mezzo.categoria).color" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">{{ mezzo.nome }}</h3>
              <p class="text-sm text-gray-600">{{ mezzo.modello }}</p>
              <p class="text-xs text-gray-500">{{ mezzo.categoria.charAt(0).toUpperCase() + mezzo.categoria.slice(1) }}</p>
            </div>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(mezzo.stato)">
            {{ getStatusLabel(mezzo.stato) }}
          </span>
        </div>

        <!-- Info Mezzo -->
        <div class="space-y-3 mb-4">
          <div v-if="mezzo.targa" class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Targa/Seriale:</span>
            <span class="font-medium truncate ml-2">{{ mezzo.targa }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Anno:</span>
            <span class="font-medium truncate ml-2">{{ mezzo.anno }}</span>
          </div>
          <div v-if="mezzo.chilometraggio" class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Km/Ore:</span>
            <span class="font-medium truncate ml-2">{{ mezzo.chilometraggio.toLocaleString() }} {{ mezzo.categoria === 'veicolo' ? 'km' : 'h' }}</span>
          </div>
          <div v-if="mezzo.cantiereAttuale" class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Cantiere:</span>
            <span class="font-medium text-primary-600 truncate ml-2">{{ mezzo.cantiereAttuale }}</span>
          </div>
        </div>

        <!-- Manutenzioni -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-gray-500">Prossima Manutenzione</p>
            <span class="text-xs" :class="isMaintenanceDue(mezzo.prossimaRevisione) ? 'text-red-600 font-medium' : 'text-gray-500'">
              {{ formatDate(mezzo.prossimaRevisione) }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full" :class="getMaintenanceBarColor(mezzo.prossimaRevisione)" :style="`width: ${getMaintenanceProgress(mezzo.prossimaRevisione)}%`"></div>
          </div>
        </div>

        <!-- Costi -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Costo Mensile</span>
            <span class="font-semibold text-gray-900">€{{ mezzo.costoMensile.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Include carburante, assicurazione, manutenzione</span>
          </div>
        </div>

        <!-- Azioni -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <button @click="viewMezzo(mezzo)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Visualizza
          </button>
          <div class="flex space-x-2">
            <div class="relative group">
              <button @click="editMezzo(mezzo)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Modifica mezzo
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageMaintenance(mezzo)" class="text-gray-400 hover:text-gray-600">
                <WrenchScrewdriverIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestione manutenzioni
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="assignToCantiere(mezzo)" class="text-gray-400 hover:text-gray-600">
                <BuildingOfficeIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Assegna a cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="deleteMezzo(mezzo)" class="text-gray-400 hover:text-red-600">
                <TrashIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Elimina mezzo
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dettaglio Mezzo -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ selectedMezzo?.nome }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedMezzo?.modello }} - {{ selectedMezzo?.categoria }}</p>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Informazioni Generali -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Informazioni Generali</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Nome:</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.nome }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Modello:</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.modello }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Categoria:</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.categoria }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Anno:</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.anno }}</span>
                </div>
                <div v-if="selectedMezzo?.targa" class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Targa/Seriale:</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.targa }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Stato:</span> 
                  <span class="font-medium truncate ml-2" :class="getStatusTextColor(selectedMezzo?.stato)">{{ getStatusLabel(selectedMezzo?.stato) }}</span>
                </div>
              </div>
            </div>

            <!-- Utilizzo e Costi -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Utilizzo e Costi</h4>
              <div class="space-y-3 text-sm">
                <div v-if="selectedMezzo?.chilometraggio" class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">{{ selectedMezzo?.categoria === 'veicolo' ? 'Chilometraggio:' : 'Ore utilizzo:' }}</span> 
                  <span class="font-medium truncate ml-2">{{ selectedMezzo?.chilometraggio?.toLocaleString() }} {{ selectedMezzo?.categoria === 'veicolo' ? 'km' : 'h' }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Costo Mensile:</span> 
                  <span class="font-medium truncate ml-2">€{{ selectedMezzo?.costoMensile?.toLocaleString() }}</span>
                </div>
                <div v-if="selectedMezzo?.cantiereAttuale" class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Cantiere Attuale:</span> 
                  <span class="font-medium text-primary-600 truncate ml-2">{{ selectedMezzo?.cantiereAttuale }}</span>
                </div>
                <div class="flex justify-between min-w-0">
                  <span class="text-gray-600 flex-shrink-0">Prossima Manutenzione:</span> 
                  <span class="font-medium truncate ml-2" :class="isMaintenanceDue(selectedMezzo?.prossimaRevisione) ? 'text-red-600' : 'text-gray-900'">
                    {{ formatDate(selectedMezzo?.prossimaRevisione) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Storico Manutenzioni -->
          <div v-if="selectedMezzo?.manutenzioni?.length > 0" class="mt-6">
            <h4 class="font-semibold text-gray-900 mb-4">Storico Manutenzioni</h4>
            <div class="space-y-3">
              <div v-for="manutenzione in selectedMezzo.manutenzioni.slice(0, 5)" :key="manutenzione.id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ manutenzione.tipo }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(manutenzione.data) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">€{{ manutenzione.costo?.toLocaleString() }}</p>
                  <p class="text-xs text-gray-500">{{ manutenzione.fornitore }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button @click="closeModal" class="btn-secondary">
              Chiudi
            </button>
            <button @click="editMezzo(selectedMezzo)" class="btn-primary">
              Modifica
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo/Modifica Mezzo -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ showAddModal ? 'Nuovo Mezzo' : 'Modifica Mezzo' }}
            </h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="showAddModal ? saveMezzo() : saveEditedMezzo()" class="space-y-6">
            <!-- Nome e Categoria -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  v-model="mezzoForm.nome"
                  type="text"
                  required
                  placeholder="Es: Fiat Ducato, Escavatore CAT, Sega Circolare"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  v-model="mezzoForm.categoria"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="veicolo">🚛 Veicolo</option>
                  <option value="attrezzatura">🏗️ Attrezzatura</option>
                  <option value="utensile">🔧 Utensile</option>
                  <option value="macchinario">🪚 Macchinario</option>
                </select>
              </div>
            </div>

            <!-- Modello e Anno -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Modello</label>
                <input
                  v-model="mezzoForm.modello"
                  type="text"
                  placeholder="Es: Ducato Maxi, 320D, Festool TS 55"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Anno</label>
                <input
                  v-model.number="mezzoForm.anno"
                  type="number"
                  min="1990"
                  :max="new Date().getFullYear() + 1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Targa/Seriale e Chilometraggio -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Targa/Numero Seriale</label>
                <input
                  v-model="mezzoForm.targa"
                  type="text"
                  placeholder="Es: AB123CD, SN123456789"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ mezzoForm.categoria === 'veicolo' ? 'Chilometraggio (km)' : 'Ore utilizzo' }}
                </label>
                <input
                  v-model.number="mezzoForm.chilometraggio"
                  type="number"
                  min="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Stato e Costo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="mezzoForm.stato"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="disponibile">Disponibile</option>
                  <option value="in-uso">In Uso</option>
                  <option value="manutenzione">Manutenzione</option>
                  <option value="fuori-servizio">Fuori Servizio</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Costo Mensile (€)</label>
                <input
                  v-model.number="mezzoForm.costoMensile"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Prossima Manutenzione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prossima Manutenzione</label>
              <input
                v-model="mezzoForm.prossimaRevisione"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                v-model="mezzoForm.note"
                rows="3"
                placeholder="Note aggiuntive sul mezzo..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 {{ showAddModal ? 'Salva Mezzo' : 'Aggiorna Mezzo' }}
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
  TruckIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  CurrencyEuroIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { usePopup } from '@/composables/usePopup'

// Popup system
const { success, info, confirm } = usePopup()

// Stato reattivo
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedMezzo = ref(null)
const searchTerm = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// Form per nuovo/modifica mezzo
const mezzoForm = ref({
  nome: '',
  categoria: 'veicolo',
  modello: '',
  anno: new Date().getFullYear(),
  targa: '',
  chilometraggio: 0,
  stato: 'disponibile',
  costoMensile: 0,
  prossimaRevisione: '',
  note: ''
})

// Stats
const stats = ref({
  totali: 12,
  disponibili: 8,
  inManutenzione: 2,
  costoMensile: 3450
})

// Dati mezzi - vuoto, da caricare da Firestore
const mezzi = ref([])

// Computed
const filteredMezzi = computed(() => {
  let result = mezzi.value

  if (searchTerm.value) {
    result = result.filter(m => 
      m.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      m.modello.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      m.targa.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    result = result.filter(m => m.categoria === selectedCategory.value)
  }

  if (selectedStatus.value) {
    result = result.filter(m => m.stato === selectedStatus.value)
  }

  return result
})

// Methods
const getCategoryIcon = (categoria) => {
  const icons = {
    'veicolo': { icon: TruckIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
    'attrezzatura': { icon: WrenchScrewdriverIcon, bg: 'bg-green-100', color: 'text-green-600' },
    'utensile': { icon: WrenchScrewdriverIcon, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    'macchinario': { icon: TruckIcon, bg: 'bg-purple-100', color: 'text-purple-600' }
  }
  return icons[categoria] || icons['utensile']
}

const getStatusColor = (stato) => {
  const colors = {
    'disponibile': 'bg-green-100 text-green-800',
    'in-uso': 'bg-blue-100 text-blue-800',
    'manutenzione': 'bg-yellow-100 text-yellow-800',
    'fuori-servizio': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusTextColor = (stato) => {
  const colors = {
    'disponibile': 'text-green-600',
    'in-uso': 'text-blue-600',
    'manutenzione': 'text-yellow-600',
    'fuori-servizio': 'text-red-600'
  }
  return colors[stato] || 'text-gray-600'
}

const getStatusLabel = (stato) => {
  const labels = {
    'disponibile': 'Disponibile',
    'in-uso': 'In Uso',
    'manutenzione': 'Manutenzione',
    'fuori-servizio': 'Fuori Servizio'
  }
  return labels[stato] || stato
}

const isMaintenanceDue = (data) => {
  const today = new Date()
  const maintenanceDate = new Date(data)
  const daysDiff = (maintenanceDate - today) / (1000 * 60 * 60 * 24)
  return daysDiff <= 30 // Entro 30 giorni
}

const getMaintenanceProgress = (data) => {
  const today = new Date()
  const maintenanceDate = new Date(data)
  const daysDiff = (maintenanceDate - today) / (1000 * 60 * 60 * 24)
  
  if (daysDiff <= 0) return 100 // Scaduta
  if (daysDiff >= 365) return 0 // Molto in futuro
  
  return Math.max(0, 100 - (daysDiff / 365 * 100))
}

const getMaintenanceBarColor = (data) => {
  const today = new Date()
  const maintenanceDate = new Date(data)
  const daysDiff = (maintenanceDate - today) / (1000 * 60 * 60 * 24)
  
  if (daysDiff <= 0) return 'bg-red-500' // Scaduta
  if (daysDiff <= 30) return 'bg-yellow-500' // Entro 30 giorni
  return 'bg-green-500' // OK
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewMezzo = (mezzo) => {
  selectedMezzo.value = mezzo
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
  selectedMezzo.value = null
}

const editMezzo = (mezzo) => {
  mezzoForm.value = {
    id: mezzo.id,
    nome: mezzo.nome,
    categoria: mezzo.categoria,
    modello: mezzo.modello,
    anno: mezzo.anno,
    targa: mezzo.targa,
    chilometraggio: mezzo.chilometraggio,
    stato: mezzo.stato,
    costoMensile: mezzo.costoMensile,
    prossimaRevisione: mezzo.prossimaRevisione,
    note: mezzo.note || ''
  }
  showEditModal.value = true
  showDetailModal.value = false
}

const saveMezzo = () => {
  const newId = Math.max(...mezzi.value.map(m => m.id)) + 1
  const newMezzo = {
    ...mezzoForm.value,
    id: newId,
    cantiereAttuale: null,
    manutenzioni: []
  }
  
  mezzi.value.push(newMezzo)
  closeAddModal()
  success('Mezzo Aggiunto', `"${newMezzo.nome}" aggiunto alla flotta con successo!`)
}

const saveEditedMezzo = () => {
  const index = mezzi.value.findIndex(m => m.id === mezzoForm.value.id)
  if (index > -1) {
    const mezzoEsistente = mezzi.value[index]
    mezzi.value[index] = {
      ...mezzoEsistente,
      ...mezzoForm.value
    }
    closeAddModal()
    success('Mezzo Aggiornato', `"${mezzoForm.value.nome}" modificato con successo!`)
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  mezzoForm.value = {
    nome: '',
    categoria: 'veicolo',
    modello: '',
    anno: new Date().getFullYear(),
    targa: '',
    chilometraggio: 0,
    stato: 'disponibile',
    costoMensile: 0,
    prossimaRevisione: '',
    note: ''
  }
}

const manageMaintenance = (mezzo) => {
  info('Funzionalità in Sviluppo', `Gestione manutenzioni per ${mezzo.nome} sarà disponibile a breve`)
}

const assignToCantiere = (mezzo) => {
  info('Funzionalità in Sviluppo', `Assegnazione cantiere per ${mezzo.nome} sarà disponibile a breve`)
}

const deleteMezzo = async (mezzo) => {
  const confirmed = await confirm('Eliminare Mezzo', `Sei sicuro di voler eliminare ${mezzo.nome}? Questa azione non può essere annullata.`)
  if (confirmed) {
    const index = mezzi.value.findIndex(m => m.id === mezzo.id)
    mezzi.value.splice(index, 1)
    success('Mezzo Eliminato', `"${mezzo.nome}" rimosso dalla flotta`)
  }
}

// Lifecycle
onMounted(() => {
  // Calcola stats dinamicamente
  stats.value = {
    totali: mezzi.value.length,
    disponibili: mezzi.value.filter(m => m.stato === 'disponibile').length,
    inManutenzione: mezzi.value.filter(m => m.stato === 'manutenzione').length,
    costoMensile: mezzi.value.reduce((total, m) => total + m.costoMensile, 0)
  }
})
</script> 