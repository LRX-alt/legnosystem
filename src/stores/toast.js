import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const addToast = ({
    title,
    message,
    type = 'info',
    duration = 5000,
    actions = []
  }) => {
    const id = Date.now() + Math.random()
    
    const toast = {
      id,
      title,
      message,
      type,
      actions
    }
    
    toasts.value.push(toast)
    
    // Auto-remove dopo la durata specificata
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    toasts.value = []
  }
  
  // Helper methods per diversi tipi di toast
  const success = (message, options = {}) => {
    return addToast({
      ...options,
      message,
      type: 'success'
    })
  }
  
  const error = (message, options = {}) => {
    return addToast({
      ...options,
      message,
      type: 'error',
      duration: 7000 // Errori durano di più
    })
  }
  
  const warning = (message, options = {}) => {
    return addToast({
      ...options,
      message,
      type: 'warning'
    })
  }
  
  const info = (message, options = {}) => {
    return addToast({
      ...options,
      message,
      type: 'info'
    })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}) 