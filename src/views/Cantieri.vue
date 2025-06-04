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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cantieri Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.attivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Totale</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">In Scadenza</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.inScadenza }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Completati Mese</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completatiMese }}</p>
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

    <!-- Grid Cantieri -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="cantiere in filteredCantieri" :key="cantiere.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ cantiere.nome }}</h3>
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
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Tipo Lavoro:</span>
            <span class="font-medium">{{ cantiere.tipoLavoro }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Valore:</span>
            <span class="font-medium">€{{ cantiere.valore.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Scadenza:</span>
            <span class="font-medium" :class="isScaduto(cantiere.scadenza) ? 'text-red-600' : 'text-gray-900'">
              {{ formatDate(cantiere.scadenza) }}
            </span>
          </div>
        </div>

        <!-- Team Assegnato -->
        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-2">Team Assegnato</p>
          <div class="flex -space-x-2">
            <div v-for="membro in cantiere.team.slice(0, 3)" :key="membro.id" 
                 class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
              {{ membro.iniziali }}
            </div>
            <div v-if="cantiere.team.length > 3" 
                 class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
              +{{ cantiere.team.length - 3 }}
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
              <button @click="editCantiere(cantiere)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Modifica cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="updateProgress(cantiere)" class="text-gray-400 hover:text-gray-600">
                <ChartBarIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Aggiorna progresso
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="viewMaterials(cantiere)" class="text-gray-400 hover:text-gray-600">
                <CubeIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Visualizza materiali
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="analyzeFabbisogno(cantiere)" class="text-purple-500 hover:text-purple-700">
                <BeakerIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Analizza fabbisogno
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageAttachments(cantiere)" class="text-blue-500 hover:text-blue-700">
                <PaperClipIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci allegati
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="configureAlgorithm()" class="text-orange-500 hover:text-orange-700">
                <CogIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Configura algoritmo
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="trainMLAlgorithm()" class="text-green-500 hover:text-green-700">
                <CpuChipIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Training ML
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageTeam(cantiere)" class="text-blue-500 hover:text-blue-700">
                <UsersIcon class="w-4 h-4" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci team
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
                  <div class="flex justify-between">
                    <span class="text-gray-600">Cliente:</span> 
                    <span class="font-medium">{{ selectedCantiere.cliente }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Indirizzo:</span> 
                    <span class="font-medium text-right">{{ selectedCantiere.indirizzo }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tipo Lavoro:</span> 
                    <span class="font-medium">{{ selectedCantiere.tipoLavoro }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Valore:</span> 
                    <span class="font-medium">€{{ selectedCantiere.valore.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Data Inizio:</span> 
                    <span class="font-medium">{{ formatDate(selectedCantiere.dataInizio) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Scadenza:</span> 
                    <span class="font-medium">{{ formatDate(selectedCantiere.scadenza) }}</span>
                  </div>
                </div>
              </div>

              <!-- Timeline Fasi -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">Timeline Progetto</h4>
                <div class="space-y-4">
                  <div v-for="fase in selectedCantiere.fasi" :key="fase.id" class="flex items-start space-x-3">
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
                  <div><span class="text-gray-600">Valore:</span> €{{ selectedCantiere.valore.toLocaleString() }}</div>
                  <div><span class="text-gray-600">Data Inizio:</span> {{ formatDate(selectedCantiere.dataInizio) }}</div>
                  <div><span class="text-gray-600">Scadenza:</span> {{ formatDate(selectedCantiere.scadenza) }}</div>
                </div>
              </div>

              <!-- Timeline Fasi -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Timeline Progetto</h4>
                <div class="space-y-3">
                  <div v-for="fase in selectedCantiere.fasi" :key="fase.id" class="flex items-center space-x-3">
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
            </div>

            <!-- Action Buttons Mobile -->
            <div class="pt-6 border-t border-gray-200">
              <button @click="closeModal" class="w-full btn-secondary py-3 text-base">
                Chiudi
              </button>
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
                  <p class="font-medium">{{ materiale.quantitaUtilizzata }} {{ materiale.unita }}</p>
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
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ materiale.quantitaUtilizzata }} {{ materiale.unita }}</td>
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

    <!-- Modal Analisi Fabbisogno Intelligente -->
    <div v-if="showAnalysisModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAnalysisModal">
      <div class="relative top-4 mx-auto border w-full max-w-5xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <BeakerIcon class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">🧠 Analisi Fabbisogno Intelligente</h3>
                <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ selectedCantiere?.tipoLavoro }}</p>
              </div>
            </div>
            <button @click="closeAnalysisModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="!analysisResults" class="text-center py-12">
            <BeakerIcon class="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Analisi in corso...</h3>
            <p class="text-gray-600">Calcolo fabbisogno materiali per il progetto</p>
          </div>

          <!-- Results -->
          <div v-if="analysisResults" class="space-y-6">
            <!-- Stats Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <CheckIcon class="w-5 h-5 text-green-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-600">Disponibili</p>
                    <p class="text-lg font-bold text-green-600">{{ analysisResults.disponibili }}</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-yellow-100 rounded-lg">
                    <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-600">Da Ordinare</p>
                    <p class="text-lg font-bold text-yellow-600">{{ analysisResults.daOrdinare }}</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-red-100 rounded-lg">
                    <XMarkIcon class="w-5 h-5 text-red-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-600">Mancanti</p>
                    <p class="text-lg font-bold text-red-600">{{ analysisResults.mancanti }}</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-accent-100 rounded-lg">
                    <CurrencyEuroIcon class="w-5 h-5 text-accent-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-600">Costo Ordini</p>
                    <p class="text-lg font-bold text-gray-900">€{{ analysisResults.costoOrdini.toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analisi Dettagliata -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Materiali Necessari -->
              <div class="card">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">📋 Materiali Necessari</h4>
                <div class="space-y-3 max-h-80 overflow-y-auto">
                  <div v-for="materiale in analysisResults.materialiNecessari" :key="materiale.codice" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-wood-light rounded-lg flex items-center justify-center">
                        <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ materiale.nome }}</p>
                        <p class="text-xs text-gray-600">Richiesto: {{ materiale.quantitaNecessaria }} {{ materiale.unita }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getAvailabilityColor(materiale.stato)">
                        {{ materiale.stato }}
                      </span>
                      <p class="text-xs text-gray-500 mt-1">{{ materiale.disponibile }}/{{ materiale.quantitaNecessaria }} {{ materiale.unita }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista Acquisti -->
              <div class="card">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">🛒 Lista Acquisti</h4>
                <div class="space-y-3 max-h-80 overflow-y-auto">
                  <div v-for="acquisto in analysisResults.listaAcquisti" :key="acquisto.codice" class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span class="text-red-600 text-xs font-bold">{{ acquisto.codice }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ acquisto.nome }}</p>
                        <p class="text-xs text-red-600 font-medium">Da ordinare: {{ acquisto.quantitaDaOrdinare }} {{ acquisto.unita }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-gray-900">€{{ (acquisto.quantitaDaOrdinare * acquisto.prezzoUnitario).toFixed(2) }}</p>
                      <p class="text-xs text-gray-500">€{{ acquisto.prezzoUnitario }}/{{ acquisto.unita }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="analysisResults.listaAcquisti.length === 0" class="text-center py-8">
                  <CheckIcon class="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p class="text-green-600 font-medium">Tutti i materiali sono disponibili!</p>
                </div>
              </div>
            </div>

            <!-- Timeline Consegne -->
            <div class="card" v-if="analysisResults.timeline">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">📅 Timeline Consegne Ottimizzata</h4>
              <div class="space-y-3">
                <div v-for="evento in analysisResults.timeline" :key="evento.id" class="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ evento.descrizione }}</p>
                    <p class="text-xs text-gray-600">{{ evento.data }} - {{ evento.fornitore }}</p>
                  </div>
                  <span class="text-sm font-medium text-blue-600">{{ evento.durata }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeAnalysisModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Chiudi
              </button>
              <button v-if="analysisResults.listaAcquisti.length > 0" @click="generateOrderList" class="w-full sm:w-auto btn-primary py-3 text-base">
                📋 Genera Lista Ordini
              </button>
              <button @click="exportAnalysis" class="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium text-base">
                📊 Esporta Analisi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Configurazione ML -->
    <div v-if="showMLConfigModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeMLConfigModal">
      <div class="relative top-4 mx-auto border w-full max-w-3xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-orange-100 rounded-lg">
                <CogIcon class="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">⚙️ Configurazione Algoritmo ML</h3>
                <p class="text-sm text-gray-600 mt-1">Parametri Machine Learning per Analisi Fabbisogno</p>
              </div>
            </div>
            <button @click="closeMLConfigModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi configurazione">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Configurazione Algoritmo -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Parametri Algoritmo -->
              <div class="card">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">🧠 Parametri Algoritmo</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-base font-medium text-gray-700 mb-2">Algoritmo</label>
                    <select v-model="mlConfiguration.algoritmo" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base">
                      <option value="Random Forest + Neural Network">Random Forest + Neural Network</option>
                      <option value="Gradient Boosting">Gradient Boosting</option>
                      <option value="Deep Learning">Deep Learning</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">N. Alberi</label>
                      <input v-model.number="mlConfiguration.parametri.nTrees" type="number" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Max Depth</label>
                      <input v-model.number="mlConfiguration.parametri.maxDepth" type="number" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Learning Rate</label>
                      <input v-model.number="mlConfiguration.parametri.learningRate" type="number" step="0.001" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                      <input v-model.number="mlConfiguration.parametri.batchSize" type="number" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg text-base" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Features e Target -->
              <div class="card">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">📊 Dataset Config</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-base font-medium text-gray-700 mb-2">Features Input</label>
                    <div class="space-y-2">
                      <div v-for="feature in mlConfiguration.features" :key="feature" 
                           class="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span class="text-base">{{ feature }}</span>
                        <CheckIcon class="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-base font-medium text-gray-700 mb-2">Target Output</label>
                    <div class="space-y-2">
                      <div v-for="target in mlConfiguration.target" :key="target" 
                           class="flex items-center justify-between p-2 bg-primary-50 rounded">
                        <span class="text-base">{{ target }}</span>
                        <CheckIcon class="w-4 h-4 text-primary-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="card text-center">
                <p class="text-base font-medium text-gray-600 mb-2">Accuratezza Costi</p>
                <p class="text-2xl font-bold text-green-600">{{ mlPerformance.accuracyCosti }}%</p>
              </div>
              <div class="card text-center">
                <p class="text-base font-medium text-gray-600 mb-2">Accuratezza Tempi</p>
                <p class="text-2xl font-bold text-blue-600">{{ mlPerformance.accuracyTempi }}%</p>
              </div>
              <div class="card text-center">
                <p class="text-base font-medium text-gray-600 mb-2">Accuratezza Materiali</p>
                <p class="text-2xl font-bold text-accent-600">{{ mlPerformance.accuracyMateriali }}%</p>
              </div>
              <div class="card text-center">
                <p class="text-base font-medium text-gray-600 mb-2">Confidence Level</p>
                <p class="text-2xl font-bold text-gray-900">{{ mlPerformance.confidenceLevel }}%</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeMLConfigModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button class="w-full sm:w-auto btn-primary py-3 text-base font-medium"
                      title="Salva configurazione algoritmo">
                ⚙️ Salva Configurazione
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Training ML -->
    <div v-if="showMLTrainingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeMLTrainingModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <CpuChipIcon class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">🤖 Training Machine Learning</h3>
                <p class="text-sm text-gray-600 mt-1">Auto-Learning dal Database Progetti Legnosystem</p>
              </div>
            </div>
            <button @click="closeMLTrainingModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi training">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Dataset Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <BuildingOfficeIcon class="w-5 h-5 text-blue-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-600">Progetti Totali</p>
                    <p class="text-xl font-bold text-gray-900">{{ mlStats.totaleProgetti }}</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-accent-100 rounded-lg">
                    <CubeIcon class="w-5 h-5 text-accent-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-600">Dataset Size</p>
                    <p class="text-xl font-bold text-gray-900">{{ mlStats.datasetSize }}</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <ClockIcon class="w-5 h-5 text-green-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-600">Ore Training</p>
                    <p class="text-xl font-bold text-gray-900">{{ mlStats.hoursTraining }}h</p>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="flex items-center">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <BeakerIcon class="w-5 h-5 text-purple-600" />
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-600">Modello</p>
                    <p class="text-base font-bold text-gray-900">v2.4.1</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Training Progress -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🚀 Auto-Learning Status</h4>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <p class="text-base font-medium text-blue-700">Rifacimenti</p>
                    <p class="text-2xl font-bold text-blue-600">{{ mlStats.rifacimenti }}</p>
                    <p class="text-sm text-blue-500">progetti analizzati</p>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-base font-medium text-green-700">Nuove Costruzioni</p>
                    <p class="text-2xl font-bold text-green-600">{{ mlStats.nuoveCostruzioni }}</p>
                    <p class="text-sm text-green-500">progetti analizzati</p>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <p class="text-base font-medium text-purple-700">Restauri</p>
                    <p class="text-2xl font-bold text-purple-600">{{ mlStats.restauri }}</p>
                    <p class="text-sm text-purple-500">progetti analizzati</p>
                  </div>
                </div>
                
                <div class="mt-6">
                  <div class="flex items-center justify-between text-base mb-2">
                    <span class="text-gray-600">Training Progress</span>
                    <span class="font-medium">{{ Math.round((mlStats.totaleProgetti / 50) * 100) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                         :style="`width: ${Math.round((mlStats.totaleProgetti / 50) * 100)}%`"></div>
                  </div>
                  <p class="text-sm text-gray-500 mt-2">
                    🎯 Obiettivo: 50 progetti per training ottimale
                  </p>
                </div>
              </div>
            </div>

            <!-- Training Results -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">📈 Risultati Training</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span class="text-base font-medium text-green-700">✅ Pattern Recognition Attivato</span>
                  <span class="text-sm text-green-600">Accuratezza: 94%</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span class="text-base font-medium text-blue-700">🔍 Analisi Predittiva Materiali</span>
                  <span class="text-sm text-blue-600">Precisione: 97%</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span class="text-base font-medium text-purple-700">⏱️ Stima Tempi Intelligente</span>
                  <span class="text-sm text-purple-600">Affidabilità: 91%</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span class="text-base font-medium text-accent-700">💰 Ottimizzazione Costi Auto</span>
                  <span class="text-sm text-accent-600">Risparmio: 15%</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeMLTrainingModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button class="w-full sm:w-auto btn-primary py-3 text-base font-medium"
                      title="Avvia nuovo ciclo di training">
                🤖 Avvia Nuovo Training
              </button>
            </div>
          </div>
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

            <!-- Cliente -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <input
                v-model="newCantiere.cliente"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
                  <p class="font-medium">{{ materiale.quantitaUtilizzata }} {{ materiale.unita }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Valore</p>
                  <p class="font-medium">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</p>
                </div>
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
            <!-- Nome Materiale -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
              <input
                v-model="newMaterial.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                v-model="newMaterial.descrizione"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Codice -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
              <input
                v-model="newMaterial.codice"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Quantità Richiesta -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Richiesta</label>
              <input
                v-model.number="newMaterial.quantitaRichiesta"
                type="number"
                min="0"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Unita di Misura -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unita di Misura</label>
              <input
                v-model="newMaterial.unita"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Prezzo Unitario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Unitario (€)</label>
              <input
                v-model.number="newMaterial.prezzoUnitario"
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
              ></textarea>
            </div>

            <!-- Fornitori -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fornitori</label>
              <select
                v-model="newMaterial.fornitoreId"
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
              <button type="button" @click="closeAddMaterialModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Nuovo Materiale
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

            <!-- Quantità Richiesta -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PlusIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilIcon,
  ChartBarIcon,
  CubeIcon,
  BeakerIcon,
  CogIcon,
  CpuChipIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  PaperClipIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showMaterialsModal = ref(false)
const showAnalysisModal = ref(false)
const showMLConfigModal = ref(false)
const showMLTrainingModal = ref(false)
const showAddModal = ref(false)
const showTeamModal = ref(false)
const showAttachmentsModal = ref(false)
const showManageMaterialsModal = ref(false)
const showAddMaterialModal = ref(false)
const showEditMaterialModal = ref(false)
const showMaterialAttachmentsModal = ref(false)

const searchTerm = ref('')
const selectedStatus = ref('')
const selectedPriority = ref('')

const selectedCantiere = ref(null)
const editingCantiere = ref(null)
const materialiCantiere = ref([])
const analysisResults = ref(null)
const editingMaterial = ref(null)
const newMaterial = ref({
  materialeId: null,
  quantitaRichiesta: 0,
  fornitoreId: null,
  prezzoEffettivo: 0,
  dataAcquisto: '',
  note: '',
  stato: 'pianificato'
})

// Nuovo cantiere
const newCantiere = ref({
  nome: '',
  cliente: '',
  indirizzo: '',
  tipoLavoro: '',
  valore: 0,
  dataInizio: '',
  scadenza: '',
  stato: 'pianificato',
  priorita: 'media'
})

// Stats ML
const mlStats = ref({
  totaleProgetti: 45,
  rifacimenti: 18,
  nuoveCostruzioni: 15,
  restauri: 12,
  datasetSize: 1250,
  hoursTraining: 48
})

const mlPerformance = ref({
  accuracyCosti: 94,
  accuracyTempi: 91,
  accuracyMateriali: 97,
  confidenceLevel: 89
})

const mlConfiguration = ref({
  algoritmo: 'Random Forest + Neural Network',
  parametri: {
    nTrees: 100,
    maxDepth: 15,
    learningRate: 0.001,
    batchSize: 32
  },
  features: ['superficie', 'tipoTetto', 'materiali', 'tempoAnno', 'regione'],
  target: ['costiTotali', 'tempiRealizzazione', 'fabbisognoMateriali']
})

// Stats
const stats = ref({
  attivi: 8,
  valoreTotale: 345000,
  inScadenza: 3,
  completatiMese: 5
})

// Dati cantieri
const cantieri = ref([
  {
    id: 1,
    nome: 'Rifacimento Tetto Villa Rossi',
    cliente: 'Famiglia Rossi',
    indirizzo: 'Via delle Rose 15, Milano',
    tipoLavoro: 'Rifacimento Completo',
    stato: 'in-corso',
    priorita: 'alta',
    progresso: 75,
    valore: 85000,
    dataInizio: '2024-01-15',
    scadenza: '2024-02-28',
    team: [
      { id: 1, nome: 'Marco Bianchi', iniziali: 'MB' },
      { id: 2, nome: 'Luca Verdi', iniziali: 'LV' },
      { id: 3, nome: 'Anna Russo', iniziali: 'AR' }
    ],
    fasi: [
      { id: 1, nome: 'Smontaggio tetto esistente', durata: '3 giorni', completata: true },
      { id: 2, nome: 'Rifacimento struttura portante', durata: '5 giorni', completata: true },
      { id: 3, nome: 'Posa manto di copertura', durata: '4 giorni', completata: false },
      { id: 4, nome: 'Finiture e grondaie', durata: '2 giorni', completata: false }
    ]
  },
  {
    id: 2,
    nome: 'Copertura Capannone Industriale',
    cliente: 'Industrie SpA',
    indirizzo: 'Zona Industriale Nord, Bergamo',
    tipoLavoro: 'Nuova Costruzione',
    stato: 'pianificato',
    priorita: 'media',
    progresso: 15,
    valore: 125000,
    dataInizio: '2024-02-01',
    scadenza: '2024-03-30',
    team: [
      { id: 4, nome: 'Giuseppe Neri', iniziali: 'GN' },
      { id: 5, nome: 'Francesco Blu', iniziali: 'FB' }
    ],
    fasi: [
      { id: 1, nome: 'Progettazione esecutiva', durata: '5 giorni', completata: true },
      { id: 2, nome: 'Preparazione area', durata: '3 giorni', completata: false },
      { id: 3, nome: 'Montaggio struttura', durata: '10 giorni', completata: false },
      { id: 4, nome: 'Copertura e isolamento', durata: '7 giorni', completata: false }
    ]
  },
  {
    id: 3,
    nome: 'Ristrutturazione Tetto Storico',
    cliente: 'Comune di Verona',
    indirizzo: 'Centro Storico, Verona',
    tipoLavoro: 'Restauro Conservativo',
    stato: 'sospeso',
    priorita: 'bassa',
    progresso: 30,
    valore: 65000,
    dataInizio: '2024-01-20',
    scadenza: '2024-04-15',
    team: [
      { id: 6, nome: 'Elena Gialli', iniziali: 'EG' }
    ],
    fasi: [
      { id: 1, nome: 'Analisi strutturale', durata: '7 giorni', completata: true },
      { id: 2, nome: 'Consolidamento travi', durata: '8 giorni', completata: false },
      { id: 3, nome: 'Rifacimento copertura', durata: '6 giorni', completata: false }
    ]
  }
])

// Lista dipendenti disponibili (sincronizzata con localStorage)
const dipendentiDisponibili = ref([])

// Gestione allegati
const cantieriAttachments = ref({})

// Gestione allegati materiali per cantiere
const materialiAttachments = ref({})
const selectedMaterial = ref(null)

// Dati magazzino (sincronizzato con localStorage)
const materialiMagazzino = ref([])

// Dati fornitori
const fornitori = ref([
  { id: 1, nome: 'LegnoAlp Spa', telefono: '0123 456789', email: 'info@legnoalp.it' },
  { id: 2, nome: 'Segheria Montana', telefono: '0456 789123', email: 'vendite@montana.com' },
  { id: 3, nome: 'Isolanti Nord Srl', telefono: '0789 123456', email: 'ordini@isolantinord.it' },
  { id: 4, nome: 'Ferramenta Italiana', telefono: '0321 654987', email: 'info@ferramentaitaliana.com' }
])

// Funzione per caricare dipendenti dal localStorage
const loadDipendentiFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_dipendenti')
  if (stored) {
    try {
      const dipendenti = JSON.parse(stored)
      dipendentiDisponibili.value = dipendenti
    } catch (e) {
      console.warn('Errore nel caricamento dipendenti:', e)
    }
  }
}

// Funzione per caricare allegati dal localStorage
const loadAttachmentsFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_attachments')
  if (stored) {
    try {
      cantieriAttachments.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento allegati:', e)
      cantieriAttachments.value = {}
    }
  }
}

// Funzione per caricare materiali magazzino dal localStorage
const loadMaterialiMagazzinoFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_materiali')
  if (stored) {
    try {
      materialiMagazzino.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento materiali magazzino:', e)
      // Materiali di default se non ci sono dati
      materialiMagazzino.value = [
        { id: 1, codice: 'TRV001', nome: 'Trave Lamellare GL24h', categoria: 'travi', quantita: 45, unita: 'pz', prezzoUnitario: 85.50 },
        { id: 2, codice: 'TAV002', nome: 'Tavole Abete', categoria: 'tavole', quantita: 120, unita: 'm²', prezzoUnitario: 45.00 },
        { id: 3, codice: 'ISO003', nome: 'Isolante Termico', categoria: 'isolanti', quantita: 80, unita: 'm²', prezzoUnitario: 12.50 },
        { id: 4, codice: 'VIT004', nome: 'Viti per Legno', categoria: 'ferramenta', quantita: 2500, unita: 'pz', prezzoUnitario: 0.35 }
      ]
    }
  } else {
    // Materiali di default
    materialiMagazzino.value = [
      { id: 1, codice: 'TRV001', nome: 'Trave Lamellare GL24h', categoria: 'travi', quantita: 45, unita: 'pz', prezzoUnitario: 85.50 },
      { id: 2, codice: 'TAV002', nome: 'Tavole Abete', categoria: 'tavole', quantita: 120, unita: 'm²', prezzoUnitario: 45.00 },
      { id: 3, codice: 'ISO003', nome: 'Isolante Termico', categoria: 'isolanti', quantita: 80, unita: 'm²', prezzoUnitario: 12.50 },
      { id: 4, codice: 'VIT004', nome: 'Viti per Legno', categoria: 'ferramenta', quantita: 2500, unita: 'pz', prezzoUnitario: 0.35 }
    ]
  }
}

// Funzione per salvare allegati nel localStorage
const saveAttachmentsToStorage = () => {
  localStorage.setItem('legnosystem_attachments', JSON.stringify(cantieriAttachments.value))
}

// Carica cantieri dal localStorage all'avvio
const loadCantieriFromStorage = () => {
  const stored = localStorage.getItem('legnosystem_cantieri')
  if (stored) {
    try {
      cantieri.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento cantieri dal localStorage:', e)
    }
  }
}

// Salva cantieri nel localStorage
const saveCantieriToStorage = () => {
  localStorage.setItem('legnosystem_cantieri', JSON.stringify(cantieri.value))
  
  // Trigger evento storage per altre finestre/tab
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'legnosystem_cantieri',
    newValue: JSON.stringify(cantieri.value)
  }))
  
  // Trigger evento personalizzato per aggiornamenti nella stessa pagina
  window.dispatchEvent(new CustomEvent('cantieri-updated'))
}

// Carica i dati all'avvio
loadCantieriFromStorage()

// Carica dipendenti all'avvio
loadDipendentiFromStorage()

// Carica allegati all'avvio
loadAttachmentsFromStorage()

// Carica materiali magazzino all'avvio
loadMaterialiMagazzinoFromStorage()

// Carica allegati materiali all'avvio  
// loadMaterialAttachmentsFromStorage() // RIMOSSA: causava errore hoisting

// Ascolta gli eventi di aggiornamento dipendenti
window.addEventListener('dipendenti-updated', loadDipendentiFromStorage)

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
  editingCantiere.value = { ...cantiere }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCantiere.value = null
}

const saveCantiereChanges = () => {
  const index = cantieri.value.findIndex(c => c.id === editingCantiere.value.id)
  if (index !== -1) {
    cantieri.value[index] = { ...editingCantiere.value }
  }
  
  // Salva nel localStorage per sincronizzazione
  saveCantieriToStorage()
  
  closeEditModal()
  alert(`✅ Cantiere "${editingCantiere.value.nome}" aggiornato con successo!`)
}

const updateProgress = (cantiere) => {
  const nuovoProgresso = Math.min(cantiere.progresso + 10, 100)
  cantiere.progresso = nuovoProgresso
  
  if (nuovoProgresso === 100) {
    cantiere.stato = 'completato'
    mlStats.value.totaleProgetti += 1
    if (cantiere.tipoLavoro === 'Rifacimento Completo') {
      mlStats.value.rifacimenti += 1
    } else if (cantiere.tipoLavoro === 'Nuova Costruzione') {
      mlStats.value.nuoveCostruzioni += 1
    } else if (cantiere.tipoLavoro === 'Restauro Conservativo') {
      mlStats.value.restauri += 1
    }
    
    mlPerformance.value.accuracyCosti = Math.min(mlPerformance.value.accuracyCosti + 1, 99)
    mlPerformance.value.accuracyTempi = Math.min(mlPerformance.value.accuracyTempi + 1, 99)
    mlPerformance.value.accuracyMateriali = Math.min(mlPerformance.value.accuracyMateriali + 1, 99)
    
    alert(`🎉 Cantiere "${cantiere.nome}" completato al 100%!\n\n🧠 BONUS ML: Progetto aggiunto automaticamente al dataset!\n📊 Nuovi totali:\n- Progetti ML: ${mlStats.value.totaleProgetti}\n- Accuratezza migliorata!\n\n🚀 L'algoritmo diventa più intelligente!`)
  } else {
    alert(`📊 Progresso aggiornato: ${nuovoProgresso}% per "${cantiere.nome}"`)
  }
}

const viewMaterials = (cantiere) => {
  selectedCantiere.value = cantiere
  materialiCantiere.value = getMaterialsByCantiere(cantiere.id)
  showMaterialsModal.value = true
}

const closeMaterialsModal = () => {
  showMaterialsModal.value = false
  selectedCantiere.value = null
  materialiCantiere.value = []
}

const getMaterialsByCantiere = (cantiereId) => {
  // Carica materiali cantiere dal localStorage
  const stored = localStorage.getItem('legnosystem_materiali_cantieri')
  let materialiCantieriData = {}
  
  if (stored) {
    try {
      materialiCantieriData = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento materiali cantieri:', e)
    }
  }
  
  // Se esistono materiali per questo cantiere, restituiscili
  if (materialiCantieriData[cantiereId]) {
    return materialiCantieriData[cantiereId]
  }
  
  // Altrimenti, usa i dati di esempio (backwards compatibility)
  const materialiDatabase = {
    1: [
      {
        id: 1,
        codice: 'TRV01',
        nome: 'Travi Lamellari GL24h',
        descrizione: '20x30cm - Lunghezza 6m',
        quantitaRichiesta: 15,
        quantitaUtilizzata: 12,
        unita: 'pz',
        prezzoUnitario: 85.50,
        stato: 'utilizzato',
        fornitoreId: 1,
        fornitoreNome: 'LegnoAlp Spa',
        prezzoEffettivo: 85.50,
        dataAcquisto: '2024-01-15',
        note: ''
      },
      {
        id: 2,
        codice: 'TAV03',
        nome: 'Tavole Abete C24',
        descrizione: 'Spessore 30mm - Larghezza 200mm',
        quantitaRichiesta: 80,
        quantitaUtilizzata: 65,
        unita: 'm²',
        prezzoUnitario: 45.00,
        stato: 'in-uso',
        fornitoreId: 2,
        fornitoreNome: 'Segheria Montana',
        prezzoEffettivo: 42.50,
        dataAcquisto: '2024-01-10',
        note: 'Sconto 5% per quantità'
      },
      {
        id: 3,
        codice: 'ISO02',
        nome: 'Isolante Termico',
        descrizione: 'Lana di roccia 12cm',
        quantitaRichiesta: 120,
        quantitaUtilizzata: 120,
        unita: 'm²',
        prezzoUnitario: 14.20,
        stato: 'completato',
        fornitoreId: 3,
        fornitoreNome: 'Isolanti Nord Srl',
        prezzoEffettivo: 13.80,
        dataAcquisto: '2024-01-08',
        note: 'Consegna anticipata'
      }
    ],
    2: [
      {
        id: 4,
        codice: 'TRV05',
        nome: 'Travetti Industriali',
        descrizione: 'Sezione 12x40cm - Classe GL32h',
        quantitaRichiesta: 50,
        quantitaUtilizzata: 0,
        unita: 'pz',
        prezzoUnitario: 125.00,
        stato: 'ordinato',
        fornitoreId: 1,
        fornitoreNome: 'LegnoAlp Spa',
        prezzoEffettivo: 120.00,
        dataAcquisto: '2024-02-01',
        note: 'In attesa di consegna'
      },
      {
        id: 5,
        codice: 'PAN01',
        nome: 'Pannelli OSB',
        descrizione: 'Spessore 18mm - Formato 250x125cm',
        quantitaRichiesta: 200,
        quantitaUtilizzata: 0,
        unita: 'pz',
        prezzoUnitario: 28.50,
        stato: 'pianificato',
        fornitoreId: 4,
        fornitoreNome: 'Ferramenta Italiana',
        prezzoEffettivo: 28.50,
        dataAcquisto: '',
        note: 'Da ordinare'
      }
    ],
    3: [
      {
        id: 6,
        codice: 'TRA01',
        nome: 'Travi Antiche Restaurate',
        descrizione: 'Castagno secolare - Sezione variabile',
        quantitaRichiesta: 8,
        quantitaUtilizzata: 3,
        unita: 'pz',
        prezzoUnitario: 450.00,
        stato: 'in-lavorazione',
        fornitoreId: 2,
        fornitoreNome: 'Segheria Montana',
        prezzoEffettivo: 420.00,
        dataAcquisto: '2024-01-20',
        note: 'Materiale storico'
      }
    ]
  }
  
  return materialiDatabase[cantiereId] || []
}

const getTotalMaterialsValue = () => {
  return materialiCantiere.value.reduce((total, materiale) => {
    return total + (materiale.quantitaRichiesta * materiale.prezzoUnitario)
  }, 0)
}

const getCompletedMaterials = () => {
  return materialiCantiere.value.filter(m => m.stato === 'completato' || m.stato === 'utilizzato').length
}

const analyzeFabbisogno = (cantiere) => {
  selectedCantiere.value = cantiere
  analysisResults.value = null
  showAnalysisModal.value = true
  
  // Simula analisi ML
  setTimeout(() => {
    analysisResults.value = {
      disponibili: 12,
      daOrdinare: 8,
      mancanti: 3,
      costoOrdini: 15650,
      materialiNecessari: [
        {
          codice: 'TRV01',
          nome: 'Travi Lamellari GL24h',
          quantitaNecessaria: 20,
          unita: 'pz',
          stato: 'disponibile'
        },
        {
          codice: 'ISO05',
          nome: 'Isolante Fibra di Legno',
          quantitaNecessaria: 150,
          unita: 'm²',
          stato: 'ordinare'
        },
        {
          codice: 'VIT012',
          nome: 'Viti Autofilettanti 8x200',
          quantitaNecessaria: 500,
          unita: 'pz',
          stato: 'mancante'
        }
      ],
      raccomandazioni: [
        '🔍 Ordinare immediatamente l\'isolante in fibra di legno',
        '⚠️ Verificare disponibilità viti presso fornitori alternativi',
        '📦 Considerare ordine cumulativo per ottimizzare costi',
        '🚚 Pianificare consegne scaglionate per ottimizzare spazi'
      ]
    }
  }, 3000)
}

const closeAnalysisModal = () => {
  showAnalysisModal.value = false
  selectedCantiere.value = null
  analysisResults.value = null
}

const configureAlgorithm = () => {
  showMLConfigModal.value = true
}

const closeMLConfigModal = () => {
  showMLConfigModal.value = false
}

const trainMLAlgorithm = () => {
  showMLTrainingModal.value = true
}

const closeMLTrainingModal = () => {
  showMLTrainingModal.value = false
}

const saveNewCantiere = () => {
  if (!newCantiere.value.nome || !newCantiere.value.cliente || !newCantiere.value.valore) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  // Salvo il nome prima di resettare il form
  const nomeCantiere = newCantiere.value.nome
  
  const newId = Math.max(...cantieri.value.map(c => c.id)) + 1
  const nuovoCantiere = {
    ...newCantiere.value,
    id: newId,
    progresso: 0,
    team: [],
    fasi: []
  }
  
  cantieri.value.unshift(nuovoCantiere)

  // Salva nel localStorage per sincronizzazione con altre pagine
  saveCantieriToStorage()

  // Mostro la notifica prima del reset
  alert(`✅ Cantiere "${nomeCantiere}" creato con successo!`)

  // Reset form
  newCantiere.value = {
    nome: '',
    cliente: '',
    indirizzo: '',
    tipoLavoro: '',
    valore: 0,
    dataInizio: '',
    scadenza: '',
    stato: 'pianificato',
    priorita: 'media'
  }

  closeAddModal()
}

const closeAddModal = () => {
  showAddModal.value = false
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

const saveTeamChanges = () => {
  // Aggiorna il cantiere nella lista principale
  const index = cantieri.value.findIndex(c => c.id === selectedCantiere.value.id)
  if (index !== -1) {
    cantieri.value[index] = { ...selectedCantiere.value }
  }
  
  // Salva nel localStorage
  saveCantieriToStorage()
  
  // Aggiorna i dipendenti con i nuovi cantieri assegnati
  updateEmployeeAssignments()
  
  closeTeamModal()
  alert(`✅ Team del cantiere "${selectedCantiere.value.nome}" aggiornato con successo!`)
}

const updateEmployeeAssignments = () => {
  // Aggiorna le assegnazioni dei dipendenti
  dipendentiDisponibili.value.forEach(dipendente => {
    const isAssigned = selectedCantiere.value.team?.some(membro => membro.id === dipendente.id)
    if (isAssigned) {
      dipendente.cantiereAttuale = selectedCantiere.value.nome
    } else if (dipendente.cantiereAttuale === selectedCantiere.value.nome) {
      dipendente.cantiereAttuale = null
    }
  })
  
  // Salva i dipendenti aggiornati nel localStorage
  localStorage.setItem('legnosystem_dipendenti', JSON.stringify(dipendentiDisponibili.value))
  window.dispatchEvent(new CustomEvent('dipendenti-updated'))
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
  if (!selectedCantiere.value) return []
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

const deleteFile = (file) => {
  if (confirm(`🗑️ Sei sicuro di voler eliminare "${file.name}"?`)) {
    const cantiereId = selectedCantiere.value.id
    if (cantieriAttachments.value[cantiereId]) {
      cantieriAttachments.value[cantiereId] = cantieriAttachments.value[cantiereId].filter(f => f.id !== file.id)
      saveAttachmentsToStorage()
      alert(`✅ File "${file.name}" eliminato con successo!`)
    }
  }
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return
  
  const cantiereId = selectedCantiere.value.id
  
  // Inizializza array allegati se non esiste
  if (!cantieriAttachments.value[cantiereId]) {
    cantieriAttachments.value[cantiereId] = []
  }
  
  for (const file of files) {
    // Validazione dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`❌ File "${file.name}" troppo grande (max 10MB)`)
      continue
    }
    
    // Crea oggetto allegato
    const attachment = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop().toLowerCase(),
      uploadDate: new Date().toISOString().split('T')[0],
      description: '',
      cantiereId: cantiereId,
      // In una vera implementazione, qui si caricherà il file su un server
      // Per ora salviamo solo i metadati
      url: URL.createObjectURL(file) // Temporaneo per la demo
    }
    
    cantieriAttachments.value[cantiereId].push(attachment)
  }
  
  saveAttachmentsToStorage()
  
  // Reset input
  event.target.value = ''
  
  alert(`✅ ${files.length} file caricati con successo!`)
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

const addMaterialToCantiere = () => {
  newMaterial.value = {
    materialeId: null,
    quantitaRichiesta: 0,
    fornitoreId: null,
    prezzoEffettivo: 0,
    dataAcquisto: '',
    note: '',
    stato: 'pianificato'
  }
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

const saveMaterialToCantiere = () => {
  if (!newMaterial.value.materialeId || !newMaterial.value.quantitaRichiesta) {
    alert('❌ Seleziona materiale e inserisci quantità richiesta!')
    return
  }

  const materialeSelected = materialiMagazzino.value.find(m => m.id == newMaterial.value.materialeId)
  const fornitoreSelected = fornitori.value.find(f => f.id == newMaterial.value.fornitoreId)
  
  if (!materialeSelected) {
    alert('❌ Materiale non trovato!')
    return
  }

  const nuovoMateriale = {
    id: Date.now() + Math.random(),
    codice: materialeSelected.codice,
    nome: materialeSelected.nome,
    descrizione: materialeSelected.descrizione || '',
    quantitaRichiesta: newMaterial.value.quantitaRichiesta,
    quantitaUtilizzata: 0,
    unita: materialeSelected.unita,
    prezzoUnitario: materialeSelected.prezzoUnitario,
    stato: newMaterial.value.stato,
    fornitoreId: newMaterial.value.fornitoreId,
    fornitoreNome: fornitoreSelected?.nome || '',
    prezzoEffettivo: newMaterial.value.prezzoEffettivo || materialeSelected.prezzoUnitario,
    dataAcquisto: newMaterial.value.dataAcquisto,
    note: newMaterial.value.note
  }

  // Aggiungi a materialiCantiere e salva nel localStorage
  materialiCantiere.value.push(nuovoMateriale)
  saveMaterialiCantiereToStorage()
  
  closeAddMaterialModal()
  alert(`✅ Materiale "${materialeSelected.nome}" aggiunto al cantiere!`)
}

const saveMaterialChanges = () => {
  if (!editingMaterial.value) return

  const index = materialiCantiere.value.findIndex(m => m.id === editingMaterial.value.id)
  if (index !== -1) {
    const fornitoreSelected = fornitori.value.find(f => f.id == editingMaterial.value.fornitoreId)
    editingMaterial.value.fornitoreNome = fornitoreSelected?.nome || ''
    
    materialiCantiere.value[index] = { ...editingMaterial.value }
    saveMaterialiCantiereToStorage()
  }
  
  closeEditMaterialModal()
  alert(`✅ Materiale "${editingMaterial.value.nome}" aggiornato!`)
}

const removeMaterialFromCantiere = (materialId) => {
  if (confirm('🗑️ Sei sicuro di voler rimuovere questo materiale dal cantiere?')) {
    const index = materialiCantiere.value.findIndex(m => m.id === materialId)
    if (index !== -1) {
      const materialeRimosso = materialiCantiere.value[index]
      materialiCantiere.value.splice(index, 1)
      saveMaterialiCantiereToStorage()
      alert(`✅ Materiale "${materialeRimosso.nome}" rimosso dal cantiere!`)
    }
  }
}

const saveMaterialiCantiereToStorage = () => {
  const stored = localStorage.getItem('legnosystem_materiali_cantieri')
  let materialiCantieriData = {}
  
  if (stored) {
    try {
      materialiCantieriData = JSON.parse(stored)
    } catch (e) {
      materialiCantieriData = {}
    }
  }
  
  materialiCantieriData[selectedCantiere.value.id] = materialiCantiere.value
  localStorage.setItem('legnosystem_materiali_cantieri', JSON.stringify(materialiCantieriData))
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
      materialiAttachments.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Errore nel caricamento allegati materiali:', e)
      materialiAttachments.value = {}
    }
  }
}

// Funzione per salvare allegati materiali nel localStorage
const saveMaterialAttachmentsToStorage = () => {
  localStorage.setItem('legnosystem_material_attachments', JSON.stringify(materialiAttachments.value))
}

const getMaterialAttachmentCount = (materiale) => {
  if (!materialiAttachments.value || !materiale) return 0
  return materialiAttachments.value[materiale.id]?.length || 0
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

// Inizializza allegati materiali dopo tutte le dichiarazioni
loadMaterialAttachmentsFromStorage()
</script> 