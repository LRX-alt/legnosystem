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
            <option value="manovale">Manovale</option>
            <option value="commerciale">Commerciale</option>
            <option value="tecnico">Tecnico</option>
            <option value="altro">Altro</option>
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
            {{ getIniziali(dipendente.nome, dipendente.cognome) }}
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
              <span class="font-medium">{{ (dipendente.oreTotaliSettimana || 0) }}h</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${Math.min(((dipendente.oreTotaliSettimana || 0) / 44) * 100, 100)}%`"></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Target: 44h/settimana (6 giorni lavorativi)
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
              {{ getIniziali(record.nome.split(' ')[0], record.nome.split(' ')[1]) }}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-base">{{ record.nome }}</h4>
              <p class="text-base text-gray-600">{{ record.cantiere }}</p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold" :class="record.totale >= 44 ? 'text-green-600' : 'text-gray-900'">
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
                      {{ getIniziali(record.nome.split(' ')[0], record.nome.split(' ')[1]) }}
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
                  <span class="text-base font-semibold" :class="record.totale >= 44 ? 'text-green-600' : 'text-gray-900'">
                    {{ record.totale }}h
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista Dettagliata Timesheet -->
      <div class="mt-8">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Dettaglio Registrazioni Ore</h4>
        
        <!-- Filtri per la lista dettagliata -->
        <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mb-4">
          <select v-model="selectedDipendenteFilter" class="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-base">
            <option value="">Tutti i dipendenti</option>
            <option v-for="dipendente in dipendenti" :key="dipendente.id" :value="dipendente.id">
              {{ dipendente.nome }} {{ dipendente.cognome }}
            </option>
          </select>
          <select v-model="selectedCantiereFilter" class="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-base">
            <option value="">Tutti i cantieri</option>
            <option v-for="cantiere in cantieriDisponibili" :key="cantiere" :value="cantiere">
              {{ cantiere }}
            </option>
          </select>
          <input
            v-model="selectedTimesheetDateFilter"
            type="date"
            class="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
            placeholder="Filtra per data"
          />
          <button @click="clearTimesheetFilters" class="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-base hover:bg-gray-200 transition-colors">
            🔄 Pulisci Filtri
          </button>
          <button @click="syncWithWeekFilter" class="w-full sm:w-auto px-4 py-2 bg-primary-100 text-primary-700 border border-primary-300 rounded-lg text-base hover:bg-primary-200 transition-colors">
            📅 Usa Settimana Selezionata
          </button>
        </div>

        <!-- Tabella dettagliata timesheet -->
        <div class="card">
          <!-- Indicatore risultati filtrati -->
          <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                Mostrando <span class="font-medium">{{ filteredTimesheetList.length }}</span> 
                di <span class="font-medium">{{ timesheetDettagli.length }}</span> registrazioni
                <span v-if="selectedDipendenteFilter || selectedCantiereFilter || selectedTimesheetDateFilter" class="text-blue-600">
                  (filtrate)
                </span>
              </p>
              <div v-if="selectedDipendenteFilter || selectedCantiereFilter || selectedTimesheetDateFilter" class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">Filtri attivi:</span>
                <span v-if="selectedDipendenteFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getDipendenteNome(selectedDipendenteFilter) }}
                </span>
                <span v-if="selectedCantiereFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ selectedCantiereFilter }}
                </span>
                <span v-if="selectedTimesheetDateFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ selectedTimesheetDateFilter.includes('week-') ? 
                     `Settimana ${selectedTimesheetDateFilter.replace('week-', '')}` : 
                     formatDate(selectedTimesheetDateFilter) }}
                </span>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dipendente</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ore</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="timesheet in filteredTimesheetList" :key="timesheet.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {{ getDipendenteIniziali(timesheet.dipendenteId) }}
                      </div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ getDipendenteNome(timesheet.dipendenteId) }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(timesheet.data) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ timesheet.cantiere || timesheet.cantiereNome || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ timesheet.ore || timesheet.oreLavorate || 0 }}h
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{{ (timesheet.costoTotale || 0).toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          :class="timesheet.fonte === 'manuale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                      {{ timesheet.fonte === 'manuale' ? 'Manuale' : 'Presenze' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button @click="editTimesheet(timesheet)" 
                              class="text-primary-600 hover:text-primary-900"
                              title="Modifica timesheet">
                        <PencilIcon class="w-4 h-4" />
                      </button>
                      <button @click="deleteTimesheet(timesheet)" 
                              class="text-red-600 hover:text-red-900"
                              title="Elimina timesheet">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Messaggio se nessun timesheet -->
          <div v-if="filteredTimesheetList.length === 0" class="text-center py-8">
            <p class="text-gray-500">Nessuna registrazione ore trovata per i filtri selezionati.</p>
          </div>
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
                {{ getIniziali(dipendente.nome, dipendente.cognome) }}
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 text-base">{{ dipendente.nome }} {{ dipendente.cognome }}</h4>
                <p class="text-base text-gray-600">{{ getRuoloLabel(dipendente.ruolo, dipendente.ruoloPersonalizzato) }}</p>
                <p class="text-sm text-gray-500">{{ dipendente.cantiereAttuale || 'Nessun cantiere' }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Ora entrata -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Entrata</p>
                <input
                  v-model="presenze[dipendente.id].entrata"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Ora uscita -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Uscita</p>
                <input
                  v-model="presenze[dipendente.id].uscita"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Pausa -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Pausa (min)</p>
                <input
                  v-model.number="presenze[dipendente.id].pausa"
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
                  v-model="presenze[dipendente.id].stato"
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
                {{ getIniziali(dipendente.nome, dipendente.cognome) }}
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-base">{{ dipendente.nome }} {{ dipendente.cognome }}</h4>
                <p class="text-base text-gray-600">{{ getRuoloLabel(dipendente.ruolo, dipendente.ruoloPersonalizzato) }}</p>
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
                  v-model="presenze[dipendente.id].entrata"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Uscita</label>
                <input
                  v-model="presenze[dipendente.id].uscita"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Pausa (min)</label>
                <input
                  v-model.number="presenze[dipendente.id].pausa"
                  type="number"
                  min="0"
                  max="120"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Stato</label>
                <select
                  v-model="presenze[dipendente.id].stato"
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
              v-model="presenze[dipendente.id].note"
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
                  <option value="manovale">Manovale</option>
                  <option value="commerciale">Commerciale</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              <div v-if="newDipendente.ruolo === 'altro'">
                <label class="block text-base font-medium text-gray-700 mb-2">Ruolo Personalizzato *</label>
                <input v-model="newDipendente.ruoloPersonalizzato" type="text" required
                       placeholder="Specifica il ruolo personalizzato"
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
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
                  {{ getIniziali(selectedDipendente?.nome, selectedDipendente?.cognome) }}
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 text-lg">{{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h4>
                  <p class="text-base text-gray-600">{{ getRuoloLabel(selectedDipendente?.ruolo, selectedDipendente?.ruoloPersonalizzato) }}</p>
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
                       :style="`width: ${Math.min(((selectedDipendente?.oreTotaliSettimana || 0) / 44) * 100, 100)}%`"></div>
                </div>
                <div class="text-xs text-blue-600 mt-1">
                  Target: 44h/settimana (6 giorni lavorativi, Lun-Sab)
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
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Azioni</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ore</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                      <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="entry in getTimesheetForDipendente(selectedDipendente?.id)" 
                        :key="entry.id" 
                        class="hover:bg-gray-50 transition-colors duration-200"
                        :class="entry.fonte === 'giornale_cantiere' ? 'bg-blue-25' : ''">
                      <!-- Azioni sticky a sinistra -->
                      <td class="px-6 py-4 whitespace-nowrap text-sm sticky left-0 bg-white z-10">
                        <div class="flex items-center space-x-2">
                          <button @click="editTimesheet(entry)" 
                                  class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                  title="Modifica registrazione">
                            <PencilIcon class="w-4 h-4" />
                          </button>
                          <button @click="deleteTimesheet(entry)" 
                                  class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  title="Elimina registrazione">
                            <TrashIcon class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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
                  <option value="manovale">Manovale</option>
                  <option value="commerciale">Commerciale</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              <div v-if="editingDipendente.ruolo === 'altro'">
                <label class="block text-base font-medium text-gray-700 mb-2">Ruolo Personalizzato *</label>
                <input v-model="editingDipendente.ruoloPersonalizzato" type="text" required
                       placeholder="Specifica il ruolo personalizzato"
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
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
                  {{ getIniziali(selectedDipendente?.nome, selectedDipendente?.cognome) }}
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 text-lg">{{ selectedDipendente?.nome }} {{ selectedDipendente?.cognome }}</h4>
                  <p class="text-base text-gray-600">{{ getRuoloLabel(selectedDipendente?.ruolo, selectedDipendente?.ruoloPersonalizzato) }}</p>
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
                    <span class="font-medium">{{ getRuoloLabel(selectedDipendente?.ruolo, selectedDipendente?.ruoloPersonalizzato) }}</span>
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
                      {{ index === 5 ? '08:00 - 12:00' : '08:00 - 17:00' }}
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
                <p class="text-sm text-gray-600">🕐 Settimana lavorativa: 6 giorni (Lun-Sab) - 44h totali</p>
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
import { useModalEsc } from '../composables/useModalEsc.js'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import { TimesheetDateValidator } from '../utils/timesheetValidation.js'
import CompleteTimesheetAuditor from '../utils/completeTimesheetAudit.js'
import { TimesheetSystemTester } from '../utils/testTimesheetSystem.js'
import { HoursCoherenceChecker } from '../utils/hoursCoherenceCheck.js'
import { HoursCoherenceCorrector } from '../utils/hoursCoherenceCorrection.js'

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



// Funzioni per gestire il popover
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
          iniziali: getIniziali(dipendente.nome, dipendente.cognome),
          ore: 0,
          costo: 0
        })
      }
      const empData = dipendentiMap.get(t.dipendenteId)
      empData.ore += (t.ore || t.oreLavorate || 0)
      empData.costo += (t.costoTotale || ((t.ore || t.oreLavorate || 0) * (t.costoOrario || dipendente.pagaOraria || 0)))
    })

    const dipendentiLavoranti = Array.from(dipendentiMap.values())

    const stats = {
      dipendentiPresenti: dipendentiLavoranti.length,
      oreTotali: dipendentiLavoranti.reduce((sum, d) => sum + d.ore, 0),
      costoTotale: timesheetDelGiorno.reduce((sum, t) => {
        const dip = dipendenti.value.find(d => d.id === t.dipendenteId)
        const costo = t.costoTotale || ((t.ore || t.oreLavorate || 0) * (t.costoOrario || dip?.pagaOraria || 0))
        return sum + costo
      }, 0)
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

// Stats - calcolate dinamicamente dai dati Firestore
const stats = computed(() => {
  const dipendentiAttivi = dipendenti.value.filter(d => d.stato === 'attivo').length
  
  // Calcola ore settimanali totali dai timesheet reali
  const oreSettimanaTotali = dipendenti.value.reduce((total, d) => total + (d.oreTotaliSettimana || 0), 0)
  
  // Calcola ore settimanali totali dai timesheet reali
  
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

// 🚀 NUOVO: Variabili per la lista dettagliata timesheet
const selectedDipendenteFilter = ref('')
const selectedCantiereFilter = ref('')
const selectedTimesheetDateFilter = ref('')

// Nuovo dipendente
const newDipendente = ref({
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  ruolo: '',
  ruoloPersonalizzato: '',
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
  note: ''
})

// Dipendente in modifica
const editingDipendente = ref({
  id: null,
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  ruolo: '',
  ruoloPersonalizzato: '',
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
  note: ''
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
    
    // Pulisci valori cached di oreTotaliSettimana per evitare flickering
    dipendenti.value.forEach(d => {
      d.oreTotaliSettimana = 0
    })
    
    console.log('✅ Dipendenti caricati da Firestore:', dipendenti.value.length)
  } catch (e) {
    console.error('❌ Errore nel caricamento dipendenti da Firestore:', e)
  }
}

// Funzioni per la gestione dei timesheet - carica da Firestore
const loadTimesheet = async (dipendenteId = null) => {
  try {
    // Carica tutti i timesheet usando il metodo dello store
    const result = await firestoreStore.loadTimesheet()
    
    if (result.success) {
      const allTimesheet = firestoreStore.timesheet || []
      
      if (dipendenteId) {
        // Filtra per dipendente specifico
        timesheetDettagli.value = allTimesheet.filter(t => t.dipendenteId === dipendenteId)
      } else {
        // Carica tutti
        timesheetDettagli.value = allTimesheet
      }
      
      // Se non ci sono timesheet, mostra suggerimento solo una volta
      if (timesheetDettagli.value.length === 0) {
        console.warn('⚠️ Nessun timesheet trovato. Vai al Giornale Cantiere per aggiungere registrazioni.')
      }
      
      // Aggiorna le ore settimanali per ogni dipendente
      updateDipendentiOreFromTimesheet()
      
      // NOTA: Controllo coerenza disabilitato nel caricamento automatico
      // Verrà eseguito solo manualmente nel tab "Controlli" per evitare modifiche non richieste
    } else {
      console.error('❌ Errore caricamento timesheet:', result.error)
    }
  } catch (e) {
    console.error('❌ Errore nel caricamento timesheet da Firestore:', e)
  }
}

// 🚀 NUOVO: Forza refresh di tutti i dati
const forceRefreshAllData = async () => {
  info('Aggiornamento...', 'Sto ricaricando tutti i dati dal server.')
  try {
    await loadDipendenti()
    await loadCantieri()
    await loadTimesheet()
    success('Dati Aggiornati', 'Tutti i dati sono stati sincronizzati.')
  } catch (err) {
    error('Errore Aggiornamento', `Impossibile aggiornare i dati: ${err.message}`)
  }
}

const debugAllTimesheetDates = () => {
  console.log('📅 DEBUG: Tutte le date dei timesheet caricati');
  const allDates = timesheetDettagli.value.map(t => ({ id: t.id, data: t.data, dipendente: t.dipendenteId }));
  console.table(allDates);
  info('Date in Console', 'Ho stampato tutte le date dei timesheet nella console del browser per il debug.');
}

const performCompleteAudit = async () => {
  const confirmed = await confirm('Avviare Audit Completo?', 'Questa operazione scansionerà l\'intero database alla ricerca di incoerenze. Potrebbe richiedere qualche minuto. Procedere?')
  if (!confirmed) return

  info('Audit in Corso', 'Scansione del database in corso...')
  try {
    const auditor = new CompleteTimesheetAuditor(firestoreStore)
    const auditResults = await auditor.performCompleteAudit()
    
    const userReport = auditor.generateUserReport()
    
    if (auditResults.problematicRecords > 0) {
      const fixConfirmed = await confirm('Problemi Rilevati', `${userReport}\n\nVuoi tentare la correzione automatica?`)
      if (fixConfirmed) {
        info('Correzione in corso', 'Applicazione delle correzioni automatiche...')
        const fixResults = await auditor.performCompleteFix()
        const finalReport = auditor.generateUserReport()
        success('Correzione Completata', finalReport)
      }
    } else {
      success('Audit Completato', userReport)
    }

  } catch (err) {
    console.error('❌ Errore durante audit completo:', err)
    error('Errore Audit', `Impossibile completare l\'audit: ${err.message}`)
  }
}

