<template>
  <!-- Mobile Overlay -->
  <div v-if="isOpen" @click="$emit('close-sidebar')"
       class="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"></div>
  
  <!-- Sidebar -->
  <aside :class="[
    'fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
    'lg:translate-x-0 lg:static lg:inset-0',
    isOpen ? 'translate-x-0' : '-translate-x-full'
  ]">
    <div class="flex flex-col h-full">
      <!-- Mobile Header con pulsante chiudi -->
      <div class="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-display font-bold text-primary-800">Menu</h2>
          </div>
        </div>
        <button @click="$emit('close-sidebar')"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <span class="sr-only">Chiudi menu</span>
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <!-- Dashboard -->
        <router-link to="/" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
          <HomeIcon class="w-5 h-5" />
          <span>Dashboard</span>
        </router-link>

        <!-- Sezione Magazzino -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Magazzino</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/magazzino" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <CubeIcon class="w-5 h-5" />
              <span>Inventario</span>
            </router-link>
            <router-link to="/scorte" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <ExclamationTriangleIcon class="w-5 h-5" />
              <span>Gestione Scorte</span>
            </router-link>
            <router-link to="/sfridi" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <ArrowPathRoundedSquareIcon class="w-5 h-5" />
              <span>Sfridi</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Cantieri -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantieri</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/cantieri" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <BuildingOfficeIcon class="w-5 h-5" />
              <span>Gestione Cantieri</span>
            </router-link>
            <router-link to="/personale" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <UsersIcon class="w-5 h-5" />
              <span>Personale</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Fornitori -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fornitori</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/fornitori" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <TruckIcon class="w-5 h-5" />
              <span>Gestione Fornitori</span>
            </router-link>
            <router-link to="/mezzi" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <WrenchScrewdriverIcon class="w-5 h-5" />
              <span>Mezzi & Attrezzature</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Planning -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/calendario" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <CalendarDaysIcon class="w-5 h-5" />
              <span>Calendario & Planning</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Amministrazione -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amministrazione</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/fatturazione" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <DocumentTextIcon class="w-5 h-5" />
              <span>Fatturazione & Admin</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Clienti -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clienti</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/clienti" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <UserGroupIcon class="w-5 h-5" />
              <span>Anagrafica Clienti</span>
            </router-link>
            <router-link to="/preventivi" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <DocumentTextIcon class="w-5 h-5" />
              <span>Preventivi</span>
            </router-link>
          </div>
        </div>

        <!-- Sezione Analytics -->
        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reportistica</h3>
          <div class="mt-2 space-y-1">
            <router-link to="/analytics" @click="$emit('close-sidebar')" class="nav-link" active-class="active">
              <ChartBarIcon class="w-5 h-5" />
              <span>Analytics</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Footer della sidebar -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-medium">🌿</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">Legnosystem.bio</p>
            <p class="text-xs text-gray-500 truncate">v1.13.0</p>
          </div>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-400 leading-relaxed">
            Ideato e sviluppato da<br>
            <span class="font-medium text-primary-600">Di Furio Loris</span>
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {
  HomeIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowPathRoundedSquareIcon,
  BuildingOfficeIcon,
  UsersIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  XMarkIcon,
  TruckIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

// Props per controllare stato di apertura
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emit per comunicare con il componente padre
defineEmits(['close-sidebar'])
</script> 