<template>
  <div class="space-y-6">
    <!-- Header Personale -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Personale</h1>
        <p class="text-gray-600 text-base">Dipendenti e timesheet - Legnosystem.bio</p>
      </div>
      <div class="flex space-x-3">
        <button @click="forceRefreshAllData" class="btn-secondary text-base font-medium" title="Aggiorna tutti i dati">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Aggiorna
        </button>
        <button @click="fixBuggedDates" class="btn-secondary text-base font-medium bg-red-100 text-red-800 border-red-300" title="Correggi date sbagliate (01/01/2025)">
          🔧 Fix Date
        </button>

        <button @click="showTimesheetModal = true" class="btn-secondary text-base font-medium">
          <ClockIcon class="w-5 h-5 mr-2" />
          Registra Ore
        </button>
        <button @click="showAddModal = true" class="btn-primary text-base font-medium">
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuovo Dipendente
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <UsersIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Dipendenti Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.dipendentiAttivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Ore Settimana</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.oreSettimana }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Presenti Oggi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.presentiOggi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-base font-medium text-gray-600">Costo Orario Medio</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.costoOrarioMedio }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca dipendenti..."
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="w-full md:w-48">
          <select v-model="selectedRuolo" class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti i ruoli</option>
            <option value="carpentiere">Carpentiere</option>
            <option value="operaio">Operaio Specializzato</option>
            <option value="capo-squadra">Capo Squadra</option>
            <option value="amministrativo">Amministrativo</option>
          </select>
        </div>
        <div class="w-full md:w-48">
          <select v-model="selectedStato" class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivo</option>
            <option value="in-ferie">In Ferie</option>
            <option value="malattia">Malattia</option>
            <option value="sospeso">Sospeso</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'dipendenti'"
          :class="activeTab === 'dipendenti' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-base"
        >
          Anagrafica Dipendenti
        </button>
        <button
          @click="activeTab = 'timesheet'"
          :class="activeTab === 'timesheet' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-base"
        >
          Timesheet Ore
        </button>
        <button
          @click="activeTab = 'presenze'"
          :class="activeTab === 'presenze' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-base"
        >
          Presenze
        </button>
        <button
          @click="activeTab = 'calendario'"
          :class="activeTab === 'calendario' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-base"
        >
          Calendario
        </button>
        <button
          @click="activeTab = 'controlli'"
          :class="activeTab === 'controlli' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-base relative"
        >
          Controlli
          <span v-if="incoerenze.length > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ incoerenze.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content: Anagrafica Dipendenti -->
    <div v-if="activeTab === 'dipendenti'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="dipendente in filteredDipendenti" :key="dipendente.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {{ dipendente.iniziali }}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ dipendente.nome }} {{ dipendente.cognome }}</h3>
            <p class="text-base text-gray-600">{{ dipendente.ruolo }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(dipendente.stato)">
            {{ getStatoLabel(dipendente.stato) }}
          </span>
        </div>

        <!-- Info Dipendente -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-base">
            <span class="text-gray-600">Email:</span>
            <span class="font-medium">{{ dipendente.email }}</span>
          </div>
          <div class="flex items-center justify-between text-base">
            <span class="text-gray-600">Telefono:</span>
            <span class="font-medium">{{ dipendente.telefono }}</span>
          </div>
          <div class="flex items-center justify-between text-base">
            <span class="text-gray-600">Data Assunzione:</span>
            <span class="font-medium">{{ formatDate(dipendente.dataAssunzione) }}</span>
          </div>
          <div class="flex items-center justify-between text-base">
            <span class="text-gray-600">Paga Oraria:</span>
            <span class="font-medium">€{{ dipendente.pagaOraria }}/h</span>
          </div>
        </div>

        <!-- 🚀 MULTI-ASSIGNMENT: Cantieri Assegnati -->
        <div class="mb-4 p-3 bg-accent-50 rounded-lg">
          <p class="text-sm text-accent-600 font-medium mb-1">Cantieri Assegnati</p>
          <div v-if="getCantieriAssegnati(dipendente.id).length > 0" class="space-y-1">
            <div v-for="cantiere in getCantieriAssegnati(dipendente.id)" :key="cantiere" 
                 class="flex items-center space-x-2">
              <span class="text-accent-500">🏗️</span>
              <span class="text-base font-medium text-gray-900">{{ cantiere }}</span>
            </div>
          </div>
          <div v-else class="flex items-center space-x-2">
            <span class="text-green-500">✅</span>
            <span class="text-base text-gray-600">Disponibile per assegnazione</span>
          </div>
        </div>

        <!-- Ore Settimana -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-base mb-2">
            <span class="text-gray-600">Ore questa settimana:</span>
            <span class="font-medium">{{ dipendente.oreTotaliSettimana }}h</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${Math.min((dipendente.oreTotaliSettimana / 52) * 100, 100)}%`"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Target: 52h/settimana (6 giorni lavorativi)
          </div>
        </div>

        <!-- Azioni -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <button @click="viewTimesheet(dipendente)" class="text-primary-600 hover:text-primary-700 text-base font-medium">
            Vedi Timesheet
          </button>
          <div class="flex space-x-2">
            <button @click="editDipendente(dipendente)" 
                    class="text-gray-400 hover:text-gray-600" 
                    title="Modifica dipendente">
              <PencilIcon class="w-5 h-5" />
            </button>
            <button @click="viewSchedule(dipendente)" 
                    class="text-gray-400 hover:text-gray-600"
                    title="Visualizza planning e calendario">
              <CalendarDaysIcon class="w-5 h-5" />
            </button>
            <button @click="deleteDipendente(dipendente)"
                    class="text-red-400 hover:text-red-600"
                    title="Elimina dipendente">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Timesheet -->
    <div v-if="activeTab === 'timesheet'" class="space-y-4">
      <!-- Header timesheet con controlli mobile -->
      <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 class="text-xl font-semibold text-gray-900">Registro Ore</h3>
        <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <select v-model="selectedWeek" @change="onWeekChange" class="w-full sm:w-52 px-3 py-2 border border-gray-300 rounded-lg text-base">
            <option value="current">Settimana Corrente</option>
            <option value="last">Settimana Scorsa</option>
            <option value="two-weeks">2 Settimane Fa</option>
            <option value="three-weeks">3 Settimane Fa</option>
            <option value="month">1 Mese Fa</option>
          </select>
          <button @click="debugAllTimesheetDates" class="btn-secondary text-sm bg-blue-100 text-blue-800 border-blue-300" title="Mostra tutte le date dei timesheet">
            📅 Date
          </button>
          <button @click="performCompleteAudit" class="btn-secondary text-sm bg-red-100 text-red-800 border-red-300" title="Audit completo e correzione automatica">
            🔍 Audit Completo
          </button>
          <button @click="runSystemTests" class="btn-secondary text-sm bg-green-100 text-green-800 border-green-300" title="Test sistema validazione">
            🧪 Test Sistema
          </button>
        </div>
      </div>

      <!-- Mobile: Card Layout -->
      <div class="block lg:hidden space-y-4">
        <div v-for="record in timesheetData" :key="record.dipendenteId" class="card">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-base font-medium">
              {{ record.iniziali }}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-base">{{ record.nome }}</h4>
              <p class="text-base text-gray-600">{{ record.cantiere }}</p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold" :class="record.totale >= 52 ? 'text-green-600' : 'text-gray-900'">
                {{ record.totale }}h
              </p>
              <p class="text-sm text-gray-500">totale</p>
            </div>
          </div>
          
          <!-- Ore giornaliere mobile -->
          <div class="grid grid-cols-6 gap-2 text-center">
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Lun</p>
              <p class="font-medium text-base">{{ record.lunedi }}h</p>
            </div>
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Mar</p>
              <p class="font-medium text-base">{{ record.martedi }}h</p>
            </div>
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Mer</p>
              <p class="font-medium text-base">{{ record.mercoledi }}h</p>
            </div>
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Gio</p>
              <p class="font-medium text-base">{{ record.giovedi }}h</p>
            </div>
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Ven</p>
              <p class="font-medium text-base">{{ record.venerdi }}h</p>
            </div>
            <div class="py-2">
              <p class="text-sm text-gray-500 mb-1">Sab</p>
              <p class="font-medium text-base">{{ record.sabato }}h</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Table Layout -->
      <div class="hidden lg:block card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Dipendente</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Lunedì</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Martedì</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Mercoledì</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Giovedì</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Venerdì</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Sabato</th>
                <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Totale</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in timesheetData" :key="record.dipendenteId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                      {{ record.iniziali }}
                    </div>
                    <div>
                      <div class="text-base font-medium text-gray-900">{{ record.nome }}</div>
                      <div class="text-base text-gray-500">{{ record.cantiere }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.lunedi }}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.martedi }}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.mercoledi }}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.giovedi }}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.venerdi }}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ record.sabato }}h</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-base font-semibold" :class="record.totale >= 52 ? 'text-green-600' : 'text-gray-900'">
                    {{ record.totale }}h
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab Content: Presenze -->
    <div v-if="activeTab === 'presenze'" class="space-y-6">
      <!-- Header presenze -->
      <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 class="text-xl font-semibold text-gray-900">Presenze Giornaliere</h3>
        <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <input
            v-model="selectedDate"
            type="date"
            class="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
          />
          <button @click="markAllPresent" class="btn-primary text-base py-3 px-5 font-medium">
            ✅ Segna Tutti Presenti
          </button>
        </div>
      </div>

      <!-- Lista presenze -->
      <div class="space-y-4">
        <div v-for="dipendente in dipendenti" :key="dipendente.id" class="card">
          <!-- Desktop Layout -->
          <div class="hidden md:flex items-center justify-between p-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ dipendente.iniziali }}
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 text-base">{{ dipendente.nome }} {{ dipendente.cognome }}</h4>
                <p class="text-base text-gray-600">{{ getRuoloLabel(dipendente.ruolo) }}</p>
                <p class="text-sm text-gray-500">{{ dipendente.cantiereAttuale || 'Nessun cantiere' }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Ora entrata -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Entrata</p>
                <input
                  v-model="getPresenzaComputed(dipendente.id).entrata"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Ora uscita -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Uscita</p>
                <input
                  v-model="getPresenzaComputed(dipendente.id).uscita"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Pausa -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Pausa (min)</p>
                <input
                  v-model.number="getPresenzaComputed(dipendente.id).pausa"
                  type="number"
                  min="0"
                  max="120"
                  class="w-24 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Ore totali -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Ore Totali</p>
                <p class="text-xl font-bold" :class="calcolaOreTotali(dipendente.id) >= 8 ? 'text-green-600' : 'text-gray-900'">
                  {{ calcolaOreTotali(dipendente.id) }}h
                </p>
              </div>
              
              <!-- Stato presenza -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Stato</p>
                <select
                  v-model="getPresenzaComputed(dipendente.id).stato"
                  class="w-32 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="presente">Presente</option>
                  <option value="assente">Assente</option>
                  <option value="ferie">Ferie</option>
                  <option value="malattia">Malattia</option>
                  <option value="permesso">Permesso</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Mobile Layout -->
          <div class="block md:hidden p-4 space-y-4">
            <!-- Header Mobile -->
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ dipendente.iniziali }}
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-base">{{ dipendente.nome }} {{ dipendente.cognome }}</h4>
                <p class="text-base text-gray-600">{{ getRuoloLabel(dipendente.ruolo) }}</p>
                <!-- 🚀 MULTI-ASSIGNMENT: Mostra cantieri multipli -->
                <p class="text-sm text-gray-500">
                  <span v-if="getCantieriAssegnati(dipendente.id).length > 0">
                    🏗️ {{ getCantieriAssegnati(dipendente.id).join(', ') }}
                  </span>
                  <span v-else>✅ Disponibile</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-xl font-bold" :class="calcolaOreTotali(dipendente.id) >= 8 ? 'text-green-600' : 'text-gray-900'">
                  {{ calcolaOreTotali(dipendente.id) }}h
                </p>
                <p class="text-sm text-gray-500">ore totali</p>
              </div>
            </div>

            <!-- Controlli Mobile -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-500 mb-1">Entrata</label>
                <input
                  v-model="getPresenzaComputed(dipendente.id).entrata"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Uscita</label>
                <input
                  v-model="getPresenzaComputed(dipendente.id).uscita"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Pausa (min)</label>
                <input
                  v-model.number="getPresenzaComputed(dipendente.id).pausa"
                  type="number"
                  min="0"
                  max="120"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Stato</label>
                <select
                  v-model="getPresenzaComputed(dipendente.id).stato"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="presente">Presente</option>
                  <option value="assente">Assente</option>
                  <option value="ferie">Ferie</option>
                  <option value="malattia">Malattia</option>
                  <option value="permesso">Permesso</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Note presenza -->
          <div class="px-4 pb-4">
            <input
              v-model="getPresenzaComputed(dipendente.id).note"
              type="text"
              placeholder="Note presenza..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Riepilogo presenze -->
      <div class="card bg-primary-50 border border-primary-200">
        <h4 class="font-semibold text-primary-800 mb-4 text-lg">Riepilogo {{ formatDate(selectedDate) }}</h4>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center">
            <p class="text-base text-primary-600">Presenti</p>
            <p class="text-2xl font-bold text-green-600">{{ getRiepilogoPresenze().presenti }}</p>
          </div>
          <div class="text-center">
            <p class="text-base text-primary-600">Assenti</p>
            <p class="text-2xl font-bold text-red-600">{{ getRiepilogoPresenze().assenti }}</p>
          </div>
          <div class="text-center">
            <p class="text-base text-primary-600">In Ferie</p>
            <p class="text-2xl font-bold text-blue-600">{{ getRiepilogoPresenze().ferie }}</p>
          </div>
          <div class="text-center">
            <p class="text-base text-primary-600">Malattia</p>
            <p class="text-2xl font-bold text-yellow-600">{{ getRiepilogoPresenze().malattia }}</p>
          </div>
          <div class="text-center">
            <p class="text-base text-primary-600">Ore Totali</p>
            <p class="text-2xl font-bold text-primary-600">{{ getRiepilogoPresenze().oreTotali }}h</p>
          </div>
        </div>
      </div>

      <!-- Pulsanti Azioni -->
      <div class="flex justify-between items-center mt-4">
        <button @click="markAllPresent" 
                class="btn-secondary">
          Segna Tutti Presenti
        </button>
        
        <button @click="saveAllPresenze"
                class="btn-primary">
          Salva Presenze
        </button>
      </div>
    </div>

    <!-- Tab Content: Calendario -->
    <div v-if="activeTab === 'calendario'" class="space-y-6">
      <div class="bg-white rounded-lg shadow">
        <!-- Header Calendario -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ format(new Date(selectedDate), 'MMMM yyyy', { locale: it }) }}
            </h3>
            <div class="flex space-x-2">
              <button @click="selectedDate = format(new Date(), 'yyyy-MM-dd')"
                      class="btn-secondary text-sm">
                Oggi
              </button>
              <input v-model="selectedDate" 
                     type="month" 
                     class="form-input text-sm"
                     :max="format(new Date(), 'yyyy-MM')">
            </div>
          </div>
        </div>
        
        <!-- Griglia Calendario -->
        <div class="p-6">
          <!-- Intestazione Giorni -->
          <div class="grid grid-cols-7 gap-px mb-2 text-center text-xs font-medium text-gray-700">
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Gio</div>
            <div>Ven</div>
            <div>Sab</div>
          </div>
          
          <!-- Settimane -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div v-for="(week, weekIndex) in calendarWeeks" 
                 :key="weekIndex"
                 class="grid grid-cols-7 divide-x divide-gray-200"
                 :class="{'border-t': weekIndex > 0}">
              
              <!-- Giorni -->
              <div v-for="day in week" 
                   :key="day ? day.dateStr : `empty-${weekIndex}-${Math.random()}`"
                   class="min-h-[180px] p-2 transition-all duration-150 ease-in-out"
                   :class="{
                     'bg-gray-50 hover:bg-gray-100': day && day.isWeekend,
                     'bg-blue-50 hover:bg-blue-100': day && day.dateStr === selectedDate,
                     'bg-white hover:bg-gray-50': day && !day.isWeekend && day.dateStr !== selectedDate,
                     'bg-gray-100': !day
                   }"
                   @mouseenter="showDayDetails(day, $event)"
                   @mouseleave="hideDayDetails">
                
                <template v-if="day">
                  <!-- Container flessibile per gestire il layout interno -->
                  <div class="flex flex-col h-full">
                    <!-- Numero del giorno in alto -->
                    <div class="text-right flex-shrink-0">
                      <span class="text-sm" :class="{
                        'text-gray-400': day.isWeekend,
                        'font-bold text-blue-600': day.dateStr === selectedDate,
                        'text-gray-900': !day.isWeekend && day.dateStr !== selectedDate
                      }">
                        {{ format(day.date, 'd') }}
                      </span>
                    </div>

                    <!-- Elenco dipendenti (cresce per riempire lo spazio) -->
                    <div v-if="day.stats.dipendentiPresenti > 0" class="flex-grow mt-1 space-y-1 overflow-y-auto text-xs pr-1">
                      <div v-for="dipendente in day.dipendenti" :key="dipendente.id"
                           class="flex items-center justify-between">
                        <span class="font-medium text-gray-800 truncate" :title="dipendente.nome">{{ dipendente.nome }}</span>
                        <span class="text-gray-600 flex-shrink-0 ml-2">{{ dipendente.ore.toFixed(1) }}h</span>
                      </div>
                    </div>
                    
                    <!-- Indicatore per giorni lavorativi vuoti -->
                    <div v-else-if="!day.isWeekend" class="flex-grow flex items-center justify-center text-center text-xs text-gray-400">
                      <span>Nessuna registrazione</span>
                    </div>

                    <!-- Spaziatore per i weekend vuoti -->
                    <div v-else class="flex-grow"></div>

                    <!-- Riepilogo in basso -->
                    <div v-if="day.stats.dipendentiPresenti > 0" class="flex-shrink-0 pt-1 mt-auto border-t border-gray-200">
                      <div class="flex items-center justify-between text-gray-700 text-xs">
                        <span class="font-semibold" title="Dipendenti presenti">👥 {{ day.stats.dipendentiPresenti }}</span>
                        <span class="font-bold" title="Ore totali">{{ day.stats.oreTotali.toFixed(1) }}h</span>
                      </div>
                      <div class="text-green-600 font-semibold text-right text-xs" title="Costo totale">
                        €{{ day.stats.costoTotale.toFixed(0) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Footer con Totali -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-gray-600">Giorni Lavorati</p>
              <p class="text-lg font-semibold">
                {{ calendarDays.filter(d => d.stats.dipendentiPresenti > 0).length }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Ore Totali</p>
              <p class="text-lg font-semibold">
                {{ calendarDays.reduce((sum, d) => sum + d.stats.oreTotali, 0) }}h
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Costo Totale</p>
              <p class="text-lg font-semibold text-green-600">
                €{{ calendarDays.reduce((sum, d) => sum + d.stats.costoTotale, 0).toFixed(0) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popover Dettagli Giorno -->
    <div v-if="popoverVisible && hoveredDayDetails"
         ref="popoverRef"
         @mouseenter="onPopoverEnter"
         @mouseleave="hideDayDetails"
         class="fixed z-50 p-4 bg-white rounded-lg shadow-xl border border-gray-200 w-72"
         :style="popoverPosition">
      <div class="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
        <h4 class="font-bold text-gray-800">
          Dettagli {{ format(hoveredDayDetails.date, 'eeee d MMMM', { locale: it }) }}
        </h4>
      </div>
      <ul class="space-y-2 max-h-60 overflow-y-auto">
        <li v-for="dipendente in hoveredDayDetails.dipendenti" :key="dipendente.id"
            class="flex items-center justify-between text-base">
          <span class="text-gray-700">{{ dipendente.nome }}</span>
          <div class="text-right flex-shrink-0 ml-2">
            <span class="font-semibold text-gray-900">{{ dipendente.ore.toFixed(1) }}h</span>
            <span class="text-sm font-medium text-green-600 ml-2">€{{ dipendente.costo.toFixed(2) }}</span>
          </div>
        </li>
      </ul>
      <div class="mt-3 pt-2 border-t border-gray-100 text-right">
        <div class="text-lg">
          <span class="text-gray-600">Totale: </span>
          <span class="font-bold text-green-700">€{{ hoveredDayDetails.stats.costoTotale.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Tab Content: Controlli -->
    <div v-if="activeTab === 'controlli'" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Controlli di Coerenza</h3>
          <p class="text-gray-600">Analisi automatica di incoerenze tra presenze e timesheet</p>
        </div>
        <button @click="runCoherenceCheck" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Esegui Controllo
        </button>
      </div>

      <!-- Stato Controllo -->
      <div v-if="controlloInCorso" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span class="text-blue-700">Controllo in corso...</span>
        </div>
      </div>

      <!-- Riepilogo Incoerenze -->
      <div v-if="incoerenze.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-red-800">Incoerenze Gravi</p>
              <p class="text-2xl font-bold text-red-900">{{ incoerenze.filter(i => i.gravita === 'alta').length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-yellow-800">Incoerenze Medie</p>
              <p class="text-2xl font-bold text-yellow-900">{{ incoerenze.filter(i => i.gravita === 'media').length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-green-800">Totale Controlli</p>
              <p class="text-2xl font-bold text-green-900">{{ ultimoControlloCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Nessuna Incoerenza -->
      <div v-if="incoerenze.length === 0 && !controlloInCorso && ultimoControlloCount > 0" class="text-center py-12">
        <div class="text-green-500 text-6xl mb-4">✅</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Tutto in Ordine!</h3>
        <p class="text-gray-600">Nessuna incoerenza rilevata tra presenze e timesheet</p>
        <p class="text-sm text-gray-500 mt-2">Ultimo controllo: {{ ultimoControlloCount }} record analizzati</p>
      </div>

      <!-- Lista Incoerenze -->
      <div v-if="incoerenze.length > 0" class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900">Dettaglio Incoerenze</h4>
        
        <!-- Incoerenze Gravi -->
        <div v-if="incoerenze.filter(i => i.gravita === 'alta').length > 0">
          <h5 class="text-base font-medium text-red-800 mb-3 flex items-center">
            <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">GRAVI</span>
            Richiedono Attenzione Immediata
          </h5>
          <div class="space-y-2">
            <div v-for="incoerenza in incoerenze.filter(i => i.gravita === 'alta')" :key="incoerenza.dipendente + incoerenza.data" 
                 class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="font-medium text-red-900">{{ incoerenza.dipendente }}</div>
                    <div class="text-sm text-red-700">{{ formatDate(incoerenza.data) }}</div>
                  </div>
                  <div class="text-sm text-red-700 mt-1">{{ incoerenza.dettaglio }}</div>
                </div>
                <div class="flex space-x-2">
                  <button @click="risolviIncoerenza(incoerenza)" class="px-3 py-1 text-sm font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
                    Risolvi
                  </button>
                  <button @click="ignoraIncoerenza(incoerenza)" class="px-3 py-1 text-sm font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    Ignora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Incoerenze Medie -->
        <div v-if="incoerenze.filter(i => i.gravita === 'media').length > 0">
          <h5 class="text-base font-medium text-yellow-800 mb-3 flex items-center">
            <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">MEDIE</span>
            Da Verificare
          </h5>
          <div class="space-y-2">
            <div v-for="incoerenza in incoerenze.filter(i => i.gravita === 'media')" :key="incoerenza.dipendente + incoerenza.data" 
                 class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="font-medium text-yellow-900">{{ incoerenza.dipendente }}</div>
                    <div class="text-sm text-yellow-700">{{ formatDate(incoerenza.data) }}</div>
                  </div>
                  <div class="text-sm text-yellow-700 mt-1">{{ incoerenza.dettaglio }}</div>
                </div>
                <div class="flex space-x-2">
                  <button @click="risolviIncoerenza(incoerenza)" class="px-3 py-1 text-sm font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
                    Risolvi
                  </button>
                  <button @click="ignoraIncoerenza(incoerenza)" class="px-3 py-1 text-sm font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    Ignora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stato Vuoto -->
      <div v-if="incoerenze.length === 0 && !controlloInCorso && ultimoControlloCount === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Nessun Controllo Eseguito</h3>
        <p class="text-gray-600">Clicca su "Esegui Controllo" per analizzare le incoerenze</p>
      </div>
    </div>

    <!-- Modal Registrazione Ore -->
    <div v-if="showTimesheetModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeTimesheetModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Registra Ore</h3>
            <button @click="closeTimesheetModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveTimesheet" class="space-y-6">
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Dipendente</label>
              <select v-model="newTimesheet.dipendenteId" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                <option value="">Seleziona dipendente</option>
                <option v-for="dipendente in dipendenti" :key="dipendente.id" :value="dipendente.id">
                  {{ dipendente.nome }} {{ dipendente.cognome }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Data</label>
              <input v-model="newTimesheet.data" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Orario Inizio</label>
                <input v-model="newTimesheet.orarioInizio" type="time" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
              </div>
              
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Orario Fine</label>
                <input v-model="newTimesheet.orarioFine" type="time" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
              </div>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Ore Lavorate</label>
              <input v-model="newTimesheet.ore" type="number" step="0.5" min="0" max="12" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Cantiere</label>
              <select v-model="newTimesheet.cantiere" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                <option value="">Seleziona cantiere</option>
                <option v-for="cantiere in cantieriDisponibili" :key="cantiere" :value="cantiere">{{ cantiere }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea v-model="newTimesheet.note" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base resize-none"></textarea>
            </div>
            
            <div class="flex flex-col space-y-3 pt-4">
              <button type="submit" class="w-full btn-primary py-3 text-base font-medium">Salva Ore</button>
              <button type="button" @click="closeTimesheetModal" class="w-full btn-secondary py-3 text-base font-medium">Annulla</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo Dipendente -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Dipendente</h3>
            <button @click="closeAddModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveDipendente" class="space-y-6">
            <!-- Dati Anagrafici -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Nome *</label>
                <input v-model="newDipendente.nome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Cognome *</label>
                <input v-model="newDipendente.cognome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Contatti -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Email *</label>
                <input v-model="newDipendente.email" type="email" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Telefono *</label>
                <input v-model="newDipendente.telefono" type="tel" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Ruolo e Contratto -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Ruolo *</label>
                <select v-model="newDipendente.ruolo" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona ruolo</option>
                  <option value="capo-squadra">Capo Squadra</option>
                  <option value="carpentiere">Carpentiere</option>
                  <option value="operaio">Operaio Specializzato</option>
                  <option value="amministrativo">Amministrativo</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Paga Oraria (€) *</label>
                <input v-model.number="newDipendente.pagaOraria" type="number" step="0.5" min="15" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Data Assunzione *</label>
                <input v-model="newDipendente.dataAssunzione" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Dati Aggiuntivi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Stato</label>
                <select v-model="newDipendente.stato"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="attivo">Attivo</option>
                  <option value="in-ferie">In Ferie</option>
                  <option value="malattia">Malattia</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Cantiere Assegnato</label>
                <select v-model="newDipendente.cantiereAttuale"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Nessun cantiere</option>
                  <option v-for="cantiere in cantieriDisponibili" :key="cantiere" :value="cantiere">{{ cantiere }}</option>
                </select>
              </div>
            </div>

            <!-- Note -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Note Aggiuntive</label>
              <textarea v-model="newDipendente.note" rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base resize-none"
                        placeholder="Competenze, certificazioni, note..."></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                👤 Aggiungi Dipendente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Dettaglio Timesheet -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeDetailModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Timesheet - {{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h3>
            <button @click="closeDetailModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Info Dipendente -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {{ selectedDipendente?.iniziali }}
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 text-lg">{{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h4>
                  <p class="text-base text-gray-600">{{ getRuoloLabel(selectedDipendente?.ruolo) }}</p>
                </div>
                <div class="ml-auto text-right">
                  <p class="text-base text-gray-600">Cantiere Attuale</p>
                  <p class="font-medium text-base">{{ selectedDipendente?.cantiereAttuale || 'Nessuno' }}</p>
                </div>
              </div>
            </div>

            <!-- Riepilogo ore e costi -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p class="text-sm text-blue-600 font-medium">Ore Settimana</p>
                <p class="text-2xl font-bold text-blue-900">{{ selectedDipendente?.oreTotaliSettimana || 0 }}h</p>
                <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                       :style="`width: ${Math.min(((selectedDipendente?.oreTotaliSettimana || 0) / 52) * 100, 100)}%`"></div>
                </div>
                <div class="text-xs text-blue-600 mt-1">
                  Target: 52h/settimana (6 giorni lavorativi, Lun-Sab)
                </div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <p class="text-sm text-green-600 font-medium">Costo Settimana</p>
                <p class="text-2xl font-bold text-green-900">€{{ Math.round((selectedDipendente?.oreTotaliSettimana || 0) * (selectedDipendente?.pagaOraria || 25)) }}</p>
                <p class="text-xs text-green-600 mt-1">{{ selectedDipendente?.pagaOraria || 25 }}€/h</p>
              </div>
              <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p class="text-sm text-yellow-600 font-medium">Voci Timesheet</p>
                <p class="text-2xl font-bold text-yellow-900">{{ getTimesheetForDipendente(selectedDipendente?.id).length }}</p>
                <p class="text-xs text-yellow-600 mt-1">registrazioni</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p class="text-sm text-purple-600 font-medium">Da Giornale</p>
                <p class="text-2xl font-bold text-purple-900">{{ getTimesheetForDipendente(selectedDipendente?.id).filter(t => t.fonte === 'giornale_cantiere').length }}</p>
                <p class="text-xs text-purple-600 mt-1">auto-generate</p>
              </div>
            </div>

            <!-- Timesheet dettagliato -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h4 class="font-semibold text-gray-900">📋 Registro Ore Dettagliato</h4>
                <p class="text-sm text-gray-600 mt-1">Cronologia completa delle ore lavorate</p>
              </div>
              
              <div v-if="getTimesheetForDipendente(selectedDipendente?.id).length === 0" class="p-8 text-center">
                <div class="text-gray-400 text-6xl mb-4">🕐</div>
                <p class="text-lg text-gray-600 font-medium">Nessuna registrazione trovata</p>
                <p class="text-sm text-gray-500">Le ore verranno popolate automaticamente dal Giornale Cantiere</p>
              </div>
              
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ore</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="entry in getTimesheetForDipendente(selectedDipendente?.id)" 
                        :key="entry.id" 
                        class="hover:bg-gray-50 transition-colors duration-200"
                        :class="entry.fonte === 'giornale_cantiere' ? 'bg-blue-25' : ''">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex items-center">
                          <span class="font-medium">{{ formatDate(entry.data) }}</span>
                          <span v-if="entry.turno" class="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{{ entry.turno }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="font-medium">{{ entry.cantiere || entry.cantiereNome || 'Non Assegnato' }}</div>
                        <div v-if="entry.fonte" class="text-xs text-gray-500">{{ entry.fonte === 'giornale_cantiere' ? 'Auto-generato' : 'Manuale' }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span class="text-lg">{{ (entry.ore || entry.oreLavorate || 0).toFixed(1) }}h</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="font-medium text-green-600">€{{ ((entry.costoTotale || ((entry.ore || entry.oreLavorate || 0) * (entry.costoOrario || selectedDipendente?.pagaOraria || 25))) || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                        <div class="text-xs text-gray-500">{{ (entry.costoOrario || selectedDipendente?.pagaOraria || 25).toFixed(2) }}€/h</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span v-if="entry.fonte === 'giornale_cantiere'" 
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📋 Giornale
                        </span>
                        <span v-else 
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✋ Manuale
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div class="truncate" :title="entry.note">{{ entry.note || '-' }}</div>
                      </td>
                      <!-- 🚀 NUOVO: Colonna Azioni per modifica/eliminazione -->
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div v-if="entry.fonte === 'manuale'" class="flex items-center space-x-2">
                          <button @click="editTimesheetEntry(entry)" 
                                  class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                  title="Modifica registrazione">
                            <PencilIcon class="w-4 h-4" />
                          </button>
                          <button @click="deleteTimesheetEntry(entry)" 
                                  class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  title="Elimina registrazione">
                            <TrashIcon class="w-4 h-4" />
                          </button>
                        </div>
                        <div v-else class="text-xs text-gray-400 italic">
                          Auto-generato
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Dipendente -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Dipendente</h3>
            <button @click="closeEditModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveEditedDipendente" class="space-y-6">
            <!-- Dati Anagrafici -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Nome *</label>
                <input v-model="editingDipendente.nome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Cognome *</label>
                <input v-model="editingDipendente.cognome" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Contatti -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Email *</label>
                <input v-model="editingDipendente.email" type="email" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Telefono *</label>
                <input v-model="editingDipendente.telefono" type="tel" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Ruolo e Contratto -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Ruolo *</label>
                <select v-model="editingDipendente.ruolo" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona ruolo</option>
                  <option value="capo-squadra">Capo Squadra</option>
                  <option value="carpentiere">Carpentiere</option>
                  <option value="operaio">Operaio Specializzato</option>
                  <option value="amministrativo">Amministrativo</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Paga Oraria (€) *</label>
                <input v-model.number="editingDipendente.pagaOraria" type="number" step="0.5" min="15" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Data Assunzione *</label>
                <input v-model="editingDipendente.dataAssunzione" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Dati Aggiuntivi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Stato</label>
                <select v-model="editingDipendente.stato"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="attivo">Attivo</option>
                  <option value="in-ferie">In Ferie</option>
                  <option value="malattia">Malattia</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Cantiere Assegnato</label>
                <select v-model="editingDipendente.cantiereAttuale"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Nessun cantiere</option>
                  <option v-for="cantiere in cantieriDisponibili" :key="cantiere" :value="cantiere">{{ cantiere }}</option>
                </select>
              </div>
            </div>

            <!-- Note -->
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Note Aggiuntive</label>
              <textarea v-model="editingDipendente.note" rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base resize-none"
                        placeholder="Competenze, certificazioni, note..."></textarea>
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

    <!-- 🚀 NUOVO: Modal Modifica Timesheet -->
    <div v-if="showEditTimesheetModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditTimesheetModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Ore</h3>
            <button @click="closeEditTimesheetModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="updateTimesheet" class="space-y-6">
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Dipendente</label>
              <input v-model="editingTimesheetDipendenteName" readonly
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-base text-gray-600">
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Data</label>
              <input v-model="editingTimesheet.data" type="date" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Orario Inizio</label>
                <input v-model="editingTimesheet.orarioInizio" type="time" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
              </div>
              
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Orario Fine</label>
                <input v-model="editingTimesheet.orarioFine" type="time" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
              </div>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Ore Lavorate</label>
              <input v-model="editingTimesheet.ore" type="number" step="0.5" min="0" max="12" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Cantiere</label>
              <select v-model="editingTimesheet.cantiere" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                <option value="">Seleziona cantiere</option>
                <option v-for="cantiere in cantieriDisponibili" :key="cantiere" :value="cantiere">{{ cantiere }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-base font-medium text-gray-700 mb-2">Note (opzionale)</label>
              <textarea v-model="editingTimesheet.note" rows="3" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base resize-none"></textarea>
            </div>
            
            <div class="flex flex-col space-y-3 pt-4">
              <button type="submit" class="w-full btn-primary py-3 text-base font-medium">
                ✅ Salva Modifiche
              </button>
              <button type="button" @click="closeEditTimesheetModal" class="w-full btn-secondary py-3 text-base font-medium">
                Annulla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Planning/Calendario Dipendente -->
    <div v-if="showScheduleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeScheduleModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Planning - {{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h3>
            <button @click="closeScheduleModal" 
                    class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi finestra">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Info Dipendente -->
            <div class="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {{ selectedDipendente?.iniziali }}
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 text-lg">{{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h4>
                  <p class="text-base text-gray-600">{{ getRuoloLabel(selectedDipendente?.ruolo) }}</p>
                  <!-- 🚀 MULTI-ASSIGNMENT: Mostra tutti i cantieri -->
                  <p class="text-sm text-gray-500">
                    <span v-if="getCantieriAssegnati(selectedDipendente?.id).length > 0">
                      🏗️ {{ getCantieriAssegnati(selectedDipendente?.id).join(', ') }}
                    </span>
                    <span v-else>✅ Disponibile per assegnazione</span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-base text-gray-600">Paga Oraria</p>
                  <p class="font-bold text-lg text-green-600">€{{ selectedDipendente?.pagaOraria }}/h</p>
                </div>
              </div>
            </div>

            <!-- Pianificazione Settimanale -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 🚀 MULTI-ASSIGNMENT: Assegnazioni Cantieri -->
              <div class="card">
                <h5 class="font-semibold text-gray-900 mb-4">📍 Assegnazioni Cantieri</h5>
                <div class="space-y-3">
                  <!-- Mostra tutti i cantieri assegnati -->
                  <div v-if="getCantieriAssegnati(selectedDipendente?.id).length > 0">
                    <div v-for="(cantiere, index) in getCantieriAssegnati(selectedDipendente?.id)" :key="cantiere" 
                         class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p class="font-medium text-green-900">{{ cantiere }}</p>
                        <p class="text-sm text-green-600">
                          {{ index === 0 ? 'Cantiere assegnato' : `Cantiere ${index + 1}` }}
                        </p>
                      </div>
                      <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">Attivo</span>
                    </div>
                  </div>
                  <!-- Nessun cantiere assegnato -->
                  <div v-else class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p class="font-medium text-gray-900">Non assegnato</p>
                      <p class="text-sm text-gray-600">Dipendente disponibile per assegnazione multipla</p>
                    </div>
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">Disponibile</span>
                  </div>
                  <!-- Info multi-assignment -->
                  <div class="text-center text-blue-50 bg-blue-50 rounded-lg py-3 px-4">
                    <p class="text-sm text-blue-700">🚀 I dipendenti possono ora essere assegnati a più cantieri contemporaneamente</p>
                  </div>
                </div>
              </div>

              <!-- Competenze & Certificazioni -->
              <div class="card">
                <h5 class="font-semibold text-gray-900 mb-4">🎯 Competenze & Info</h5>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Ruolo:</span>
                    <span class="font-medium">{{ getRuoloLabel(selectedDipendente?.ruolo) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Data Assunzione:</span>
                    <span class="font-medium">{{ formatDate(selectedDipendente?.dataAssunzione) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Stato:</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium" :class="getStatoColor(selectedDipendente?.stato)">
                      {{ getStatoLabel(selectedDipendente?.stato) }}
                    </span>
                  </div>
                  <div v-if="selectedDipendente?.note" class="pt-3 border-t border-gray-200">
                    <p class="text-sm text-gray-600 mb-1">Note:</p>
                    <p class="text-sm">{{ selectedDipendente?.note }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calendario Semplificato -->
            <div class="card">
              <h5 class="font-semibold text-gray-900 mb-4">📅 Calendario Settimanale</h5>
              <div class="grid grid-cols-6 gap-4 text-center">
                <div v-for="(giorno, index) in ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']" :key="index" 
                     class="p-4 border border-gray-200 rounded-lg">
                  <p class="font-medium text-gray-900 mb-2">{{ giorno }}</p>
                  <div class="space-y-2">
                    <div class="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                      08:00 - 17:00
                    </div>
                    <p class="text-xs text-gray-500">
                      {{ getCantieriAssegnati(selectedDipendente?.id).length > 0 
                        ? getCantieriAssegnati(selectedDipendente?.id)[0] 
                        : 'TBD' }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">🕐 Settimana lavorativa: 6 giorni (Lun-Sab) - 52h totali</p>
              </div>
              <div class="mt-4 text-center">
                <p class="text-sm text-gray-500">📝 Planning completo disponibile nel modulo Calendario</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { 
  PlusIcon, 
  UsersIcon, 
  ClockIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '../stores/firestore.js'
import { usePopup } from '../composables/usePopup.js'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { it } from 'date-fns/locale'

// Firestore store
const firestoreStore = useFirestoreStore()
const { success, error, confirm, warning, info } = usePopup()

// Stato della pagina
const activeTab = ref('dipendenti')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTimesheetModal = ref(false)
const showDetailModal = ref(false)
const showScheduleModal = ref(false)
const showEditTimesheetModal = ref(false)
const searchTerm = ref('')
const selectedRuolo = ref('')
const selectedStato = ref('')
const selectedWeek = ref('current')
const selectedDipendente = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

// Stato per il popover dei dettagli giornalieri
const hoveredDayDetails = ref(null)
const popoverVisible = ref(false)
const popoverPosition = ref({ top: '0px', left: '0px' })
const popoverTimeout = ref(null)
const popoverRef = ref(null)

// Stats - calcolate dinamicamente dai dati Firestore
const stats = computed(() => {
  const dipendentiAttivi = dipendenti.value.filter(d => d.stato === 'attivo').length
  
  // Calcola ore settimanali totali dai timesheet reali
  const oreSettimanaTotali = dipendenti.value.reduce((total, d) => total + (d.oreTotaliSettimana || 0), 0)
  
  const costoOrarioMedio = dipendentiAttivi > 0 
    ? dipendenti.value.reduce((total, d) => total + (d.pagaOraria || 0), 0) / dipendentiAttivi 
    : 0
  
  // 🚀 NUOVO: Calcola presenti oggi dai timesheet reali
  const oggi = new Date().toISOString().split('T')[0]
  const presentiOggi = new Set(
    timesheetDettagli.value
      .filter(t => t.data === oggi && (t.ore > 0 || t.oreLavorate > 0))
      .map(t => t.dipendenteId)
  ).size
  
  return {
    dipendentiAttivi,
    oreSettimana: Math.round(oreSettimanaTotali * 2) / 2,
    presentiOggi,
    costoOrarioMedio: Math.round(costoOrarioMedio * 100) / 100
  }
})

// Presenze giornaliere
const presenze = ref({})

// Lista cantieri dinamica (caricata da Firestore)
const cantieriDisponibili = computed(() => {
  return firestoreStore.cantieri.map(cantiere => cantiere.nome)
})

// Dati dipendenti - caricati da Firestore
const dipendenti = computed(() => firestoreStore.dipendenti)

// Dati timesheet - vuoto, da caricare da Firestore
const timesheetData = ref([])

// Dati timesheet dettagliati - vuoto, da caricare da Firestore
const timesheetDettagli = ref([])

// 🚀 NUOVO: Variabili per il controllo coerenze
const incoerenze = ref([])
const controlloInCorso = ref(false)
const ultimoControlloCount = ref(0)

// Nuovo dipendente
const newDipendente = ref({
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  ruolo: '',
  pagaOraria: 25,
  dataAssunzione: new Date().toISOString().split('T')[0],
  stato: 'attivo',
  cantiereAttuale: '',
  note: ''
})

// Nuovo timesheet
const newTimesheet = ref({
  dipendenteId: '',
  data: new Date().toISOString().split('T')[0],
  ore: '',
  cantiere: '',
  note: '',
  orarioInizio: '08:00',
  orarioFine: '17:00'
})

// Dipendente in modifica
const editingDipendente = ref({
  id: null,
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  ruolo: '',
  pagaOraria: 25,
  dataAssunzione: '',
  stato: 'attivo',
  cantiereAttuale: '',
  note: ''
})

// 🚀 NUOVO: Timesheet in modifica
const editingTimesheet = ref({
  id: null,
  dipendenteId: '',
  data: '',
  ore: '',
  cantiere: '',
  note: '',
  orarioInizio: '08:00',
  orarioFine: '17:00'
})

const editingTimesheetDipendenteName = ref('')

// Funzioni per la gestione dei cantieri - ora usa Firestore
const loadCantieri = async () => {
  try {
    await firestoreStore.loadCantieri()
    console.log('✅ Lista cantieri caricata da Firestore:', cantieriDisponibili.value)
  } catch (e) {
    console.warn('Errore nel caricamento cantieri da Firestore:', e)
  }
}

// Funzioni per la gestione dei dipendenti - ora usa Firestore
const loadDipendenti = async () => {
  try {
    await firestoreStore.loadDipendenti()
    console.log('✅ Dipendenti caricati da Firestore:', dipendenti.value.length)
    
    // Carica anche i timesheet automaticamente
    await loadTimesheet()
  } catch (e) {
    console.warn('Errore nel caricamento dipendenti da Firestore:', e)
  }
}

// Funzioni per la gestione dei timesheet - carica da Firestore
const loadTimesheet = async (dipendenteId = null) => {
  try {
    console.log('🔄 Inizio caricamento timesheet...')
    
    // Carica tutti i timesheet usando il metodo dello store
    const result = await firestoreStore.loadTimesheet()
    
    console.log('📊 Risultato caricamento timesheet:', result)
    
    if (result.success) {
      const allTimesheet = firestoreStore.timesheet || []
      console.log(`📋 Timesheet trovati in Firestore: ${allTimesheet.length}`)
      
      if (dipendenteId) {
        // Filtra per dipendente specifico
        timesheetDettagli.value = allTimesheet.filter(t => t.dipendenteId === dipendenteId)
        console.log(`👤 Timesheet per dipendente ${dipendenteId}: ${timesheetDettagli.value.length}`)
      } else {
        // Carica tutti
        timesheetDettagli.value = allTimesheet
        console.log(`📊 Tutti i timesheet caricati: ${timesheetDettagli.value.length}`)
      }
      
      // Debug: mostra alcuni esempi di timesheet
      if (timesheetDettagli.value.length > 0) {
        console.log('📋 Esempio timesheet caricati:', timesheetDettagli.value.slice(0, 3))
      } else {
        console.warn('⚠️ Nessun timesheet trovato in Firestore!')
        console.log('💡 Suggerimento: Vai al Giornale Cantiere per aggiungere personale e generare timesheet automaticamente')
      }
      
      // Aggiorna le ore settimanali per ogni dipendente
      updateDipendentiOreFromTimesheet()
      
      // 🚀 NUOVA: Controllo coerenza presenze-timesheet dopo caricamento (solo se non siamo nel tab controlli)
      if (activeTab.value !== 'controlli') {
        await checkPresenceTimesheetCoherence()
      }
      
      console.log('✅ Caricamento timesheet completato')
    } else {
      console.error('❌ Errore caricamento timesheet:', result.error)
    }
  } catch (e) {
    console.error('❌ Errore nel caricamento timesheet da Firestore:', e)
  }
}

// Aggiorna le ore settimanali dei dipendenti basandosi sui timesheet
const updateDipendentiOreFromTimesheet = () => {
  console.log('🔄 Aggiornamento ore settimanali dipendenti...')
  console.log('📅 Settimana selezionata:', selectedWeek.value)
  
  // 🔧 FIX: Usa il nuovo sistema di calcolo periodo
  const { startOfWeek, endOfWeek } = getSelectedWeekPeriod()
  
  console.log('📅 Periodo analizzato:', {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  })
  
  if (dipendenti.value.length === 0) {
    console.warn('⚠️ Nessun dipendente trovato per aggiornamento ore')
    return
  }
  
  dipendenti.value.forEach(dipendente => {
    // Filtra i timesheet per questa settimana
    const timesheetSettimana = timesheetDettagli.value.filter(t => {
      const dataTimesheet = new Date(t.data)
      return t.dipendenteId === dipendente.id && 
             dataTimesheet >= startOfWeek && 
             dataTimesheet <= endOfWeek
    })

    // Raggruppa per data per controllo ore giornaliere
    const orePerGiorno = {}
    timesheetSettimana.forEach(t => {
      if (!orePerGiorno[t.data]) {
        orePerGiorno[t.data] = 0
      }
      orePerGiorno[t.data] += (t.ore || t.oreLavorate || 0)
    })

    // Controlla limiti ore giornaliere
    Object.entries(orePerGiorno).forEach(([data, ore]) => {
      if (ore > 12) {
        console.warn(`⚠️ Il dipendente ${dipendente.nome} ha registrato ${ore}h il ${data} (max 12h)`)
      }
    })
    
    // Calcola ore settimanali totali
    const oreSettimana = timesheetSettimana.reduce((total, t) => total + (t.ore || t.oreLavorate || 0), 0)
    
    // Aggiorna il dipendente
    dipendente.oreTotaliSettimana = Math.round(oreSettimana * 2) / 2 // Arrotonda a 0.5
    
    console.log(`👤 ${dipendente.nome}: ${dipendente.oreTotaliSettimana}h questa settimana`)
  })
  
  // 🚀 NUOVA FUNZIONE: Popola timesheetData per la visualizzazione settimanale
  updateTimesheetDataFromDetails(startOfWeek, endOfWeek)
  
  console.log('✅ Aggiornamento ore settimanali completato')
}

// 🚀 NUOVA: Forza aggiornamento completo di tutti i dati
const forceRefreshAllData = async () => {
  try {
    console.log('🔄 Aggiornamento forzato di tutti i dati...')
    
    // Ricarica tutto
    await loadDipendenti() // Questo carica sia dipendenti che timesheet
    
    success('Dati Aggiornati', 'Tutti i dati della pagina sono stati ricaricati con successo!')
    
  } catch (error) {
    console.error('❌ Errore aggiornamento forzato:', error)
    error('Errore', 'Impossibile aggiornare i dati')
  }
}

// 🔍 DEBUG: Funzione per ispezionare lo stato dei dati timesheet
const debugTimesheetData = async () => {
  console.log('🔍 =================================')
  console.log('🔍 DEBUG TIMESHEET DATA')
  console.log('🔍 =================================')
  
  // 1. Stato generale
  console.log('📊 STATO GENERALE:')
  console.log(`  - Dipendenti caricati: ${dipendenti.value.length}`)
  console.log(`  - Timesheet dettagli: ${timesheetDettagli.value.length}`)
  console.log(`  - Timesheet data (visualizzazione): ${timesheetData.value.length}`)
  console.log(`  - Stato loading: ${firestoreStore.loading}`)
  console.log(`  - Errori: ${firestoreStore.error}`)
  
  // 2. Test caricamento diretto da Firestore
  console.log('🔄 TEST CARICAMENTO DIRETTO:')
  try {
    const directResult = await firestoreStore.loadTimesheet()
    console.log('  - Risultato caricamento diretto:', directResult)
    console.log('  - Dati nello store dopo caricamento:', firestoreStore.timesheet.length)
    if (firestoreStore.timesheet.length > 0) {
      console.log('  - Primi 3 timesheet:', firestoreStore.timesheet.slice(0, 3))
    }
  } catch (err) {
    console.error('  - Errore caricamento diretto:', err)
  }
  
  // 3. Analisi periodo settimana corrente
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 5)
  endOfWeek.setHours(23, 59, 59, 999)
  
  console.log('📅 PERIODO SETTIMANA CORRENTE:')
  console.log(`  - Inizio: ${startOfWeek.toISOString().split('T')[0]}`)
  console.log(`  - Fine: ${endOfWeek.toISOString().split('T')[0]}`)
  
  // 4. Analisi timesheet per periodo
  const timesheetSettimana = timesheetDettagli.value.filter(t => {
    const dataTimesheet = new Date(t.data)
    return dataTimesheet >= startOfWeek && dataTimesheet <= endOfWeek
  })
  
  console.log('📋 TIMESHEET SETTIMANA CORRENTE:')
  console.log(`  - Totali timesheet: ${timesheetDettagli.value.length}`)
  console.log(`  - Timesheet questa settimana: ${timesheetSettimana.length}`)
  
  if (timesheetSettimana.length > 0) {
    console.log('  - Esempi timesheet settimana:')
    timesheetSettimana.slice(0, 5).forEach((t, i) => {
      console.log(`    ${i+1}. ${t.data} - ${t.dipendenteId} - ${t.ore || t.oreLavorate || 0}h - ${t.cantiere || 'N/A'}`)
    })
    
    // Raggruppa per dipendente
    const perDipendente = {}
    timesheetSettimana.forEach(t => {
      if (!perDipendente[t.dipendenteId]) {
        perDipendente[t.dipendenteId] = []
      }
      perDipendente[t.dipendenteId].push(t)
    })
    
    console.log('👥 RIEPILOGO PER DIPENDENTE:')
    Object.entries(perDipendente).forEach(([dipendenteId, timesheet]) => {
      const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
      const nome = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : `ID: ${dipendenteId}`
      const oreTotali = timesheet.reduce((sum, t) => sum + (t.ore || t.oreLavorate || 0), 0)
      console.log(`  - ${nome}: ${oreTotali}h (${timesheet.length} registrazioni)`)
    })
  }
  
  // 5. Test creazione manuale di un timesheet
  console.log('🧪 TEST CREAZIONE TIMESHEET:')
  if (dipendenti.value.length > 0) {
    const primoDipendente = dipendenti.value[0]
    console.log(`  - Creando timesheet test per: ${primoDipendente.nome} ${primoDipendente.cognome}`)
    
    const testTimesheet = {
      dipendenteId: primoDipendente.id,
      data: new Date().toISOString().split('T')[0],
      cantiere: 'Test Cantiere',
      ore: 8,
      orarioInizio: '08:00',
      orarioFine: '17:00',
      note: 'Timesheet di test per debug',
      costoOrario: primoDipendente.pagaOraria || 25,
      costoTotale: 8 * (primoDipendente.pagaOraria || 25),
      fonte: 'debug_test',
      createdAt: new Date().toISOString()
    }
    
    console.log('  - Dati timesheet test:', testTimesheet)
    
    try {
      const createResult = await firestoreStore.registraTimesheet(testTimesheet)
      console.log('  - Risultato creazione:', createResult)
      
      if (createResult.success) {
        // Ricarica e ricontrolla
        console.log('  - Ricaricando dati dopo test...')
        await loadTimesheet()
        console.log(`  - Timesheet dopo ricaricamento: ${timesheetDettagli.value.length}`)
      }
    } catch (err) {
      console.error('  - Errore creazione timesheet test:', err)
    }
  }
  
  console.log('🔍 =================================')
  console.log('🔍 FINE DEBUG')
  console.log('🔍 =================================')
  
  // Mostra popup con risultato
  const report = `
🔍 DEBUG TIMESHEET REPORT

📊 Dati caricati:
• Dipendenti: ${dipendenti.value.length}
• Timesheet totali: ${timesheetDettagli.value.length}
• Timesheet settimana: ${timesheetSettimana.length}

📅 Periodo: ${startOfWeek.toISOString().split('T')[0]} → ${endOfWeek.toISOString().split('T')[0]}

${timesheetDettagli.value.length === 0 ? 
  '⚠️ PROBLEMA: Nessun timesheet trovato in Firestore!' : 
  timesheetSettimana.length === 0 ? 
    '⚠️ PROBLEMA: Nessun timesheet per questa settimana!' :
    '✅ Timesheet presenti - problema nella logica di visualizzazione'
}

Controlla la console per dettagli completi.
  `
  
  info('Debug Timesheet Completato', report)
}

// 🔧 FIX: Gestione cambio settimana
const onWeekChange = () => {
  console.log('📅 Cambio settimana:', selectedWeek.value)
  updateDipendentiOreFromTimesheet()
}

// 🔍 AUDIT COMPLETO: Esegue controllo sistematico e correzione
const performCompleteAudit = async () => {
  try {
    console.log('🔍 Avvio audit completo timesheet...')
    
    const { default: CompleteTimesheetAuditor } = await import('../utils/completeTimesheetAudit.js')
    const auditor = new CompleteTimesheetAuditor(firestoreStore)
    
    // Mostra loading
    info('Audit in Corso...', 'Scansionando tutti i timesheet per identificare problemi...')
    
    // Esegui audit completo
    const auditResults = await auditor.performCompleteAudit()
    
    if (auditResults.problematicRecords === 0) {
      success('Database Pulito!', `✅ Audit completato: ${auditResults.totalRecords} record analizzati, nessun problema trovato.`)
      return
    }
    
    // Se ci sono problemi, chiedi conferma per la correzione automatica
    const shouldFix = await confirm(
      `Problemi Trovati: ${auditResults.problematicRecords}`,
      `L'audit ha trovato ${auditResults.problematicRecords} problemi su ${auditResults.totalRecords} record totali.\n\nVuoi avviare la correzione automatica?`
    )
    
    if (shouldFix) {
      info('Correzione in Corso...', 'Applicando correzioni automatiche ai problemi trovati...')
      
      // Esegui correzione automatica
      const fixResults = await auditor.performCompleteFix()
      
      // Genera report finale
      const userReport = auditor.generateUserReport()
      
      // Ricarica i dati aggiornati
      await loadTimesheet()
      
      success('Correzione Completata!', userReport)
      
    } else {
      // Mostra solo il report dei problemi trovati
      const userReport = auditor.generateUserReport()
      warning('Problemi Identificati', userReport)
    }
    
  } catch (err) {
    console.error('❌ Errore durante audit completo:', err)
    error('Errore Audit', `Impossibile completare l'audit: ${err.message}`)
  }
}

