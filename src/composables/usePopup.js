import { ref, nextTick } from 'vue'

// Store globale per i popup - deve essere fuori dalla funzione per essere condiviso
const activePopups = ref([])
let popupIdCounter = 0

const createPopup = (config) => {
  console.log('🚀 Creazione popup:', config) // Debug
  
  const popup = {
    id: ++popupIdCounter,
    type: config.type || 'success',
    title: config.title || '',
    message: config.message || '',
    icon: config.icon || getDefaultIcon(config.type || 'success'),
    duration: config.duration || 2000,
    visible: false,
    isConfirm: config.isConfirm || false,
    onConfirm: config.onConfirm || null,
    onCancel: config.onCancel || null
  }
  
  // Aggiungi popup
  popup.visible = true // Rendi visibile immediatamente
  activePopups.value.push(popup)
  console.log('📝 Popup aggiunto. Totali:', activePopups.value.length) // Debug
  
  // Auto-rimozione dopo la durata specificata (solo se non è un popup di conferma)
  if (!popup.isConfirm && popup.duration > 0) {
    setTimeout(() => {
      removePopup(popup.id)
    }, popup.duration)
  }
  
  return popup.id
}

const removePopup = (popupId) => {
  console.log('🗑️ Rimozione popup:', popupId) // Debug
  
  const index = activePopups.value.findIndex(p => p.id === popupId)
  if (index !== -1) {
    // Anima l'uscita
    activePopups.value[index].visible = false
    
    // Rimuovi dal DOM dopo l'animazione
    setTimeout(() => {
      activePopups.value.splice(index, 1)
      console.log('🧹 Popup rimosso. Rimanenti:', activePopups.value.length) // Debug
    }, 300)
  }
}

const getDefaultIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || '✅'
}

export function usePopup() {
  
  const success = (title, message, duration = 2000) => {
    console.log('🎉 Success popup chiamato:', { title, message }) // Debug
    return createPopup({
      type: 'success',
      title,
      message,
      icon: '🎉',
      duration
    })
  }
  
  const error = (title, message, duration = 3000) => {
    console.log('❌ Error popup chiamato:', { title, message }) // Debug
    return createPopup({
      type: 'error', 
      title,
      message,
      icon: '❌',
      duration
    })
  }
  
  const warning = (title, message, duration = 2500) => {
    console.log('⚠️ Warning popup chiamato:', { title, message }) // Debug
    return createPopup({
      type: 'warning',
      title, 
      message,
      icon: '⚠️',
      duration
    })
  }
  
  const info = (title, message, duration = 2000) => {
    console.log('ℹ️ Info popup chiamato:', { title, message }) // Debug
    return createPopup({
      type: 'info',
      title,
      message, 
      icon: 'ℹ️',
      duration
    })
  }
  
  // Funzione di conferma che restituisce una Promise
  const confirm = (title, message = '') => {
    console.log('❓ Confirm popup chiamato:', { title, message }) // Debug
    return new Promise((resolve) => {
      const popupId = createPopup({
        type: 'warning',
        title,
        message,
        icon: '❓',
        duration: 0, // Non auto-dismiss per popup di conferma
        isConfirm: true,
        onConfirm: () => {
          removePopup(popupId)
          resolve(true)
        },
        onCancel: () => {
          removePopup(popupId)
          resolve(false)
        }
      })
    })
  }

  // Funzione di test per verificare che il sistema funzioni
  const test = () => {
    console.log('🧪 Test popup avviato')
    success('Test Popup', 'Questo è un test del sistema popup')
  }
  
  return {
    activePopups, // Store globale condiviso
    success,
    error,
    warning,
    info,
    confirm,
    removePopup,
    test
  }
} 