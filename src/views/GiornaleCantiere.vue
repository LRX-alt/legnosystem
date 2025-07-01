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
                <div class="text-2xl font-bold text-primary-600">{{ costiCantiere.oreTotali }}</div>
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
          <p class="text-lg font-bold text-orange-600">€{{ costiCantiere.manodopera.toLocaleString() }}</p>
          <p class="text-xs text-gray-500">{{ costiCantiere.giorniLavorativi }} giorni</p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Materiali</p>
          <p class="text-lg font-bold text-blue-600">€{{ costiCantiere.materiali.toLocaleString() }}</p>
          <p class="text-xs text-gray-500">utilizzati</p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Totale</p>
          <p class="text-lg font-bold text-red-600">€{{ costiCantiere.totale.toLocaleString() }}</p>
          <p class="text-xs text-gray-500">sostenuto</p>
        </div>
      </div>
      <div v-if="costiCantiere.oreTotali > 0" class="pt-2 mt-2 border-t border-green-200 text-center">
        <p class="text-xs text-gray-600">
          {{ costiCantiere.oreTotali }}h lavorate • 
          €{{ costiCantiere.costoMedioGiorno?.toFixed(0) || 0 }}/giorno medio
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

          <!-- Ore Lavorate -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">⏰ Ore Lavorate</h4>
            <p class="text-sm font-semibold">{{ entry.oreTotali }}h totali</p>
            <p class="text-xs text-gray-500">
              {{ (entry.teamPresente || entry.team || []).length }} operatori
              <span v-if="entry.costoGiornata" class="text-green-600 font-medium ml-2">
                • €{{ entry.costoGiornata.toFixed(0) }}
              </span>
            </p>
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
            <!-- Data e Orari -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input v-model="entryForm.data" type="date" required class="form-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Orario Inizio</label>
                <input v-model="entryForm.orarioInizio" type="time" required class="form-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Orario Fine</label>
                <input v-model="entryForm.orarioFine" type="time" required class="form-input">
              </div>
            </div>

            <!-- Responsabile -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Responsabile</label>
              <select v-model="entryForm.responsabile" required class="form-select">
                <option v-for="membro in cantiere?.team" :key="membro.id" :value="membro.nome">
                  {{ membro.nome }}
                </option>
              </select>
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

            <!-- 👥 Team Presente e Ore Lavorate -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">👥 Team Presente e Ore</h4>
              
              <!-- Ore Totali -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">⏰ Ore Totali Lavorate</label>
                  <input v-model.number="entryForm.oreTotali" type="number" min="0.5" max="12" step="0.5" required class="form-input"
                         :class="{'border-orange-500': entryForm.oreTotali > 8}">
                  <p v-if="entryForm.oreTotali > 8" class="text-xs text-orange-600 mt-1">
                    Include {{ entryForm.oreTotali - 8 }}h di straordinario
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">💶 Costi Extra</label>
                  <input v-model.number="entryForm.costiExtra"
                         type="number"
                         min="0"
                         step="0.5"
                         class="form-input"
                         placeholder="Es: trasferte, bonus...">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">💰 Costo Stimato Giornata</label>
                  <input :value="calculateDayCost().toFixed(2)" type="text" readonly class="form-input bg-gray-100 font-bold text-green-600">
                  <p class="text-xs text-gray-500 mt-1">€ per questa giornata</p>
                </div>
              </div>

              <!-- Selezione Team Presente -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">Dipendenti Presenti</label>
                  <div class="text-xs text-gray-500">
                    Seleziona chi ha effettivamente lavorato oggi
                  </div>
                </div>
                
                <!-- Lista dipendenti disponibili -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div v-for="membro in cantiere?.team" :key="membro.id" class="flex items-center space-x-3">
                    <input 
                      :id="'team-' + membro.id" 
                      type="checkbox" 
                      :checked="isTeamMemberPresent(membro)"
                      @change="toggleTeamMember(membro)"
                      class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    >
                    <label :for="'team-' + membro.id" class="text-sm text-gray-700 flex-1 cursor-pointer">
                      <span class="font-medium">{{ membro.nome }}</span>
                      <span class="text-gray-500 ml-2">({{ membro.ruolo }})</span>
                      <span class="text-green-600 ml-2 font-medium">€{{ getDipendentePagaOraria(membro.id) }}/h</span>
                    </label>
                  </div>
                </div>

                <!-- Team presente riepilogo -->
                <div v-if="entryForm.teamPresente.length > 0" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p class="text-sm font-medium text-blue-900 mb-2">Team presente ({{ entryForm.teamPresente.length }} dipendenti):</p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="membro in entryForm.teamPresente" :key="membro.id" class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {{ membro.nome }} - €{{ membro.pagaOraria }}/h
                    </span>
                  </div>
                  <p class="text-xs text-blue-700 mt-2">
                    Costo orario team: €{{ calcolayCostoOrarioTeam() }}/h • 
                    {{ entryForm.oreTotali }}h × €{{ calcolayCostoOrarioTeam() }}/h = €{{ calculateDayCost() }}
                  </p>
                </div>

                <!-- Warning se nessun team -->
                <div v-if="entryForm.teamPresente.length === 0" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p class="text-sm text-yellow-800">⚠️ Seleziona almeno un dipendente che ha lavorato in questa giornata</p>
                </div>
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

            <!-- Riepilogo Costi -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">💰 Riepilogo Costi</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Costo Base</p>
                  <p class="text-lg font-semibold">€{{ (calcolayCostoOrarioTeam() * Math.min(8, entryForm.oreTotali)).toFixed(2) }}</p>
                </div>
                <div v-if="entryForm.oreTotali > 8">
                  <p class="text-sm text-gray-600">Straordinari</p>
                  <p class="text-lg font-semibold text-orange-600">
                    €{{ (calcolayCostoOrarioTeam() * 1.3 * (entryForm.oreTotali - 8)).toFixed(2) }}
                  </p>
                </div>
                <div v-if="entryForm.costiExtra">
                  <p class="text-sm text-gray-600">Extra</p>
                  <p class="text-lg font-semibold text-blue-600">€{{ entryForm.costiExtra.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Totale Giornata</p>
                  <p class="text-xl font-bold text-green-600">€{{ calculateDayCost().toFixed(2) }}</p>
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
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'
import { jsPDF } from 'jspdf'
import { 
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Route e Store
const route = useRoute()
const firestoreStore = useFirestoreStore()
const { success, error, warning, info, confirm } = usePopup()

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
  orarioInizio: '06:00',
  orarioFine: '22:00',
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
  costiExtra: 0,
  team: [], // Team legacy per compatibilità
  teamPresente: [] // Nuovo array per il team specifico della giornata
})

// Registrazioni giornale - vuoto, da caricare da Firestore
const entries = ref([])

// 💰 Costi cantiere
const costiCantiere = ref({
  manodopera: 0,
  materiali: 0,
  totale: 0,
  giorniLavorativi: 0,
  oreTotali: 0,
  costoMedioGiorno: 0
})

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
    orarioInizio: '06:00',
    orarioFine: '22:00',
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
    costiExtra: 0,
    team: [], // Legacy
    teamPresente: [] // Nuovo team specifico
  }
  showEntryModal.value = true
}