// 🧪 TEST SISTEMA: Verifica che le correzioni funzionino
const runSystemTests = async () => {
  try {
    console.log('🧪 Avvio test sistema timesheet...')
    
    const { default: TimesheetSystemTester } = await import('../utils/testTimesheetSystem.js')
    const tester = new TimesheetSystemTester()
    
    // Mostra loading
    info('Test in Corso...', 'Eseguendo test di validazione del sistema...')
    
    // Esegui tutti i test
    const testResults = await tester.runAllTests()
    
    // Genera report per l'utente
    const userReport = tester.generateUserReport()
    
    if (testResults.success) {
      success('Test Completati!', userReport)
    } else {
      warning('Test Parzialmente Falliti', userReport)
    }
    
  } catch (err) {
    console.error('❌ Errore durante test sistema:', err)
    error('Errore Test', `Impossibile eseguire i test: ${err.message}`)
  }
}

// 📅 DEBUG: Mostra tutte le date disponibili nei timesheet  
const debugAllTimesheetDates = () => {
  console.log('📅 =================================')
  console.log('📅 DEBUG DATE TIMESHEET')
  console.log('📅 =================================')
  
  if (timesheetDettagli.value.length === 0) {
    console.log('❌ Nessun timesheet trovato!')
    info('Date Timesheet', '❌ Nessun timesheet trovato in Firestore!')
    return
  }
  
  // Raggruppa per data
  const dateMap = new Map()
  timesheetDettagli.value.forEach(t => {
    const data = t.data
    if (!dateMap.has(data)) {
      dateMap.set(data, { count: 0, dipendenti: new Set(), ore: 0 })
    }
    const dataInfo = dateMap.get(data)
    dataInfo.count++
    dataInfo.dipendenti.add(t.dipendenteId)
    dataInfo.ore += (t.ore || t.oreLavorate || 0)
  })
  
  // Ordina per data
  const sortedDates = Array.from(dateMap.entries()).sort(([a], [b]) => new Date(b) - new Date(a))
  
  console.log(`📊 Timesheet distribuiti su ${sortedDates.length} date diverse:`)
  
  let report = `📅 DATE TIMESHEET DISPONIBILI (${sortedDates.length} date)\n\n`
  
  sortedDates.slice(0, 20).forEach(([data, info]) => {
    const dateObj = new Date(data)
    const dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'short' })
    const formattedDate = dateObj.toLocaleDateString('it-IT')
    
    console.log(`  📅 ${data} (${dayName}): ${info.count} timesheet, ${info.dipendenti.size} dipendenti, ${info.ore}h totali`)
    report += `${formattedDate} (${dayName}): ${info.count} timesheet, ${info.ore}h\n`
  })
  
  if (sortedDates.length > 20) {
    report += `\n... e altre ${sortedDates.length - 20} date`
  }
  
  // Trova la settimana con più dati
  const weekMap = new Map()
  sortedDates.forEach(([data, info]) => {
    const dateObj = new Date(data)
    const startOfWeek = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
    const dayOfWeek = startOfWeek.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract)
    
    const weekKey = startOfWeek.toISOString().split('T')[0]
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { ore: 0, giorni: new Set() })
    }
    const weekInfo = weekMap.get(weekKey)
    weekInfo.ore += info.ore
    weekInfo.giorni.add(data)
  })
  
  const topWeeks = Array.from(weekMap.entries())
    .sort(([, a], [, b]) => b.ore - a.ore)
    .slice(0, 5)
  
  console.log('\n🏆 TOP 5 SETTIMANE PER ORE:')
  report += '\n\n🏆 SETTIMANE CON PIÙ ORE:\n'
  topWeeks.forEach(([weekStart, info], index) => {
    console.log(`  ${index + 1}. Settimana ${weekStart}: ${info.ore}h su ${info.giorni.size} giorni`)
    report += `${index + 1}. ${weekStart}: ${info.ore}h\n`
  })
  
  console.log('📅 =================================')
  
  info('Date Timesheet', report)
}

