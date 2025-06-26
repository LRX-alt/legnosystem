<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading Screen durante inizializzazione -->
    <div v-if="authStore.loading && !authStore.authInitialized" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 flex items-center justify-center text-4xl mb-4 animate-bounce">
          🏗️
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Legnosystem</h2>
        <p class="text-gray-600">Inizializzazione in corso...</p>
        <div class="mt-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- App Layout (solo se autenticato e non su pagina auth) -->
    <div v-else-if="authStore.isAuthenticated && !isAuthRoute" class="min-h-screen flex flex-col">
      <!-- Header -->
      <AppHeader @toggle-sidebar="toggleSidebar" />
      
      <!-- Main Layout -->
      <div class="flex flex-1">
        <!-- Sidebar -->
        <AppSidebar :is-open="sidebarOpen" @close-sidebar="closeSidebar" />
        
        <!-- Main Content -->
        <main class="flex-1 lg:ml-64 flex flex-col">
          <div class="p-4 sm:p-6 flex-1">
            <router-view />
          </div>
          <AppFooter />
        </main>
      </div>
    </div>

    <!-- Auth Layout (pagine di login/register) -->
    <div v-else class="min-h-screen">
      <router-view />
    </div>
    
    <!-- Toast Notifications -->
    <ToastNotification />
    
    <!-- Popup Notifications -->
    <PopupContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastNotification from './components/ToastNotification.vue'
import PopupContainer from './components/PopupContainer.vue'

// Stores
const authStore = useAuthStore()
const route = useRoute()

// Stato sidebar mobile
const sidebarOpen = ref(false)

// Computed
const isAuthRoute = computed(() => {
  return route.path === '/auth' || route.path === '/login' || route.path === '/register'
})

// Funzioni per gestire la sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Chiudi sidebar su resize a desktop
const handleResize = () => {
  if (window.innerWidth >= 1024) { // lg breakpoint
    sidebarOpen.value = false
  }
}

// Inizializzazione autenticazione
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  
  // Inizializza l'autenticazione Firebase
  await authStore.initializeAuth()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
