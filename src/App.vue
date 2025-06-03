<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <!-- Main Layout -->
    <div class="flex">
      <!-- Sidebar -->
      <AppSidebar :is-open="sidebarOpen" @close-sidebar="closeSidebar" />
      
      <!-- Main Content -->
      <main class="flex-1 lg:ml-64">
        <div class="p-4 sm:p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'

// Stato sidebar mobile
const sidebarOpen = ref(false)

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

// Gestione resize
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
