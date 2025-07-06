<template>
  <div class="space-y-6">
    <!-- Header Preventivi -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Preventivi</h1>
        <p class="text-gray-600">Pipeline vendite e offerte - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Preventivo
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <DocumentTextIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Preventivi Aperti</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.preventiviAperti }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Pipeline</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.valorePipeline.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ChartBarIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Tasso Conversione</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tassoConversione }}%</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Tempo Medio</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tempoMedio }}gg</p>
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
            placeholder="Cerca preventivi..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select v-model="selectedStato" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti gli stati</option>
          <option value="bozza">Bozza</option>
          <option value="inviato">Inviato</option>
          <option value="accettato">Accettato</option>
          <option value="rifiutato">Rifiutato</option>
          <option value="scaduto">Scaduto</option>
          <option value="convertito">Convertito</option>
        </select>
        <select v-model="selectedCliente" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti i clienti</option>
          <option v-for="cliente in availableClients" :key="cliente.id" :value="cliente.id">
            {{ cliente.nome }}
          </option>
        </select>
        <button 
          @click="testEmailJS"
          class="px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          :class="emailJS.isConfigured() ? 'bg-green-600 text-white' : 'bg-gray-400 text-gray-600 cursor-not-allowed'"
          :disabled="!emailJS.isConfigured()"
          :title="emailJS.isConfigured() ? 'Testa configurazione EmailJS' : 'EmailJS non configurato'"
        >
          {{ emailJS.isConfigured() ? '✅ EmailJS' : '⚠️ EmailJS' }}
        </button>
      </div>
    </div>

    <!-- Lista Preventivi -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-600">Caricamento preventivi...</p>
    </div>

    <div v-else-if="filteredPreventivi.length === 0" class="text-center py-8">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun preventivo trovato</h3>
      <p class="mt-1 text-sm text-gray-500">Inizia creando il tuo primo preventivo.</p>
    </div>

    <!-- Mobile: Card Layout -->
    <div v-else class="block lg:hidden space-y-4">
      <div v-for="preventivo in filteredPreventivi" :key="preventivo.id" class="card">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ preventivo.numero }}</h3>
            <p class="text-sm font-medium text-gray-700">{{ getClienteNome(preventivo.cliente) }}</p>
            <p class="text-xs text-gray-500">{{ preventivo.cliente?.contatto || 'Contatto non disponibile' }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex flex-col items-end space-y-2">
              <span 
                v-if="preventivo.stato !== 'convertito'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                :class="getStatoColor(preventivo.stato)"
              >
                {{ getStatoLabel(preventivo.stato) }}
              </span>
              <button 
                v-if="preventivo.stato === 'accettato'"
                @click="convertToCantiere(preventivo)"
                class="text-xs bg-green-600 text-white px-3 py-1 rounded-full"
              >
                → Cantiere
              </button>
              <span 
                v-if="preventivo.stato === 'convertito'"
                class="text-xs bg-purple-600 text-white px-3 py-1 rounded-full"
              >
                ✓ Convertito
              </span>
            </div>
            <ActionDropdown 
              :actions="createDropdownActions(preventivo)"
              @action="(action) => handleDropdownAction(action, preventivo)"
            />
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-900 mb-1">{{ preventivo.progetto }}</h4>
          <p class="text-xs text-gray-600">{{ preventivo.tipoLavoro }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">Importo</p>
            <p class="text-lg font-bold text-gray-900">€{{ preventivo.importo.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Data Invio</p>
            <p class="text-sm font-medium text-gray-900">{{ formatDate(preventivo.dataInvio, 'Non inviato') }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-1">Scadenza</p>
          <p class="text-sm font-medium" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
            {{ formatDate(preventivo.scadenza) }}
            <span v-if="isScaduto(preventivo.scadenza)" class="text-xs ml-1 bg-red-100 text-red-800 px-2 py-1 rounded-full">Scaduto</span>
          </p>
        </div>

        <!-- Azioni ora nel dropdown menu -->
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div v-else class="hidden lg:block card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progetto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Invio</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="preventivo in filteredPreventivi" :key="preventivo.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ preventivo.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ getClienteNome(preventivo.cliente) }}</div>
                  <div class="text-sm text-gray-500">{{ preventivo.cliente?.contatto || 'Contatto non disponibile' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ preventivo.progetto }}</div>
                  <div class="text-sm text-gray-500">{{ preventivo.tipoLavoro }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                €{{ preventivo.importo.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(preventivo.dataInvio, 'Non inviato') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
                {{ formatDate(preventivo.scadenza) }}
                <span v-if="isScaduto(preventivo.scadenza)" class="text-xs ml-1 bg-red-100 text-red-800 px-1 py-0.5 rounded">Scaduto</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span 
                    v-if="preventivo.stato !== 'convertito'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    :class="getStatoColor(preventivo.stato)"
                  >
                    {{ getStatoLabel(preventivo.stato) }}
                  </span>
                  <button 
                    v-if="preventivo.stato === 'accettato'"
                    @click="convertToCantiere(preventivo)"
                    class="text-xs bg-green-600 text-white px-3 py-1 rounded-full"
                  >
                    → Cantiere
                  </button>
                  <span 
                    v-if="preventivo.stato === 'convertito'"
                    class="text-xs bg-purple-600 text-white px-3 py-1 rounded-full"
                  >
                    ✓ Convertito
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <ActionDropdown 
                  :actions="createDropdownActions(preventivo)"
                  @action="(action) => handleDropdownAction(action, preventivo)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuovo Preventivo -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Nuovo Preventivo</h2>
          <button @click="closeAddModal" class="text-gray-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="savePreventivo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Progetto *</label>
              <input
                v-model="newPreventivo.progetto"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nome del progetto"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro *</label>
              <select
                v-model="newPreventivo.tipoLavoro"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleziona tipo</option>
                <option value="costruzione">Costruzione</option>
                <option value="ristrutturazione">Ristrutturazione</option>
                <option value="manutenzione">Manutenzione</option>
                <option value="consulenza">Consulenza</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
            <div class="flex space-x-4 mb-3">
              <label class="flex items-center">
                <input
                  v-model="clientSelectionMode"
                  type="radio"
                  value="existing"
                  class="mr-2"
                />
                Cliente esistente
              </label>
              <label class="flex items-center">
                <input
                  v-model="clientSelectionMode"
                  type="radio"
                  value="new"
                  class="mr-2"
                />
                Nuovo cliente
              </label>
            </div>

            <div v-if="clientSelectionMode === 'existing'">
              <select
                v-model="selectedClientFromList"
                @change="onClientSelected"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleziona cliente</option>
                <option v-for="cliente in availableClients" :key="cliente.id" :value="cliente.id">
                  {{ cliente.nome }} - {{ cliente.tipo }}
                </option>
              </select>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  v-model="newPreventivo.cliente.nome"
                  type="text"
                  required
                  placeholder="Nome cliente"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <input
                  v-model="newPreventivo.cliente.contatto"
                  type="text"
                  placeholder="Telefono/Email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
            <input
              v-model="newPreventivo.indirizzo"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Indirizzo del cantiere"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
              <input
                v-model.number="newPreventivo.importo"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza *</label>
              <input
                :value="toInputDate(newPreventivo.scadenza)"
                @input="newPreventivo.scadenza = $event.target.value"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              v-model="newPreventivo.descrizione"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Descrizione dettagliata del progetto..."
            ></textarea>
          </div>

          <!-- Sezione Materiali -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">📦 Materiali</h3>
              <button 
                type="button" 
                @click="addMaterialToPreventivo"
                class="btn-secondary text-sm"
              >
                + Aggiungi Materiale
              </button>
            </div>
            
            <!-- Lista Materiali -->
            <div v-if="materialiPreventivo.length > 0" class="space-y-3">
              <div v-for="materiale in materialiPreventivo" :key="materiale.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-sm text-gray-600">{{ materiale.descrizione }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</span>
                      <span>€{{ materiale.prezzoUnitario.toFixed(2) }}/{{ materiale.unita }}</span>
                      <span class="font-medium text-green-600">
                        Tot: €{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      type="button"
                      @click="editMaterialInPreventivo(materiale)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifica"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      @click="removeMaterialFromPreventivo(materiale.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Totale Materiali -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-blue-900">Totale Materiali:</span>
                  <span class="text-lg font-bold text-blue-900">€{{ getTotalMaterialsValue().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-6 text-gray-500">
              <p>Nessun materiale aggiunto al preventivo</p>
            </div>
          </div>

          <!-- Sezione Voci Aggiuntive -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">📋 Voci Aggiuntive</h3>
              <button 
                type="button" 
                @click="addVoceAggiuntiva"
                class="btn-secondary text-sm"
              >
                + Aggiungi Voce
              </button>
            </div>
            
            <!-- Lista Voci Aggiuntive -->
            <div v-if="vociAggiuntive.length > 0" class="space-y-3">
              <div v-for="voce in vociAggiuntive" :key="voce.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ voce.descrizione }}</h4>
                    <p v-if="voce.note" class="text-sm text-gray-600">{{ voce.note }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span class="font-medium text-green-600">
                        €{{ voce.importo.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      type="button"
                      @click="editVoceAggiuntiva(voce)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifica"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      @click="removeVoceAggiuntiva(voce.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Totale Voci Aggiuntive -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-yellow-900">Totale Voci Aggiuntive:</span>
                  <span class="text-lg font-bold text-yellow-900">€{{ getTotalVociAggiuntive().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-6 text-gray-500">
              <p>Nessuna voce aggiuntiva inserita</p>
              <p class="text-sm mt-1">Usa questa sezione per mezzi speciali, lavori particolari, ecc.</p>
            </div>
          </div>

          <!-- Totale Generale -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-green-900">TOTALE GENERALE:</span>
              <span class="text-2xl font-bold text-green-900">€{{ getTotalGenerale().toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeAddModal" class="btn-secondary">
              Annulla
            </button>
            <button type="submit" :disabled="saving" class="btn-primary">
              {{ saving ? 'Salvataggio...' : 'Salva Preventivo' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Visualizza Preventivo -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Dettagli Preventivo</h2>
          <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedPreventivo" class="space-y-6">
          <!-- Header Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Numero Preventivo</p>
                <p class="text-lg font-semibold text-gray-900">{{ selectedPreventivo.numero }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Stato</p>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getStatoColor(selectedPreventivo.stato)">
                  {{ getStatoLabel(selectedPreventivo.stato) }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Data Creazione</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDate(selectedPreventivo.createdAt, 'Non disponibile') }}</p>
                <p v-if="selectedPreventivo.createdAt" class="text-xs text-gray-500 mt-1">{{ formatRelativeDate(selectedPreventivo.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Dati Cliente -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Dati Cliente</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Nome</p>
                <p class="text-base font-medium text-gray-900">{{ getClienteNome(selectedPreventivo.cliente) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Contatto</p>
                <p class="text-base text-gray-900">{{ selectedPreventivo.cliente?.contatto || 'Non specificato' }}</p>
              </div>
            </div>
          </div>

          <!-- Dati Progetto -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Dati Progetto</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Nome Progetto</p>
                <p class="text-base font-medium text-gray-900">{{ selectedPreventivo.progetto }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Tipo Lavoro</p>
                <p class="text-base text-gray-900">{{ selectedPreventivo.tipoLavoro }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Indirizzo</p>
                <p class="text-base text-gray-900">{{ selectedPreventivo.indirizzo || 'Non specificato' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Importo</p>
                <p class="text-xl font-bold text-green-600">€{{ selectedPreventivo.importo?.toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- Date Importanti -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Date Importanti</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Data Invio</p>
                <p class="text-base font-medium text-gray-900">{{ formatDate(selectedPreventivo.dataInvio, 'Non inviato') }}</p>
                <p v-if="selectedPreventivo.dataInvio" class="text-xs text-gray-500 mt-1">{{ formatRelativeDate(selectedPreventivo.dataInvio) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Scadenza</p>
                <p class="text-base font-medium" :class="isScaduto(selectedPreventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
                  {{ formatDate(selectedPreventivo.scadenza, 'Non impostata') }}
                  <span v-if="isScaduto(selectedPreventivo.scadenza)" class="text-sm ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full">Scaduto</span>
                </p>
                <p v-if="selectedPreventivo.scadenza && !isScaduto(selectedPreventivo.scadenza)" class="text-xs text-gray-500 mt-1">
                  {{ daysBetween(new Date(), selectedPreventivo.scadenza) }} giorni rimanenti
                </p>
              </div>
              <div v-if="selectedPreventivo.dataConversione">
                <p class="text-sm text-gray-600 mb-1">Data Conversione</p>
                <p class="text-base font-medium text-purple-600">{{ formatDate(selectedPreventivo.dataConversione, 'Non convertito') }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatRelativeDate(selectedPreventivo.dataConversione) }}</p>
              </div>
              <div v-else-if="selectedPreventivo.dataAccettazione">
                <p class="text-sm text-gray-600 mb-1">Data Accettazione</p>
                <p class="text-base font-medium text-green-600">{{ formatDate(selectedPreventivo.dataAccettazione, 'Non accettato') }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatRelativeDate(selectedPreventivo.dataAccettazione) }}</p>
              </div>
              <div v-else-if="selectedPreventivo.dataRifiuto">
                <p class="text-sm text-gray-600 mb-1">Data Rifiuto</p>
                <p class="text-base font-medium text-red-600">{{ formatDate(selectedPreventivo.dataRifiuto, 'Non rifiutato') }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatRelativeDate(selectedPreventivo.dataRifiuto) }}</p>
              </div>
            </div>
          </div>

          <!-- Descrizione -->
          <div v-if="selectedPreventivo.descrizione" class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Descrizione</h3>
            <p class="text-gray-700 leading-relaxed">{{ selectedPreventivo.descrizione }}</p>
          </div>

          <!-- Materiali -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📦 Materiali</h3>
            
            <div v-if="materialiPreventivo.length > 0" class="space-y-4">
              <div v-for="materiale in materialiPreventivo" :key="materiale.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-lg">{{ materiale.nome }}</h4>
                    <p v-if="materiale.codice" class="text-sm text-gray-500 font-mono">{{ materiale.codice }}</p>
                    <p v-if="materiale.descrizione" class="text-sm text-gray-600 mt-1">{{ materiale.descrizione }}</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p class="text-xs text-gray-500">Quantità</p>
                        <p class="font-medium">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Prezzo Unitario</p>
                        <p class="font-medium">€{{ materiale.prezzoUnitario.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Fornitore</p>
                        <p class="font-medium">{{ getFornitoreNome(materiale.fornitoreId) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Totale</p>
                        <p class="font-bold text-green-600">
                          €{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}
                        </p>
                      </div>
                    </div>
                    
                    <p v-if="materiale.note" class="text-sm text-gray-600 mt-2 italic">
                      Note: {{ materiale.note }}
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Totale Materiali -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-blue-900">Totale Materiali:</span>
                  <span class="text-2xl font-bold text-blue-900">€{{ getTotalMaterialsValue().toFixed(2) }}</span>
                </div>
                
                <!-- Percentuale sul totale preventivo -->
                <div v-if="selectedPreventivo.importo > 0" class="mt-2 text-sm text-blue-700">
                  {{ Math.round((getTotalMaterialsValue() / selectedPreventivo.importo) * 100) }}% del valore totale preventivo
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-8 text-gray-500">
              <p>Nessun materiale specificato per questo preventivo</p>
            </div>
          </div>

          <!-- Voci Aggiuntive -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 Voci Aggiuntive</h3>
            
            <div v-if="vociAggiuntive.length > 0" class="space-y-4">
              <div v-for="voce in vociAggiuntive" :key="voce.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-lg">{{ voce.descrizione }}</h4>
                    <p v-if="voce.note" class="text-sm text-gray-600 mt-1">{{ voce.note }}</p>
                    
                    <div class="mt-3">
                      <div>
                        <p class="text-xs text-gray-500">Importo</p>
                        <p class="font-bold text-green-600 text-xl">€{{ voce.importo.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Totale Voci Aggiuntive -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-yellow-900">Totale Voci Aggiuntive:</span>
                  <span class="text-2xl font-bold text-yellow-900">€{{ getTotalVociAggiuntive().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-8 text-gray-500">
              <p>Nessuna voce aggiuntiva specificata per questo preventivo</p>
            </div>
          </div>

          <!-- Totale Finale -->
          <div class="card">
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
              <div class="flex justify-between items-center">
                <span class="text-xl font-bold text-green-900">TOTALE GENERALE:</span>
                <span class="text-3xl font-bold text-green-900">€{{ getTotalGenerale().toFixed(2) }}</span>
              </div>
              
              <div class="mt-3 text-sm text-green-700">
                <div class="flex justify-between">
                  <span>Materiali:</span>
                  <span>€{{ getTotalMaterialsValue().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Voci Aggiuntive:</span>
                  <span>€{{ getTotalVociAggiuntive().toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Azioni -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button 
              v-if="selectedPreventivo.stato === 'bozza'"
              @click="editPreventivo(selectedPreventivo)"
              class="btn-primary"
            >
              <PencilIcon class="w-4 h-4 mr-2" />
              Modifica
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'bozza'"
              @click="sendPreventivo(selectedPreventivo)"
              class="bg-accent-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              📧 Invia al Cliente
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'inviato'"
              @click="markAsAccepted(selectedPreventivo)"
              class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              ✅ Segna come Accettato
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'inviato'"
              @click="markAsRejected(selectedPreventivo)"
              class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              ❌ Segna come Rifiutato
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'accettato'"
              @click="convertToCantiere(selectedPreventivo)"
              class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              🏗️ Converti in Cantiere
            </button>

            <!-- Pulsante Download PDF -->
            <button 
              @click="downloadPDF(selectedPreventivo)"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              📄 Scarica PDF
            </button>

            <!-- Pulsante Reinvia Email (solo per preventivi già inviati) -->
            <button 
              v-if="['inviato', 'scaduto'].includes(selectedPreventivo.stato)"
              @click="resendPreventivo(selectedPreventivo)"
              class="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              🔄 Reinvia Email
            </button>
            
            <button 
              @click="deletePreventivo(selectedPreventivo)"
              class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              🗑️ Elimina
            </button>
            
            <button 
              @click="closeViewModal"
              class="btn-secondary"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Preventivo -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifica Preventivo</h2>
          <button @click="closeEditModal" class="text-gray-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="updatePreventivo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Progetto *</label>
              <input
                v-model="editingPreventivo.progetto"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nome del progetto"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro *</label>
              <select
                v-model="editingPreventivo.tipoLavoro"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleziona tipo</option>
                <option value="costruzione">Costruzione</option>
                <option value="ristrutturazione">Ristrutturazione</option>
                <option value="manutenzione">Manutenzione</option>
                <option value="consulenza">Consulenza</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
            <div class="flex space-x-4 mb-3">
              <label class="flex items-center">
                <input
                  v-model="editClientSelectionMode"
                  type="radio"
                  value="existing"
                  class="mr-2"
                />
                Cliente esistente
              </label>
              <label class="flex items-center">
                <input
                  v-model="editClientSelectionMode"
                  type="radio"
                  value="new"
                  class="mr-2"
                />
                Nuovo cliente
              </label>
            </div>

            <div v-if="editClientSelectionMode === 'existing'">
              <select
                v-model="editSelectedClientFromList"
                @change="onEditClientSelected"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleziona cliente</option>
                <option v-for="cliente in availableClients" :key="cliente.id" :value="cliente.id">
                  {{ cliente.nome }} - {{ cliente.tipo }}
                </option>
              </select>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  v-model="editingPreventivo.cliente.nome"
                  type="text"
                  required
                  placeholder="Nome cliente"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <input
                  v-model="editingPreventivo.cliente.contatto"
                  type="text"
                  placeholder="Telefono/Email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
            <input
              v-model="editingPreventivo.indirizzo"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Indirizzo del cantiere"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
              <input
                v-model.number="editingPreventivo.importo"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza *</label>
              <input
                :value="toInputDate(editingPreventivo.scadenza)"
                @input="editingPreventivo.scadenza = $event.target.value"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              v-model="editingPreventivo.descrizione"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Descrizione dettagliata del progetto..."
            ></textarea>
          </div>

          <!-- Sezione Materiali -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">📦 Materiali</h3>
              <button 
                type="button" 
                @click="addMaterialToPreventivo"
                class="btn-secondary text-sm"
              >
                + Aggiungi Materiale
              </button>
            </div>
            
            <!-- Lista Materiali -->
            <div v-if="materialiPreventivo.length > 0" class="space-y-3">
              <div v-for="materiale in materialiPreventivo" :key="materiale.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-sm text-gray-600">{{ materiale.descrizione }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</span>
                      <span>€{{ materiale.prezzoUnitario.toFixed(2) }}/{{ materiale.unita }}</span>
                      <span class="font-medium text-green-600">
                        Tot: €{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      type="button"
                      @click="editMaterialInPreventivo(materiale)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifica"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      @click="removeMaterialFromPreventivo(materiale.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Totale Materiali -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-blue-900">Totale Materiali:</span>
                  <span class="text-lg font-bold text-blue-900">€{{ getTotalMaterialsValue().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-6 text-gray-500">
              <p>Nessun materiale aggiunto al preventivo</p>
            </div>
          </div>

          <!-- Sezione Voci Aggiuntive -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">📋 Voci Aggiuntive</h3>
              <button 
                type="button" 
                @click="addVoceAggiuntiva"
                class="btn-secondary text-sm"
              >
                + Aggiungi Voce
              </button>
            </div>
            
            <!-- Lista Voci Aggiuntive -->
            <div v-if="vociAggiuntive.length > 0" class="space-y-3">
              <div v-for="voce in vociAggiuntive" :key="voce.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ voce.descrizione }}</h4>
                    <p v-if="voce.note" class="text-sm text-gray-600">{{ voce.note }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span class="font-medium text-green-600">
                        €{{ voce.importo.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      type="button"
                      @click="editVoceAggiuntiva(voce)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifica"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      @click="removeVoceAggiuntiva(voce.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Totale Voci Aggiuntive -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-yellow-900">Totale Voci Aggiuntive:</span>
                  <span class="text-lg font-bold text-yellow-900">€{{ getTotalVociAggiuntive().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-6 text-gray-500">
              <p>Nessuna voce aggiuntiva inserita</p>
              <p class="text-sm mt-1">Usa questa sezione per mezzi speciali, lavori particolari, ecc.</p>
            </div>
          </div>

          <!-- Totale Generale -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-green-900">TOTALE GENERALE:</span>
              <span class="text-2xl font-bold text-green-900">€{{ getTotalGenerale().toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4">
            <button 
              type="button" 
              @click="deletePreventivo(editingPreventivo)"
              class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              🗑️ Elimina
            </button>
            <div class="flex space-x-3">
              <button type="button" @click="closeEditModal" class="btn-secondary">
                Annulla
              </button>
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Salvataggio...' : 'Aggiorna Preventivo' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Aggiungi Materiale -->
  <div v-if="showAddMaterialModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Aggiungi Materiale</h2>
        <button @click="closeAddMaterialModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveMaterialToPreventivo" class="space-y-4">
        <!-- Selezione Tipo Materiale -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Materiale</label>
          <div class="flex space-x-4 mb-3">
            <label class="flex items-center">
              <input
                v-model="materialSelectionMode"
                type="radio"
                value="existing"
                class="mr-2"
                @change="selectedMaterialFromStock = ''"
              />
              Dal Magazzino
            </label>
            <label class="flex items-center">
              <input
                v-model="materialSelectionMode"
                type="radio"
                value="new"
                class="mr-2"
              />
              Nuovo Materiale
            </label>
          </div>
        </div>

        <!-- Selezione da Magazzino -->
        <div v-if="materialSelectionMode === 'existing'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleziona dal Magazzino</label>
            <select
              v-model="selectedMaterialFromStock"
              @change="fillMaterialFromStock"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleziona materiale</option>
              <option v-for="materiale in materialiMagazzino" :key="materiale.id" :value="materiale.id">
                {{ materiale.nome }} - {{ materiale.codice }}
              </option>
            </select>
          </div>
        </div>

        <!-- Dati Materiale -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input
                v-model="newMaterial.nome"
                type="text"
                required
                :readonly="materialSelectionMode === 'existing'"
                :class="[
                  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500',
                  materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
              <input
                v-model="newMaterial.codice"
                type="text"
                :readonly="materialSelectionMode === 'existing'"
                :class="[
                  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500',
                  materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                ]"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              v-model="newMaterial.descrizione"
              rows="3"
              :readonly="materialSelectionMode === 'existing'"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500',
                materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
              ]"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantità *</label>
              <input
                v-model.number="newMaterial.quantitaRichiesta"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unità</label>
              <select
                v-model="newMaterial.unita"
                :disabled="materialSelectionMode === 'existing'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pz">Pezzi (pz)</option>
                <option value="m">Metri (m)</option>
                <option value="m²">Metri Quadri (m²)</option>
                <option value="m³">Metri Cubi (m³)</option>
                <option value="kg">Chilogrammi (kg)</option>
                <option value="conf">Confezioni (conf)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Unitario (€) *</label>
            <input
              v-model.number="newMaterial.prezzoUnitario"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fornitore</label>
            <select
              v-model="newMaterial.fornitoreId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleziona fornitore</option>
              <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
                {{ fornitore.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              v-model="newMaterial.note"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeAddMaterialModal" class="btn-secondary">
            Annulla
          </button>
          <button type="submit" class="btn-primary">
            Aggiungi Materiale
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Modifica Materiale -->
  <div v-if="showEditMaterialModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Modifica Materiale</h2>
        <button @click="closeEditMaterialModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveMaterialChanges" class="space-y-4" v-if="editingMaterial">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <input
              v-model="editingMaterial.nome"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
            <input
              v-model="editingMaterial.codice"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
          <textarea
            v-model="editingMaterial.descrizione"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Quantità *</label>
            <input
              v-model.number="editingMaterial.quantitaRichiesta"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Unità</label>
            <select
              v-model="editingMaterial.unita"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pz">Pezzi (pz)</option>
              <option value="m">Metri (m)</option>
              <option value="m²">Metri Quadri (m²)</option>
              <option value="m³">Metri Cubi (m³)</option>
              <option value="kg">Chilogrammi (kg)</option>
              <option value="conf">Confezioni (conf)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Unitario (€) *</label>
          <input
            v-model.number="editingMaterial.prezzoUnitario"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fornitore</label>
          <select
            v-model="editingMaterial.fornitoreId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleziona fornitore</option>
            <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
              {{ fornitore.nome }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <textarea
            v-model="editingMaterial.note"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeEditMaterialModal" class="btn-secondary">
            Annulla
          </button>
          <button type="submit" class="btn-primary">
            Salva Modifiche
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Aggiungi Voce Aggiuntiva -->
  <div v-if="showAddVoceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Aggiungi Voce Aggiuntiva</h2>
        <button @click="closeAddVoceModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveVoceAggiuntiva" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione *</label>
          <input
            v-model="newVoce.descrizione"
            type="text"
            required
            placeholder="Es. Uso escavatore, Trasporto materiali, Lavori straordinari..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
          <input
            v-model.number="newVoce.importo"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <textarea
            v-model="newVoce.note"
            rows="3"
            placeholder="Dettagli aggiuntivi..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeAddVoceModal" class="btn-secondary">
            Annulla
          </button>
          <button type="submit" class="btn-primary">
            Aggiungi Voce
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Modifica Voce Aggiuntiva -->
  <div v-if="showEditVoceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Modifica Voce Aggiuntiva</h2>
        <button @click="closeEditVoceModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveVoceChanges" class="space-y-4" v-if="editingVoce">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione *</label>
          <input
            v-model="editingVoce.descrizione"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
          <input
            v-model.number="editingVoce.importo"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <textarea
            v-model="editingVoce.note"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeEditVoceModal" class="btn-secondary">
            Annulla
          </button>
          <button type="submit" class="btn-primary">
            Salva Modifiche
          </button>
        </div>
      </form>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFirestore } from '@/composables/useFirestore'
import { usePopup } from '@/composables/usePopup'

import { useEmailJS } from '@/composables/useEmailJS'
import { useDateUtils } from '@/composables/useDateUtils'
import { useFirestoreStore } from '@/stores/firestore'
import ActionDropdown from '@/components/ActionDropdown.vue'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const firestore = useFirestore()
const popup = usePopup()

const emailJS = useEmailJS()
const dateUtils = useDateUtils()
const firestoreStore = useFirestoreStore()

// Stato della pagina
const loading = ref(true)
const saving = ref(false)
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const searchTerm = ref('')
const selectedStato = ref('')
const selectedCliente = ref('')
const clientSelectionMode = ref('existing')
const selectedClientFromList = ref('')
const selectedPreventivo = ref(null)
const editClientSelectionMode = ref('existing')
const editSelectedClientFromList = ref('')

// Dati preventivi
const preventivi = ref([])
const availableClients = ref([])
const unsubscribePreventivi = ref(null)

// Gestione materiali preventivi
const showAddMaterialModal = ref(false)
const showEditMaterialModal = ref(false)
const materialSelectionMode = ref('existing')
const selectedMaterialFromStock = ref('')
const selectedMaterial = ref(null)
const editingMaterial = ref(null)
const newMaterial = ref(null)
const materialiMagazzino = ref([])
const fornitori = ref([])
const materialiPreventivo = ref([])

// Gestione voci aggiuntive
const showAddVoceModal = ref(false)
const showEditVoceModal = ref(false)
const editingVoce = ref(null)
const newVoce = ref(null)
const vociAggiuntive = ref([])

// Nuovo preventivo
const newPreventivo = ref({
  progetto: '',
  tipoLavoro: '',
  cliente: {
    id: '',
    nome: '',
    contatto: ''
  },
  indirizzo: '',
  importo: 0,
  scadenza: '',
  descrizione: '',
  stato: 'bozza',
  materiali: []
})

// Preventivo in modifica
const editingPreventivo = ref({
  progetto: '',
  tipoLavoro: '',
  cliente: {
    id: '',
    nome: '',
    contatto: ''
  },
  indirizzo: '',
  importo: 0,
  scadenza: '',
  descrizione: '',
  stato: 'bozza',
  materiali: []
})

// Computed
const filteredPreventivi = computed(() => {
  let result = preventivi.value

  if (searchTerm.value) {
    result = result.filter(p => 
      p.numero?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      getClienteNome(p.cliente).toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.progetto?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStato.value) {
    result = result.filter(p => p.stato === selectedStato.value)
  }

  if (selectedCliente.value) {
    result = result.filter(p => p.cliente?.id === selectedCliente.value)
  }

  return result
})

const stats = computed(() => {
  const aperti = preventivi.value.filter(p => ['bozza', 'inviato'].includes(p.stato))
  const accettati = preventivi.value.filter(p => p.stato === 'accettato')
  const totali = preventivi.value.length

  return {
    preventiviAperti: aperti.length,
    valorePipeline: aperti.reduce((acc, p) => acc + (p.importo || 0), 0),
    tassoConversione: totali > 0 ? Math.round((accettati.length / totali) * 100) : 0,
    tempoMedio: calculateAverageTime()
  }
})

// Methods
const getStatoColor = (stato) => {
  const colors = {
    'bozza': 'bg-gray-100 text-gray-800',
    'inviato': 'bg-blue-100 text-blue-800',
    'accettato': 'bg-green-100 text-green-800',
    'rifiutato': 'bg-red-100 text-red-800',
    'scaduto': 'bg-yellow-100 text-yellow-800',
    'convertito': 'bg-purple-100 text-purple-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'bozza': 'Bozza',
    'inviato': 'Inviato',
    'accettato': 'Accettato',
    'rifiutato': 'Rifiutato',
    'scaduto': 'Scaduto',
    'convertito': 'Convertito'
  }
  return labels[stato] || stato
}

const getClienteNome = (cliente) => {
  if (!cliente) return 'Cliente non specificato'
  
  if (typeof cliente === 'object' && cliente.nome) {
    return cliente.nome
  }
  
  if (typeof cliente === 'string') {
    return cliente
  }
  
  return 'Cliente non specificato'
}

// Utilizziamo le funzioni del composable dateUtils per gestione robusta delle date
const isScaduto = (scadenza) => dateUtils.isExpired(scadenza)
const formatDate = (dateInput, fallback = 'Non disponibile') => dateUtils.formatDate(dateInput, fallback)
const formatDateTime = (dateInput, fallback = 'Non disponibile') => dateUtils.formatDateTime(dateInput, fallback)
const formatRelativeDate = (dateInput, fallback = 'Non disponibile') => dateUtils.formatRelativeDate(dateInput, fallback)
const daysBetween = (startDate, endDate) => dateUtils.daysBetween(startDate, endDate)
const toInputDate = (dateInput) => dateUtils.toInputDate(dateInput)

const calculateAverageTime = () => {
  const completedPreventivi = preventivi.value.filter(p => ['accettato', 'rifiutato'].includes(p.stato))
  if (completedPreventivi.length === 0) return 0

  const totalDays = completedPreventivi.reduce((acc, p) => {
    // Usa il nuovo sistema di gestione date per parsing robusto
    const days = daysBetween(p.createdAt, p.updatedAt)
    return acc + Math.max(days, 0) // Evita giorni negativi
  }, 0)

  return Math.round(totalDays / completedPreventivi.length)
}

const generateNumeroPreventivo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const count = preventivi.value.length + 1
  return `PREV-${year}${month}${day}-${String(count).padStart(3, '0')}`
}

const loadPreventivi = async () => {
  try {
    loading.value = true
    
    // Configura l'ascolto real-time per i preventivi
    unsubscribePreventivi.value = firestoreStore.subscribeToCollection('preventivi', (data) => {
      preventivi.value = data.sort((a, b) => {
        // Usa il nuovo sistema di parsing per ordinamento robusto
        const dateA = dateUtils.parseDate(a.createdAt)
        const dateB = dateUtils.parseDate(b.createdAt)
        
        // Se una delle date non è valida, mettila alla fine
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        
        return dateB.getTime() - dateA.getTime()
      })
      
      // Aggiorna stati automaticamente per preventivi scaduti
      updateScaduti()
    })

    // Carica i clienti disponibili
    await loadClients()
    
  } catch (error) {
    console.error('Errore nel caricamento dei preventivi:', error)
    popup.error('Errore nel caricamento dei preventivi')
  } finally {
    loading.value = false
  }
}

const updateScaduti = async () => {
  // Usa il nuovo sistema per identificare preventivi scaduti
  const preventiviScaduti = preventivi.value.filter(p => 
    p.stato === 'inviato' && isScaduto(p.scadenza)
  )

  for (const preventivo of preventiviScaduti) {
    try {
      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'scaduto',
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Errore nell\'aggiornamento preventivo scaduto:', error)
    }
  }
}

const loadClients = async () => {
  try {
    await firestore.clientiOperations.load()
    availableClients.value = firestoreStore.clienti
  } catch (error) {
    console.error('Errore nel caricamento dei clienti:', error)
    availableClients.value = []
  }
}

const onClientSelected = () => {
  const selectedClient = availableClients.value.find(c => c.id === selectedClientFromList.value)
  if (selectedClient) {
    newPreventivo.value.cliente = {
      id: selectedClient.id,
      nome: selectedClient.nome,
      contatto: selectedClient.telefono || selectedClient.email || ''
    }
  }
}

const savePreventivo = async () => {
  try {
    saving.value = true
    
    const preventivoData = {
      ...newPreventivo.value,
      numero: generateNumeroPreventivo(),
      materiali: materialiPreventivo.value, // Salva i materiali
      vociAggiuntive: vociAggiuntive.value, // Salva le voci aggiuntive
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await firestoreStore.createDocument('preventivi', preventivoData)
    
    popup.success('Preventivo salvato con successo')
    closeAddModal()
    
  } catch (error) {
    console.error('Errore nel salvataggio del preventivo:', error)
    popup.error('Errore nel salvataggio del preventivo')
  } finally {
    saving.value = false
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newPreventivo.value = {
    progetto: '',
    tipoLavoro: '',
    cliente: {
      id: '',
      nome: '',
      contatto: ''
    },
    indirizzo: '',
    importo: 0,
    scadenza: '',
    descrizione: '',
    stato: 'bozza',
    materiali: []
  }
  clientSelectionMode.value = 'existing'
  selectedClientFromList.value = ''
  materialiPreventivo.value = []
  vociAggiuntive.value = []
}

const viewPreventivo = (preventivo) => {
  selectedPreventivo.value = preventivo
  // Carica i materiali associati al preventivo
  if (preventivo.materiali && preventivo.materiali.length > 0) {
    materialiPreventivo.value = [...preventivo.materiali]
  } else {
    materialiPreventivo.value = []
  }
  // Carica le voci aggiuntive associate al preventivo
  if (preventivo.vociAggiuntive && preventivo.vociAggiuntive.length > 0) {
    vociAggiuntive.value = [...preventivo.vociAggiuntive]
  } else {
    vociAggiuntive.value = []
  }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedPreventivo.value = null
}

const editPreventivo = (preventivo) => {
  // Copia i dati del preventivo nell'oggetto di modifica
  editingPreventivo.value = {
    id: preventivo.id,
    progetto: preventivo.progetto,
    tipoLavoro: preventivo.tipoLavoro,
    cliente: {
      id: preventivo.cliente?.id || '',
      nome: preventivo.cliente?.nome || '',
      contatto: preventivo.cliente?.contatto || ''
    },
    indirizzo: preventivo.indirizzo || '',
    importo: preventivo.importo || 0,
    scadenza: preventivo.scadenza || '',
    descrizione: preventivo.descrizione || '',
    stato: preventivo.stato,
    materiali: preventivo.materiali || []
  }
  
  // Carica i materiali associati al preventivo
  if (preventivo.materiali && preventivo.materiali.length > 0) {
    materialiPreventivo.value = [...preventivo.materiali]
  } else {
    materialiPreventivo.value = []
  }
  
  // Carica le voci aggiuntive associate al preventivo
  if (preventivo.vociAggiuntive && preventivo.vociAggiuntive.length > 0) {
    vociAggiuntive.value = [...preventivo.vociAggiuntive]
  } else {
    vociAggiuntive.value = []
  }
  
  // Imposta la modalità di selezione cliente
  editClientSelectionMode.value = preventivo.cliente?.id ? 'existing' : 'new'
  editSelectedClientFromList.value = preventivo.cliente?.id || ''
  
  showEditModal.value = true
  
  // Chiudi la modal di visualizzazione se è aperta
  if (showViewModal.value) {
    closeViewModal()
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingPreventivo.value = {
    progetto: '',
    tipoLavoro: '',
    cliente: {
      id: '',
      nome: '',
      contatto: ''
    },
    indirizzo: '',
    importo: 0,
    scadenza: '',
    descrizione: '',
    stato: 'bozza',
    materiali: []
  }
  editClientSelectionMode.value = 'existing'
  editSelectedClientFromList.value = ''
  materialiPreventivo.value = []
  vociAggiuntive.value = []
}

const onEditClientSelected = () => {
  const selectedClient = availableClients.value.find(c => c.id === editSelectedClientFromList.value)
  if (selectedClient) {
    editingPreventivo.value.cliente = {
      id: selectedClient.id,
      nome: selectedClient.nome,
      contatto: selectedClient.telefono || selectedClient.email || ''
    }
  }
}

const updatePreventivo = async () => {
  try {
    saving.value = true
    
    const updateData = {
      progetto: editingPreventivo.value.progetto,
      tipoLavoro: editingPreventivo.value.tipoLavoro,
      cliente: editingPreventivo.value.cliente,
      indirizzo: editingPreventivo.value.indirizzo,
      importo: editingPreventivo.value.importo,
      scadenza: editingPreventivo.value.scadenza,
      descrizione: editingPreventivo.value.descrizione,
      materiali: materialiPreventivo.value, // Salva i materiali aggiornati
      vociAggiuntive: vociAggiuntive.value, // Salva le voci aggiuntive aggiornate
      updatedAt: new Date()
    }

    await firestoreStore.updateDocument('preventivi', editingPreventivo.value.id, updateData)
    
    popup.success('Preventivo aggiornato con successo')
    closeEditModal()
    
      } catch (error) {
      console.error('Errore nell\'aggiornamento del preventivo:', error)
      popup.error('Errore nell\'aggiornamento del preventivo')
    } finally {
      saving.value = false
  }
}

const sendPreventivo = async (preventivo) => {
  try {
    // Verifica che il cliente abbia un'email valida
    if (!preventivo.cliente?.contatto || !preventivo.cliente.contatto.includes('@')) {
      popup.error('Il cliente non ha un\'email valida. Aggiorna i dati del cliente.')
      return
    }

    // Verifica configurazione EmailJS
    if (!emailJS.isConfigured()) {
      const useAnyway = await popup.confirm(
        'EmailJS non è configurato. Vuoi comunque segnare il preventivo come inviato?\n\n' +
        'Per abilitare l\'invio email reale, configura le variabili d\'ambiente EmailJS.'
      )
      
      if (!useAnyway) return
      
      // Solo aggiorna lo stato senza inviare email
      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'inviato',
        dataInvio: new Date(),
        updatedAt: new Date(),
        notaInvio: 'Segnato come inviato manualmente (EmailJS non configurato)'
      })
      
              popup.warning('Preventivo segnato come inviato (email non inviata)')
      return
    }

    const confirmed = await popup.confirm(
      `Confermi l'invio del preventivo via email a:\n${preventivo.cliente.nome} (${preventivo.cliente.contatto})?`
    )
    if (!confirmed) return

    // Crea una copia del preventivo con i dati aggiornati per l'invio email
    const preventivoConDatiAggiornati = {
      ...preventivo,
      materiali: materialiPreventivo.value.length > 0 ? materialiPreventivo.value : preventivo.materiali,
      vociAggiuntive: vociAggiuntive.value.length > 0 ? vociAggiuntive.value : preventivo.vociAggiuntive
    }
    
    // Invia email tramite EmailJS
    const emailResult = await emailJS.sendPreventivoEmail(preventivoConDatiAggiornati)

    if (emailResult.success) {
      // Aggiorna stato preventivo dopo invio riuscito
      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'inviato',
        dataInvio: new Date(),
        updatedAt: new Date(),
        emailInviata: true,
        emailResponse: emailResult.response?.text || 'Email inviata tramite EmailJS'
      })
      
              popup.success(`Preventivo inviato via email a ${preventivo.cliente.nome}`)
    } else {
      // Offri opzione di segnare come inviato comunque
      const markAnyway = await popup.confirm(
        'Invio email fallito. Vuoi comunque segnare il preventivo come inviato?\n\n' +
        'Potresti dover inviare manualmente il preventivo al cliente.'
      )
      
      if (markAnyway) {
        await firestoreStore.updateDocument('preventivi', preventivo.id, {
          stato: 'inviato',
          dataInvio: new Date(),
          updatedAt: new Date(),
          emailInviata: false,
          notaInvio: `Errore invio email: ${emailResult.error}`
        })
        
        popup.warning('Preventivo segnato come inviato (invio email fallito)')
      }
    }
    
  } catch (error) {
    console.error('Errore nell\'invio del preventivo:', error)
    popup.error('Errore nell\'invio del preventivo')
  }
}

const markAsAccepted = async (preventivo) => {
  try {
    // Per preventivi in bozza, chiediamo la modalità di accettazione
    if (preventivo.stato === 'bozza') {
      const viaEmail = await popup.confirm(
        'Modalità di accettazione',
        'Il preventivo è stato accettato via email?\n\n' +
        '• Clicca "Conferma" se accettato via email\n' +
        '• Clicca "Annulla" se accettato direttamente'
      )
      
      if (viaEmail) {
        // Accettato via email - aggiorniamo anche lo stato di invio
        await firestoreStore.updateDocument('preventivi', preventivo.id, {
          stato: 'accettato',
          dataAccettazione: new Date(),
          modalitaAccettazione: 'email',
          dataInvio: new Date(),
          updatedAt: new Date()
        })
        popup.success('Preventivo segnato come accettato via email')
      } else {
        // Chiede conferma per accettazione diretta
        const confermaDiretto = await popup.confirm(
          'Conferma accettazione diretta',
          'Confermi che il preventivo è stato accettato direttamente dal cliente?'
        )
        
        if (confermaDiretto) {
          await firestoreStore.updateDocument('preventivi', preventivo.id, {
            stato: 'accettato',
            dataAccettazione: new Date(),
            modalitaAccettazione: 'diretto',
            updatedAt: new Date()
          })
          popup.success('Preventivo segnato come accettato direttamente')
        }
      }
    } else {
      // Per preventivi già inviati, procedura normale
      const confirmed = await popup.confirm('Confermi che il preventivo è stato accettato dal cliente?')
      if (!confirmed) return

      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'accettato',
        dataAccettazione: new Date(),
        modalitaAccettazione: 'email',
        updatedAt: new Date()
      })

      popup.success('Preventivo segnato come accettato')
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento del preventivo:', error)
    popup.error('Errore nell\'aggiornamento del preventivo')
  }
}

const markAsRejected = async (preventivo) => {
  try {
    const confirmed = await popup.confirm('Confermi che il preventivo è stato rifiutato dal cliente?')
    if (!confirmed) return

    await firestoreStore.updateDocument('preventivi', preventivo.id, {
      stato: 'rifiutato',
      dataRifiuto: new Date(),
      updatedAt: new Date()
    })

    popup.success('Preventivo segnato come rifiutato')
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del preventivo:', error)
    popup.error('Errore nell\'aggiornamento del preventivo')
  }
}

const downloadPDF = (preventivo) => {
  try {
    // Crea una copia del preventivo con i dati aggiornati
    const preventivoConDatiAggiornati = {
      ...preventivo,
      materiali: materialiPreventivo.value.length > 0 ? materialiPreventivo.value : preventivo.materiali,
      vociAggiuntive: vociAggiuntive.value.length > 0 ? vociAggiuntive.value : preventivo.vociAggiuntive
    }
    
    const pdfDoc = emailJS.generatePreventivoPDF(preventivoConDatiAggiornati)
    pdfDoc.save(`Preventivo-${preventivo.numero}.pdf`)
    popup.success('PDF scaricato con successo')
  } catch (error) {
    console.error('Errore nel download del PDF:', error)
    popup.error('Errore nel download del PDF')
  }
}

const resendPreventivo = async (preventivo) => {
  try {
    const confirmed = await popup.confirm(
      `Reinviare il preventivo via email a:\n${preventivo.cliente.nome} (${preventivo.cliente.contatto})?`
    )
    if (!confirmed) return

    // Utilizza la stessa funzione di invio
    await sendPreventivo(preventivo)
  } catch (error) {
    console.error('Errore nel reinvio del preventivo:', error)
    popup.error('Errore nel reinvio del preventivo')
  }
}

const testEmailJS = async () => {
  try {
    const confirmed = await popup.confirm(
      'Vuoi testare la configurazione EmailJS?\n\n' +
      'Questa operazione invierà un\'email di test per verificare che tutto funzioni correttamente.'
    )
    
    if (!confirmed) return
    
    await emailJS.testEmailConfiguration()
  } catch (error) {
    console.error('Errore nel test EmailJS:', error)
    popup.error('Errore nel test EmailJS')
  }
}

const deletePreventivo = async (preventivo) => {
  try {
    const confirmed = await popup.confirm(
      `⚠️ ATTENZIONE: Eliminazione Preventivo\n\n` +
      `Sei sicuro di voler eliminare il preventivo:\n` +
      `${preventivo.numero} - ${preventivo.progetto}\n\n` +
      `Questa operazione è IRREVERSIBILE e cancellerà:\n` +
      `• Tutti i dati del preventivo\n` +
      `• Lo storico delle comunicazioni\n` +
      `• I riferimenti associati\n\n` +
      `Confermi l'eliminazione?`
    )
    
    if (!confirmed) return

    // Chiudi la modal se è aperta
    if (showViewModal.value) {
      closeViewModal()
    }
    if (showEditModal.value) {
      closeEditModal()
    }

    // Elimina il preventivo da Firestore
    await firestoreStore.deleteDocument('preventivi', preventivo.id)

    popup.success(`Preventivo ${preventivo.numero} eliminato con successo`)
    
  } catch (error) {
    console.error('Errore nell\'eliminazione del preventivo:', error)
    popup.error('Errore nell\'eliminazione del preventivo')
  }
}

// Funzione per creare le azioni del dropdown
const createDropdownActions = (preventivo) => {
  const actions = [
    {
      id: 'view',
      label: 'Visualizza',
      icon: '👁️',
      disabled: false,
      danger: false
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: '✏️',
      disabled: false,
      danger: false
    }
  ]

  // Azioni condizionali basate sullo stato
  if (preventivo.stato === 'bozza') {
    actions.push({
      id: 'send',
      label: 'Invia Email',
      icon: '📧',
      disabled: false,
      danger: false
    })
    actions.push({
      id: 'accept',
      label: 'Segna Accettato',
      icon: '✅',
      disabled: false,
      danger: false
    })
  }

  if (preventivo.stato === 'inviato') {
    actions.push({
      id: 'resend',
      label: 'Reinvia Email',
      icon: '🔄',
      disabled: false,
      danger: false
    })
    actions.push({
      id: 'accept',
      label: 'Segna Accettato',
      icon: '✅',
      disabled: false,
      danger: false
    })
    actions.push({
      id: 'reject',
      label: 'Segna Rifiutato',
      icon: '❌',
      disabled: false,
      danger: false
    })
  }

  if (preventivo.stato === 'accettato') {
    actions.push({
      id: 'convert',
      label: 'Converti in Cantiere',
      icon: '🏗️',
      disabled: false,
      danger: false
    })
  }

  // Aggiungi sempre le azioni di download e eliminazione
  actions.push({
    id: 'download',
    label: 'Scarica PDF',
    icon: '📄',
    disabled: false,
    danger: false
  })

  actions.push({
    id: 'delete',
    label: 'Elimina',
    icon: '🗑️',
    disabled: false,
    danger: true
  })

  return actions
}

// Gestore delle azioni del dropdown
const handleDropdownAction = (action, preventivo) => {
  switch (action) {
    case 'view':
      viewPreventivo(preventivo)
      break
    case 'edit':
      editPreventivo(preventivo)
      break
    case 'send':
      sendPreventivo(preventivo)
      break
    case 'resend':
      resendPreventivo(preventivo)
      break
    case 'accept':
      markAsAccepted(preventivo)
      break
    case 'reject':
      markAsRejected(preventivo)
      break
    case 'convert':
      convertToCantiere(preventivo)
      break
    case 'download':
      downloadPDF(preventivo)
      break
    case 'delete':
      deletePreventivo(preventivo)
      break
    default:
      console.warn('Azione non riconosciuta:', action)
  }
}

// 📦 FUNZIONI GESTIONE MATERIALI PREVENTIVI
const addMaterialToPreventivo = async () => {
  try {
    // Carica materiali dal magazzino se non già caricati
    if (materialiMagazzino.value.length === 0) {
      await firestoreStore.loadMateriali()
      materialiMagazzino.value = firestoreStore.materiali
    }
    
    // Carica fornitori se non già caricati
    if (fornitori.value.length === 0) {
      await firestoreStore.loadFornitori()
      fornitori.value = firestoreStore.fornitori
    }
    
    // Inizializza nuovo materiale
    newMaterial.value = {
      nome: '',
      codice: '',
      descrizione: '',
      quantitaRichiesta: 1,
      unita: 'pz',
      prezzoUnitario: 0,
      fornitoreId: '',
      note: ''
    }
    
    // Reset selezioni
    materialSelectionMode.value = 'existing'
    selectedMaterialFromStock.value = ''
    
    // Apri modal
    showAddMaterialModal.value = true
    
  } catch (err) {
    console.error('Errore apertura modal materiali:', err)
    popup.error('Impossibile aprire la gestione materiali: ' + err.message)
  }
}

const getSelectedMaterialFromStock = () => {
  if (!selectedMaterialFromStock.value) return null
  return materialiMagazzino.value.find(m => m.id === selectedMaterialFromStock.value)
}

const fillMaterialFromStock = () => {
  const selected = getSelectedMaterialFromStock()
  if (selected && newMaterial.value) {
    newMaterial.value = {
      ...newMaterial.value,
      nome: selected.nome,
      codice: selected.codice,
      descrizione: selected.descrizione,
      unita: selected.unita,
      prezzoUnitario: selected.prezzoUnitario || 0
    }
  }
}

const saveMaterialToPreventivo = () => {
  try {
    if (!newMaterial.value) {
      popup.error('Dati materiale mancanti')
      return
    }
    
    let materialeData = { ...newMaterial.value }
    
    // Se selezione da magazzino, aggiunge reference al materiale originale
    if (materialSelectionMode.value === 'existing' && selectedMaterialFromStock.value) {
      materialeData.materialeId = selectedMaterialFromStock.value
      materialeData.tipoMateriale = 'magazzino'
    } else {
      materialeData.tipoMateriale = 'preventivo'
    }
    
    // Aggiungi ID temporaneo per gestione locale
    materialeData.id = Date.now().toString()
    
    // Aggiungi alla lista materiali del preventivo
    materialiPreventivo.value.push(materialeData)
    
    popup.success('Materiale aggiunto al preventivo')
    closeAddMaterialModal()
    
  } catch (err) {
    console.error('Errore salvataggio materiale:', err)
    popup.error('Errore nel salvataggio del materiale')
  }
}

const closeAddMaterialModal = () => {
  showAddMaterialModal.value = false
  newMaterial.value = null
  materialSelectionMode.value = 'existing'
  selectedMaterialFromStock.value = ''
}

const editMaterialInPreventivo = (materiale) => {
  editingMaterial.value = { ...materiale }
  showEditMaterialModal.value = true
}

const saveMaterialChanges = () => {
  try {
    if (!editingMaterial.value) {
      popup.error('Nessun materiale in modifica')
      return
    }
    
    // Trova e aggiorna il materiale nella lista
    const index = materialiPreventivo.value.findIndex(m => m.id === editingMaterial.value.id)
    if (index !== -1) {
      materialiPreventivo.value[index] = { ...editingMaterial.value }
      popup.success('Materiale aggiornato')
    }
    
    closeEditMaterialModal()
    
  } catch (err) {
    console.error('Errore salvataggio modifiche materiale:', err)
    popup.error('Errore nel salvataggio delle modifiche')
  }
}

const closeEditMaterialModal = () => {
  showEditMaterialModal.value = false
  editingMaterial.value = null
}

const removeMaterialFromPreventivo = async (materialeId) => {
  try {
    const confirmed = await popup.confirm('Vuoi rimuovere questo materiale dal preventivo?')
    if (!confirmed) return
    
    // Rimuovi dalla lista
    materialiPreventivo.value = materialiPreventivo.value.filter(m => m.id !== materialeId)
    
    popup.success('Materiale rimosso dal preventivo')
    
  } catch (err) {
    console.error('Errore rimozione materiale:', err)
    popup.error('Errore nella rimozione del materiale')
  }
}

const getTotalMaterialsValue = () => {
  return materialiPreventivo.value.reduce((acc, materiale) => {
    const quantita = materiale.quantitaRichiesta || 0
    const prezzo = materiale.prezzoUnitario || 0
    return acc + (quantita * prezzo)
  }, 0)
}

const getFornitoreNome = (fornitoreId) => {
  if (!fornitoreId) return 'Non specificato'
  const fornitore = fornitori.value.find(f => f.id === fornitoreId)
  return fornitore ? fornitore.nome : 'Non trovato'
}

// 📋 FUNZIONI GESTIONE VOCI AGGIUNTIVE
const addVoceAggiuntiva = () => {
  newVoce.value = {
    descrizione: '',
    importo: 0,
    note: ''
  }
  showAddVoceModal.value = true
}

const saveVoceAggiuntiva = () => {
  try {
    if (!newVoce.value || !newVoce.value.descrizione || newVoce.value.importo <= 0) {
      popup.error('Inserisci una descrizione valida e un importo maggiore di 0')
      return
    }
    
    const voceData = {
      ...newVoce.value,
      id: Date.now().toString()
    }
    
    vociAggiuntive.value.push(voceData)
    
    popup.success('Voce aggiuntiva inserita')
    closeAddVoceModal()
    
  } catch (err) {
    console.error('Errore salvataggio voce aggiuntiva:', err)
    popup.error('Errore nel salvataggio della voce aggiuntiva')
  }
}

const closeAddVoceModal = () => {
  showAddVoceModal.value = false
  newVoce.value = null
}

const editVoceAggiuntiva = (voce) => {
  editingVoce.value = { ...voce }
  showEditVoceModal.value = true
}

const saveVoceChanges = () => {
  try {
    if (!editingVoce.value || !editingVoce.value.descrizione || editingVoce.value.importo <= 0) {
      popup.error('Inserisci una descrizione valida e un importo maggiore di 0')
      return
    }
    
    const index = vociAggiuntive.value.findIndex(v => v.id === editingVoce.value.id)
    if (index !== -1) {
      vociAggiuntive.value[index] = { ...editingVoce.value }
      popup.success('Voce aggiuntiva aggiornata')
    }
    
    closeEditVoceModal()
    
  } catch (err) {
    console.error('Errore salvataggio modifiche voce aggiuntiva:', err)
    popup.error('Errore nel salvataggio delle modifiche')
  }
}

const closeEditVoceModal = () => {
  showEditVoceModal.value = false
  editingVoce.value = null
}

const removeVoceAggiuntiva = async (voceId) => {
  try {
    const confirmed = await popup.confirm('Vuoi rimuovere questa voce aggiuntiva?')
    if (!confirmed) return
    
    vociAggiuntive.value = vociAggiuntive.value.filter(v => v.id !== voceId)
    popup.success('Voce aggiuntiva rimossa')
    
  } catch (err) {
    console.error('Errore rimozione voce aggiuntiva:', err)
    popup.error('Errore nella rimozione della voce aggiuntiva')
  }
}

const getTotalVociAggiuntive = () => {
  return vociAggiuntive.value.reduce((acc, voce) => {
    return acc + (voce.importo || 0)
  }, 0)
}

const getTotalGenerale = () => {
  return getTotalMaterialsValue() + getTotalVociAggiuntive()
}

const convertToCantiere = async (preventivo) => {
  try {
    const confirmed = await popup.confirm('Confermi la conversione del preventivo in cantiere?')
    if (!confirmed) return

    // Calcola costo iniziale materiali se presenti
    const costoMateriali = (preventivo.materiali || []).reduce((acc, materiale) => {
      const quantita = materiale.quantitaRichiesta || 0
      const prezzo = materiale.prezzoUnitario || 0
      return acc + (quantita * prezzo)
    }, 0)

    // Calcola costo voci aggiuntive se presenti
    const costoVociAggiuntive = (preventivo.vociAggiuntive || []).reduce((acc, voce) => {
      return acc + (voce.importo || 0)
    }, 0)

    const costoTotaleIniziale = costoMateriali + costoVociAggiuntive

    // Dati per il nuovo cantiere
    const cantiereData = {
      nome: preventivo.progetto,
      cliente: preventivo.cliente,
      indirizzo: preventivo.indirizzo,
      tipoLavoro: preventivo.tipoLavoro,
      valore: preventivo.importo,
      dataInizio: new Date().toISOString().split('T')[0],
      scadenza: '',
      stato: 'pianificato',
      priorita: 'media',
      progresso: 0,
      team: [],
      costiAccumulati: {
        materiali: Math.round(costoMateriali * 100) / 100,
        vociAggiuntive: Math.round(costoVociAggiuntive * 100) / 100,
        manodopera: 0,
        totale: Math.round(costoTotaleIniziale * 100) / 100
      },
      descrizione: preventivo.descrizione,
      preventivoOriginale: preventivo.id,
      vociAggiuntiveOriginali: preventivo.vociAggiuntive || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Crea il cantiere
    const cantiereResult = await firestoreStore.createDocument('cantieri', cantiereData)
    
    if (cantiereResult.success) {
      // Se ci sono materiali nel preventivo, trasferiscili al cantiere
      if (preventivo.materiali && preventivo.materiali.length > 0) {
        for (const materiale of preventivo.materiali) {
          try {
            const materialeCantiereData = {
              ...materiale,
              cantiereId: cantiereResult.id,
              stato: 'pianificato',
              quantitaUtilizzata: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            
            await firestoreStore.createMaterialeCantiere(cantiereResult.id, materialeCantiereData)
          } catch (error) {
            console.error('Errore trasferimento materiale:', error)
          }
        }
      }
      
      // Aggiorna il preventivo per contrassegnarlo come convertito
      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'convertito',
        dataConversione: new Date(),
        updatedAt: new Date()
      })

      const messaggioMateriali = preventivo.materiali?.length > 0 ? ` - ${preventivo.materiali.length} materiali trasferiti` : ''
      const messaggioVoci = preventivo.vociAggiuntive?.length > 0 ? ` - ${preventivo.vociAggiuntive.length} voci aggiuntive trasferite` : ''
      
      popup.success('Preventivo convertito in cantiere con successo' + messaggioMateriali + messaggioVoci)
      
      // Chiudi la modal se è aperta
      if (showViewModal.value) {
        closeViewModal()
      }
    }
    
  } catch (error) {
    console.error('Errore nella conversione del preventivo:', error)
    popup.error('Errore nella conversione del preventivo')
  }
}

// Lifecycle
onMounted(() => {
  loadPreventivi()
})

onUnmounted(() => {
  if (unsubscribePreventivi.value) {
    unsubscribePreventivi.value()
  }
})
</script> 