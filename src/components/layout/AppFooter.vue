<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <!-- Left side - Company info -->
        <div class="flex items-center space-x-4">
          <img 
            :src="logoLegnosystem" 
            alt="Legno System Logo" 
            class="w-8 h-8 rounded object-contain"
          />
          <div class="text-sm text-gray-600">
            <p class="font-medium">&copy; {{ currentYear }} Legno System</p>
            <p class="text-xs">Abitare in natura dal 1959</p>
          </div>
        </div>

        <!-- Center - System info -->
        <div class="text-center text-sm text-gray-500">
          <p>Sistema di gestione aziendale</p>
          <p class="text-xs">v{{ version }} • Ambiente {{ environment }}</p>
        </div>

        <!-- Right side - Developer credit -->
        <div class="text-right text-sm text-gray-500">
          <p class="text-xs">Ideato e sviluppato da</p>
          <p class="font-medium text-green-600">Loris Di Furio</p>
        </div>
      </div>

      <!-- Additional info on small screens -->
      <div class="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 sm:hidden">
        <p>Versione {{ version }} • Ambiente {{ environment }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import appPkg from '../../../package.json'
import logoLegnosystem from '@/assets/logo legnosystem.avif'

// Current year for copyright
const currentYear = new Date().getFullYear()

// Version and environment info
const version = computed(() => {
  return import.meta.env.VITE_APP_VERSION || appPkg.version || '2.20.0'
})

const environment = computed(() => {
  return import.meta.env.MODE === 'development' ? 'Sviluppo' : 'Produzione'
})
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  footer {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style> 