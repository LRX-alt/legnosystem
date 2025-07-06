<template>
  <div class="space-y-6">
    <!-- Header Dashboard - Mobile Optimized -->
    <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-display font-bold text-primary-800">Dashboard</h1>
        <p class="text-gray-600 text-sm sm:text-base">Panoramica generale - Legnosystem.bio</p>
      </div>
      <div class="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
        Aggiornato: {{ currentTime }}
      </div>
    </div>

    <!-- KPI Cards - Mobile Optimized -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- Cantieri Attivi -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <div class="w-6 h-6 text-primary-600 flex items-center justify-center">
              🏗️
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cantieri Attivi</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ kpis.cantieriAttivi }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-gray-500">Dati in tempo reale</span>
          </div>
        </div>
      </div>

      <!-- Valore Magazzino -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <div class="w-6 h-6 text-accent-600 flex items-center justify-center">
              📦
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Magazzino</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">€{{ kpis.valoreMagazzino.toLocaleString() }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-gray-500">Aggiornato automaticamente</span>
          </div>
        </div>
      </div>

      <!-- Ore Lavorate -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-wood-light rounded-lg">
            <div class="w-6 h-6 text-primary-600 flex items-center justify-center">
              ⏰
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-600">Ore Lavorate</p>
            <div class="flex items-baseline space-x-2">
              <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ kpis.oreLavorate }}h</p>
              <span class="text-sm text-gray-500">settimana</span>
            </div>
          </div>
        </div>
        
        <!-- Dettagli ore -->
        <div class="mt-3 sm:mt-4 space-y-2">
          <div class="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Oggi:</span>
              <span class="font-medium text-gray-900">{{ dettagliOre.oggi }}h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Ieri:</span>
              <span class="font-medium text-gray-900">{{ dettagliOre.ieri }}h</span>
            </div>
          </div>
          
          <div class="pt-2 border-t border-gray-100">
            <div class="flex justify-between items-center text-xs sm:text-sm">
              <span class="text-gray-500">Questo mese:</span>
              <span class="font-semibold text-primary-600">{{ dettagliOre.mese }}h</span>
            </div>
          </div>
          
          <div v-if="dettagliOre.dipendentiOggi > 0" class="flex items-center text-xs text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>{{ dettagliOre.dipendentiOggi }} dipendenti attivi oggi</span>
          </div>
          
          <div v-else class="flex items-center text-xs text-gray-500">
            <div class="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
            <span>Nessun dipendente registrato oggi</span>
          </div>
          
          <!-- Pulsanti Controllo e Correzione Coerenza -->
          <div class="pt-2 mt-2 border-t border-gray-100 space-y-2">
            <button 
              @click="eseguiControlloCoerenza"
              :disabled="controlloInCorso || correzioneInCorso"
              class="w-full flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200"
              :class="controlloInCorso || correzioneInCorso
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'"
            >
              <div v-if="controlloInCorso" class="flex items-center">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600 mr-2"></div>
                <span>Controllo in corso...</span>
              </div>
              <div v-else class="flex items-center">
                <span class="mr-2">🔍</span>
                <span>Verifica Coerenza</span>
              </div>
            </button>
            
            <button 
              @click="eseguiCorrezioneAutomatica"
              :disabled="controlloInCorso || correzioneInCorso"
              class="w-full flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200"
              :class="controlloInCorso || correzioneInCorso
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'"
            >
              <div v-if="correzioneInCorso" class="flex items-center">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-2"></div>
                <span>Correzione in corso...</span>
              </div>
              <div v-else class="flex items-center">
                <span class="mr-2">🔧</span>
                <span>Correzione Auto</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mezzi Disponibili -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <div class="w-6 h-6 text-green-600 flex items-center justify-center">
              🚛
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Mezzi Disponibili</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ kpis.mezziDisponibili }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <router-link to="/mezzi" class="text-green-600 font-medium hover:text-green-700">Gestisci mezzi →</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Grafici e Tabelle - Mobile Stack Layout -->
    <div class="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
      <!-- Cantieri Overview - Mobile Optimized -->
      <div class="card">
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Cantieri Attivi</h3>
          <router-link to="/cantieri" class="text-primary-600 hover:text-primary-700 text-sm font-medium self-start sm:self-auto">
            Vedi tutti →
          </router-link>
        </div>
        
        <!-- Messaggio quando non ci sono cantieri -->
        <div v-if="cantieriAttiviFormattati.length === 0" class="text-center py-8">
          <div class="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center text-2xl">
            🏗️
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun cantiere attivo</h3>
          <p class="mt-1 text-sm text-gray-500">Inizia creando il tuo primo cantiere.</p>
          <div class="mt-6">
            <router-link to="/cantieri" class="btn-primary">
              <span class="mr-2">➕</span>
              Nuovo Cantiere
            </router-link>
          </div>
        </div>
        
        <!-- Mobile: Stack Layout -->
        <div v-else class="block sm:hidden space-y-3">
          <div v-for="cantiere in cantieriAttiviFormattati" :key="cantiere.id" class="p-3 bg-gray-50 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ cantiere.nome }}</p>
                <p class="text-sm text-gray-600">{{ cantiere.dettagli }}</p>
              </div>
              <span class="text-xs text-gray-500 ml-2 flex-shrink-0">{{ cantiere.scadenza }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full" :style="`width: ${cantiere.progresso}%`"></div>
              </div>
              <span class="text-sm text-gray-600 font-medium">{{ cantiere.progresso }}%</span>
            </div>
          </div>
        </div>

        <!-- Desktop: Original Layout -->
        <div v-else class="hidden sm:block space-y-4">
          <div v-for="cantiere in cantieriAttiviFormattati" :key="cantiere.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ cantiere.nome }}</p>
              <p class="text-sm text-gray-600">{{ cantiere.dettagli }}</p>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div class="bg-primary-500 h-2 rounded-full" :style="`width: ${cantiere.progresso}%`"></div>
                </div>
                <span class="text-sm text-gray-600">{{ cantiere.progresso }}%</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ cantiere.scadenza }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Materiali più utilizzati - Mobile Optimized -->
      <div class="card">
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Materiali più Utilizzati</h3>
          <router-link to="/magazzino" class="text-primary-600 hover:text-primary-700 text-sm font-medium self-start sm:self-auto">
            Vedi magazzino →
          </router-link>
        </div>
        
        <!-- Messaggio quando non ci sono materiali -->
        <div v-if="materialiTop.length === 0" class="text-center py-8">
          <div class="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center text-2xl">
            📦
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun materiale in magazzino</h3>
          <p class="mt-1 text-sm text-gray-500">Inizia aggiungendo i tuoi primi materiali.</p>
          <div class="mt-6">
            <router-link to="/magazzino" class="btn-primary">
              <span class="mr-2">➕</span>
              Aggiungi Materiale
            </router-link>
          </div>
        </div>
        
        <!-- Mobile: Enhanced Layout -->
        <div v-else class="block sm:hidden space-y-3">
          <div v-for="materiale in materialiTop" :key="materiale.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-4 h-4 rounded-full flex-shrink-0" :class="materiale.color"></div>
              <span class="text-sm font-medium text-gray-900 truncate">{{ materiale.nome }}</span>
            </div>
            <div class="text-right ml-2">
              <span class="text-sm font-semibold text-gray-900">{{ materiale.quantita }}</span>
              <span class="text-xs text-gray-500 ml-1">{{ materiale.unita }}</span>
            </div>
          </div>
        </div>

        <!-- Desktop: Original Layout -->
        <div v-else class="hidden sm:block space-y-3">
          <div v-for="materiale in materialiTop" :key="materiale.id" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" :class="materiale.color"></div>
              <span class="text-sm font-medium text-gray-900">{{ materiale.nome }}</span>
            </div>
            <div class="text-right">
              <span class="text-sm font-semibold text-gray-900">{{ materiale.quantita }}</span>
              <span class="text-xs text-gray-500 ml-1">{{ materiale.unita }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attività Recenti - Mobile Optimized -->
    <div class="card">
      <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Attività Recenti</h3>
        <span class="text-sm text-gray-500 self-start sm:self-auto">Ultimi 7 giorni</span>
      </div>

      <!-- Messaggio quando non ci sono attività -->
      <div v-if="attivitaRecenti.length === 0" class="text-center py-8">
        <div class="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center text-2xl">
          ⏰
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nessuna attività recente</h3>
        <p class="mt-1 text-sm text-gray-500">Le attività appariranno qui quando inizierai a utilizzare il sistema.</p>
      </div>

      <!-- Mobile: Simplified Timeline -->
      <div v-else class="block sm:hidden space-y-3">
        <div v-for="attivita in attivitaRecenti" :key="attivita.id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex-shrink-0">
            <span class="h-8 w-8 rounded-full flex items-center justify-center" :class="attivita.iconBg">
              <span class="text-white text-sm">{{ attivita.icon }}</span>
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ attivita.descrizione }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ attivita.dettaglio }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ attivita.tempo }}</p>
          </div>
        </div>
      </div>

      <!-- Desktop: Original Timeline -->
      <div v-else class="hidden sm:block flow-root">
        <ul class="-mb-8">
          <li v-for="(attivita, index) in attivitaRecenti" :key="attivita.id">
            <div class="relative pb-8" :class="{ 'pb-0': index === attivitaRecenti.length - 1 }">
              <span v-if="index !== attivitaRecenti.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white" :class="attivita.iconBg">
                    <span class="text-white text-sm">{{ attivita.icon }}</span>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-900">{{ attivita.descrizione }}</p>
                    <p class="text-xs text-gray-500">{{ attivita.dettaglio }}</p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    {{ attivita.tempo }}
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useFirestoreStore } from '@/stores/firestore'
import { useFirestore } from '@/composables/useFirestore'
import { useFirebaseAnalytics } from '@/composables/useFirebaseAnalytics'
import { useFirestoreRealtime } from '@/composables/useFirestoreRealtime'
import { useAuthStore } from '@/stores/auth'
import { usePopup } from '@/composables/usePopup'
import { executeHoursCoherenceCheck } from '@/utils/hoursCoherenceCheck'
import { executeAutoCorrection } from '@/utils/hoursCoherenceCorrection'


