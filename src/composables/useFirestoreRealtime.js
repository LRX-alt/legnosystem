import { ref, computed, onUnmounted } from 'vue'
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy as firestoreOrderBy, 
  limit,
  getDocs,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth'

export const useFirestoreRealtime = () => {
  const popup = usePopup()
  const authStore = useAuthStore()
  
  // State per listeners attivi
  const activeListeners = ref(new Map())
  const connectionStatus = ref('connected')
  const lastSyncTime = ref(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 5000 // 5 secondi
  
  // Computed
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const listenersCount = computed(() => activeListeners.value.size)
  const canReconnect = computed(() => reconnectAttempts.value < maxReconnectAttempts)

  /**
   * Gestisce la riconnessione automatica
   */
  const handleReconnect = async () => {
    if (!canReconnect.value) {
      console.error('❌ Numero massimo di tentativi di riconnessione raggiunto')
      popup.error('Errore Connessione', 'Impossibile riconnettersi al server. Ricarica la pagina.')
      return false
    }

    try {
      reconnectAttempts.value++
      console.log(`🔄 Tentativo di riconnessione ${reconnectAttempts.value}/${maxReconnectAttempts}...`)
      
      await enableNetwork(db)
      connectionStatus.value = 'connected'
      lastSyncTime.value = new Date()
      console.log('✅ Riconnessione riuscita')
      
      // Reset tentativi dopo successo
      reconnectAttempts.value = 0
      return true
    } catch (error) {
      console.error('❌ Errore riconnessione:', error)
      connectionStatus.value = 'error'
      
      // Ritenta dopo delay
      setTimeout(handleReconnect, reconnectDelay)
      return false
    }
  }

  /**
   * Crea listener per una collezione con gestione errori migliorata
   */
  const listenToCollection = (collectionName, options = {}) => {
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ Utente non autenticato per listener real-time')
      return null
    }

    const {
      filters = [],
      orderBys = [],
      limitTo = null,
      onData = () => {},
      onError = (error) => console.error('Errore listener:', error),
      includeMetadata = true,
      enableReconnect = true
    } = options

    try {
      // Costruisci query
      let q = collection(db, collectionName)
      
      // Applica filtri
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value))
      })
      
      // Applica ordinamento
      orderBys.forEach(orderConfig => {
        q = query(q, firestoreOrderBy(orderConfig.field, orderConfig.direction || 'asc'))
      })
      
      // Applica limite
      if (limitTo) {
        q = query(q, limit(limitTo))
      }
      
      // Crea listener con gestione errori migliorata
      const unsubscribe = onSnapshot(
        q,
        {
          includeMetadataChanges: includeMetadata
        },
        (snapshot) => {
          try {
            connectionStatus.value = 'connected'
            lastSyncTime.value = new Date()
            reconnectAttempts.value = 0 // Reset tentativi dopo successo

            const docs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              _metadata: {
                fromCache: doc.metadata.fromCache,
                hasPendingWrites: doc.metadata.hasPendingWrites
              }
            }))

            const changes = snapshot.docChanges().map(change => ({
              type: change.type,
              doc: {
                id: change.doc.id,
                ...change.doc.data()
              }
            }))

            onData({ docs, changes })
          } catch (error) {
            console.error(`❌ Errore processamento dati ${collectionName}:`, error)
            onError(error)
          }
        },
        async (error) => {
          console.error(`❌ Errore listener ${collectionName}:`, error)
          connectionStatus.value = 'error'
          
          if (enableReconnect && error.code === 'unavailable') {
            // Disabilita network e tenta riconnessione
            await disableNetwork(db)
            setTimeout(handleReconnect, reconnectDelay)
          }
          
          onError(error)
        }
      )

      // Registra listener
      const listenerId = `${collectionName}_${Date.now()}`
      activeListeners.value.set(listenerId, {
        unsubscribe,
        collection: collectionName,
        createdAt: new Date(),
        options: { filters, orderBys, limitTo }
      })

      return {
        listenerId,
        unsubscribe: () => {
          unsubscribe()
          activeListeners.value.delete(listenerId)
        }
      }
    } catch (error) {
      console.error('❌ Errore creazione listener:', error)
      onError(error)
      return null
    }
  }

  /**
   * Crea listener per un documento specifico
   */
  const listenToDocument = (collectionName, docId, options = {}) => {
    if (!authStore.isAuthenticated) {
      console.warn('Utente non autenticato per listener documento')
      return null
    }

    const {
      onData = () => {},
      onError = (error) => console.error('Errore listener documento:', error),
      includeMetadata = true
    } = options

    try {
      const docRef = doc(db, collectionName, docId)
      
      const unsubscribe = onSnapshot(
        docRef,
        {
          includeMetadataChanges: includeMetadata
        },
        (docSnapshot) => {
          try {
            connectionStatus.value = 'connected'
            lastSyncTime.value = new Date()

            if (docSnapshot.exists()) {
              const data = {
                id: docSnapshot.id,
                ...docSnapshot.data(),
                _metadata: {
                  fromCache: docSnapshot.metadata.fromCache,
                  hasPendingWrites: docSnapshot.metadata.hasPendingWrites
                }
              }
              onData(data)
            } else {
              onData(null)
            }
          } catch (error) {
            console.error('Errore processamento documento:', error)
            onError(error)
          }
        },
        (error) => {
          console.error(`Errore listener documento ${docId}:`, error)
          connectionStatus.value = 'error'
          onError(error)
        }
      )

      const listenerId = `${collectionName}_${docId}_${Date.now()}`
      activeListeners.value.set(listenerId, {
        unsubscribe,
        collection: collectionName,
        docId,
        createdAt: new Date()
      })

      return {
        listenerId,
        unsubscribe: () => {
          unsubscribe()
          activeListeners.value.delete(listenerId)
        }
      }
    } catch (error) {
      console.error('Errore creazione listener documento:', error)
      onError(error)
      return null
    }
  }

  /**
   * Listeners specifici per entità business
   */
  
  // Cantieri real-time
  const listenToCantieri = (onUpdate) => {
    return listenToCollection('cantieri', {
      orderBys: [{ field: 'createdAt', direction: 'desc' }],
      onData: (result) => {
        if (result.docs && Array.isArray(result.docs)) {
          onUpdate(result.docs, result.changes)
        } else {
          console.error('❌ Dati cantieri non validi:', result)
        }
      },
      onError: (error) => {
        console.error('❌ Errore listener cantieri:', error)
        popup.error('Errore sincronizzazione', `Errore sincronizzazione cantieri: ${error.message}`)
      }
    })
  }

  // Cantiere specifico real-time
  const listenToCantiereDetail = (cantiereId, onUpdate) => {
    return listenToDocument('cantieri', cantiereId, {
      onData: onUpdate,
      onError: (error) => {
        popup.error('Errore sincronizzazione', `Errore sincronizzazione cantiere: ${error.message}`)
      }
    })
  }

  // Materiali cantiere real-time
  const listenToMaterialiCantiere = (cantiereId, onUpdate) => {
    return listenToCollection('materiali_cantieri', {
      filters: [{ field: 'cantiereId', operator: '==', value: cantiereId }],
      orderBys: [{ field: 'nome', direction: 'asc' }],
      onData: (result) => {
        onUpdate(result.docs, result.changes)
      }
    })
  }

  // Allegati cantiere real-time
  const listenToAllegatiCantiere = (cantiereId, onUpdate) => {
    return listenToCollection('cantieri_allegati', {
      filters: [{ field: 'cantiereId', operator: '==', value: cantiereId }],
      orderBys: [{ field: 'dataCreazione', direction: 'desc' }],
      onData: (result) => {
        onUpdate(result.docs, result.changes)
      }
    })
  }

  // Clienti real-time
  const listenToClienti = (onUpdate) => {
    return listenToCollection('clienti', {
      orderBys: [{ field: 'nome', direction: 'asc' }],
      onData: (result) => {
        onUpdate(result.docs, result.changes)
      }
    })
  }

  // Dipendenti real-time
  const listenToDipendenti = (onUpdate) => {
    if (!authStore.canManagePersonnel) {
      console.warn('Utente non autorizzato a vedere i dipendenti')
      return null
    }
    
    return listenToCollection('dipendenti', {
      orderBys: [{ field: 'nome', direction: 'asc' }],
      onData: (result) => {
        onUpdate(result.docs, result.changes)
      }
    })
  }

  // Notifiche utente real-time
  const listenToUserNotifications = (onUpdate) => {
    if (!authStore.user) return null
    
    // TODO: Temporarily disabled until Firebase index is ready (takes a few minutes)
    console.log('⏳ Notifications listener temporarily disabled - waiting for Firebase index')
    return null
    
    /* return listenToCollection('notifications', {
      filters: [
        { field: 'recipients', operator: 'array-contains', value: authStore.user.uid },
        { field: 'read', operator: '==', value: false }
      ],
      orderBys: [{ field: 'createdAt', direction: 'desc' }],
      limitTo: 20,
      onData: (result) => {
        onUpdate(result.docs, result.changes)
        
        // Note: Toast notifications removed to avoid spam
      }
    }) */
  }

  /**
   * Gestione batch listeners per dashboard
   */
  const startDashboardListeners = (handlers) => {
    const unsubscribers = []
    
    try {
      // Cantieri listener
      const unsubCantieri = onSnapshot(query(collection(db, 'cantieri')), (snapshot) => {
        handlers.cantieri?.(snapshot.docs, snapshot.docChanges())
        if (import.meta.env.DEV) {
          console.log('✅ Listener real-time attivo per cantieri')
        }
      })
      unsubscribers.push(unsubCantieri)

      // Clienti listener
      const unsubClienti = onSnapshot(query(collection(db, 'clienti')), (snapshot) => {
        handlers.clienti?.(snapshot.docs, snapshot.docChanges())
        if (import.meta.env.DEV) {
          console.log('✅ Listener real-time attivo per clienti')
        }
      })
      unsubscribers.push(unsubClienti)

      // Dipendenti listener
      const unsubDipendenti = onSnapshot(query(collection(db, 'dipendenti')), (snapshot) => {
        handlers.dipendenti?.(snapshot.docs, snapshot.docChanges())
        if (import.meta.env.DEV) {
          console.log('✅ Listener real-time attivo per dipendenti')
        }
      })
      unsubscribers.push(unsubDipendenti)

      if (import.meta.env.DEV) {
        console.log(`✅ ${unsubscribers.length} listeners dashboard attivati`)
      }

      return {
        stopAll: () => {
          unsubscribers.forEach(unsub => unsub())
          if (import.meta.env.DEV) {
            console.log('🔌 Real-time sync disattivato')
          }
        }
      }
    } catch (error) {
      console.error('❌ Errore attivazione real-time sync:', error)
      throw error
    }
  }

  /**
   * Disconnetti listener specifico
   */
  const disconnectListener = (listenerId) => {
    const listener = activeListeners.value.get(listenerId)
    if (listener) {
      listener.unsubscribe()
      activeListeners.value.delete(listenerId)
      console.log(`🔌 Listener ${listenerId} disconnesso`)
      return true
    }
    return false
  }

  /**
   * Disconnetti tutti i listeners
   */
  const disconnectAllListeners = () => {
    const count = activeListeners.value.size
    activeListeners.value.forEach((listener, listenerId) => {
      listener.unsubscribe()
    })
    activeListeners.value.clear()
    console.log(`🔌 ${count} listeners disconnessi`)
  }

  /**
   * Test connessione real-time
   */
  const testRealtimeConnection = async () => {
    if (!import.meta.env.DEV) {
      return { success: true, message: 'Test skipped in production' }
    }

    try {
      const testCollection = collection(db, 'test_realtime')
      let testSuccess = false
      
      const unsubscribe = onSnapshot(testCollection, () => {
        testSuccess = true
        connectionStatus.value = 'connected'
        lastSyncTime.value = new Date()
      }, (error) => {
        console.error('❌ Test realtime fallito:', error)
        connectionStatus.value = 'error'
      })

      // Attendi risposta o timeout
      await new Promise(resolve => setTimeout(resolve, 5000))
      unsubscribe()

      return { 
        success: testSuccess, 
        message: testSuccess ? 'Real-time funziona!' : 'Test timeout' 
      }
    } catch (error) {
      console.error('❌ Test realtime fallito:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Info sui listeners attivi
   */
  const getListenersInfo = () => {
    const info = []
    activeListeners.value.forEach((listener, listenerId) => {
      info.push({
        id: listenerId,
        collection: listener.collection,
        docId: listener.docId || null,
        createdAt: listener.createdAt,
        duration: Date.now() - listener.createdAt.getTime()
      })
    })
    return info
  }

  // Cleanup automatico quando il componente viene smontato
  onUnmounted(() => {
    disconnectAllListeners()
  })

  return {
    // State
    activeListeners: computed(() => activeListeners.value),
    connectionStatus,
    lastSyncTime,
    isConnected,
    listenersCount,
    reconnectAttempts,
    canReconnect,

    // Core methods
    listenToCollection,
    listenToDocument,
    handleReconnect,

    // Business specific listeners
    listenToCantieri,
    listenToCantiereDetail,
    listenToMaterialiCantiere,
    listenToAllegatiCantiere,
    listenToClienti,
    listenToDipendenti,
    listenToUserNotifications,

    // Batch operations
    startDashboardListeners,

    // Management
    disconnectListener,
    disconnectAllListeners,
    testRealtimeConnection,
    getListenersInfo
  }
} 