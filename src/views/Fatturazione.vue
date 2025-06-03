<template>
  <div class="space-y-6">
    <!-- Header Fatturazione -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Fatturazione & Admin</h1>
        <p class="text-gray-600">Gestione finanziaria e contabile - Legnosystem.bio</p>
      </div>
      <button @click="showNewInvoiceModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <DocumentPlusIcon class="w-5 h-5 mr-2" />
        Nuova Fattura
      </button>
    </div>

    <!-- Stats Cards Finanziarie -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Incassato Mese</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.incassatoMese.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <DocumentIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Fatture Emesse</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.fattureEmesse }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Scadute</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.scadute }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Da Incassare</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.daIncassare.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Scadenze -->
    <div v-if="alertScadenze.length > 0" class="card bg-red-50 border border-red-200">
      <div class="flex items-start">
        <ExclamationTriangleIcon class="w-6 h-6 text-red-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-red-800 mb-2">⚠️ Pagamenti Scaduti</h3>
          <div class="space-y-2">
            <div v-for="alert in alertScadenze" :key="alert.id" class="flex items-center justify-between">
              <span class="text-red-700">{{ alert.cliente }} - Fattura #{{ alert.numero }}</span>
              <span class="text-red-600 font-medium">€{{ alert.importo.toLocaleString() }} ({{ alert.giorniScadenza }} gg)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri e Azioni -->
    <div class="card">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca fatture o clienti..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select v-model="selectedStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti gli stati</option>
          <option value="emessa">Emessa</option>
          <option value="pagata">Pagata</option>
          <option value="scaduta">Scaduta</option>
          <option value="annullata">Annullata</option>
        </select>
        <select v-model="selectedPeriod" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Tutti i periodi</option>
          <option value="mese">Questo mese</option>
          <option value="trimestre">Ultimo trimestre</option>
          <option value="anno">Questo anno</option>
        </select>
        <button @click="exportData" class="btn-secondary px-6 py-2">
          📊 Esporta Excel
        </button>
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

    <!-- Tab Content: Lista Fatture -->
    <div v-if="activeTab === 'fatture'" class="space-y-6">
      <!-- Desktop: Tabella -->
      <div class="hidden lg:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fattura</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="fattura in filteredFatture" :key="fattura.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">#{{ fattura.numero }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(fattura.dataEmissione) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ fattura.cliente }}</div>
                  <div class="text-sm text-gray-500">{{ fattura.progetto }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">€{{ fattura.totale.toLocaleString() }}</div>
                  <div class="text-xs text-gray-500">+IVA {{ fattura.iva }}%</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm" :class="isOverdue(fattura.scadenza) ? 'text-red-600 font-medium' : 'text-gray-900'">
                    {{ formatDate(fattura.scadenza) }}
                  </div>
                  <div v-if="isOverdue(fattura.scadenza)" class="text-xs text-red-500">
                    {{ getDaysOverdue(fattura.scadenza) }} giorni fa
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(fattura.stato)">
                    {{ getStatusLabel(fattura.stato) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button @click="viewInvoice(fattura)" class="text-primary-600 hover:text-primary-700" title="Visualizza">
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button @click="printInvoice(fattura)" class="text-gray-600 hover:text-gray-700" title="Stampa">
                    <PrinterIcon class="w-4 h-4" />
                  </button>
                  <button v-if="fattura.stato === 'emessa'" @click="markAsPaid(fattura)" class="text-green-600 hover:text-green-700" title="Segna pagata">
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  <button @click="sendReminder(fattura)" class="text-blue-600 hover:text-blue-700" title="Sollecito">
                    <EnvelopeIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile: Cards -->
      <div class="lg:hidden grid grid-cols-1 gap-4">
        <div v-for="fattura in filteredFatture" :key="fattura.id" class="card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Fattura #{{ fattura.numero }}</h3>
              <p class="text-xs text-gray-600">{{ fattura.cliente }} - {{ formatDate(fattura.dataEmissione) }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(fattura.stato)">
              {{ getStatusLabel(fattura.stato) }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Importo:</span>
              <span class="font-bold">€{{ fattura.totale.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Scadenza:</span>
              <span :class="isOverdue(fattura.scadenza) ? 'text-red-600 font-medium' : 'text-gray-900'">
                {{ formatDate(fattura.scadenza) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Progetto:</span>
              <span class="font-medium">{{ fattura.progetto }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <button @click="viewInvoice(fattura)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Visualizza
            </button>
            <div class="flex space-x-2">
              <button @click="printInvoice(fattura)" class="text-gray-400 hover:text-gray-600">
                <PrinterIcon class="w-4 h-4" />
              </button>
              <button v-if="fattura.stato === 'emessa'" @click="markAsPaid(fattura)" class="text-green-500 hover:text-green-700">
                <CheckIcon class="w-4 h-4" />
              </button>
              <button @click="sendReminder(fattura)" class="text-blue-500 hover:text-blue-700">
                <EnvelopeIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Prima Nota -->
    <div v-if="activeTab === 'prima-nota'" class="space-y-6">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Prima Nota Semplificata</h3>
          <button @click="showMovementModal = true" class="btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nuovo Movimento
          </button>
        </div>

        <!-- Cash Flow Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-green-600 font-medium">Entrate Mese</p>
            <p class="text-2xl font-bold text-green-700">€{{ cashFlow.entrate.toLocaleString() }}</p>
          </div>
          <div class="p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-red-600 font-medium">Uscite Mese</p>
            <p class="text-2xl font-bold text-red-700">€{{ cashFlow.uscite.toLocaleString() }}</p>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-600 font-medium">Saldo</p>
            <p class="text-2xl font-bold" :class="cashFlow.saldo >= 0 ? 'text-green-700' : 'text-red-700'">
              €{{ cashFlow.saldo.toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Movimenti -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrata</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uscita</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movimento in movimenti" :key="movimento.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(movimento.data) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ movimento.descrizione }}</div>
                  <div class="text-sm text-gray-500">{{ movimento.categoria }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {{ movimento.entrata ? '€' + movimento.entrata.toLocaleString() : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {{ movimento.uscita ? '€' + movimento.uscita.toLocaleString() : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold" :class="movimento.saldo >= 0 ? 'text-green-600' : 'text-red-600'">
                  €{{ movimento.saldo.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab Content: IVA -->
    <div v-if="activeTab === 'iva'" class="space-y-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Riepilogo IVA - {{ new Date().getFullYear() }}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-600 font-medium">IVA a Credito</p>
            <p class="text-2xl font-bold text-blue-700">€{{ riepilogoIva.credito.toLocaleString() }}</p>
          </div>
          <div class="p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-red-600 font-medium">IVA a Debito</p>
            <p class="text-2xl font-bold text-red-700">€{{ riepilogoIva.debito.toLocaleString() }}</p>
          </div>
          <div class="p-4 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-600 font-medium">Liquidazione</p>
            <p class="text-2xl font-bold" :class="riepilogoIva.liquidazione >= 0 ? 'text-red-700' : 'text-green-700'">
              €{{ Math.abs(riepilogoIva.liquidazione).toLocaleString() }}
            </p>
            <p class="text-xs" :class="riepilogoIva.liquidazione >= 0 ? 'text-red-600' : 'text-green-600'">
              {{ riepilogoIva.liquidazione >= 0 ? 'Da versare' : 'A credito' }}
            </p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-green-600 font-medium">Versato</p>
            <p class="text-2xl font-bold text-green-700">€{{ riepilogoIva.versato.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Dettaglio mensile IVA -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mese</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA Vendite</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA Acquisti</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liquidazione</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="mese in dettaglioIva" :key="mese.mese" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ mese.mese }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  €{{ mese.ivaVendite.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  €{{ mese.ivaAcquisti.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="mese.liquidazione >= 0 ? 'text-red-600' : 'text-green-600'">
                  €{{ Math.abs(mese.liquidazione).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="mese.stato === 'versato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ mese.stato === 'versato' ? 'Versato' : 'Da versare' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Nuova Fattura -->
    <div v-if="showNewInvoiceModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeNewInvoiceModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuova Fattura</h3>
            <button @click="closeNewInvoiceModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="createInvoice" class="space-y-6">
            <!-- Dati Cliente -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                <select v-model="newInvoice.cliente" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="">Seleziona cliente</option>
                  <option value="Villa Montebello">Villa Montebello</option>
                  <option value="Condominio Aurora">Condominio Aurora</option>
                  <option value="Casa Rustica">Casa Rustica</option>
                  <option value="Ristorante Alpino">Ristorante Alpino</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Progetto/Cantiere *</label>
                <input v-model="newInvoice.progetto" type="text" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
            </div>

            <!-- Dati Fattura -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Emissione *</label>
                <input v-model="newInvoice.dataEmissione" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza Pagamento *</label>
                <input v-model="newInvoice.scadenza" type="date" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aliquota IVA *</label>
                <select v-model="newInvoice.iva" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
                  <option value="22">22% (Ordinaria)</option>
                  <option value="10">10% (Ridotta)</option>
                  <option value="4">4% (Super ridotta)</option>
                  <option value="0">0% (Esente)</option>
                </select>
              </div>
            </div>

            <!-- Voci Fattura -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Voci Fattura</label>
              <div class="space-y-3">
                <div v-for="(voce, index) in newInvoice.voci" :key="index" class="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <input v-model="voce.descrizione" placeholder="Descrizione" 
                         class="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                  <input v-model.number="voce.quantita" type="number" step="0.01" placeholder="Quantità" 
                         class="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                  <input v-model.number="voce.prezzo" type="number" step="0.01" placeholder="Prezzo" 
                         class="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">€{{ (voce.quantita * voce.prezzo || 0).toFixed(2) }}</span>
                    <button type="button" @click="removeVoce(index)" class="text-red-500 hover:text-red-700">
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button type="button" @click="addVoce" class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600">
                  + Aggiungi Voce
                </button>
              </div>
            </div>

            <!-- Totali -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Imponibile:</span>
                  <span class="font-medium">€{{ calcolaTotale().imponibile.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>IVA ({{ newInvoice.iva }}%):</span>
                  <span class="font-medium">€{{ calcolaTotale().ivaAmount.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold">
                  <span>Totale:</span>
                  <span>€{{ calcolaTotale().totale.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeNewInvoiceModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Crea Fattura
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
  DocumentPlusIcon,
  CurrencyEuroIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  PrinterIcon,
  CheckIcon,
  EnvelopeIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Stato della pagina
const showNewInvoiceModal = ref(false)
const showMovementModal = ref(false)
const activeTab = ref('fatture')
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedPeriod = ref('')

// Stats
const stats = ref({
  incassatoMese: 89500,
  fattureEmesse: 23,
  scadute: 3,
  daIncassare: 45200
})

// Cash Flow
const cashFlow = ref({
  entrate: 125000,
  uscite: 87500,
  saldo: 37500
})

// Riepilogo IVA
const riepilogoIva = ref({
  credito: 8500,
  debito: 15200,
  liquidazione: 6700, // debito - credito
  versato: 12800
})

// Tabs
const tabs = ref([
  { id: 'fatture', name: 'Fatture', count: 23 },
  { id: 'prima-nota', name: 'Prima Nota', count: 45 },
  { id: 'iva', name: 'IVA', count: 12 }
])

// Alert Scadenze
const alertScadenze = ref([
  {
    id: 1,
    cliente: 'Villa Montebello',
    numero: '2024-015',
    importo: 8500,
    giorniScadenza: 15
  },
  {
    id: 2,
    cliente: 'Condominio Aurora',
    numero: '2024-012',
    importo: 12300,
    giorniScadenza: 8
  }
])

// Nuova Fattura
const newInvoice = ref({
  cliente: '',
  progetto: '',
  dataEmissione: new Date().toISOString().split('T')[0],
  scadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  iva: '22',
  voci: [
    { descrizione: '', quantita: 1, prezzo: 0 }
  ]
})

// Dati Fatture
const fatture = ref([
  {
    id: 1,
    numero: '2024-023',
    cliente: 'Villa Montebello',
    progetto: 'Rifacimento Tetto',
    dataEmissione: '2024-01-15',
    scadenza: '2024-02-14',
    imponibile: 15000,
    iva: 22,
    totale: 18300,
    stato: 'emessa'
  },
  {
    id: 2,
    numero: '2024-022',
    cliente: 'Condominio Aurora',
    progetto: 'Isolamento Termico',
    dataEmissione: '2024-01-10',
    scadenza: '2024-01-10',
    imponibile: 12000,
    iva: 10,
    totale: 13200,
    stato: 'scaduta'
  },
  {
    id: 3,
    numero: '2024-021',
    cliente: 'Casa Rustica',
    progetto: 'Restauro Conservativo',
    dataEmissione: '2024-01-08',
    scadenza: '2024-02-07',
    imponibile: 8500,
    iva: 22,
    totale: 10370,
    stato: 'pagata'
  }
])

// Movimenti Prima Nota
const movimenti = ref([
  {
    id: 1,
    data: '2024-01-15',
    descrizione: 'Pagamento Villa Montebello',
    categoria: 'Incasso clienti',
    entrata: 18300,
    uscita: null,
    saldo: 45200
  },
  {
    id: 2,
    data: '2024-01-14',
    descrizione: 'Acquisto materiali LegnoAlp',
    categoria: 'Fornitori',
    entrata: null,
    uscita: 12500,
    saldo: 26900
  },
  {
    id: 3,
    data: '2024-01-12',
    descrizione: 'Stipendi dipendenti',
    categoria: 'Personale',
    entrata: null,
    uscita: 8500,
    saldo: 39400
  }
])

// Dettaglio IVA mensile
const dettaglioIva = ref([
  {
    mese: 'Gennaio 2024',
    ivaVendite: 3200,
    ivaAcquisti: 1500,
    liquidazione: 1700,
    stato: 'da_versare'
  },
  {
    mese: 'Dicembre 2023',
    ivaVendite: 2800,
    ivaAcquisti: 1200,
    liquidazione: 1600,
    stato: 'versato'
  },
  {
    mese: 'Novembre 2023',
    ivaVendite: 3500,
    ivaAcquisti: 1800,
    liquidazione: 1700,
    stato: 'versato'
  }
])

// Computed
const filteredFatture = computed(() => {
  let result = fatture.value

  if (searchTerm.value) {
    result = result.filter(f => 
      f.numero.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      f.cliente.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      f.progetto.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(f => f.stato === selectedStatus.value)
  }

  return result
})

// Methods
const getStatusColor = (stato) => {
  const colors = {
    'emessa': 'bg-blue-100 text-blue-800',
    'pagata': 'bg-green-100 text-green-800',
    'scaduta': 'bg-red-100 text-red-800',
    'annullata': 'bg-gray-100 text-gray-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'emessa': 'Emessa',
    'pagata': 'Pagata',
    'scaduta': 'Scaduta',
    'annullata': 'Annullata'
  }
  return labels[stato] || stato
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date()
}

const getDaysOverdue = (dateString) => {
  const today = new Date()
  const scadenza = new Date(dateString)
  const diffTime = today - scadenza
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const viewInvoice = (fattura) => {
  alert(`📋 Fattura #${fattura.numero}\n\n🏢 Cliente: ${fattura.cliente}\n🏗️ Progetto: ${fattura.progetto}\n📅 Emessa: ${formatDate(fattura.dataEmissione)}\n📅 Scadenza: ${formatDate(fattura.scadenza)}\n💰 Totale: €${fattura.totale.toLocaleString()}\n📊 Stato: ${getStatusLabel(fattura.stato)}`)
}

const printInvoice = (fattura) => {
  alert(`🖨️ Stampa fattura #${fattura.numero}\n\nGenerazione PDF in corso...`)
}

const markAsPaid = (fattura) => {
  fattura.stato = 'pagata'
  alert(`✅ Fattura #${fattura.numero} segnata come PAGATA!`)
  // Aggiorna stats
  stats.value.scadute = Math.max(0, stats.value.scadute - 1)
  stats.value.incassatoMese += fattura.totale
}

const sendReminder = (fattura) => {
  alert(`📧 Sollecito inviato per fattura #${fattura.numero}\n\nEmail automatica inviata a ${fattura.cliente}`)
}

const addVoce = () => {
  newInvoice.value.voci.push({
    descrizione: '',
    quantita: 1,
    prezzo: 0
  })
}

const removeVoce = (index) => {
  if (newInvoice.value.voci.length > 1) {
    newInvoice.value.voci.splice(index, 1)
  }
}

const calcolaTotale = () => {
  const imponibile = newInvoice.value.voci.reduce((sum, voce) => {
    return sum + (voce.quantita * voce.prezzo || 0)
  }, 0)
  
  const ivaAmount = imponibile * (newInvoice.value.iva / 100)
  const totale = imponibile + ivaAmount
  
  return { imponibile, ivaAmount, totale }
}

const createInvoice = () => {
  if (!newInvoice.value.cliente || !newInvoice.value.progetto) {
    alert('❌ Compila tutti i campi obbligatori!')
    return
  }

  const totali = calcolaTotale()
  const nuovaFattura = {
    id: Date.now(),
    numero: `2024-${String(fatture.value.length + 1).padStart(3, '0')}`,
    cliente: newInvoice.value.cliente,
    progetto: newInvoice.value.progetto,
    dataEmissione: newInvoice.value.dataEmissione,
    scadenza: newInvoice.value.scadenza,
    imponibile: totali.imponibile,
    iva: parseInt(newInvoice.value.iva),
    totale: totali.totale,
    stato: 'emessa',
    voci: [...newInvoice.value.voci]
  }

  fatture.value.unshift(nuovaFattura)
  stats.value.fattureEmesse++
  stats.value.daIncassare += totali.totale

  closeNewInvoiceModal()
  alert(`✅ Fattura #${nuovaFattura.numero} creata con successo!\n\n💰 Totale: €${totali.totale.toFixed(2)}`)
}

const exportData = () => {
  alert('📊 Export Excel in corso...\n\nFile generato: fatture_2024.xlsx')
}

const closeNewInvoiceModal = () => {
  showNewInvoiceModal.value = false
  newInvoice.value = {
    cliente: '',
    progetto: '',
    dataEmissione: new Date().toISOString().split('T')[0],
    scadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    iva: '22',
    voci: [
      { descrizione: '', quantita: 1, prezzo: 0 }
    ]
  }
}
</script> 