// Stores & Composables
const authStore = useAuthStore()
const firestoreStore = useFirestoreStore()
const firestore = useFirestore()
const analytics = useFirebaseAnalytics()
const realtime = useFirestoreRealtime()
const { success, error, info, warning, confirm } = usePopup()

// State per real-time
const realtimeActive = ref(false)
const dashboardListeners = ref(null)
const lastSync = ref(null)

// State per controllo coerenza
const controlloInCorso = ref(false)
const correzioneInCorso = ref(false)
const ultimoControllo = ref(null)
const ultimaCorrezione = ref(null)

// KPI Data - Calcolati dinamicamente dai dati Firestore
const kpis = computed(() => ({
  cantieriAttivi: firestoreStore.cantieriAttivi.length,
  valoreMagazzino: firestoreStore.materiali.reduce((total, m) => total + ((m.prezzoUnitario || 0) * (m.quantita || 0)), 0),
  oreLavorate: calcolaOreLavorate(),
  mezziDisponibili: firestoreStore.mezzi.filter(m => m.stato === 'disponibile').length
}))

// Calcolo delle ore lavorate basato sui timesheet reali
const calcolaOreLavorate = () => {
  const oggi = new Date()
  const inizioSettimana = new Date(oggi)
  
  // Imposta l'inizio della settimana a Lunedì
  const day = oggi.getDay()
  const diff = oggi.getDate() - day + (day === 0 ? -6 : 1)
  inizioSettimana.setDate(diff)
  inizioSettimana.setHours(0, 0, 0, 0)
  
  const fineSettimana = new Date(inizioSettimana)
  fineSettimana.setDate(inizioSettimana.getDate() + 5) // Lun-Sab (6 giorni)
  fineSettimana.setHours(23, 59, 59, 999)
  
  // Filtra i timesheet per questa settimana
  const timesheetSettimana = firestoreStore.timesheet.filter(t => {
    const dataTimesheet = new Date(t.data || t.date)
    return dataTimesheet >= inizioSettimana && dataTimesheet <= fineSettimana
  })
  
  // Calcola il totale delle ore
  return timesheetSettimana.reduce((total, t) => {
    return total + (t.ore || t.oreLavorate || 0)
  }, 0)
}

