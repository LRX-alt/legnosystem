import { ref } from 'vue'
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

export const useFirestoreOperations = () => {
  const firestoreStore = useFirestoreStore()
  const popup = usePopup()
  const cache = useFirestoreCache()
  const loading = ref(false)
  const error = ref(null)

  /**
   * Wrapper per gestione errori e loading state
   */
  const withErrorHandling = async (operation, operationName) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await operation()
      return result
    } catch (err) {
      error.value = err.message
      popup.error(`Errore: ${operationName}`, err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Operazioni CRUD standardizzate
   */
  const operations = {
    // CREATE
    async create(collection, data) {
      const result = await withErrorHandling(
        () => firestoreStore.createDocument(collection, data),
        `Creazione ${collection}`
      )
      
      // Invalida la cache per questa collezione
      cache.invalidateCacheByPrefix(collection)
      
      return result
    },

    // READ
    async load(collection, filters = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = null) {
      const cacheKey = `${collection}:${JSON.stringify(filters)}:${orderByField}:${orderDirection}:${limitCount}`
      
      return cache.getWithCache(cacheKey, async () => {
        return withErrorHandling(
          () => firestoreStore.loadCollection(collection, filters, orderByField, orderDirection, limitCount),
          `Caricamento ${collection}`
        )
      })
    },

    // UPDATE
    async update(collection, id, data) {
      const result = await withErrorHandling(
        () => firestoreStore.updateDocument(collection, id, data),
        `Aggiornamento ${collection}`
      )
      
      // Invalida la cache per questa collezione
      cache.invalidateCacheByPrefix(collection)
      
      return result
    },

    // DELETE
    async delete(collection, id) {
      const result = await withErrorHandling(
        () => firestoreStore.deleteDocument(collection, id),
        `Eliminazione ${collection}`
      )
      
      // Invalida la cache per questa collezione
      cache.invalidateCacheByPrefix(collection)
      
      return result
    }
  }

  /**
   * Operazioni specifiche per entità
   */
  const entityOperations = {
    cantieri: {
      async load() {
        return cache.getWithCache('cantieri', async () => {
          return withErrorHandling(
            () => firestoreStore.loadCantieri(),
            'Caricamento cantieri'
          )
        })
      },
      async create(data) {
        const result = await withErrorHandling(
          () => firestoreStore.createCantiere(data),
          'Creazione cantiere'
        )
        
        cache.invalidateCache('cantieri')
        return result
      },
      async updateProgress(id, data) {
        const result = await withErrorHandling(
          () => firestoreStore.updateCantiereProgress(id, data),
          'Aggiornamento progresso cantiere'
        )
        
        cache.invalidateCache('cantieri')
        return result
      }
    },
    
    dipendenti: {
      async load() {
        return cache.getWithCache('dipendenti', async () => {
          return withErrorHandling(
            () => firestoreStore.loadDipendenti(),
            'Caricamento dipendenti'
          )
        })
      },
      async create(data) {
        const result = await withErrorHandling(
          () => firestoreStore.createDipendente(data),
          'Creazione dipendente'
        )
        
        cache.invalidateCache('dipendenti')
        return result
      }
    },

    giornaleCantiere: {
      async load(cantiereId) {
        const cacheKey = `giornaleCantiere:${cantiereId}`
        
        return cache.getWithCache(cacheKey, async () => {
          return withErrorHandling(
            () => firestoreStore.loadGiornaleCantiere(cantiereId),
            'Caricamento giornale cantiere'
          )
        })
      },
      async create(cantiereId, data) {
        const result = await withErrorHandling(
          () => firestoreStore.createRegistrazioneGiornale(cantiereId, data),
          'Creazione registrazione giornale'
        )
        
        cache.invalidateCache(`giornaleCantiere:${cantiereId}`)
        return result
      },
      async update(id, data) {
        const result = await withErrorHandling(
          () => firestoreStore.updateRegistrazioneGiornale(id, data),
          'Aggiornamento registrazione giornale'
        )
        
        // Invalida tutte le cache del giornale cantiere
        cache.invalidateCacheByPrefix('giornaleCantiere:')
        return result
      },
      async delete(id) {
        const result = await withErrorHandling(
          () => firestoreStore.deleteRegistrazioneGiornale(id),
          'Eliminazione registrazione giornale'
        )
        
        // Invalida tutte le cache del giornale cantiere
        cache.invalidateCacheByPrefix('giornaleCantiere:')
        return result
      }
    }
  }

  return {
    loading,
    error,
    ...operations,
    ...entityOperations,
    clearCache: cache.clearCache
  }
} 