// 🔧 FIX: Calcola periodo settimana basato su selezione
const getSelectedWeekPeriod = () => {
  const now = new Date()
  let weeksBack = 0
  
  switch (selectedWeek.value) {
    case 'current': weeksBack = 0; break
    case 'last': weeksBack = 1; break
    case 'two-weeks': weeksBack = 2; break
    case 'three-weeks': weeksBack = 3; break
    case 'month': weeksBack = 4; break
    default: weeksBack = 0
  }
  
  // Calcola l'inizio della settimana target
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() - (weeksBack * 7))
  
  const startOfWeek = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const dayOfWeek = startOfWeek.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 5)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

// 🔧 CORREZIONE CRITICA: Fix per timesheet con date sbagliate (01/01/2025)
const fixBuggedDates = async () => {
  try {
    console.log('🔧 =================================')
    console.log('🔧 CORREZIONE DATE TIMESHEET')
    console.log('🔧 =================================')
    
    // Conferma dall'utente
    const confirmed = await confirm(
      'Correggere Date Timesheet?', 
      'Questa operazione correggerà automaticamente tutti i timesheet con data 01/01/2025 impostandoli alla settimana scorsa (1-5 luglio 2025).\n\nVuoi procedere?'
    )
    
    if (!confirmed) {
      console.log('❌ Operazione annullata dall\'utente')
      return
    }
    
    info('Correzione in corso...', 'Analizzando e correggendo i timesheet con date sbagliate...')
    
    // 1. Trova tutti i timesheet con data 01/01/2025
    const timesheetBuggati = timesheetDettagli.value.filter(t => t.data === '2025-01-01')
    
    console.log(`🔍 Trovati ${timesheetBuggati.length} timesheet con data sbagliata (01/01/2025)`)
    
    if (timesheetBuggati.length === 0) {
      info('Nessun Problema', 'Non sono stati trovati timesheet con date sbagliate da correggere.')
      return
    }
    
    // 2. Calcola le date della settimana scorsa (1-5 luglio 2025)
    const oggi = new Date() // 8 luglio 2025
    const settimanaScorsa = []
    
    // Genera le date della settimana lavorativa scorsa (1-5 luglio)
    for (let i = 1; i <= 5; i++) {
      const data = new Date(2025, 6, i) // 6 = luglio (0-indexed), 1-5 = giorni
      settimanaScorsa.push(data.toISOString().split('T')[0])
    }
    
    console.log('📅 Date settimana scorsa da usare:', settimanaScorsa)
    
    // 3. Raggruppa i timesheet per dipendente
    const perDipendente = {}
    timesheetBuggati.forEach(t => {
      if (!perDipendente[t.dipendenteId]) {
        perDipendente[t.dipendenteId] = []
      }
      perDipendente[t.dipendenteId].push(t)
    })
    
    // 4. Distribuzione intelligente delle date
    let correzioniEffettuate = 0
    const reportCorrezioni = []
    
    for (const [dipendenteId, timesheet] of Object.entries(perDipendente)) {
      const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
      const nomeDipendente = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : `ID: ${dipendenteId}`
      
      console.log(`👤 Correggendo ${timesheet.length} timesheet per ${nomeDipendente}`)
      
      for (let i = 0; i < timesheet.length; i++) {
        const t = timesheet[i]
        
        // Distribuisci i timesheet sui giorni della settimana scorsa
        const dataCorretta = settimanaScorsa[i % settimanaScorsa.length]
        
        console.log(`  🔧 ${t.id}: 2025-01-01 → ${dataCorretta}`)
        
        try {
          // Aggiorna il timesheet con la data corretta
          const updateResult = await firestoreStore.updateDocument('timesheet', t.id, {
            data: dataCorretta,
            note: (t.note || '') + ' [Data corretta automaticamente]',
            fixedDate: true,
            originalDate: '2025-01-01'
          })
          
          if (updateResult.success) {
            correzioniEffettuate++
            reportCorrezioni.push({
              dipendente: nomeDipendente,
              ore: t.ore || t.oreLavorate || 0,
              dataOriginale: '2025-01-01',
              dataCorretta: dataCorretta
            })
          } else {
            console.error(`❌ Errore aggiornamento timesheet ${t.id}:`, updateResult.error)
          }
          
        } catch (err) {
          console.error(`❌ Errore correzione timesheet ${t.id}:`, err)
        }
      }
    }
    
    console.log(`✅ Correzioni completate: ${correzioniEffettuate}/${timesheetBuggati.length}`)
    
    // 5. Ricarica i dati
    console.log('🔄 Ricaricamento dati...')
    await loadTimesheet()
    
    // 6. Report finale
    console.log('🔧 =================================')
    console.log('🔧 FINE CORREZIONE')
    console.log('🔧 =================================')
    
    const reportText = `
🔧 CORREZIONE DATE COMPLETATA

✅ Timesheet corretti: ${correzioniEffettuate}
📅 Date ripristinate: ${reportCorrezioni.length}

📋 DETTAGLI CORREZIONI:
${reportCorrezioni.slice(0, 10).map(r => 
  `• ${r.dipendente}: ${r.ore}h → ${r.dataCorretta}`
).join('\n')}
${reportCorrezioni.length > 10 ? `\n... e altri ${reportCorrezioni.length - 10}` : ''}

🎯 Ora i timesheet sono distribuiti correttamente sulla settimana scorsa (1-5 luglio 2025).
    `
    
         success('Date Corrette!', reportText)
     
     // 7. Cambia automaticamente alla settimana scorsa per vedere i dati corretti
     selectedWeek.value = 'last'
     console.log('📅 Cambiata visualizzazione alla settimana scorsa')
     
     // Aggiorna la visualizzazione
     updateDipendentiOreFromTimesheet()
     
   } catch (error) {
     console.error('❌ Errore durante correzione date:', error)
     error('Errore Correzione', `Impossibile correggere le date: ${error.message}`)
   }
 }

