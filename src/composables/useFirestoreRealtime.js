import { ref, computed, onUnmounted } from 'vue'
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy as firestoreOrderBy, 
  limit,
  getDocs
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

export const useFirestoreRealtime = () => {
  const toast = useToast()
  const authStore = useAuthStore()
  
  // State per listeners attivi
  const activeListeners = ref(new Map())
  const connectionStatus = ref('connected')
  const lastSyncTime = ref(null)
  
  // Computed
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const listenersCount = computed(() => activeListeners.value.size)

  /**
   * Crea listener per una collezione
   */
  const listenToCollection = (collectionName, options = {}) => {
    if (!authStore.isAuthenticated) {
      console.warn('Utente non autenticato per listener real-time')
      return null
    }

    const {
      filters = [],
      orderBys = [],
      limitTo = null,
      onData = () => {},
      onError = (error) => console.error('Errore listener:', error),
      includeMetadata = true
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

      // Crea listener
      const unsubscribe = onSnapshot(
        q,
        {
          includeMetadataChanges: includeMetadata
        },
        (snapshot) => {
          try {
            connectionStatus.value = 'connected'
            lastSyncTime.value = new Date()

            const docs = []
            const changes = {
              added: [],
              modified: [],
              removed: []
            }

            snapshot.docChanges().forEach(change => {
              const docData = {
                id: change.doc.id,
                ...change.doc.data(),
                _metadata: {
                  fromCache: change.doc.metadata.fromCache,
                  hasPendingWrites: change.doc.metadata.hasPendingWrites
                }
              }

              switch (change.type) {
                case 'added':
                  changes.added.push(docData)
                  break
                case 'modified':
                  changes.modified.push(docData)
                  break
                case 'removed':
                  changes.removed.push(docData)
                  break
              }
            })

            // Tutti i documenti
            snapshot.forEach(doc => {
              docs.push({
                id: doc.id,
                ...doc.data(),
                _metadata: {
                  fromCache: doc.metadata.fromCache,
                  hasPendingWrites: doc.metadata.hasPendingWrites
                }
              })
            })

            // Callback con dati e cambiamenti
            onData({
              docs,
              changes,
              metadata: {
                fromCache: snapshot.metadata.fromCache,
                hasPendingWrites: snapshot.metadata.hasPendingWrites,
                size: snapshot.size,
                empty: snapshot.empty
              }
            })

            // Note: Toast notifications removed to avoid spam on dashboard
          } catch (error) {
            console.error('Errore processamento snapshot:', error)
            onError(error)
          }
        },
        (error) => {
          console.error(`Errore listener ${collectionName}:`, error)
          connectionStatus.value = 'error'
          
          let errorMessage = 'Errore connessione real-time'
          switch (error.code) {
            case 'permission-denied':
              errorMessage = 'Permessi insufficienti per accedere ai dati'
              break
            case 'unavailable':
              errorMessage = 'Servizio temporaneamente non disponibile'
              connectionStatus.value = 'disconnected'
              break
            case 'unauthenticated':
              errorMessage = 'Autenticazione richiesta'
              break
            default:
              errorMessage = error.message
          }
          
          toast.error(errorMessage, '❌ Errore Real-time')
          onError(error)
        }
      )

      // Registra listener
      const listenerId = `${collectionName}_${Date.now()}`
      activeListeners.value.set(listenerId, {
        unsubscribe,
        collection: collectionName,
        createdAt: new Date()
      })

      console.log(`✅ Listener real-time attivo per ${collectionName}`)
      return {
        listenerId,
        unsubscribe: () => {
          unsubscribe()
          activeListeners.value.delete(listenerId)
          console.log(`🔌 Listener ${collectionName} disconnesso`)
        }
      }
    } catch (error) {
      console.error('Errore creazione listener:', error)
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
      orderBys: [{ field: 'dataCreazione', direction: 'desc' }],
      onData: (result) => {
        onUpdate(result.docs, result.changes)
      },
      onError: (error) => {
        toast.error(`Errore sincronizzazione cantieri: ${error.message}`)
      }
    })
  }

  // Cantiere specifico real-time
  const listenToCantiereDetail = (cantiereId, onUpdate) => {
    return listenToDocument('cantieri', cantiereId, {
      onData: onUpdate,
      onError: (error) => {
        toast.error(`Errore sincronizzazione cantiere: ${error.message}`)
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
  const startDashboardListeners = (onUpdates = {}) => {
    const listeners = []

    // Cantieri
    if (onUpdates.cantieri) {
      const listener = listenToCantieri(onUpdates.cantieri)
      if (listener) listeners.push(listener)
    }

    // Clienti
    if (onUpdates.clienti) {
      const listener = listenToClienti(onUpdates.clienti)
      if (listener) listeners.push(listener)
    }

    // Dipendenti (se autorizzato)
    if (onUpdates.dipendenti && authStore.canManagePersonnel) {
      const listener = listenToDipendenti(onUpdates.dipendenti)
      if (listener) listeners.push(listener)
    }

    // Notifiche
    if (onUpdates.notifications) {
      const listener = listenToUserNotifications(onUpdates.notifications)
      if (listener) listeners.push(listener)
    }

    console.log(`🔄 ${listeners.length} listeners dashboard attivati`)
    
    return {
      stopAll: () => {
        listeners.forEach(listener => listener.unsubscribe())
        console.log('🔌 Tutti i listeners dashboard disconnessi')
      }
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
    try {
      // Test semplice: ascolta una collezione per 5 secondi
      const testListener = listenToCollection('settings', {
        limitTo: 1,
        onData: (result) => {
          console.log('✅ Connessione real-time funzionante:', result.metadata)
        },
        onError: (error) => {
          console.error('❌ Test connessione real-time fallito:', error)
        }
      })

      setTimeout(() => {
        if (testListener) {
          testListener.unsubscribe()
        }
      }, 5000)

      return true
    } catch (error) {
      console.error('❌ Test connessione real-time fallito:', error)
      return false
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

    // Core methods
    listenToCollection,
    listenToDocument,

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