const editEntry = (entry) => {
  editingEntry.value = entry
  entryForm.value = {
    data: entry.data,
    orarioInizio: entry.orarioInizio,
    orarioFine: entry.orarioFine,
    responsabile: entry.responsabile,
    meteo: { ...entry.meteo },
    attivita: [...entry.attivita],
    note: entry.note,
    problemiText: entry.problemi.join('\n'),
    oreTotali: entry.oreTotali,
    costiExtra: 0,
    team: [...(entry.team || [])], // Legacy
    teamPresente: [...(entry.teamPresente || entry.team || [])] // Nuovo team, fallback su legacy
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

// 👥 ===== FUNZIONI GESTIONE TEAM PRESENTE =====

// Verifica se un membro del team è presente nella registrazione
const isTeamMemberPresent = (membro) => {
  return entryForm.value.teamPresente.some(m => m.id === membro.id)
}

// Aggiunge/rimuove un membro dal team presente
const toggleTeamMember = (membro) => {
  const index = entryForm.value.teamPresente.findIndex(m => m.id === membro.id)
  
  if (index >= 0) {
    // Rimuovi il membro se già presente
    entryForm.value.teamPresente.splice(index, 1)
  } else {
    // Aggiungi il membro se non presente
    const pagaOraria = getDipendentePagaOraria(membro.id)
    entryForm.value.teamPresente.push({
      id: membro.id,
      nome: membro.nome,
      ruolo: membro.ruolo,
      iniziali: membro.iniziali,
      pagaOraria: pagaOraria
    })
  }
}

// Ottiene la paga oraria di un dipendente dai dati reali
const getDipendentePagaOraria = (dipendenteId) => {
  try {
    // Cerca il dipendente nello store dei dipendenti
    const dipendente = firestoreStore.dipendenti.find(d => d.id === dipendenteId)
    
    if (dipendente && dipendente.pagaOraria) {
      return parseFloat(dipendente.pagaOraria)
    }
    
    // Se non trovato, cerca nel team del cantiere
    const membroTeam = cantiere.value?.team?.find(m => m.id === dipendenteId)
    if (membroTeam && membroTeam.pagaOraria) {
      return parseFloat(membroTeam.pagaOraria)
    }
    
    // Default fallback
    console.warn(`Paga oraria non trovata per dipendente ${dipendenteId}, usando default €25/h`)
    return 25
  } catch (error) {
    console.error('Errore nel recupero paga oraria:', error)
    return 25
  }
}

// Calcola il costo orario del team presente con maggiorazioni
const calcolayCostoOrarioTeam = () => {
  return entryForm.value.teamPresente.reduce((total, membro) => {
    let pagaOraria = membro.pagaOraria || 25
    
    // Applica maggiorazioni in base al turno e giorno
    const data = new Date(entryForm.value.data)
    const giorno = data.getDay() // 0 = domenica
    
    // Maggiorazione domenica/festivi (+50%)
    if (giorno === 0) {
      pagaOraria *= 1.5
    }
    
    // Maggiorazione turno notturno (+25%)
    if (entryForm.value.orarioInizio === '22:00' && entryForm.value.orarioFine === '06:00') {
      pagaOraria *= 1.25
    }
    
    // Maggiorazione straordinari (+30% dopo 8h)
    const oreTotali = entryForm.value.oreTotali || 0
    if (oreTotali > 8) {
      const oreNormali = 8
      const oreStraordinario = oreTotali - 8
      return total + (pagaOraria * oreNormali) + (pagaOraria * 1.3 * oreStraordinario)
    }
    
    return total + (pagaOraria * oreTotali)
  }, 0)
}

// Calcola il costo totale della giornata
const calculateDayCost = () => {
  const costoTotale = calcolayCostoOrarioTeam()
  
  // Aggiungi costi extra se specificati
  if (entryForm.value.costiExtra) {
    return costoTotale + entryForm.value.costiExtra
  }
  
  return costoTotale
}

// ===== FINE FUNZIONI GESTIONE TEAM PRESENTE =====

// 📊 Funzione per sincronizzare i timesheet dei dipendenti
const syncTimesheetFromGiornale = async (entryData, registrazioneId = null) => {
  if (!entryData.teamPresente?.length || !entryData.data || !cantiere.value?.id) {
    console.warn('Dati insufficienti per sincronizzare timesheet')
    return
  }

  try {
    // Se è una modifica, prima elimina i vecchi timesheet e presenze
    if (registrazioneId) {
      await deleteTimesheetByRegistrazione(registrazioneId)
    }

    // Calcola le ore per ogni dipendente (dividi le ore totali per il numero di persone)
    const orePerPersona = entryData.oreTotali / entryData.teamPresente.length

    for (const membro of entryData.teamPresente) {
      // Crea voce timesheet per ogni dipendente
      const timesheetData = {
        dipendenteId: membro.id,
        data: entryData.data,
        cantiere: cantiere.value.nome,
        cantiereId: cantiere.value.id,
        ore: orePerPersona,
        orarioInizio: entryData.orarioInizio || '08:00',
        orarioFine: entryData.orarioFine || '17:00',
        note: `Auto-generato da Giornale Cantiere - ${entryData.attivita?.[0] || 'Lavori generici'}`,
        costoOrario: membro.pagaOraria,
        costoTotale: orePerPersona * membro.pagaOraria,
        fonte: 'giornale_cantiere',
        registrazioneGiornaleId: registrazioneId
      }

      // Salva timesheet in Firestore
      const result = await firestoreStore.registraTimesheet(timesheetData)
      
      if (result.success) {
        console.log(`✅ Timesheet creato/aggiornato per ${membro.nome}: ${orePerPersona}h su ${cantiere.value.nome}`)
        
        // Crea/aggiorna la presenza con gli stessi orari del timesheet
        const presenzaData = {
          id: `${entryData.data}-${membro.id}`,
          dipendenteId: membro.id,
          data: entryData.data,
          entrata: timesheetData.orarioInizio,
          uscita: timesheetData.orarioFine,
          pausa: 60, // Default 1 ora di pausa
          stato: 'presente',
          note: `Auto-generato da Giornale Cantiere - ${cantiere.value.nome}`,
          fonte: 'giornale_cantiere',
          registrazioneGiornaleId: registrazioneId,
          oreTotali: orePerPersona,
          updatedAt: new Date().toISOString()
        }

        // Salva presenza in Firestore
        const presenzaResult = await firestoreStore.createDocument('presenze', presenzaData)

        if (presenzaResult.success) {
          console.log(`✅ Presenza creata/aggiornata per ${membro.nome} il ${entryData.data}`)
        } else {
          console.error(`❌ Errore creazione presenza per ${membro.nome}:`, presenzaResult.error)
        }
      } else {
        console.error(`❌ Errore creazione timesheet per ${membro.nome}:`, result.error)
      }
    }

    // Aggiorna le ore settimanali dei dipendenti
    await updateDipendentiOreSettimanali(entryData.teamPresente, orePerPersona)

  } catch (error) {
    console.error('Errore sincronizzazione timesheet/presenze:', error)
  }
}

// 📈 Aggiorna le ore settimanali accumulate dei dipendenti
const updateDipendentiOreSettimanali = async (teamPresente, orePerPersona) => {
  for (const membro of teamPresente) {
    try {
      // Trova il dipendente nello store
      const dipendente = firestoreStore.dipendenti.find(d => d.id === membro.id)
      
      if (dipendente) {
        // Aggiorna le ore settimanali accumulate
        const nuoveOreTotali = (dipendente.oreTotaliSettimana || 0) + orePerPersona
        
        await firestoreStore.updateDocument('dipendenti', membro.id, {
          oreTotaliSettimana: nuoveOreTotali,
          cantiereAttuale: cantiere.value.nome, // Aggiorna anche il cantiere attuale
          ultimaAttivita: new Date().toISOString()
        })
        
        console.log(`📊 Ore settimanali aggiornate per ${membro.nome}: ${nuoveOreTotali}h`)
      }
    } catch (error) {
      console.error(`Errore aggiornamento ore settimanali per ${membro.nome}:`, error)
    }
  }
}

const saveEntry = async () => {
  if (!cantiere.value?.id) {
    error('Errore', 'Cantiere non selezionato')
    return
  }

  try {
    const entryData = {
      data: entryForm.value.data,
      orarioInizio: entryForm.value.orarioInizio,
      orarioFine: entryForm.value.orarioFine,
      responsabile: entryForm.value.responsabile,
      meteo: { ...entryForm.value.meteo },
      attivita: entryForm.value.attivita.filter(a => a.trim()),
      note: entryForm.value.note,
      problemi: entryForm.value.problemiText.split('\n').filter(p => p.trim()),
      oreTotali: entryForm.value.oreTotali,
      costiExtra: entryForm.value.costiExtra,
      team: entryForm.value.team, // Legacy per compatibilità
      teamPresente: entryForm.value.teamPresente, // Nuovo campo per team specifico
      costoGiornata: calculateDayCost(), // Calcola e salva il costo della giornata
      allegati: editingEntry.value?.allegati || []
    }

    let registrazioneId = null
    
    if (editingEntry.value) {
      // Aggiorna registrazione esistente
      await firestoreStore.updateRegistrazioneGiornale(editingEntry.value.id, entryData)
      registrazioneId = editingEntry.value.id
    } else {
      // Crea nuova registrazione
      const result = await firestoreStore.createRegistrazioneGiornale(cantiere.value.id, entryData)
      registrazioneId = result.success ? result.data?.id : null
    }

    // Ricarica le registrazioni
    await loadGiornaleEntries()
    
    // 💰 Aggiorna automaticamente i costi dopo salvataggio registrazione
    await updateCostiCantiere()
    
    // 📊 Sincronizza automaticamente i timesheet dei dipendenti
    if (!editingEntry.value && registrazioneId) {
      // Solo per nuove registrazioni, evita duplicati per modifiche
      console.log('🔄 Sincronizzando timesheet per registrazione:', entryData)
      await syncTimesheetFromGiornale(entryData, registrazioneId)
    } else if (editingEntry.value) {
      console.log('⏩ Modifica registrazione - non sincronizzando timesheet per evitare duplicati')
    } else {
      console.warn('⚠️ Impossibile sincronizzare timesheet: ID registrazione non disponibile')
    }
    
    closeEntryModal()
    
    // 🎉 Popup di successo moderno che sparisce dopo 2 secondi
    const isUpdate = !!editingEntry.value
    const dataFormatted = new Date(entryForm.value.data).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    })
    
    if (isUpdate) {
      success(
        'Registrazione Aggiornata',
        `${dataFormatted} • ${entryForm.value.oreTotali}h • €${calculateDayCost().toLocaleString()}`
      )
    } else {
      success(
        'Registrazione Salvata',
        `${dataFormatted} • ${entryForm.value.teamPresente.length} persone • ${entryForm.value.oreTotali}h • €${calculateDayCost().toLocaleString()}`
      )
    }
  } catch (errorObj) {
    console.error('Errore nel salvataggio della registrazione:', errorObj)
    error('Errore Salvataggio', errorObj.message)
  }
}

