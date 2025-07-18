<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Analisi Costi</h1>
        <p class="mt-1 text-gray-600">Monitoraggio e analisi dei costi di cantiere</p>
      </div>
      <div class="flex space-x-3">
        <button @click="exportPDF" class="btn-secondary">
          <DocumentArrowDownIcon class="w-5 h-5 mr-2" />
          Export PDF
        </button>
        <button @click="exportExcel" class="btn-secondary">
          <TableCellsIcon class="w-5 h-5 mr-2" />
          Export Excel
        </button>
      </div>
    </div>

    <!-- Filtri Avanzati -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-primary-100 rounded-lg">
            <FunnelIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Filtri di Analisi</h3>
            <p class="text-sm text-gray-500">Personalizza la visualizzazione dei costi</p>
          </div>
        </div>
        <button @click="applicaFiltri" class="btn-primary flex items-center space-x-2">
          <FunnelIcon class="w-5 h-5" />
          <span>Applica Filtri</span>
        </button>
      </div>

      <!-- Filtri Principali -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Periodo -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <span class="flex items-center space-x-2">
              <span>📅</span>
              <span>Periodo</span>
            </span>
          </label>
          <select v-model="filtri.periodo" class="form-select bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500">
            <option value="tutto">Tutto il periodo</option>
            <option value="settimana">Ultima settimana</option>
            <option value="mese">Ultimo mese</option>
            <option value="trimestre">Ultimo trimestre</option>
            <option value="anno">Ultimo anno</option>
            <option value="personalizzato">Personalizzato</option>
          </select>
        </div>

        <!-- Cantiere -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <span class="flex items-center space-x-2">
              <span>🏗️</span>
              <span>Cantiere</span>
            </span>
          </label>
          <select v-model="filtri.cantiere" class="form-select bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500">
            <option value="">Tutti i cantieri</option>
            <option v-for="cantiere in cantieri" :key="cantiere.id" :value="cantiere.id">
              {{ cantiere.nome }}
            </option>
          </select>
        </div>

        <!-- Tipo Lavoro -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <span class="flex items-center space-x-2">
              <span>🔨</span>
              <span>Tipo Lavoro</span>
            </span>
          </label>
          <select v-model="filtri.tipoLavoro" class="form-select bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500">
            <option value="">Tutti i lavori</option>
            <option v-for="tipo in tipiLavori" :key="tipo.id" :value="tipo.id">
              {{ tipo.nome }}
            </option>
          </select>
        </div>

        <!-- Categoria -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            <span class="flex items-center space-x-2">
              <span>📊</span>
              <span>Categoria</span>
            </span>
          </label>
          <select v-model="filtri.categoria" class="form-select bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500">
            <option value="">Tutte le categorie</option>
            <option value="dipendenti">👥 Dipendenti</option>
            <option value="materiali">🧱 Materiali</option>
            <option value="mezzi">🚛 Mezzi</option>
            <option value="lavori">🔨 Lavori</option>
          </select>
        </div>
      </div>

      <!-- Date personalizzate -->
      <div v-if="filtri.periodo === 'personalizzato'" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center space-x-2 mb-3">
          <span class="text-blue-600">📅</span>
          <h4 class="text-sm font-medium text-blue-900">Periodo Personalizzato</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-blue-700">Data Inizio</label>
            <input v-model="filtri.dataInizio" type="date" class="form-input bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-blue-700">Data Fine</label>
            <input v-model="filtri.dataFine" type="date" class="form-input bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500">
          </div>
        </div>
      </div>

      <!-- Riepilogo filtri attivi -->
      <div v-if="filtriAttivi.length > 0" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-gray-600">✅</span>
          <span class="text-sm font-medium text-gray-700">Filtri Attivi:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="filtro in filtriAttivi" :key="filtro.key" class="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
            {{ filtro.label }}
            <button @click="rimuoviFiltro(filtro.key)" class="ml-1 text-primary-600 hover:text-primary-800">
              ×
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Dashboard Principale -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Totale Costi -->
      <div class="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <div class="flex items-center">
          <div class="p-3 bg-red-500 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-white" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-red-600">Costo Totale</p>
            <p class="text-2xl font-bold text-red-900">€{{ statistiche.costoTotale.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Costo Dipendenti -->
      <div class="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <div class="flex items-center">
          <div class="p-3 bg-orange-500 rounded-lg">
            <UsersIcon class="w-6 h-6 text-white" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-orange-600">Costo Dipendenti</p>
            <p class="text-2xl font-bold text-orange-900">€{{ statistiche.costoDipendenti.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Costo Materiali -->
      <div class="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div class="flex items-center">
          <div class="p-3 bg-blue-500 rounded-lg">
            <CubeIcon class="w-6 h-6 text-white" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-blue-600">Costo Materiali</p>
            <p class="text-2xl font-bold text-blue-900">€{{ statistiche.costoMateriali.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Costo Mezzi -->
      <div class="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div class="flex items-center">
          <div class="p-3 bg-purple-500 rounded-lg">
            <TruckIcon class="w-6 h-6 text-white" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-purple-600">Costo Mezzi</p>
            <p class="text-2xl font-bold text-purple-900">€{{ statistiche.costoMezzi.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Grafici e Analisi -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Grafico Distribuzione Costi -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">📊 Distribuzione Costi</h3>
          <div class="text-sm text-gray-500">
            Totale: €{{ statistiche.costoTotale.toLocaleString() }}
          </div>
        </div>
        <div class="h-80">
          <CostDistributionChart :costi="costiFiltrati" />
        </div>
      </div>

      <!-- Andamento Temporale -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">📈 Andamento Temporale</h3>
          <div class="text-sm text-gray-500">
            Trend ultimi 30 giorni
          </div>
        </div>
        <div class="h-80">
          <CostTrendChart :costi="costiFiltrati" />
        </div>
      </div>
    </div>

    <!-- Tabella Dettagliata -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">📋 Dettaglio Costi</h3>
        <div class="flex space-x-2">
          <button @click="toggleVista" class="text-sm text-primary-600 hover:text-primary-800">
            {{ vistaTabellare ? 'Vista Grafica' : 'Vista Tabellare' }}
          </button>
        </div>
      </div>

      <!-- Vista Tabellare -->
      <div v-if="vistaTabellare" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantiere</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantità</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Totale</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="costo in costiFiltrati" :key="costo.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(costo.data) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ costo.cantiere }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getCategoriaClass(costo.categoria)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ costo.categoria }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ costo.descrizione }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ costo.quantita }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{{ costo.costoUnitario }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">€{{ costo.costoTotale.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista Grafica -->
      <div v-else class="space-y-4">
        <div v-for="costo in costiFiltrati" :key="costo.id" class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div :class="getCategoriaIcon(costo.categoria)" class="w-10 h-10 rounded-full flex items-center justify-center text-white">
                {{ getCategoriaEmoji(costo.categoria) }}
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ costo.descrizione }}</h4>
                <p class="text-sm text-gray-500">{{ costo.cantiere }} • {{ formatDate(costo.data) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">€{{ costo.costoTotale.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">{{ costo.quantita }} × €{{ costo.costoUnitario }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginazione -->
      <div v-if="costiFiltrati.length > 10" class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Mostrando {{ (pagina - 1) * 10 + 1 }} - {{ Math.min(pagina * 10, costiFiltrati.length) }} di {{ costiFiltrati.length }} risultati
        </div>
        <div class="flex space-x-2">
          <button @click="pagina--" :disabled="pagina === 1" class="btn-secondary">
            Precedente
          </button>
          <button @click="pagina++" :disabled="pagina * 10 >= costiFiltrati.length" class="btn-secondary">
            Successiva
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Costi Eccessivi -->
    <div class="card bg-yellow-50 border-yellow-200">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-yellow-800">⚠️ Alert Costi Eccessivi</h3>
        <button @click="showAlertSettings = true" class="text-sm text-yellow-700 hover:text-yellow-900 underline">
          ⚙️ Impostazioni
        </button>
      </div>
      <div v-if="alertCosti.length > 0" class="space-y-2">
        <div v-for="alert in alertCosti" :key="alert.id" class="p-3 bg-yellow-100 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-yellow-800">{{ alert.titolo }}</p>
              <p class="text-sm text-yellow-700">{{ alert.descrizione }}</p>
            </div>
            <span class="text-lg font-bold text-yellow-800">€{{ alert.costo.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <p class="text-yellow-700">Nessun alert attivo</p>
        <p class="text-sm text-yellow-600">I costi sono entro le soglie configurate</p>
      </div>
    </div>

    <!-- Modal Impostazioni Alert -->
    <AlertSettingsModal 
      :show="showAlertSettings"
      @close="showAlertSettings = false"
      @settings-updated="onSettingsUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  CurrencyEuroIcon, 
  UsersIcon, 
  CubeIcon, 
  TruckIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'
import { getTipiLavori } from '@/data/tipiLavori.js'
import CostDistributionChart from '@/components/charts/CostDistributionChart.vue'
import CostTrendChart from '@/components/charts/CostTrendChart.vue'
import AlertSettingsModal from '@/components/AlertSettingsModal.vue'
import { downloadPDF, downloadExcel } from '@/services/reportService.js'

const firestoreStore = useFirestoreStore()
const popup = usePopup()

// Stato
const cantieri = ref([])
const costi = ref([])
const filtri = ref({
  periodo: 'tutto',
  cantiere: '',
  tipoLavoro: '',
  categoria: '',
  dataInizio: '',
  dataFine: ''
})
const pagina = ref(1)
const vistaTabellare = ref(true)
const showAlertSettings = ref(false)

// Dati
const tipiLavori = getTipiLavori()

// Computed
const costiFiltrati = computed(() => {
  let filtrati = [...costi.value]

  // Filtro periodo
  if (filtri.value.periodo !== 'tutto') {
    const oggi = new Date()
    let dataInizio = new Date()
    
    switch (filtri.value.periodo) {
      case 'settimana':
        dataInizio.setDate(oggi.getDate() - 7)
        break
      case 'mese':
        dataInizio.setMonth(oggi.getMonth() - 1)
        break
      case 'trimestre':
        dataInizio.setMonth(oggi.getMonth() - 3)
        break
      case 'anno':
        dataInizio.setFullYear(oggi.getFullYear() - 1)
        break
      case 'personalizzato':
        if (filtri.value.dataInizio && filtri.value.dataFine) {
          dataInizio = new Date(filtri.value.dataInizio)
          const dataFine = new Date(filtri.value.dataFine)
          filtrati = filtrati.filter(costo => {
            const dataCosto = new Date(costo.data)
            return dataCosto >= dataInizio && dataCosto <= dataFine
          })
        }
        return filtrati
    }
    
    filtrati = filtrati.filter(costo => new Date(costo.data) >= dataInizio)
  }

  // Filtro cantiere
  if (filtri.value.cantiere) {
    filtrati = filtrati.filter(costo => costo.cantiereId === filtri.value.cantiere)
  }

  // Filtro tipo lavoro
  if (filtri.value.tipoLavoro) {
    filtrati = filtrati.filter(costo => costo.tipoLavoro === filtri.value.tipoLavoro)
  }

  // Filtro categoria
  if (filtri.value.categoria) {
    filtrati = filtrati.filter(costo => costo.categoria === filtri.value.categoria)
  }

  return filtrati
})

const statistiche = computed(() => {
  const costi = costiFiltrati.value
  return {
    costoTotale: costi.reduce((tot, c) => tot + c.costoTotale, 0),
    costoDipendenti: costi.filter(c => c.categoria === 'dipendenti').reduce((tot, c) => tot + c.costoTotale, 0),
    costoMateriali: costi.filter(c => c.categoria === 'materiali').reduce((tot, c) => tot + c.costoTotale, 0),
    costoMezzi: costi.filter(c => c.categoria === 'mezzi').reduce((tot, c) => tot + c.costoTotale, 0)
  }
})

const alertCosti = computed(() => {
  const alert = []
  const costi = costiFiltrati.value
  
  // Alert per costi giornalieri eccessivi (>1000€)
  const costiGiornalieri = {}
  costi.forEach(costo => {
    const data = costo.data
    if (!costiGiornalieri[data]) costiGiornalieri[data] = 0
    costiGiornalieri[data] += costo.costoTotale
  })
  
  Object.entries(costiGiornalieri).forEach(([data, costo]) => {
    if (costo > 1000) {
      alert.push({
        id: `giorno-${data}`,
        titolo: `Costo giornaliero eccessivo`,
        descrizione: `Il ${formatDate(data)} il costo totale è stato di €${costo.toFixed(2)}`,
        costo: costo
      })
    }
  })
  
  return alert.slice(0, 5) // Max 5 alert
})

// Filtri attivi per il riepilogo
const filtriAttivi = computed(() => {
  const attivi = []
  
  if (filtri.value.periodo && filtri.value.periodo !== 'tutto') {
    const periodi = {
      settimana: 'Ultima settimana',
      mese: 'Ultimo mese',
      trimestre: 'Ultimo trimestre',
      anno: 'Ultimo anno',
      personalizzato: 'Periodo personalizzato'
    }
    attivi.push({
      key: 'periodo',
      label: `📅 ${periodi[filtri.value.periodo]}`
    })
  }
  
  if (filtri.value.cantiere) {
    const cantiere = cantieri.value.find(c => c.id === filtri.value.cantiere)
    attivi.push({
      key: 'cantiere',
      label: `🏗️ ${cantiere?.nome || 'Cantiere'}`
    })
  }
  
  if (filtri.value.tipoLavoro) {
    const tipo = tipiLavori.find(t => t.id === filtri.value.tipoLavoro)
    attivi.push({
      key: 'tipoLavoro',
      label: `🔨 ${tipo?.nome || 'Tipo lavoro'}`
    })
  }
  
  if (filtri.value.categoria) {
    const categorie = {
      dipendenti: '👥 Dipendenti',
      materiali: '🧱 Materiali',
      mezzi: '🚛 Mezzi',
      lavori: '🔨 Lavori'
    }
    attivi.push({
      key: 'categoria',
      label: categorie[filtri.value.categoria]
    })
  }
  
  return attivi
})

// Metodi
const caricaDati = async () => {
  try {
    // Carica cantieri
    await firestoreStore.loadCantieri()
    cantieri.value = firestoreStore.cantieri

    // Carica costi dal giornale cantiere
    const giornaleResult = await firestoreStore.loadCollection('giornale_cantiere')
    const giornaleData = giornaleResult.data || []
    costi.value = []
    
    giornaleData.forEach(entry => {
      // Estrai costi dipendenti
      if (entry.dipendenti && Array.isArray(entry.dipendenti)) {
        entry.dipendenti.forEach(dip => {
          const costoTotale = dip.costoTotale || (dip.ore * dip.costoOrario) || 0
          costi.value.push({
            id: `${entry.id}-dip-${dip.id}`,
            data: entry.data,
            cantiereId: entry.cantiereId,
            cantiere: cantieri.value.find(c => c.id === entry.cantiereId)?.nome || 'Cantiere non trovato',
            categoria: 'dipendenti',
            descrizione: `${dip.nome} ${dip.cognome}`,
            quantita: dip.ore || 0,
            costoUnitario: dip.costoOrario || 0,
            costoTotale: costoTotale,
            tipoLavoro: entry.tipoLavoro
          })
        })
      }

      // Estrai costi materiali
      if (entry.materiali && Array.isArray(entry.materiali)) {
        entry.materiali.forEach(mat => {
          const costoTotale = mat.costoTotale || (mat.quantita * mat.costoUnitario) || 0
          costi.value.push({
            id: `${entry.id}-mat-${mat.id}`,
            data: entry.data,
            cantiereId: entry.cantiereId,
            cantiere: cantieri.value.find(c => c.id === entry.cantiereId)?.nome || 'Cantiere non trovato',
            categoria: 'materiali',
            descrizione: mat.nome,
            quantita: mat.quantita || 0,
            costoUnitario: mat.costoUnitario || 0,
            costoTotale: costoTotale,
            tipoLavoro: entry.tipoLavoro
          })
        })
      }

      // Estrai costi mezzi
      if (entry.mezzi && Array.isArray(entry.mezzi)) {
        entry.mezzi.forEach(mez => {
          const costoTotale = mez.costoTotale || (mez.oreUtilizzo * mez.costoOrario) || 0
          costi.value.push({
            id: `${entry.id}-mez-${mez.id}`,
            data: entry.data,
            cantiereId: entry.cantiereId,
            cantiere: cantieri.value.find(c => c.id === entry.cantiereId)?.nome || 'Cantiere non trovato',
            categoria: 'mezzi',
            descrizione: mez.nome,
            quantita: mez.oreUtilizzo || 0,
            costoUnitario: mez.costoOrario || 0,
            costoTotale: costoTotale,
            tipoLavoro: entry.tipoLavoro
          })
        })
      }

      // Estrai costi lavori
      if (entry.lavori && Array.isArray(entry.lavori)) {
        entry.lavori.forEach(lav => {
          const costoTotale = lav.ore * lav.costoOrario || 0
          costi.value.push({
            id: `${entry.id}-lav-${lav.tipo}-${lav.sottocategoria}`,
            data: entry.data,
            cantiereId: entry.cantiereId,
            cantiere: cantieri.value.find(c => c.id === entry.cantiereId)?.nome || 'Cantiere non trovato',
            categoria: 'lavori',
            descrizione: `${lav.tipo} - ${lav.sottocategoria}`,
            quantita: lav.ore || 0,
            costoUnitario: lav.costoOrario || 0,
            costoTotale: costoTotale,
            tipoLavoro: lav.tipo
          })
        })
      }
    })
  } catch (error) {
    popup.error('Errore nel caricamento dei dati: ' + error.message)
  }
}

const applicaFiltri = () => {
  pagina.value = 1
  // I filtri vengono applicati automaticamente tramite computed
  popup.success('Filtri Applicati', 'I filtri sono stati applicati con successo')
}

const onSettingsUpdated = (newSettings) => {
  // Ricarica gli alert con le nuove impostazioni
  console.log('Impostazioni alert aggiornate:', newSettings)
  // Gli alert si aggiornano automaticamente tramite computed
}

const rimuoviFiltro = (chiave) => {
  switch (chiave) {
    case 'periodo':
      filtri.value.periodo = 'tutto'
      filtri.value.dataInizio = ''
      filtri.value.dataFine = ''
      break
    case 'cantiere':
      filtri.value.cantiere = ''
      break
    case 'tipoLavoro':
      filtri.value.tipoLavoro = ''
      break
    case 'categoria':
      filtri.value.categoria = ''
      break
  }
  pagina.value = 1
}

const toggleVista = () => {
  vistaTabellare.value = !vistaTabellare.value
}

const exportPDF = () => {
  try {
    const filename = `report-costi-${new Date().toISOString().split('T')[0]}.pdf`
    downloadPDF(costiFiltrati.value, filtri.value, statistiche.value, filename)
    popup.success('Report PDF Generato', 'Il report è stato scaricato con successo')
  } catch (error) {
    console.error('Errore generazione PDF:', error)
    popup.error('Errore Export PDF', 'Impossibile generare il report PDF')
  }
}

const exportExcel = () => {
  try {
    const filename = `report-costi-${new Date().toISOString().split('T')[0]}.xlsx`
    downloadExcel(costiFiltrati.value, filtri.value, statistiche.value, filename)
    popup.success('Report Excel Generato', 'Il report è stato scaricato con successo')
  } catch (error) {
    console.error('Errore generazione Excel:', error)
    popup.error('Errore Export Excel', 'Impossibile generare il report Excel')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT')
}

const getCategoriaClass = (categoria) => {
  const classes = {
    dipendenti: 'bg-orange-100 text-orange-800',
    materiali: 'bg-blue-100 text-blue-800',
    mezzi: 'bg-purple-100 text-purple-800',
    lavori: 'bg-green-100 text-green-800'
  }
  return classes[categoria] || 'bg-gray-100 text-gray-800'
}

const getCategoriaIcon = (categoria) => {
  const icons = {
    dipendenti: 'bg-orange-500',
    materiali: 'bg-blue-500',
    mezzi: 'bg-purple-500',
    lavori: 'bg-green-500'
  }
  return icons[categoria] || 'bg-gray-500'
}

const getCategoriaEmoji = (categoria) => {
  const emojis = {
    dipendenti: '👥',
    materiali: '🧱',
    mezzi: '🚛',
    lavori: '🔨'
  }
  return emojis[categoria] || '📋'
}

// Lifecycle
onMounted(() => {
  caricaDati()
})
</script> 