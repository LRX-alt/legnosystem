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
            <BuildingOfficeIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cantieri Attivi</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ kpis.cantieriAttivi }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-accent-600 font-medium">+2</span>
            <span class="text-gray-500 ml-1">vs mese scorso</span>
          </div>
        </div>
      </div>

      <!-- Valore Magazzino -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CubeIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valore Magazzino</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">€{{ kpis.valoreMagazzino.toLocaleString() }}</p>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <div class="flex items-center text-xs sm:text-sm">
            <span class="text-accent-600 font-medium">+5.2%</span>
            <span class="text-gray-500 ml-1">vs mese precedente</span>
          </div>
        </div>
      </div>

      <!-- Ore Lavorate -->
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-wood-light rounded-lg">
            <ClockIcon class="w-6 h-6 text-primary-600" />
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
            <TruckIcon class="w-6 h-6 text-green-600" />
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
        
        <!-- Mobile: Stack Layout -->
        <div class="block sm:hidden space-y-3">
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
        <div class="hidden sm:block space-y-4">
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
        
        <!-- Mobile: Enhanced Layout -->
        <div class="block sm:hidden space-y-3">
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
        <div class="hidden sm:block space-y-3">
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

      <!-- Mobile: Simplified Timeline -->
      <div class="block sm:hidden space-y-3">
        <div v-for="attivita in attivitaRecenti" :key="attivita.id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex-shrink-0">
            <span class="h-8 w-8 rounded-full flex items-center justify-center" :class="attivita.iconBg">
              <component :is="attivita.icon" class="h-4 w-4 text-white" />
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
      <div class="hidden sm:block flow-root">
        <ul class="-mb-8">
          <li v-for="(attivita, index) in attivitaRecenti" :key="attivita.id">
            <div class="relative pb-8" :class="{ 'pb-0': index === attivitaRecenti.length - 1 }">
              <span v-if="index !== attivitaRecenti.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white" :class="attivita.iconBg">
                    <component :is="attivita.icon" class="h-4 w-4 text-white" />
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
import { ref, onMounted } from 'vue'
import { 
  BuildingOfficeIcon, 
  CubeIcon, 
  ClockIcon,
  TruckIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

// KPI Data
const kpis = ref({
  cantieriAttivi: 8,
  valoreMagazzino: 125000,
  oreLavorate: 162,
  mezziDisponibili: 8
})

// Cantieri attivi
const cantieri = ref([
  { id: 1, nome: 'Tetto Villa Rossi', cliente: 'Famiglia Rossi', progresso: 75, scadenza: '15 Gen' },
  { id: 2, nome: 'Copertura Capannone', cliente: 'Industrie SpA', progresso: 45, scadenza: '28 Gen' },
  { id: 3, nome: 'Ristrutturazione Tetto', cliente: 'Studio Arch.', progresso: 20, scadenza: '10 Feb' }
])

// Materiali più utilizzati
const materialiTop = ref([
  { id: 1, nome: 'Travi in Legno Lamellare', quantita: 150, unita: 'm', color: 'bg-primary-500' },
  { id: 2, nome: 'Tavole Abete', quantita: 300, unita: 'm²', color: 'bg-accent-500' },
  { id: 3, nome: 'Isolante Termico', quantita: 200, unita: 'm²', color: 'bg-wood-medium' },
  { id: 4, nome: 'Viti per Legno', quantita: 5000, unita: 'pz', color: 'bg-gray-500' }
])

// Attività recenti
const attivitaRecenti = ref([
  {
    id: 1,
    descrizione: 'Nuovo cantiere aggiunto',
    dettaglio: 'Villa Bianchi - Via delle Rose 12',
    tempo: '2 ore fa',
    icon: PlusIcon,
    iconBg: 'bg-accent-500'
  },
  {
    id: 2,
    descrizione: 'Materiali spediti',
    dettaglio: 'Travi lamellare per Cantiere Via Roma',
    tempo: '4 ore fa',
    icon: ArrowRightIcon,
    iconBg: 'bg-primary-500'
  },
  {
    id: 3,
    descrizione: 'Fase completata',
    dettaglio: 'Struttura portante - Villa Rossi',
    tempo: '1 giorno fa',
    icon: CheckIcon,
    iconBg: 'bg-green-500'
  }
])

// Data e ora attuale
const currentTime = ref('')

onMounted(() => {
  const now = new Date()
  currentTime.value = now.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script> 