const runSystemTests = async () => {
  info('Test in Corso', 'Esecuzione dei test di validazione del sistema...')
  try {
    const tester = new TimesheetSystemTester()
    const testResults = await tester.runAllTests()
    
    const userReport = tester.generateUserReport(testResults)

    if (testResults.failedTests > 0) {
      warning('Test Parzialmente Falliti', userReport)
    } else {
      success('Test Completati', userReport)
    }
  } catch (err) {
    console.error('❌ Errore durante test sistema:', err)
    error('Errore Test', `Impossibile eseguire i test: ${err.message}`)
  }
}

// Calcola le ore settimanali per ogni dipendente
const updateDipendentiOreFromTimesheet = () => {
  // Se i timesheet non sono caricati, non aggiornare le ore per evitare di azzerarle
  if (!timesheetDettagli.value || timesheetDettagli.value.length === 0) {
    console.log('⚠️ Timesheet non caricati, salto aggiornamento ore settimanali')
    return
  }
  
  // USA SEMPRE LA SETTIMANA CORRENTE - Se non ci sono dati, mostra 0
  const today = new Date()
  // Usa sempre la settimana corrente per coerenza con il tab Riepilogo
  
  const startOfMostRecentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfMostRecentWeek = endOfWeek(today, { weekStartsOn: 1 })

  dipendenti.value.forEach(dipendente => {
    // Calcola sempre le ore dai timesheet reali
    const oreSettimanali = timesheetDettagli.value
      .filter(t => {
        if (!t.data) return false
        const tDate = new Date(t.data)
        const isInMostRecentWeek = tDate >= startOfMostRecentWeek && tDate <= endOfMostRecentWeek
        const isCorrectDipendente = t.dipendenteId === dipendente.id
        
        return isCorrectDipendente && isInMostRecentWeek
      })
      .reduce((sum, t) => sum + (t.ore || t.oreLavorate || 0), 0)
    
    // Aggiorna sempre con il valore calcolato dai timesheet
    dipendente.oreTotaliSettimana = oreSettimanali
    
    // Aggiorna sempre con il valore calcolato dai timesheet (già fatto sopra)
  })
}

