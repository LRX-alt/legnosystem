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
            <option value="giornale">Solo Giornale</option>
          </select>
          <label class="inline-flex items-center text-sm text-gray-600 ml-2">
            <input type="checkbox" v-model="showJournal" class="mr-2">
            Mostra Giornale
          </label>
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

    <!-- Modal Dettaglio Evento -->
    <div v-if="showEventDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEventDetailModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-lg" :class="getEventHeaderColor(selectedEvent?.type)">
                <CalendarDaysIcon v-if="selectedEvent?.type === 'cantiere'" class="w-6 h-6" />
                <ClockIcon v-else-if="selectedEvent?.type === 'scadenza'" class="w-6 h-6" />
                <UserGroupIcon v-else class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ selectedEvent?.title }}</h3>
                <p class="text-sm text-gray-600">{{ selectedEvent?.type === 'cantiere' ? 'Cantiere' : selectedEvent?.type === 'scadenza' ? 'Scadenza' : 'Appuntamento' }}</p>
              </div>
            </div>
            <button @click="closeEventDetailModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Info Base Evento -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <CalendarDaysIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm text-gray-600">Data</p>
                  <p class="font-medium">{{ formatDate(selectedEvent?.date) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <ClockIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm text-gray-600">Orario</p>
                  <p class="font-medium">{{ selectedEvent?.startTime }} - {{ selectedEvent?.endTime }}</p>
                </div>
              </div>
            </div>
            <div v-if="selectedEvent?.description" class="mt-4">
              <p class="text-sm text-gray-600">Descrizione</p>
              <p class="font-medium">{{ selectedEvent.description }}</p>
            </div>
          </div>

          <!-- Dettaglio Giornale Cantiere -->
          <div v-if="selectedEvent?.giornale" class="space-y-6">
            <!-- Riepilogo sintetico -->
            <div class="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                <CalendarDaysIcon class="w-5 h-5 mr-2" />
                Dettaglio Giornale Cantiere
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg border border-indigo-100 p-3">
                  <p class="text-xs text-indigo-600">Dipendenti</p>
                  <p class="text-xl font-semibold text-indigo-900">{{ selectedJournalStats.numDip }}</p>
                </div>
                <div class="bg-white rounded-lg border border-indigo-100 p-3">
                  <p class="text-xs text-indigo-600">Ore Totali</p>
                  <p class="text-xl font-semibold text-indigo-900">{{ selectedJournalStats.oreTot }}h</p>
                </div>
                <div class="bg-white rounded-lg border border-indigo-100 p-3">
                  <p class="text-xs text-indigo-600">Costo Totale</p>
                  <p class="text-xl font-semibold text-red-600">€{{ Math.round(selectedJournalStats.totale).toLocaleString('it-IT') }}</p>
                </div>
              </div>
            </div>

            <!-- Breakdown costi -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h5 class="text-sm font-semibold text-gray-700 mb-3">Breakdown Costi</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p class="text-orange-700">Dipendenti</p>
                  <p class="font-semibold text-orange-900">€{{ Math.round(selectedJournalStats.costoDip).toLocaleString('it-IT') }}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p class="text-blue-700">Materiali</p>
                  <p class="font-semibold text-blue-900">€{{ Math.round(selectedJournalStats.costoMat).toLocaleString('it-IT') }}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p class="text-purple-700">Mezzi</p>
                  <p class="font-semibold text-purple-900">€{{ Math.round(selectedJournalStats.costoMez).toLocaleString('it-IT') }}</p>
                </div>
                <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p class="text-emerald-700">Lavori</p>
                  <p class="font-semibold text-emerald-900">€{{ Math.round(selectedJournalStats.costoLav).toLocaleString('it-IT') }}</p>
                </div>
              </div>
            </div>

            <!-- Elenchi sintetici -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Materiali -->
              <div class="border rounded-lg">
                <div class="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                  <span class="w-4 h-4 rounded-sm bg-blue-500 inline-block"></span>
                  <h5 class="text-sm font-medium text-gray-700">Materiali</h5>
                </div>
                <div class="max-h-40 overflow-y-auto divide-y">
                  <div v-if="!selectedEvent.giornale.materiali || selectedEvent.giornale.materiali.length === 0" class="p-3 text-sm text-gray-500">Nessun materiale</div>
                  <div v-for="m in selectedEvent.giornale.materiali || []" :key="m.id" class="p-3 text-sm flex items-center justify-between">
                    <div>
                      <div class="font-medium text-gray-900">{{ m.nome }}</div>
                      <div class="text-gray-500 text-xs">{{ m.quantita }} {{ m.unita || 'pz' }}</div>
                    </div>
                    <div class="text-blue-600 font-semibold">€{{ (m.costoTotale || ((m.quantita || 0)*(m.costoUnitario || m.prezzoUnitario || 0))).toFixed(2) }}</div>
                  </div>
                </div>
              </div>

              <!-- Mezzi / Lavori -->
              <div class="grid grid-cols-1 gap-6">
                <div class="border rounded-lg">
                  <div class="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                    <span class="w-4 h-4 rounded-sm bg-purple-500 inline-block"></span>
                    <h5 class="text-sm font-medium text-gray-700">Mezzi</h5>
                  </div>
                  <div class="max-h-40 overflow-y-auto divide-y">
                    <div v-if="!selectedEvent.giornale.mezzi || selectedEvent.giornale.mezzi.length === 0" class="p-3 text-sm text-gray-500">Nessun mezzo</div>
                    <div v-for="z in selectedEvent.giornale.mezzi || []" :key="z.id" class="p-3 text-sm flex items-center justify-between">
                      <div>
                        <div class="font-medium text-gray-900">{{ z.nome }}</div>
                        <div class="text-gray-500 text-xs">{{ z.oreUtilizzo || 0 }}h × €{{ z.costoOrario || 0 }}/h</div>
                      </div>
                      <div class="text-purple-600 font-semibold">€{{ (z.costoTotale || ((z.oreUtilizzo || 0)*(z.costoOrario || 0))).toFixed(2) }}</div>
                    </div>
                  </div>
                </div>

                <div class="border rounded-lg">
                  <div class="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                    <span class="w-4 h-4 rounded-sm bg-emerald-500 inline-block"></span>
                    <h5 class="text-sm font-medium text-gray-700">Lavori</h5>
                  </div>
                  <div class="max-h-40 overflow-y-auto divide-y">
                    <div v-if="!selectedEvent.giornale.lavori || selectedEvent.giornale.lavori.length === 0" class="p-3 text-sm text-gray-500">Nessun lavoro</div>
                    <div v-for="l in selectedEvent.giornale.lavori || []" :key="`${l.tipo}-${l.sottocategoria}`" class="p-3 text-sm flex items-center justify-between">
                      <div>
                        <div class="font-medium text-gray-900">{{ l.tipo }} - {{ l.sottocategoria }}</div>
                        <div class="text-gray-500 text-xs">{{ l.ore || 0 }}h × €{{ l.costoOrario || 0 }}/h</div>
                      </div>
                      <div class="text-emerald-700 font-semibold">€{{ (l.costoTotale || ((l.ore || 0)*(l.costoOrario || 0))).toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Meteo, Attività e Note -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border rounded-lg p-3">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Meteo</h5>
                <div class="text-sm text-gray-600">Condizioni: {{ selectedEvent.giornale.meteo?.condizioni || 'N/D' }}</div>
                <div class="text-sm text-gray-600">Temp: {{ selectedEvent.giornale.meteo?.temperatura ?? 'N/D' }}°C</div>
              </div>
              <div class="border rounded-lg p-3">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Attività</h5>
                <ul class="list-disc pl-4 text-sm text-gray-700 space-y-1 max-h-24 overflow-y-auto">
                  <li v-for="(a, i) in selectedEvent.giornale.attivita || []" :key="i">{{ a }}</li>
                  <li v-if="!selectedEvent.giornale.attivita || selectedEvent.giornale.attivita.length === 0" class="text-gray-500">Nessuna attività</li>
                </ul>
              </div>
              <div class="border rounded-lg p-3">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Note</h5>
                <div class="text-sm text-gray-700 max-h-24 overflow-y-auto">{{ selectedEvent.giornale.note || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Dettagli Cantiere (se presente) -->
          <div v-if="selectedEvent?.cantiere" class="space-y-6">
            <!-- Info Cliente e Progetto -->
            <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <BuildingOfficeIcon class="w-5 h-5 mr-2" />
                Informazioni Progetto
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-blue-700">Cliente</p>
                  <p class="font-medium text-blue-900">{{ selectedEvent.cantiere.cliente }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-700">Tipo Lavoro</p>
                  <p class="font-medium text-blue-900">{{ selectedEvent.cantiere.tipoLavoro || 'Non specificato' }}</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-sm text-blue-700">Indirizzo</p>
                  <p class="font-medium text-blue-900">{{ selectedEvent.cantiere.indirizzo }}</p>
                </div>
              </div>
            </div>

            <!-- Stato e Progresso -->
            <div class="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <ChartBarIcon class="w-5 h-5 mr-2" />
                Stato Avanzamento
              </h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-green-700">Stato Progetto</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getStatusColor(selectedEvent.cantiere.stato)">
                    {{ getStatusLabel(selectedEvent.cantiere.stato) }}
                  </span>
                </div>
                <div>
                  <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-green-700">Progresso Completamento</span>
                    <span class="font-medium text-green-900">{{ selectedEvent.cantiere.progresso || 0 }}%</span>
                  </div>
                  <div class="w-full bg-green-200 rounded-full h-3">
                    <div class="bg-green-600 h-3 rounded-full transition-all duration-300" 
                         :style="`width: ${selectedEvent.cantiere.progresso || 0}%`">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informazioni Economiche -->
            <div class="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                <CurrencyEuroIcon class="w-5 h-5 mr-2" />
                Riepilogo Economico
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-orange-700">Valore Contratto</p>
                  <p class="font-bold text-xl text-orange-900">€{{ selectedEvent.cantiere.valore?.toLocaleString() || '0' }}</p>
                </div>
                <div v-if="selectedEvent.cantiere.costiAccumulati?.totale">
                  <p class="text-sm text-orange-700">Costi Sostenuti</p>
                  <p class="font-bold text-xl text-red-600">€{{ selectedEvent.cantiere.costiAccumulati.totale.toLocaleString() }}</p>
                </div>
              </div>
              
              <!-- Dettaglio Costi -->
              <div v-if="selectedEvent.cantiere.costiAccumulati" class="mt-4 pt-4 border-t border-orange-200">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-orange-700">Materiali</p>
                    <p class="font-medium text-blue-600">€{{ selectedEvent.cantiere.costiAccumulati.materiali?.toLocaleString() || '0' }}</p>
                  </div>
                  <div>
                    <p class="text-orange-700">Manodopera</p>
                    <p class="font-medium text-green-600">€{{ selectedEvent.cantiere.costiAccumulati.manodopera?.toLocaleString() || '0' }}</p>
                  </div>
                </div>
                
                <!-- Margine -->
                <div class="mt-3 pt-3 border-t border-orange-200">
                  <div class="flex justify-between items-center">
                    <span class="text-orange-700">Margine Rimanente</span>
                    <span class="font-bold" :class="getMargineColorText(selectedEvent.cantiere)">
                      €{{ (selectedEvent.cantiere.valore - (selectedEvent.cantiere.costiAccumulati?.totale || 0)).toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline Date -->
            <div class="border border-purple-200 bg-purple-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <CalendarDaysIcon class="w-5 h-5 mr-2" />
                Timeline Progetto
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-purple-700">Data Inizio</p>
                  <p class="font-medium text-purple-900">{{ formatDate(selectedEvent.cantiere.dataInizio) }}</p>
                </div>
                <div>
                  <p class="text-sm text-purple-700">Scadenza Prevista</p>
                  <p class="font-medium text-purple-900">{{ formatDate(selectedEvent.cantiere.scadenza) }}</p>
                </div>
              </div>
              
              <!-- Giorni rimanenti -->
              <div class="mt-4 pt-4 border-t border-purple-200">
                <div class="flex justify-between items-center">
                  <span class="text-purple-700">Giorni rimanenti</span>
                  <span class="font-bold" :class="getDaysRemainingColor(selectedEvent.cantiere)">
                    {{ getDaysRemaining(selectedEvent.cantiere.scadenza) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button v-if="selectedEvent?.cantiere" @click="goToCantiere(selectedEvent.cantiere)" 
                    class="w-full sm:w-auto btn-primary py-3 text-base">
              <BuildingOfficeIcon class="w-5 h-5 mr-2" />
              Vai al Cantiere
            </button>
            <button @click="closeEventDetailModal" 
                    class="w-full sm:w-auto btn-secondary py-3 text-base">
              Chiudi
            </button>
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
import { ref, computed, onMounted } from 'vue'
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
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '@/stores/firestore'
import { useModalEsc } from '@/composables/useModalEsc'
import { usePopup } from '@/composables/usePopup'
import { useRouter } from 'vue-router'

// Stato della pagina
const showNewEventModal = ref(false)
const showResourceModal = ref(false)
const activeTab = ref('calendario')
const currentView = ref('month')
const currentDate = ref(new Date())
const filterType = ref('')
const showJournal = ref(true)
const showEventDetailModal = ref(false)
const selectedEvent = ref(null)

// Import diretto dal Firestore store per dati reattivi
const firestoreStore = useFirestoreStore()
const router = useRouter()
const { success, error } = usePopup()

// Dati cantieri - computed per reattività
const cantieri = computed(() => firestoreStore.cantieri)

// Registrazioni giornale cantiere
const giornaleEntries = ref([])

// Eventi - include cantieri e (opzionale) giornale cantiere
const eventi = computed(() => {
  // Eventi statici di esempio (da rimuovere se non necessari)
  const eventiStatici = [
    {
      id: 'ex1',
      type: 'cantiere',
      title: 'Cantiere Villa Rossi',
      date: '2024-01-15',
      startTime: '08:00',
      endTime: '17:00',
      description: 'Avvio lavori di ristrutturazione',
      status: 'confirmed'
    },
    {
      id: 'ex2',
      type: 'appuntamento',
      title: 'Sopralluogo Magazzino',
      date: '2024-01-20',
      startTime: '14:00',
      endTime: '16:00',
      description: 'Verifica materiali in arrivo',
      status: 'confirmed'
    },
    {
      id: 'ex3',
      type: 'scadenza',
      title: 'Scadenza Cantiere Centro',
      date: '2024-01-25',
      startTime: '09:00',
      endTime: '18:00',
      description: 'Termine previsto per completamento',
      status: 'pending'
    }
  ]

  // Convertire cantieri in eventi del calendario
  const eventiCantieri = cantieri.value.map(cantiere => {
    const eventi = []

    // Evento di inizio cantiere
    if (cantiere.dataInizio) {
      eventi.push({
        id: `cantiere-start-${cantiere.id}`,
        type: 'cantiere',
        title: `🚀 Inizio: ${cantiere.nome}`,
        date: cantiere.dataInizio,
        startTime: '08:00',
        endTime: '17:00',
        description: `Inizio lavori cantiere: ${cantiere.cliente} - ${cantiere.tipoLavoro}`,
        status: 'confirmed',
        cantiere: cantiere,
        cantiereId: cantiere.id,
        eventType: 'start'
      })
    }

    // Evento di scadenza cantiere
    if (cantiere.scadenza) {
      eventi.push({
        id: `cantiere-end-${cantiere.id}`,
        type: 'scadenza',
        title: `⏰ Scadenza: ${cantiere.nome}`,
        date: cantiere.scadenza,
        startTime: '08:00',
        endTime: '17:00',
        description: `Scadenza prevista cantiere: ${cantiere.cliente} - €${cantiere.valore?.toLocaleString() || '0'}`,
        status: cantiere.stato === 'completato' ? 'completed' : 'pending',
        cantiere: cantiere,
        cantiereId: cantiere.id,
        eventType: 'deadline'
      })
    }

    // Se il cantiere è in corso, aggiungi eventi per il periodo
    if (cantiere.stato === 'in-corso' && cantiere.dataInizio && cantiere.scadenza) {
      const inizioDate = new Date(cantiere.dataInizio)
      const scadenzaDate = new Date(cantiere.scadenza)
      const oggi = new Date()
      
      // Genera eventi settimanali per cantieri in corso (max 4 settimane visualizzate)
      const settimaneMax = 4
      let settimana = 0
      const dataCorrente = new Date(Math.max(inizioDate.getTime(), oggi.getTime() - 7 * 24 * 60 * 60 * 1000))
      
      while (dataCorrente <= scadenzaDate && settimana < settimaneMax) {
        // Trova il lunedì della settimana corrente
        const lunedi = new Date(dataCorrente)
        lunedi.setDate(lunedi.getDate() + (1 + 7 - lunedi.getDay()) % 7)
        
        // Genera eventi per i giorni lavorativi (Lun-Sab) della settimana
        for (let giornoSettimanale = 0; giornoSettimanale < 6; giornoSettimanale++) {
          const giornoLavorativo = new Date(lunedi)
          giornoLavorativo.setDate(lunedi.getDate() + giornoSettimanale)
          
          if (giornoLavorativo >= inizioDate && giornoLavorativo <= scadenzaDate) {
            const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
            eventi.push({
              id: `cantiere-day-${cantiere.id}-${settimana}-${giornoSettimanale}`,
              type: 'cantiere',
              title: `🔨 ${cantiere.nome}`,
              date: giornoLavorativo.toISOString().split('T')[0],
              startTime: '08:00',
              endTime: '17:00',
              description: `Lavori ${dayNames[giornoSettimanale]} - Progresso: ${cantiere.progresso || 0}%`,
              status: 'confirmed',
              cantiere: cantiere,
              cantiereId: cantiere.id,
              eventType: 'ongoing'
            })
          }
        }
        
        dataCorrente.setDate(dataCorrente.getDate() + 7)
        settimana++
      }
    }

    return eventi
  }).flat()

  // Eventi dal giornale cantiere
  const eventiGiornale = showJournal.value ? (giornaleEntries.value || []).map(entry => {
    const numDip = Array.isArray(entry.dipendenti) ? entry.dipendenti.length : 0
    const oreTot = Array.isArray(entry.dipendenti) ? entry.dipendenti.reduce((s, d) => s + (d.ore || d.oreLavorate || 0), 0) : 0
    const costoDip = Array.isArray(entry.dipendenti) ? entry.dipendenti.reduce((s, d) => s + (d.costoTotale || ((d.ore || 0) * (d.costoOrario || 0))), 0) : 0
    const costoMat = Array.isArray(entry.materiali) ? entry.materiali.reduce((s, m) => s + (m.costoTotale || ((m.quantita || 0) * (m.costoUnitario || m.prezzoUnitario || 0))), 0) : 0
    const costoMez = Array.isArray(entry.mezzi) ? entry.mezzi.reduce((s, m) => s + (m.costoTotale || ((m.oreUtilizzo || 0) * (m.costoOrario || 0))), 0) : 0
    const costoLav = Array.isArray(entry.lavori) ? entry.lavori.reduce((s, l) => s + (l.costoTotale || ((l.ore || 0) * (l.costoOrario || 0))), 0) : 0
    const costoTot = Math.round((costoDip + costoMat + costoMez + costoLav) * 100) / 100
    const cantiereNome = (cantieri.value.find(c => c.id === entry.cantiereId)?.nome) || 'Cantiere'
    return {
      id: `giornale-${entry.id}`,
      type: 'giornale',
      title: `📘 Giornale: ${numDip} dip., ${oreTot}h, €${costoTot.toFixed(0)}`,
      date: entry.data,
      startTime: entry.orarioInizio || '08:00',
      endTime: entry.orarioFine || '17:00',
      description: `${cantiereNome}`,
      status: 'confirmed',
      giornale: entry,
      cantiereId: entry.cantiereId
    }
  }) : []

  // Filtra eventi in base al filtro selezionato
  let tuttiEventi = [...eventiStatici, ...eventiCantieri, ...eventiGiornale]
  
  if (filterType.value) {
    tuttiEventi = tuttiEventi.filter(evento => evento.type === filterType.value)
  }

  return tuttiEventi
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
// Alert conflitti rimosso - ora è computed

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

// Planning cantieri - ora usa dati reali da Firestore
const planningCantieri = computed(() => {
  return cantieri.value.map(cantiere => {
    const dataInizio = cantiere.dataInizio ? new Date(cantiere.dataInizio) : new Date()
    const dataScadenza = cantiere.scadenza ? new Date(cantiere.scadenza) : new Date()
    
    return {
      id: cantiere.id,
      nome: cantiere.nome || 'Cantiere senza nome',
      cliente: cantiere.cliente || 'Cliente non specificato',
      stato: cantiere.stato || 'pianificato',
      startDay: Math.max(1, dataInizio.getDate()),
      endDay: Math.min(31, dataScadenza.getDate()),
      progresso: cantiere.progresso || 0,
      valore: cantiere.valore || 0
    }
  })
})

// Stats aggiornate con dati reali
const stats = computed(() => {
  const oggi = new Date()
  const inizioOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate())
  const fineOggi = new Date(inizioOggi.getTime() + 24 * 60 * 60 * 1000)

  return {
    eventiOggi: eventi.value.filter(evento => {
      const dataEvento = new Date(evento.date)
      return dataEvento >= inizioOggi && dataEvento < fineOggi
    }).length,
    cantieriAttivi: cantieri.value.filter(c => c.stato === 'in-corso').length,
    personeImpegnate: cantieri.value.reduce((total, c) => {
      return total + (c.team?.length || 0)
    }, 0),
    totalePers: personale.value.length,
    scadenzeUrgenti: cantieri.value.filter(c => {
      if (!c.scadenza) return false
      const scadenza = new Date(c.scadenza)
      const diffGiorni = Math.ceil((scadenza - oggi) / (1000 * 60 * 60 * 24))
      return diffGiorni <= 7 && diffGiorni >= 0 && c.stato !== 'completato'
    }).length
  }
})

// Alert conflitti - aggiornati con dati reali
const alertConflitti = computed(() => {
  const conflitti = []
  const oggi = new Date()
  
  // Controlla cantieri con scadenze ravvicinate
  cantieri.value.forEach(cantiere => {
    if (cantiere.scadenza && cantiere.stato === 'in-corso') {
      const scadenza = new Date(cantiere.scadenza)
      const diffGiorni = Math.ceil((scadenza - oggi) / (1000 * 60 * 60 * 24))
      
      if (diffGiorni <= 3 && diffGiorni >= 0) {
        conflitti.push({
          id: `scadenza-${cantiere.id}`,
          risorsa: cantiere.nome,
          conflitto: `Scadenza in ${diffGiorni} giorni`,
          data: new Date(cantiere.scadenza).toLocaleDateString('it-IT')
        })
      }
      
      if (diffGiorni < 0) {
        conflitti.push({
          id: `ritardo-${cantiere.id}`,
          risorsa: cantiere.nome,
          conflitto: `In ritardo di ${Math.abs(diffGiorni)} giorni`,
          data: new Date(cantiere.scadenza).toLocaleDateString('it-IT')
        })
      }
    }
  })
  
  return conflitti
})

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
    'giornale': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
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
  selectedEvent.value = evento
  showEventDetailModal.value = true
}

const closeEventDetailModal = () => {
  showEventDetailModal.value = false
  selectedEvent.value = null
}

const getEventHeaderColor = (type) => {
  const colors = {
    'cantiere': 'bg-blue-100 text-blue-600',
    'scadenza': 'bg-red-100 text-red-600',
    'appuntamento': 'bg-green-100 text-green-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}
// Stats calcolate per il giornale selezionato
const calculateJournalStats = (entry) => {
  const numDip = Array.isArray(entry?.dipendenti) ? entry.dipendenti.length : 0
  const oreTot = Array.isArray(entry?.dipendenti) ? entry.dipendenti.reduce((s, d) => s + (d.ore || d.oreLavorate || 0), 0) : 0
  const costoDip = Array.isArray(entry?.dipendenti) ? entry.dipendenti.reduce((s, d) => s + (d.costoTotale || ((d.ore || 0) * (d.costoOrario || 0))), 0) : 0
  const costoMat = Array.isArray(entry?.materiali) ? entry.materiali.reduce((s, m) => s + (m.costoTotale || ((m.quantita || 0) * (m.costoUnitario || m.prezzoUnitario || 0))), 0) : 0
  const costoMez = Array.isArray(entry?.mezzi) ? entry.mezzi.reduce((s, m) => s + (m.costoTotale || ((m.oreUtilizzo || 0) * (m.costoOrario || 0))), 0) : 0
  const costoLav = Array.isArray(entry?.lavori) ? entry.lavori.reduce((s, l) => s + (l.costoTotale || ((l.ore || 0) * (l.costoOrario || 0))), 0) : 0
  const totale = costoDip + costoMat + costoMez + costoLav
  return { numDip, oreTot, costoDip, costoMat, costoMez, costoLav, totale }
}

const selectedJournalStats = computed(() => {
  if (!selectedEvent.value?.giornale) return { numDip: 0, oreTot: 0, costoDip: 0, costoMat: 0, costoMez: 0, costoLav: 0, totale: 0 }
  return calculateJournalStats(selectedEvent.value.giornale)
})

const getMargineColorText = (cantiere) => {
  const margine = cantiere.valore - (cantiere.costiAccumulati?.totale || 0)
  const percentuale = (margine / cantiere.valore) * 100
  
  if (percentuale > 20) return 'text-green-600'
  if (percentuale > 10) return 'text-yellow-600'
  return 'text-red-600'
}

const getDaysRemaining = (scadenza) => {
  if (!scadenza) return 'Non definita'
  
  const oggi = new Date()
  const dataScadenza = new Date(scadenza)
  const diffTime = dataScadenza - oggi
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `${Math.abs(diffDays)} giorni di ritardo`
  if (diffDays === 0) return 'Scade oggi'
  if (diffDays === 1) return '1 giorno rimanente'
  return `${diffDays} giorni rimanenti`
}

const getDaysRemainingColor = (cantiere) => {
  if (!cantiere.scadenza) return 'text-gray-600'
  
  const oggi = new Date()
  const dataScadenza = new Date(cantiere.scadenza)
  const diffTime = dataScadenza - oggi
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600'
  if (diffDays <= 3) return 'text-orange-600'
  if (diffDays <= 7) return 'text-yellow-600'
  return 'text-green-600'
}

const goToCantiere = (cantiere) => {
  closeEventDetailModal()
  // Naviga alla pagina cantieri
  router.push('/cantieri')
  // Potresti aggiungere un parametro per aprire direttamente il cantiere
  // router.push({ path: '/cantieri', query: { open: cantiere.id } })
}

const createEvent = () => {
  if (!newEvent.value.type || !newEvent.value.title) {
          error('Campi Mancanti', 'Compila tutti i campi obbligatori!')
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
      success('Evento Creato', `"${nuovoEvento.title}" aggiunto al calendario`)
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

// Hook lifecycle per inizializzazione
onMounted(async () => {
  try {
    // Carica tutti i dati necessari da Firestore
    await Promise.all([
      firestoreStore.loadCantieri(),
      firestoreStore.loadDipendenti(),
      // Carica registrazioni giornale cantiere
      firestoreStore.loadCollection('giornale_cantiere').then(res => {
        giornaleEntries.value = res?.data || []
      })
    ])
    console.log('✅ Dati calendario caricati con successo')
  } catch (error) {
    console.error('❌ Errore nel caricamento dati Calendario:', error)
  }
})

// Abilita chiusura modali con ESC
const calendarioModalRefs = [showNewEventModal, showEventDetailModal]
const calendarioCloseFns = [closeNewEventModal, closeEventDetailModal]
useModalEsc(calendarioModalRefs, calendarioCloseFns)
</script> 