const deleteEntry = async (entryId) => {
  const userConfirmed = await confirm(
    'Eliminare Registrazione', 
    'Sei sicuro di voler eliminare questa registrazione? Verranno eliminate anche le voci timesheet associate. Questa azione non può essere annullata.'
  )
  
  if (userConfirmed) {
    try {
      // 📊 Prima di eliminare, rimuovi anche i timesheet associati
      await deleteTimesheetByRegistrazione(entryId)
      
      await firestoreStore.deleteRegistrazioneGiornale(entryId)
      await loadGiornaleEntries()
      
      // 💰 Aggiorna automaticamente i costi dopo eliminazione
      await updateCostiCantiere()
      
      // 🗑️ Popup di successo per eliminazione
      success(
        'Registrazione Eliminata',
        'Timesheet e costi aggiornati automaticamente'
      )
    } catch (errorObj) {
      console.error('Errore nell\'eliminazione della registrazione:', errorObj)
      error('Errore Eliminazione', errorObj.message)
    }
  }
}

// 🗑️ Elimina i timesheet e le presenze associati a una registrazione del giornale
const deleteTimesheetByRegistrazione = async (registrazioneId) => {
  try {
    // Carica tutti i timesheet per trovare quelli associati a questa registrazione
    const timesheetResult = await firestoreStore.loadCollection('timesheet')
    
    if (timesheetResult.success) {
      const timesheetAssociati = timesheetResult.data.filter(t => 
        t.registrazioneGiornaleId === registrazioneId || 
        t.fonte === 'giornale_cantiere'
      )
      
      // Elimina ogni timesheet associato
      for (const timesheet of timesheetAssociati) {
        await firestoreStore.deleteDocument('timesheet', timesheet.id)
        console.log(`🗑️ Timesheet eliminato: ${timesheet.id}`)
      }
      
      console.log(`✅ Eliminati ${timesheetAssociati.length} timesheet associati alla registrazione`)
    }

    // Carica tutte le presenze per trovare quelle associate a questa registrazione
    const presenzeResult = await firestoreStore.loadCollection('presenze')
    
    if (presenzeResult.success) {
      const presenzeAssociate = presenzeResult.data.filter(p => 
        p.registrazioneGiornaleId === registrazioneId || 
        p.fonte === 'giornale_cantiere'
      )
      
      // Elimina ogni presenza associata
      for (const presenza of presenzeAssociate) {
        await firestoreStore.deleteDocument('presenze', presenza.id)
        console.log(`🗑️ Presenza eliminata: ${presenza.id}`)
      }
      
      console.log(`✅ Eliminate ${presenzeAssociate.length} presenze associate alla registrazione`)
    }
  } catch (error) {
    console.error('Errore eliminazione timesheet e presenze associati:', error)
  }
}