// Filtra i dipendenti in base ai filtri attivi
const filteredDipendenti = computed(() => {
  return dipendenti.value.filter(dipendente => {
    const searchMatch = (dipendente.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
                         dipendente.cognome.toLowerCase().includes(searchTerm.value.toLowerCase()))
    const ruoloMatch = selectedRuolo.value ? dipendente.ruolo === selectedRuolo.value : true
    const statoMatch = selectedStato.value ? dipendente.stato === selectedStato.value : true
    return searchMatch && ruoloMatch && statoMatch
  })
})

// Gestione Modals
const closeAddModal = () => showAddModal.value = false
const closeEditModal = () => showEditModal.value = false
const closeTimesheetModal = () => {
  showTimesheetModal.value = false
  // Reset form
  newTimesheet.value = {
    dipendenteId: '',
    data: new Date().toISOString().split('T')[0],
    ore: '',
    cantiere: '',
    note: ''
  }
}
const closeDetailModal = () => showDetailModal.value = false

// Chiusura modal con ESC
const modalRefs = [showAddModal, showEditModal, showTimesheetModal, showDetailModal, showScheduleModal, showEditTimesheetModal]
const closeFunctions = [closeAddModal, closeEditModal, closeTimesheetModal, closeDetailModal, () => showScheduleModal.value = false, () => showEditTimesheetModal.value = false]
useModalEsc(modalRefs, closeFunctions)