// 🚀 NUOVA: Popola timesheetData con i dati reali per la visualizzazione settimanale
const updateTimesheetDataFromDetails = (startOfWeek, endOfWeek) => {
  const weeklyData = []
  
  console.log('📊 Aggiornamento timesheetData per periodo:', {
    startOfWeek: startOfWeek.toISOString().split('T')[0],
    endOfWeek: endOfWeek.toISOString().split('T')[0],
    dipendenti: dipendenti.value.length,
    timesheetTotali: timesheetDettagli.value.length
  })
  
  // 🔧 FIX: Debug periodo per verificare correttezza
  console.log('🗓️ Debug periodo settimana:')
  console.log('  - Oggi:', new Date().toISOString().split('T')[0])
  console.log('  - Inizio settimana:', startOfWeek.toISOString().split('T')[0])
  console.log('  - Fine settimana:', endOfWeek.toISOString().split('T')[0])
  
  dipendenti.value.forEach(dipendente => {
    // Filtra i timesheet per questa settimana
    const timesheetSettimana = timesheetDettagli.value.filter(t => {
      const dataTimesheet = new Date(t.data)
      return t.dipendenteId === dipendente.id && 
             dataTimesheet >= startOfWeek && 
             dataTimesheet <= endOfWeek
    })

    console.log(`👤 ${dipendente.nome}: ${timesheetSettimana.length} timesheet questa settimana`)

    // Crea un oggetto per aggregare ore per giorno
    const orePerGiorno = {
      lunedi: 0,
      martedi: 0,
      mercoledi: 0,
      giovedi: 0,
      venerdi: 0,
      sabato: 0
    }

    // Aggrega le ore per giorno della settimana
    timesheetSettimana.forEach(t => {
      const dataTimesheet = new Date(t.data)
      const dayOfWeek = dataTimesheet.getDay()
      const ore = t.ore || t.oreLavorate || 0
      
      console.log(`  📅 ${t.data} (giorno ${dayOfWeek}): ${ore}h`)
      
      switch (dayOfWeek) {
        case 1: orePerGiorno.lunedi += ore; break
        case 2: orePerGiorno.martedi += ore; break
        case 3: orePerGiorno.mercoledi += ore; break
        case 4: orePerGiorno.giovedi += ore; break
        case 5: orePerGiorno.venerdi += ore; break
        case 6: orePerGiorno.sabato += ore; break
      }
    })

    // Calcola il totale settimanale
    const totale = Object.values(orePerGiorno).reduce((sum, ore) => sum + ore, 0)
    
    // Trova il cantiere più comune per questo dipendente
    const cantieri = timesheetSettimana.map(t => t.cantiere || t.cantiereNome || 'Non Assegnato')
    const cantiereComune = cantieri.length > 0 ? 
      cantieri.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)) :
      dipendente.cantiereAttuale || 'Non Assegnato'

    // Aggiungi i dati settimanali (includi anche dipendenti senza ore)
    const dipendenteData = {
      dipendenteId: dipendente.id,
      nome: `${dipendente.nome} ${dipendente.cognome}`,
      iniziali: dipendente.iniziali || `${dipendente.nome?.[0] || ''}${dipendente.cognome?.[0] || ''}`,
      cantiere: cantiereComune,
      lunedi: Math.round(orePerGiorno.lunedi * 2) / 2,
      martedi: Math.round(orePerGiorno.martedi * 2) / 2,
      mercoledi: Math.round(orePerGiorno.mercoledi * 2) / 2,
      giovedi: Math.round(orePerGiorno.giovedi * 2) / 2,
      venerdi: Math.round(orePerGiorno.venerdi * 2) / 2,
      sabato: Math.round(orePerGiorno.sabato * 2) / 2,
      totale: Math.round(totale * 2) / 2
    }
    
    weeklyData.push(dipendenteData)
    
    console.log(`  ✅ ${dipendente.nome}: ${totale}h totali`)
  })

  // Aggiorna timesheetData
  timesheetData.value = weeklyData
  console.log('✅ TimesheetData aggiornato:', {
    dipendenti: weeklyData.length,
    conOre: weeklyData.filter(d => d.totale > 0).length,
    oreTotali: weeklyData.reduce((sum, d) => sum + d.totale, 0)
  })
}

