// Firebase Configuration per Legnosystem.bio
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAnalytics } from 'firebase/analytics'

// Configurazione Firebase - DOVETE SOSTITUIRE CON LE VOSTRE CREDENZIALI
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Verifica che tutte le variabili d'ambiente siano configurate
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
if (missingVars.length > 0) {
  console.error('🔥 Firebase: Variabili d\'ambiente mancanti:', missingVars)
  console.error('Consulta il README per le istruzioni di configurazione')
}

// Inizializza Firebase
const app = initializeApp(firebaseConfig)

// Inizializza i servizi Firebase
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app, 'europe-west1') // Regione Europa per GDPR
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Configurazione emulatori per sviluppo locale
if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectAuthEmulator(auth, 'http://localhost:9099')
    if (storage) {
      connectStorageEmulator(storage, 'localhost', 9199)
    }
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('🔥 Firebase Emulators connessi')
  } catch (error) {
    console.warn('⚠️ Alcuni emulatori potrebbero essere già connessi:', error.message)
  }
}

// Configurazione Firestore
export const firestoreConfig = {
  // Collezioni principali
  collections: {
    // 👥 Gestione utenti e autenticazione
    users: 'users',
    userProfiles: 'userProfiles',
    registrationRequests: 'registrationRequests',
    
    // 🏗️ Gestione cantieri
    cantieri: 'cantieri',
    cantieriProgress: 'cantieriProgress',
    cantieriAllegati: 'cantieri_allegati',
    materialiCantieri: 'materiali_cantieri',
    
    // 👤 Gestione clienti
    clienti: 'clienti',
    clientiContacts: 'clientiContacts',
    
    // 📋 Gestione preventivi e fatturazione
    preventivi: 'preventivi',
    fatture: 'fatture',
    
    // 📦 Gestione magazzino
    materiali: 'materiali',
    materialiMovimenti: 'materialiMovimenti',
    scorte: 'scorte',
    
    // 👥 Gestione personale
    dipendenti: 'dipendenti',
    timesheet: 'timesheet',
    presenze: 'presenze',
    
    // 🚚 Gestione fornitori e mezzi
    fornitori: 'fornitori',
    fornitoriOrdini: 'fornitori_ordini',
    mezzi: 'mezzi',
    mezziManutenzione: 'mezzi_manutenzione',
    
    // 📊 Analytics e reporting
    analytics: 'analytics',
    reports: 'reports',
    
    // 🔔 Sistema notifiche
    notifications: 'notifications',
    
    // ⚙️ Configurazioni sistema
    settings: 'settings',
    logs: 'logs'
  },
  
  // Configurazioni di sicurezza
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
    maxBatchSize: 500
  }
}

// Storage paths
export const storagePaths = {
  // 📁 Allegati cantieri
  cantieriAttachments: 'cantieri/{cantiereId}/attachments',
  cantieriPhotos: 'cantieri/{cantiereId}/photos',
  cantieriDocuments: 'cantieri/{cantiereId}/documents',
  
  // 📁 Allegati materiali
  materialiAttachments: 'materiali/{materialeId}/attachments',
  materialiCertificates: 'materiali/{materialeId}/certificates',
  materialiFatture: 'materiali/{materialeId}/fatture',
  
  // 📁 Documenti aziendali
  preventivi: 'preventivi/{preventivoId}',
  fatture: 'fatture/{fatturaId}',
  
  // 📁 Documenti dipendenti
  dipendenti: 'dipendenti/{dipendenteId}',
  
  // 📁 Avatar e profili
  avatars: 'users/{userId}/avatar',
  
  // 📁 Backup
  backups: 'backups/{date}'
}

// 👥 Configurazione ruoli e permessi
export const rolesConfig = {
  roles: {
    admin: {
      label: '🔧 Amministratore',
      level: 100,
      permissions: ['*'] // Tutti i permessi
    },
    manager: {
      label: '👔 Manager',
      level: 80,
      permissions: [
        'manage_cantieri',
        'manage_clienti',
        'manage_fornitori',
        'manage_materiali',
        'manage_dipendenti',
        'view_analytics',
        'view_financials'
      ]
    },
    capo_cantiere: {
      label: '👷‍♂️ Capo Cantiere',
      level: 60,
      permissions: [
        'manage_cantieri',
        'view_clienti',
        'view_fornitori',
        'view_materiali',
        'view_dipendenti'
      ]
    },
    amministrativo: {
      label: '📋 Amministrativo',
      level: 40,
      permissions: [
        'view_cantieri',
        'view_clienti',
        'view_fornitori',
        'manage_fatture',
        'view_financials'
      ]
    },
    employee: {
      label: '👷 Operaio',
      level: 20,
      permissions: [
        'view_cantieri',
        'view_materiali'
      ]
    },
    user: {
      label: '👤 Utente Base',
      level: 10,
      permissions: [
        'view_profile'
      ]
    }
  },
  
  // Definizione dettagliata dei permessi
  permissions: {
    // Cantieri
    'manage_cantieri': {
      label: 'Gestione Cantieri',
      description: 'Permette di creare, modificare ed eliminare i cantieri'
    },
    'view_cantieri': {
      label: 'Visualizza Cantieri',
      description: 'Permette di visualizzare i cantieri'
    },
    
    // Clienti
    'manage_clienti': {
      label: 'Gestione Clienti',
      description: 'Permette di creare, modificare ed eliminare i clienti'
    },
    'view_clienti': {
      label: 'Visualizza Clienti',
      description: 'Permette di visualizzare i clienti'
    },
    
    // Fornitori
    'manage_fornitori': {
      label: 'Gestione Fornitori',
      description: 'Permette di creare, modificare ed eliminare i fornitori'
    },
    'view_fornitori': {
      label: 'Visualizza Fornitori',
      description: 'Permette di visualizzare i fornitori'
    },
    
    // Materiali
    'manage_materiali': {
      label: 'Gestione Materiali',
      description: 'Permette di creare, modificare ed eliminare i materiali'
    },
    'view_materiali': {
      label: 'Visualizza Materiali',
      description: 'Permette di visualizzare i materiali'
    },
    
    // Dipendenti
    'manage_dipendenti': {
      label: 'Gestione Dipendenti',
      description: 'Permette di gestire i dipendenti e le presenze'
    },
    'view_dipendenti': {
      label: 'Visualizza Dipendenti',
      description: 'Permette di visualizzare i dipendenti'
    },
    
    // Fatturazione
    'manage_fatture': {
      label: 'Gestione Fatture',
      description: 'Permette di creare e gestire le fatture'
    },
    'view_fatture': {
      label: 'Visualizza Fatture',
      description: 'Permette di visualizzare le fatture'
    },
    
    // Analytics e Report
    'view_analytics': {
      label: 'Visualizza Analytics',
      description: 'Permette di visualizzare le statistiche e i report'
    },
    'view_financials': {
      label: 'Visualizza Dati Finanziari',
      description: 'Permette di visualizzare i dati finanziari'
    }
  }
}

export default app 