const saveDipendente = async () => {
  try {
    await firestoreStore.addDocument('dipendenti', newDipendente.value)
    success('Dipendente Aggiunto', `${newDipendente.value.nome} ${newDipendente.value.cognome} è stato aggiunto con successo.`)
    closeAddModal()
    newDipendente.value = {
      nome: '', cognome: '', email: '', telefono: '', ruolo: '', ruoloPersonalizzato: '', pagaOraria: 25, dataAssunzione: new Date().toISOString().split('T')[0], stato: 'attivo', cantiereAttuale: '', note: ''
    }
    
    // Ricarica solo i dipendenti per aggiornare la lista
    await loadDipendenti()
    
    // Il nuovo dipendente partirà automaticamente con 0 ore
    // Non tocchiamo le ore dei dipendenti esistenti
    
  } catch (err) {
    console.error('❌ Errore salvataggio dipendente:', err)
    error('Errore Salvataggio', err.message)
  }
}

const editDipendente = (dipendente) => {
  editingDipendente.value = { ...dipendente }
  showEditModal.value = true
}

const updateDipendente = async () => {
  try {
    const { id, ...dataToUpdate } = editingDipendente.value
    await firestoreStore.updateDocument('dipendenti', id, dataToUpdate)
    success('Dipendente Aggiornato', `${dataToUpdate.nome} ${dataToUpdate.cognome} aggiornato con successo.`)
    closeEditModal()
    await loadDipendenti()
  } catch (err) {
    error('Errore Aggiornamento', err.message)
  }
}

const deleteDipendente = async (dipendente) => {
  const confirmed = await confirm(
    `Eliminare ${dipendente.nome} ${dipendente.cognome}?`,
    "Questa azione è irreversibile. Tutti i dati associati (timesheet, presenze) non saranno eliminati ma potrebbero diventare orfani."
  )
  if (confirmed) {
    try {
      await firestoreStore.deleteDocument('dipendenti', dipendente.id)
      success('Dipendente Eliminato', `${dipendente.nome} ${dipendente.cognome} è stato rimosso.`)
      await loadDipendenti()
    } catch (err) {
      error('Errore Eliminazione', err.message)
    }
  }
}

// Funzioni per la tabella Timesheet
const onWeekChange = () => {
  processTimesheetData()
}