// Computed
const filteredDipendenti = computed(() => {
  let result = dipendenti.value

  if (searchTerm.value) {
    result = result.filter(d => 
      `${d.nome} ${d.cognome}`.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedRuolo.value) {
    result = result.filter(d => d.ruolo === selectedRuolo.value)
  }

  if (selectedStato.value) {
    result = result.filter(d => d.stato === selectedStato.value)
  }

  return result
})

// Methods
const getStatoColor = (stato) => {
  const colors = {
    'attivo': 'bg-green-100 text-green-800',
    'in-ferie': 'bg-blue-100 text-blue-800',
    'malattia': 'bg-yellow-100 text-yellow-800',
    'sospeso': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'attivo': 'Attivo',
    'in-ferie': 'In Ferie',
    'malattia': 'Malattia',
    'sospeso': 'Sospeso'
  }
  return labels[stato] || stato
}

const getRuoloLabel = (ruolo) => {
  const labels = {
    'capo-squadra': 'Capo Squadra',
    'carpentiere': 'Carpentiere',
    'operaio': 'Operaio Specializzato',
    'amministrativo': 'Amministrativo'
  }
  return labels[ruolo] || ruolo
}

// 🚀 MULTI-ASSIGNMENT: Ottiene tutti i cantieri dove il dipendente è assegnato
const getCantieriAssegnati = (dipendenteId) => {
  if (!firestoreStore.cantieri || !dipendenteId) return []
  
  return firestoreStore.cantieri
    .filter(cantiere => cantiere.team?.some(membro => membro.id === dipendenteId))
    .map(cantiere => cantiere.nome)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const saveDipendente = async () => {
  if (!newDipendente.value.nome || !newDipendente.value.cognome || !newDipendente.value.email) {
    error('Campi Mancanti', 'Compila tutti i campi obbligatori!')
    return
  }

  try {
    const result = await firestoreStore.createDipendente(newDipendente.value)
    
    if (result.success) {
      // Ricarica dipendenti
      await loadDipendenti()
      
      closeAddModal()
      success('Dipendente Creato', `${newDipendente.value.nome} ${newDipendente.value.cognome} aggiunto con successo!`)
    } else {
      throw new Error(result.error || 'Errore sconosciuto')
    }
  } catch (err) {
    console.error('Errore creazione dipendente:', err)
    error('Errore Creazione', `Impossibile creare il dipendente: ${err.message}`)
  }
}

// Funzioni di validazione timesheet
const validateTimesheet = async (timesheetData) => {
  // Controllo base campi obbligatori
  if (!timesheetData.dipendenteId || !timesheetData.ore || !timesheetData.cantiere) {
    throw new Error('Compila tutti i campi obbligatori!')
  }

  // Controllo ore massime giornaliere
  if (timesheetData.ore > 12) {
    throw new Error('Non è possibile registrare più di 12 ore giornaliere')
  }

  // Controllo sovrapposizioni
  const timesheetGiorno = timesheetDettagli.value.filter(t => 
    t.dipendenteId === timesheetData.dipendenteId && 
    t.data === timesheetData.data
  )

  // Calcola ore totali già registrate per quel giorno
  const oreTotaliGiorno = timesheetGiorno.reduce((total, t) => total + t.ore, 0)
  if (oreTotaliGiorno + timesheetData.ore > 12) {
    throw new Error(`Il dipendente ha già registrato ${oreTotaliGiorno}h in questa data. Non può superare 12h totali.`)
  }

  // Controllo sovrapposizione orari se specificati
  if (timesheetData.orarioInizio && timesheetData.orarioFine) {
    const inizio = new Date(`${timesheetData.data}T${timesheetData.orarioInizio}`)
    const fine = new Date(`${timesheetData.data}T${timesheetData.orarioFine}`)

    // Verifica sovrapposizioni con altri timesheet
    const sovrapposizioni = timesheetGiorno.filter(t => {
      if (!t.orarioInizio || !t.orarioFine) return false
      const tInizio = new Date(`${t.data}T${t.orarioInizio}`)
      const tFine = new Date(`${t.data}T${t.orarioFine}`)
      return (inizio < tFine && fine > tInizio)
    })

    if (sovrapposizioni.length > 0) {
      throw new Error(`Sovrapposizione orari con altre registrazioni: ${
        sovrapposizioni.map(t => `${t.cantiere} (${t.orarioInizio}-${t.orarioFine})`).join(', ')
      }`)
    }
  }

  return true
}

const saveTimesheet = async () => {
  try {
    const dipendente = dipendenti.value.find(d => d.id === newTimesheet.value.dipendenteId)
    if (!dipendente) {
      throw new Error('Dipendente non trovato!')
    }

    // 🔧 VALIDAZIONE CENTRALIZZATA per timesheet manuali
    const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')

    const timesheetDataRaw = {
      dipendenteId: newTimesheet.value.dipendenteId,
      data: newTimesheet.value.data,
      cantiere: newTimesheet.value.cantiere,
      ore: parseFloat(newTimesheet.value.ore),
      orarioInizio: newTimesheet.value.orarioInizio,
      orarioFine: newTimesheet.value.orarioFine,
      note: newTimesheet.value.note,
      costoOrario: dipendente.pagaOraria || 25,
      costoTotale: parseFloat(newTimesheet.value.ore) * (dipendente.pagaOraria || 25),
      fonte: 'manuale',
      createdAt: new Date().toISOString()
    }

    // 🔧 DOPPIA VALIDAZIONE: centralizzata + esistente
    const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
    
    if (!timesheetValidation.isValid) {
      throw new Error(`Dati non validi: ${timesheetValidation.errors.join(', ')}`)
    }

    if (timesheetValidation.warnings.length > 0) {
      console.warn('⚠️ TIMESHEET MANUALE warnings:', timesheetValidation.warnings)
    }

    // Valida anche con il metodo esistente
    await validateTimesheet(timesheetValidation.correctedData)

    // Salva in Firestore
    const result = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)
    
    if (result.success) {
      // Ricarica i timesheet
      await loadTimesheet()
      
      closeTimesheetModal()
      success('Ore Registrate', `Timesheet per ${dipendente?.nome} ${dipendente?.cognome} salvato con successo!`)
    } else {
      throw new Error(result.error || 'Errore sconosciuto')
    }
  } catch (err) {
    console.error('Errore salvataggio timesheet:', err)
    error('Errore Salvataggio', err.message)
  }
}

const viewTimesheet = async (dipendente) => {
  selectedDipendente.value = dipendente
  
  // Carica i timesheet specifici per questo dipendente
  await loadTimesheet(dipendente.id)
  
  showDetailModal.value = true
}

const editDipendente = (dipendente) => {
  editingDipendente.value = {
    id: dipendente.id,
    nome: dipendente.nome,
    cognome: dipendente.cognome,
    email: dipendente.email,
    telefono: dipendente.telefono,
    ruolo: dipendente.ruolo,
    pagaOraria: dipendente.pagaOraria,
    dataAssunzione: dipendente.dataAssunzione,
    stato: dipendente.stato,
    cantiereAttuale: dipendente.cantiereAttuale || '',
    note: dipendente.note || ''
  }
  showEditModal.value = true
}

const saveEditedDipendente = async () => {
  if (!editingDipendente.value.nome || !editingDipendente.value.cognome || !editingDipendente.value.email) {
    error('Campi Mancanti', 'Compila tutti i campi obbligatori!')
    return
  }

  try {
    const result = await firestoreStore.updateDocument('dipendenti', editingDipendente.value.id, {
      nome: editingDipendente.value.nome,
      cognome: editingDipendente.value.cognome,
      email: editingDipendente.value.email,
      telefono: editingDipendente.value.telefono,
      ruolo: editingDipendente.value.ruolo,
      stato: editingDipendente.value.stato,
      dataAssunzione: editingDipendente.value.dataAssunzione,
      pagaOraria: editingDipendente.value.pagaOraria,
      cantiereAttuale: editingDipendente.value.cantiereAttuale,
      note: editingDipendente.value.note,
      iniziali: editingDipendente.value.nome.charAt(0) + editingDipendente.value.cognome.charAt(0)
    })
    
    if (result.success) {
      // Ricarica dipendenti
      await loadDipendenti()
      
      closeEditModal()
      success('Dipendente Modificato', `${editingDipendente.value.nome} ${editingDipendente.value.cognome} aggiornato con successo!`)
    } else {
      throw new Error(result.error || 'Errore sconosciuto')
    }
  } catch (err) {
    console.error('Errore aggiornamento dipendente:', err)
    error('Errore Modifica', `Impossibile aggiornare il dipendente: ${err.message}`)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingDipendente.value = {
    id: null,
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    ruolo: '',
    pagaOraria: 25,
    dataAssunzione: '',
    stato: 'attivo',
    cantiereAttuale: '',
    note: ''
  }
}

const viewSchedule = (dipendente) => {
  selectedDipendente.value = dipendente
  showScheduleModal.value = true
}

const getTimesheetForDipendente = (dipendenteId) => {
  return timesheetDettagli.value
    .filter(t => t.dipendenteId === dipendenteId)
    .sort((a, b) => new Date(b.data) - new Date(a.data)) // Ordina per data decrescente
}

const closeAddModal = () => {
  showAddModal.value = false
  newDipendente.value = {
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    ruolo: '',
    pagaOraria: 25,
    dataAssunzione: new Date().toISOString().split('T')[0],
    stato: 'attivo',
    cantiereAttuale: '',
    note: ''
  }
}

const closeTimesheetModal = () => {
  showTimesheetModal.value = false
  newTimesheet.value = {
    dipendenteId: '',
    data: new Date().toISOString().split('T')[0],
    ore: '',
    cantiere: '',
    note: '',
    orarioInizio: '08:00',
    orarioFine: '17:00'
  }
}

// 🚀 NUOVO: Funzioni per gestire modifica/eliminazione timesheet
const editTimesheetEntry = (entry) => {
  // Verifica che sia una registrazione manuale
  if (entry.fonte !== 'manuale') {
    warning('Modifica Non Permessa', 'Puoi modificare solo le registrazioni inserite manualmente. Le registrazioni auto-generate dal Giornale Cantiere non possono essere modificate.')
    return
  }

  // Trova il dipendente
  const dipendente = dipendenti.value.find(d => d.id === entry.dipendenteId)
  if (!dipendente) {
    error('Errore', 'Dipendente non trovato')
    return
  }

  // Popola i dati per la modifica
  editingTimesheet.value = {
    id: entry.id,
    dipendenteId: entry.dipendenteId,
    data: entry.data,
    ore: entry.ore || entry.oreLavorate || '',
    cantiere: entry.cantiere || entry.cantiereNome || '',
    note: entry.note || '',
    orarioInizio: entry.orarioInizio || '08:00',
    orarioFine: entry.orarioFine || '17:00'
  }
  
  editingTimesheetDipendenteName.value = `${dipendente.nome} ${dipendente.cognome}`
  showEditTimesheetModal.value = true
}

const updateTimesheet = async () => {
  try {
    const dipendente = dipendenti.value.find(d => d.id === editingTimesheet.value.dipendenteId)
    if (!dipendente) {
      throw new Error('Dipendente non trovato!')
    }

    // 🔧 VALIDAZIONE CENTRALIZZATA per update timesheet
    const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')

    const timesheetDataRaw = {
      dipendenteId: editingTimesheet.value.dipendenteId,
      data: editingTimesheet.value.data,
      cantiere: editingTimesheet.value.cantiere,
      ore: parseFloat(editingTimesheet.value.ore),
      oreLavorate: parseFloat(editingTimesheet.value.ore), // Entrambi i campi per compatibilità
      orarioInizio: editingTimesheet.value.orarioInizio,
      orarioFine: editingTimesheet.value.orarioFine,
      note: editingTimesheet.value.note,
      costoOrario: dipendente.pagaOraria || 25,
      costoTotale: parseFloat(editingTimesheet.value.ore) * (dipendente.pagaOraria || 25),
      fonte: 'manuale',
      updatedAt: new Date().toISOString()
    }

    // 🔧 DOPPIA VALIDAZIONE: centralizzata + esistente
    const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
    
    if (!timesheetValidation.isValid) {
      throw new Error(`Dati non validi: ${timesheetValidation.errors.join(', ')}`)
    }

    if (timesheetValidation.warnings.length > 0) {
      console.warn('⚠️ UPDATE TIMESHEET warnings:', timesheetValidation.warnings)
    }

    // Valida anche con il metodo esistente
    await validateTimesheet(timesheetValidation.correctedData)

    // Aggiorna in Firestore
    const result = await firestoreStore.updateDocument('timesheet', editingTimesheet.value.id, timesheetValidation.correctedData)
    
    if (result.success) {
      // Ricarica i timesheet
      await loadTimesheet()
      
      closeEditTimesheetModal()
      success('Ore Aggiornate', `Timesheet per ${dipendente?.nome} ${dipendente?.cognome} aggiornato con successo!`)
    } else {
      throw new Error(result.error || 'Errore sconosciuto')
    }
  } catch (err) {
    console.error('Errore aggiornamento timesheet:', err)
    error('Errore Aggiornamento', err.message)
  }
}

const deleteTimesheetEntry = async (entry) => {
  // Verifica che sia una registrazione manuale
  if (entry.fonte !== 'manuale') {
    warning('Eliminazione Non Permessa', 'Puoi eliminare solo le registrazioni inserite manualmente. Le registrazioni auto-generate dal Giornale Cantiere non possono essere eliminate.')
    return
  }

  try {
    const dipendente = dipendenti.value.find(d => d.id === entry.dipendenteId)
    if (!dipendente) {
      error('Errore', 'Dipendente non trovato')
      return
    }

    const confermato = await confirm(
      'Elimina Registrazione',
      `Sei sicuro di voler eliminare la registrazione di ${entry.ore || entry.oreLavorate}h per ${dipendente.nome} ${dipendente.cognome} del ${formatDate(entry.data)}?\n\nQuesta azione non può essere annullata.`
    )

    if (confermato) {
      const result = await firestoreStore.deleteDocument('timesheet', entry.id)
      
      if (result.success) {
        // Ricarica i timesheet
        await loadTimesheet()
        
        success('Registrazione Eliminata', `Timesheet per ${dipendente.nome} ${dipendente.cognome} eliminato con successo!`)
      } else {
        throw new Error(result.error || 'Errore sconosciuto')
      }
    }
  } catch (err) {
    console.error('Errore eliminazione timesheet:', err)
    error('Errore Eliminazione', err.message)
  }
}

const closeEditTimesheetModal = () => {
  showEditTimesheetModal.value = false
  editingTimesheet.value = {
    id: null,
    dipendenteId: '',
    data: '',
    ore: '',
    cantiere: '',
    note: '',
    orarioInizio: '08:00',
    orarioFine: '17:00'
  }
  editingTimesheetDipendenteName.value = ''
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedDipendente.value = null
}

// Funzioni per gestione presenze
const getPresenza = async (dipendenteId) => {
  const key = `${selectedDate.value}-${dipendenteId}`
  
  try {
    // Se la presenza è già in memoria, la restituiamo
    if (presenze.value[key]) {
      return presenze.value[key]
    }

    // Proviamo a caricare la presenza da Firestore
    const result = await firestoreStore.getDocument('presenze', key)
    
    if (result.success && result.data) {
      // Se trovata in Firestore, la salviamo in memoria e la restituiamo
      presenze.value[key] = result.data
      return presenze.value[key]
    }

    // Se non trovata, creiamo un nuovo record di default
    presenze.value[key] = {
      entrata: '08:00',
      uscita: '17:00',
      pausa: 60,
      stato: 'presente',
      note: '',
      dipendenteId,
      data: selectedDate.value,
      oreTotali: 0,
      createdAt: new Date().toISOString()
    }

    return presenze.value[key]
  } catch (error) {
    console.error('Errore caricamento presenza:', error)
    // Restituiamo un record di default in caso di errore
    return {
      entrata: '08:00',
      uscita: '17:00',
      pausa: 60,
      stato: 'presente',
      note: '',
      dipendenteId,
      data: selectedDate.value,
      oreTotali: 0,
      createdAt: new Date().toISOString()
    }
  }
}

const savePresenza = async (dipendenteId) => {
  const key = `${selectedDate.value}-${dipendenteId}`
  const presenza = presenze.value[key]
  
  // Validazione base
  if (!presenza.entrata || !presenza.uscita) {
    error('Errore', 'Orario entrata e uscita obbligatori')
    return false
  }
  
  // Converti orari in minuti per confronto
  const entrata = presenza.entrata.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
  const uscita = presenza.uscita.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
  
  // Validazioni orari
  if (entrata >= uscita) {
    error('Errore', 'L\'orario di uscita deve essere successivo all\'entrata')
    return false
  }
  
  if (presenza.pausa < 0 || presenza.pausa > 120) {
    error('Errore', 'La pausa deve essere tra 0 e 120 minuti')
    return false
  }
  
  try {
    // Salva la presenza in Firestore
    const presenzaResult = await firestoreStore.createDocument('presenze', {
      ...presenza,
      id: key,
      updatedAt: new Date().toISOString()
    })
    
    if (presenzaResult.success) {
      // Calcola le ore effettive considerando la pausa
      const oreEffettive = ((uscita - entrata) / 60) - (presenza.pausa / 60)
      
      // 🔧 VALIDAZIONE CENTRALIZZATA per timesheet da presenza
      const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')
      
      const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
      const timesheetDataRaw = {
        dipendenteId: dipendenteId,
        data: selectedDate.value,
        cantiere: dipendente?.cantiereAttuale || 'Non Assegnato',
        ore: oreEffettive,
        orarioInizio: presenza.entrata,
        orarioFine: presenza.uscita,
        note: presenza.note || 'Generato da registro presenze',
        costoOrario: dipendente?.pagaOraria || 25,
        costoTotale: oreEffettive * (dipendente?.pagaOraria || 25),
        fonte: 'presenze',
        presenzaId: key,
        createdAt: new Date().toISOString()
      }

      const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
      
      if (!timesheetValidation.isValid) {
        throw new Error(`Timesheet presenza non valido: ${timesheetValidation.errors.join(', ')}`)
      }

      if (timesheetValidation.warnings.length > 0) {
        console.warn('⚠️ TIMESHEET PRESENZA warnings:', timesheetValidation.warnings)
      }

      // Salva il timesheet in Firestore
      const timesheetResult = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)
      
      if (timesheetResult.success) {
        // Ricarica i timesheet
        await loadTimesheet()
        success('Presenza Salvata', `Presenza e timesheet di ${selectedDate.value} salvati con successo`)
        return true
      } else {
        throw new Error(timesheetResult.error || 'Errore salvataggio timesheet')
      }
    } else {
      throw new Error(presenzaResult.error || 'Errore sconosciuto')
    }
  } catch (error) {
    console.error('Errore salvataggio presenza/timesheet:', error)
    error('Errore', `Impossibile salvare: ${error.message}`)
    return false
  }
}

// Funzione per salvare tutte le presenze del giorno
const saveAllPresenze = async () => {
  let tuttoOk = true
  
  for (const dipendente of dipendenti.value) {
    const presenza = getPresenzaComputed(dipendente.id)
    if (!(await savePresenza(dipendente.id, presenza))) {
      tuttoOk = false
      break
    }
  }
  
  if (tuttoOk) {
    success('Presenze Salvate', 'Tutte le presenze sono state salvate con successo!')
  }
}

const calcolaOreTotali = (dipendenteId) => {
  // Calcola le ore oggi basandosi sui timesheet reali
  const oggi = new Date().toISOString().split('T')[0]
  
  const oreOggi = timesheetDettagli.value
    .filter(t => t.dipendenteId === dipendenteId && t.data === oggi)
    .reduce((total, t) => total + (t.ore || 0), 0)
  
  return Math.round(oreOggi * 2) / 2 // Arrotonda a 0.5
}

const markAllPresent = () => {
  dipendenti.value.forEach(dipendente => {
    const presenza = getPresenzaComputed(dipendente.id)
    presenza.stato = 'presente'
    presenza.entrata = '08:00'
    presenza.uscita = '17:00'
    presenza.pausa = 60
  })
  success('Presenze Aggiornate', 'Tutti i dipendenti sono stati segnati come presenti!')
}

const getRiepilogoPresenze = () => {
  let presenti = 0
  let assenti = 0
  let ferie = 0
  let malattia = 0
  let oreTotali = 0
  
  dipendenti.value.forEach(dipendente => {
    const presenza = getPresenzaComputed(dipendente.id)
    switch (presenza.stato) {
      case 'presente':
        presenti++
        oreTotali += calcolaOreTotali(dipendente.id)
        break
      case 'assente':
        assenti++
        break
      case 'ferie':
        ferie++
        break
      case 'malattia':
        malattia++
        break
    }
  })
  
  return { presenti, assenti, ferie, malattia, oreTotali }
}



const closeScheduleModal = () => {
  showScheduleModal.value = false
  selectedDipendente.value = null
}

// Inizializzazione del componente
onMounted(async () => {
  try {
    console.log('🚀 Inizializzazione pagina Personale...')
    
    // STEP 1: Carica cantieri da Firestore
    console.log('1️⃣ Caricamento cantieri...')
    await loadCantieri()
    
    // STEP 2: Carica dipendenti da Firestore (include anche timesheet)
    console.log('2️⃣ Caricamento dipendenti e timesheet...')
    await loadDipendenti()
    console.log(`👥 Dipendenti caricati: ${dipendenti.value.length}`)
    console.log(`📊 Timesheet caricati: ${timesheetDettagli.value.length}`)
    
    // STEP 3: Forza aggiornamento anche se non ci sono timesheet
    console.log('3️⃣ Aggiornamento forzato dati...')
    updateDipendentiOreFromTimesheet()
    
    // STEP 4: Debug finale dello stato
    console.log('📊 Stato finale caricamento:')
    console.log(`  - Dipendenti: ${dipendenti.value.length}`)
    console.log(`  - Timesheet dettagli: ${timesheetDettagli.value.length}`)
    console.log(`  - Timesheet data: ${timesheetData.value.length}`)
    console.log(`  - Stats ore settimana: ${stats.value.oreSettimana}`)
    console.log(`  - Stats presenti oggi: ${stats.value.presentiOggi}`)
    
    console.log('✅ Inizializzazione pagina Personale completata')
    
  } catch (error) {
    console.error('❌ Errore durante inizializzazione pagina Personale:', error)
    error('Errore Inizializzazione', 'Impossibile caricare tutti i dati della pagina Personale')
  }
})

// Funzione di utilità per il calendario
const getCalendarDays = (date) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

const calendarDays = computed(() => {
  if (!timesheetDettagli.value || timesheetDettagli.value.length === 0) {
    return getCalendarDays(new Date(selectedDate.value)).map(day => ({
      date: day,
      dateStr: format(day, 'yyyy-MM-dd'),
      isWeekend: getDay(day) === 0 || getDay(day) === 6,
      stats: {
        dipendentiPresenti: 0,
        oreTotali: 0,
        costoTotale: 0
      },
      dipendenti: []
    }))
  }

  const days = getCalendarDays(new Date(selectedDate.value))
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const timesheetDelGiorno = timesheetDettagli.value.filter(t => t.data === dateStr)
    
    const dipendentiMap = new Map()

    timesheetDelGiorno.forEach(t => {
      const dipendente = dipendenti.value.find(d => d.id === t.dipendenteId)
      if (!dipendente) return

      if (!dipendentiMap.has(t.dipendenteId)) {
        dipendentiMap.set(t.dipendenteId, {
          id: t.dipendenteId,
          nome: `${dipendente.nome} ${dipendente.cognome}`,
          iniziali: dipendente.iniziali,
          ore: 0,
          costo: 0
        })
      }
      const empData = dipendentiMap.get(t.dipendenteId)
      empData.ore += (t.ore || t.oreLavorate || 0)
      empData.costo += (t.costoTotale || 0)
    })

    const dipendentiLavoranti = Array.from(dipendentiMap.values())

    const stats = {
      dipendentiPresenti: dipendentiLavoranti.length,
      oreTotali: dipendentiLavoranti.reduce((sum, d) => sum + d.ore, 0),
      costoTotale: timesheetDelGiorno.reduce((sum, t) => sum + (t.costoTotale || 0), 0)
    }

    return {
      date: day,
      dateStr,
      isWeekend: getDay(day) === 0, // Solo Domenica è weekend
      stats,
      dipendenti: dipendentiLavoranti
    }
  })
})

