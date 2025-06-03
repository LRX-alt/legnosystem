<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Mobile Menu Button + Logo -->
        <div class="flex items-center">
          <!-- Hamburger Menu - Solo Mobile -->
          <button @click="$emit('toggle-sidebar')"
                  class="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-3">
            <span class="sr-only">Apri menu</span>
            <Bars3Icon class="w-6 h-6" />
          </button>
          
          <!-- Logo e Brand -->
          <div class="flex-shrink-0 flex items-center">
            <!-- Logo Icon -->
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-display font-bold text-primary-800">Legnosystem.bio</h1>
              <p class="text-xs text-gray-500 leading-none hidden sm:block">Gestionale Aziendale</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Notifiche -->
          <button @click="showNotifications = !showNotifications" 
                  class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <BellIcon class="w-5 h-5 sm:w-6 sm:h-6" />
            <span v-if="unreadNotifications > 0" 
                  class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ unreadNotifications }}
            </span>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button @click="showUserMenu = !showUserMenu"
                    class="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div class="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs sm:text-sm font-medium">U</span>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-gray-900">Utente Admin</p>
                <p class="text-xs text-gray-500">Amministratore</p>
              </div>
              <ChevronDownIcon class="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            <!-- User Dropdown -->
            <div v-if="showUserMenu" 
                 class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profilo</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Impostazioni</a>
              <hr class="my-1">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Panel - Mobile Optimized -->
    <div v-if="showNotifications" class="absolute top-16 right-2 sm:right-4 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div class="p-3 sm:p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900">Notifiche</h3>
      </div>
      <div class="max-h-64 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-sm">
          Nessuna notifica
        </div>
        <div v-for="notification in notifications" :key="notification.id" 
             class="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50">
          <p class="text-sm text-gray-900">{{ notification.message }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { BellIcon, ChevronDownIcon, Bars3Icon } from '@heroicons/vue/24/outline'

// Emit per comunicare con il componente padre
defineEmits(['toggle-sidebar'])

const showNotifications = ref(false)
const showUserMenu = ref(false)
const unreadNotifications = ref(3)

const notifications = ref([
  { id: 1, message: 'Scorte legno di quercia sotto il minimo', time: '5 min fa' },
  { id: 2, message: 'Cantiere Via Roma: fase completata', time: '1 ora fa' },
  { id: 3, message: 'Nuovo preventivo richiesto', time: '2 ore fa' }
])

// Chiudi dropdown quando si clicca fuori
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
})
</script> 