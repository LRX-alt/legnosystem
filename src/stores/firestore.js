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
  const fatture = ref([])
  
  // 🔔 Notifiche
  const notifications = ref([])
  
  // 📊 Computed
  const cantieriAttivi = computed(() => 
    cantieri.value.filter(c => c.stato === 'in-corso' || c.stato === 'pianificato')
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
      // 🧹 Sanitizza i dati prima di inviarli a Firestore
      const sanitizedData = sanitizeFirestoreData(data)
      
      // 🔧 Debug mode ridotto - mostra solo se ci sono campi complessi
      const complexFields = Object.entries(sanitizedData)
        .filter(([key, value]) => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date))
        .map(([key]) => key)
      
      if (complexFields.length > 0) {
        console.log(`🔧 Create ${collectionName} - campi complessi:`, complexFields)
      }
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...sanitizedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      console.error(`Errore creazione documento in ${collectionName}:`, err)
      console.error('📋 Dati che causavano l\'errore:', JSON.stringify(data, null, 2))
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sanitizza i dati per evitare errori Firestore
   */
  const sanitizeFirestoreData = (data) => {
    const sanitized = {}
    
    Object.keys(data).forEach(key => {
      const value = data[key]
      
      // Salta valori undefined, null, o campi problematici
      if (value === undefined || value === null) return
      
      // Lista nera di campi che potrebbero causare problemi
      const blacklistedFields = ['isNew', 'isFromStock', '_id', '__v', 'constructor']
      if (blacklistedFields.includes(key)) return
      
      // Gestisce Date objects
      if (value instanceof Date) {
        sanitized[key] = value
        return
      }
      
      // Gestisce Timestamp/serverTimestamp
      if (value && typeof value === 'object' && value.constructor?.name === 'Timestamp') {
        sanitized[key] = value
        return
      }
      
      // Gestisce funzioni (le elimina)
      if (typeof value === 'function') {
        console.warn(`⚠️ Rimosso campo funzione "${key}"`)
        return
      }
      
      // Gestisce array - verifica che siano effettivamente array
      if (Array.isArray(value)) {
        // Sanitizza ricorsivamente gli elementi dell'array
        sanitized[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return sanitizeFirestoreData(item)
          }
          return item
        })
        return
      }
      
      // Se dovrebbe essere un array ma non lo è, convertilo
      if (['team', 'teamPresente', 'fasi', 'allegati', 'attivita', 'problemi'].includes(key) && !Array.isArray(value)) {
        sanitized[key] = value ? [value] : []
        return
      }
      
      // Gestisce oggetti semplici
      if (value !== null && typeof value === 'object') {
        // Verifica che non sia un oggetto CircularJSON o con riferimenti circolari
        try {
          JSON.stringify(value)
          // Ricorsione per oggetti nested
          const sanitizedObject = sanitizeFirestoreData(value)
          // Solo aggiunge se l'oggetto sanitizzato non è vuoto
          if (Object.keys(sanitizedObject).length > 0) {
            sanitized[key] = sanitizedObject
          }
        } catch (e) {
          console.warn(`⚠️ Rimosso campo con riferimenti circolari "${key}":`, e.message)
          return
        }
        return
      }
      
      // Valori primitivi (string, number, boolean)
      if (['string', 'number', 'boolean'].includes(typeof value)) {
        sanitized[key] = value
        return
      }
      
      // Se arriviamo qui, il tipo non è supportato
      console.warn(`⚠️ Rimosso campo tipo non supportato "${key}":`, typeof value, value)
    })
    
    return sanitized
  }

  /**
   * Aggiorna un documento esistente
   */
  const updateDocument = async (collectionName, docId, data) => {
    loading.value = true
    error.value = null
    
    // 🚨 IMPORTANTE: Converti sempre docId in stringa
    const stringDocId = String(docId)
    
    let sanitizedData = null // Sposta la dichiarazione fuori dal try
    
    try {
      // Sanitizza i dati prima dell'update
      sanitizedData = sanitizeFirestoreData(data)
      
      // 🔧 Debug mode ridotto - mostra solo se ci sono campi complessi
      const complexFields = Object.entries(sanitizedData)
        .filter(([key, value]) => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date))
        .map(([key]) => key)
      
      if (complexFields.length > 0) {
        console.log(`🔧 Update ${collectionName}/${stringDocId} - campi complessi:`, complexFields)
      }
      
      await updateDoc(doc(db, collectionName, stringDocId), {
        ...sanitizedData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error(`❌ Errore aggiornamento documento ${stringDocId} in ${collectionName}:`, err)
      console.error('📋 Dati che causavano l\'errore:', JSON.stringify(data, null, 2))
      if (sanitizedData) {
        console.error('🧹 Dati sanitizzati che causavano l\'errore:', JSON.stringify(sanitizedData, null, 2))
      }
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
      
      // Applica filtri con supporto per entrambi i formati
      filters.forEach(filter => {
        // Supporta sia formato array che formato oggetto
        if (Array.isArray(filter)) {
          // Formato array: ['field', 'operator', 'value']
          q = query(q, where(filter[0], filter[1], filter[2]))
        } else {
          // Formato oggetto: { field, operator, value }
          q = query(q, where(filter.field, filter.operator, filter.value))
        }
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
    
    // Applica filtri con supporto per entrambi i formati
    filters.forEach(filter => {
      // Supporta sia formato array che formato oggetto
      if (Array.isArray(filter)) {
        // Formato array: ['field', 'operator', 'value']
        q = query(q, where(filter[0], filter[1], filter[2]))
      } else {
        // Formato oggetto: { field, operator, value }
        q = query(q, where(filter.field, filter.operator, filter.value))
      }
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
      // Assicura che tutti i dipendenti abbiano il campo oreTotaliSettimana inizializzato
      dipendenti.value = result.data.map(dipendente => ({
        ...dipendente,
        oreTotaliSettimana: dipendente.oreTotaliSettimana || 0
      }))
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

  const loadTimesheet = async () => {
    const result = await loadCollection(firestoreConfig.collections.timesheet)
    if (result.success) {
      timesheet.value = result.data
    }
    return result
  }

  const registraTimesheet = async (timesheetData) => {
    const result = await createDocument(firestoreConfig.collections.timesheet, timesheetData)
    
    // Se la creazione è riuscita, aggiorna la lista locale
    if (result.success) {
      // Ricarica i timesheet per avere i dati aggiornati
      await loadTimesheet()
    }
    
    return result
  }

  const loadPresenzeForDate = async (dateStr) => {
    try {
      const q = query(collection(db, 'presenze'), where('data', '==', dateStr))
      const querySnapshot = await getDocs(q)
      const presenzeResult = []
      querySnapshot.forEach((doc) => {
        presenzeResult.push({ id: doc.id, ...doc.data() })
      })
      // Aggiorna lo stato globale se necessario, ma restituisce i dati filtrati
      presenze.value = presenzeResult
      return { success: true, data: presenzeResult }
    } catch (err) {
      console.error(`Errore caricamento presenze per la data ${dateStr}:`, err)
      return { success: false, error: err.message }
    }
  }

  const savePresenza = async (presenzaData) => {
    try {
      if (presenzaData.id) {
        // Aggiorna
        const { id, ...dataToUpdate } = presenzaData
        await updateDocument('presenze', id, dataToUpdate)
        return { success: true, id }
      } else {
        // Crea
        const result = await createDocument('presenze', presenzaData)
        return result
      }
    } catch (err) {
      console.error('Errore salvataggio presenza:', err)
      return { success: false, error: err.message }
    }
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

  // 📦 Metodi per Materiali Cantieri (Nuovi per migrare da localStorage)
  
  const loadMaterialiCantiere = async (cantiereId) => {
    const filters = [{ field: 'cantiereId', operator: '==', value: cantiereId }]
    return await loadCollection('materiali_cantieri', filters)
  }

  const createMaterialeCantiere = async (cantiereId, materialeData) => {
    const data = {
      ...materialeData,
      cantiereId,
      stato: 'richiesto',
      dataRichiesta: serverTimestamp()
    }
    return await createDocument('materiali_cantieri', data)
  }

  const updateMaterialeCantiere = async (materialeId, updateData) => {
    console.log('🔧 INIZIO updateMaterialeCantiere:', materialeId, updateData)
    
    // 🚨 IMPORTANTE: Converti ID in stringa se è un numero
    const docId = String(materialeId)
    console.log('🔍 ID originale:', materialeId, 'tipo:', typeof materialeId)
    console.log('🔍 ID convertito:', docId, 'tipo:', typeof docId)
    
    // MODALITÀ DEBUG: Test diretto senza sanitizzazione prima
    const essentialFields = {
      nome: String(updateData.nome || ''),
      quantitaRichiesta: Number(updateData.quantitaRichiesta || 0),
      quantitaUtilizzata: Number(updateData.quantitaUtilizzata || 0),
      stato: String(updateData.stato || 'ordinato')
    }
    
    console.log('🧪 Test diretto senza sanitizzazione:', essentialFields)
    
    try {
      // Test diretto usando updateDoc senza sanitizzazione
      console.log('🧪 Test DIRETTO updateDoc con ID stringa...')
      
      await updateDoc(doc(db, 'materiali_cantieri', docId), {
        ...essentialFields,
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Test DIRETTO riuscito! Il problema era l\'ID numerico.')
      return { success: true }
      
    } catch (directErr) {
      console.error('❌ Errore anche con test DIRETTO (ID convertito):', directErr)
      
      // Fallback: prova con la funzione normale usando ID stringa
      console.log('🔄 Fallback con updateDocument e ID stringa...')
      return await updateDocument('materiali_cantieri', docId, essentialFields)
    }
  }

  const deleteMaterialeCantiere = async (materialeId) => {
    return await deleteDocument('materiali_cantieri', materialeId)
  }

  // 📎 Metodi per Allegati (Nuovi per migrare da localStorage)
  
  const loadAllegatiCantiere = async (cantiereId) => {
    const filters = [{ field: 'cantiereId', operator: '==', value: cantiereId }]
    return await loadCollection('cantieri_allegati', filters)
  }

  const createAllegatoCantiere = async (cantiereId, allegatoData) => {
    const data = {
      ...allegatoData,
      cantiereId,
      uploadedAt: serverTimestamp()
    }
    return await createDocument('cantieri_allegati', data)
  }

  const deleteAllegatoCantiere = async (allegatoId) => {
    return await deleteDocument('cantieri_allegati', allegatoId)
  }

  // 📎 Metodi per Allegati Materiali (Nuovi per migrare da localStorage)
  
  const loadAllegatiMateriale = async (materialeId) => {
    try {
      const q = query(
        collection(db, 'materiali_allegati'),
        where('materialeId', '==', materialeId),
        orderBy('uploadedAt', 'desc')  // Usiamo uploadedAt invece di createdAt
      )
      
      const snapshot = await getDocs(q)
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: documents }
    } catch (err) {
      console.error('Errore caricamento allegati materiale:', err)
      return { success: false, error: err.message }
    }
  }

  const createAllegatoMateriale = async (materialeId, allegatoData) => {
    const data = {
      ...allegatoData,
      materialeId,
      uploadedAt: serverTimestamp()
    }
    return await createDocument('materiali_allegati', data)
  }

  const deleteAllegatoMateriale = async (allegatoId) => {
    return await deleteDocument('materiali_allegati', allegatoId)
  }

  // 📝 Metodi per Giornale Cantiere (Nuovi)
  
  const loadGiornaleCantiere = async (cantiereId) => {
    const filters = [{ field: 'cantiereId', operator: '==', value: cantiereId }]
    // Disabilito ordinamento per evitare errore indice Firestore
    return await loadCollection('giornale_cantiere', filters, null)
  }

  const createRegistrazioneGiornale = async (cantiereId, registrazioneData) => {
    // 🧹 Sanitizza specificamente i dati del giornale cantiere
    const sanitizedData = {}
    
    // Copia solo i campi validi, convertendo undefined in null o array vuoti
    Object.keys(registrazioneData).forEach(key => {
      const value = registrazioneData[key]
      
      if (value === undefined) {
        console.warn(`⚠️ Campo undefined rimosso: ${key}`)
        return
      }
      
      if (value === null) {
        return // Salta anche i null
      }
      
      // Gestisce array specifici del giornale cantiere
      if (['teamPresente', 'team', 'attivita', 'problemi', 'allegati'].includes(key)) {
        sanitizedData[key] = Array.isArray(value) ? value : (value ? [value] : [])
        return
      }
      
      // Gestisce oggetti come meteo
      if (key === 'meteo' && typeof value === 'object') {
        const meteoSanitized = {}
        Object.keys(value).forEach(meteoKey => {
          if (value[meteoKey] !== undefined && value[meteoKey] !== null) {
            meteoSanitized[meteoKey] = value[meteoKey]
          }
        })
        if (Object.keys(meteoSanitized).length > 0) {
          sanitizedData[key] = meteoSanitized
        }
        return
      }
      
      // Copia tutti gli altri valori validi
      sanitizedData[key] = value
    })
    
    const data = {
      ...sanitizedData,
      cantiereId,
      createdAt: serverTimestamp()
    }
    
    console.log('🔧 Giornale cantiere - dati originali:', JSON.stringify(registrazioneData, null, 2))
    console.log('🧹 Giornale cantiere - dati sanitizzati:', JSON.stringify(data, null, 2))
    
    return await createDocument('giornale_cantiere', data)
  }

  const updateRegistrazioneGiornale = async (registrazioneId, updateData) => {
    return await updateDocument('giornale_cantiere', registrazioneId, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  }

  const deleteRegistrazioneGiornale = async (registrazioneId) => {
    return await deleteDocument('giornale_cantiere', registrazioneId)
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

  /**
   * Crea notifiche per tutti gli utenti di un certo ruolo
   * Esempio: createNotificationsForRole('admin', { type, message, meta })
   */
  const createNotificationsForRole = async (role, baseNotificationData) => {
    try {
      const adminsSnap = await getDocs(
        query(
          collection(db, firestoreConfig.collections.userProfiles),
          where('role', '==', role)
        )
      )
      if (adminsSnap.empty) {
        console.warn(`Nessun utente con ruolo ${role} trovato per notifica`)
        return { success: false, error: `Nessun utente con ruolo ${role}` }
      }
      const tasks = adminsSnap.docs.map(docSnap => {
        const userId = docSnap.id
        return createDocument(firestoreConfig.collections.notifications, {
          ...baseNotificationData,
          userId,
          recipients: [role],
          read: false,
          createdAt: serverTimestamp()
        })
      })
      await Promise.all(tasks)
      return { success: true }
    } catch (err) {
      console.error('Errore creazione notifiche per ruolo:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Sottoscrizione realtime alle notifiche dell'utente
   */
  const subscribeToNotifications = (userId) => {
    try {
      const q = query(
        collection(db, firestoreConfig.collections.notifications),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      )
      return onSnapshot(q, (snapshot) => {
        notifications.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      }, (err) => {
        console.error('Errore subscribeToNotifications:', err)
      })
    } catch (err) {
      console.error('Errore inizializzazione subscribeToNotifications:', err)
      return () => {}
    }
  }

  /**
   * Restituisce la lista degli utenti admin
   */
  const getAdmins = async () => {
    try {
      const snap = await getDocs(
        query(
          collection(db, firestoreConfig.collections.userProfiles),
          where('role', '==', 'admin')
        )
      )
      return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) }
    } catch (err) {
      console.error('Errore getAdmins:', err)
      return { success: false, error: err.message, data: [] }
    }
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
    if (!import.meta.env.DEV) {
      return { success: true, message: 'Test skipped in production' }
    }

    try {
      // Test scrittura
      const testRef = await addDoc(collection(db, 'test'), {
        user: 'admin@legnosystem.bio',
        timestamp: serverTimestamp(),
        message: 'Test connessione Firestore'
      })
      console.log('✅ Test scrittura Firestore OK - ID:', testRef.id)

      // Test lettura
      const testDoc = await getDoc(testRef)
      console.log('✅ Test lettura Firestore OK - Dati:', testDoc.data())

      // Test eliminazione
      await deleteDoc(testRef)
      console.log('✅ Test eliminazione Firestore OK')

      return { success: true, message: 'Firestore funziona correttamente!' }
    } catch (error) {
      console.error('❌ Test Firestore fallito:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 🔧 FUNZIONI MANCANTI CRITICHE - Implementate per risolvere errori sistema materiali
   */
  
  /**
   * Ottiene un singolo materiale dal magazzino per ID
   */
  const getMateriale = async (materialeId) => {
    try {
      const materialeRef = doc(db, firestoreConfig.collections.materiali, materialeId)
      const materialeSnap = await getDoc(materialeRef)
      
      if (materialeSnap.exists()) {
        return {
          success: true,
          data: {
            id: materialeSnap.id,
            ...materialeSnap.data()
          }
        }
      } else {
        return {
          success: false,
          error: `Materiale con ID ${materialeId} non trovato`
        }
      }
    } catch (err) {
      console.error(`Errore caricamento materiale ${materialeId}:`, err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * Ottiene un singolo materiale cantiere per ID  
   */
  const getMaterialeCantiere = async (materialeCantiereid) => {
    try {
      const materialeCRef = doc(db, 'materiali_cantieri', materialeCantiereid)
      const materialeCSnap = await getDoc(materialeCRef)
      
      if (materialeCSnap.exists()) {
        return {
          success: true,
          data: {
            id: materialeCSnap.id,
            ...materialeCSnap.data()
          }
        }
      } else {
        return {
          success: false,
          error: `Materiale cantiere con ID ${materialeCantiereid} non trovato`
        }
      }
    } catch (err) {
      console.error(`Errore caricamento materiale cantiere ${materialeCantiereid}:`, err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * Verifica se un cantiere ha dipendenze prima dell'eliminazione
   */
  const checkCantiereDependencies = async (cantiereId) => {
    try {
      // Verifica materiali associati
      const materialiResult = await loadCollection('materiali_cantieri', [
        { field: 'cantiereId', operator: '==', value: cantiereId }
      ], 'createdAt')
      if (materialiResult.success && materialiResult.data.length > 0) {
        return true
      }

      // Verifica allegati associati
      const allegatiResult = await loadCollection('cantieri_allegati', [
        { field: 'cantiereId', operator: '==', value: cantiereId }
      ], 'createdAt')
      if (allegatiResult.success && allegatiResult.data.length > 0) {
        return true
      }

      // Verifica registrazioni nel giornale
      const giornaleResult = await loadCollection('giornale_cantiere', [
        { field: 'cantiereId', operator: '==', value: cantiereId }
      ], 'createdAt')
      if (giornaleResult.success && giornaleResult.data.length > 0) {
        return true
      }

      // Verifica mezzi assegnati
      const mezziResult = await loadCollection('mezzi', [
        { field: 'cantiereId', operator: '==', value: cantiereId }
      ], 'createdAt')
      if (mezziResult.success && mezziResult.data.length > 0) {
        return true
      }

      return false
    } catch (err) {
      console.error('Errore verifica dipendenze cantiere:', err)
      return true // In caso di errore, meglio prevenire che curare
    }
  }

  // Alias for backward compatibility
  const addDocument = createDocument

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
    fatture,
    notifications,
    
    // Computed
    cantieriAttivi,
    cantieriCompletati,
    dipendentiAttivi,
    materialiScorta,
    
    // Methods
    createDocument,
    addDocument, // Alias for backward compatibility
    updateDocument,
    deleteDocument,
    loadCollection,
    subscribeToCollection,
    
    // Cantieri
    loadCantieri,
    createCantiere,
    updateCantiereProgress,
    
    // Clienti
    loadClienti,
    createCliente,
    
    // Materiali
    loadMateriali,
    createMateriale,
    updateMaterialeQuantita,
    getMateriale,
    
    // Personale
    loadDipendenti,
    createDipendente,
    loadTimesheet,
    registraTimesheet,
    loadPresenzeForDate,
    savePresenza,
    
    // Fornitori
    loadFornitori,
    createFornitore,
    
    // Mezzi
    loadMezzi,
    
    // Materiali Cantiere
    loadMaterialiCantiere,
    createMaterialeCantiere,
    updateMaterialeCantiere,
    deleteMaterialeCantiere,
    getMaterialeCantiere,
    
    // Allegati
    loadAllegatiCantiere,
    createAllegatoCantiere,
    deleteAllegatoCantiere,
    loadAllegatiMateriale,
    createAllegatoMateriale,
    deleteAllegatoMateriale,
    
    // Giornale Cantiere
    loadGiornaleCantiere,
    createRegistrazioneGiornale,
    updateRegistrazioneGiornale,
    deleteRegistrazioneGiornale,
    
    // Notifiche
    loadNotifications,
    createNotification,
    markNotificationAsRead,
    
    // Analytics
    getAnalyticsData,
    
    // Migrazione
    migrateFromLocalStorage,
    
    // Test
    testFirestoreConnection,
    
    // Utility
    checkCantiereDependencies,
    sanitizeFirestoreData
  }
}) 