const calendarWeeks = computed(() => {
  const days = calendarDays.value
  const weeks = []
  let week = Array(7).fill(null)
  
  days.forEach(day => {
    const dayIndex = getDay(day.date)
    week[dayIndex] = day
    if (dayIndex === 6) {
      weeks.push(week)
      week = Array(7).fill(null)
    }
  })
  if (week.some(d => d)) {
    weeks.push(week)
  }
  return weeks
})

const deleteDipendente = async (dipendente) => {
  const confirmed = await confirm('Eliminare Dipendente', `Sei sicuro di voler eliminare ${dipendente.nome} ${dipendente.cognome}? Questa operazione non può essere annullata.`)
  if (confirmed) {
    try {
      const result = await firestoreStore.deleteDocument('dipendenti', dipendente.id)
      
      if (result.success) {
        // Ricarica dipendenti
        await loadDipendenti()
        success('Dipendente Eliminato', `${dipendente.nome} ${dipendente.cognome} eliminato con successo!`)
      } else {
        throw new Error(result.error || 'Errore sconosciuto')
      }
    } catch (err) {
      console.error('Errore eliminazione dipendente:', err)
      error('Errore Eliminazione', `Impossibile eliminare il dipendente: ${err.message}`)
    }
  }
}

// 🚀 NUOVA: Controllo coerenza tra presenze e timesheet
const checkPresenceTimesheetCoherence = async () => {
  try {
    console.log('🔍 Inizio controllo coerenza presenze-timesheet...')
    
    // Carica tutte le presenze
    const presenzeResult = await firestoreStore.loadCollection('presenze')
    if (!presenzeResult.success) {
      console.warn('⚠️ Impossibile caricare presenze per controllo coerenza')
      return
    }

    const listaIncoerenze = []
    const presenzeFiltrate = presenzeResult.data || []

    // Raggruppa timesheet e presenze per dipendente e data
    const dataMap = new Map()

    // Aggiungi timesheet alla mappa
    timesheetDettagli.value.forEach(timesheet => {
      const key = `${timesheet.dipendenteId}-${timesheet.data}`
      if (!dataMap.has(key)) {
        dataMap.set(key, { timesheet: [], presenze: [] })
      }
      dataMap.get(key).timesheet.push(timesheet)
    })

    // Aggiungi presenze alla mappa
    presenzeFiltrate.forEach(presenza => {
      const key = `${presenza.dipendenteId}-${presenza.data}`
      if (!dataMap.has(key)) {
        dataMap.set(key, { timesheet: [], presenze: [] })
      }
      dataMap.get(key).presenze.push(presenza)
    })

    // Controlla coerenza per ogni combinazione dipendente-data
    for (const [key, data] of dataMap.entries()) {
      const [dipendenteId, dataStr] = key.split('-')
      const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
      
      if (!dipendente) continue

      const timesheetGiorno = data.timesheet
      const presenzeGiorno = data.presenze

      // Caso 1: Timesheet senza presenza
      if (timesheetGiorno.length > 0 && presenzeGiorno.length === 0) {
        const oreTotali = timesheetGiorno.reduce((sum, t) => sum + (t.ore || t.oreLavorate || 0), 0)
        if (oreTotali > 0) {
          listaIncoerenze.push({
            tipo: 'timesheet_senza_presenza',
            dipendente: `${dipendente.nome} ${dipendente.cognome}`,
            data: dataStr,
            dettaglio: `${oreTotali}h in timesheet ma nessuna presenza registrata`,
            gravita: 'alta'
          })
        }
      }

      // Caso 2: Presenza senza timesheet
      if (presenzeGiorno.length > 0 && timesheetGiorno.length === 0) {
        const presenzeAttive = presenzeGiorno.filter(p => p.stato === 'presente')
        if (presenzeAttive.length > 0) {
          listaIncoerenze.push({
            tipo: 'presenza_senza_timesheet',
            dipendente: `${dipendente.nome} ${dipendente.cognome}`,
            data: dataStr,
            dettaglio: 'Presenza registrata ma nessun timesheet',
            gravita: 'media'
          })
        }
      }

      // Caso 3: Ore timesheet vs ore calcolate da presenza
      if (timesheetGiorno.length > 0 && presenzeGiorno.length > 0) {
        const oreTimesheet = timesheetGiorno.reduce((sum, t) => sum + (t.ore || t.oreLavorate || 0), 0)
        
        presenzeGiorno.forEach(presenza => {
          if (presenza.stato === 'presente' && presenza.orarioInizio && presenza.orarioFine) {
            const oreCalcolate = presenza.oreEffettive || calcolaOreDaOrari(presenza.orarioInizio, presenza.orarioFine, presenza.pausa || 0)
            const differenza = Math.abs(oreTimesheet - oreCalcolate)
            
            if (differenza > 0.5) { // Tolleranza di 30 minuti
              listaIncoerenze.push({
                tipo: 'ore_non_corrispondenti',
                dipendente: `${dipendente.nome} ${dipendente.cognome}`,
                data: dataStr,
                dettaglio: `Timesheet: ${oreTimesheet}h vs Presenza: ${oreCalcolate}h (diff: ${differenza.toFixed(1)}h)`,
                gravita: 'media'
              })
            }
          }
        })
      }
    }

    // Aggiorna variabili reattive per l'interfaccia
    incoerenze.value = listaIncoerenze
    ultimoControlloCount.value = dataMap.size
    
    // Mostra risultati controllo
    if (listaIncoerenze.length === 0) {
      console.log('✅ Controllo coerenza completato: nessuna incoerenza trovata')
    } else {
      console.warn(`⚠️ Trovate ${listaIncoerenze.length} incoerenze:`)
      
      // Raggruppa per gravità
      const incoerenzGravi = listaIncoerenze.filter(i => i.gravita === 'alta')
      const incoerenzMedie = listaIncoerenze.filter(i => i.gravita === 'media')
      
      if (incoerenzGravi.length > 0) {
        console.error('❌ Incoerenze GRAVI:')
        incoerenzGravi.forEach(inc => console.error(`  - ${inc.dipendente} (${inc.data}): ${inc.dettaglio}`))
      }
      
      if (incoerenzMedie.length > 0) {
        console.warn('⚠️ Incoerenze MEDIE:')
        incoerenzMedie.forEach(inc => console.warn(`  - ${inc.dipendente} (${inc.data}): ${inc.dettaglio}`))
      }
      
      // Mostra popup di riepilogo migliorato
      const messaggioRiepilogo = `Trovate ${listaIncoerenze.length} incoerenze:\n` +
        (incoerenzGravi.length > 0 ? `• ${incoerenzGravi.length} gravi\n` : '') +
        (incoerenzMedie.length > 0 ? `• ${incoerenzMedie.length} medie\n` : '') +
        '\nVai al tab "Controlli" per visualizzarle e risolverle.'
      
      warning('Incoerenze Rilevate', messaggioRiepilogo)
    }

    return listaIncoerenze

  } catch (error) {
    console.error('❌ Errore controllo coerenza presenze-timesheet:', error)
    return []
  }
}

