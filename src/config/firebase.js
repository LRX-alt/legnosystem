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
    
    // 🏗️ Gestione cantieri
    cantieri: 'cantieri',
    cantieriProgress: 'cantieriProgress',
    cantieriAttachments: 'cantieriAttachments',
    cantieri_allegati: 'cantieri_allegati',
    materiali_cantieri: 'materiali_cantieri',
    
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
    fornitori_ordini: 'fornitori_ordini',
    mezzi: 'mezzi',
    mezzi_manutenzione: 'mezzi_manutenzione',
    
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

export default app 