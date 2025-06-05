<template>
  <div class="space-y-6">
    <!-- Header Giornale -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Giornale di Cantiere</h1>
        <p class="text-gray-600">{{ cantiere?.nome }} - {{ cantiere?.cliente }}</p>
      </div>
      <div class="flex space-x-3">
        <button @click="newEntry" class="btn-primary">
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
        <div class="space-y-2 text-sm">
          <div><span class="text-gray-600">Cantiere:</span> {{ cantiere?.nome }}</div>
          <div><span class="text-gray-600">Cliente:</span> {{ cantiere?.cliente }}</div>
          <div><span class="text-gray-600">Indirizzo:</span> {{ cantiere?.indirizzo }}</div>
          <div><span class="text-gray-600">Responsabile:</span> {{ cantiere?.responsabile || 'Non assegnato' }}</div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">📊 Stato Avanzamento</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Progresso</span>
            <span class="font-medium">{{ cantiere?.progresso }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full" :style="`width: ${cantiere?.progresso}%`"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Ultima modifica: {{ formatDate(today) }}
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">👥 Team Presente</h3>
        <div class="flex -space-x-2 mb-2">
          <div v-for="membro in cantiere?.team?.slice(0, 4)" :key="membro.id" 
               class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            {{ membro.iniziali }}
          </div>
        </div>
        <div class="text-xs text-gray-500">
          {{ cantiere?.team?.length || 0 }} dipendenti assegnati
        </div>
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
            <p class="text-sm text-gray-600">{{ entry.turno }} - {{ entry.responsabile }}</p>
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

          <!-- Ore Lavorate -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">⏰ Ore Lavorate</h4>
            <p class="text-sm font-semibold">{{ entry.oreTotali }}h totali</p>
            <p class="text-xs text-gray-500">{{ entry.team.length }} operatori</p>
          </div>

          <!-- Attività -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">🔨 Attività Principali</h4>
            <ul class="text-sm space-y-1">
              <li v-for="attivita in entry.attivita.slice(0, 2)" :key="attivita" class="text-gray-700">
                • {{ attivita }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Note e Problemi -->
        <div v-if="entry.note || entry.problemi.length > 0" class="mt-4 pt-4 border-t border-gray-200">
          <div v-if="entry.note" class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-1">📝 Note</h4>
            <p class="text-sm text-gray-600">{{ entry.note }}</p>
          </div>
          <div v-if="entry.problemi.length > 0">
            <h4 class="text-sm font-medium text-red-700 mb-1">⚠️ Problemi/Imprevisti</h4>
            <ul class="text-sm text-red-600 space-y-1">
              <li v-for="problema in entry.problemi" :key="problema">• {{ problema }}</li>
            </ul>
          </div>
        </div>

        <!-- Allegati -->
        <div v-if="entry.allegati.length > 0" class="mt-4 pt-4 border-t border-gray-200">
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
          <button @click="newEntry" class="btn-primary">
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
            <!-- Data e Turno -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input v-model="entryForm.data" type="date" required class="form-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Turno</label>
                <select v-model="entryForm.turno" required class="form-select">
                  <option value="mattino">Mattino (8:00-12:00)</option>
                  <option value="pomeriggio">Pomeriggio (13:00-17:00)</option>
                  <option value="giornata">Giornata intera</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Responsabile</label>
                <select v-model="entryForm.responsabile" required class="form-select">
                  <option v-for="membro in cantiere?.team" :key="membro.id" :value="membro.nome">
                    {{ membro.nome }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Condizioni Meteo -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🌤️ Condizioni Meteo</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Condizioni</label>
                  <select v-model="entryForm.meteo.condizioni" class="form-select">
                    <option value="sereno">☀️ Sereno</option>
                    <option value="nuvoloso">☁️ Nuvoloso</option>
                    <option value="pioggia">🌧️ Pioggia</option>
                    <option value="nevoso">❄️ Nevoso</option>
                    <option value="vento">💨 Ventoso</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
                  <input v-model.number="entryForm.meteo.temperatura" type="number" class="form-input">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Note Meteo</label>
                  <input v-model="entryForm.meteo.note" type="text" placeholder="Es: vento forte" class="form-input">
                </div>
              </div>
            </div>

            <!-- Attività Svolte -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">🔨 Attività Svolte</h4>
              <div class="space-y-3">
                <div v-for="(attivita, index) in entryForm.attivita" :key="index" class="flex items-center space-x-3">
                  <input v-model="entryForm.attivita[index]" type="text" placeholder="Descrivi l'attività svolta" class="flex-1 form-input">
                  <button type="button" @click="removeAttivita(index)" class="text-red-600 hover:text-red-800">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
                <button type="button" @click="addAttivita" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  + Aggiungi Attività
                </button>
              </div>
            </div>

            <!-- Note e Problemi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">📝 Note Generali</label>
                <textarea v-model="entryForm.note" rows="4" placeholder="Note e osservazioni della giornata" class="form-input"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">⚠️ Problemi/Imprevisti</label>
                <textarea v-model="entryForm.problemiText" rows="4" placeholder="Eventuali problemi riscontrati (uno per riga)" class="form-input"></textarea>
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
import { 
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  cantiereId: String
})

// Stato reattivo
const cantiere = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedWeek = ref('')
const showEntryModal = ref(false)
const editingEntry = ref(null)
const today = new Date().toISOString().split('T')[0]

// Form per nuova registrazione
const entryForm = ref({
  data: new Date().toISOString().split('T')[0],
  turno: 'giornata',
  responsabile: '',
  meteo: {
    condizioni: 'sereno',
    temperatura: 20,
    note: ''
  },
  attivita: [''],
  note: '',
  problemiText: '',
  oreTotali: 8,
  team: []
})

// Dati di esempio
const entries = ref([
  {
    id: 1,
    data: '2024-01-15',
    turno: 'giornata',
    responsabile: 'Marco Bianchi',
    meteo: {
      condizioni: 'sereno',
      temperatura: 15,
      note: 'Giornata ideale per lavori esterni'
    },
    attivita: [
      'Montaggio travi principali',
      'Installazione pannelli isolanti',
      'Controllo livellamento struttura'
    ],
    note: 'Lavori proceduti senza intoppi. Team molto efficiente.',
    problemi: [],
    oreTotali: 32,
    team: [
      { id: 1, nome: 'Marco Bianchi', ore: 8 },
      { id: 2, nome: 'Luca Verdi', ore: 8 },
      { id: 3, nome: 'Anna Russo', ore: 8 },
      { id: 4, nome: 'Giuseppe Neri', ore: 8 }
    ],
    allegati: [
      { id: 1, nome: 'foto_struttura_01.jpg', tipo: 'immagine' },
      { id: 2, nome: 'foto_struttura_02.jpg', tipo: 'immagine' }
    ]
  },
  {
    id: 2,
    data: '2024-01-16',
    turno: 'mattino',
    responsabile: 'Marco Bianchi',
    meteo: {
      condizioni: 'pioggia',
      temperatura: 8,
      note: 'Pioggia intensa dalle 10:00'
    },
    attivita: [
      'Preparazione materiali al coperto',
      'Controllo qualità pannelli'
    ],
    note: 'Lavori sospesi per maltempo alle 10:00',
    problemi: ['Ritardo consegna viti speciali', 'Maltempo ha interrotto lavori esterni'],
    oreTotali: 16,
    team: [
      { id: 1, nome: 'Marco Bianchi', ore: 4 },
      { id: 2, nome: 'Luca Verdi', ore: 4 },
      { id: 3, nome: 'Anna Russo', ore: 4 },
      { id: 4, nome: 'Giuseppe Neri', ore: 4 }
    ],
    allegati: []
  }
])

// Computed
const filteredEntries = computed(() => {
  let result = entries.value

  if (selectedDate.value) {
    result = result.filter(entry => entry.data === selectedDate.value)
  }

  return result.sort((a, b) => new Date(b.data) - new Date(a.data))
})

const availableWeeks = computed(() => {
  // Genera le settimane disponibili basate sulle registrazioni
  const weeks = []
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)
  
  for (let i = 0; i < 52; i++) {
    const weekStart = new Date(startOfYear.getTime() + (i * 7 * 24 * 60 * 60 * 1000))
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000))
    
    weeks.push({
      value: `${weekStart.toISOString().split('T')[0]}_${weekEnd.toISOString().split('T')[0]}`,
      label: `Settimana ${i + 1} (${weekStart.toLocaleDateString('it-IT')} - ${weekEnd.toLocaleDateString('it-IT')})`
    })
  }
  
  return weeks
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const newEntry = () => {
  editingEntry.value = null
  entryForm.value = {
    data: new Date().toISOString().split('T')[0],
    turno: 'giornata',
    responsabile: cantiere.value?.team?.[0]?.nome || '',
    meteo: {
      condizioni: 'sereno',
      temperatura: 20,
      note: ''
    },
    attivita: [''],
    note: '',
    problemiText: '',
    oreTotali: 8,
    team: []
  }
  showEntryModal.value = true
}

const editEntry = (entry) => {
  editingEntry.value = entry
  entryForm.value = {
    data: entry.data,
    turno: entry.turno,
    responsabile: entry.responsabile,
    meteo: { ...entry.meteo },
    attivita: [...entry.attivita],
    note: entry.note,
    problemiText: entry.problemi.join('\n'),
    oreTotali: entry.oreTotali,
    team: [...entry.team]
  }
  showEntryModal.value = true
}

const closeEntryModal = () => {
  showEntryModal.value = false
  editingEntry.value = null
}

const addAttivita = () => {
  entryForm.value.attivita.push('')
}

const removeAttivita = (index) => {
  entryForm.value.attivita.splice(index, 1)
}

const saveEntry = () => {
  const newEntryData = {
    id: editingEntry.value?.id || Date.now(),
    data: entryForm.value.data,
    turno: entryForm.value.turno,
    responsabile: entryForm.value.responsabile,
    meteo: { ...entryForm.value.meteo },
    attivita: entryForm.value.attivita.filter(a => a.trim()),
    note: entryForm.value.note,
    problemi: entryForm.value.problemiText.split('\n').filter(p => p.trim()),
    oreTotali: entryForm.value.oreTotali,
    team: entryForm.value.team,
    allegati: editingEntry.value?.allegati || []
  }

  if (editingEntry.value) {
    const index = entries.value.findIndex(e => e.id === editingEntry.value.id)
    entries.value[index] = newEntryData
  } else {
    entries.value.push(newEntryData)
  }

  closeEntryModal()
}

const deleteEntry = (entryId) => {
  if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
    const index = entries.value.findIndex(e => e.id === entryId)
    entries.value.splice(index, 1)
  }
}

const resetFilters = () => {
  selectedDate.value = ''
  selectedWeek.value = ''
}

const exportPDF = () => {
  alert('📄 Export PDF in fase di sviluppo - includerà tutte le registrazioni filtrate')
}

// Lifecycle
onMounted(() => {
  // Carica i dati del cantiere
  loadCantiereData()
})

const loadCantiereData = () => {
  // Simula il caricamento dei dati del cantiere
  cantiere.value = {
    id: props.cantiereId || 1,
    nome: 'Villa Rossi',
    cliente: 'Mario Rossi',
    indirizzo: 'Via Roma 123, Milano',
    progresso: 65,
    responsabile: 'Marco Bianchi',
    team: [
      { id: 1, nome: 'Marco Bianchi', iniziali: 'MB' },
      { id: 2, nome: 'Luca Verdi', iniziali: 'LV' },
      { id: 3, nome: 'Anna Russo', iniziali: 'AR' },
      { id: 4, nome: 'Giuseppe Neri', iniziali: 'GN' }
    ]
  }
}
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base;
}

.form-select {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base;
}
</style> 