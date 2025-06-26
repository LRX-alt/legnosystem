<template>
  <div class="space-y-6">
    <!-- Header Personale -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Personale</h1>
        <p class="text-gray-600 text-base">Dipendenti e timesheet - Legnosystem.bio</p>
      </div>
      <div class="flex space-x-3">
        <button v-if="dipendenti.length > 0" @click="clearAllData" class="btn-danger text-base font-medium" title="Pulisci tutti i dati di esempio">
          🗑️ Pulisci Dati
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

        <!-- Cantiere Attuale -->
        <div v-if="dipendente.cantiereAttuale" class="mb-4 p-3 bg-accent-50 rounded-lg">
          <p class="text-sm text-accent-600 font-medium mb-1">Cantiere Attuale</p>
          <p class="text-base font-semibold text-gray-900">{{ dipendente.cantiereAttuale }}</p>
        </div>

        <!-- Ore Settimana -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-base mb-2">
            <span class="text-gray-600">Ore questa settimana:</span>
            <span class="font-medium">{{ dipendente.oreTotaliSettimana }}h</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${(dipendente.oreTotaliSettimana / 48) * 100}%`"></div>
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
          <select v-model="selectedWeek" class="w-full sm:w-52 px-3 py-2 border border-gray-300 rounded-lg text-base">
            <option value="current">Settimana Corrente</option>
            <option value="last">Settimana Scorsa</option>
            <option value="two-weeks">2 Settimane Fa</option>
          </select>
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
              <p class="text-xl font-bold" :class="record.totale >= 40 ? 'text-green-600' : 'text-gray-900'">
                {{ record.totale }}h
              </p>
              <p class="text-sm text-gray-500">totale</p>
            </div>
          </div>
          
          <!-- Ore giornaliere mobile -->
          <div class="grid grid-cols-5 gap-2 text-center">
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
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-base font-semibold" :class="record.totale >= 40 ? 'text-green-600' : 'text-gray-900'">
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
                  v-model="getPresenza(dipendente.id).entrata"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Ora uscita -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Uscita</p>
                <input
                  v-model="getPresenza(dipendente.id).uscita"
                  type="time"
                  class="w-28 px-3 py-2 border border-gray-300 rounded text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Pausa -->
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-1">Pausa (min)</p>
                <input
                  v-model.number="getPresenza(dipendente.id).pausa"
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
                  v-model="getPresenza(dipendente.id).stato"
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
                <p class="text-sm text-gray-500">{{ dipendente.cantiereAttuale || 'Nessun cantiere' }}</p>
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
                  v-model="getPresenza(dipendente.id).entrata"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Uscita</label>
                <input
                  v-model="getPresenza(dipendente.id).uscita"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Pausa (min)</label>
                <input
                  v-model.number="getPresenza(dipendente.id).pausa"
                  type="number"
                  min="0"
                  max="120"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Stato</label>
                <select
                  v-model="getPresenza(dipendente.id).stato"
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
              v-model="getPresenza(dipendente.id).note"
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
    </div>

    <!-- Modal Registrazione Ore - Mobile Optimized -->
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
                       :style="`width: ${Math.min(((selectedDipendente?.oreTotaliSettimana || 0) / 48) * 100, 100)}%`"></div>
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
                        <div class="font-medium">{{ entry.cantiere }}</div>
                        <div v-if="entry.cantiereId" class="text-xs text-gray-500">ID: {{ entry.cantiereId }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span class="text-lg">{{ entry.ore }}h</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="font-medium text-green-600">€{{ (entry.costoTotale || (entry.ore * (entry.costoOrario || selectedDipendente?.pagaOraria || 25))).toLocaleString() }}</div>
                        <div class="text-xs text-gray-500">{{ entry.costoOrario || selectedDipendente?.pagaOraria || 25 }}€/h</div>
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
                  <p class="text-sm text-gray-500">{{ selectedDipendente?.cantiereAttuale || 'Nessun cantiere assegnato' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-base text-gray-600">Paga Oraria</p>
                  <p class="font-bold text-lg text-green-600">€{{ selectedDipendente?.pagaOraria }}/h</p>
                </div>
              </div>
            </div>

            <!-- Pianificazione Settimanale -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Assegnazioni Cantieri -->
              <div class="card">
                <h5 class="font-semibold text-gray-900 mb-4">📍 Assegnazioni Cantieri</h5>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p class="font-medium text-green-900">{{ selectedDipendente?.cantiereAttuale || 'Nessun cantiere' }}</p>
                      <p class="text-sm text-green-600">Cantiere principale</p>
                    </div>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">Attivo</span>
                  </div>
                  <div class="text-center text-gray-500 py-4">
                    <p class="text-sm">Altre assegnazioni verranno visualizzate qui</p>
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
                    <p class="text-xs text-gray-500">{{ selectedDipendente?.cantiereAttuale || 'TBD' }}</p>
                  </div>
                </div>
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
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  UsersIcon, 
  ClockIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '../stores/firestore.js'
import { usePopup } from '../composables/usePopup.js'

// Firestore store
const firestoreStore = useFirestoreStore()
const { success, error, confirm } = usePopup()

// Stato della pagina
const activeTab = ref('dipendenti')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTimesheetModal = ref(false)
const showDetailModal = ref(false)
const showScheduleModal = ref(false)
const searchTerm = ref('')
const selectedRuolo = ref('')
const selectedStato = ref('')
const selectedWeek = ref('current')
const selectedDipendente = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

// Stats - calcolate dinamicamente dai dati Firestore
const stats = computed(() => {
  const dipendentiAttivi = dipendenti.value.filter(d => d.stato === 'attivo').length
  const oreSettimana = dipendenti.value.reduce((total, d) => total + (d.ore_settimana || 0), 0)
  const costoOrarioMedio = dipendentiAttivi > 0 
    ? dipendenti.value.reduce((total, d) => total + (d.pagaOraria || 0), 0) / dipendentiAttivi 
    : 0
  
  return {
    dipendentiAttivi,
    oreSettimana,
    presentiOggi: 0, // Da implementare con sistema presenze
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
  pagaOraria: 25,
  dataAssunzione: '',
  stato: 'attivo',
  cantiereAttuale: '',
  note: ''
})

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
  } catch (e) {
    console.warn('Errore nel caricamento dipendenti da Firestore:', e)
  }
}

// Funzioni per la gestione dei timesheet - carica da Firestore
const loadTimesheet = async (dipendenteId = null) => {
  try {
    // Se non specificato il dipendente, carica tutti i timesheet
    const result = await firestoreStore.loadCollection('timesheet')
    
    if (result.success) {
      const allTimesheet = result.data || []
      
      if (dipendenteId) {
        // Filtra per dipendente specifico
        timesheetDettagli.value = allTimesheet.filter(t => t.dipendenteId === dipendenteId)
      } else {
        // Carica tutti
        timesheetDettagli.value = allTimesheet
      }
      
      console.log(`✅ Timesheet caricati da Firestore: ${timesheetDettagli.value.length} voci`)
      
      // Aggiorna le ore settimanali per ogni dipendente
      updateDipendentiOreFromTimesheet()
    }
  } catch (e) {
    console.warn('Errore nel caricamento timesheet da Firestore:', e)
  }
}

// Aggiorna le ore settimanali dei dipendenti basandosi sui timesheet
const updateDipendentiOreFromTimesheet = () => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Lunedì
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // Sabato (6 giorni lavorativi)
  
  dipendenti.value.forEach(dipendente => {
    // Calcola ore della settimana corrente per questo dipendente
    const oreSettimana = timesheetDettagli.value
      .filter(t => {
        const dataTimesheet = new Date(t.data)
        return t.dipendenteId === dipendente.id && 
               dataTimesheet >= startOfWeek && 
               dataTimesheet <= endOfWeek
      })
      .reduce((total, t) => total + (t.ore || 0), 0)
    
    // Aggiorna ore settimanali
    dipendente.oreTotaliSettimana = oreSettimana
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

const saveTimesheet = async () => {
  if (!newTimesheet.value.dipendenteId || !newTimesheet.value.ore || !newTimesheet.value.cantiere) {
    error('Campi Mancanti', 'Compila tutti i campi obbligatori!')
    return
  }

  try {
    const dipendente = dipendenti.value.find(d => d.id === newTimesheet.value.dipendenteId)
    if (!dipendente) {
      error('Errore', 'Dipendente non trovato!')
      return
    }

    const timesheetData = {
      dipendenteId: newTimesheet.value.dipendenteId,
      data: newTimesheet.value.data,
      cantiere: newTimesheet.value.cantiere,
      ore: parseFloat(newTimesheet.value.ore),
      note: newTimesheet.value.note,
      costoOrario: dipendente.pagaOraria || 25,
      costoTotale: parseFloat(newTimesheet.value.ore) * (dipendente.pagaOraria || 25),
      fonte: 'manuale', // Per distinguere da quelli auto-generati dal giornale
      turno: 'giornaliero',
      createdAt: new Date().toISOString()
    }

    // Salva in Firestore
    const result = await firestoreStore.registraTimesheet(timesheetData)
    
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
    error('Errore Salvataggio', `Impossibile salvare il timesheet: ${err.message}`)
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
    note: ''
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedDipendente.value = null
}

// Funzioni per gestione presenze
const getPresenza = (dipendenteId) => {
  const key = `${selectedDate.value}-${dipendenteId}`
  if (!presenze.value[key]) {
    presenze.value[key] = {
      entrata: '08:00',
      uscita: '17:00',
      pausa: 60,
      stato: 'presente',
      note: ''
    }
  }
  return presenze.value[key]
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
    const presenza = getPresenza(dipendente.id)
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
    const presenza = getPresenza(dipendente.id)
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

// Funzione per pulire tutti i dati di esempio
const clearAllData = async () => {
  const confirmed = await confirm('Eliminare Tutti i Dati', 'Sei sicuro di voler eliminare TUTTI i dipendenti e i dati? Questa operazione non può essere annullata.')
  if (confirmed) {
    // Pulisci tutti i dati
    dipendenti.value = []
    timesheetData.value = []
    timesheetDettagli.value = []
    presenze.value = {}
    
    // Reset statistiche
    stats.value = {
      dipendentiAttivi: 0,
      oreSettimana: 0,
      presentiOggi: 0,
      costoOrarioMedio: 0
    }
    
    // Pulisci localStorage
    localStorage.removeItem('legnosystem_dipendenti')
    
    success('Dati Eliminati', 'Tutti i dati sono stati eliminati! La pagina è ora pulita.')
  }
}

// Inizializzazione del componente
onMounted(async () => {
  // Carica cantieri da Firestore
  await loadCantieri()
  
  // Carica dipendenti da Firestore
  await loadDipendenti()
  
  // Carica tutti i timesheet da Firestore
  await loadTimesheet()
})
</script> 