// Dettagli ore lavorate per la card espansa
const dettagliOre = computed(() => {
  const oggi = new Date()
  const ieri = new Date(oggi)
  ieri.setDate(ieri.getDate() - 1)
  
  const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1)
  const fineMese = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0)
  
  const inizioSettimana = new Date(oggi)
  const day = oggi.getDay()
  const diff = oggi.getDate() - day + (day === 0 ? -6 : 1)
  inizioSettimana.setDate(diff)
  inizioSettimana.setHours(0, 0, 0, 0)
  
  const oggi_str = oggi.toISOString().split('T')[0]
  const ieri_str = ieri.toISOString().split('T')[0]
  
  // Calcola ore per periodo
  const oreOggi = firestoreStore.timesheet
    .filter(t => (t.data || t.date) === oggi_str)
    .reduce((total, t) => total + (t.ore || t.oreLavorate || 0), 0)
    
  const oreIeri = firestoreStore.timesheet
    .filter(t => (t.data || t.date) === ieri_str)
    .reduce((total, t) => total + (t.ore || t.oreLavorate || 0), 0)
  
  const oreSettimana = firestoreStore.timesheet
    .filter(t => {
      const dataTimesheet = new Date(t.data || t.date)
      return dataTimesheet >= inizioSettimana
    })
    .reduce((total, t) => total + (t.ore || t.oreLavorate || 0), 0)
    
  const oreMese = firestoreStore.timesheet
    .filter(t => {
      const dataTimesheet = new Date(t.data || t.date)
      return dataTimesheet >= inizioMese && dataTimesheet <= fineMese
    })
    .reduce((total, t) => total + (t.ore || t.oreLavorate || 0), 0)
  
  // Calcola dipendenti attivi oggi
  const dipendentiOggi = new Set(
    firestoreStore.timesheet
      .filter(t => (t.data || t.date) === oggi_str && (t.ore || t.oreLavorate || 0) > 0)
      .map(t => t.dipendenteId || t.dipendente_id)
  ).size
  
  return {
    oggi: Math.round(oreOggi * 2) / 2,
    ieri: Math.round(oreIeri * 2) / 2,
    settimana: Math.round(oreSettimana * 2) / 2,
    mese: Math.round(oreMese * 2) / 2,
    dipendentiOggi
  }
})

