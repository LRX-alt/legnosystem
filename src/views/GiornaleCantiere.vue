<template>
  <div class="space-y-6">
    <!-- Header Giornale -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <div class="flex items-center space-x-2">
          <h1 class="text-2xl font-display font-bold text-primary-800">Giornale di Cantiere</h1>
          <span class="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
            {{ cantiere?.stato || 'Non specificato' }}
          </span>
        </div>
        <div class="mt-1 text-gray-600 flex items-center space-x-2">
          <span class="font-medium">{{ cantiere?.nome }}</span>
          <span class="text-gray-400">•</span>
          <span>{{ cantiere?.indirizzo }}</span>
        </div>
      </div>
      <div class="flex space-x-3">
        <button @click="newEntry()" class="btn-primary">
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuova Registrazione
        </button>
        <button @click="exportPDF" class="btn-secondary">
          <DocumentArrowDownIcon class="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>
    </div>

    <!-- Info Cantiere -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">📋 Informazioni Generali</h3>
        <div class="space-y-3">
          <!-- Cliente -->
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-lg">
                {{ cantiere?.cliente?.nome?.[0]?.toUpperCase() || 'C' }}
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ cantiere?.cliente?.nome || 'Cliente non specificato' }}</div>
                <div class="text-xs text-gray-500">{{ cantiere?.cliente?.email || 'Email non specificata' }}</div>
              </div>
            </div>
          </div>
          
          <!-- Dettagli Cantiere -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Responsabile</span>
              <span class="font-medium">{{ cantiere?.responsabile || 'Non assegnato' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Data Inizio</span>
              <span class="font-medium">{{ formatDate(cantiere?.dataInizio) || 'Non specificata' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Scadenza</span>
              <span class="font-medium">{{ formatDate(cantiere?.scadenza) || 'Non specificata' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Tipo Lavoro</span>
              <span class="font-medium">{{ cantiere?.tipoLavoro || 'Non specificato' }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Avanzamento Lavori</span>
              <span class="font-medium">{{ cantiere?.progresso || 0 }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                   :style="`width: ${cantiere?.progresso || 0}%`"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">👥 Team Assegnato</h3>
        <div v-if="cantiere?.team?.length" class="space-y-2">
          <div v-for="membro in cantiere.team" :key="membro.id" 
               class="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                {{ membro.iniziali || membro.nome?.[0]?.toUpperCase() }}
              </span>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">{{ membro.nome }}</div>
                <div class="text-xs text-gray-500">{{ membro.ruolo || 'Ruolo non specificato' }}</div>
              </div>
              <div class="text-xs text-gray-500">
                {{ membro.pagaOraria ? `€${membro.pagaOraria}/h` : '' }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
          <div class="text-4xl mb-2">👥</div>
          Nessun membro del team assegnato
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">📊 Statistiche</h3>
        <div class="space-y-4">
          <!-- Statistiche Temporali -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">Tempi</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-primary-600">{{ costiCantiere.giorniLavorativi }}</div>
                <div class="text-xs text-gray-500">Giorni Lavorati</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-primary-600">{{ costiCantiere?.oreTotali || 0 }}</div>
                <div class="text-xs text-gray-500">Ore Totali</div>
              </div>
            </div>
          </div>

          <!-- Statistiche Economiche -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">Costi</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Manodopera</span>
                <span class="font-medium">€{{ costiCantiere.manodopera?.toLocaleString() || '0' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Materiali</span>
                <span class="font-medium">€{{ costiCantiere.materiali?.toLocaleString() || '0' }}</span>
              </div>
              <div class="h-px bg-gray-200 my-2"></div>
              <div class="flex justify-between items-center font-medium">
                <span class="text-sm text-gray-900">Totale</span>
                <span class="text-primary-600">€{{ costiCantiere.totale?.toLocaleString() || '0' }}</span>
              </div>
            </div>
          </div>

          <!-- Media Giornaliera -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <h4 class="text-xs font-medium text-gray-500 uppercase mb-2">Media Giornaliera</h4>
            <div class="text-2xl font-bold text-primary-600">€{{ costiCantiere.costoMedioGiorno?.toLocaleString() || '0' }}</div>
            <div class="text-xs text-gray-500">per giorno lavorativo</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 💰 Riepilogo Costi Accumulati -->
    <div class="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-900">💰 Costi Accumulati</h3>
        <button @click="refreshCosts" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Aggiorna
        </button>
      </div>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-xs text-gray-600">Manodopera</p>
          <p class="text-lg font-bold text-orange-600">€{{ (costiCantiere?.manodopera || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500">{{ costiCantiere?.giorniLavorativi || 0 }} giorni</p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Materiali</p>
          <p class="text-lg font-bold text-blue-600">€{{ (costiCantiere?.materiali || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500">utilizzati</p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Totale</p>
          <p class="text-lg font-bold text-red-600">€{{ (costiCantiere?.totale || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500">sostenuto</p>
        </div>
      </div>
      <div v-if="(costiCantiere?.oreTotali || 0) > 0" class="pt-2 mt-2 border-t border-green-200 text-center">
        <p class="text-xs text-gray-600">
          {{ costiCantiere?.oreTotali || 0 }}h lavorate • 
          €{{ costiCantiere?.costoMedioGiorno?.toFixed(0) || 0 }}/giorno medio
        </p>
      </div>
    </div>

    <!-- Filtri Data -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
          <input v-model="selectedDate" type="date" class="form-input">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Settimana</label>
          <select v-model="selectedWeek" class="form-select">
            <option value="">Tutte le settimane</option>
            <option v-for="week in availableWeeks" :key="week.value" :value="week.value">
              {{ week.label }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn-secondary">Reset Filtri</button>
        </div>
      </div>
    </div>

    <!-- Lista Registrazioni -->
    <div class="space-y-4">
      <div v-for="entry in filteredEntries" :key="entry.id" class="card hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900">{{ formatDate(entry.data) }}</h3>
            <p class="text-sm text-gray-600">{{ entry.orarioInizio }} - {{ entry.orarioFine }} • {{ entry.responsabile }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editEntry(entry)" class="text-gray-400 hover:text-gray-600">
              <PencilIcon class="w-5 h-5" />
            </button>
            <button @click="deleteEntry(entry.id)" class="text-gray-400 hover:text-red-600">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Condizioni Meteo -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">🌤️ Condizioni Meteo</h4>
            <p class="text-sm">{{ entry.meteo.condizioni }} - {{ entry.meteo.temperatura }}°C</p>
            <p class="text-xs text-gray-500">{{ entry.meteo.note }}</p>
          </div>

          <!-- Operatori assegnati con ore per ciascuno -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">👷 Operatori Assegnati</h4>
            <p class="text-xs text-gray-500 mb-1">
              {{ getOperatoriCount(entry) }} operatori
              <span v-if="entry.oreTotali" class="ml-1">• {{ entry.oreTotali }}h totali</span>
              <span v-if="entry.costoGiornata" class="text-green-600 font-medium ml-2">
                • €{{ entry.costoGiornata.toFixed(0) }}
              </span>
            </p>
            <div class="text-sm text-gray-900 flex flex-wrap gap-x-3 gap-y-1">
              <span v-for="op in getOperatoriList(entry)" :key="op.id || op.nome" class="whitespace-nowrap">
                {{ op.nome }}: <span class="font-medium">{{ op.ore.toFixed(1) }}h</span>
              </span>
            </div>
          </div>

          <!-- Attività -->
          <div v-if="entry.attivita && entry.attivita.length > 0">
            <h4 class="text-sm font-medium text-gray-700 mb-2">🔨 Attività Principali</h4>
            <ul class="text-sm space-y-1">
              <li v-for="attivita in entry.attivita.slice(0, 2)" :key="attivita" class="text-gray-700">
                • {{ attivita }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Note e Problemi -->
        <div v-if="entry.note || (entry.problemi && entry.problemi.length > 0)" class="mt-4 pt-4 border-t border-gray-200">
          <div v-if="entry.note" class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-1">📝 Note</h4>
            <p class="text-sm text-gray-600">{{ entry.note }}</p>
          </div>
          <div v-if="entry.problemi && entry.problemi.length > 0">
            <h4 class="text-sm font-medium text-red-700 mb-1">⚠️ Problemi/Imprevisti</h4>
            <ul class="text-sm text-red-600 space-y-1">
              <li v-for="problema in entry.problemi" :key="problema">• {{ problema }}</li>
            </ul>
          </div>
        </div>

        <!-- Allegati -->
        <div v-if="entry.allegati && entry.allegati.length > 0" class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-2">📎 Allegati ({{ entry.allegati.length }})</h4>
          <div class="flex space-x-2">
            <span v-for="allegato in entry.allegati.slice(0, 3)" :key="allegato.id" 
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ allegato.nome }}
            </span>
            <span v-if="entry.allegati.length > 3" 
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              +{{ entry.allegati.length - 3 }} altri
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredEntries.length === 0" class="text-center py-12">
        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nessuna registrazione</h3>
        <p class="mt-1 text-sm text-gray-500">Inizia creando la prima registrazione del giornale di cantiere.</p>
        <div class="mt-6">
                      <button @click="newEntry()" class="btn-primary">
              <PlusIcon class="w-5 h-5 mr-2" />
              Nuova Registrazione
            </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuova Registrazione -->
    <div v-if="showEntryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEntryModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingEntry ? 'Modifica Registrazione' : 'Nuova Registrazione' }}
            </h3>
            <button @click="closeEntryModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveEntry" class="space-y-6">
            <!-- Data e Orari -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input v-model="newEntryData.data" type="date" required class="form-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Orario Inizio</label>
                <input v-model="newEntryData.orarioInizio" type="time" required class="form-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Orario Fine</label>
                <input v-model="newEntryData.orarioFine" type="time" required class="form-input">
              </div>
            </div>

            <!-- Responsabile -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Responsabile</label>
              <select v-model="newEntryData.responsabile" required class="form-select">
                <option value="">Seleziona responsabile...</option>
                <option v-for="dipendente in firestoreStore.dipendenti" :key="dipendente.id" :value="dipendente.nome">
                  {{ dipendente.nome }} {{ dipendente.cognome }} ({{ dipendente.ruolo }})
                </option>
              </select>
            </div>

            <!-- Condizioni Meteo -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🌤️ Condizioni Meteo</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Condizioni</label>
                  <select v-model="newEntryData.meteo.condizioni" class="form-select">
                    <option value="sereno">☀️ Sereno</option>
                    <option value="nuvoloso">☁️ Nuvoloso</option>
                    <option value="pioggia">🌧️ Pioggia</option>
                    <option value="nevoso">❄️ Nevoso</option>
                    <option value="vento">💨 Ventoso</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
                  <input v-model.number="newEntryData.meteo.temperatura" type="number" class="form-input">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Note Meteo</label>
                  <input v-model="newEntryData.meteo.note" type="text" placeholder="Es: vento forte" class="form-input">
                </div>
              </div>
            </div>

            <!-- Attività Svolte -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🔨 Attività Svolte</h4>
              <div class="space-y-3">
                <div v-for="(attivita, index) in newEntryData.attivita" :key="index" class="flex items-center space-x-3">
                  <input v-model="newEntryData.attivita[index]" type="text" placeholder="Descrivi l'attività svolta" class="flex-1 form-input">
                  <button type="button" @click="removeAttivita(index)" class="text-red-600 hover:text-red-800">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
                <button type="button" @click="addAttivita" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  + Aggiungi Attività
                </button>
              </div>
            </div>

            <!-- 👥 Dipendenti Dettagliati -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">👥 Dipendenti Presenti e Ore Lavorate</h4>
              <DipendentiSelector 
                :dipendenti="firestoreStore.dipendenti || []"
                v-model="newEntryData.dipendenti"
              />
            </div>



            <!-- NUOVO: Materiali Utilizzati -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🧱 Materiali Utilizzati</h4>
              <MaterialiSelector 
                :materiali="materialiDisponibili"
                :materialiMagazzino="firestoreStore.materiali || []"
                v-model="newEntryData.materiali"
              />
            </div>

            <!-- NUOVO: Mezzi Utilizzati -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🚛 Mezzi Utilizzati</h4>
              <MezziSelector 
                :mezzi="mezziDisponibili"
                v-model="newEntryData.mezzi"
              />
            </div>

            <!-- NUOVO: Tipi di Lavori -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🔨 Tipi di Lavori Effettuati</h4>
              <TipiLavoriSelector 
                v-model="newEntryData.lavori"
              />
            </div>

            <!-- Note e Problemi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">📝 Note Generali</label>
                <textarea v-model="newEntryData.note" rows="4" placeholder="Note e osservazioni della giornata" class="form-input"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">⚠️ Problemi/Imprevisti</label>
                <textarea v-model="newEntryData.problemiText" rows="4" placeholder="Eventuali problemi riscontrati (uno per riga)" class="form-input"></textarea>
              </div>
            </div>

                        <!-- Riepilogo Costi Semplificato -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">💰 Riepilogo Costi Giornata</h4>
              
              <!-- Costi dettagliati -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-600">Dipendenti</p>
                  <p class="text-lg font-semibold text-orange-600">€{{ calculateDipendentiCost().toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Materiali</p>
                  <p class="text-lg font-semibold text-blue-600">€{{ calculateMaterialiCost().toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Mezzi</p>
                  <p class="text-lg font-semibold text-purple-600">€{{ calculateMezziCost().toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Lavori</p>
                  <p class="text-lg font-semibold text-green-600">€{{ calculateLavoriCost().toFixed(2) }}</p>
                </div>
              </div>

              <!-- Totale finale -->
              <div class="mt-4 pt-4 border-t-2 border-gray-300">
                <div class="flex justify-between items-center">
                  <p class="text-lg font-medium text-gray-900">TOTALE GIORNATA</p>
                  <p class="text-2xl font-bold text-red-600">€{{ calculateTotalCost().toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEntryModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 {{ editingEntry ? 'Aggiorna' : 'Salva' }} Registrazione
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFirestoreOperations } from '@/composables/useFirestoreOperations'
import { useModalEsc } from '@/composables/useModalEsc'
import { usePopup } from '@/composables/usePopup'
import { useFirestoreStore } from '@/stores/firestore'
import DipendentiSelector from '@/components/DipendentiSelector.vue'
import MaterialiSelector from '@/components/MaterialiSelector.vue'
import MezziSelector from '@/components/MezziSelector.vue'
import TipiLavoriSelector from '@/components/TipiLavoriSelector.vue'
import {
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

// Composables
const route = useRoute()
const popup = usePopup()
const { success, error, warning, info, confirm, removePopup } = popup
const firestoreOperations = useFirestoreOperations()
const firestoreStore = useFirestoreStore()

// Reactive state
const loading = ref(false)
const cantiere = ref(null)
const entries = ref([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedWeek = ref('')
const showEntryModal = ref(false)
const showTeamModal = ref(false)
const editingEntry = ref(null)
const newEntryData = ref({
  data: new Date().toISOString().split('T')[0],
  orarioInizio: '06:00',
  orarioFine: '22:00',
  responsabile: '',
  meteo: {
    condizioni: 'sereno',
    temperatura: 20,
    note: ''
  },
  attivita: [''],
  problemi: [],
  allegati: [],
  note: '',
  problemiText: '',
  oreTotali: 8,
  costiExtra: 0,
  teamPresente: [],
  // NUOVO: Dati estesi per tracking costi
  dipendenti: [],
  materiali: [],
  mezzi: [],
  lavori: []
})

// 💰 Costi cantiere
const costiCantiere = ref({
  manodopera: 0,
  materiali: 0,
  totale: 0,
  giorniLavorativi: 0,
  oreTotali: 0,
  costoMedioGiorno: 0
})

// NUOVO: Dati per materiali e mezzi
const materialiDisponibili = ref([
  { id: 'mat_001', nome: 'Cemento', categoria: 'Materiali da costruzione', prezzo: 0.5, unita: 'kg' },
  { id: 'mat_002', nome: 'Mattoni', categoria: 'Materiali da costruzione', prezzo: 0.8, unita: 'pz' },
  { id: 'mat_003', nome: 'Legno', categoria: 'Materiali da costruzione', prezzo: 15.0, unita: 'm' },
  { id: 'mat_004', nome: 'Vernice', categoria: 'Finiture', prezzo: 25.0, unita: 'l' },
  { id: 'mat_005', nome: 'Bulloni', categoria: 'Ferramenta', prezzo: 0.2, unita: 'pz' }
])

const mezziDisponibili = ref([
  { id: 'mez_001', nome: 'Escavatore CAT', categoria: 'Mezzi pesanti', costoOrario: 45 },
  { id: 'mez_002', nome: 'Betoniera', categoria: 'Mezzi da cantiere', costoOrario: 25 },
  { id: 'mez_003', nome: 'Gru', categoria: 'Mezzi pesanti', costoOrario: 60 },
  { id: 'mez_004', nome: 'Compressore', categoria: 'Attrezzature', costoOrario: 15 },
  { id: 'mez_005', nome: 'Pompa per calcestruzzo', categoria: 'Mezzi specializzati', costoOrario: 35 }
])

// Computed
const filteredEntries = computed(() => {
  let result = entries.value

  if (selectedDate.value) {
    result = result.filter(entry => entry.data === selectedDate.value)
  }

  return result.sort((a, b) => new Date(b.data) - new Date(a.data))
})

// Conta operatori robusto su più formati dati
const getOperatoriCount = (entry) => {
  // Nuovo formato: entry.dipendenti (array di oggetti {id, nome, ore})
  if (Array.isArray(entry.dipendenti) && entry.dipendenti.length > 0) {
    return entry.dipendenti.length
  }
  // Vecchio formato: teamPresente o team (array di oggetti con id/nome)
  if (Array.isArray(entry.teamPresente) && entry.teamPresente.length > 0) {
    return entry.teamPresente.length
  }
  if (Array.isArray(entry.team) && entry.team.length > 0) {
    return entry.team.length
  }
  // Fallback: prova a ricavare da presenze registrate per quella entry
  try {
    const presenze = (firestoreStore.presenze || []).filter(p => (
      (p.registrazioneGiornaleId && entry.id && p.registrazioneGiornaleId === entry.id) ||
      (p.cantiereId === (cantiere.value?.id || entry.cantiereId) && (p.data === entry.data))
    ))
    const unique = new Set(presenze.map(p => p.dipendenteId))
    return unique.size
  } catch (_) {
    return 0
  }
}

// Ritorna lista operatori con ore per la riga riepilogo
const getOperatoriList = (entry) => {
  // Nuovo formato
  if (Array.isArray(entry.dipendenti) && entry.dipendenti.length > 0) {
    return entry.dipendenti.map(d => ({ id: d.id, nome: d.nome || d.cognome || d.id, ore: Number(d.ore || 0) }))
  }
  // Vecchio formato: ripartizione uniforme su teamPresente
  if (Array.isArray(entry.teamPresente) && entry.teamPresente.length > 0) {
    const ore = Number(entry.oreTotali || 0)
    const each = entry.teamPresente.length > 0 ? (ore / entry.teamPresente.length) : 0
    return entry.teamPresente.map(m => ({ id: m.id, nome: m.nome || m.cognome || m.id, ore: each }))
  }
  if (Array.isArray(entry.team) && entry.team.length > 0) {
    const ore = Number(entry.oreTotali || 0)
    const each = entry.team.length > 0 ? (ore / entry.team.length) : 0
    return entry.team.map(m => ({ id: m.id, nome: m.nome || m.cognome || m.id, ore: each }))
  }
  return []
}

const availableWeeks = computed(() => {
  const weeks = new Set()
  
  entries.value.forEach(entry => {
    const date = new Date(entry.data)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay() + 1)
    const weekKey = weekStart.toISOString().split('T')[0]
    
    weeks.add({
      value: weekKey,
      label: `${weekStart.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} - ${
        new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
      }`
    })
  })
  
  return Array.from(weeks).sort((a, b) => b.value.localeCompare(a.value))
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const newEntry = async () => {
  editingEntry.value = null
  
  // Carica i dipendenti se non sono già caricati
  if (!firestoreStore.dipendenti || firestoreStore.dipendenti.length === 0) {
    try {
      await firestoreStore.loadDipendenti()
    } catch (error) {
      console.error('Errore caricamento dipendenti:', error)
    }
  }
  
  newEntryData.value = {
    data: new Date().toISOString().split('T')[0],
    orarioInizio: '08:00',
    orarioFine: '17:00',
    responsabile: firestoreStore.dipendenti?.[0]?.nome || '',
    meteo: {
      condizioni: 'sereno',
      temperatura: 20,
      note: ''
    },
    attivita: [''],
    problemi: [],
    allegati: [],
    note: '',
    problemiText: '',
    // NUOVO: Inizializza dati estesi
    dipendenti: [],
    materiali: [],
    mezzi: [],
    lavori: []
  }
  showEntryModal.value = true
}

const editEntry = async (entry) => {
  editingEntry.value = entry
  
  // Carica i dipendenti se non sono già caricati
  if (!firestoreStore.dipendenti || firestoreStore.dipendenti.length === 0) {
    try {
      await firestoreStore.loadDipendenti()
    } catch (error) {
      console.error('Errore caricamento dipendenti:', error)
    }
  }
  
  newEntryData.value = {
    data: entry.data,
    orarioInizio: entry.orarioInizio,
    orarioFine: entry.orarioFine,
    responsabile: entry.responsabile,
    meteo: { ...entry.meteo },
    attivita: [...(entry.attivita || [])],
    problemi: [...(entry.problemi || [])],
    allegati: [...(entry.allegati || [])],
    note: entry.note || '',
    problemiText: (entry.problemi || []).join('\n'),
    // NUOVO: Carica dati estesi
    dipendenti: [...(entry.dipendenti || [])],
    materiali: [...(entry.materiali || [])],
    mezzi: [...(entry.mezzi || [])],
    lavori: [...(entry.lavori || [])]
  }
  showEntryModal.value = true
}

const closeEntryModal = () => {
  showEntryModal.value = false
  editingEntry.value = null
}

const addAttivita = () => {
  newEntryData.value.attivita.push('')
}

const removeAttivita = (index) => {
  newEntryData.value.attivita.splice(index, 1)
}



// NUOVO: Calcola costo dipendenti dettagliati
const calculateDipendentiCost = () => {
  return newEntryData.value.dipendenti?.reduce((tot, dip) => tot + (dip.costoTotale || 0), 0) || 0
}

// NUOVO: Calcola costo materiali
const calculateMaterialiCost = () => {
  return newEntryData.value.materiali?.reduce((tot, mat) => tot + (mat.costoTotale || 0), 0) || 0
}

// NUOVO: Calcola costo mezzi
const calculateMezziCost = () => {
  return newEntryData.value.mezzi?.reduce((tot, mez) => tot + (mez.costoTotale || 0), 0) || 0
}

// NUOVO: Calcola costo lavori
const calculateLavoriCost = () => {
  return newEntryData.value.lavori?.reduce((tot, lav) => tot + (lav.ore * lav.costoOrario), 0) || 0
}

// NUOVO: Calcola costo totale completo
const calculateTotalCost = () => {
  const costoDipendenti = calculateDipendentiCost()
  const costoMateriali = calculateMaterialiCost()
  const costoMezzi = calculateMezziCost()
  const costoLavori = calculateLavoriCost()
  
  return costoDipendenti + costoMateriali + costoMezzi + costoLavori
}

// 🚀 MULTI-ASSIGNMENT: Validazione smart per assegnazione dipendente
const validateDipendenteAssignment = async (dipendenteId, dataAssegnazione) => {
  try {
    const dipendente = firestoreStore.dipendenti.find(d => d.id === dipendenteId)
    if (!dipendente) {
      return { canAssign: false, message: 'Dipendente non trovato', type: 'error' }
    }

    // ❌ BLOCCO: Solo per dipendenti non attivi
    if (dipendente.stato !== 'attivo') {
      return { 
        canAssign: false, 
        message: `è in stato: ${dipendente.stato.toUpperCase()}`, 
        type: 'error'
      }
    }

    let warnings = []

    // ⚠️ WARNING: Dipendente già assegnato ad altri cantieri (non blocca più)
    if (dipendente.cantiereAttuale && dipendente.cantiereAttuale !== cantiere.value.nome) {
      warnings.push(`Già assegnato al cantiere: ${dipendente.cantiereAttuale}`)
    }

    // ⚠️ WARNING: Verifica presenze in altri cantieri nello stesso giorno
    const presenzeGiorno = await firestoreOperations.load('presenze', [
      ['dipendenteId', '==', dipendenteId],
      ['data', '==', dataAssegnazione]
    ])

    if (presenzeGiorno.success && presenzeGiorno.data?.length > 0) {
      const presenzeAltriCantieri = presenzeGiorno.data.filter(p => 
        p.cantiereId !== cantiere.value.id && 
        p.stato === 'presente'
      )

      if (presenzeAltriCantieri.length > 0) {
        const altriCantieri = presenzeAltriCantieri.map(p => p.cantiereNome).join(', ')
        warnings.push(`Ha già presenze registrate in: ${altriCantieri}`)
      }
    }

    // ⚠️ WARNING: Verifica timesheet in altri cantieri nello stesso giorno
    const timesheetGiorno = await firestoreOperations.load('timesheet', [
      ['dipendenteId', '==', dipendenteId],
      ['data', '==', dataAssegnazione]
    ])

    if (timesheetGiorno.success && timesheetGiorno.data?.length > 0) {
      const timesheetAltriCantieri = timesheetGiorno.data.filter(t => 
        t.cantiereId !== cantiere.value.id
      )

      if (timesheetAltriCantieri.length > 0) {
        const oreTotali = timesheetAltriCantieri.reduce((sum, t) => sum + (t.ore || t.oreLavorate || 0), 0)
        if (oreTotali > 0) {
          warnings.push(`Ha già ${oreTotali}h di lavoro registrate in altri cantieri oggi`)
        }
      }
    }

    // 🚀 SEMPRE PERMESSO: L'assegnazione è sempre consentita con eventuali warning
    return { 
      canAssign: true, 
      message: warnings.length > 0 
        ? `⚠️ ATTENZIONE: ${warnings.join(' • ')}`
        : '✅ Disponibile per assegnazione',
      type: warnings.length > 0 ? 'warning' : 'success',
      warnings: warnings
    }

  } catch (error) {
    console.error('Errore validazione assegnazione dipendente:', error)
    return { 
      canAssign: false, 
      message: 'Errore durante la validazione', 
      type: 'error'
    }
  }
}

// 🚀 NUOVA: Aggiornamento presenze in tempo reale
const updateRealTimePresences = async () => {
  try {
    // Verifica che ci siano i dati necessari
    if (!newEntryData.value.data || !newEntryData.value.teamPresente?.length) {
      console.log('⚠️ Dati insufficienti per aggiornamento presenze in tempo reale')
      return
    }

    const dataRegistrazione = newEntryData.value.data
    const orarioInizio = newEntryData.value.orarioInizio || '08:00'
    const orarioFine = newEntryData.value.orarioFine || '17:00'

    // 🚀 AGGIORNAMENTO PARALLELO: Elabora tutti i membri del team in parallelo
    const operazioniPresenze = newEntryData.value.teamPresente.map(async (membro) => {
      try {
        const presenzaKey = `${dataRegistrazione}-${membro.id}`
        
        // Verifica se la presenza esiste già
        const presenzaEsistente = await firestoreStore.getDocument('presenze', presenzaKey)
        
        // 🔧 FIX: Validazione data anche per presenze realtime
        let dataValidataPresenza = dataRegistrazione
        if (!dataValidataPresenza || dataValidataPresenza === '' || dataValidataPresenza === '1970-01-01' || dataValidataPresenza === '2025-01-01') {
          console.warn(`⚠️ Data non valida in presenza realtime: "${dataValidataPresenza}", usando oggi`)
          dataValidataPresenza = new Date().toISOString().split('T')[0]
        }
        
        const presenzaData = {
          id: presenzaKey,
          dipendenteId: membro.id,
          data: dataValidataPresenza, // 🔧 Usa data validata
          orarioInizio: orarioInizio,
          orarioFine: orarioFine,
          oreEffettive: newEntryData.value.oreTotali / newEntryData.value.teamPresente.length,
          cantiereId: cantiere.value.id,
          cantiereNome: cantiere.value.nome,
          tipoPresenza: 'normale',
          stato: 'presente',
          note: `Presenza da giornale cantiere - ${cantiere.value.nome}`,
          fonte: 'giornale_cantiere_realtime',
          dataOriginale: dataRegistrazione, // 🔧 Salva la data originale per debug
          updatedAt: new Date().toISOString()
        }

        // Crea o aggiorna la presenza
        if (presenzaEsistente.success && presenzaEsistente.data) {
          // Aggiorna presenza esistente
          await firestoreStore.updateDocument('presenze', presenzaKey, presenzaData)
          console.log(`✅ Presenza aggiornata per ${membro.nome}`)
        } else {
          // Crea nuova presenza
          await firestoreStore.createDocument('presenze', presenzaData)
          console.log(`✅ Presenza creata per ${membro.nome}`)
        }

        return { success: true, membro: membro.nome }
      } catch (error) {
        console.error(`❌ Errore aggiornamento presenza per ${membro.nome}:`, error)
        return { success: false, membro: membro.nome, error }
      }
    })

    // Esegui tutte le operazioni in parallelo
    const risultati = await Promise.allSettled(operazioniPresenze)
    
    // Statistiche operazioni
    const successi = risultati.filter(r => r.status === 'fulfilled' && r.value.success).length
    const errori = risultati.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length
    
    console.log(`🔄 Aggiornamento presenze completato: ${successi} successi, ${errori} errori`)
    
    // Rimuovi presenze di dipendenti non più nel team
    await removeObsoletePresences(dataRegistrazione)
    
  } catch (error) {
    console.error('❌ Errore aggiornamento presenze in tempo reale:', error)
  }
}

// 🚀 NUOVA: Rimuove presenze obsolete per dipendenti non più nel team
const removeObsoletePresences = async (dataRegistrazione) => {
  try {
    // Carica tutte le presenze per questa data e cantiere
    const presenzeResult = await firestoreOperations.load('presenze', [
      ['data', '==', dataRegistrazione],
      ['cantiereId', '==', cantiere.value.id]
    ])

    if (!presenzeResult.success || !presenzeResult.data) return

    // Trova presenze da rimuovere (dipendenti non più nel team)
    const teamIds = newEntryData.value.teamPresente.map(m => m.id)
    const presenzeDaRimuovere = presenzeResult.data.filter(presenza => 
      !teamIds.includes(presenza.dipendenteId) && 
      presenza.fonte === 'giornale_cantiere_realtime'
    )

    // Rimuovi presenze obsolete in parallelo
    const operazioniRimozione = presenzeDaRimuovere.map(async (presenza) => {
      try {
        await firestoreOperations.delete('presenze', presenza.id)
        console.log(`🗑️ Presenza rimossa per dipendente ${presenza.dipendenteId}`)
        return { success: true }
      } catch (error) {
        console.error(`❌ Errore rimozione presenza ${presenza.id}:`, error)
        return { success: false, error }
      }
    })

    if (operazioniRimozione.length > 0) {
      await Promise.allSettled(operazioniRimozione)
      console.log(`🔄 Rimozione presenze obsolete completata: ${operazioniRimozione.length} operazioni`)
    }

  } catch (error) {
    console.error('❌ Errore rimozione presenze obsolete:', error)
  }
}

// ===== FINE FUNZIONI GESTIONE TEAM PRESENTE =====

// 🚀 OTTIMIZZAZIONE: Caricamento iniziale parallelo e veloce
onMounted(async () => {
  const cantiereId = route.params.id
  
  if (!cantiereId) {
    console.error('ID cantiere non trovato nella route')
    popup.error('Errore', 'ID cantiere non valido')
    return
  }

  try {
    loading.value = true
    
    // 🚀 STEP 1: Carica cantiere immediatamente per UI
    const cantierePromise = firestoreStore.loadCantieri().then(() => {
      const cantiereFound = firestoreStore.cantieri.find(c => c.id === cantiereId)
      if (cantiereFound) {
        cantiere.value = cantiereFound
        console.log(`📍 Cantiere caricato: ${cantiereFound.nome}`)
      } else {
        throw new Error(`Cantiere con ID ${cantiereId} non trovato`)
      }
    })

    // 🚀 STEP 2: Carica cantiere prima di tutto
    await cantierePromise
    loading.value = false
    
    // 🚀 STEP 3: Dopo che il cantiere è caricato, carica i dati dipendenti
    const secondaryPromises = [
      firestoreStore.loadDipendenti().catch(console.error),
      firestoreStore.loadMateriali().catch(console.error),
      loadGiornaleEntries().catch(console.error) // Ora il cantiere è sicuramente caricato
    ]
    
    // Carica gli altri dati in background
    Promise.allSettled(secondaryPromises).then(async () => {
      console.log('✅ Caricamento dati completato')
      
      // 🚀 CALCOLO AUTOMATICO COSTI MATERIALI: Anche se non ci sono registrazioni giornale
      if (entries.value.length === 0) {
        console.log('🔄 Nessuna registrazione giornale, calcolo solo costi materiali...')
        await calculateMaterialCostsOnly()
      }
    })
    
  } catch (errorObj) {
    console.error('Errore nel caricamento del cantiere:', errorObj)
    popup.error('Errore Caricamento', errorObj.message || 'Impossibile caricare i dati del cantiere')
    loading.value = false
  }
})

// ESC per modali del giornale
const giornaleModalRefs = [showEntryModal, showTeamModal]
const giornaleCloseFns = [closeEntryModal, () => showTeamModal.value = false]
useModalEsc(giornaleModalRefs, giornaleCloseFns)

// 🚀 OTTIMIZZAZIONE: Caricamento con cache e operazioni parallele
const loadGiornaleEntries = async () => {
  try {
    // Verifica che il cantiere sia caricato
    if (!cantiere.value?.id) {
      console.warn('⚠️ Cantiere non ancora caricato, rimandando caricamento giornale')
      return
    }
    
    // Mostra loading solo se non ci sono già dati
    if (entries.value.length === 0) {
      loading.value = true
    }
    
    const result = await firestoreOperations.giornaleCantiere.load(cantiere.value.id)
    // 🔄 ORDINAMENTO LATO CLIENT: Ordina per data (più recente prima) senza causare errori indice Firestore
    const sortedEntries = (result.data || []).sort((a, b) => {
      const dateA = new Date(a.data || '1970-01-01')
      const dateB = new Date(b.data || '1970-01-01')
      return dateB - dateA // Ordine decrescente (più recente prima)
    })
    entries.value = sortedEntries
    
    // 🚀 CALCOLO AUTOMATICO COSTI: Calcola sia manodopera che materiali al caricamento
    await refreshCantiereCostsFromTimesheet()
  } catch (err) {
    error('Errore', `Caricamento registrazioni fallito: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 🚀 OTTIMIZZAZIONE: Sincronizzazione timesheet non bloccante
const syncTimesheetFromGiornale = async (entryData, registrazioneId) => {
  try {
    console.log('🔄 Inizio sincronizzazione timesheet (background)')
    
    // Verifica che ci siano dati sufficienti
    if (!entryData.teamPresente?.length || !entryData.data || !entryData.oreTotali) {
      console.warn('Dati insufficienti per sincronizzare timesheet')
      return
    }

    // 🔧 NUOVA VALIDAZIONE CENTRALIZZATA: Valida la data prima di procedere
    const { validateTimesheetDate } = await import('../utils/timesheetValidation.js')
    const dateValidation = validateTimesheetDate(entryData.data)
    
    if (dateValidation.wasFixed) {
      console.warn(`🔧 GIORNALE CANTIERE: Data corretta da "${dateValidation.originalDate}" a "${dateValidation.correctedDate}"`)
    }

    const dataValidata = dateValidation.correctedDate
    const orePerPersona = entryData.oreTotali / entryData.teamPresente.length

    // 🚀 PARALLELIZE: Crea tutte le operazioni in parallelo
    const operazioniTimesheet = entryData.teamPresente.map(async (membro) => {
      try {
        // Crea presenza con data validata
        const presenzaData = {
          dipendenteId: membro.id,
          data: dataValidata, // 🔧 Usa data validata
          orarioInizio: entryData.orarioInizio,
          orarioFine: entryData.orarioFine,
          oreEffettive: orePerPersona,
          cantiereId: cantiere.value.id,
          cantiereNome: cantiere.value.nome,
          tipoPresenza: 'normale',
          note: `Presenza registrata da giornale cantiere - ${entryData.attivita?.join(', ') || 'Attività cantiere'}`,
          fonte: 'giornale_cantiere',
          registrazioneGiornaleId: registrazioneId,
          dataOriginale: entryData.data, // 🔧 Salva la data originale per debug
          createdAt: new Date().toISOString()
        }

        const presenzaResult = await firestoreStore.createDocument('presenze', presenzaData)
        
        if (!presenzaResult.success) {
          console.error(`❌ Errore creazione presenza per ${membro.nome}:`, presenzaResult.error)
          return
        }

        // 🔧 VALIDAZIONE COMPLETA TIMESHEET con utility centralizzata
        const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')
        
        console.log(`📅 Data timesheet per ${membro.nome}: ${entryData.data} → ${dataValidata}`)
        
        // Crea timesheet con validazione completa
        const timesheetDataRaw = {
          dipendenteId: membro.id,
          data: dataValidata, // 🔧 Usa la data validata centralizzata
          ore: orePerPersona,
          oreLavorate: orePerPersona,
          cantiere: cantiere.value.nome,
          cantiereId: cantiere.value.id,
          orarioInizio: entryData.orarioInizio,
          orarioFine: entryData.orarioFine,
          note: `Auto-generato da Giornale Cantiere - ${entryData.attivita?.join(', ') || 'Attività cantiere'}`,
          costoOrario: membro.pagaOraria || 25,
          costoTotale: orePerPersona * (membro.pagaOraria || 25),
          fonte: 'giornale_cantiere',
          registrazioneGiornaleId: registrazioneId,
          dataOriginale: entryData.data, // 🔧 Salva la data originale per debug
          createdAt: new Date().toISOString()
        }

        const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
        
        if (!timesheetValidation.isValid) {
          console.error(`❌ Timesheet validation failed for ${membro.nome}:`, timesheetValidation.errors)
          return
        }

        if (timesheetValidation.warnings.length > 0) {
          console.warn(`⚠️ Timesheet warnings for ${membro.nome}:`, timesheetValidation.warnings)
        }

        const result = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)
        
        if (!result.success) {
          console.error(`❌ Errore creazione timesheet per ${membro.nome}:`, result.error)
        } else {
          console.log(`✅ Timesheet creato per ${membro.nome}: ${orePerPersona}h`)
        }
        
        return result
      } catch (error) {
        console.error(`❌ Errore sincronizzazione per ${membro.nome}:`, error)
      }
    })

    // Esegui tutte le operazioni in parallelo
    await Promise.allSettled(operazioniTimesheet)
    console.log('✅ Sincronizzazione timesheet completata (background)')
    
  } catch (error) {
    console.error('Errore sincronizzazione timesheet/presenze:', error)
  }
}

// 🔄 OTTIMIZZAZIONE: Aggiornamento costi con cache
let costiUpdateTimeout = null
const updateCostiCantiere = async () => {
  if (!cantiere.value?.id) return
  
  try {
    const updateData = {
      costiAccumulati: {
        manodopera: costiCantiere.value.manodopera,
        materiali: costiCantiere.value.materiali,
        totale: costiCantiere.value.totale
      },
      updatedAt: new Date().toISOString()
    }
    
    await firestoreOperations.update('cantieri', cantiere.value.id, updateData)
  } catch (err) {
    console.error('Errore aggiornamento costi:', err)
  }
}

// 🚀 CALCOLO COSTI MATERIALI: Solo materiali (quando non ci sono registrazioni giornale)
const calculateMaterialCostsOnly = async () => {
  if (!cantiere.value?.id) return
  
  try {
    console.log('🔄 Calcolo costi materiali per cantiere:', cantiere.value.nome)
    
    // Carica i materiali per questo cantiere
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiere.value.id)
    let costoMateriali = 0
    if (materialiResult.success && materialiResult.data) {
      costoMateriali = materialiResult.data.reduce((acc, materiale) => {
        const quantita = materiale.quantitaUtilizzata || materiale.quantitaRichiesta || 0
        const prezzo = materiale.prezzoUnitario || 0
        return acc + (quantita * prezzo)
      }, 0)
      
      console.log(`📦 Trovati ${materialiResult.data.length} materiali, costo totale: €${costoMateriali}`)
    }
    
    // Aggiorna i costi locali per la visualizzazione (manodopera = 0 se non ci sono registrazioni)
    costiCantiere.value = {
      manodopera: 0,
      materiali: Math.round(costoMateriali * 100) / 100,
      totale: Math.round(costoMateriali * 100) / 100,
      giorniLavorativi: 0,
      oreTotali: 0,
      costoMedioGiorno: 0
    }
    
    // Aggiorna anche il database se ci sono materiali
    if (costoMateriali > 0) {
      const updateData = {
        costiAccumulati: {
          manodopera: 0,
          materiali: Math.round(costoMateriali * 100) / 100,
          totale: Math.round(costoMateriali * 100) / 100
        },
        statisticheCosti: {
          giorniLavorativi: 0,
          oreTotaliLavorate: 0,
          costoMedioGiornaliero: 0
        },
        updatedAt: new Date().toISOString()
      }
      
      await firestoreOperations.update('cantieri', cantiere.value.id, updateData)
      console.log('✅ Costi materiali aggiornati:', costoMateriali)
    }
    
  } catch (error) {
    console.error('Errore calcolo costi materiali:', error)
  }
}

// 🔄 Funzione per aggiornare manualmente i costi (pulsante "Aggiorna")
const refreshCosts = async () => {
  try {
    await refreshCantiereCostsFromTimesheet()
    success('Costi Aggiornati', 'Calcoli costi cantiere completati!')
  } catch (error) {
    console.error('Errore refresh costi:', error)
    popup.error('Errore', 'Impossibile aggiornare i costi')
  }
}

// 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere dal timesheet
const refreshCantiereCostsFromTimesheet = async () => {
  if (!cantiere.value?.id) return
  
  try {
    console.log('🔄 Aggiornamento automatico costi cantiere:', cantiere.value.nome)
    
    // Carica i timesheet per questo cantiere (senza ordinamento per evitare errore indice)
    const timesheetResult = await firestoreOperations.load('timesheet', [
      ['cantiereId', '==', cantiere.value.id]
    ], null)
    
    let costoManodopera = 0
    if (timesheetResult.success && timesheetResult.data) {
      costoManodopera = timesheetResult.data.reduce((acc, entry) => {
        const oreLavorate = entry.oreLavorate || entry.ore || 0
        const costoOrario = entry.costoOrario || 0
        return acc + (oreLavorate * costoOrario)
      }, 0)
    }
    
    // Carica i materiali per questo cantiere
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiere.value.id)
    let costoMateriali = 0
    if (materialiResult.success && materialiResult.data) {
      costoMateriali = materialiResult.data.reduce((acc, materiale) => {
        const quantita = materiale.quantitaUtilizzata || materiale.quantitaRichiesta || 0
        const prezzo = materiale.prezzoUnitario || 0
        return acc + (quantita * prezzo)
      }, 0)
    }
    
    // Calcola statistiche
    const giorniLavorativi = timesheetResult.success ? 
      [...new Set(timesheetResult.data.map(t => t.data))].length : 0
    const oreTotali = timesheetResult.success ?
      timesheetResult.data.reduce((acc, t) => acc + (t.oreLavorate || t.ore || 0), 0) : 0
    
    // Aggiorna i costi nel cantiere
    const updateData = {
      costiAccumulati: {
        manodopera: Math.round(costoManodopera * 100) / 100,
        materiali: Math.round(costoMateriali * 100) / 100,
        totale: Math.round((costoManodopera + costoMateriali) * 100) / 100
      },
      statisticheCosti: {
        giorniLavorativi,
        oreTotaliLavorate: oreTotali,
        costoMedioGiornaliero: giorniLavorativi > 0 ? Math.round(((costoManodopera + costoMateriali) / giorniLavorativi) * 100) / 100 : 0
      },
      updatedAt: new Date().toISOString()
    }
    
    await firestoreOperations.update('cantieri', cantiere.value.id, updateData)
    
    // Aggiorna anche i costi locali per la visualizzazione
    costiCantiere.value = {
      manodopera: costoManodopera,
      materiali: costoMateriali,
      totale: costoManodopera + costoMateriali,
      giorniLavorativi,
      oreTotali,
      costoMedioGiorno: giorniLavorativi > 0 ? (costoManodopera + costoMateriali) / giorniLavorativi : 0
    }
    
    console.log('✅ Costi aggiornati automaticamente:', {
      manodopera: costoManodopera,
      materiali: costoMateriali,
      totale: costoManodopera + costoMateriali
    })
    
  } catch (error) {
    console.error('Errore aggiornamento automatico costi:', error)
  }
}

const saveEntry = async () => {
  if (!cantiere.value?.id) {
    popup.error('Errore', 'Cantiere non selezionato')
    return
  }

  try {
    loading.value = true
    info('Salvataggio in corso...')
    
    // 🔧 CONVERSIONE DATI: Converte problemiText in array problemi
    const problemiArray = newEntryData.value.problemiText
      ? newEntryData.value.problemiText.split('\n').filter(p => p.trim() !== '')
      : []
    
    const entryData = {
      ...newEntryData.value,
      problemi: problemiArray, // Sostituisce problemiText con array problemi
      cantiereId: cantiere.value.id,
      createdAt: new Date().toISOString(),
      // NUOVO: Calcoli automatici costi
      costiTotali: {
        dipendenti: calculateDipendentiCost(),
        materiali: calculateMaterialiCost(),
        mezzi: calculateMezziCost(),
        lavori: calculateLavoriCost(),
        totale: calculateTotalCost()
      }
    }
    
    // 🧹 PULIZIA: Rimuove problemiText dal salvataggio (è solo per l'UI)
    delete entryData.problemiText
    
    if (editingEntry.value) {
      await firestoreOperations.giornaleCantiere.update(editingEntry.value.id, entryData)
    } else {
      await firestoreOperations.giornaleCantiere.create(cantiere.value.id, entryData)
    }
    
    // Chiudi il modal e mostra successo immediatamente (con cleanup forzato)
    showEntryModal.value = false
    const okPopupId = success('Registrazione Salvata', 'I dati sono stati salvati con successo', 2200)
    // Fallback cleanup nel raro caso l'auto-dismiss non scatti
    setTimeout(() => {
      removePopup(okPopupId)
    }, 2500)
    
    // 🔔 Notifica automatica: nuova registrazione giornale
    try {
      await firestoreStore.createNotification({
        type: 'giornale_create',
        message: `Giornale salvato per ${cantiere.value.nome} - ${entryData.data}`,
        recipients: ['admin'],
        meta: {
          cantiereId: cantiere.value.id,
          cantiereNome: cantiere.value.nome,
          data: entryData.data,
          dipendenti: (entryData.dipendenti || []).length,
          oreTotali: (entryData.dipendenti || []).reduce((s, d) => s + (d.ore || d.oreLavorate || 0), 0)
        }
      })
    } catch (e) {
      console.warn('Notifica giornale non creata:', e)
    }
    
    // Aggiorna in background
    Promise.all([
      loadGiornaleEntries(),
      updateCostiCantiere(),
      syncTimesheet()
    ]).then(async () => {
      // 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere
      await refreshCantiereCostsFromTimesheet()
    }).catch(console.error)
    
  } catch (err) {
    error('Errore Salvataggio', err.message)
  } finally {
    loading.value = false
  }
}

const deleteEntry = async (entryId) => {
  // Conferma eliminazione con popup personalizzato
  const proceed = await confirm(
    'Eliminare la registrazione?',
    'Questa azione rimuove il giornale e i timesheet collegati. Procedere?',
    { type: 'warning', confirmText: 'Elimina', cancelText: 'Annulla', icon: '⚠️' }
  )
  if (!proceed) {
    info('Operazione Annullata', "Eliminazione annullata dall'utente.", 1800)
    return
  }
  try {
    loading.value = true
    
    await firestoreOperations.giornaleCantiere.delete(entryId)
    
    const delPopupId = success('Registrazione Eliminata', 'La registrazione è stata eliminata con successo', 2200)
    setTimeout(() => {
      removePopup(delPopupId)
    }, 3500)
    
    // Aggiorna in background
    Promise.all([
      loadGiornaleEntries(),
      updateCostiCantiere(),
      syncTimesheet()
    ]).then(async () => {
      // 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere
      await refreshCantiereCostsFromTimesheet()
    }).catch(console.error)
    
  } catch (err) {
    error('Errore Eliminazione', err.message)
  } finally {
    loading.value = false
  }
}

// 🚀 OTTIMIZZAZIONE: Sincronizzazione timesheet
const syncTimesheet = async () => {
  try {
    // Carica tutti i timesheet esistenti per questo cantiere (senza ordinamento per evitare errore indice)
    const timesheetResult = await firestoreOperations.load('timesheet', [
      ['cantiereId', '==', cantiere.value.id]
    ], null)
    
    // Elimina i vecchi timesheet
    await Promise.allSettled(
      timesheetResult.data.map(timesheet => 
        firestoreOperations.delete('timesheet', timesheet.id)
      )
    )
    
    // Carica tutte le presenze esistenti (senza ordinamento per evitare errore indice)
    const presenzeResult = await firestoreOperations.load('presenze', [
      ['cantiereId', '==', cantiere.value.id]
    ], null)
    
    // Elimina le vecchie presenze
    await Promise.allSettled(
      presenzeResult.data.map(presenza => 
        firestoreOperations.delete('presenze', presenza.id)
      )
    )
    
    // Crea i nuovi timesheet e presenze in parallelo
    const promises = entries.value.flatMap(entry => {
      // Usa entry.dipendenti invece di entry.teamPresente
      const dipendenti = entry.dipendenti || []
      return dipendenti.map(async dipendente => {
        // Trova il dipendente corrispondente nello store
        const dipendenteStore = firestoreStore.dipendenti.find(d => d.id === dipendente.id)
        if (!dipendenteStore) return null
        
        // 🔧 VALIDAZIONE CENTRALIZZATA anche nella sincronizzazione
        const { validateTimesheetDate } = await import('../utils/timesheetValidation.js')
        const syncDateValidation = validateTimesheetDate(entry.data)
        
        if (syncDateValidation.wasFixed) {
          console.warn(`🔧 SYNC TIMESHEET: Data corretta da "${syncDateValidation.originalDate}" a "${syncDateValidation.correctedDate}"`)
        }
        
        const dataValidata = syncDateValidation.correctedDate
        
        // Crea timesheet
        const timesheetData = {
          dipendenteId: dipendente.id,
          cantiereId: cantiere.value.id,
          data: dataValidata, // 🔧 Usa data validata
          oreLavorate: dipendente.ore || 8,
          costoOrario: dipendente.costoOrario || dipendenteStore.pagaOraria || 0,
          fonte: 'giornale_cantiere_sync', // 🔧 Distingui la fonte
          dataOriginale: entry.data // 🔧 Salva originale per debug
        }
        
        // Crea presenza
        const presenzaData = {
          dipendenteId: dipendente.id,
          cantiereId: cantiere.value.id,
          data: dataValidata, // 🔧 Usa stessa data validata del timesheet
          tipo: 'cantiere',
          note: `Cantiere: ${cantiere.value.nome}`,
          fonte: 'giornale_cantiere_sync', // 🔧 Distingui la fonte
          dataOriginale: entry.data // 🔧 Salva originale per debug
        }
        
        return Promise.all([
          firestoreOperations.create('timesheet', timesheetData),
          firestoreOperations.create('presenze', presenzaData)
        ])
      })
    })
    
    await Promise.allSettled(promises)
  } catch (err) {
    console.error('Errore sincronizzazione timesheet:', err)
  }
}

const resetFilters = () => {
  selectedDate.value = ''
  selectedWeek.value = ''
}

const exportPDF = () => {
  if (!cantiere.value) {
          popup.error('Errore Export', 'Dati cantiere non disponibili')
    return
  }

  try {
    // Crea nuovo documento PDF
    const doc = new jsPDF()
    
    // Configurazione colori
    const primaryColor = [41, 128, 185] // Blue
    const secondaryColor = [52, 73, 94] // Dark gray
    const accentColor = [231, 76, 60]   // Red
    
    let yPosition = 20
    
    // Header del documento
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 35, 'F')
    
    // Logo/Titolo principale
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('📋 GIORNALE DI CANTIERE', 15, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Legnosystem.bio - Sistema di Gestione Cantieri', 15, 28)
    
    // Data di generazione
    doc.setFontSize(10)
    const oggi = new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.text(`Generato il: ${oggi}`, 150, 28)
    
    yPosition = 50
    
    // Informazioni cantiere
    doc.setTextColor(...secondaryColor)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('🏗️ INFORMAZIONI CANTIERE', 15, yPosition)
    
    yPosition += 10
    
    // Informazioni cantiere in formato testo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...secondaryColor)
    
    const infoLines = [
      `Nome Cantiere: ${cantiere.value.nome || 'N/A'}`,
      `Cliente: ${cantiere.value.cliente || 'N/A'}`,
      `Indirizzo: ${cantiere.value.indirizzo || 'N/A'}`,
      `Tipo Lavoro: ${cantiere.value.tipoLavoro || 'N/A'}`,
      `Stato: ${cantiere.value.stato || 'N/A'}`,
      `Progresso: ${cantiere.value.progresso || 0}%`,
      `Data Inizio: ${cantiere.value.dataInizio || 'N/A'}`,
      `Scadenza: ${cantiere.value.scadenza || 'N/A'}`,
      `Team: ${cantiere.value.team?.length ? cantiere.value.team.map(t => t.nome).join(', ') : 'Nessuno'}`
    ]
    
    infoLines.forEach((line, index) => {
      doc.text(line, 15, yPosition + (index * 8))
    })
    
    yPosition += infoLines.length * 8 + 20
    
    // Sezione registrazioni
    if (filteredEntries.value.length > 0) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('📝 REGISTRAZIONI GIORNALE', 15, yPosition)
      
      yPosition += 5
      
      // Info filtri applicati
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      let filtriText = `Registrazioni mostrate: ${filteredEntries.value.length}`
      if (selectedDate.value) {
        filtriText += ` | Filtro data: ${formatDate(selectedDate.value)}`
      }
      doc.text(filtriText, 15, yPosition)
      
      yPosition += 15
      
      // Per ogni registrazione
      filteredEntries.value.forEach((entry, index) => {
        // Controlla se serve una nuova pagina
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        // Titolo registrazione
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...accentColor)
        doc.text(`Registrazione ${index + 1} - ${formatDate(entry.data)}`, 15, yPosition)
        
        yPosition += 8
        
        // Dettagli registrazione in formato testo
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...secondaryColor)
        
        const dettagli = [
          `Data: ${formatDate(entry.data)}`,
          `Turno: ${entry.orarioInizio} - ${entry.orarioFine}`,
          `Responsabile: ${entry.responsabile}`,
          `Ore Totali: ${entry.oreTotali}h`,
          `Operatori: ${entry.team?.length || 0}`,
          `Meteo: ${entry.meteo?.condizioni || 'N/A'} - ${entry.meteo?.temperatura || 'N/A'}°C`,
          `Attività: ${entry.attivita?.join(', ') || 'Nessuna'}`,
          `Note: ${entry.note || 'Nessuna'}`,
          `Problemi: ${entry.problemi?.join(', ') || 'Nessuno'}`,
          `Allegati: ${entry.allegati?.length || 0}`
        ]
        
        dettagli.forEach((dettaglio, detIndex) => {
          doc.text(dettaglio, 20, yPosition + (detIndex * 6))
        })
        
        yPosition += dettagli.length * 6 + 12
      })
      
    } else {
      // Nessuna registrazione
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...accentColor)
      doc.text('📝 REGISTRAZIONI GIORNALE', 15, yPosition)
      
      yPosition += 15
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Nessuna registrazione presente per i filtri selezionati.', 15, yPosition)
      
      yPosition += 20
    }
    
    // Statistiche finali
    if (yPosition > 230) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...secondaryColor)
    doc.text('📊 STATISTICHE RIEPILOGATIVE', 15, yPosition)
    
    yPosition += 15
    
    const oreTotali = filteredEntries.value.reduce((total, entry) => total + (entry.oreTotali || 0), 0)
    const operatoriCoinvolti = [...new Set(filteredEntries.value.flatMap(entry => entry.team || []))].length
    const giorniLavorativi = filteredEntries.value.length
    const problemiTotali = filteredEntries.value.reduce((total, entry) => total + (entry.problemi?.length || 0), 0)
    
    const statistiche = [
      ['Giorni Lavorativi', giorniLavorativi],
      ['Ore Totali Lavorate', `${oreTotali}h`],
      ['Operatori Coinvolti', operatoriCoinvolti],
      ['Problemi Segnalati', problemiTotali],
      ['Media Ore/Giorno', giorniLavorativi > 0 ? `${(oreTotali / giorniLavorativi).toFixed(1)}h` : '0h'],
      ['Allegati Totali', filteredEntries.value.reduce((total, entry) => total + (entry.allegati?.length || 0), 0)]
    ]
    
    // Statistiche in formato testo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...secondaryColor)
    
    statistiche.forEach((stat, index) => {
      doc.text(`${stat[0]}: ${stat[1]}`, 15, yPosition + (index * 8))
    })
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Legnosystem.bio - Pagina ${i} di ${pageCount} - Generato il ${oggi}`,
        15,
        290
      )
    }
    
    // Salva il PDF
    const fileName = `Giornale_Cantiere_${cantiere.value.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
    // 📄 Popup di successo per export PDF
    success(
      'PDF Generato',
      `${filteredEntries.value.length} registrazioni • ${oreTotali}h totali`
    )
    
  } catch (errorObj) {
    console.error('Errore durante l\'export PDF:', errorObj)
    popup.error('Errore Export', errorObj.message)
  }
}

// Watch per cambiamenti di route
watch(() => route.params.id, async (newId) => {
  if (newId && newId !== cantiere.value?.id) {
    // Ricarica solo se l'ID è effettivamente cambiato
    const cantiereFound = firestoreStore.cantieri.find(c => c.id === newId)
    if (cantiereFound) {
      cantiere.value = cantiereFound
      await loadGiornaleEntries()
    }
  }
}, { immediate: false })

// Calcola le ore tra due orari
const calculateHours = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let hours = endHour - startHour
  let minutes = endMinute - startMinute
  
  // Se l'orario di fine è prima dell'orario di inizio, assumiamo che si tratti del giorno successivo
  if (hours < 0) {
    hours += 24
  }
  
  // Aggiustiamo i minuti
  if (minutes < 0) {
    hours -= 1
    minutes += 60
  }
  
  // Convertiamo in ore decimali
  return hours + (minutes / 60)
}

// Watch per aggiornare automaticamente le ore totali quando cambiano gli orari
watch([() => newEntryData.value.orarioInizio, () => newEntryData.value.orarioFine], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    newEntryData.value.oreTotali = calculateHours(newStart, newEnd)
  }
})
</script>

<style scoped>

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}
</style> 