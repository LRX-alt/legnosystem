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
          :class="emailJS.isConfigured() ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 text-gray-600 cursor-not-allowed'"
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
      <div v-for="preventivo in filteredPreventivi" :key="preventivo.id" class="card hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ preventivo.numero }}</h3>
            <p class="text-sm font-medium text-gray-700">{{ getClienteNome(preventivo.cliente) }}</p>
            <p class="text-xs text-gray-500">{{ preventivo.cliente?.contatto || 'Contatto non disponibile' }}</p>
          </div>
          <div class="flex flex-col items-end space-y-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatoColor(preventivo.stato)">
              {{ getStatoLabel(preventivo.stato) }}
            </span>
            <button 
              v-if="preventivo.stato === 'accettato'"
              @click="convertToCantiere(preventivo)"
              class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
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
            <p class="text-sm font-medium text-gray-900">{{ preventivo.dataInvio ? formatDate(preventivo.dataInvio) : 'Non inviato' }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-1">Scadenza</p>
          <p class="text-sm font-medium" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
            {{ formatDate(preventivo.scadenza) }}
            <span v-if="isScaduto(preventivo.scadenza)" class="text-xs ml-1">(Scaduto)</span>
          </p>
        </div>

        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="viewPreventivo(preventivo)" class="w-full btn-primary py-2 text-sm">Visualizza</button>
          <div class="grid grid-cols-2 gap-2">
            <button @click="editPreventivo(preventivo)" class="btn-secondary py-2 text-sm">Modifica</button>
            <button 
              @click="sendPreventivo(preventivo)" 
              :disabled="preventivo.stato === 'inviato'"
              class="bg-accent-500 hover:bg-accent-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {{ preventivo.stato === 'inviato' ? 'Inviato' : 'Invia' }}
            </button>
          </div>
        </div>
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
            <tr v-for="preventivo in filteredPreventivi" :key="preventivo.id" class="hover:bg-gray-50">
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
                {{ preventivo.dataInvio ? formatDate(preventivo.dataInvio) : 'Non inviato' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isScaduto(preventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
                {{ formatDate(preventivo.scadenza) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatoColor(preventivo.stato)">
                    {{ getStatoLabel(preventivo.stato) }}
                  </span>
                  <button 
                    v-if="preventivo.stato === 'accettato'"
                    @click="convertToCantiere(preventivo)"
                    class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
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
                <div class="flex space-x-2">
                  <button @click="viewPreventivo(preventivo)" class="text-primary-600 hover:text-primary-900">Visualizza</button>
                  <button @click="editPreventivo(preventivo)" class="text-gray-600 hover:text-gray-900">Modifica</button>
                  <button 
                    @click="sendPreventivo(preventivo)" 
                    :disabled="preventivo.stato === 'inviato'"
                    class="text-accent-600 hover:text-accent-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ preventivo.stato === 'inviato' ? 'Inviato' : 'Invia' }}
                  </button>
                </div>
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
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
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
                v-model="newPreventivo.scadenza"
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
                <p class="text-sm font-medium text-gray-900">{{ formatDate(selectedPreventivo.createdAt?.seconds ? new Date(selectedPreventivo.createdAt.seconds * 1000) : selectedPreventivo.createdAt) }}</p>
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
                <p class="text-base font-medium text-gray-900">{{ selectedPreventivo.dataInvio ? formatDate(selectedPreventivo.dataInvio) : 'Non inviato' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Scadenza</p>
                <p class="text-base font-medium" :class="isScaduto(selectedPreventivo.scadenza) ? 'text-red-600' : 'text-gray-900'">
                  {{ formatDate(selectedPreventivo.scadenza) }}
                  <span v-if="isScaduto(selectedPreventivo.scadenza)" class="text-sm ml-1">(Scaduto)</span>
                </p>
              </div>
              <div v-if="selectedPreventivo.dataConversione">
                <p class="text-sm text-gray-600 mb-1">Data Conversione</p>
                <p class="text-base font-medium text-purple-600">{{ formatDate(selectedPreventivo.dataConversione) }}</p>
              </div>
            </div>
          </div>

          <!-- Descrizione -->
          <div v-if="selectedPreventivo.descrizione" class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Descrizione</h3>
            <p class="text-gray-700 leading-relaxed">{{ selectedPreventivo.descrizione }}</p>
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
              class="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📧 Invia al Cliente
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'inviato'"
              @click="markAsAccepted(selectedPreventivo)"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✅ Segna come Accettato
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'inviato'"
              @click="markAsRejected(selectedPreventivo)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ❌ Segna come Rifiutato
            </button>
            
            <button 
              v-if="selectedPreventivo.stato === 'accettato'"
              @click="convertToCantiere(selectedPreventivo)"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🏗️ Converti in Cantiere
            </button>

            <!-- Pulsante Download PDF -->
            <button 
              @click="downloadPDF(selectedPreventivo)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📄 Scarica PDF
            </button>

            <!-- Pulsante Reinvia Email (solo per preventivi già inviati) -->
            <button 
              v-if="['inviato', 'scaduto'].includes(selectedPreventivo.stato)"
              @click="resendPreventivo(selectedPreventivo)"
              class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Reinvia Email
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
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
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
                v-model="editingPreventivo.scadenza"
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

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeEditModal" class="btn-secondary">
              Annulla
            </button>
            <button type="submit" :disabled="saving" class="btn-primary">
              {{ saving ? 'Salvataggio...' : 'Aggiorna Preventivo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFirestore } from '@/composables/useFirestore'
import { usePopup } from '@/composables/usePopup'
import { useToast } from '@/composables/useToast'
import { useEmailJS } from '@/composables/useEmailJS'
import { useFirestoreStore } from '@/stores/firestore'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

const firestore = useFirestore()
const popup = usePopup()
const toast = useToast()
const emailJS = useEmailJS()
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
  stato: 'bozza'
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
  stato: 'bozza'
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

const isScaduto = (scadenza) => {
  if (!scadenza) return false
  return new Date(scadenza) < new Date()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('it-IT')
}

const calculateAverageTime = () => {
  const completedPreventivi = preventivi.value.filter(p => ['accettato', 'rifiutato'].includes(p.stato))
  if (completedPreventivi.length === 0) return 0

  const totalDays = completedPreventivi.reduce((acc, p) => {
    const created = new Date(p.createdAt?.seconds * 1000 || p.createdAt)
    const completed = new Date(p.updatedAt?.seconds * 1000 || p.updatedAt)
    const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24))
    return acc + days
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
        const dateA = a.createdAt?.seconds || 0
        const dateB = b.createdAt?.seconds || 0
        return dateB - dateA
      })
      
      // Aggiorna stati automaticamente per preventivi scaduti
      updateScaduti()
    })

    // Carica i clienti disponibili
    await loadClients()
    
  } catch (error) {
    console.error('Errore nel caricamento dei preventivi:', error)
    toast.error('Errore nel caricamento dei preventivi')
  } finally {
    loading.value = false
  }
}

const updateScaduti = async () => {
  const now = new Date()
  const preventiviScaduti = preventivi.value.filter(p => 
    p.stato === 'inviato' && new Date(p.scadenza) < now
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
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await firestoreStore.createDocument('preventivi', preventivoData)
    
    toast.success('Preventivo salvato con successo')
    closeAddModal()
    
  } catch (error) {
    console.error('Errore nel salvataggio del preventivo:', error)
    toast.error('Errore nel salvataggio del preventivo')
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
    stato: 'bozza'
  }
  clientSelectionMode.value = 'existing'
  selectedClientFromList.value = ''
}

const viewPreventivo = (preventivo) => {
  selectedPreventivo.value = preventivo
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
    stato: preventivo.stato
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
    stato: 'bozza'
  }
  editClientSelectionMode.value = 'existing'
  editSelectedClientFromList.value = ''
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
      updatedAt: new Date()
    }

    await firestoreStore.updateDocument('preventivi', editingPreventivo.value.id, updateData)
    
    toast.success('Preventivo aggiornato con successo')
    closeEditModal()
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del preventivo:', error)
    toast.error('Errore nell\'aggiornamento del preventivo')
  } finally {
    saving.value = false
  }
}

const sendPreventivo = async (preventivo) => {
  try {
    // Verifica che il cliente abbia un'email valida
    if (!preventivo.cliente?.contatto || !preventivo.cliente.contatto.includes('@')) {
      toast.error('Il cliente non ha un\'email valida. Aggiorna i dati del cliente.')
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
      
      toast.warning('Preventivo segnato come inviato (email non inviata)')
      return
    }

    const confirmed = await popup.confirm(
      `Confermi l'invio del preventivo via email a:\n${preventivo.cliente.nome} (${preventivo.cliente.contatto})?`
    )
    if (!confirmed) return

    // Invia email tramite EmailJS
    const emailResult = await emailJS.sendPreventivoEmail(preventivo)

    if (emailResult.success) {
      // Aggiorna stato preventivo dopo invio riuscito
      await firestoreStore.updateDocument('preventivi', preventivo.id, {
        stato: 'inviato',
        dataInvio: new Date(),
        updatedAt: new Date(),
        emailInviata: true,
        emailResponse: emailResult.response?.text || 'Email inviata tramite EmailJS'
      })
      
      toast.success(`Preventivo inviato via email a ${preventivo.cliente.nome}`)
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
        
        toast.warning('Preventivo segnato come inviato (invio email fallito)')
      }
    }
    
  } catch (error) {
    console.error('Errore nell\'invio del preventivo:', error)
    toast.error('Errore nell\'invio del preventivo')
  }
}

const markAsAccepted = async (preventivo) => {
  try {
    const confirmed = await popup.confirm('Confermi che il preventivo è stato accettato dal cliente?')
    if (!confirmed) return

    await firestoreStore.updateDocument('preventivi', preventivo.id, {
      stato: 'accettato',
      dataAccettazione: new Date(),
      updatedAt: new Date()
    })

    toast.success('Preventivo segnato come accettato')
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del preventivo:', error)
    toast.error('Errore nell\'aggiornamento del preventivo')
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

    toast.success('Preventivo segnato come rifiutato')
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del preventivo:', error)
    toast.error('Errore nell\'aggiornamento del preventivo')
  }
}

const downloadPDF = (preventivo) => {
  try {
    const pdfDoc = emailJS.generatePreventivoPDF(preventivo)
    pdfDoc.save(`Preventivo-${preventivo.numero}.pdf`)
    toast.success('PDF scaricato con successo')
  } catch (error) {
    console.error('Errore nel download del PDF:', error)
    toast.error('Errore nel download del PDF')
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
    toast.error('Errore nel reinvio del preventivo')
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
    toast.error('Errore nel test EmailJS')
  }
}

const convertToCantiere = async (preventivo) => {
  try {
    const confirmed = await popup.confirm('Confermi la conversione del preventivo in cantiere?')
    if (!confirmed) return

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
        materiali: 0,
        manodopera: 0,
        totale: 0
      },
      descrizione: preventivo.descrizione,
      preventivoOriginale: preventivo.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Crea il cantiere
    await firestoreStore.createDocument('cantieri', cantiereData)
    
    // Aggiorna il preventivo per contrassegnarlo come convertito
    await firestoreStore.updateDocument('preventivi', preventivo.id, {
      stato: 'convertito',
      dataConversione: new Date(),
      updatedAt: new Date()
    })

    toast.success('Preventivo convertito in cantiere con successo')
    
    // Chiudi la modal se è aperta
    if (showViewModal.value) {
      closeViewModal()
    }
    
  } catch (error) {
    console.error('Errore nella conversione del preventivo:', error)
    toast.error('Errore nella conversione del preventivo')
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