const resetFilters = () => {
  selectedDate.value = ''
  selectedWeek.value = ''
}

const exportPDF = () => {
  if (!cantiere.value) {
          error('Errore Export', 'Dati cantiere non disponibili')
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
    error('Errore Export', errorObj.message)
  }
}

// Watch per cambiamenti di route
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadCantiereData()
  }
}, { immediate: false })

// Lifecycle
onMounted(async () => {
  // Carica i dati del cantiere
  await loadCantiereData()
})

const loadCantiereData = async () => {
  try {
    // Ottieni l'ID del cantiere dalla route
    const cantiereId = route.params.id
    
    if (!cantiereId) {
      console.error('ID cantiere non trovato nella route')
      error('Errore Navigazione', 'ID cantiere non trovato')
      return
    }
    
    // Carica i cantieri dal store se non sono già stati caricati
    if (firestoreStore.cantieri.length === 0) {
      await firestoreStore.loadCantieri()
    }
    
    // Trova il cantiere specifico
    cantiere.value = firestoreStore.cantieri.find(c => c.id === cantiereId)
    
    if (!cantiere.value) {
      console.error(`Cantiere con ID ${cantiereId} non trovato`)
      error('Cantiere Non Trovato', `ID ${cantiereId} non valido`)
    } else {
      // Carica anche le registrazioni del giornale
      await loadGiornaleEntries()
      
      // 👥 Carica i dipendenti per avere le paghe orarie
      if (firestoreStore.dipendenti.length === 0) {
        await firestoreStore.loadDipendenti()
      }
    }
  } catch (errorObj) {
    console.error('Errore nel caricamento del cantiere:', errorObj)
    error('Errore Caricamento', errorObj.message)
  }
}

