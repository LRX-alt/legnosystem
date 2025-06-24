import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db, firestoreConfig } from '@/config/firebase'
import { useAuthStore } from './auth'

export const useFirestoreStore = defineStore('firestore', () => {
  // 📊 State
  const loading = ref(false)
  const error = ref(null)
  
  // 🏗️ Cantieri
  const cantieri = ref([])
  const cantieriProgress = ref({})
  
  // 👤 Clienti
  const clienti = ref([])
  
  // 📦 Magazzino
  const materiali = ref([])
  const materialiMovimenti = ref([])
  const scorte = ref([])

  
  // 👥 Personale
  const dipendenti = ref([])
  const timesheet = ref([])
  const presenze = ref([])
  
  // 🚚 Fornitori
  const fornitori = ref([])
  const fornitori_ordini = ref([])
  
  // 🚛 Mezzi
  const mezzi = ref([])
  const mezzi_manutenzione = ref([])
  
  // 📋 Documenti
  const preventivi = ref([])
  const fatture = ref([])
  
  // 🔔 Notifiche
  const notifications = ref([])
  
  // 📊 Computed
  const cantieriAttivi = computed(() => 
    cantieri.value.filter(c => ['in-corso', 'pianificato'].includes(c.stato))
  )
  
  const cantieriCompletati = computed(() => 
    cantieri.value.filter(c => c.stato === 'completato')
  )
  
  const dipendentiAttivi = computed(() => 
    dipendenti.value.filter(d => d.stato === 'attivo')
  )
  
  const materialiScorta = computed(() => 
    materiali.value.filter(m => m.quantita <= (m.scorta_minima || 10))
  )

  // 🔧 Metodi Generici
  
  /**
   * Crea un nuovo documento
   */
  const createDocument = async (collectionName, data) => {
    loading.value = true
    error.value = null
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      console.error(`Errore creazione documento in ${collectionName}:`, err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna un documento esistente
   */
  const updateDocument = async (collectionName, docId, data) => {
    loading.value = true
    error.value = null
    
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error(`Errore aggiornamento documento ${docId} in ${collectionName}:`, err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un documento
   */
  const deleteDocument = async (collectionName, docId) => {
    loading.value = true
    error.value = null
    
    try {
      await deleteDoc(doc(db, collectionName, docId))
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error(`Errore eliminazione documento ${docId} da ${collectionName}:`, err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica una collezione con filtri e ordinamento
   */
  const loadCollection = async (collectionName, filters = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = null) => {
    loading.value = true
    error.value = null
    
    try {
      let q = collection(db, collectionName)
      
      // Applica filtri
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value))
      })
      
      // Applica ordinamento
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection))
      }
      
      // Applica limite
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      const snapshot = await getDocs(q)
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: documents }
    } catch (err) {
      error.value = err.message
      console.error(`Errore caricamento collezione ${collectionName}:`, err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ascolta i cambiamenti in tempo reale di una collezione
   */
  const subscribeToCollection = (collectionName, callback, filters = []) => {
    let q = collection(db, collectionName)
    
    // Applica filtri
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value))
    })
    
    return onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(documents)
    }, (err) => {
      console.error(`Errore subscription ${collectionName}:`, err)
      error.value = err.message
    })
  }

  // 🏗️ Metodi Specifici per Cantieri
  
  const loadCantieri = async () => {
    const result = await loadCollection(firestoreConfig.collections.cantieri)
    if (result.success) {
      cantieri.value = result.data
    }
    return result
  }

  const createCantiere = async (cantiereData) => {
    const authStore = useAuthStore()
    
    const data = {
      ...cantiereData,
      createdBy: authStore.user?.uid,
      stato: cantiereData.stato || 'pianificato',
      progresso: 0,
      team: cantiereData.team || [],
      fasi: cantiereData.fasi || []
    }
    
    return await createDocument(firestoreConfig.collections.cantieri, data)
  }

  const updateCantiereProgress = async (cantiereId, progressData) => {
    const batch = writeBatch(db)
    
    // Aggiorna il cantiere
    const cantiereRef = doc(db, firestoreConfig.collections.cantieri, cantiereId)
    batch.update(cantiereRef, {
      progresso: progressData.nuovoProgresso,
      stato: progressData.nuovoProgresso === 100 ? 'completato' : 'in-corso',
      updatedAt: serverTimestamp()
    })
    
    // Salva lo storico del progresso
    const progressRef = doc(collection(db, firestoreConfig.collections.cantieriProgress))
    batch.set(progressRef, {
      cantiereId,
      ...progressData,
      createdAt: serverTimestamp()
    })
    
    try {
      await batch.commit()
      return { success: true }
    } catch (err) {
      console.error('Errore aggiornamento progresso cantiere:', err)
      return { success: false, error: err.message }
    }
  }

  // 👤 Metodi per Clienti
  
  const loadClienti = async () => {
    const result = await loadCollection(firestoreConfig.collections.clienti)
    if (result.success) {
      clienti.value = result.data
    }
    return result
  }

  const createCliente = async (clienteData) => {
    const data = {
      ...clienteData,
      numeroProgetti: 0,
      valoreTotale: 0,
      stato: 'attivo',
      iniziali: clienteData.nome.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
    }
    
    return await createDocument(firestoreConfig.collections.clienti, data)
  }

  // 📦 Metodi per Magazzino
  
  const loadMateriali = async () => {
    const result = await loadCollection(firestoreConfig.collections.materiali)
    if (result.success) {
      materiali.value = result.data
    }
    return result
  }

  const createMateriale = async (materialeData) => {
    return await createDocument(firestoreConfig.collections.materiali, materialeData)
  }

  const updateMaterialeQuantita = async (materialeId, quantitaDelta, movimento = 'manuale') => {
    const batch = writeBatch(db)
    
    // Aggiorna quantità materiale
    const materialeRef = doc(db, firestoreConfig.collections.materiali, materialeId)
    batch.update(materialeRef, {
      quantita: increment(quantitaDelta),
      updatedAt: serverTimestamp()
    })
    
    // Registra movimento
    const movimentoRef = doc(collection(db, firestoreConfig.collections.materialiMovimenti))
    batch.set(movimentoRef, {
      materialeId,
      quantita: quantitaDelta,
      tipo: quantitaDelta > 0 ? 'carico' : 'scarico',
      movimento,
      createdAt: serverTimestamp()
    })
    
    try {
      await batch.commit()
      return { success: true }
    } catch (err) {
      console.error('Errore aggiornamento quantità materiale:', err)
      return { success: false, error: err.message }
    }
  }

  // 👥 Metodi per Personale
  
  const loadDipendenti = async () => {
    const result = await loadCollection(firestoreConfig.collections.dipendenti)
    if (result.success) {
      dipendenti.value = result.data
    }
    return result
  }

  const createDipendente = async (dipendenteData) => {
    const data = {
      ...dipendenteData,
      stato: 'attivo',
      oreTotaliSettimana: 0,
      iniziali: dipendenteData.nome.charAt(0) + dipendenteData.cognome.charAt(0)
    }
    
    return await createDocument(firestoreConfig.collections.dipendenti, data)
  }

  const registraTimesheet = async (timesheetData) => {
    return await createDocument(firestoreConfig.collections.timesheet, timesheetData)
  }

  // 🚚 Metodi per Fornitori
  
  const loadFornitori = async () => {
    const result = await loadCollection(firestoreConfig.collections.fornitori)
    if (result.success) {
      fornitori.value = result.data
    }
    return result
  }

  const createFornitore = async (fornitoreData) => {
    return await createDocument(firestoreConfig.collections.fornitori, fornitoreData)
  }

  const loadMezzi = async () => {
    const result = await loadCollection(firestoreConfig.collections.mezzi)
    if (result.success) {
      mezzi.value = result.data
    }
    return result
  }

  // 🔔 Metodi per Notifiche
  
  const loadNotifications = async (userId) => {
    const filters = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'read', operator: '==', value: false }
    ]
    
    const result = await loadCollection(firestoreConfig.collections.notifications, filters, 'createdAt', 'desc', 50)
    if (result.success) {
      notifications.value = result.data
    }
    return result
  }

  const createNotification = async (notificationData) => {
    return await createDocument(firestoreConfig.collections.notifications, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    })
  }

  const markNotificationAsRead = async (notificationId) => {
    return await updateDocument(firestoreConfig.collections.notifications, notificationId, {
      read: true,
      readAt: serverTimestamp()
    })
  }

  // 📊 Metodi per Analytics
  
  const getAnalyticsData = async (dateRange = 30) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dateRange)
    
    try {
      // Carica dati paralleli
      const [cantieriData, materialiData, timesheetData] = await Promise.all([
        loadCollection(firestoreConfig.collections.cantieri, [
          { field: 'createdAt', operator: '>=', value: startDate }
        ]),
        loadCollection(firestoreConfig.collections.materialiMovimenti, [
          { field: 'createdAt', operator: '>=', value: startDate }
        ]),
        loadCollection(firestoreConfig.collections.timesheet, [
          { field: 'data', operator: '>=', value: startDate.toISOString().split('T')[0] }
        ])
      ])
      
      return {
        success: true,
        data: {
          cantieri: cantieriData.data || [],
          movimenti: materialiData.data || [],
          timesheet: timesheetData.data || []
        }
      }
    } catch (err) {
      console.error('Errore caricamento analytics:', err)
      return { success: false, error: err.message }
    }
  }

  // 🔄 Metodi per Migrazione Dati
  
  const migrateFromLocalStorage = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return { success: false, error: 'Utente non autenticato' }
    }
    
    loading.value = true
    
    try {
      const batch = writeBatch(db)
      let operations = 0
      const maxBatchSize = firestoreConfig.security.maxBatchSize
      
      // Migra cantieri
      const cantieriLS = JSON.parse(localStorage.getItem('legnosystem_cantieri') || '[]')
      for (const cantiere of cantieriLS) {
        const cantiereRef = doc(collection(db, firestoreConfig.collections.cantieri))
        batch.set(cantiereRef, {
          ...cantiere,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          migratedFrom: 'localStorage'
        })
        operations++
        
        if (operations >= maxBatchSize) {
          await batch.commit()
          operations = 0
        }
      }
      
      // Migra clienti
      const clientiLS = JSON.parse(localStorage.getItem('legnosystem_clienti') || '[]')
      for (const cliente of clientiLS) {
        const clienteRef = doc(collection(db, firestoreConfig.collections.clienti))
        batch.set(clienteRef, {
          ...cliente,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          migratedFrom: 'localStorage'
        })
        operations++
        
        if (operations >= maxBatchSize) {
          await batch.commit()
          operations = 0
        }
      }
      
      // Migra dipendenti
      const dipendentiLS = JSON.parse(localStorage.getItem('legnosystem_dipendenti') || '[]')
      for (const dipendente of dipendentiLS) {
        const dipendenteRef = doc(collection(db, firestoreConfig.collections.dipendenti))
        batch.set(dipendenteRef, {
          ...dipendente,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          migratedFrom: 'localStorage'
        })
        operations++
        
        if (operations >= maxBatchSize) {
          await batch.commit()
          operations = 0
        }
      }
      
      // Commit rimanenti operazioni
      if (operations > 0) {
        await batch.commit()
      }
      
      return { 
        success: true, 
        message: `Migrati ${cantieriLS.length} cantieri, ${clientiLS.length} clienti, ${dipendentiLS.length} dipendenti` 
      }
    } catch (err) {
      console.error('Errore migrazione da localStorage:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Test connessione Firestore
   */
  const testFirestoreConnection = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Test scrittura
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Test connessione Firestore',
        timestamp: serverTimestamp(),
        user: useAuthStore().user?.email || 'anonymous'
      })
      
      console.log('✅ Test scrittura Firestore OK - ID:', testDoc.id)
      
      // Test lettura
      const testRead = await getDoc(testDoc)
      if (testRead.exists()) {
        console.log('✅ Test lettura Firestore OK - Dati:', testRead.data())
      }
      
      // Pulizia - elimina documento di test
      await deleteDoc(testDoc)
      console.log('✅ Test eliminazione Firestore OK')
      
      return { success: true, message: 'Firestore funziona correttamente!' }
    } catch (err) {
      console.error('❌ Errore test Firestore:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,
    cantieri,
    cantieriProgress,
    clienti,
    materiali,
    materialiMovimenti,
    scorte,
    dipendenti,
    timesheet,
    presenze,
    fornitori,
    fornitori_ordini,
    mezzi,
    mezzi_manutenzione,
    preventivi,
    fatture,
    notifications,
    
    // Computed
    cantieriAttivi,
    cantieriCompletati,
    dipendentiAttivi,
    materialiScorta,
    
    // Metodi Generici
    createDocument,
    updateDocument,
    deleteDocument,
    loadCollection,
    subscribeToCollection,
    
    // Metodi Specifici
    loadCantieri,
    createCantiere,
    updateCantiereProgress,
    loadClienti,
    createCliente,
    loadMateriali,
    createMateriale,
    updateMaterialeQuantita,
    loadDipendenti,
    createDipendente,
    registraTimesheet,
    loadFornitori,
    createFornitore,
    loadMezzi,
    loadNotifications,
    createNotification,
    markNotificationAsRead,
    getAnalyticsData,
    migrateFromLocalStorage,
    testFirestoreConnection
  }
}) 