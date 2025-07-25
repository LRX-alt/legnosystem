import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Firebase initialization
import { useAuthStore } from './stores/auth'
import { useFirestoreStore } from './stores/firestore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Mount the app immediately
app.mount('#app')

// Initialize Firebase Auth in the background
// The router guard will handle redirection based on auth state.
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  console.log('🔥 Firebase Auth inizializzato')
  
  // 🧪 DEBUG: Esponi store globalmente per testing in console
  if (import.meta.env.MODE === 'development') {
    window.debugStores = {
      auth: authStore,
      firestore: useFirestoreStore()
    }
    console.log('🧪 Debug stores disponibili in window.debugStores')
    
    // Test connessione Firestore solo in development
    if (import.meta.env.DEV) {
      console.log('🧪 Testando connessione Firestore...')
      setTimeout(() => {
        console.log('🧪 Testando connessione Firestore...')
        window.debugStores.firestore.testFirestoreConnection()
          .then(result => console.log('✅ Firestore test:', result))
          .catch(err => console.error('❌ Firestore test failed:', err))
      }, 2000)
      
      // Carica strumenti di test per il controllo coerenza
      import('./utils/testCoherence.js').catch(console.error)
      import('./utils/quickFix.js').catch(console.error)
    }
  }
}).catch((error) => {
  console.error('❌ Errore inizializzazione Firebase Auth:', error)
})
