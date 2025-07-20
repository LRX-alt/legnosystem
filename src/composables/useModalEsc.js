import { onMounted, onUnmounted } from 'vue'

export function useModalEsc(modalRefs, closeFunctions) {
  const handleEscKey = (event) => {
    if (event.key === 'Escape') {
      // Trova il primo modal aperto e lo chiude
      for (let i = 0; i < modalRefs.length; i++) {
        if (modalRefs[i].value) {
          closeFunctions[i]()
          break
        }
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleEscKey)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscKey)
  })
} 