// Cantieri attivi - Filtrati da Firestore (primi 3)
const cantieri = computed(() => 
  firestoreStore.cantieriAttivi
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      nome: c.nome,
      cliente: c.cliente,
      progresso: c.progresso || 0,
      scadenza: c.scadenza ? new Date(c.scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'N/D'
    }))
)

// Materiali più utilizzati - Top 5 per quantità
const materialiTop = computed(() => 
  firestoreStore.materiali
    .filter(m => (m.quantita || 0) > 0)
    .sort((a, b) => (b.quantita || 0) - (a.quantita || 0))
    .slice(0, 5)
    .map((m, index) => ({
      id: m.id,
      nome: m.nome,
      quantita: m.quantita,
      unita: m.unita || m.unitaMisura || m.unita_misura || 'pz',
      color: ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'][index]
    }))
)

// Attività recenti - Simulazione basata sui dati (da implementare con log reali)
const attivitaRecenti = computed(() => {
  const activities = []
  
  // Aggiungi attività basate sui cantieri recenti
  firestoreStore.cantieri.slice(0, 3).forEach(cantiere => {
    activities.push({
      id: `cantiere-${cantiere.id}`,
      descrizione: `Aggiornamento cantiere: ${cantiere.nome}`,
      dettaglio: `Cliente: ${cantiere.cliente?.nome || 'Non specificato'}`,
      tempo: '2 ore fa',
      icon: '🏗️',
      iconBg: 'bg-blue-500'
    })
  })
  
  // Aggiungi attività basate sui materiali
  if (firestoreStore.materiali.length > 0) {
    activities.push({
      id: 'materiali-update',
      descrizione: 'Aggiornamento inventario materiali',
      dettaglio: `${firestoreStore.materiali.length} materiali in magazzino`,
      tempo: '4 ore fa',
      icon: '📦',
      iconBg: 'bg-green-500'
    })
  }
  
  return activities.slice(0, 4)
})

// Data e ora attuale
const currentTime = ref('')

