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
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Ore Lavorate</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ kpis.oreLavorate }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-gray-600">Questa settimana</span>
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
          <h3 class="text-lg font-semibold text-gray-900">Cantieri in Corso</h3>
          <router-link to="/cantieri" class="text-primary-600 hover:text-primary-700 text-sm font-medium self-start sm:self-auto">
            Vedi tutti →
          </router-link>
        </div>
        
        <!-- Messaggio quando non ci sono cantieri -->
        <div v-if="cantieri.length === 0" class="text-center py-8">
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
          <div v-for="cantiere in cantieri" :key="cantiere.id" class="p-3 bg-gray-50 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ cantiere.nome }}</p>
                <p class="text-sm text-gray-600">{{ cantiere.cliente }}</p>
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
          <div v-for="cantiere in cantieri" :key="cantiere.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ cantiere.nome }}</p>
              <p class="text-sm text-gray-600">{{ cantiere.cliente }}</p>
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
import { ref, onMounted, computed } from 'vue'
import { useFirestoreStore } from '@/stores/firestore'

// Firestore store
const firestoreStore = useFirestoreStore()

// KPI Data - Calcolati dinamicamente dai dati Firestore
const kpis = computed(() => ({
  cantieriAttivi: firestoreStore.cantieri.filter(c => c.stato === 'in_corso').length,
  valoreMagazzino: firestoreStore.materiali.reduce((total, m) => total + (m.prezzo_unitario * m.quantita), 0),
  oreLavorate: firestoreStore.dipendenti.reduce((total, d) => total + (d.ore_settimana || 0), 0),
  mezziDisponibili: firestoreStore.mezzi.filter(m => m.stato === 'disponibile').length
}))

// Cantieri attivi - Filtrati da Firestore (primi 3)
const cantieri = computed(() => 
  firestoreStore.cantieri
    .filter(c => c.stato === 'in_corso')
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      nome: c.nome,
      cliente: c.cliente,
      progresso: c.progresso || 0,
      scadenza: c.data_fine ? new Date(c.data_fine.seconds * 1000).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'N/D'
    }))
)

// Materiali più utilizzati - Top 5 per quantità
const materialiTop = computed(() => 
  firestoreStore.materiali
    .filter(m => m.quantita > 0)
    .sort((a, b) => b.quantita - a.quantita)
    .slice(0, 5)
    .map((m, index) => ({
      id: m.id,
      nome: m.nome,
      quantita: m.quantita,
      unita: m.unita_misura,
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
      dettaglio: `Cliente: ${cantiere.cliente}`,
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

onMounted(async () => {
  // Aggiorna timestamp
  const now = new Date()
  currentTime.value = now.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Carica tutti i dati da Firestore
  try {
    await Promise.all([
      firestoreStore.loadCantieri(),
      firestoreStore.loadClienti(),
      firestoreStore.loadMateriali(),
      firestoreStore.loadDipendenti(),
      firestoreStore.loadMezzi()
    ])
  } catch (error) {
    console.error('Errore nel caricamento dati dashboard:', error)
  }
})
</script> 