const processTimesheetData = () => {
  const now = new Date()
  let startDate, endDate

  switch (selectedWeek.value) {
    case 'current':
      startDate = startOfWeek(now, { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
      break
    case 'last':
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      break
    case 'two-weeks':
      startDate = startOfWeek(subWeeks(now, 2), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(now, 2), { weekStartsOn: 1 })
      break
    case 'three-weeks':
      startDate = startOfWeek(subWeeks(now, 3), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(now, 3), { weekStartsOn: 1 })
      break
    case 'month':
      startDate = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(now, 4), { weekStartsOn: 1 })
      break
  }

  const filteredTimesheet = timesheetDettagli.value.filter(t => {
    const tDate = new Date(t.data)
    return tDate >= startDate && tDate <= endDate
  })

  const records = {}

  filteredTimesheet.forEach(t => {
    const dipendente = dipendenti.value.find(d => d.id === t.dipendenteId)
    if (!dipendente) return

    if (!records[t.dipendenteId]) {
      records[t.dipendenteId] = {
        dipendenteId: t.dipendenteId,
        nome: `${dipendente.nome} ${dipendente.cognome}`,
        iniziali: getIniziali(dipendente.nome, dipendente.cognome),
        cantiere: t.cantiere || t.cantiereNome || 'Non Assegnato',
        lunedi: 0, martedi: 0, mercoledi: 0, giovedi: 0, venerdi: 0, sabato: 0,
        totale: 0
      }
    }

    const dayOfWeek = getDay(new Date(t.data))
    const ore = t.ore || t.oreLavorate || 0
    records[t.dipendenteId].totale += ore

    switch (dayOfWeek) {
      case 1: records[t.dipendenteId].lunedi += ore; break
      case 2: records[t.dipendenteId].martedi += ore; break
      case 3: records[t.dipendenteId].mercoledi += ore; break
      case 4: records[t.dipendenteId].giovedi += ore; break
      case 5: records[t.dipendenteId].venerdi += ore; break
      case 6: records[t.dipendenteId].sabato += ore; break
    }
  })

  timesheetData.value = Object.values(records)
}

const getStatoColor = (stato) => {
  switch(stato) {
    case 'attivo': return 'bg-green-100 text-green-800'
    case 'in-ferie': return 'bg-blue-100 text-blue-800'
    case 'malattia': return 'bg-yellow-100 text-yellow-800'
    case 'sospeso': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatoLabel = (stato) => {
  return stato.charAt(0).toUpperCase() + stato.slice(1).replace('-', ' ')
}

// Helper per le iniziali
const getIniziali = (nome, cognome) => {
  if (!nome || !cognome) return '??'
  return `${nome[0]}${cognome[0]}`.toUpperCase()
}

const getRuoloLabel = (ruolo, ruoloPersonalizzato = '') => {
  if (!ruolo) return 'Non specificato'
  
  const labels = {
    'capo-squadra': 'Capo Squadra',
    'carpentiere': 'Carpentiere',
    'operaio': 'Operaio Specializzato',
    'amministrativo': 'Amministrativo',
    'manovale': 'Manovale',
    'commerciale': 'Commerciale',
    'tecnico': 'Tecnico',
    'altro': ruoloPersonalizzato || 'Altro'
  }
  
  return labels[ruolo] || ruolo.charAt(0).toUpperCase() + ruolo.slice(1).replace('-', ' ')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // Controlla se è un oggetto timestamp di Firestore
  if (dateString.seconds) {
    return format(new Date(dateString.seconds * 1000), 'dd/MM/yyyy')
  }
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: it })
}

const validateTimesheet = (timesheet) => {
  return new Promise((resolve, reject) => {
    if (!timesheet.dipendenteId || !timesheet.data || !timesheet.ore) {
      reject(new Error('Compilare tutti i campi obbligatori del timesheet.'))
    }
    if (timesheet.ore <= 0) {
      reject(new Error('Le ore devono essere maggiori di zero.'))
    }
    if (new Date(timesheet.data) > new Date()) {
      reject(new Error('La data del timesheet non può essere nel futuro.'))
    }
    resolve()
  })
}

const saveTimesheet = async () => {
  try {
    const dipendente = dipendenti.value.find(d => d.id === newTimesheet.value.dipendenteId)
    if (!dipendente) {
      throw new Error('Dipendente non trovato!')
    }

    // 🔒 Regola priorità fonti: Giornale Cantiere > Presenze > Manuale
    // Se esiste già una fonte prioritaria nello stesso giorno per lo stesso dipendente, chiedi conferma
    await loadTimesheet()
    const manualeData = newTimesheet.value.data
    const normalizeDate = (d) => {
      if (!d) return ''
      // Se è già nel formato YYYY-MM-DD lo ritorna, altrimenti prova a normalizzare
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
      try {
        return new Date(d).toISOString().split('T')[0]
      } catch (_) {
        return String(d)
      }
    }
    const existingSameDay = (firestoreStore.timesheet || []).filter(t => {
      const tid = t.dipendenteId || t.dipendente_id
      const tDate = normalizeDate(t.data || t.date)
      return tid === newTimesheet.value.dipendenteId && tDate === normalizeDate(manualeData)
    })
    const existsGiornale = existingSameDay.some(t => (t.fonte || '').trim() === 'giornale_cantiere')
    const existsPresenze = existingSameDay.some(t => (t.fonte || '').trim() === 'presenze')
    const existsQualsiasi = existingSameDay.length > 0
    if (existsGiornale || existsPresenze || existsQualsiasi) {
      const fontePrioritaria = existsGiornale ? 'Giornale Cantiere' : (existsPresenze ? 'Presenze' : 'Timesheet esistente')
      console.debug('[Timesheet Manuale] Conflitto rilevato:', { dipendenteId: newTimesheet.value.dipendenteId, data: manualeData, existing: existingSameDay })
      const proceed = await confirm(
        'Registrazione già presente',
        `Esiste già una registrazione (${fontePrioritaria}) per questo dipendente e giorno. Vuoi comunque creare un nuovo timesheet manuale?`
      )
      if (!proceed) {
        warning('Operazione Annullata', 'Creazione timesheet manuale annullata per evitare duplicati.')
        return
      }
    }

    const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')

    const timesheetDataRaw = {
      dipendenteId: newTimesheet.value.dipendenteId,
      data: newTimesheet.value.data,
      cantiere: newTimesheet.value.cantiere,
      ore: parseFloat(newTimesheet.value.ore),
      note: newTimesheet.value.note,
      costoOrario: dipendente.pagaOraria || 25,
      costoTotale: parseFloat(newTimesheet.value.ore) * (dipendente.pagaOraria || 25),
      fonte: 'manuale',
      createdAt: new Date().toISOString()
    }

    const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)

    if (!timesheetValidation.isValid) {
      throw new Error(`Dati non validi: ${timesheetValidation.errors.join(', ')}`)
    }

    if (timesheetValidation.warnings.length > 0) {
      console.warn('⚠️ TIMESHEET MANUALE warnings:', timesheetValidation.warnings)
      warning('Attenzione', timesheetValidation.warnings.join(', '))
    }

    const result = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)

    if (result.success) {
      // Forza un aggiornamento completo dei dati
      await loadTimesheet()
      // Aggiorna anche le ore settimanali dei dipendenti
      updateDipendentiOreFromTimesheet()
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

const viewTimesheet = (dipendente) => {
  selectedDipendente.value = dipendente
  // Assicura che le ore settimanali siano calcolate correttamente solo se necessario
  if (dipendente.oreTotaliSettimana === undefined || dipendente.oreTotaliSettimana === null) {
    // Ricarica i timesheet prima di aggiornare le ore
    loadTimesheet().then(() => {
      updateDipendentiOreFromTimesheet()
    })
  }
  showDetailModal.value = true
}

const getTimesheetForDipendente = (dipendenteId) => {
  if (!dipendenteId) return []
  return timesheetDettagli.value
    .filter(t => t.dipendenteId === dipendenteId)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
}

const getCantieriAssegnati = (dipendenteId) => {
  const cantieri = new Set()
  timesheetDettagli.value
    .filter(t => t.dipendenteId === dipendenteId && (t.cantiere || t.cantiereNome))
    .forEach(t => cantieri.add(t.cantiere || t.cantiereNome))
  return Array.from(cantieri)
}

const viewSchedule = (dipendente) => {
  selectedDipendente.value = dipendente
  showScheduleModal.value = true
}

// Funzioni Presenze
const loadPresenze = async () => {
  try {
    const result = await firestoreStore.loadPresenzeForDate(selectedDate.value)
    if (result.success) {
      const presenzeDelGiorno = result.data
      const presenzeMap = {}
      presenzeDelGiorno.forEach(p => {
        presenzeMap[p.dipendenteId] = p
      })
      
      // Merge con dipendenti per avere tutti in lista
      dipendenti.value.forEach(d => {
        if (!presenzeMap[d.id]) {
          presenzeMap[d.id] = {
            dipendenteId: d.id,
            data: selectedDate.value,
            stato: 'assente',
            entrata: '',
            uscita: '',
            pausa: 0,
            note: ''
          }
        }
      })
      presenze.value = presenzeMap
    } else {
      console.error('Errore caricamento presenze:', result.error)
    }
  } catch (err) {
    console.error('Errore in loadPresenze:', err)
  }
}

const calcolaOreTotali = (dipendenteId) => {
  const p = presenze.value[dipendenteId]
  if (!p || !p.entrata || !p.uscita) return 0

  const entrata = new Date(`1970-01-01T${p.entrata}`)
  const uscita = new Date(`1970-01-01T${p.uscita}`)
  
  if (uscita <= entrata) return 0

  let diff = (uscita - entrata) / 1000 / 60 // minuti
  diff -= (p.pausa || 0)
  
  return Math.max(0, parseFloat((diff / 60).toFixed(2)))
}

const markAllPresent = () => {
  dipendenti.value.forEach(d => {
    if (!presenze.value[d.id] || presenze.value[d.id].stato === 'assente') {
      presenze.value[d.id] = {
        ...presenze.value[d.id],
        dipendenteId: d.id,
        data: selectedDate.value,
        stato: 'presente',
        entrata: '08:00',
        uscita: '17:00',
        pausa: 60,
        note: 'Marcato presente in massa'
      }
    }
  })
  info('Tutti Presenti', 'Tutti i dipendenti sono stati segnati come presenti.')
}

const savePresenza = async (dipendenteId) => {
  try {
    const presenzaData = presenze.value[dipendenteId]
    if (!presenzaData) throw new Error('Dati presenza non trovati')

    // ⛔ Evita salvataggi inutili: presenze completamente vuote/assenti non vengono salvate
    const isEmptyAssente = (
      (presenzaData.stato === 'assente' || !presenzaData.stato) &&
      !presenzaData.entrata &&
      !presenzaData.uscita &&
      !(presenzaData.note && presenzaData.note.trim()) &&
      !(presenzaData.pausa && presenzaData.pausa > 0)
    )
    if (isEmptyAssente) {
      return
    }

    // Se è presente, calcola le ore e crea timesheet
    if (presenzaData.stato === 'presente') {
      // 🔒 Regola priorità fonti: se esiste già timesheet da Giornale Cantiere nello stesso giorno, chiedi conferma
      await loadTimesheet()
      const normalizeDate = (d) => {
        if (!d) return ''
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
        try {
          return new Date(d).toISOString().split('T')[0]
        } catch (_) {
          return String(d)
        }
      }
      // Controllo duplicati su base giorno/dipendente
      const existingSameDay = (firestoreStore.timesheet || []).filter(t => {
        const tid = t.dipendenteId || t.dipendente_id
        const tDate = normalizeDate(t.data || t.date)
        return tid === dipendenteId && tDate === normalizeDate(selectedDate.value)
      })
      const existsGiornale = existingSameDay.some(t => (t.fonte || '').trim() === 'giornale_cantiere')
      const existsAltro = existingSameDay.length > 0
      if (existsGiornale || existsAltro) {
        console.debug('[Presenze] Conflitto rilevato:', { dipendenteId, data: selectedDate.value, existing: existingSameDay })
        const proceed = await confirm(
          existsGiornale ? 'Fonte Prioritaria Presente' : 'Registrazione già presente',
          existsGiornale
            ? 'Esiste già un timesheet da Giornale Cantiere per questo dipendente e giorno. Vuoi comunque creare il timesheet da Presenze?'
            : 'Esiste già una registrazione per questo dipendente e giorno. Vuoi comunque aggiungerne una nuova da Presenze?'
        )
        if (!proceed) {
          warning('Operazione Annullata', 'Creazione timesheet da Presenze annullata per evitare duplicati.')
          return
        }
      }

      const ore = calcolaOreTotali(dipendenteId)
      if (ore <= 0) {
        warning('Ore a Zero', 'Le ore calcolate sono zero, il timesheet non verrà creato.')
        return
      }
      
      const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
      const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')
      
      const timesheetDataRaw = {
        dipendenteId: dipendenteId,
        data: selectedDate.value,
        ore: ore,
        oreLavorate: ore,
        cantiere: dipendente.cantiereAttuale || 'Sede',
        note: `Generato da presenze: ${presenzaData.note || ''}`,
        costoOrario: dipendente.pagaOraria || 25,
        costoTotale: ore * (dipendente.pagaOraria || 25),
        fonte: 'presenze',
        createdAt: new Date().toISOString()
      }
      
      const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)
      if (!timesheetValidation.isValid) {
        throw new Error(`Dati timesheet non validi: ${timesheetValidation.errors.join(', ')}`)
      }

      const timesheetResult = await firestoreStore.registraTimesheet(timesheetValidation.correctedData)
      if (!timesheetResult.success) {
        throw new Error(timesheetResult.error)
      } else {
         // Associa l'ID del timesheet creato alla presenza
        presenzaData.timesheetId = timesheetResult.id
      }
    }

    const result = await firestoreStore.savePresenza(presenzaData)
    if (result.success) {
      success('Presenza Salvata', `Presenza per ${dipendenti.value.find(d => d.id === dipendenteId)?.nome} salvata.`)
      await loadPresenze() // ricarica
      // Se è stato creato un timesheet, ricarica anche i timesheet
      if (presenzaData.stato === 'presente') {
        await loadTimesheet()
        updateDipendentiOreFromTimesheet()
      }
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    console.error(`Errore salvataggio presenza per ${dipendenteId}:`, err)
    error('Errore Salvataggio', err.message)
  }
}

const saveAllPresenze = async () => {
  // Considera solo le presenze effettivamente compilate/modificate
  const candidati = Object.values(presenze.value).filter(p => (
    p.stato === 'presente' ||
    !!p.entrata ||
    !!p.uscita ||
    (p.note && p.note.trim()) ||
    (p.pausa && p.pausa > 0) ||
    !!p.timesheetId
  ))

  if (candidati.length === 0) {
    warning('Nessuna Modifica', 'Non ci sono presenze da salvare per questa data.')
    return
  }

  info('Salvataggio in corso...', `Salvataggio di ${candidati.length} presenze modificate.`)
  const promises = candidati.map(p => savePresenza(p.dipendenteId))
  try {
    await Promise.all(promises)
    success('Salvataggio Completato', 'Tutte le presenze sono state salvate.')
    await loadPresenze() // Ricarica presenze per aggiornare riepilogo
    await loadTimesheet() // Ricarica anche i timesheet
  } catch(err) {
    error('Errore Salvataggio Multiplo', `Almeno un salvataggio è fallito: ${err.message}`)
  }
}

const getRiepilogoPresenze = () => {
  const riepilogo = {
    presenti: 0,
    assenti: 0,
    ferie: 0,
    malattia: 0,
    permesso: 0,
    oreTotali: 0
  }
  Object.values(presenze.value).forEach(p => {
    riepilogo[p.stato] = (riepilogo[p.stato] || 0) + 1
    if(p.stato === 'presente') {
      riepilogo.oreTotali += calcolaOreTotali(p.dipendenteId)
    }
  })
  riepilogo.oreTotali = parseFloat(riepilogo.oreTotali.toFixed(2))
  return riepilogo
}

// Controllo Coerenze
const checkPresenceTimesheetCoherence = async () => {
  const checker = new HoursCoherenceChecker()
  const report = await checker.executeFullCheck()

  incoerenze.value = report.issues || []
  ultimoControlloCount.value = report.summary.total_issues || 0

  if (incoerenze.value.length > 0 && activeTab.value !== 'controlli') {
    warning(
      `${incoerenze.value.length} Incoerenze Trovate`,
      'Sono state rilevate delle discrepanze tra presenze e timesheet. Vai alla sezione "Controlli" per i dettagli.'
    )
  }
}

const runCoherenceCheck = async () => {
  controlloInCorso.value = true
  info('Controllo Coerenza...', 'Analisi dei dati in corso, attendere prego.')
  try {
    await loadPresenze() // Carica le presenze per la data selezionata
    await loadTimesheet() // Assicura di avere tutti i timesheet
    await checkPresenceTimesheetCoherence()
    if (incoerenze.value.length > 0) {
      warning('Controllo Completato', `Trovate ${incoerenze.value.length} incoerenze.`)
    } else {
      success('Controllo Completato', 'Nessuna incoerenza trovata.')
    }
  } catch (err) {
    error('Errore Controllo', `Impossibile completare il controllo: ${err.message}`)
  } finally {
    controlloInCorso.value = false
  }
}

const resolveIncoherence = async (incoerenza) => {
  info('Correzione in corso...', `Applico la correzione per ${incoerenza.dipendente}...`)

  try {
    const corrector = new HoursCoherenceCorrector()
    let result

    switch(incoerenza.type) {
      case 'calculation_error':
        result = await corrector.fixCalculationError(incoerenza)
        break
      case 'field_inconsistency':
        result = await corrector.fixFieldInconsistency(incoerenza)
        break
      // Aggiungere altri casi se necessario
      default:
        throw new Error(`Tipo di incoerenza non gestito: ${incoerenza.type}`)
    }
    
    if (result.status === 'success') {
      success('Correzione Applicata', `Corretto: ${incoerenza.message}`)
      // Rimuovi l'incoerenza risolta dalla lista
      incoerenze.value = incoerenze.value.filter(i => i.recordId !== incoerenza.recordId)
      // Ricarica i dati per riflettere le modifiche
      await loadTimesheet()
      await loadPresenze()
    } else {
      throw new Error(result.error || 'Errore non specificato durante la correzione')
    }
  } catch (err) {
    error('Errore Correzione', `Impossibile applicare la correzione: ${err.message}`)
  }
}

// 🚀 NUOVO: Gestione Modifica Timesheet
const closeEditTimesheetModal = () => {
  showEditTimesheetModal.value = false
  editingTimesheet.value = { id: null, dipendenteId: '', data: '', ore: '', cantiere: '', note: '' }
  editingTimesheetDipendenteName.value = ''
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  selectedDipendente.value = null
}

const editTimesheet = (timesheet) => {
  const dipendente = dipendenti.value.find(d => d.id === timesheet.dipendenteId)
  editingTimesheetDipendenteName.value = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'N/A'
  
  editingTimesheet.value = {
    id: timesheet.id,
    dipendenteId: timesheet.dipendenteId,
    data: timesheet.data,
    ore: timesheet.ore || timesheet.oreLavorate || 0,
    cantiere: timesheet.cantiere || timesheet.cantiereNome || '',
    note: timesheet.note || ''
  }
  
  showEditTimesheetModal.value = true
}

const updateTimesheet = async () => {
  if (!editingTimesheet.value.id) return

  try {
    const dipendente = dipendenti.value.find(d => d.id === editingTimesheet.value.dipendenteId)
    if (!dipendente) {
      throw new Error('Dipendente non trovato!')
    }

    const { ensureValidTimesheetData } = await import('../utils/timesheetValidation.js')

    const timesheetDataRaw = {
      ...editingTimesheet.value,
      ore: parseFloat(editingTimesheet.value.ore),
      costoOrario: dipendente.pagaOraria || 25,
      costoTotale: parseFloat(editingTimesheet.value.ore) * (dipendente.pagaOraria || 25),
      updatedAt: new Date().toISOString()
    }
    
    delete timesheetDataRaw.id

    const timesheetValidation = ensureValidTimesheetData(timesheetDataRaw)

    if (!timesheetValidation.isValid) {
      throw new Error(`Dati non validi: ${timesheetValidation.errors.join(', ')}`)
    }

    if (timesheetValidation.warnings.length > 0) {
      console.warn('⚠️ TIMESHEET UPDATE warnings:', timesheetValidation.warnings)
      warning('Attenzione', timesheetValidation.warnings.join(', '))
    }
    
    await firestoreStore.updateDocument('timesheet', editingTimesheet.value.id, timesheetValidation.correctedData)

    // Forza un aggiornamento completo dei dati
    await loadTimesheet()
    // Aggiorna anche le ore settimanali dei dipendenti
    updateDipendentiOreFromTimesheet()
    closeEditTimesheetModal()
    success('Timesheet Aggiornato', `Il timesheet è stato aggiornato con successo.`)

  } catch (err) {
    console.error('Errore aggiornamento timesheet:', err)
    error('Errore Aggiornamento', err.message)
  }
}

// 🚀 NUOVO: Funzioni per la lista dettagliata timesheet
const filteredTimesheetList = computed(() => {
  let filtered = timesheetDettagli.value

  // Filtro per dipendente
  if (selectedDipendenteFilter.value) {
    filtered = filtered.filter(t => t.dipendenteId === selectedDipendenteFilter.value)
  }

  // Filtro per cantiere
  if (selectedCantiereFilter.value) {
    filtered = filtered.filter(t => 
      (t.cantiere && t.cantiere === selectedCantiereFilter.value) ||
      (t.cantiereNome && t.cantiereNome === selectedCantiereFilter.value)
    )
  }

  // Filtro per data (singola data o settimana)
  if (selectedTimesheetDateFilter.value) {
    // Se il filtro è impostato tramite "Usa Settimana Selezionata", filtra per l'intera settimana
    if (selectedTimesheetDateFilter.value.includes('week-')) {
      const weekType = selectedTimesheetDateFilter.value.replace('week-', '')
      const today = new Date()
      let startDate, endDate
      
      switch (weekType) {
        case 'current':
          startDate = startOfWeek(today, { weekStartsOn: 1 })
          endDate = endOfWeek(today, { weekStartsOn: 1 })
          break
        case 'last':
          startDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
          endDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
          break
        case 'two-weeks':
          startDate = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 })
          endDate = endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 })
          break
        case 'three-weeks':
          startDate = startOfWeek(subWeeks(today, 3), { weekStartsOn: 1 })
          endDate = endOfWeek(subWeeks(today, 3), { weekStartsOn: 1 })
          break
        case 'month':
          startDate = startOfWeek(subWeeks(today, 4), { weekStartsOn: 1 })
          endDate = endOfWeek(subWeeks(today, 4), { weekStartsOn: 1 })
          break
        default:
          startDate = startOfWeek(today, { weekStartsOn: 1 })
          endDate = endOfWeek(today, { weekStartsOn: 1 })
      }
      
      const startDateStr = format(startDate, 'yyyy-MM-dd')
      const endDateStr = format(endDate, 'yyyy-MM-dd')
      
      filtered = filtered.filter(t => {
        const recordDate = new Date(t.data)
        return recordDate >= startDate && recordDate <= endDate
      })
    } else {
      // Filtro per data singola
      filtered = filtered.filter(t => t.data === selectedTimesheetDateFilter.value)
    }
  }

  // Ordina per data (più recente prima)
  return filtered.sort((a, b) => new Date(b.data) - new Date(a.data))
})

