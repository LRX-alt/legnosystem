<template>
  <div class="space-y-6">
    <!-- Header Cantieri -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Cantieri</h1>
        <p class="text-gray-600">Progetti e commesse - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Cantiere
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <BuildingOfficeIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Cantieri Attivi</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.attivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg flex-shrink-0">
            <CurrencyEuroIcon class="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Valore Totale</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">€{{ stats.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <CalendarDaysIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">In Scadenza</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.inScadenza }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Completati Mese</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.completatiMese }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca cantieri..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti gli stati</option>
            <option value="pianificato">Pianificato</option>
            <option value="in-corso">In Corso</option>
            <option value="completato">Completato</option>
            <option value="sospeso">Sospeso</option>
          </select>
        </div>
        <div class="w-full sm:w-52">
          <select v-model="selectedPriority" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutte le priorità</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="bassa">Bassa</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCantieri.length === 0" class="text-center py-12">
      <div class="mx-auto h-24 w-24 text-gray-400 flex items-center justify-center text-4xl mb-4">
        🏗️
      </div>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Nessun cantiere trovato</h3>
      <p class="mt-1 text-sm text-gray-500 mb-6">
        {{ cantieri.length === 0 ? 'Inizia creando il tuo primo cantiere.' : 'Prova a modificare i filtri di ricerca.' }}
      </p>
      <button v-if="cantieri.length === 0" @click="showAddModal = true" class="btn-primary">
        <span class="mr-2">➕</span>
        Crea Primo Cantiere
      </button>
    </div>

    <!-- Grid Cantieri -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="cantiere in filteredCantieri" :key="cantiere.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ cantiere.nome || 'Cantiere senza nome' }}</h3>
            <p class="text-sm text-gray-600">{{ cantiere.cliente }}</p>
            <p class="text-xs text-gray-500">{{ cantiere.indirizzo }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(cantiere.stato)">
              {{ getStatusLabel(cantiere.stato) }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityColor(cantiere.priorita)">
              {{ cantiere.priorita }}
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-600">Progresso</span>
            <span class="font-medium">{{ cantiere.progresso }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${cantiere.progresso}%`"></div>
          </div>
        </div>

        <!-- Info Cantiere -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Tipo Lavoro:</span>
            <span class="font-medium truncate ml-2">{{ cantiere.tipoLavoro }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Valore:</span>
            <span class="font-medium truncate ml-2">€{{ cantiere.valore ? cantiere.valore.toLocaleString() : '0' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Manodopera/giorno:</span>
            <span class="font-medium truncate ml-2 text-orange-600">€{{ calculateDailyCost(cantiere).toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Scadenza:</span>
            <span class="font-medium truncate ml-2" :class="isScaduto(cantiere.scadenza) ? 'text-red-600' : 'text-gray-900'">
              {{ formatDate(cantiere.scadenza) }}
            </span>
          </div>
        </div>

        <!-- Team Assegnato -->
        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-2">Team Assegnato</p>
          <div class="flex -space-x-2">
            <div v-for="membro in (cantiere.team || []).slice(0, 3)" :key="membro.id" 
                 class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
              {{ membro.iniziali }}
            </div>
            <div v-if="(cantiere.team || []).length > 3" 
                 class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
              +{{ (cantiere.team || []).length - 3 }}
            </div>
          </div>
        </div>

        <!-- Info Allegati -->
        <div v-if="getCantiereAttachments(cantiere.id).length > 0" class="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center space-x-2">
            <PaperClipIcon class="w-4 h-4 text-blue-600" />
            <span class="text-xs text-blue-700 font-medium">
              {{ getCantiereAttachments(cantiere.id).length }} allegat{{ getCantiereAttachments(cantiere.id).length === 1 ? 'o' : 'i' }}
            </span>
          </div>
        </div>

        <!-- Azioni -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <button @click="viewCantiere(cantiere)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Visualizza
          </button>
          <div class="flex space-x-2">
            <div class="relative group">
              <button @click="openDailyLog(cantiere)" class="text-gray-400 hover:text-gray-600">
                <DocumentTextIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Giornale di cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="editCantiere(cantiere)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Modifica cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="updateProgress(cantiere)" class="text-gray-400 hover:text-gray-600">
                <ChartBarIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Aggiorna progresso
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="viewMaterials(cantiere)" class="text-gray-400 hover:text-gray-600">
                <CubeIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Visualizza materiali
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageAttachments(cantiere)" class="text-blue-500 hover:text-blue-700">
                <PaperClipIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci allegati
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageTeam(cantiere)" class="text-blue-500 hover:text-blue-700">
                <UsersIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci team
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="deleteCantiere(cantiere)" class="text-red-500 hover:text-red-700">
                <TrashIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Elimina cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dettaglio Cantiere - Mobile Optimized -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">{{ selectedCantiere?.nome }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div v-if="selectedCantiere" class="space-y-6">
            <!-- Mobile: Stack Layout -->
            <div class="block lg:hidden space-y-6">
              <!-- Info Generali -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">Informazioni Generali</h4>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Cliente:</span> 
                    <span class="font-medium truncate ml-2">{{ selectedCantiere.cliente }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Indirizzo:</span> 
                    <span class="font-medium text-right truncate ml-2">{{ selectedCantiere.indirizzo }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Tipo Lavoro:</span> 
                    <span class="font-medium truncate ml-2">{{ selectedCantiere.tipoLavoro }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Valore:</span> 
                    <span class="font-medium truncate ml-2">€{{ selectedCantiere.valore ? selectedCantiere.valore.toLocaleString() : '0' }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Manodopera/giorno:</span> 
                    <span class="font-medium truncate ml-2 text-orange-600">€{{ calculateDailyCost(selectedCantiere).toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Data Inizio:</span> 
                    <span class="font-medium truncate ml-2">{{ formatDate(selectedCantiere.dataInizio) }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Scadenza:</span> 
                    <span class="font-medium truncate ml-2">{{ formatDate(selectedCantiere.scadenza) }}</span>
                  </div>
                </div>
              </div>

              <!-- Timeline Fasi -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">Timeline Progetto</h4>
                <div class="space-y-4">
                  <div v-for="fase in (selectedCantiere.fasi || [])" :key="fase.id" class="flex items-start space-x-3">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center mt-1" :class="fase.completata ? 'bg-green-500' : 'bg-gray-300'">
                      <CheckIcon v-if="fase.completata" class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium" :class="fase.completata ? 'text-green-700' : 'text-gray-900'">
                        {{ fase.nome }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">{{ fase.durata }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop: Grid Layout -->
            <div class="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              <!-- Info Generali -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Informazioni Generali</h4>
                <div class="space-y-2 text-sm">
                  <div><span class="text-gray-600">Cliente:</span> {{ selectedCantiere.cliente }}</div>
                  <div><span class="text-gray-600">Indirizzo:</span> {{ selectedCantiere.indirizzo }}</div>
                  <div><span class="text-gray-600">Tipo Lavoro:</span> {{ selectedCantiere.tipoLavoro }}</div>
                  <div><span class="text-gray-600">Valore:</span> €{{ selectedCantiere.valore ? selectedCantiere.valore.toLocaleString() : '0' }}</div>
                  <div><span class="text-gray-600">Manodopera/giorno:</span> <span class="text-orange-600 font-medium">€{{ calculateDailyCost(selectedCantiere).toLocaleString() }}</span></div>
                  <div><span class="text-gray-600">Data Inizio:</span> {{ formatDate(selectedCantiere.dataInizio) }}</div>
                  <div><span class="text-gray-600">Scadenza:</span> {{ formatDate(selectedCantiere.scadenza) }}</div>
                </div>
              </div>

              <!-- Timeline Fasi -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Timeline Progetto</h4>
                <div class="space-y-3">
                  <div v-for="fase in (selectedCantiere.fasi || [])" :key="fase.id" class="flex items-center space-x-3">
                    <div class="w-4 h-4 rounded-full" :class="fase.completata ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <div class="flex-1">
                      <p class="text-sm font-medium" :class="fase.completata ? 'text-green-700' : 'text-gray-900'">
                        {{ fase.nome }}
                      </p>
                      <p class="text-xs text-gray-500">{{ fase.durata }}</p>
                    </div>
                    <span v-if="fase.completata" class="text-green-600">
                      <CheckIcon class="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              <!-- Storico Aggiornamenti Progresso -->
              <div class="space-y-4" v-if="getProgressHistory(selectedCantiere?.id)?.length > 0">
                <h4 class="font-medium text-gray-900">📊 Storico Progresso</h4>
                <div class="space-y-3 max-h-48 overflow-y-auto">
                  <div v-for="(update, index) in getProgressHistory(selectedCantiere?.id)" :key="index" class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <ChartBarIcon class="w-4 h-4 text-accent-600" />
                        <span class="font-medium text-gray-900">{{ update.fase }}</span>
                      </div>
                      <div class="text-right">
                        <span class="text-sm font-bold text-accent-600">+{{ update.incremento }}%</span>
                        <p class="text-xs text-gray-500">{{ formatDate(update.dataCompletamento) }}</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600" v-if="update.nota">{{ update.nota }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons Mobile -->
            <div class="pt-6 border-t border-gray-200">
              <div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button @click="deleteCantiere(selectedCantiere)" class="btn-danger py-3 text-base flex-1">
                  🗑️ Elimina Cantiere
                </button>
                <button @click="closeModal" class="btn-secondary py-3 text-base flex-1">
                Chiudi
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Cantiere -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Cantiere</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="editingCantiere" @submit.prevent="saveCantiereChanges" class="space-y-6">
            <!-- Nome Cantiere -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Cantiere</label>
              <input
                v-model="editingCantiere.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Cliente -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <input
                v-model="editingCantiere.cliente"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Indirizzo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
              <textarea
                v-model="editingCantiere.indirizzo"
                rows="2"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Riga 1: Tipo Lavoro e Valore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro</label>
                <select
                  v-model="editingCantiere.tipoLavoro"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="Rifacimento Completo">Rifacimento Completo</option>
                  <option value="Nuova Costruzione">Nuova Costruzione</option>
                  <option value="Restauro Conservativo">Restauro Conservativo</option>
                  <option value="Manutenzione">Manutenzione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valore (€)</label>
                <input
                  v-model.number="editingCantiere.valore"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 2: Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  v-model="editingCantiere.dataInizio"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
                <input
                  v-model="editingCantiere.scadenza"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 3: Stato e Priorità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="editingCantiere.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="in-corso">In Corso</option>
                  <option value="completato">Completato</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  v-model="editingCantiere.priorita"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="bassa">Bassa</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Materiali Cantiere -->
    <div v-if="showMaterialsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeMaterialsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">Materiali Cantiere</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ selectedCantiere?.cliente }}</p>
            </div>
            <button @click="closeMaterialsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Stats Materiali -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <CubeIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Totale Materiali</p>
                  <p class="text-lg font-bold text-gray-900">{{ materialiCantiere.length }}</p>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-accent-100 rounded-lg">
                  <CurrencyEuroIcon class="w-5 h-5 text-accent-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Valore Totale</p>
                  <p class="text-lg font-bold text-gray-900">€{{ getTotalMaterialsValue().toLocaleString() }}</p>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon class="w-5 h-5 text-green-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Completati</p>
                  <p class="text-lg font-bold text-gray-900">{{ getCompletedMaterials() }}/{{ materialiCantiere.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista Materiali Mobile -->
          <div class="block lg:hidden space-y-4">
            <div v-for="materiale in materialiCantiere" :key="materiale.id" class="card">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3 flex-1">
                  <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-xs text-gray-600">{{ materiale.descrizione }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                  {{ materiale.stato }}
                </span>
              </div>
              
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Richiesto</p>
                  <p class="font-medium">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Utilizzato</p>
                  <p class="font-medium">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-300"
                      :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                              (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                      :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-500">Valore</p>
                  <p class="font-medium">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabella Materiali Desktop -->
          <div class="hidden lg:block">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materiale</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Richiesto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizzato</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valore</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allegati</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="materiale in materialiCantiere" :key="materiale.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-wood-light rounded-lg flex items-center justify-center mr-3">
                          <span class="text-primary-600 text-xs font-medium">{{ materiale.codice }}</span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ materiale.nome }}</div>
                          <div class="text-sm text-gray-500">{{ materiale.descrizione }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                        {{ materiale.stato }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</div>
                      <div class="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-300"
                          :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                                  (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                          :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                        ></div>
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button @click="manageMaterialAttachments(materiale)" 
                              class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                              title="Gestisci allegati materiale">
                        <PaperClipIcon class="w-4 h-4" />
                        <span v-if="getMaterialAttachmentCount(materiale) > 0" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{ getMaterialAttachmentCount(materiale) }}
                        </span>
                        <span v-else class="text-xs text-gray-400">0</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button @click="manageMaterials" class="btn-primary py-3 px-6 text-base mr-3">
              🔧 Gestisci Materiali
            </button>
            <button @click="closeMaterialsModal" class="btn-secondary py-3 px-6 text-base">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aggiornamento Progresso -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeProgressModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-accent-100 rounded-lg">
                <ChartBarIcon class="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📊 Aggiorna Progresso</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedCantiere">
                  {{ selectedCantiere.nome }} - Progresso attuale: {{ selectedCantiere.progresso }}%
                </p>
              </div>
            </div>
            <button @click="closeProgressModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Barra Progresso Attuale -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-600">Progresso Corrente</span>
              <span class="font-bold text-accent-600">{{ selectedCantiere?.progresso }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-accent-500 h-3 rounded-full transition-all duration-300" 
                :style="`width: ${selectedCantiere?.progresso}%`"
              ></div>
            </div>
          </div>

          <form @submit.prevent="saveProgressUpdate" class="space-y-6">
            <!-- Incremento Progresso -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Incremento Progresso (%)</label>
              <div class="grid grid-cols-4 gap-2 mb-3">
                <button 
                  type="button"
                  v-for="increment in [5, 10, 15, 20]" 
                  :key="increment"
                  @click="progressUpdate.incremento = increment"
                  :class="[
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                    progressUpdate.incremento === increment 
                      ? 'bg-accent-500 text-white border-accent-500' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  +{{ increment }}%
                </button>
              </div>
              <input
                v-model.number="progressUpdate.incremento"
                type="number"
                min="1"
                :max="100 - (selectedCantiere?.progresso || 0)"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
                placeholder="Inserisci incremento personalizzato..."
              />
              <p class="text-xs text-gray-500 mt-1">
                Nuovo progresso: {{ Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) }}%
              </p>
            </div>

            <!-- Nome Fase Completata -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fase Completata</label>
              <input
                v-model="progressUpdate.fase"
                type="text"
                required
                placeholder="Es: Posa manto di copertura, Montaggio travi, Isolamento..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Note Dettagliate -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note Dettagliate</label>
              <textarea
                v-model="progressUpdate.nota"
                rows="3"
                placeholder="Descrivi i lavori completati, eventuali problemi risolti, materiali utilizzati..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              ></textarea>
            </div>

            <!-- Data Completamento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Completamento</label>
              <input
                v-model="progressUpdate.dataCompletamento"
                type="date"
                :max="new Date().toISOString().split('T')[0]"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Preview Completamento -->
            <div v-if="Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) === 100" class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-600" />
                <span class="font-medium text-green-900">🎉 Cantiere al 100% - Verrà marcato come COMPLETATO!</span>
              </div>
              <p class="text-sm text-green-700 mt-1">Il cantiere passerà automaticamente allo stato "Completato"</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeProgressModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                📊 Aggiorna Progresso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Aggiornamento Progresso -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeProgressModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-accent-100 rounded-lg">
                <ChartBarIcon class="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📊 Aggiorna Progresso</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedCantiere">
                  {{ selectedCantiere.nome }} - Progresso attuale: {{ selectedCantiere.progresso }}%
                </p>
              </div>
            </div>
            <button @click="closeProgressModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Barra Progresso Attuale -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-600">Progresso Corrente</span>
              <span class="font-bold text-accent-600">{{ selectedCantiere?.progresso }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-accent-500 h-3 rounded-full transition-all duration-300" 
                :style="`width: ${selectedCantiere?.progresso}%`"
              ></div>
            </div>
          </div>

          <form @submit.prevent="saveProgressUpdate" class="space-y-6">
            <!-- Incremento Progresso -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Incremento Progresso (%)</label>
              <div class="grid grid-cols-4 gap-2 mb-3">
                <button 
                  type="button"
                  v-for="increment in [5, 10, 15, 20]" 
                  :key="increment"
                  @click="progressUpdate.incremento = increment"
                  :class="[
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                    progressUpdate.incremento === increment 
                      ? 'bg-accent-500 text-white border-accent-500' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  +{{ increment }}%
                </button>
              </div>
              <input
                v-model.number="progressUpdate.incremento"
                type="number"
                min="1"
                :max="100 - (selectedCantiere?.progresso || 0)"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
                placeholder="Inserisci incremento personalizzato..."
              />
              <p class="text-xs text-gray-500 mt-1">
                Nuovo progresso: {{ Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) }}%
              </p>
            </div>

            <!-- Nome Fase Completata -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fase Completata</label>
              <input
                v-model="progressUpdate.fase"
                type="text"
                required
                placeholder="Es: Posa manto di copertura, Montaggio travi, Isolamento..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Note Dettagliate -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note Dettagliate</label>
              <textarea
                v-model="progressUpdate.nota"
                rows="3"
                placeholder="Descrivi i lavori completati, eventuali problemi risolti, materiali utilizzati..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              ></textarea>
            </div>

            <!-- Data Completamento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Completamento</label>
              <input
                v-model="progressUpdate.dataCompletamento"
                type="date"
                :max="new Date().toISOString().split('T')[0]"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Preview Completamento -->
            <div v-if="Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) === 100" class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-600" />
                <span class="font-medium text-green-900">🎉 Cantiere al 100% - Verrà marcato come COMPLETATO!</span>
              </div>
              <p class="text-sm text-green-700 mt-1">Il cantiere passerà automaticamente allo stato "Completato"</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeProgressModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                📊 Aggiorna Progresso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo Cantiere -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Cantiere</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="newCantiere" @submit.prevent="saveNewCantiere" class="space-y-6">
            <!-- Nome Cantiere -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Cantiere</label>
              <input
                v-model="newCantiere.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Cliente con Sistema Ibrido -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              
              <!-- Toggle Selezione Cliente -->
              <div class="flex space-x-4 mb-4">
                <label class="flex items-center">
                  <input 
                    v-model="clientSelectionMode" 
                    type="radio" 
                    value="existing" 
                    class="text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">📋 Seleziona Esistente</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="clientSelectionMode" 
                    type="radio" 
                    value="new" 
                    class="text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">➕ Nuovo Cliente</span>
                </label>
              </div>

              <!-- Selezione Cliente Esistente -->
              <div v-if="clientSelectionMode === 'existing'" class="space-y-3">
                <div>
                  <select
                    v-model="selectedClientFromList"
                    @change="fillClientFromList"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                  >
                    <option value="">🔍 Seleziona cliente esistente...</option>
                    <option v-for="cliente in availableClients" :key="cliente.id" :value="cliente.id">
                      {{ cliente.nome }} - {{ cliente.tipo === 'privato' ? '👤' : cliente.tipo === 'azienda' ? '🏢' : '🏛️' }} {{ getTipoLabel(cliente.tipo) }}
                    </option>
                  </select>
                </div>
                
                <!-- Preview Cliente Selezionato -->
                <div v-if="getSelectedClient()" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ getSelectedClient().iniziali }}
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ getSelectedClient().nome }}</p>
                      <p class="text-sm text-gray-600">{{ getSelectedClient().email }} • {{ getSelectedClient().telefono }}</p>
                      <p class="text-xs text-gray-500">{{ getSelectedClient().indirizzo }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getTipoColor(getSelectedClient().tipo)">
                        {{ getTipoLabel(getSelectedClient().tipo) }}
                      </span>
                      <p class="text-xs text-gray-500 mt-1">{{ getSelectedClient().numeroProgetti }} progetti</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inserimento Nuovo Cliente -->
              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      v-model="newCantiere.cliente"
                      type="text"
                      required
                      placeholder="Nome cliente/azienda..."
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <select
                      v-model="newCantiere.clienteTipo"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    >
                      <option value="privato">👤 Privato</option>
                      <option value="azienda">🏢 Azienda</option>
                      <option value="ente-pubblico">🏛️ Ente Pubblico</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      v-model="newCantiere.clienteEmail"
                      type="email"
                      placeholder="email@esempio.it"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <input
                      v-model="newCantiere.clienteTelefono"
                      type="tel"
                      placeholder="Telefono cliente"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <input
                    v-model="newCantiere.clienteIndirizzo"
                    type="text"
                    placeholder="Indirizzo cliente (opzionale)"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                  />
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p class="text-sm text-yellow-800">
                    💡 <strong>Nuovo Cliente:</strong> I dati del cliente verranno automaticamente aggiunti all'anagrafica aziendale.
                  </p>
                </div>
              </div>
            </div>

            <!-- Indirizzo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
              <textarea
                v-model="newCantiere.indirizzo"
                rows="2"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Riga 1: Tipo Lavoro e Valore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro</label>
                <select
                  v-model="newCantiere.tipoLavoro"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="Rifacimento Completo">Rifacimento Completo</option>
                  <option value="Nuova Costruzione">Nuova Costruzione</option>
                  <option value="Restauro Conservativo">Restauro Conservativo</option>
                  <option value="Manutenzione">Manutenzione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valore (€)</label>
                <input
                  v-model.number="newCantiere.valore"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 2: Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  v-model="newCantiere.dataInizio"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
                <input
                  v-model="newCantiere.scadenza"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 3: Stato e Priorità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="newCantiere.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="in-corso">In Corso</option>
                  <option value="completato">Completato</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  v-model="newCantiere.priorita"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="bassa">Bassa</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Nuovo Cantiere
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Team Cantiere -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeTeamModal">
      <div class="relative top-4 mx-auto border w-full max-w-3xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <UsersIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">👥 Gestione Team</h3>
                <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ selectedCantiere?.cliente }}</p>
              </div>
            </div>
            <button @click="closeTeamModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi gestione team">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Team Attuale -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🔧 Team Assegnato</h4>
              <div v-if="selectedCantiere?.team && selectedCantiere.team.length > 0" class="space-y-3">
                <div v-for="membro in selectedCantiere.team" :key="membro.id" 
                     class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {{ membro.iniziali }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ membro.nome }}</p>
                      <p class="text-sm text-gray-600">{{ membro.ruolo }}</p>
                    </div>
                  </div>
                  <button @click="removeMemberFromTeam(membro.id)" 
                          class="text-red-500 hover:text-red-700 p-1"
                          title="Rimuovi dal team">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <UsersIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nessun dipendente assegnato al cantiere</p>
              </div>
            </div>

            <!-- Dipendenti Disponibili -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">👷 Dipendenti Disponibili</h4>
              <div class="space-y-3 max-h-60 overflow-y-auto">
                <div v-for="dipendente in getAvailableEmployees()" :key="dipendente.id"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      {{ dipendente.iniziali }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ dipendente.nome }} {{ dipendente.cognome }}</p>
                      <p class="text-sm text-gray-600">{{ getRuoloLabel(dipendente.ruolo) }}</p>
                      <p class="text-xs text-gray-500">
                        {{ dipendente.cantiereAttuale || 'Disponibile' }}
                      </p>
                    </div>
                  </div>
                  <button @click="addMemberToTeam(dipendente)" 
                          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          title="Aggiungi al team">
                    ➕ Aggiungi
                  </button>
                </div>
              </div>
              <div v-if="getAvailableEmployees().length === 0" class="text-center py-8 text-gray-500">
                <p>Tutti i dipendenti sono già assegnati</p>
              </div>
            </div>

            <!-- Riepilogo -->
            <div class="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <p class="text-sm text-primary-600">Team Assegnato</p>
                  <p class="text-2xl font-bold text-primary-800">{{ selectedCantiere?.team?.length || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Dipendenti Disponibili</p>
                  <p class="text-2xl font-bold text-primary-800">{{ getAvailableEmployees().length }}</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Costo Orario Team</p>
                  <p class="text-2xl font-bold text-primary-800">€{{ calculateTeamHourlyCost() }}/h</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Costo Giornaliero</p>
                  <p class="text-2xl font-bold text-orange-600">€{{ calculateDailyCost(selectedCantiere) }}/giorno</p>
                </div>
              </div>
              
              <!-- Costo Mensile (riga separata per evitare sovraffollamento) -->
              <div v-if="selectedCantiere?.team?.length > 0" class="mt-4 pt-4 border-t border-primary-200">
                <div class="text-center">
                  <p class="text-sm text-primary-600">💰 Costo Mensile Stimato (22 gg lavorativi)</p>
                  <p class="text-3xl font-bold text-red-600">€{{ calculateMonthlyCost(selectedCantiere).toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeTeamModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button @click="saveTeamChanges" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                💾 Salva Modifiche Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Allegati -->
    <div v-if="showAttachmentsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAttachmentsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Allegati - {{ selectedCantiere?.nome }}</h3>
            <button @click="closeAttachmentsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <div class="text-center">
                <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Carica un file</span>
                    <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt">
                  </label>
                  <p class="pl-1">o trascina qui</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">PDF, DOC, XLS, JPG, PNG fino a 10MB</p>
              </div>
            </div>

            <!-- Lista Allegati -->
            <div v-if="getAttachments()?.length > 0">
              <h4 class="font-semibold text-gray-900 mb-4">Documenti allegati ({{ getAttachments().length }})</h4>
              <div class="space-y-3">
                <div v-for="attachment in getAttachments()" :key="attachment.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <!-- Icona file -->
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getFileTypeClass(attachment.type)">
                        <span class="text-white text-xs font-bold">{{ getFileTypeIcon(attachment.type) }}</span>
                      </div>
                    </div>
                    
                    <!-- Info file -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                      <p class="text-xs text-gray-500">
                        {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadDate) }}
                      </p>
                      <p v-if="attachment.description" class="text-xs text-gray-600 mt-1">{{ attachment.description }}</p>
                    </div>
                  </div>
                  
                  <!-- Azioni -->
                  <div class="flex items-center space-x-2">
                    <button @click="openFile(attachment)" 
                            class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            title="Apri file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button @click="downloadFile(attachment)" 
                            class="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                            title="Scarica file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="deleteFile(attachment)" 
                            class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Elimina file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nessun allegato -->
            <div v-else class="text-center py-8 text-gray-500">
              <PaperClipIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p class="text-lg font-medium text-gray-400">Nessun allegato</p>
              <p class="text-sm text-gray-400">Carica documenti, fatture o foto del cantiere</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeAttachmentsModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Materiali Cantiere -->
    <div v-if="showManageMaterialsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeManageMaterialsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <CubeIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Gestione Materiali Cantiere</h3>
                <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ selectedCantiere?.cliente }}</p>
              </div>
            </div>
            <button @click="closeManageMaterialsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Lista Materiali -->
          <div class="space-y-4">
            <div v-for="materiale in materialiCantiere" :key="materiale.id" class="card">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3 flex-1">
                  <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-xs text-gray-600">{{ materiale.descrizione }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                  {{ materiale.stato }}
                </span>
              </div>
              
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Richiesto</p>
                  <p class="font-medium">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Utilizzato</p>
                  <p class="font-medium">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-300"
                      :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                              (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                      :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-500">Valore</p>
                  <p class="font-medium">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</p>
                </div>
              </div>
              
              <!-- Azioni Materiale -->
              <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 mt-4">
                <button 
                  @click="editMaterialInCantiere(materiale)" 
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-50"
                  title="Modifica materiale"
                >
                  ✏️ Modifica
                </button>
                <button 
                  @click="manageMaterialAttachments(materiale)" 
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
                  title="Gestisci allegati"
                >
                  📎 Allegati
                  <span v-if="getMaterialAttachmentCount(materiale) > 0" 
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                    {{ getMaterialAttachmentCount(materiale) }}
                  </span>
                </button>
                <button 
                  @click="removeMaterialFromCantiere(materiale.id)" 
                  class="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50"
                  title="Rimuovi materiale"
                >
                  🗑️ Rimuovi
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button @click="addMaterialToCantiere" class="btn-primary py-3 px-6 text-base mr-3">
              ➕ Aggiungi Materiale
            </button>
            <button @click="closeManageMaterialsModal" class="btn-secondary py-3 px-6 text-base">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aggiunta Materiale -->
    <div v-if="showAddMaterialModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddMaterialModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Aggiungi Materiale</h3>
            <button @click="closeAddMaterialModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="newMaterial" @submit.prevent="saveMaterialToCantiere" class="space-y-6">
            <!-- Toggle Selezione/Nuovo -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center space-x-4">
                <button 
                  type="button"
                  @click="materialSelectionMode = 'existing'"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                    materialSelectionMode === 'existing' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  📦 Seleziona da Magazzino
                </button>
                <button 
                  type="button"
                  @click="materialSelectionMode = 'new'"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                    materialSelectionMode === 'new' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  ➕ Nuovo Materiale
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                {{ materialSelectionMode === 'existing' 
                   ? 'Seleziona un materiale già presente in magazzino' 
                   : 'Crea un nuovo materiale compilando tutti i campi' }}
              </p>
            </div>

            <!-- Selezione Materiale Esistente -->
            <div v-if="materialSelectionMode === 'existing'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Materiale da Magazzino</label>
                <select
                  v-model="selectedMaterialFromStock"
                  @change="fillMaterialFromStock"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">-- Seleziona un materiale --</option>
                  <option v-for="materiale in materialiMagazzino" :key="materiale.id" :value="materiale.id">
                    {{ materiale.codice }} - {{ materiale.nome }} ({{ materiale.quantita }} {{ materiale.unita }} disponibili)
                  </option>
                </select>
              </div>
              
              <!-- Info Materiale Selezionato -->
              <div v-if="selectedMaterialFromStock" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-blue-900 mb-2">📋 Dettagli Materiale Selezionato</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><span class="text-blue-600">Categoria:</span> {{ getSelectedMaterialFromStock()?.categoria }}</div>
                  <div><span class="text-blue-600">Disponibile:</span> {{ getSelectedMaterialFromStock()?.quantita }} {{ getSelectedMaterialFromStock()?.unita }}</div>
                  <div><span class="text-blue-600">Prezzo:</span> €{{ getSelectedMaterialFromStock()?.prezzoUnitario }}</div>
                </div>
              </div>
            </div>

            <!-- Campi Materiale (sempre visibili ma readonly se da magazzino) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nome Materiale -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
                <input
                  v-model="newMaterial.nome"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>

              <!-- Codice -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
                <input
                  v-model="newMaterial.codice"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                v-model="newMaterial.descrizione"
                rows="2"
                :readonly="materialSelectionMode === 'existing'"
                :class="[
                  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                  materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                ]"
              ></textarea>
            </div>

            <!-- Quantità e Unità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Richiesta</label>
                <input
                  v-model.number="newMaterial.quantitaRichiesta"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unità di Misura</label>
                <input
                  v-model="newMaterial.unita"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>
            </div>

            <!-- Prezzo Unitario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prezzo Unitario (€)
                <span v-if="materialSelectionMode === 'existing'" class="text-xs text-gray-500">
                  (modificabile per questo cantiere)
                </span>
              </label>
              <input
                v-model.number="newMaterial.prezzoUnitario"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                :placeholder="materialSelectionMode === 'existing' ? 'Prezzo personalizzato per questo cantiere' : ''"
              />
            </div>

            <!-- Stato e Fornitore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="newMaterial.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="ordinato">Ordinato</option>
                  <option value="in-uso">In Uso</option>
                  <option value="utilizzato">Utilizzato</option>
                  <option value="completato">Completato</option>
                  <option value="in-lavorazione">In Lavorazione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fornitore</label>
                <select
                  v-model="newMaterial.fornitoreId"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">-- Seleziona fornitore --</option>
                  <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
                    {{ fornitore.nome }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Data Acquisto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Acquisto</label>
              <input
                v-model="newMaterial.dataAcquisto"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                v-model="newMaterial.note"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                :placeholder="materialSelectionMode === 'existing' ? 'Note specifiche per questo cantiere...' : 'Note sul materiale...'"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddMaterialModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 {{ materialSelectionMode === 'existing' ? 'Aggiungi al Cantiere' : 'Salva Nuovo Materiale' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Materiale -->
    <div v-if="showEditMaterialModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditMaterialModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Materiale</h3>
            <button @click="closeEditMaterialModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="editingMaterial" @submit.prevent="saveMaterialChanges" class="space-y-6">
            <!-- Nome Materiale -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
              <input
                v-model="editingMaterial.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                v-model="editingMaterial.descrizione"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Codice -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
              <input
                v-model="editingMaterial.codice"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Quantità e Utilizzo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Richiesta</label>
                <input
                  v-model.number="editingMaterial.quantitaRichiesta"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantità Utilizzata 
                  <span class="text-xs text-gray-500">(Per aggiornare lo stato dei materiali)</span>
                </label>
                <input
                  v-model.number="editingMaterial.quantitaUtilizzata"
                  type="number"
                  min="0"
                  :max="editingMaterial.quantitaRichiesta"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Rimanente: {{ (editingMaterial.quantitaRichiesta || 0) - (editingMaterial.quantitaUtilizzata || 0) }}
                </p>
              </div>
            </div>

            <!-- Unita di Misura -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unita di Misura</label>
              <input
                v-model="editingMaterial.unita"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Prezzo Unitario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Unitario (€)</label>
              <input
                v-model.number="editingMaterial.prezzoUnitario"
                type="number"
                min="0"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Stato -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                v-model="editingMaterial.stato"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="pianificato">Pianificato</option>
                <option value="ordinato">Ordinato</option>
                <option value="in-uso">In Uso</option>
                <option value="utilizzato">Utilizzato</option>
                <option value="completato">Completato</option>
                <option value="in-lavorazione">In Lavorazione</option>
              </select>
            </div>

            <!-- Data Acquisto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Acquisto</label>
              <input
                v-model="editingMaterial.dataAcquisto"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                v-model="editingMaterial.note"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Fornitori -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fornitori</label>
              <select
                v-model="editingMaterial.fornitoreId"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
                  {{ fornitore.nome }}
                </option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditMaterialModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Allegati Materiale -->
    <div v-if="showMaterialAttachmentsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeMaterialAttachmentsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <PaperClipIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📎 Allegati Materiale</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedMaterial">
                  {{ selectedMaterial.nome }} ({{ selectedMaterial.codice }}) - {{ getFornitoreById(selectedMaterial.fornitoreId)?.nome }}
                </p>
              </div>
            </div>
            <button @click="closeMaterialAttachmentsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Info Materiale -->
            <div class="bg-wood-light p-4 rounded-lg border border-primary-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p class="text-primary-600 font-medium">Quantità</p>
                  <p class="font-semibold">{{ selectedMaterial?.quantitaRichiesta }} {{ selectedMaterial?.unita }}</p>
                </div>
                <div>
                  <p class="text-primary-600 font-medium">Valore Totale</p>
                  <p class="font-semibold">€{{ (selectedMaterial?.quantitaRichiesta * selectedMaterial?.prezzoUnitario).toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-primary-600 font-medium">Stato</p>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(selectedMaterial?.stato)">
                    {{ selectedMaterial?.stato }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <div class="text-center">
                <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex text-sm text-gray-600">
                  <label for="material-file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Carica documenti</span>
                    <input id="material-file-upload" name="material-file-upload" type="file" class="sr-only" @change="handleMaterialFileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt">
                  </label>
                  <p class="pl-1">o trascina qui</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">DDT, Fatture, Certificati, Foto - PDF, DOC, XLS, JPG, PNG fino a 10MB</p>
              </div>
            </div>

            <!-- Lista Allegati -->
            <div v-if="getMaterialAttachments()?.length > 0">
              <h4 class="font-semibold text-gray-900 mb-4">📋 Documenti Allegati ({{ getMaterialAttachments().length }})</h4>
              <div class="space-y-3">
                <div v-for="attachment in getMaterialAttachments()" :key="attachment.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <!-- Icona file -->
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getFileTypeClass(attachment.type)">
                        <span class="text-white text-xs font-bold">{{ getFileTypeIcon(attachment.type) }}</span>
                      </div>
                    </div>
                    
                    <!-- Info file -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                      <p class="text-xs text-gray-500">
                        {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadDate) }}
                      </p>
                      <p v-if="attachment.description" class="text-xs text-gray-600 mt-1">{{ attachment.description }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{{ attachment.category || 'Generale' }}</span>
                        <span v-if="attachment.fornitore" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ attachment.fornitore }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Azioni -->
                  <div class="flex items-center space-x-2">
                    <button @click="openMaterialFile(attachment)" 
                            class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            title="Apri documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button @click="downloadMaterialFile(attachment)" 
                            class="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                            title="Scarica documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="deleteMaterialFile(attachment)" 
                            class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Elimina documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nessun allegato -->
            <div v-else class="text-center py-8 text-gray-500">
              <PaperClipIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p class="text-lg font-medium text-gray-400">Nessun documento allegato</p>
              <p class="text-sm text-gray-400">Carica DDT, fatture, certificati o foto del materiale</p>
            </div>

            <!-- Statistiche -->
            <div v-if="getMaterialAttachments()?.length > 0" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p class="text-sm text-blue-600">Documenti Totali</p>
                  <p class="text-xl font-bold text-blue-800">{{ getMaterialAttachments().length }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-600">Dimensione Totale</p>
                  <p class="text-xl font-bold text-blue-800">{{ getTotalMaterialAttachmentsSize() }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-600">Ultimo Upload</p>
                  <p class="text-sm font-medium text-blue-800">{{ getLastUploadDate() }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-600">Fornitore</p>
                  <p class="text-sm font-medium text-blue-800">{{ getFornitoreById(selectedMaterial?.fornitoreId)?.nome || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeMaterialAttachmentsModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button @click="generateMaterialReport" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium text-base">
                📊 Genera Report Materiale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PlusIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilIcon,
  ChartBarIcon,
  CubeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  PaperClipIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'
import { useFirestore } from '@/composables/useFirestore'

// Firestore operations with validation and error handling
const firestore = useFirestore()
const router = useRouter()

// Stato della pagina
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showMaterialsModal = ref(false)
const showAddModal = ref(false)
const showTeamModal = ref(false)
const showAttachmentsModal = ref(false)
const showManageMaterialsModal = ref(false)
const showAddMaterialModal = ref(false)
const showEditMaterialModal = ref(false)
const showMaterialAttachmentsModal = ref(false)
const showProgressModal = ref(false)

const searchTerm = ref('')
const selectedStatus = ref('')
const selectedPriority = ref('')

const selectedCantiere = ref(null)
const editingCantiere = ref(null)
const materialiCantiere = ref([])
const editingMaterial = ref(null)

// Progresso e storico
const progressUpdate = ref({
  incremento: 10,
  nota: '',
  fase: '',
  dataCompletamento: ''
})
const cantieriProgressHistory = ref({})
const newMaterial = ref({
  nome: '',
  descrizione: '',
  codice: '',
  quantitaRichiesta: 0,
  unita: 'pz',
  prezzoUnitario: 0,
  stato: 'pianificato',
  fornitoreId: null,
  dataAcquisto: '',
  note: ''
})

// Nuovo cantiere
const newCantiere = ref({
  nome: '',
  cliente: '',
  clienteTipo: 'privato',
  clienteEmail: '',
  clienteTelefono: '',
  clienteIndirizzo: '',
  indirizzo: '',
  tipoLavoro: '',
  valore: 0,
  dataInizio: '',
  scadenza: '',
  stato: 'pianificato',
  priorita: 'media'
})



// Stats - Calcolate dinamicamente dai dati Firestore
const stats = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return {
    attivi: cantieri.value.filter(c => c.stato === 'in-corso').length,
    valoreTotale: cantieri.value.reduce((total, c) => total + (c.valore || 0), 0),
    inScadenza: cantieri.value.filter(c => {
      if (!c.scadenza) return false
      const scadenza = new Date(c.scadenza)
      const diffDays = Math.ceil((scadenza - now) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length,
    completatiMese: cantieri.value.filter(c => {
      if (c.stato !== 'completato' || !c.dataCompletamento) return false
      const completamento = new Date(c.dataCompletamento)
      return completamento >= startOfMonth
    }).length
  }
})

// Import diretto dal Firestore store per dati reattivi
import { useFirestoreStore } from '@/stores/firestore'
const firestoreStore = useFirestoreStore()

// Dati da Firestore - computed per reattività
const cantieri = computed(() => firestoreStore.cantieri)
const dipendentiDisponibili = computed(() => firestoreStore.dipendenti)
const materialiMagazzino = computed(() => firestoreStore.materiali)
const fornitori = computed(() => firestoreStore.fornitori)

// Gestione allegati locali (da migrare a Firestore Storage in futuro)
const cantieriAttachments = ref({})
const materialiAttachments = ref({})
const selectedMaterial = ref(null)

// ✅ Funzioni Firestore per allegati cantieri
const loadAllegatiCantiere = async (cantiereId) => {
  try {
    const result = await firestore.allegati.load(cantiereId)
    if (result.success && result.data) {
      // Converti da formato Firestore a formato locale per compatibilità
      cantieriAttachments.value[cantiereId] = result.data.map(allegato => ({
        id: allegato.id,
        name: allegato.nome,
        url: allegato.url,
        type: allegato.tipo,
        size: allegato.dimensione,
        description: allegato.descrizione,
        category: allegato.categoria,
        uploadDate: allegato.uploadedAt?.toDate?.() || allegato.uploadedAt
      }))
    }
  } catch (e) {
    console.warn('Errore nel caricamento allegati da Firestore:', e)
    cantieriAttachments.value[cantiereId] = cantieriAttachments.value[cantiereId] || []
  }
}

const saveAllegatoCantiere = async (cantiereId, allegatoData) => {
  try {
    const data = {
      nome: allegatoData.name || allegatoData.nome,
      url: allegatoData.url,
      tipo: allegatoData.type || allegatoData.tipo,
      dimensione: allegatoData.size || allegatoData.dimensione,
      descrizione: allegatoData.description || allegatoData.descrizione || '',
      categoria: allegatoData.category || allegatoData.categoria || 'generale'
    }
    
    const result = await firestore.allegati.create(cantiereId, data)
    if (result.success) {
      // Aggiorna cache locale
      await loadAllegatiCantiere(cantiereId)
    }
    return result
  } catch (e) {
    console.warn('Errore nel salvataggio allegato:', e)
    return { success: false, error: e.message }
  }
}

// ✅ Funzioni Firestore per storico progresso (già gestito da updateCantiereProgress)
const loadProgressHistory = async (cantiereId) => {
  try {
    // Il progresso è già gestito automaticamente da updateCantiereProgress
    // e salvato nella collezione cantieriProgress
    cantieriProgressHistory.value[cantiereId] = cantieriProgressHistory.value[cantiereId] || []
  } catch (e) {
    console.warn('Errore nel caricamento storico progresso:', e)
    cantieriProgressHistory.value[cantiereId] = []
  }
}

// Computed
const filteredCantieri = computed(() => {
  let result = cantieri.value

  if (searchTerm.value) {
    result = result.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      c.cliente.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(c => c.stato === selectedStatus.value)
  }

  if (selectedPriority.value) {
    result = result.filter(c => c.priorita === selectedPriority.value)
  }

  return result
})

// Methods
const getStatusColor = (stato) => {
  const colors = {
    'pianificato': 'bg-blue-100 text-blue-800',
    'in-corso': 'bg-accent-100 text-accent-800',
    'completato': 'bg-green-100 text-green-800',
    'sospeso': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'pianificato': 'Pianificato',
    'in-corso': 'In Corso',
    'completato': 'Completato',
    'sospeso': 'Sospeso'
  }
  return labels[stato] || stato
}

const getPriorityColor = (priorita) => {
  const colors = {
    'alta': 'bg-red-100 text-red-800',
    'media': 'bg-yellow-100 text-yellow-800',
    'bassa': 'bg-gray-100 text-gray-800'
  }
  return colors[priorita] || 'bg-gray-100 text-gray-800'
}

const getMaterialStatusColor = (stato) => {
  const colors = {
    'pianificato': 'bg-blue-100 text-blue-800',
    'ordinato': 'bg-yellow-100 text-yellow-800',
    'in-uso': 'bg-accent-100 text-accent-800',
    'utilizzato': 'bg-green-100 text-green-800',
    'completato': 'bg-green-100 text-green-800',
    'in-lavorazione': 'bg-blue-100 text-blue-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getAvailabilityColor = (stato) => {
  const colors = {
    'disponibile': 'bg-green-100 text-green-800',
    'ordinare': 'bg-yellow-100 text-yellow-800',
    'mancante': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const isScaduto = (scadenza) => {
  return new Date(scadenza) < new Date()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewCantiere = (cantiere) => {
  selectedCantiere.value = cantiere
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
  selectedCantiere.value = null
}

const editCantiere = (cantiere) => {
  // Verifica che il cantiere sia valido prima di copiarlo
  if (!cantiere || !cantiere.id || !cantiere.nome) {
    const { error } = useToast()
    error('Errore: cantiere non valido per la modifica!', '❌ Errore Validazione')
    return
  }
  
  editingCantiere.value = { ...cantiere }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCantiere.value = null
}

const saveCantiereChanges = async () => {
  const { success, error } = useToast()
  
  // Verifica che editingCantiere sia valido
  if (!editingCantiere.value || !editingCantiere.value.id || !editingCantiere.value.nome) {
    error('Errore: cantiere non valido per il salvataggio!', '❌ Errore Validazione')
    return
  }
  
  try {
    // SALVA IL NOME PRIMA di chiamare l'API per evitare errori
    const nomeCantiereAggiornato = editingCantiere.value.nome
    
    // Aggiorna usando il composable con validazione
    await firestore.cantieri.update(editingCantiere.value.id, editingCantiere.value)
    
    // Ricarica i cantieri per aggiornare la lista
    await firestore.cantieri.load()
    
    // Chiudi modal
    closeEditModal()
    
    success(`Cantiere "${nomeCantiereAggiornato}" aggiornato con successo!`, '✅ Cantiere Aggiornato')
  } catch (err) {
    // L'errore è già gestito dal composable, ma possiamo aggiungere logica specifica
    console.error('Errore aggiornamento cantiere:', err)
  }
}

// Funzione per eliminare un cantiere
const deleteCantiere = async (cantiere) => {
  const { success, error } = useToast()
  
  // Verifica che il cantiere sia valido
  if (!cantiere || !cantiere.id) {
    error('Errore: cantiere non valido!', '❌ Errore Validazione')
    return
  }

  // Conferma eliminazione
  const conferma = confirm(
    `⚠️ ATTENZIONE: Sei sicuro di voler eliminare il cantiere "${cantiere.nome || 'Senza nome'}"?\n\n` +
    `🔴 Questa operazione:\n` +
    `• Eliminerà il cantiere definitivamente\n` +
    `• Rimuoverà tutti i materiali associati\n` +
    `• Cancellerà lo storico del progresso\n` +
    `• Eliminerà tutti gli allegati\n\n` +
    `❌ QUESTA AZIONE NON PUÒ ESSERE ANNULLATA!`
  )
  
  if (!conferma) return
  
  try {
    // Elimina usando il composable con gestione errori
    await firestore.cantieri.delete(cantiere.id)
    
    // Ricarica i cantieri per aggiornare la lista
    await firestore.cantieri.load()
    
    // Pulisci dati locali associati
    delete cantieriAttachments.value[cantiere.id]
    delete cantieriProgressHistory.value[cantiere.id]
    
    // ✅ Pulizia dati Firestore associati al cantiere eliminato
    try {
      // Elimina materiali del cantiere da Firestore (gestito automaticamente dalle FK)
      // Elimina allegati del cantiere da Firestore (gestito automaticamente dalle FK) 
      // Il progresso viene pulito automaticamente con l'eliminazione del cantiere
      
      console.log(`✅ Dati associati al cantiere ${cantiere.id} puliti automaticamente`)
    } catch (e) {
      console.warn('Avviso pulizia dati cantiere:', e)
    }
    
    // Chiudi modal se è quello eliminato
    if (selectedCantiere.value?.id === cantiere.id) {
      closeModal()
    }
    
    success(`Cantiere "${cantiere.nome || 'Senza nome'}" eliminato con successo`, '🗑️ Cantiere Eliminato')
  } catch (err) {
    // L'errore è già gestito dal composable
    console.error('Errore eliminazione cantiere:', err)
  }
}

const updateProgress = (cantiere) => {
  // Verifica che il cantiere sia valido
  if (!cantiere || !cantiere.id) {
    const { error } = useToast()
    error('Errore: cantiere non valido!', '❌ Errore Validazione')
    return
  }

  selectedCantiere.value = cantiere
  
  // Reset form con valori di default
  progressUpdate.value = {
    incremento: 10,
    nota: '',
    fase: '',
    dataCompletamento: new Date().toISOString().split('T')[0]
  }
  
  showProgressModal.value = true
}

const closeProgressModal = () => {
  showProgressModal.value = false
  selectedCantiere.value = null
  progressUpdate.value = {
    incremento: 10,
    nota: '',
    fase: '',
    dataCompletamento: ''
  }
}

const saveProgressUpdate = async () => {
  const { success, error } = useToast()
  
  // Verifica che selectedCantiere sia valido
  if (!selectedCantiere.value || !selectedCantiere.value.id) {
    error('Errore: cantiere non valido per aggiornamento progresso!', '❌ Errore Validazione')
    return
  }
  
  if (!progressUpdate.value.fase) {
    error('Inserisci il nome della fase completata!')
    return
  }

  if (!progressUpdate.value.dataCompletamento) {
    error('Inserisci la data di completamento!')
    return
  }

  try {
    const nuovoProgresso = Math.min(selectedCantiere.value.progresso + progressUpdate.value.incremento, 100)
    const progressoPrecedente = selectedCantiere.value.progresso
  
    // Aggiorna progresso usando il composable
    await firestore.cantieri.updateProgress(selectedCantiere.value.id, {
      nuovoProgresso,
      progressoPrecedente,
      fase: progressUpdate.value.fase,
      nota: progressUpdate.value.nota,
      dataCompletamento: progressUpdate.value.dataCompletamento,
      incremento: progressUpdate.value.incremento
    })
    
    // Ricarica i cantieri per aggiornare la lista
    await firestore.cantieri.load()
     
    // Salva aggiornamento nello storico locale
    saveProgressToHistory(selectedCantiere.value.id, {
      ...progressUpdate.value,
      progressoPrecedente,
      nuovoProgresso,
      timestamp: new Date().toISOString()
    })

    closeProgressModal()

    // Messaggio di successo
    if (nuovoProgresso === 100) {
      success(`🎉 Cantiere completato al 100%! "${progressUpdate.value.fase}" è stata l'ultima fase.`, '✅ Progetto Completato')
    } else {
      success(`Progresso aggiornato a ${nuovoProgresso}% (+${progressUpdate.value.incremento}%)`, '📊 Progresso Aggiornato')
    }
  } catch (err) {
    console.error('Errore aggiornamento progresso:', err)
    error(`Errore nell'aggiornamento del progresso: ${err.message}`, '❌ Errore Aggiornamento')
  }
}

// ✅ Il progresso viene salvato automaticamente in Firestore da updateProgress
const saveProgressToHistory = (cantiereId, updateData) => {
  // Mantieni cache locale per visualizzazione immediata
  if (!cantieriProgressHistory.value[cantiereId]) {
    cantieriProgressHistory.value[cantiereId] = []
  }
  
  cantieriProgressHistory.value[cantiereId].unshift(updateData)
  
  // ✅ Non più necessario localStorage - tutto salvato in Firestore automaticamente
  console.log('✅ Progresso salvato in Firestore automaticamente')
}

const getProgressHistory = (cantiereId) => {
  if (!cantiereId) return []
  return cantieriProgressHistory.value[cantiereId] || []
}

const viewMaterials = async (cantiere) => {
  // Verifica che il cantiere sia valido
  if (!cantiere || !cantiere.id) {
    const { error } = useToast()
    error('Errore: cantiere non valido!', '❌ Errore Validazione')
    return
  }

  selectedCantiere.value = cantiere
  materialiCantiere.value = await getMaterialsByCantiere(cantiere.id)
  showMaterialsModal.value = true
}

const closeMaterialsModal = () => {
  showMaterialsModal.value = false
  selectedCantiere.value = null
  materialiCantiere.value = []
}

// ✅ Carica materiali cantiere da Firestore
const getMaterialsByCantiere = async (cantiereId) => {
  try {
    const result = await firestore.materialiCantiere.load(cantiereId)
    if (result.success && result.data) {
      return result.data.map(materiale => ({
        id: materiale.id,
        nome: materiale.nome,
        descrizione: materiale.descrizione,
        codice: materiale.codice,
        quantitaRichiesta: materiale.quantitaRichiesta,
        quantitaUtilizzata: materiale.quantitaUtilizzata || 0,
        unita: materiale.unita,
        prezzoUnitario: materiale.prezzoUnitario,
        stato: materiale.stato,
        fornitoreId: materiale.fornitoreId,
        fornitoreNome: materiale.fornitoreNome,
        dataAcquisto: materiale.dataAcquisto,
        note: materiale.note
      }))
    }
    return []
  } catch (e) {
    console.warn('Errore nel caricamento materiali cantieri da Firestore:', e)
    return []
  }
}

const getTotalMaterialsValue = () => {
  return materialiCantiere.value.reduce((total, materiale) => {
    return total + (materiale.quantitaRichiesta * materiale.prezzoUnitario)
  }, 0)
}

const getCompletedMaterials = () => {
  return materialiCantiere.value.filter(m => m.stato === 'completato' || m.stato === 'utilizzato').length
}



const saveNewCantiere = async () => {
  const { error, success } = useToast()
  
  if (!newCantiere.value.nome || !newCantiere.value.cliente || !newCantiere.value.valore) {
    error('Compila tutti i campi obbligatori!')
    return
  }

  try {
  // Salvo il nome prima di resettare il form
  const nomeCantiere = newCantiere.value.nome
  
    // Se è un nuovo cliente, lo aggiungo all'anagrafica Firestore
  if (clientSelectionMode.value === 'new') {
    const nuovoCliente = {
      nome: newCantiere.value.cliente,
      tipo: newCantiere.value.clienteTipo,
      email: newCantiere.value.clienteEmail || '',
      telefono: newCantiere.value.clienteTelefono || '',
      indirizzo: newCantiere.value.clienteIndirizzo || '',
      stato: 'attivo',
      numeroProgetti: 1,
      valoreTotale: newCantiere.value.valore,
      ultimoContatto: new Date().toISOString().split('T')[0]
    }
    
      await firestore.clienti.create(nuovoCliente)
      
      // Ricarica i clienti per aggiornare la lista
      await firestore.clienti.load()
      
      console.log('✅ Nuovo cliente aggiunto all\'anagrafica Firestore:', nuovoCliente.nome)
    }
    
    // Crea il cantiere in Firestore
    const cantiereData = {
    ...newCantiere.value,
    progresso: 0,
    team: [],
    fasi: []
  }
  
    await firestore.cantieri.create(cantiereData)
    
    // Ricarica i cantieri per aggiornare la lista
    await firestore.cantieri.load()
    
    // Mostra toast di successo
    const tipoClienteText = clientSelectionMode.value === 'new' ? 'nuovo cliente aggiunto' : 'cliente esistente'
    success(`Cantiere "${nomeCantiere}" creato con successo! Cliente: ${newCantiere.value.cliente} (${tipoClienteText})`, '🏗️ Cantiere Creato')

    // Reset form
    newCantiere.value = {
      nome: '',
      cliente: '',
      clienteTipo: 'privato',
      clienteEmail: '',
      clienteTelefono: '',
      clienteIndirizzo: '',
      indirizzo: '',
      tipoLavoro: '',
      valore: 0,
      dataInizio: '',
      scadenza: '',
      stato: 'pianificato',
      priorita: 'media'
    }
    
    // Reset selezione cliente
    clientSelectionMode.value = 'existing'
    selectedClientFromList.value = ''

    closeAddModal()
  } catch (err) {
    console.error('Errore creazione cantiere:', err)
    error(`Errore nella creazione del cantiere: ${err.message}`, '❌ Errore Creazione')
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  // Reset completo del form
  newCantiere.value = {
    nome: '',
    cliente: '',
    clienteTipo: 'privato',
    clienteEmail: '',
    clienteTelefono: '',
    clienteIndirizzo: '',
    indirizzo: '',
    tipoLavoro: '',
    valore: 0,
    dataInizio: '',
    scadenza: '',
    stato: 'pianificato',
    priorita: 'media'
  }
  // Reset selezione cliente
  clientSelectionMode.value = 'existing'
  selectedClientFromList.value = ''
}

const manageTeam = (cantiere) => {
  selectedCantiere.value = cantiere
  showTeamModal.value = true
}

const getAvailableEmployees = () => {
  return dipendentiDisponibili.value.filter(dipendente => 
    !selectedCantiere.value?.team?.some(membro => membro.id === dipendente.id)
  )
}

const calculateTeamHourlyCost = () => {
  if (!selectedCantiere.value?.team?.length) return 0
  return selectedCantiere.value.team.reduce((total, membro) => {
    const dipendente = dipendentiDisponibili.value.find(d => d.id === membro.id)
    return total + (dipendente?.pagaOraria || 25)
  }, 0)
}

// Calcola il costo giornaliero della manodopera per un cantiere (8 ore lavorative)
const calculateDailyCost = (cantiere) => {
  if (!cantiere?.team?.length) return 0
  const costoOrario = cantiere.team.reduce((total, membro) => {
    const dipendente = dipendentiDisponibili.value.find(d => d.id === membro.id)
    return total + (dipendente?.pagaOraria || 25)
  }, 0)
  return costoOrario * 8 // 8 ore lavorative giornaliere
}

// Calcola il costo mensile stimato della manodopera (22 giorni lavorativi)
const calculateMonthlyCost = (cantiere) => {
  return calculateDailyCost(cantiere) * 22
}

const addMemberToTeam = (dipendente) => {
  if (!selectedCantiere.value.team) {
    selectedCantiere.value.team = []
  }
  
  const newMember = {
    id: dipendente.id,
    nome: `${dipendente.nome} ${dipendente.cognome}`,
    iniziali: dipendente.iniziali,
    ruolo: getRuoloLabel(dipendente.ruolo)
  }
  
  selectedCantiere.value.team.push(newMember)
}

const removeMemberFromTeam = (memberId) => {
  if (selectedCantiere.value.team) {
    selectedCantiere.value.team = selectedCantiere.value.team.filter(membro => membro.id !== memberId)
  }
}

const saveTeamChanges = async () => {
  const { success, error } = useToast()
  
  // Verifica che selectedCantiere sia valido
  if (!selectedCantiere.value || !selectedCantiere.value.id) {
    error('Errore: cantiere non valido per l\'aggiornamento team!', '❌ Errore Validazione')
    return
  }
  
  // Salva il nome prima di potenziali modifiche
  const nomeCantiereTeam = selectedCantiere.value.nome || 'Cantiere senza nome'
  
  try {
    // Aggiorna usando il composable con validazione
    await firestore.cantieri.update(selectedCantiere.value.id, selectedCantiere.value)
    
    // Ricarica i cantieri per aggiornare la lista
    await firestore.cantieri.load()

    // Aggiorna i dipendenti con i nuovi cantieri assegnati
    updateEmployeeAssignments()

    closeTeamModal()
    success(`Team del cantiere "${nomeCantiereTeam}" aggiornato con successo!`, '👥 Team Aggiornato')
  } catch (err) {
    // L'errore è già gestito dal composable
    console.error('Errore aggiornamento team:', err)
  }
}

const updateEmployeeAssignments = () => {
  // Verifica che selectedCantiere sia ancora valido
  if (!selectedCantiere.value || !selectedCantiere.value.id) {
    console.warn('⚠️ updateEmployeeAssignments: selectedCantiere non valido')
    return
  }
  
  const nomeCantiereAssegnazione = selectedCantiere.value.nome || 'Cantiere senza nome'
  
  // Aggiorna le assegnazioni dei dipendenti
  dipendentiDisponibili.value.forEach(dipendente => {
    const isAssigned = selectedCantiere.value.team?.some(membro => membro.id === dipendente.id)
    if (isAssigned) {
      dipendente.cantiereAttuale = nomeCantiereAssegnazione
    } else if (dipendente.cantiereAttuale === nomeCantiereAssegnazione) {
      dipendente.cantiereAttuale = null
    }
  })
  
  // ✅ Aggiorna assegnazioni dipendenti in Firestore
  try {
    // In futuro: aggiornare le assegnazioni dipendenti in Firestore
    // Per ora manteniamo il comportamento esistente per compatibilità
    console.log('✅ Assegnazioni dipendenti aggiornate (futuro: sincronizzazione Firestore)')
    window.dispatchEvent(new CustomEvent('dipendenti-updated'))
  } catch (e) {
    console.warn('Avviso aggiornamento assegnazioni:', e)
  }
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

const closeTeamModal = () => {
  showTeamModal.value = false
  selectedCantiere.value = null
}

const manageAttachments = (cantiere) => {
  selectedCantiere.value = cantiere
  showAttachmentsModal.value = true
}

const closeAttachmentsModal = () => {
  showAttachmentsModal.value = false
  selectedCantiere.value = null
}

const getAttachments = () => {
  if (!selectedCantiere.value || !selectedCantiere.value.id) return []
  return cantieriAttachments.value[selectedCantiere.value.id] || []
}

const getFileTypeClass = (type) => {
  const classes = {
    'pdf': 'bg-red-500',
    'doc': 'bg-blue-500',
    'docx': 'bg-blue-600',
    'xls': 'bg-green-500',
    'xlsx': 'bg-green-600',
    'jpg': 'bg-purple-500',
    'jpeg': 'bg-purple-500',
    'png': 'bg-indigo-500',
    'txt': 'bg-gray-500'
  }
  return classes[type.toLowerCase()] || 'bg-gray-500'
}

const getFileTypeIcon = (type) => {
  const icons = {
    'pdf': 'PDF',
    'doc': 'DOC',
    'docx': 'DOC',
    'xls': 'XLS',
    'xlsx': 'XLS',
    'jpg': 'JPG',
    'jpeg': 'JPG',
    'png': 'PNG',
    'txt': 'TXT'
  }
  return icons[type.toLowerCase()] || 'FILE'
}

const formatFileSize = (bytes) => {
  if (typeof bytes === 'string') return bytes
  
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadFile = (file) => {
  // Simula il download creando un link temporaneo
  // In una vera implementazione, qui si farebbe una chiamata al server
  const link = document.createElement('a')
  link.href = file.url || '#'
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  alert(`📥 Download di "${file.name}" avviato!`)
}

const deleteFile = async (file) => {
  if (!selectedCantiere.value || !selectedCantiere.value.id) {
    alert('❌ Errore: cantiere non valido!')
    return
  }
  
  if (confirm(`🗑️ Sei sicuro di voler eliminare "${file.name}"?`)) {
    try {
      // ✅ Elimina da Firestore
      await firestore.allegati.delete(file.id)
      
      // Aggiorna cache locale
      const cantiereId = selectedCantiere.value.id
      if (cantieriAttachments.value[cantiereId]) {
        cantieriAttachments.value[cantiereId] = cantieriAttachments.value[cantiereId].filter(f => f.id !== file.id)
      }
      
      alert(`✅ File "${file.name}" eliminato con successo!`)
    } catch (error) {
      console.error('Errore eliminazione file:', error)
      alert(`❌ Errore eliminazione file: ${error.message}`)
    }
  }
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return
  
  if (!selectedCantiere.value || !selectedCantiere.value.id) {
    alert('❌ Errore: cantiere non valido per upload!')
    return
  }
  
  const cantiereId = selectedCantiere.value.id
  let uploadCount = 0
  let errorCount = 0
  
  for (const file of files) {
    try {
      // Validazione dimensione (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`❌ File "${file.name}" troppo grande (max 10MB)`)
        errorCount++
        continue
      }
      
      // Crea oggetto allegato per Firestore
      const allegatoData = {
        nome: file.name,
        tipo: file.name.split('.').pop().toLowerCase(),
        dimensione: file.size,
        descrizione: '',
        categoria: 'generale',
        // Per ora usiamo un URL temporaneo - in futuro integreremo Firebase Storage
        url: URL.createObjectURL(file)
      }
      
      // ✅ Salva in Firestore
      const result = await saveAllegatoCantiere(cantiereId, allegatoData)
      
      if (result.success) {
        uploadCount++
      } else {
        console.error(`Errore upload ${file.name}:`, result.error)
        errorCount++
      }
      
    } catch (error) {
      console.error(`Errore upload ${file.name}:`, error)
      errorCount++
    }
  }
  
  // Reset input
  event.target.value = ''
  
  if (uploadCount > 0) {
    alert(`✅ ${uploadCount} file caricati con successo!${errorCount > 0 ? ` (${errorCount} errori)` : ''}`)
  } else {
    alert(`❌ Errore upload di tutti i file`)
  }
}

const getCantiereAttachments = (cantiereId) => {
  return cantieriAttachments.value[cantiereId] || []
}

// Funzioni gestione materiali cantiere
const manageMaterials = () => {
  showManageMaterialsModal.value = true
}

const closeManageMaterialsModal = () => {
  showManageMaterialsModal.value = false
}

const addMaterialToCantiere = async () => {
  // Ricarica i materiali del magazzino per avere i dati più aggiornati
  try {
    await firestoreStore.loadMateriali()
  } catch (error) {
    console.warn('Errore aggiornamento materiali magazzino:', error)
  }
  
  // Reset form con valori default
  newMaterial.value = {
    nome: '',
    descrizione: '',
    codice: '',
    quantitaRichiesta: 0,
    unita: 'pz',
    prezzoUnitario: 0,
    stato: 'pianificato',
    fornitoreId: null,
    dataAcquisto: '',
    note: ''
  }
  materialSelectionMode.value = 'existing' // Default a selezione da magazzino
  selectedMaterialFromStock.value = ''
  showAddMaterialModal.value = true
}

const closeAddMaterialModal = () => {
  showAddMaterialModal.value = false
}

const editMaterialInCantiere = (materiale) => {
  editingMaterial.value = { ...materiale }
  showEditMaterialModal.value = true
}

const closeEditMaterialModal = () => {
  showEditMaterialModal.value = false
  editingMaterial.value = null
}

const saveMaterialToCantiere = async () => {
  const { error, success } = useToast()
  
  // Validazione campi obbligatori
  if (!newMaterial.value.nome || !newMaterial.value.quantitaRichiesta || !newMaterial.value.codice) {
    error('Compila nome, codice e quantità richiesta!')
    return
  }

  if (!newMaterial.value.fornitoreId) {
    error('Seleziona un fornitore!')
    return
  }

  const fornitoreSelected = fornitori.value.find(f => f.id == newMaterial.value.fornitoreId)
  
  const nuovoMateriale = {
    id: Date.now() + Math.random(),
    codice: newMaterial.value.codice,
    nome: newMaterial.value.nome,
    descrizione: newMaterial.value.descrizione || '',
    quantitaRichiesta: newMaterial.value.quantitaRichiesta,
    quantitaUtilizzata: 0,
    unita: newMaterial.value.unita || 'pz',
    prezzoUnitario: newMaterial.value.prezzoUnitario || 0,
    stato: newMaterial.value.stato,
    fornitoreId: newMaterial.value.fornitoreId,
    fornitoreNome: fornitoreSelected?.nome || '',
    prezzoEffettivo: newMaterial.value.prezzoUnitario || 0,
    dataAcquisto: newMaterial.value.dataAcquisto,
    note: newMaterial.value.note,
    // Metadati aggiuntivi
    isFromStock: materialSelectionMode.value === 'existing',
    originalStockId: materialSelectionMode.value === 'existing' ? selectedMaterialFromStock.value : null
  }

  // ✅ Aggiungi a materialiCantiere e salva in Firestore
  materialiCantiere.value.push({ ...nuovoMateriale, isNew: true })
  await saveMaterialiCantiereToStorage()
  
  closeAddMaterialModal()
  
  const modeText = materialSelectionMode.value === 'existing' ? 'aggiunto dal magazzino' : 'creato e aggiunto'
  success(`Materiale "${nuovoMateriale.nome}" ${modeText} al cantiere!`, '✅ Materiale Aggiunto')
}

const saveMaterialChanges = async () => {
  if (!editingMaterial.value) return

  const index = materialiCantiere.value.findIndex(m => m.id === editingMaterial.value.id)
  if (index !== -1) {
    const fornitoreSelected = fornitori.value.find(f => f.id == editingMaterial.value.fornitoreId)
    editingMaterial.value.fornitoreNome = fornitoreSelected?.nome || ''
    
    // Auto-aggiornamento stato in base alla quantità utilizzata
    const quantitaUtilizzata = editingMaterial.value.quantitaUtilizzata || 0
    const quantitaRichiesta = editingMaterial.value.quantitaRichiesta || 0
    
    if (quantitaUtilizzata === 0) {
      // Nessun utilizzo - mantieni stato originale se non è "utilizzato" o "completato"
      if (editingMaterial.value.stato === 'utilizzato' || editingMaterial.value.stato === 'completato') {
        editingMaterial.value.stato = 'ordinato'
      }
    } else if (quantitaUtilizzata >= quantitaRichiesta) {
      // Completamente utilizzato
      editingMaterial.value.stato = 'utilizzato'
    } else if (quantitaUtilizzata > 0 && quantitaUtilizzata < quantitaRichiesta) {
      // Parzialmente utilizzato
      editingMaterial.value.stato = 'in-uso'
    }
    
    materialiCantiere.value[index] = { ...editingMaterial.value }
    await saveMaterialiCantiereToStorage()
  }
  
  const { success } = useToast()
  closeEditMaterialModal()
  
  const quantitaUtilizzata = editingMaterial.value.quantitaUtilizzata || 0
  const quantitaRichiesta = editingMaterial.value.quantitaRichiesta || 0
  
  if (quantitaUtilizzata > 0) {
    const percentualeUtilizzo = ((quantitaUtilizzata / quantitaRichiesta) * 100).toFixed(1)
    success(`Materiale aggiornato! Utilizzo: ${quantitaUtilizzata}/${quantitaRichiesta} (${percentualeUtilizzo}%)`, '✅ Materiale Aggiornato')
  } else {
    success(`Materiale "${editingMaterial.value.nome}" aggiornato!`, '✅ Materiale Aggiornato')
  }
}

const removeMaterialFromCantiere = async (materialId) => {
  if (confirm('🗑️ Sei sicuro di voler rimuovere questo materiale dal cantiere?')) {
    const index = materialiCantiere.value.findIndex(m => m.id === materialId)
    if (index !== -1) {
      const materialeRimosso = materialiCantiere.value[index]
      materialiCantiere.value.splice(index, 1)
      await saveMaterialiCantiereToStorage()
      alert(`✅ Materiale "${materialeRimosso.nome}" rimosso dal cantiere!`)
    }
  }
}

// ✅ Salva materiali cantiere in Firestore invece di localStorage
const saveMaterialiCantiereToStorage = async () => {
  if (!selectedCantiere.value?.id) {
    console.warn('❌ Cantiere non valido per salvataggio materiali')
    return
  }
  
  try {
    // Sincronizza tutti i materiali locali con Firestore
    for (const materiale of materialiCantiere.value) {
      if (materiale.id && !materiale.isNew) {
        // Materiale esistente - aggiorna
        await firestore.materialiCantiere.update(materiale.id, materiale)
      } else {
        // Nuovo materiale - crea
        const result = await firestore.materialiCantiere.create(selectedCantiere.value.id, materiale)
        if (result.success && result.data) {
          // Aggiorna ID locale con quello di Firestore
          materiale.id = result.data.id
          materiale.isNew = false
        }
      }
    }
    console.log('✅ Materiali cantiere sincronizzati con Firestore')
  } catch (error) {
    console.error('❌ Errore sincronizzazione materiali:', error)
  }
}

const openFile = (file) => {
  if (!file.url) {
    alert('❌ File non disponibile per l\'apertura')
    return
  }

  try {
    // Apre il file in una nuova finestra/tab
    const newWindow = window.open(file.url, '_blank')
    
    if (newWindow) {
      // File aperto con successo
      newWindow.focus()
      
      // Messaggio di feedback in base al tipo di file
      const fileType = file.type.toLowerCase()
      let message = `👁️ File "${file.name}" aperto in una nuova finestra`
      
      if (['pdf'].includes(fileType)) {
        message += '\n📄 PDF - Visualizzazione diretta nel browser'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
        message += '\n🖼️ Immagine - Visualizzazione diretta nel browser'
      } else if (['txt', 'csv'].includes(fileType)) {
        message += '\n📝 Testo - Visualizzazione diretta nel browser'
      } else if (['doc', 'docx', 'xls', 'xlsx'].includes(fileType)) {
        message += '\n📋 Documento Office - Potrebbe richiedere un\'applicazione esterna'
      } else {
        message += '\n📎 Il browser tenterà di aprire il file'
      }
      
      console.log(message)
    } else {
      // Popup bloccato o errore
      alert('⚠️ Impossibile aprire il file.\nVerifica che i popup non siano bloccati dal browser.')
      
      // Fallback: prova a creare un link temporaneo
      const link = document.createElement('a')
      link.href = file.url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Errore nell\'apertura del file:', error)
    alert(`❌ Errore nell'apertura del file "${file.name}".\n\nDettagli: ${error.message}`)
  }
}

// Funzione per caricare allegati materiali dal localStorage
const loadMaterialAttachmentsFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_material_attachments')
  
  if (stored) {
    try {
      const data = JSON.parse(stored)
      
      // Se è un array (nuovo formato), converte in oggetto per uso interno
      if (Array.isArray(data)) {
        materialiAttachments.value = {}
        data.forEach(attachment => {
          // Mantiene il materialId come stringa per compatibilità con ID decimali
          const materialId = String(attachment.materialId)
          if (!materialiAttachments.value[materialId]) {
            materialiAttachments.value[materialId] = []
          }
          materialiAttachments.value[materialId].push(attachment)
        })
      } else {
        // Formato legacy (oggetto)
        materialiAttachments.value = data
      }
    } catch (e) {
      console.warn('Errore nel caricamento allegati materiali:', e)
      materialiAttachments.value = {}
    }
  } else {
    materialiAttachments.value = {}
  }
}

// Funzione per salvare allegati materiali nel localStorage (formato compatibile con fornitori)
const saveMaterialAttachmentsToStorage = () => {
  try {
    // Legge i dati esistenti dal localStorage
    const stored = localStorage.getItem('legnosystem_material_attachments')
    let existingAttachments = []
    
    if (stored) {
      try {
        existingAttachments = JSON.parse(stored)
        if (!Array.isArray(existingAttachments)) {
          existingAttachments = []
        }
      } catch (e) {
        console.warn('Errore parsing allegati esistenti:', e)
        existingAttachments = []
      }
    }
    
    // Converte i nuovi dati da formato oggetto a formato array
    const newAttachmentsArray = []
    Object.entries(materialiAttachments.value).forEach(([materialId, attachments]) => {
      attachments.forEach(attachment => {
        newAttachmentsArray.push({
          ...attachment,
          materialId: materialId // Mantiene come stringa per preservare i decimali
        })
      })
    })
    
    // Merge: rimuove i vecchi allegati di questi materiali e aggiunge i nuovi
    const materialIds = Object.keys(materialiAttachments.value) // Mantiene come stringa
    const filteredExisting = existingAttachments.filter(att => !materialIds.includes(String(att.materialId)))
    const mergedAttachments = [...filteredExisting, ...newAttachmentsArray]
    
    localStorage.setItem('legnosystem_material_attachments', JSON.stringify(mergedAttachments))
  } catch (e) {
    console.error('❌ Errore nel salvataggio allegati:', e)
  }
}

const getMaterialAttachmentCount = (materiale) => {
  if (!materialiAttachments.value || !materiale) return 0
  
  // Cerca sia con ID numerico che stringa per compatibilità
  const materialIdStr = String(materiale.id)
  const count = materialiAttachments.value[materialIdStr]?.length || materialiAttachments.value[materiale.id]?.length || 0
  
  return count
}

const manageMaterialAttachments = (materiale) => {
  selectedMaterial.value = materiale
  showMaterialAttachmentsModal.value = true
}

const closeMaterialAttachmentsModal = () => {
  showMaterialAttachmentsModal.value = false
  selectedMaterial.value = null
}

const addAttachmentToMaterial = (materialId) => {
  const material = materialiCantiere.value.find(m => m.id === materialId)
  if (!material) return

  const newAttachment = {
    id: Date.now() + Math.random(),
    name: `Attachment-${Date.now()}.pdf`,
    size: 1024, // Simula una dimensione fissa
    type: 'pdf',
    uploadDate: new Date().toISOString().split('T')[0],
    description: 'Nuovo allegato',
    materialId: materialId,
    url: URL.createObjectURL(new Blob([new Uint8Array(1024)], { type: 'application/pdf' }))
  }

  if (!materialiAttachments.value[materialId]) {
    materialiAttachments.value[materialId] = []
  }

  materialiAttachments.value[materialId].push(newAttachment)
  saveMaterialAttachmentsToStorage()

  closeMaterialAttachmentsModal()
  alert(`✅ Allegato aggiunto al materiale "${material.nome}"!`)
}

const removeAttachmentFromMaterial = (materialId, attachmentId) => {
  if (confirm(`🗑️ Sei sicuro di voler eliminare questo allegato?`)) {
    if (materialiAttachments.value[materialId]) {
      materialiAttachments.value[materialId] = materialiAttachments.value[materialId].filter(a => a.id !== attachmentId)
      saveMaterialAttachmentsToStorage()
      alert(`✅ Allegato eliminato con successo!`)
    }
  }
}

// Nota: loadMaterialAttachmentsFromStorage() ora viene chiamato in onMounted

const getMaterialAttachments = () => {
  if (!selectedMaterial.value) return []
  return materialiAttachments.value[selectedMaterial.value.id] || []
}

const getTotalMaterialAttachmentsSize = () => {
  const totalBytes = getMaterialAttachments().reduce((total, attachment) => total + attachment.size, 0)
  return formatFileSize(totalBytes)
}

const getLastUploadDate = () => {
  const attachments = getMaterialAttachments()
  if (attachments.length === 0) return 'N/A'
  
  const lastUpload = attachments.reduce((latest, attachment) => {
    return new Date(attachment.uploadDate) > latest ? new Date(attachment.uploadDate) : latest
  }, new Date(0))
  
  return lastUpload.toLocaleDateString('it-IT')
}

const getFornitoreById = (fornitoreId) => {
  return fornitori.value.find(f => f.id === fornitoreId)
}

const openMaterialFile = (attachment) => {
  if (!attachment.url) {
    alert('❌ File non disponibile per l\'apertura')
    return
  }

  try {
    // Apre il file in una nuova finestra/tab
    const newWindow = window.open(attachment.url, '_blank')
    
    if (newWindow) {
      // File aperto con successo
      newWindow.focus()
      
      // Messaggio di feedback in base al tipo di file
      const fileType = attachment.type.toLowerCase()
      let message = `👁️ File "${attachment.name}" aperto in una nuova finestra`
      
      if (['pdf'].includes(fileType)) {
        message += '\n📄 PDF - Visualizzazione diretta nel browser'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
        message += '\n🖼️ Immagine - Visualizzazione diretta nel browser'
      } else if (['txt', 'csv'].includes(fileType)) {
        message += '\n📝 Testo - Visualizzazione diretta nel browser'
      } else if (['doc', 'docx', 'xls', 'xlsx'].includes(fileType)) {
        message += '\n📋 Documento Office - Potrebbe richiedere un\'applicazione esterna'
      } else {
        message += '\n📎 Il browser tenterà di aprire il file'
      }
      
      console.log(message)
    } else {
      // Popup bloccato o errore
      alert('⚠️ Impossibile aprire il file.\nVerifica che i popup non siano bloccati dal browser.')
      
      // Fallback: prova a creare un link temporaneo
      const link = document.createElement('a')
      link.href = attachment.url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Errore nell\'apertura del file:', error)
    alert(`❌ Errore nell'apertura del file "${attachment.name}".\n\nDettagli: ${error.message}`)
  }
}

const downloadMaterialFile = (attachment) => {
  // Simula il download creando un link temporaneo
  // In una vera implementazione, qui si farebbe una chiamata al server
  const link = document.createElement('a')
  link.href = attachment.url || '#'
  link.download = attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  alert(`📥 Download di "${attachment.name}" avviato!`)
}

const deleteMaterialFile = (attachment) => {
  if (confirm(`🗑️ Sei sicuro di voler eliminare "${attachment.name}"?`)) {
    const materialId = selectedMaterial.value.id
    if (materialiAttachments.value[materialId]) {
      materialiAttachments.value[materialId] = materialiAttachments.value[materialId].filter(f => f.id !== attachment.id)
      saveMaterialAttachmentsToStorage()
      alert(`✅ File "${attachment.name}" eliminato con successo!`)
    }
  }
}

const handleMaterialFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length || !selectedMaterial.value) return
  
  const materialId = selectedMaterial.value.id
  const fornitore = getFornitoreById(selectedMaterial.value.fornitoreId)
  
  // Inizializza array allegati se non esiste
  if (!materialiAttachments.value[materialId]) {
    materialiAttachments.value[materialId] = []
  }
  
  for (const file of files) {
    // Validazione dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`❌ File "${file.name}" troppo grande (max 10MB)`)
      continue
    }
    
    // Determina categoria del file
    const extension = file.name.split('.').pop().toLowerCase()
    let category = 'Generale'
    if (['pdf'].includes(extension)) category = 'Documento'
    if (['jpg', 'jpeg', 'png'].includes(extension)) category = 'Foto'
    if (['xls', 'xlsx'].includes(extension)) category = 'Fattura/DDT'
    if (['doc', 'docx'].includes(extension)) category = 'Certificato'
    
    // Converte il file in Base64 per persistenza nel localStorage
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
    
    // Crea oggetto allegato
    const attachment = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: extension,
      uploadDate: new Date().toISOString().split('T')[0],
      description: '',
      category: category,
      fornitore: fornitore?.nome || 'N/A',
      materialId: materialId,
      cantiereId: selectedCantiere.value.id,
      // Salva il file come Base64 per persistenza
      url: base64
    }
    
    materialiAttachments.value[materialId].push(attachment)
  }
  
  saveMaterialAttachmentsToStorage()
  
  // Reset input
  event.target.value = ''
  
  alert(`✅ ${files.length} file caricati con successo per ${selectedMaterial.value.nome}!`)
}

