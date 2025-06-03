<template>
  <div class="space-y-6">
    <!-- Header Personale -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Personale</h1>
        <p class="text-gray-600 text-base">Dipendenti e timesheet - Legnosystem.bio</p>
      </div>
      <div class="flex space-x-3">
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
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${(dipendente.oreTotaliSettimana / 40) * 100}%`"></div>
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
                <input v-model.number="newDipendente.pagaOraria" type="number" step="0.5" min="15" max="50" required
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

            <!-- Calendario ore -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
                    <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Ore</th>
                    <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="entry in getTimesheetForDipendente(selectedDipendente?.id)" :key="entry.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ formatDate(entry.data) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ entry.cantiere }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{{ entry.ore }}h</td>
                    <td class="px-6 py-4 text-base text-gray-900">{{ entry.note || '-' }}</td>
                  </tr>
                </tbody>
              </table>
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
          
          <form @submit.prevent="saveEditDipendente" class="space-y-6">
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
                <input v-model.number="editingDipendente.pagaOraria" type="number" step="0.5" min="15" max="50" required
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
              <div class="grid grid-cols-5 gap-4 text-center">
                <div v-for="(giorno, index) in ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì']" :key="index" 
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

// Stats
const stats = ref({
  dipendentiAttivi: 12,
  oreSettimana: 162,
  presentiOggi: 8,
  costoOrarioMedio: 28
})

// Presenze giornaliere
const presenze = ref({})

// Lista cantieri dinamica (sincronizzata con localStorage)
const cantieriDisponibili = ref([
  'Villa Rossi',
  'Capannone Industriale', 
  'Tetto Storico',
  'Condominio Aurora'
])

// Dati dipendenti - inizializzo con dati di default
const dipendenti = ref([
  {
    id: 1,
    nome: 'Marco',
    cognome: 'Bianchi',
    iniziali: 'MB',
    email: 'marco.bianchi@legnosystem.bio',
    telefono: '340 123 4567',
    ruolo: 'capo-squadra',
    stato: 'attivo',
    dataAssunzione: '2022-03-15',
    pagaOraria: 32,
    cantiereAttuale: 'Villa Rossi',
    oreTotaliSettimana: 38
  },
  {
    id: 2,
    nome: 'Luca',
    cognome: 'Verdi',
    iniziali: 'LV',
    email: 'luca.verdi@legnosystem.bio',
    telefono: '347 234 5678',
    ruolo: 'carpentiere',
    stato: 'attivo',
    dataAssunzione: '2021-09-10',
    pagaOraria: 28,
    cantiereAttuale: 'Villa Rossi',
    oreTotaliSettimana: 40
  },
  {
    id: 3,
    nome: 'Anna',
    cognome: 'Russo',
    iniziali: 'AR',
    email: 'anna.russo@legnosystem.bio',
    telefono: '333 345 6789',
    ruolo: 'operaio',
    stato: 'attivo',
    dataAssunzione: '2023-01-20',
    pagaOraria: 24,
    cantiereAttuale: 'Villa Rossi',
    oreTotaliSettimana: 36
  },
  {
    id: 4,
    nome: 'Giuseppe',
    cognome: 'Neri',
    iniziali: 'GN',
    email: 'giuseppe.neri@legnosystem.bio',
    telefono: '349 456 7890',
    ruolo: 'carpentiere',
    stato: 'attivo',
    dataAssunzione: '2022-11-05',
    pagaOraria: 30,
    cantiereAttuale: 'Capannone Industriale',
    oreTotaliSettimana: 42
  },
  {
    id: 5,
    nome: 'Sofia',
    cognome: 'Gialli',
    iniziali: 'SG',
    email: 'sofia.gialli@legnosystem.bio',
    telefono: '338 567 8901',
    ruolo: 'amministrativo',
    stato: 'attivo',
    dataAssunzione: '2023-04-12',
    pagaOraria: 26,
    cantiereAttuale: null,
    oreTotaliSettimana: 40
  }
])

// Dati timesheet sample
const timesheetData = ref([
  {
    dipendenteId: 1,
    nome: 'Marco Bianchi',
    iniziali: 'MB',
    cantiere: 'Villa Rossi',
    lunedi: 8,
    martedi: 8,
    mercoledi: 8,
    giovedi: 7,
    venerdi: 7,
    totale: 38
  },
  {
    dipendenteId: 2,
    nome: 'Luca Verdi',
    iniziali: 'LV',
    cantiere: 'Villa Rossi',
    lunedi: 8,
    martedi: 8,
    mercoledi: 8,
    giovedi: 8,
    venerdi: 8,
    totale: 40
  },
  {
    dipendenteId: 3,
    nome: 'Anna Russo',
    iniziali: 'AR',
    cantiere: 'Villa Rossi',
    lunedi: 8,
    martedi: 7,
    mercoledi: 8,
    giovedi: 7,
    venerdi: 6,
    totale: 36
  }
])

// Dati timesheet dettagliati
const timesheetDettagli = ref([
  { id: 1, dipendenteId: 1, data: '2024-01-15', cantiere: 'Villa Rossi', ore: 8, note: 'Montaggio travi principali' },
  { id: 2, dipendenteId: 1, data: '2024-01-16', cantiere: 'Villa Rossi', ore: 8, note: 'Completamento struttura' },
  { id: 3, dipendenteId: 1, data: '2024-01-17', cantiere: 'Villa Rossi', ore: 8, note: 'Isolamento termico' },
  { id: 4, dipendenteId: 2, data: '2024-01-15', cantiere: 'Villa Rossi', ore: 8, note: 'Supporto montaggio' },
  { id: 5, dipendenteId: 2, data: '2024-01-16', cantiere: 'Villa Rossi', ore: 8, note: 'Finitura pannelli' }
])

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

// Funzioni per la gestione dei cantieri
const loadCantieriFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_cantieri')
  if (stored) {
    try {
      const cantieri = JSON.parse(stored)
      const nuoviCantieri = cantieri.map(c => c.nome)
      if (JSON.stringify(nuoviCantieri) !== JSON.stringify(cantieriDisponibili.value)) {
        cantieriDisponibili.value = nuoviCantieri
        console.log('✅ Lista cantieri aggiornata:', nuoviCantieri)
      }
    } catch (e) {
      console.warn('Errore nel caricamento cantieri:', e)
    }
  }
}

// Funzioni per la gestione dei dipendenti
const loadDipendentiFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_dipendenti')
  if (stored) {
    try {
      dipendenti.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento dipendenti dal localStorage:', e)
    }
  }
}

const saveDipendentiToStorage = () => {
  localStorage.setItem('legnosystem_dipendenti', JSON.stringify(dipendenti.value))
  window.dispatchEvent(new CustomEvent('dipendenti-updated'))
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

const saveDipendente = () => {
  if (!newDipendente.value.nome || !newDipendente.value.cognome || !newDipendente.value.email) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const nuovoDipendente = {
    id: Date.now(),
    nome: newDipendente.value.nome,
    cognome: newDipendente.value.cognome,
    iniziali: newDipendente.value.nome.charAt(0) + newDipendente.value.cognome.charAt(0),
    email: newDipendente.value.email,
    telefono: newDipendente.value.telefono,
    ruolo: newDipendente.value.ruolo,
    stato: newDipendente.value.stato,
    dataAssunzione: newDipendente.value.dataAssunzione,
    pagaOraria: newDipendente.value.pagaOraria,
    cantiereAttuale: newDipendente.value.cantiereAttuale || null,
    oreTotaliSettimana: 0
  }

  dipendenti.value.push(nuovoDipendente)
  stats.value.dipendentiAttivi++

  saveDipendentiToStorage()
  closeAddModal()
  alert(`✅ Dipendente ${nuovoDipendente.nome} ${nuovoDipendente.cognome} aggiunto con successo!`)
}

const saveTimesheet = () => {
  if (!newTimesheet.value.dipendenteId || !newTimesheet.value.ore || !newTimesheet.value.cantiere) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const nuovoTimesheet = {
    id: Date.now(),
    dipendenteId: parseInt(newTimesheet.value.dipendenteId),
    data: newTimesheet.value.data,
    cantiere: newTimesheet.value.cantiere,
    ore: parseFloat(newTimesheet.value.ore),
    note: newTimesheet.value.note
  }

  timesheetDettagli.value.push(nuovoTimesheet)
  
  // Aggiorna ore settimanali
  const dipendente = dipendenti.value.find(d => d.id === parseInt(newTimesheet.value.dipendenteId))
  if (dipendente) {
    dipendente.oreTotaliSettimana += nuovoTimesheet.ore
  }

  closeTimesheetModal()
  alert(`✅ Ore registrate per ${dipendente?.nome} ${dipendente?.cognome}!`)
}

const viewTimesheet = (dipendente) => {
  selectedDipendente.value = dipendente
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

const viewSchedule = (dipendente) => {
  selectedDipendente.value = dipendente
  showScheduleModal.value = true
}

const getTimesheetForDipendente = (dipendenteId) => {
  return timesheetDettagli.value.filter(t => t.dipendenteId === dipendenteId)
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
  const presenza = getPresenza(dipendenteId)
  if (presenza.stato !== 'presente' || !presenza.entrata || !presenza.uscita) {
    return 0
  }
  
  const entrata = new Date(`2000-01-01 ${presenza.entrata}`)
  const uscita = new Date(`2000-01-01 ${presenza.uscita}`)
  const diffMs = uscita - entrata
  const diffHours = diffMs / (1000 * 60 * 60)
  const pausaHours = (presenza.pausa || 0) / 60
  
  return Math.max(0, Math.round((diffHours - pausaHours) * 2) / 2) // Arrotonda a 0.5
}

const markAllPresent = () => {
  dipendenti.value.forEach(dipendente => {
    const presenza = getPresenza(dipendente.id)
    presenza.stato = 'presente'
    presenza.entrata = '08:00'
    presenza.uscita = '17:00'
    presenza.pausa = 60
  })
  alert('✅ Tutti i dipendenti sono stati segnati come presenti!')
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

const saveEditDipendente = () => {
  if (!editingDipendente.value.nome || !editingDipendente.value.cognome || !editingDipendente.value.email) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const index = dipendenti.value.findIndex(d => d.id === editingDipendente.value.id)
  if (index !== -1) {
    dipendenti.value[index] = {
      ...editingDipendente.value,
      iniziali: editingDipendente.value.nome.charAt(0) + editingDipendente.value.cognome.charAt(0),
      cantiereAttuale: editingDipendente.value.cantiereAttuale || null
    }
  }

  saveDipendentiToStorage()
  closeEditModal()
  alert(`✅ Dipendente ${editingDipendente.value.nome} ${editingDipendente.value.cognome} aggiornato con successo!`)
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

const closeScheduleModal = () => {
  showScheduleModal.value = false
  selectedDipendente.value = null
}

// Inizializzazione del componente
onMounted(() => {
  // Carica cantieri dal localStorage
  loadCantieriFromStorage()
  
  // Carica dipendenti dal localStorage all'avvio
  loadDipendentiFromStorage()
  
  // Se non ci sono dipendenti nel localStorage, salva quelli attuali
  if (!localStorage.getItem('legnosystem_dipendenti')) {
    saveDipendentiToStorage()
  }

  // Ascolta i cambiamenti nel localStorage (per sincronizzazione tra pagine)
  window.addEventListener('storage', (e) => {
    if (e.key === 'legnosystem_cantieri') {
      loadCantieriFromStorage()
    }
  })

  // Ascolta anche gli eventi personalizzati (per aggiornamenti nella stessa pagina)
  window.addEventListener('cantieri-updated', loadCantieriFromStorage)
  window.addEventListener('dipendenti-updated', loadDipendentiFromStorage)

  // Check periodico per essere sicuri della sincronizzazione
  setInterval(loadCantieriFromStorage, 5000)
})
</script> 