const getDipendenteIniziali = (dipendenteId) => {
  const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
  return dipendente ? getIniziali(dipendente.nome, dipendente.cognome) : 'N/A'
}

const getDipendenteNome = (dipendenteId) => {
  const dipendente = dipendenti.value.find(d => d.id === dipendenteId)
  return dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'N/A'
}

const deleteTimesheet = async (timesheet) => {
  const confirmed = await confirm(
    'Elimina Timesheet', 
    `Sei sicuro di voler eliminare la registrazione ore del ${formatDate(timesheet.data)} per ${getDipendenteNome(timesheet.dipendenteId)}?`
  )
  
  if (!confirmed) return

  try {
    await firestoreStore.deleteDocument('timesheet', timesheet.id)
    
    // Ricarica i dati
    await loadTimesheet()
    updateDipendentiOreFromTimesheet()
    
    success('Timesheet Eliminato', 'La registrazione ore è stata eliminata con successo.')
  } catch (err) {
    console.error('Errore eliminazione timesheet:', err)
    error('Errore Eliminazione', `Impossibile eliminare il timesheet: ${err.message}`)
  }
}

const clearTimesheetFilters = () => {
  selectedDipendenteFilter.value = ''
  selectedCantiereFilter.value = ''
  selectedTimesheetDateFilter.value = ''
  info('Filtri Puliti', 'Tutti i filtri sono stati resettati.')
}