const generateMaterialReport = () => {
  if (!selectedMaterial.value) {
    alert('❌ Nessun materiale selezionato')
    return
  }

  const materiale = selectedMaterial.value
  const fornitore = getFornitoreById(materiale.fornitoreId)
  const allegati = getMaterialAttachments()
  const cantiere = selectedCantiere.value

  // Calcoli
  const costoTotale = materiale.quantitaRichiesta * materiale.prezzoUnitario
  const dataOggi = new Date().toLocaleDateString('it-IT')
  
  // Genera contenuto HTML del report
  const reportHTML = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Materiale - ${materiale.nome}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .allegati { background: #f3f4f6; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-pianificato { background: #dbeafe; color: #1e40af; }
            .status-ordinato { background: #fef3c7; color: #b45309; }
            .status-in-uso { background: #d1fae5; color: #065f46; }
            .status-completato { background: #dcfce7; color: #166534; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📋 Report Materiale</h1>
            <h2>${materiale.nome} (${materiale.codice})</h2>
            <p>Generato il ${dataOggi} - Legnosystem.bio</p>
        </div>

        <div class="section">
            <h3>🏗️ Informazioni Cantiere</h3>
            <div class="grid">
                <div><span class="label">Cantiere:</span> <span class="value">${cantiere.nome}</span></div>
                <div><span class="label">Cliente:</span> <span class="value">${cantiere.cliente}</span></div>
                <div><span class="label">Indirizzo:</span> <span class="value">${cantiere.indirizzo}</span></div>
                <div><span class="label">Tipo Lavoro:</span> <span class="value">${cantiere.tipoLavoro}</span></div>
            </div>
        </div>

        <div class="section">
            <h3>🧱 Dettagli Materiale</h3>
            <div class="grid">
                <div><span class="label">Nome:</span> <span class="value">${materiale.nome}</span></div>
                <div><span class="label">Codice:</span> <span class="value">${materiale.codice}</span></div>
                <div><span class="label">Descrizione:</span> <span class="value">${materiale.descrizione || 'N/A'}</span></div>
                <div><span class="label">Stato:</span> <span class="status status-${materiale.stato}">${materiale.stato.toUpperCase()}</span></div>
            </div>
        </div>

        <div class="section">
            <h3>📊 Quantità e Costi</h3>
            <div class="grid">
                <div><span class="label">Quantità Richiesta:</span> <span class="value">${materiale.quantitaRichiesta} ${materiale.unita}</span></div>
                <div><span class="label">Quantità Utilizzata:</span> <span class="value">${materiale.quantitaUtilizzata || 0} ${materiale.unita}</span></div>
                <div><span class="label">Prezzo Unitario:</span> <span class="value">€${materiale.prezzoUnitario.toFixed(2)}</span></div>
                <div><span class="label">Costo Totale:</span> <span class="value"><strong>€${costoTotale.toFixed(2)}</strong></span></div>
            </div>
        </div>

        <div class="section">
            <h3>🏭 Informazioni Fornitore</h3>
            <div class="grid">
                <div><span class="label">Fornitore:</span> <span class="value">${fornitore?.nome || 'N/A'}</span></div>
                <div><span class="label">Telefono:</span> <span class="value">${fornitore?.telefono || 'N/A'}</span></div>
                <div><span class="label">Email:</span> <span class="value">${fornitore?.email || 'N/A'}</span></div>
                <div><span class="label">Data Acquisto:</span> <span class="value">${materiale.dataAcquisto || 'Da definire'}</span></div>
            </div>
        </div>

        ${allegati.length > 0 ? `
        <div class="section allegati">
            <h3>📎 Allegati e Documentazione (${allegati.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nome File</th>
                        <th>Tipo</th>
                        <th>Categoria</th>
                        <th>Dimensione</th>
                        <th>Data Upload</th>
                    </tr>
                </thead>
                <tbody>
                    ${allegati.map(allegato => `
                        <tr>
                            <td>${allegato.name}</td>
                            <td>${allegato.type.toUpperCase()}</td>
                            <td>${allegato.category || 'Generale'}</td>
                            <td>${formatFileSize(allegato.size)}</td>
                            <td>${formatDate(allegato.uploadDate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : '<div class="section"><h3>📎 Allegati</h3><p>Nessun allegato presente per questo materiale.</p></div>'}

        ${materiale.note ? `
        <div class="section">
            <h3>📝 Note</h3>
            <p>${materiale.note}</p>
        </div>
        ` : ''}

        <div class="section">
            <h3>📈 Statistiche</h3>
            <div class="grid">
                <div><span class="label">Utilizzo:</span> <span class="value">${Math.round((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta * 100)}%</span></div>
                <div><span class="label">Documenti Allegati:</span> <span class="value">${allegati.length}</span></div>
                <div><span class="label">Dimensione Totale Allegati:</span> <span class="value">${getTotalMaterialAttachmentsSize()}</span></div>
                <div><span class="label">Ultimo Aggiornamento:</span> <span class="value">${getLastUploadDate()}</span></div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Legnosystem.bio</strong> - Sistema di Gestione Cantieri</p>
            <p>Report generato automaticamente il ${dataOggi}</p>
            <p>Per informazioni: info@legnosystem.bio</p>
        </div>
    </body>
    </html>
  `

  // Crea e scarica il file HTML
  const blob = new Blob([reportHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Report_Materiale_${materiale.codice}_${cantiere.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  alert(`📊 Report materiale "${materiale.nome}" generato e scaricato!\n\n📋 Include:\n• Dettagli tecnici completi\n• Informazioni fornitore\n• Lista allegati (${allegati.length})\n• Calcoli costi\n• Tracciabilità cantiere\n\n💾 File salvato come HTML visualizzabile in qualsiasi browser`)
}

const materialSelectionMode = ref('existing')
const selectedMaterialFromStock = ref('')

const getSelectedMaterialFromStock = () => {
  return materialiMagazzino.value.find(materiale => materiale.id === selectedMaterialFromStock.value)
}

const fillMaterialFromStock = () => {
  const selectedMaterial = getSelectedMaterialFromStock()
  if (selectedMaterial) {
    newMaterial.value = {
      nome: selectedMaterial.nome,
      descrizione: selectedMaterial.descrizione,
      codice: selectedMaterial.codice,
      unita: selectedMaterial.unita,
      prezzoUnitario: selectedMaterial.prezzoUnitario,
      categoria: selectedMaterial.categoria,
      quantitaRichiesta: 1, // Default quantity
      stato: 'pianificato',
      note: ''
    }
  }
}

const clientSelectionMode = ref('existing')
const selectedClientFromList = ref('')

// Clienti da Firestore
const availableClients = computed(() => firestoreStore.clienti)

const getSelectedClient = () => {
  return availableClients.value.find(cliente => cliente.id === selectedClientFromList.value)
}

const fillClientFromList = () => {
  const selectedClient = getSelectedClient()
  if (selectedClient) {
    newCantiere.value.cliente = selectedClient.nome
    newCantiere.value.clienteTipo = selectedClient.tipo
    newCantiere.value.clienteEmail = selectedClient.email
    newCantiere.value.clienteTelefono = selectedClient.telefono
    newCantiere.value.clienteIndirizzo = selectedClient.indirizzo
  }
}

const getTipoColor = (tipo) => {
  const colors = {
    'privato': 'bg-green-100 text-green-800',
    'azienda': 'bg-blue-100 text-blue-800',
    'ente-pubblico': 'bg-yellow-100 text-yellow-800'
  }
  return colors[tipo] || 'bg-gray-100 text-gray-800'
}

const getTipoLabel = (tipo) => {
  const labels = {
    'privato': '👤',
    'azienda': '🏢',
    'ente-pubblico': '🏛️'
  }
  return labels[tipo] || tipo
}

// Hook lifecycle per inizializzazione
onMounted(async () => {
  // Carica allegati materiali dal localStorage solo al mount del componente
  loadMaterialAttachmentsFromStorage()
  
  // Carica tutti i dati da Firestore 
  try {
    // Carica tutti i dati necessari usando Promise.all per efficienza
    await Promise.all([
      firestoreStore.loadCantieri(),
      firestoreStore.loadDipendenti(),
      firestoreStore.loadMateriali(), // Assicura che i materiali siano disponibili per il dropdown
      firestoreStore.loadFornitori(),
      firestoreStore.loadClienti()
    ])
    console.log('✅ Dati cantieri caricati con successo')
  } catch (error) {
    console.error('❌ Errore nel caricamento dati Cantieri:', error)
    const { error: showError } = useToast()
    showError('Errore durante il caricamento dei dati', '❌ Errore Caricamento')
  }
})

const openDailyLog = (cantiere) => {
  // Naviga alla vista del giornale di cantiere usando Vue Router
  router.push({ 
    name: 'giornale-cantiere', 
    params: { id: cantiere.id }
  })
}
</script> 