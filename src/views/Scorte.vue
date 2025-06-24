<template>
  <div class="space-y-6">
    <!-- Header Scorte - Mobile Optimized -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-display font-bold text-primary-800">Gestione Scorte</h1>
        <p class="text-gray-600 text-base">Alert e riordini - Legnosystem.bio</p>
      </div>
      <button @click="showOrderModal = true" class="w-full sm:w-auto btn-primary py-3 text-base font-medium"
              title="Crea nuovo ordine">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Ordine
      </button>
    </div>

    <!-- Stats Cards - Alert Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Sotto Scorta</p>
            <p class="text-xl sm:text-2xl font-bold text-red-600">{{ stats.sottoScorta }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-sm">
            <span class="text-red-600 font-medium">Urgente</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">In Attesa</p>
            <p class="text-xl sm:text-2xl font-bold text-yellow-600">{{ stats.inAttesa }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-sm">
            <span class="text-gray-600">Ordini pendenti</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <TruckIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">In Arrivo</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-600">{{ stats.inArrivo }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-sm">
            <span class="text-gray-600">Questa settimana</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Valore Ordini</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">€{{ stats.valoreOrdini.toLocaleString() }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-sm">
            <span class="text-gray-600">Mese corrente</span>
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
            placeholder="Cerca materiali..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
          />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStatus" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti gli stati</option>
            <option value="critico">Critico</option>
            <option value="basso">Basso</option>
            <option value="ordinato">Ordinato</option>
            <option value="ok">OK</option>
          </select>
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedCategory" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutte le categorie</option>
            <option value="travi">Travi</option>
            <option value="tavole">Tavole</option>
            <option value="isolanti">Isolanti</option>
            <option value="ferramenta">Ferramenta</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Alert Scorte Materiali -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Materiali sotto Scorta</h3>
      <div v-for="materiale in filteredMateriali" :key="materiale.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-12 h-12 bg-wood-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-primary-600 text-base font-bold">{{ materiale.codice }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-lg font-semibold text-gray-900 truncate">{{ materiale.nome }}</h4>
              <p class="text-base text-gray-600 truncate">{{ materiale.descrizione }}</p>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2 ml-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatusColor(materiale.statoScorta)">
              {{ getStatusLabel(materiale.statoScorta) }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getCategoryColor(materiale.categoria)">
              {{ materiale.categoria }}
            </span>
          </div>
        </div>

        <!-- Quantità e Scorte Mobile -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Disponibili</p>
            <p class="text-lg font-bold" :class="materiale.quantitaAttuale <= materiale.scortaMinima ? 'text-red-600' : 'text-gray-900'">
              {{ materiale.quantitaAttuale }}
            </p>
            <p class="text-sm text-gray-500">{{ materiale.unita }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Minimo</p>
            <p class="text-base font-medium text-gray-900">{{ materiale.scortaMinima }}</p>
            <p class="text-sm text-gray-500">{{ materiale.unita }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Suggerito</p>
            <p class="text-lg font-bold text-primary-600">{{ materiale.quantitaSuggerita }}</p>
            <p class="text-sm text-gray-500">{{ materiale.unita }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-base mb-1">
            <span class="text-gray-600">Livello scorta</span>
            <span class="font-medium">{{ Math.round((materiale.quantitaAttuale / materiale.scortaMinima) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300" 
              :class="materiale.quantitaAttuale <= materiale.scortaMinima ? 'bg-red-500' : 'bg-primary-500'"
              :style="`width: ${Math.min((materiale.quantitaAttuale / materiale.scortaMinima) * 100, 100)}%`"
            ></div>
          </div>
        </div>

        <!-- Fornitore e Prezzo -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">Fornitore</p>
              <p class="text-base font-medium text-gray-900">{{ materiale.fornitore }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Prezzo/Unità</p>
              <p class="text-base font-medium text-gray-900">€{{ materiale.prezzoUnitario.toFixed(2) }}</p>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-sm text-gray-500 mb-1">Costo Ordine Suggerito</p>
            <p class="text-lg font-bold text-primary-600">€{{ (materiale.quantitaSuggerita * materiale.prezzoUnitario).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Azioni Mobile -->
        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="orderMaterial(materiale)" 
                  class="w-full btn-primary py-3 text-base font-medium"
                  title="Ordina quantità suggerita">
            📦 Ordina {{ materiale.quantitaSuggerita }} {{ materiale.unita }}
          </button>
          <button @click="editMinimo(materiale)" 
                  class="w-full btn-secondary py-3 text-base font-medium"
                  title="Modifica scorta minima">
            ⚙️ Modifica Minimo
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div class="hidden lg:block">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Materiali sotto Scorta</h3>
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Materiale</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Disponibili</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Minimo</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Suggerito</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Fornitore</th>
                <th class="px-6 py-4 text-right text-base font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
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
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatusColor(materiale.statoScorta)">
                    {{ getStatusLabel(materiale.statoScorta) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-base font-medium" :class="materiale.quantitaAttuale <= materiale.scortaMinima ? 'text-red-600' : 'text-gray-900'">
                    {{ materiale.quantitaAttuale }} {{ materiale.unita }}
                  </div>
                  <div class="w-16 bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      class="h-1 rounded-full" 
                      :class="materiale.quantitaAttuale <= materiale.scortaMinima ? 'bg-red-500' : 'bg-primary-500'"
                      :style="`width: ${Math.min((materiale.quantitaAttuale / materiale.scortaMinima) * 100, 100)}%`"
                    ></div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ materiale.scortaMinima }} {{ materiale.unita }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-base font-medium text-primary-600">{{ materiale.quantitaSuggerita }} {{ materiale.unita }}</div>
                  <div class="text-sm text-gray-500">€{{ (materiale.quantitaSuggerita * materiale.prezzoUnitario).toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-base text-gray-900">{{ materiale.fornitore }}</div>
                  <div class="text-sm text-gray-500">€{{ materiale.prezzoUnitario.toFixed(2) }}/{{ materiale.unita }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                  <button @click="orderMaterial(materiale)" 
                          class="text-primary-600 hover:text-primary-900 mr-3"
                          title="Ordina quantità suggerita">
                    Ordina
                  </button>
                  <button @click="editMinimo(materiale)" 
                          class="text-gray-600 hover:text-gray-900"
                          title="Modifica scorta minima">
                    Modifica
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Storico Ordini Recenti -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Ordini Recenti</h3>
      
      <!-- Mobile: Timeline -->
      <div class="block sm:hidden space-y-3">
        <div v-for="ordine in ordiniRecenti" :key="ordine.id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex-shrink-0">
            <span class="h-8 w-8 rounded-full flex items-center justify-center" :class="getOrderStatusColor(ordine.stato)">
              <component :is="getOrderIcon(ordine.stato)" class="h-4 w-4 text-white" />
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-gray-900">{{ ordine.materiale }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ ordine.fornitore }} - {{ ordine.quantita }} {{ ordine.unita }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ ordine.dataOrdine }} - €{{ ordine.importo.toFixed(2) }}</p>
          </div>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium" :class="getOrderStatusBadge(ordine.stato)">
            {{ ordine.stato }}
          </span>
        </div>
      </div>

      <!-- Desktop: Table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Materiale</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Fornitore</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Quantità</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Importo</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Stato</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ordine in ordiniRecenti" :key="ordine.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{{ ordine.materiale }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ ordine.fornitore }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ ordine.quantita }} {{ ordine.unita }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">€{{ ordine.importo.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ ordine.dataOrdine }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getOrderStatusBadge(ordine.stato)">
                  {{ ordine.stato }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuovo Ordine -->
    <div v-if="showOrderModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeOrderModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Ordine Materiale</h3>
            <button @click="closeOrderModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveOrder" class="space-y-6">
            <!-- Materiale Selection -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Materiale *</label>
              <select v-model="newOrder.materialeId" required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                <option value="">Seleziona materiale</option>
                <option v-for="materiale in materiali" :key="materiale.id" :value="materiale.id">
                  {{ materiale.codice }} - {{ materiale.nome }}
                </option>
              </select>
            </div>

            <!-- Quantità e Fornitore -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Quantità *</label>
                <input v-model.number="newOrder.quantita" type="number" min="1" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Fornitore *</label>
                <input v-model="newOrder.fornitore" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Prezzo e Data Consegna -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Prezzo Unitario (€) *</label>
                <input v-model.number="newOrder.prezzoUnitario" type="number" min="0" step="0.01" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Data Consegna Prevista *</label>
                <input v-model="newOrder.dataConsegna" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Note -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea v-model="newOrder.note" rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                        placeholder="Note aggiuntive per l'ordine..."></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeOrderModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                📦 Crea Ordine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Scorta Minima -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Scorta Minima</h3>
            <button @click="closeEditModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveEditMinimo" class="space-y-6">
            <!-- Materiale Info -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-base font-medium text-gray-900">{{ editingMateriale.nome }}</div>
              <div class="text-base text-gray-500">{{ editingMateriale.codice }}</div>
            </div>

            <!-- Scorta Attuale e Nuova -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Scorta Attuale</label>
                <div class="px-4 py-3 bg-gray-100 rounded-lg text-base text-gray-500">
                  {{ editingMateriale.scortaMinima }} {{ editingMateriale.unita }}
                </div>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Nuova Scorta *</label>
                <input v-model.number="editingMateriale.nuovaScortaMinima" type="number" min="0" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                ⚙️ Aggiorna Scorta
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
  ExclamationTriangleIcon,
  ClockIcon,
  TruckIcon,
  CurrencyEuroIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showOrderModal = ref(false)
const showEditModal = ref(false)
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')

// Stats - resettate a 0
const stats = ref({
  sottoScorta: 0,
  inAttesa: 0,
  inArrivo: 0,
  valoreOrdini: 0
})

// Materiali - vuoto, da caricare da Firestore
const materiali = ref([])

// Nuovo ordine
const newOrder = ref({
  materialeId: '',
  quantita: 0,
  fornitore: '',
  prezzoUnitario: 0,
  dataConsegna: '',
  note: ''
})

// Materiale in modifica
const editingMateriale = ref({
  id: null,
  nome: '',
  codice: '',
  scortaMinima: 0,
  nuovaScortaMinima: 0,
  unita: ''
})

// Ordini recenti - vuoto, da caricare da Firestore
const ordiniRecenti = ref([])

// Computed
const filteredMateriali = computed(() => {
  let result = materiali.value

  if (searchTerm.value) {
    result = result.filter(m => 
      m.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      m.codice.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(m => m.statoScorta === selectedStatus.value)
  }

  if (selectedCategory.value) {
    result = result.filter(m => m.categoria === selectedCategory.value)
  }

  return result
})

// Methods
const getStatusColor = (stato) => {
  const colors = {
    'critico': 'bg-red-100 text-red-800',
    'basso': 'bg-yellow-100 text-yellow-800',
    'ordinato': 'bg-blue-100 text-blue-800',
    'ok': 'bg-green-100 text-green-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'critico': 'Critico',
    'basso': 'Basso',
    'ordinato': 'Ordinato',
    'ok': 'OK'
  }
  return labels[stato] || stato
}

const getCategoryColor = (categoria) => {
  const colors = {
    travi: 'bg-primary-100 text-primary-800',
    tavole: 'bg-accent-100 text-accent-800',
    isolanti: 'bg-wood-light text-primary-800',
    ferramenta: 'bg-gray-100 text-gray-800'
  }
  return colors[categoria] || 'bg-gray-100 text-gray-800'
}

const getOrderStatusColor = (stato) => {
  const colors = {
    'ordinato': 'bg-blue-500',
    'in-transito': 'bg-yellow-500',
    'consegnato': 'bg-green-500',
    'annullato': 'bg-red-500'
  }
  return colors[stato] || 'bg-gray-500'
}

const getOrderStatusBadge = (stato) => {
  const colors = {
    'ordinato': 'bg-blue-100 text-blue-800',
    'in-transito': 'bg-yellow-100 text-yellow-800',
    'consegnato': 'bg-green-100 text-green-800',
    'annullato': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getOrderIcon = (stato) => {
  const icons = {
    'ordinato': ClockIcon,
    'in-transito': TruckIcon,
    'consegnato': CheckIcon,
    'annullato': XMarkIcon
  }
  return icons[stato] || ClockIcon
}

const orderMaterial = (materiale) => {
  newOrder.value = {
    materialeId: materiale.id,
    quantita: materiale.quantitaSuggerita,
    fornitore: materiale.fornitore,
    prezzoUnitario: materiale.prezzoUnitario,
    dataConsegna: '',
    note: `Ordine automatico per scorta sotto minimo: ${materiale.quantitaAttuale}/${materiale.scortaMinima} ${materiale.unita}`
  }
  showOrderModal.value = true
}

const editMinimo = (materiale) => {
  editingMateriale.value = {
    id: materiale.id,
    nome: materiale.nome,
    codice: materiale.codice,
    scortaMinima: materiale.scortaMinima,
    nuovaScortaMinima: materiale.scortaMinima,
    unita: materiale.unita
  }
  showEditModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  newOrder.value = {
    materialeId: '',
    quantita: 0,
    fornitore: '',
    prezzoUnitario: 0,
    dataConsegna: '',
    note: ''
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMateriale.value = {
    id: null,
    nome: '',
    codice: '',
    scortaMinima: 0,
    nuovaScortaMinima: 0,
    unita: ''
  }
}

const saveOrder = () => {
  if (!newOrder.value.materialeId || !newOrder.value.quantita || !newOrder.value.fornitore) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const materiale = materiali.value.find(m => m.id === newOrder.value.materialeId)
  if (!materiale) {
    alert('❌ Materiale non trovato!')
    return
  }

  const nuovoOrdine = {
    id: Date.now(),
    materiale: materiale.nome,
    fornitore: newOrder.value.fornitore,
    quantita: newOrder.value.quantita,
    unita: materiale.unita,
    importo: newOrder.value.quantita * newOrder.value.prezzoUnitario,
    dataOrdine: new Date().toLocaleDateString('it-IT'),
    stato: 'ordinato'
  }

  ordiniRecenti.value.unshift(nuovoOrdine)
  
  // Aggiorna stato materiale
  materiale.statoScorta = 'ordinato'
  
  // Aggiorna statistiche
  stats.value.inAttesa++
  stats.value.valoreOrdini += nuovoOrdine.importo

  closeOrderModal()
  alert(`✅ Ordine creato con successo per ${newOrder.value.quantita} ${materiale.unita} di ${materiale.nome}!`)
}

const saveEditMinimo = () => {
  if (editingMateriale.value.nuovaScortaMinima < 0) {
    alert('❌ La scorta minima deve essere maggiore o uguale a 0!')
    return
  }

  const materiale = materiali.value.find(m => m.id === editingMateriale.value.id)
  if (materiale) {
    materiale.scortaMinima = editingMateriale.value.nuovaScortaMinima
    
    // Ricalcola stato scorta
    if (materiale.quantitaAttuale <= materiale.scortaMinima * 0.5) {
      materiale.statoScorta = 'critico'
    } else if (materiale.quantitaAttuale <= materiale.scortaMinima) {
      materiale.statoScorta = 'basso'
    } else {
      materiale.statoScorta = 'ok'
    }
    
    // Aggiorna quantità suggerita (2x la scorta minima)
    materiale.quantitaSuggerita = materiale.scortaMinima * 2
  }

  closeEditModal()
  alert(`✅ Scorta minima aggiornata a ${editingMateriale.value.nuovaScortaMinima} ${editingMateriale.value.unita}!`)
}
</script> 