// Helper per calcolare ore da orari
const calcolaOreDaOrari = (orarioInizio, orarioFine, pausaMinuti = 0) => {
  try {
    const [inizioOre, inizioMin] = orarioInizio.split(':').map(Number)
    const [fineOre, fineMin] = orarioFine.split(':').map(Number)
    
    const inizioTotaleMin = inizioOre * 60 + inizioMin
    const fineTotaleMin = fineOre * 60 + fineMin
    
    const differenzaMin = fineTotaleMin - inizioTotaleMin - pausaMinuti
    return Math.max(0, differenzaMin / 60)
  } catch (error) {
    console.error('Errore calcolo ore da orari:', error)
    return 0
  }
}


// Computed per le presenze
const presenzeComputed = computed(() => {
  const result = {}
  dipendenti.value.forEach(dipendente => {
    const key = `${selectedDate.value}-${dipendente.id}`
    result[key] = presenze.value[key] || {
      entrata: '08:00',
      uscita: '17:00',
      pausa: 60,
      stato: 'presente',
      note: '',
      dipendenteId: dipendente.id,
      data: selectedDate.value,
      oreTotali: 0,
      createdAt: new Date().toISOString()
    }
  })
  return result
})

// Funzione per ottenere la presenza dal computed
const getPresenzaComputed = (dipendenteId) => {
  const key = `${selectedDate.value}-${dipendenteId}`
  return presenzeComputed.value[key]
}

