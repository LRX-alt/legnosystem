<template>
  <Teleport to="body">
    <div class="fixed inset-0 flex items-center justify-center pointer-events-none" style="z-index: 99998;">
              <TransitionGroup
        name="popup"
        tag="div"
        class="flex flex-col items-center space-y-3"
      >
        <div
          v-for="popup in activePopups"
          :key="popup.id"
          :class="[
            'popup-card pointer-events-auto transform transition-all duration-300 ease-out',
            getPopupClasses(popup.type)
          ]"
        >
          <!-- Popup Content Centrato -->
          <div class="flex flex-col items-center text-center space-y-3">
            <!-- Icon Semplice -->
            <div class="flex-shrink-0">
              <div :class="[
                'w-16 h-16 rounded-full flex items-center justify-center',
                getIconClasses(popup.type)
              ]">
                <!-- Icone SVG semplici -->
                <svg v-if="popup.type === 'success'" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="popup.type === 'error'" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="popup.type === 'warning'" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="popup.type === 'info'" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="space-y-1">
              <div class="font-semibold text-lg" :class="getTitleClasses(popup.type)">
                {{ popup.title }}
              </div>
              <div v-if="popup.message" class="text-sm whitespace-pre-line" :class="getMessageClasses(popup.type)">
                {{ popup.message }}
              </div>
            </div>

            <!-- Pulsanti Conferma (solo per popup di conferma) -->
            <div v-if="popup.isConfirm" class="flex space-x-3 mt-4">
              <button 
                @click="popup.onCancel && popup.onCancel()"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Annulla
              </button>
              <button 
                @click="popup.onConfirm && popup.onConfirm()"
                class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Conferma
              </button>
            </div>
          </div>
          
          <!-- Progress Bar (non mostrare per popup di conferma) -->
          <div v-if="!popup.isConfirm" class="mt-4 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all ease-linear"
              :class="getProgressClasses(popup.type)"
              :style="`width: 100%; animation: popup-progress ${popup.duration}ms linear forwards;`"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { usePopup } from '@/composables/usePopup'

const { activePopups, removePopup } = usePopup()

// Debug per verificare la reattività
console.log('📦 PopupContainer montato, popup attivi:', activePopups.value.length)
console.log('📦 DOM elemento PopupContainer creato e attivo')

// Popup di test fisso per debug - TEMPORANEAMENTE DISABILITATO
// const testPopup = {
//   id: 999,
//   type: 'success',
//   title: 'Test Visibilità',
//   message: 'Se vedi questo, il sistema funziona!',
//   icon: '🧪',
//   visible: true
// }

// activePopups.value.push(testPopup)
console.log('🧪 Popup di test temporaneamente disabilitato per debug template')

// Watcher per debug
watch(activePopups, (newPopups) => {
  console.log('🔄 Popup array cambiato:', newPopups.length, newPopups)
}, { deep: true, immediate: true })

const getPopupClasses = (type) => {
  return 'popup-card'
}

const getIconClasses = (type) => {
  const classes = {
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
    warning: 'bg-orange-100 text-orange-600',
    info: 'bg-blue-100 text-blue-600'
  }
  return classes[type] || classes.success
}

const getTitleClasses = (type) => {
  const classes = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-orange-800',
    info: 'text-blue-800'
  }
  return classes[type] || classes.success
}

const getMessageClasses = (type) => {
  return 'text-gray-600'
}

const getProgressClasses = (type) => {
  const classes = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500'
  }
  return classes[type] || classes.success
}
</script>

<style scoped>
.popup-card {
  min-width: 320px;
  max-width: 400px;
  width: auto;
  padding: 24px;
  border-radius: 16px;
  background: white;
  border: none;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Gli stili dei colori ora sono gestiti dalle classi delle icone */

/* Animazioni */
.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s ease-out;
}

.popup-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.popup-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.popup-move {
  transition: transform 0.3s ease-out;
}

/* Animazione Progress Bar */
@keyframes popup-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style> 