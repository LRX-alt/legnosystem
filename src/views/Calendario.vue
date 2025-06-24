<template>
  <div class="space-y-6">
    <!-- Header Calendario -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Calendario & Planning</h1>
        <p class="text-gray-600">Gestione tempi e risorse - Legnosystem.bio</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <button @click="showNewEventModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuovo Evento
        </button>
        <button @click="showResourceModal = true" class="w-full sm:w-auto btn-secondary py-3 text-base">
          <UserGroupIcon class="w-5 h-5 mr-2" />
          Gestisci Risorse
        </button>
      </div>
    </div>

    <!-- Stats Cards Planning -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Eventi Oggi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.eventiOggi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cantieri Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.cantieriAttivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-orange-100 rounded-lg">
            <UsersIcon class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Persone Impegnate</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.personeImpegnate }}/{{ stats.totalePers }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Scadenze Urgenti</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.scadenzeUrgenti }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Conflitti -->
    <div v-if="alertConflitti.length > 0" class="card bg-red-50 border border-red-200">
      <div class="flex items-start">
        <ExclamationTriangleIcon class="w-6 h-6 text-red-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-red-800 mb-2">⚠️ Conflitti Risorse</h3>
          <div class="space-y-2">
            <div v-for="alert in alertConflitti" :key="alert.id" class="flex items-center justify-between">
              <span class="text-red-700">{{ alert.risorsa }} - {{ alert.conflitto }}</span>
              <span class="text-red-600 font-medium">{{ alert.data }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controlli Vista -->
    <div class="card">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex items-center space-x-4">
          <button @click="previousPeriod" class="p-2 text-gray-400 hover:text-gray-600">
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <h2 class="text-xl font-semibold text-gray-900">{{ formatCurrentPeriod() }}</h2>
          <button @click="nextPeriod" class="p-2 text-gray-400 hover:text-gray-600">
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            v-for="vista in viste" 
            :key="vista.id"
            @click="currentView = vista.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              currentView === vista.id 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ vista.label }}
          </button>
        </div>
        
        <div class="flex items-center space-x-2">
          <select v-model="filterType" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm">
            <option value="">Tutti gli eventi</option>
            <option value="cantiere">Solo Cantieri</option>
            <option value="appuntamento">Solo Appuntamenti</option>
            <option value="scadenza">Solo Scadenze</option>
          </select>
          <button @click="todayView" class="btn-secondary text-sm py-2 px-3">
            Oggi
          </button>
        </div>
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

    <!-- Tab Content: Calendario -->
    <div v-if="activeTab === 'calendario'" class="space-y-6">
      <!-- Vista Calendario Mensile -->
      <div v-if="currentView === 'month'" class="card">
        <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          <!-- Header giorni settimana -->
          <div v-for="day in ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']" 
               :key="day" 
               class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">
            {{ day }}
          </div>
          
          <!-- Giorni del mese -->
          <div v-for="day in monthDays" 
               :key="day.date" 
               :class="[
                 'bg-white p-2 min-h-[120px] relative',
                 day.isCurrentMonth ? '' : 'text-gray-400 bg-gray-50',
                 day.isToday ? 'bg-blue-50' : ''
               ]">
            <div class="text-sm font-medium mb-1">{{ day.day }}</div>
            
            <!-- Eventi del giorno -->
            <div class="space-y-1">
              <div v-for="evento in getEventsForDay(day.date)" 
                   :key="evento.id"
                   @click="viewEvent(evento)"
                   :class="[
                     'text-xs p-1 rounded cursor-pointer truncate',
                     getEventColor(evento.type)
                   ]">
                {{ evento.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Settimanale -->
      <div v-if="currentView === 'week'" class="card">
        <div class="overflow-x-auto">
          <div class="min-w-full">
            <!-- Header settimana -->
            <div class="grid grid-cols-8 gap-px bg-gray-200 mb-4">
              <div class="bg-gray-50 p-3 text-sm font-medium text-gray-600">Ora</div>
              <div v-for="day in weekDays" 
                   :key="day.date"
                   class="bg-gray-50 p-3 text-center">
                <div class="text-sm font-medium">{{ day.dayName }}</div>
                <div class="text-lg" :class="day.isToday ? 'text-blue-600 font-bold' : 'text-gray-900'">
                  {{ day.day }}
                </div>
              </div>
            </div>
            
            <!-- Griglia oraria -->
            <div class="space-y-px">
              <div v-for="hour in hours" 
                   :key="hour"
                   class="grid grid-cols-8 gap-px">
                <div class="bg-gray-50 p-2 text-xs text-gray-600 text-right pr-4">
                  {{ hour }}:00
                </div>
                <div v-for="day in weekDays" 
                     :key="`${day.date}-${hour}`"
                     class="bg-white p-1 min-h-[60px] border-t border-gray-100 relative">
                  <!-- Eventi per ora/giorno -->
                  <div v-for="evento in getEventsForDayHour(day.date, hour)" 
                       :key="evento.id"
                       @click="viewEvent(evento)"
                       :class="[
                         'text-xs p-1 rounded cursor-pointer mb-1',
                         getEventColor(evento.type)
                       ]">
                    {{ evento.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Giornaliera -->
      <div v-if="currentView === 'day'" class="card">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ formatDate(currentDate) }}
          </h3>
          
          <div class="space-y-2">
            <div v-for="hour in hours" 
                 :key="hour"
                 class="flex border-b border-gray-100 py-2">
              <div class="w-20 text-sm text-gray-600 text-right pr-4">
                {{ hour }}:00
              </div>
              <div class="flex-1">
                <div v-for="evento in getEventsForDayHour(currentDate, hour)" 
                     :key="evento.id"
                     @click="viewEvent(evento)"
                     :class="[
                       'p-3 rounded-lg cursor-pointer mb-2',
                       getEventColor(evento.type)
                     ]">
                  <div class="font-medium">{{ evento.title }}</div>
                  <div class="text-sm opacity-80">{{ evento.description }}</div>
                  <div class="text-xs mt-1">{{ evento.startTime }} - {{ evento.endTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Planning Cantieri -->
    <div v-if="activeTab === 'planning'" class="space-y-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Timeline Cantieri - Gennaio 2024</h3>
        
        <!-- Legenda -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span class="text-sm text-gray-600">In corso</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span class="text-sm text-gray-600">Completati</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span class="text-sm text-gray-600">In ritardo</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span class="text-sm text-gray-600">Pianificati</span>
          </div>
        </div>

        <!-- Timeline Gantt -->
        <div class="overflow-x-auto">
          <div class="min-w-[800px]">
            <!-- Header Timeline -->
            <div class="grid grid-cols-32 gap-px mb-4">
              <div class="col-span-8 p-3 bg-gray-50 text-sm font-medium text-gray-600">Progetto</div>
              <div v-for="day in 31" 
                   :key="day"
                   class="p-1 bg-gray-50 text-center text-xs text-gray-600">
                {{ day }}
              </div>
            </div>
            
            <!-- Righe Cantieri -->
            <div v-for="cantiere in planningCantieri" 
                 :key="cantiere.id"
                 class="grid grid-cols-32 gap-px mb-2">
              <div class="col-span-8 p-3 bg-white border border-gray-200">
                <div class="font-medium text-sm">{{ cantiere.nome }}</div>
                <div class="text-xs text-gray-500">{{ cantiere.cliente }}</div>
                <div class="text-xs mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs" :class="getStatusColor(cantiere.stato)">
                    {{ getStatusLabel(cantiere.stato) }}
                  </span>
                </div>
              </div>
              
              <!-- Barra Timeline -->
              <div v-for="day in 31" 
                   :key="`${cantiere.id}-${day}`"
                   :class="[
                     'min-h-[60px] border border-gray-200',
                     isDayInRange(day, cantiere.startDay, cantiere.endDay) ? getTimelineColor(cantiere.stato) : 'bg-white'
                   ]">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Risorse -->
    <div v-if="activeTab === 'risorse'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personale -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Allocazione Personale</h3>
          <div class="space-y-4">
            <div v-for="persona in personale" 
                 :key="persona.id"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-bold text-sm">{{ persona.iniziali }}</span>
                </div>
                <div class="ml-3">
                  <div class="font-medium text-sm">{{ persona.nome }}</div>
                  <div class="text-xs text-gray-500">{{ persona.ruolo }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium" :class="persona.occupato ? 'text-red-600' : 'text-green-600'">
                  {{ persona.occupato ? 'Impegnato' : 'Disponibile' }}
                </div>
                <div class="text-xs text-gray-500">{{ persona.cantiere || 'Nessun cantiere' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mezzi e Attrezzature -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Mezzi & Attrezzature</h3>
          <div class="space-y-4">
            <div v-for="mezzo in mezzi" 
                 :key="mezzo.id"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  mezzo.type === 'camion' ? 'bg-blue-100' : 'bg-orange-100'
                ]">
                  <TruckIcon v-if="mezzo.type === 'camion'" class="w-6 h-6 text-blue-600" />
                  <WrenchScrewdriverIcon v-else class="w-6 h-6 text-orange-600" />
                </div>
                <div class="ml-3">
                  <div class="font-medium text-sm">{{ mezzo.nome }}</div>
                  <div class="text-xs text-gray-500">{{ mezzo.tipo }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium" :class="mezzo.occupato ? 'text-red-600' : 'text-green-600'">
                  {{ mezzo.occupato ? 'In uso' : 'Disponibile' }}
                </div>
                <div class="text-xs text-gray-500">{{ mezzo.location || 'Base' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo Evento -->
    <div v-if="showNewEventModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeNewEventModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Evento</h3>
            <button @click="closeNewEventModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="createEvent" class="space-y-6">
            <!-- Tipo e Titolo -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Evento *</label>
                <select v-model="newEvent.type" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona tipo</option>
                  <option value="cantiere">Cantiere</option>
                  <option value="appuntamento">Appuntamento Cliente</option>
                  <option value="scadenza">Scadenza</option>
                  <option value="manutenzione">Manutenzione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titolo *</label>
                <input v-model="newEvent.title" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Data e Ora -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input v-model="newEvent.date" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ora Inizio *</label>
                <input v-model="newEvent.startTime" type="time" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ora Fine *</label>
                <input v-model="newEvent.endTime" type="time" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea v-model="newEvent.description" rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"></textarea>
            </div>

            <!-- Assegnazioni -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Personale Assegnato</label>
                <select v-model="newEvent.assignedPeople" multiple
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option v-for="persona in personale" :key="persona.id" :value="persona.id">
                    {{ persona.nome }} - {{ persona.ruolo }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Risorse Necessarie</label>
                <select v-model="newEvent.assignedResources" multiple
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option v-for="mezzo in mezzi" :key="mezzo.id" :value="mezzo.id">
                    {{ mezzo.nome }} - {{ mezzo.tipo }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeNewEventModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                📅 Crea Evento
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
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showNewEventModal = ref(false)
const showResourceModal = ref(false)
const activeTab = ref('calendario')
const currentView = ref('month')
const currentDate = ref(new Date())
const filterType = ref('')

// Stats - resettate a 0
const stats = ref({
  eventiOggi: 0,
  cantieriAttivi: 0,
  personeImpegnate: 0,
  totalePers: 0,
  scadenzeUrgenti: 0
})

// Tabs - reset count a 0
const tabs = ref([
  { id: 'calendario', name: 'Calendario', count: 0 },
  { id: 'planning', name: 'Planning Cantieri', count: 0 },
  { id: 'risorse', name: 'Gestione Risorse', count: 0 }
])

// Viste
const viste = ref([
  { id: 'month', label: 'Mese' },
  { id: 'week', label: 'Settimana' },
  { id: 'day', label: 'Giorno' }
])

// Alert Conflitti - vuoto, da caricare da Firestore
const alertConflitti = ref([])

// Nuovo Evento
const newEvent = ref({
  type: '',
  title: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '17:00',
  description: '',
  assignedPeople: [],
  assignedResources: []
})

// Eventi - vuoto, da caricare da Firestore
const eventi = ref([])

// Planning Cantieri - vuoto, da caricare da Firestore
const planningCantieri = ref([])

// Personale - vuoto, da caricare da Firestore
const personale = ref([])

// Mezzi - vuoto, da caricare da Firestore
const mezzi = ref([])

// Ore del giorno
const hours = ref(Array.from({ length: 10 }, (_, i) => i + 8)) // 8:00 - 17:00

// Computed
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - (firstDay.getDay() + 6) % 7)
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  
  const days = []
  const today = new Date()
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      dayName: dayNames[i],
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

// Methods
const getEventColor = (type) => {
  const colors = {
    'cantiere': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'appuntamento': 'bg-green-100 text-green-800 hover:bg-green-200',
    'scadenza': 'bg-red-100 text-red-800 hover:bg-red-200',
    'manutenzione': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  }
  return colors[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

const getStatusColor = (stato) => {
  const colors = {
    'in_corso': 'bg-blue-100 text-blue-800',
    'completato': 'bg-green-100 text-green-800',
    'pianificato': 'bg-gray-100 text-gray-800',
    'in_ritardo': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'in_corso': 'In corso',
    'completato': 'Completato',
    'pianificato': 'Pianificato',
    'in_ritardo': 'In ritardo'
  }
  return labels[stato] || stato
}

const getTimelineColor = (stato) => {
  const colors = {
    'in_corso': 'bg-blue-500',
    'completato': 'bg-green-500',
    'pianificato': 'bg-gray-300',
    'in_ritardo': 'bg-yellow-500'
  }
  return colors[stato] || 'bg-gray-300'
}

const isDayInRange = (day, startDay, endDay) => {
  return day >= startDay && day <= endDay
}

const getEventsForDay = (date) => {
  return eventi.value.filter(evento => evento.date === date)
}

const getEventsForDayHour = (date, hour) => {
  return eventi.value.filter(evento => {
    if (evento.date !== date) return false
    const startHour = parseInt(evento.startTime.split(':')[0])
    const endHour = parseInt(evento.endTime.split(':')[0])
    return hour >= startHour && hour < endHour
  })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatCurrentPeriod = () => {
  const options = { year: 'numeric', month: 'long' }
  if (currentView.value === 'week') {
    options.day = 'numeric'
  }
  return currentDate.value.toLocaleDateString('it-IT', options)
}

const previousPeriod = () => {
  const newDate = new Date(currentDate.value)
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setDate(newDate.getDate() - 1)
  }
  currentDate.value = newDate
}

const nextPeriod = () => {
  const newDate = new Date(currentDate.value)
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setDate(newDate.getDate() + 1)
  }
  currentDate.value = newDate
}

const todayView = () => {
  currentDate.value = new Date()
}

const viewEvent = (evento) => {
  alert(`📅 ${evento.title}\n\n📅 Data: ${formatDate(evento.date)}\n⏰ Orario: ${evento.startTime} - ${evento.endTime}\n📝 Descrizione: ${evento.description}\n🏷️ Tipo: ${evento.type}`)
}

const createEvent = () => {
  if (!newEvent.value.type || !newEvent.value.title) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const nuovoEvento = {
    id: Date.now(),
    ...newEvent.value,
    status: 'confirmed'
  }

  eventi.value.push(nuovoEvento)
  stats.value.eventiOggi++

  closeNewEventModal()
  alert(`✅ Evento "${nuovoEvento.title}" creato con successo!`)
}

const closeNewEventModal = () => {
  showNewEventModal.value = false
  newEvent.value = {
    type: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    assignedPeople: [],
    assignedResources: []
  }
}
</script> 