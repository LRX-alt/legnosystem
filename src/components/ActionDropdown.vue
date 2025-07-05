<template>
  <div class="relative inline-block text-left">
    <!-- Pulsante tre punti -->
    <button 
      ref="buttonRef"
      @click="toggleDropdown"
      class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
      :class="{ 'bg-gray-100': isOpen }"
    >
      <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="isOpen"
      class="origin-top-right fixed mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
      :style="dropdownStyle"
      @click.stop
    >
      <div class="py-1" role="menu">
        <button
          v-for="action in actions"
          :key="action.id"
          @click="handleAction(action)"
          :disabled="action.disabled"
          :class="[
            'flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150',
            action.disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : `text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${action.danger ? 'hover:bg-red-50 hover:text-red-900' : ''}`
          ]"
          role="menuitem"
        >
          <span class="mr-3 text-base">{{ action.icon }}</span>
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Overlay per chiudere dropdown -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  actions: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['action'])

// State
const isOpen = ref(false)
const buttonRef = ref(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Computed
const dropdownStyle = computed(() => {
  return {
    top: `${dropdownPosition.value.top}px`,
    left: `${dropdownPosition.value.left}px`
  }
})

// Methods
const calculateDropdownPosition = () => {
  if (!buttonRef.value) return
  
  const buttonRect = buttonRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Calcola la posizione del dropdown
  let top = buttonRect.bottom + 8 // 8px di margine
  let left = buttonRect.left
  
  // Controlla se il dropdown esce dal viewport in basso
  const dropdownHeight = 200 // Altezza stimata del dropdown
  if (top + dropdownHeight > viewportHeight) {
    top = buttonRect.top - dropdownHeight - 8 // Aprilo sopra il pulsante
  }
  
  // Controlla se il dropdown esce dal viewport a destra
  const dropdownWidth = 192 // 48 * 4 = 192px (w-48)
  if (left + dropdownWidth > viewportWidth) {
    left = buttonRect.right - dropdownWidth // Allinea a destra del pulsante
  }
  
  // Controlla se il dropdown esce dal viewport a sinistra
  if (left < 16) {
    left = 16 // Margine minimo dal bordo sinistro
  }
  
  dropdownPosition.value = { top, left }
}

const toggleDropdown = (event) => {
  if (!isOpen.value) {
    calculateDropdownPosition()
  }
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleAction = (action) => {
  if (action.disabled) return
  
  emit('action', action.id)
  closeDropdown()
}

// Chiude dropdown se si preme ESC
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Animazione per il dropdown */
.origin-top-right {
  transform-origin: top right;
  animation: dropdown-appear 0.15s ease-out;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 