// Real-time connection status
const connectionStatus = computed(() => {
  if (!realtimeActive.value) return { status: 'disconnected', color: 'text-gray-500', icon: '🔴' }
  if (realtime.isConnected.value) return { status: 'connected', color: 'text-green-500', icon: '🟢' }
  return { status: 'connecting', color: 'text-yellow-500', icon: '🟡' }
})

// Enhanced KPI calculation with trends
const calculateTrend = (entity) => {
  // Placeholder per calcolo trend - da implementare con dati storici
  return Math.random() > 0.5 ? 'up' : 'down'
}

// Enhanced dashboard cards
const enhancedKpis = computed(() => ({
  cantieriAttivi: {
    value: firestoreStore.cantieriAttivi.length,
    total: firestoreStore.cantieri.length,
    valoreAttivo: firestoreStore.cantieriAttivi
      .reduce((total, c) => total + (c.valore || 0), 0),
    trend: calculateTrend('cantieri')
  },
  clienti: {
    totale: firestoreStore.clienti.length,
    attivi: firestoreStore.clienti.filter(c => c.attivo !== false).length,
    nuoviQuesto_mese: firestoreStore.clienti.filter(c => {
      const created = new Date(c.data_creazione || c.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    trend: calculateTrend('clienti')
  },
  dipendenti: {
    totale: firestoreStore.dipendenti.length,
    attivi: firestoreStore.dipendenti.filter(d => d.attivo !== false).length,
    trend: calculateTrend('dipendenti')
  },
  materiali: {
    totale: firestoreStore.materiali.length,
    valore: firestoreStore.materiali.reduce((total, m) => total + ((m.prezzoUnitario || 0) * (m.quantita || 0)), 0),
    trend: calculateTrend('materiali')
  }
}))

// Setup real-time listeners
const startRealtimeSync = () => {
  if (!authStore.isAuthenticated || realtimeActive.value) return

  try {
    dashboardListeners.value = realtime.startDashboardListeners({
      cantieri: (docs, changes) => {
        lastSync.value = new Date()
        // Removed toast notifications - only update silently
      },
      clienti: (docs, changes) => {
        lastSync.value = new Date()
        // Removed toast notifications - only update silently
      },
      dipendenti: (docs, changes) => {
        lastSync.value = new Date()
        // Silent update
      },
      notifications: (docs, changes) => {
        lastSync.value = new Date()
        // Silent update
      }
    })

    realtimeActive.value = true
    console.log('✅ Real-time sync attivato per dashboard')
  } catch (error) {
    console.error('Errore attivazione real-time sync:', error)
            error('Errore Sincronizzazione', 'Problemi di connessione real-time con Firebase')
  }
}

const stopRealtimeSync = () => {
  if (dashboardListeners.value) {
    dashboardListeners.value.stopAll()
    dashboardListeners.value = null
    realtimeActive.value = false
    console.log('🔌 Real-time sync disattivato')
  }
}

// Funzione per eseguire il controllo coerenza delle ore
const eseguiControlloCoerenza = async () => {
  if (controlloInCorso.value) return
  
  controlloInCorso.value = true
  
  try {
    console.log('🔍 Avvio controllo coerenza ore...')
    
    // Esegue il controllo completo
    const report = await executeHoursCoherenceCheck()
    ultimoControllo.value = report
    
    // Mostra risultati tramite popup
    const { summary, recommendations } = report
    
    if (summary.totalIssues === 0) {
      success(
        'Controllo Coerenza Completato',
        `✅ Sistema completamente coerente!<br><br>
        📊 <strong>Record analizzati:</strong> ${summary.totalRecords}<br>
        👥 <strong>Dipendenti:</strong> ${summary.uniqueEmployees}<br>
        🎯 <strong>Coerenza:</strong> ${summary.coherencePercentage}%<br><br>
        <em>Nessun problema rilevato nei dati delle ore.</em>`
      )
    } else {
      const issueText = summary.totalIssues === 1 ? 'problema rilevato' : 'problemi rilevati'
      const topIssues = Object.entries(report.issueBreakdown.byType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => `• ${getIssueTypeLabel(type)}: ${count}`)
        .join('<br>')
      
      const severity = report.issueBreakdown.bySeverity.high > 0 ? 'warning' : 'info'
      
      const popupContent = `
        📊 <strong>Record analizzati:</strong> ${summary.totalRecords}<br>
        🔍 <strong>Problemi rilevati:</strong> ${summary.totalIssues}<br>
        👥 <strong>Dipendenti:</strong> ${summary.uniqueEmployees}<br>
        🎯 <strong>Coerenza:</strong> ${summary.coherencePercentage}%<br><br>
        <strong>Problemi principali:</strong><br>
        ${topIssues}<br><br>
        ${recommendations.length > 0 ? '<strong>Raccomandazioni:</strong><br>' + recommendations.slice(0, 2).map(r => `• ${r.action}`).join('<br>') + '<br><br>' : ''}
        <em>Controlla la console per dettagli completi.</em>
      `
      
      if (severity === 'warning') {
        warning('Controllo Coerenza Completato', popupContent)
      } else {
        info('Controllo Coerenza Completato', popupContent)
      }
    }
    
    console.log('✅ Controllo coerenza completato')
    
  } catch (err) {
    console.error('❌ Errore durante controllo coerenza:', err)
    error(
      'Errore Controllo Coerenza',
      `Impossibile completare il controllo:<br><br><strong>${err.message}</strong><br><br>Verifica la connessione e riprova.`
    )
  } finally {
    controlloInCorso.value = false
  }
}

// Helper per le etichette dei problemi
const getIssueTypeLabel = (type) => {
  const labels = {
    'field_inconsistency': 'Campi Inconsistenti',
    'duplicate_records': 'Record Duplicati',
    'zero_hours': 'Ore Mancanti',
    'excessive_hours': 'Ore Eccessive', 
    'insufficient_hours': 'Ore Insufficienti',
    'source_conflicts': 'Conflitti Fonti',
    'calculation_error': 'Errori Calcolo'
  }
  return labels[type] || type
}

// Funzione per eseguire la correzione automatica
const eseguiCorrezioneAutomatica = async () => {
  if (correzioneInCorso.value || controlloInCorso.value) return
  
  // Chiede conferma prima di procedere
  const confermato = await confirm(
    'Conferma Correzione Automatica',
    `🔧 <strong>Correzione Automatica Coerenza</strong><br><br>
    Questa operazione:<br>
    • ✅ Creerà un backup automatico<br>
    • 🔨 Correggerà gli errori di calcolo<br>
    • 📊 Verificherà i risultati<br>
    • 📝 Salverà un log delle modifiche<br><br>
    <strong>Vuoi procedere?</strong>`,
    'Procedi',
    'Annulla'
  )
  
  if (!confermato) return
  
  correzioneInCorso.value = true
  
  try {
    console.log('🔧 Avvio correzione automatica...')
    
    // Esegue la correzione automatica
    const risultato = await executeAutoCorrection()
    ultimaCorrezione.value = risultato
    
    if (risultato.success) {
      const { correctionsMade, preReport, postReport } = risultato
      
      if (correctionsMade === 0) {
        success(
          'Sistema Già Coerente',
          `✅ <strong>Nessuna correzione necessaria!</strong><br><br>
          Il sistema è già completamente coerente.<br><br>
          📊 <strong>Coerenza:</strong> ${preReport.summary.coherencePercentage}%<br>
          🔍 <strong>Problemi:</strong> ${preReport.summary.totalIssues}`
        )
      } else {
        const miglioramento = postReport.summary.coherencePercentage - preReport.summary.coherencePercentage
        
        success(
          'Correzione Automatica Completata',
          `🎉 <strong>Correzioni applicate con successo!</strong><br><br>
          🔨 <strong>Correzioni effettuate:</strong> ${correctionsMade}<br>
          📈 <strong>Miglioramento:</strong> ${preReport.summary.coherencePercentage}% → ${postReport.summary.coherencePercentage}%<br>
          📊 <strong>Coerenza finale:</strong> ${postReport.summary.coherencePercentage}%<br><br>
          💾 <strong>Backup ID:</strong> ${risultato.backupId}<br>
          📝 <strong>Log salvato:</strong> ✅<br><br>
          <em>Tutti i dati originali sono stati salvati in backup.</em>`
        )
        
        // Ricarica i dati per riflettere le modifiche
        await loadDashboardData()
      }
    } else {
      throw new Error(risultato.message || 'Errore durante correzione')
    }
    
    console.log('✅ Correzione automatica completata')
    
  } catch (err) {
    console.error('❌ Errore durante correzione automatica:', err)
    error(
      'Errore Correzione Automatica',
      `❌ <strong>Impossibile completare la correzione:</strong><br><br>
      ${err.message}<br><br>
      🔒 <strong>Nessun dato è stato modificato.</strong><br>
      💡 Verifica la connessione e riprova.<br><br>
      <em>In caso di problemi persistenti, contatta l'assistenza.</em>`
    )
  } finally {
    correzioneInCorso.value = false
  }
}

// Load dashboard data with analytics tracking
const loadDashboardData = async () => {
  const startTime = Date.now()
  
  try {
    // Carica tutti i dati da Firestore
    await firestore.loadAllData()
    
    // 🕒 Carica specificamente i timesheet per il calcolo delle ore
    console.log('📊 Caricamento timesheet per dashboard...')
    await firestoreStore.loadTimesheet()
    
    // Log per debug ore lavorate
    console.log('📈 Timesheet caricati:', firestoreStore.timesheet.length)
    console.log('🔢 Ore calcolate questa settimana:', calcolaOreLavorate())
    
    // Analytics: track dashboard view
    const widgets = ['cantieri', 'clienti', 'materiali']
    if (authStore.canManagePersonnel) {
      widgets.push('dipendenti')
      widgets.push('timesheet')
    }
    
    await analytics.logDashboardViewed(widgets)
    
    // Performance tracking
    const loadTime = Date.now() - startTime
    await analytics.logPerformanceMetric('dashboard_load_time', loadTime, {
      component: 'Dashboard'
    })
    
    console.log(`✅ Dashboard caricato in ${loadTime}ms`)
  } catch (error) {
    console.error('Errore nel caricamento dati dashboard:', error)
    
    // Analytics: track error
    await analytics.logErrorOccurred(error, { 
      component: 'Dashboard',
      action: 'loadData'
    })
    
    error('Errore Dashboard', `Impossibile caricare i dati: ${error.message}`)
  }
}

onMounted(async () => {
  // Aggiorna timestamp
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  updateTime()
  // Aggiorna ogni minuto
  const timeInterval = setInterval(updateTime, 60000)
  
  // 🔧 IMPORTANTE: Registra lifecycle hooks PRIMA delle operazioni async
  onUnmounted(() => {
    clearInterval(timeInterval)
    stopRealtimeSync()
  })
  
  // Carica dati dashboard
  await loadDashboardData()
  
  // Avvia real-time sync se l'utente è autenticato
  if (authStore.isAuthenticated) {
    startRealtimeSync()
  }
  
  // Analytics: track page view
  await analytics.trackPageView('/dashboard', {
    user_role: authStore.userProfile?.role,
    widgets_enabled: realtimeActive.value
  })
})

const formatCantiereDetails = (cantiere) => {
  if (!cantiere) return ''
  
  const details = []
  if (cantiere.nome) details.push(cantiere.nome)
  if (cantiere.cliente?.nome) details.push(`Cliente: ${cantiere.cliente.nome}`)
  if (cantiere.indirizzo) details.push(`Sede: ${cantiere.indirizzo}`)
  if (cantiere.tipoLavoro) details.push(`Tipo: ${cantiere.tipoLavoro}`)
  
  return details.join(' - ')
}

// Computed per i cantieri formattati
const cantieriFormattati = computed(() => {
  return firestoreStore.cantieri.map(cantiere => ({
    ...cantiere,
    dettagli: formatCantiereDetails(cantiere)
  }))
})

// Cantieri attivi formattati
const cantieriAttiviFormattati = computed(() => 
  cantieriFormattati.value.filter(c => ['in-corso', 'pianificato'].includes(c.stato))
)
</script>

<style scoped>
.cantiere-card {
  @apply bg-white rounded-lg shadow p-4 mb-4;
}

.cantiere-info h3 {
  @apply text-lg font-semibold mb-1;
}

.cantiere-stats {
  @apply flex justify-between mt-3 pt-3 border-t;
}

.stat {
  @apply flex flex-col;
}

.stat .label {
  @apply text-sm text-gray-500;
}

.stat .value {
  @apply text-lg font-medium;
}

.empty-state {
  @apply text-center py-8;
}
</style> 