const syncWithWeekFilter = () => {
  // Usa il tipo di settimana selezionato per il filtro
  selectedTimesheetDateFilter.value = `week-${selectedWeek.value}`
  
  // Calcola le date per il messaggio informativo
  const today = new Date()
  let startDate, endDate
  
  switch (selectedWeek.value) {
    case 'current':
      startDate = startOfWeek(today, { weekStartsOn: 1 })
      endDate = endOfWeek(today, { weekStartsOn: 1 })
      break
    case 'last':
      startDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
      break
    case 'two-weeks':
      startDate = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 })
      break
    case 'three-weeks':
      startDate = startOfWeek(subWeeks(today, 3), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(today, 3), { weekStartsOn: 1 })
      break
    case 'month':
      startDate = startOfWeek(subWeeks(today, 4), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(today, 4), { weekStartsOn: 1 })
      break
    default:
      startDate = startOfWeek(today, { weekStartsOn: 1 })
      endDate = endOfWeek(today, { weekStartsOn: 1 })
  }
  

  
  info('Filtro Sincronizzato', `Filtro impostato per la settimana: ${formatDate(format(startDate, 'yyyy-MM-dd'))} - ${formatDate(format(endDate, 'yyyy-MM-dd'))}`)
}

// Lifecycle Hooks
onMounted(async () => {
  info('Caricamento dati...', 'Recupero dipendenti e cantieri dal database.')
  await loadDipendenti()
  await loadCantieri()
  await loadTimesheet() // Carica i timesheet per calcolare le ore iniziali
  processTimesheetData()
  await loadPresenze()
})
</script> 