const loadGiornaleEntries = async () => {
  try {
    const cantiereId = route.params.id
    if (!cantiereId) return
    
    const result = await firestoreStore.loadGiornaleCantiere(cantiereId)
    if (result.success) {
      entries.value = result.data
      
      // 💰 Carica automaticamente i costi quando si caricano le registrazioni
      await updateCostiCantiere()
    } else {
      console.error('Errore nel caricamento delle registrazioni:', result.error)
    }
  } catch (error) {
    console.error('Errore nel caricamento delle registrazioni del giornale:', error)
  }
}

// 💰 ===== FUNZIONI GESTIONE COSTI =====

// Calcola e aggiorna i costi del cantiere
const updateCostiCantiere = async () => {
  if (!cantiere.value?.id) return
  
  try {
    // Calcola costi manodopera dalle registrazioni del giornale
    const costiManodopera = await calculateLaborCosts()
    
    // Calcola costi materiali utilizzati
    const costiMateriali = await calculateMaterialsCosts()
    
    // Statistiche generali
    const giorniLavorativi = entries.value.length
    const oreTotali = entries.value.reduce((sum, entry) => sum + (entry.oreTotali || 8), 0)
    const costiTotali = costiManodopera + costiMateriali
    const costoMedioGiorno = giorniLavorativi > 0 ? costiTotali / giorniLavorativi : 0
    
    // Aggiorna i costi locali
    costiCantiere.value = {
      manodopera: costiManodopera,
      materiali: costiMateriali,
      totale: costiTotali,
      giorniLavorativi,
      oreTotali,
      costoMedioGiorno
    }
    
    console.log('💰 Costi cantiere aggiornati:', costiCantiere.value)
    
  } catch (error) {
    console.error('Errore calcolo costi cantiere:', error)
  }
}