// 🚀 NUOVE: Funzioni per gestire il tab Controlli

/**
 * Esegue il controllo di coerenza manualmente
 */
const runCoherenceCheck = async () => {
  try {
    controlloInCorso.value = true
    console.log('🔄 Esecuzione controllo coerenza manuale...')
    
    // Esegui il controllo
    await checkPresenceTimesheetCoherence()
    
    // Mostra risultato
    if (incoerenze.value.length === 0) {
      success('Controllo Completato', 'Nessuna incoerenza rilevata. Tutto in ordine!')
    } else {
      const gravi = incoerenze.value.filter(i => i.gravita === 'alta').length
      const medie = incoerenze.value.filter(i => i.gravita === 'media').length
      warning('Controllo Completato', `Rilevate ${incoerenze.value.length} incoerenze (${gravi} gravi, ${medie} medie)`)
    }
    
  } catch (error) {
    console.error('❌ Errore controllo coerenza manuale:', error)
    error('Errore Controllo', 'Impossibile eseguire il controllo di coerenza')
  } finally {
    controlloInCorso.value = false
  }
}

/**
 * Risolve un'incoerenza specifica
 */
const risolviIncoerenza = async (incoerenza) => {
  try {
    console.log('🔧 Risoluzione incoerenza:', incoerenza)
    
    const dipendente = dipendenti.value.find(d => `${d.nome} ${d.cognome}` === incoerenza.dipendente)
    if (!dipendente) {
      throw new Error('Dipendente non trovato')
    }
    
    let messaggioRisoluzione = ''
    let azioneRisoluzione = null
    
    // Determina l'azione di risoluzione in base al tipo di incoerenza
    switch (incoerenza.tipo) {
      case 'timesheet_senza_presenza':
        messaggioRisoluzione = `Vuoi creare automaticamente una presenza per ${dipendente.nome} ${dipendente.cognome} il ${formatDate(incoerenza.data)}?`
        azioneRisoluzione = async () => {
          // Crea presenza automatica basata sul timesheet
          const timesheetGiorno = timesheetDettagli.value.filter(t => 
            t.dipendenteId === dipendente.id && t.data === incoerenza.data
          )
          
          if (timesheetGiorno.length > 0) {
            const oreTotali = timesheetGiorno.reduce((sum, t) => sum + (t.ore || 0), 0)
            const presenzaData = {
              dipendenteId: dipendente.id,
              data: incoerenza.data,
              stato: 'presente',
              orarioInizio: '08:00',
              orarioFine: `${Math.floor(8 + oreTotali)}:00`,
              pausa: 60,
              oreEffettive: oreTotali,
              note: 'Presenza generata automaticamente da timesheet',
              fonte: 'risoluzione_automatica'
            }
            
            const result = await firestoreStore.createDocument('presenze', presenzaData)
            if (!result.success) {
              throw new Error(result.error || 'Errore creazione presenza')
            }
          }
        }
        break
        
      case 'presenza_senza_timesheet':
        messaggioRisoluzione = `Vuoi creare automaticamente un timesheet per ${dipendente.nome} ${dipendente.cognome} il ${formatDate(incoerenza.data)}?`
        azioneRisoluzione = async () => {
          // Crea timesheet automatico basato sulla presenza
          const presenzeResult = await firestoreStore.loadCollection('presenze', [
            ['dipendenteId', '==', dipendente.id],
            ['data', '==', incoerenza.data]
          ])
          
          if (presenzeResult.success && presenzeResult.data?.length > 0) {
            const presenza = presenzeResult.data[0]
            const oreEffettive = presenza.oreEffettive || 8 // Default 8 ore
            
            // 🔧 VALIDAZIONE CENTRALIZZATA per risoluzione automatica
            const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')
            
            const timesheetDataRaw = {
              dipendenteId: dipendente.id,
              data: incoerenza.data,
              cantiere: dipendente.cantiereAttuale || 'Non Assegnato',
              ore: oreEffettive,
              orarioInizio: presenza.orarioInizio || '08:00',
              orarioFine: presenza.orarioFine || '17:00',
              note: 'Timesheet generato automaticamente da presenza',
              costoOrario: dipendente.pagaOraria || 25,
              costoTotale: oreEffettive * (dipendente.pagaOraria || 25),
              fonte: 'risoluzione_automatica'
            }
            
            const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
            
            if (!timesheetValidation.isValid) {
              throw new Error(`Timesheet risoluzione automatica non valido: ${timesheetValidation.errors.join(', ')}`)
            }

            if (timesheetValidation.warnings.length > 0) {
              console.warn('⚠️ TIMESHEET RISOLUZIONE warnings:', timesheetValidation.warnings)
            }
            
            const result = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)
            if (!result.success) {
              throw new Error(result.error || 'Errore creazione timesheet')
            }
          }
        }
        break
        
      case 'ore_non_corrispondenti':
        messaggioRisoluzione = `Incoerenza nelle ore per ${dipendente.nome} ${dipendente.cognome} il ${formatDate(incoerenza.data)}. Questa richiede verifica manuale.`
        azioneRisoluzione = async () => {
          // Apri modal per modifica manuale
          selectedDipendente.value = dipendente
          showDetailModal.value = true
        }
        break
        
      default:
        throw new Error(`Tipo di incoerenza non gestito: ${incoerenza.tipo}`)
    }
    
    // Chiedi conferma
    const confermato = await confirm('Risolvi Incoerenza', messaggioRisoluzione)
    
    if (confermato && azioneRisoluzione) {
      await azioneRisoluzione()
      
      // Rimuovi l'incoerenza dalla lista
      incoerenze.value = incoerenze.value.filter(i => 
        !(i.dipendente === incoerenza.dipendente && i.data === incoerenza.data && i.tipo === incoerenza.tipo)
      )
      
      // Ricarica i dati
      await loadTimesheet()
      
      success('Incoerenza Risolta', `Incoerenza per ${dipendente.nome} ${dipendente.cognome} risolta con successo!`)
    }
    
  } catch (error) {
    console.error('❌ Errore risoluzione incoerenza:', error)
    error('Errore Risoluzione', `Impossibile risolvere l'incoerenza: ${error.message}`)
  }
}

/**
 * Ignora un'incoerenza (la rimuove dalla lista senza risolverla)
 */
const ignoraIncoerenza = async (incoerenza) => {
  try {
    const confermato = await confirm(
      'Ignora Incoerenza', 
      `Sei sicuro di voler ignorare questa incoerenza per ${incoerenza.dipendente} del ${formatDate(incoerenza.data)}? L'incoerenza rimarrà nel sistema ma non sarà più mostrata.`
    )
    
    if (confermato) {
      // Rimuovi l'incoerenza dalla lista
      incoerenze.value = incoerenze.value.filter(i => 
        !(i.dipendente === incoerenza.dipendente && i.data === incoerenza.data && i.tipo === incoerenza.tipo)
      )
      
      success('Incoerenza Ignorata', 'L\'incoerenza è stata rimossa dalla lista')
    }
    
  } catch (error) {
    console.error('❌ Errore ignorando incoerenza:', error)
    error('Errore', 'Impossibile ignorare l\'incoerenza')
  }
}

// Funzione per gestire il popover
const showDayDetails = async (day, event) => {
  if (popoverTimeout.value) clearTimeout(popoverTimeout.value)
  if (day && day.dipendenti && day.dipendenti.length > 0) {
    hoveredDayDetails.value = day
    popoverVisible.value = true
    
    await nextTick()
    
    if (popoverRef.value) {
      const popoverRect = popoverRef.value.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let top = event.clientY + 10
      let left = event.clientX + 10

      // Controlla se sfora a destra
      if (left + popoverRect.width > viewportWidth) {
        left = event.clientX - popoverRect.width - 10
      }
      
      // Controlla se sfora in basso
      if (top + popoverRect.height > viewportHeight) {
        top = event.clientY - popoverRect.height - 10
      }
      
      // Assicura che non vada fuori a sinistra o in alto
      if (left < 10) left = 10
      if (top < 10) top = 10

      popoverPosition.value = { top: `${top}px`, left: `${left}px` }
    }
  }
}

const hideDayDetails = () => {
  popoverTimeout.value = setTimeout(() => {
    popoverVisible.value = false
  }, 200)
}

const onPopoverEnter = () => {
  if (popoverTimeout.value) clearTimeout(popoverTimeout.value)
}
</script> 