// Calcola i costi della manodopera dalle registrazioni del giornale
const calculateLaborCosts = async () => {
  if (!entries.value.length) return 0
  
  let costoTotale = 0
  
  for (const entry of entries.value) {
    // 🆕 Usa il team specifico della registrazione se disponibile, altrimenti fallback
    const teamGiorno = entry.teamPresente || entry.team || cantiere.value?.team || []
    const oreLavorate = entry.oreTotali || 8
    
    // Se il costo è già salvato nella registrazione, usalo direttamente
    if (entry.costoGiornata && entry.costoGiornata > 0) {
      costoTotale += entry.costoGiornata
    } else {
      // Calcola il costo per questa giornata basato sul team presente
      const costoGiornata = teamGiorno.reduce((sum, membro) => {
        // Paga oraria di default €25/h se non specificata
        const pagaOraria = membro.pagaOraria || 25
        return sum + (pagaOraria * oreLavorate)
      }, 0)
      
      costoTotale += costoGiornata
    }
  }
  
  return costoTotale
}

// Calcola i costi dei materiali utilizzati
const calculateMaterialsCosts = async () => {
  if (!cantiere.value?.id) return 0
  
  try {
    // Carica i materiali del cantiere dal Firestore
    const result = await firestoreStore.loadMaterialiCantiere(cantiere.value.id)
    
    if (!result.success || !result.data) return 0
    
    // Calcola il costo totale dei materiali utilizzati (non solo richiesti)
    const costoMateriali = result.data.reduce((total, materiale) => {
      const quantitaUtilizzata = materiale.quantitaUtilizzata || 0
      const prezzoUnitario = materiale.prezzoUnitario || 0
      return total + (quantitaUtilizzata * prezzoUnitario)
    }, 0)
    
    return costoMateriali
    
  } catch (error) {
    console.error('Errore calcolo costi materiali:', error)
    return 0
  }
}

// Funzione per aggiornare manualmente i costi (pulsante "Aggiorna")
const refreshCosts = async () => {
  await updateCostiCantiere()
  success('Costi Aggiornati', 'Calcoli costi cantiere completati!')
}

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
watch([() => entryForm.value.orarioInizio, () => entryForm.value.orarioFine], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    entryForm.value.oreTotali = calculateHours(newStart, newEnd)
  }
})

// ===== FINE FUNZIONI GESTIONE COSTI =====
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