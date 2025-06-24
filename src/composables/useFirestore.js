import { useToast } from './useToast'
import { useFirestoreStore } from '@/stores/firestore'
import { validateAndSanitize } from '@/utils/firestoreValidation'

// 🛡️ Helper per rimuovere campi undefined che causano errori Firestore
const removeUndefinedFields = (obj) => {
  const cleaned = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  })
  return cleaned
}

export const useFirestore = () => {
  const toast = useToast()
  const firestoreStore = useFirestoreStore()

  // 🔄 Wrapper per operazioni con gestione errori unificata
  const withErrorHandling = async (operation, operationName = 'Operazione') => {
    try {
      firestoreStore.loading = true
      const result = await operation()
      
      if (result?.success === false) {
        throw new Error(result.error || `Errore in ${operationName}`)
      }
      
      return result
    } catch (error) {
      console.error(`❌ ${operationName}:`, error)
      toast.error(`❌ ${operationName} fallita: ${error.message}`)
      throw error
    } finally {
      firestoreStore.loading = false
    }
  }

  // 🏗️ Operazioni Cantieri con error handling
  const cantieriOperations = {
    async load() {
      return withErrorHandling(
        () => firestoreStore.loadCantieri(),
        'Caricamento cantieri'
      )
    },

    async create(data) {
      // Validazione dati prima della creazione
      const validation = validateAndSanitize('cantiere', 'create', data)
      if (!validation.isValid) {
        toast.error(`❌ Dati non validi: ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      return withErrorHandling(
        () => firestoreStore.createCantiere(validation.sanitizedData),
        'Creazione cantiere'
      )
    },

    async update(id, data) {
      // Prima rimuovo i campi undefined per evitare errori Firestore
      const cleanedData = removeUndefinedFields(data)
      
      // Validazione dati prima dell'aggiornamento
      const validation = validateAndSanitize('cantiere', 'update', cleanedData)
      if (!validation.isValid) {
        toast.error(`❌ Dati non validi: ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      return withErrorHandling(
        () => firestoreStore.updateDocument('cantieri', id, validation.sanitizedData),
        'Aggiornamento cantiere'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteDocument('cantieri', id),
        'Eliminazione cantiere'
      )
    },

    async updateProgress(id, progressData) {
      return withErrorHandling(
        () => firestoreStore.updateCantiereProgress(id, progressData),
        'Aggiornamento progresso'
      )
    }
  }

  // 📦 Operazioni Materiali Cantiere con error handling
  const materialiCantiereOperations = {
    async load(cantiereId) {
      return withErrorHandling(
        () => firestoreStore.loadMaterialiCantiere(cantiereId),
        'Caricamento materiali cantiere'
      )
    },

    async create(cantiereId, data) {
      return withErrorHandling(
        () => firestoreStore.createMaterialeCantiere(cantiereId, data),
        'Aggiunta materiale al cantiere'
      )
    },

    async update(id, data) {
      return withErrorHandling(
        () => firestoreStore.updateMaterialeCantiere(id, data),
        'Aggiornamento materiale cantiere'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteMaterialeCantiere(id),
        'Rimozione materiale dal cantiere'
      )
    }
  }

  // 📎 Operazioni Allegati Cantieri con error handling
  const allegatiOperations = {
    async load(cantiereId) {
      return withErrorHandling(
        () => firestoreStore.loadAllegatiCantiere(cantiereId),
        'Caricamento allegati cantiere'
      )
    },

    async create(cantiereId, data) {
      return withErrorHandling(
        () => firestoreStore.createAllegatoCantiere(cantiereId, data),
        'Salvataggio allegato cantiere'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteAllegatoCantiere(id),
        'Eliminazione allegato cantiere'
      )
    }
  }

  // 📎 Operazioni Allegati Materiali con error handling
  const allegatiMaterialiOperations = {
    async load(materialeId) {
      return withErrorHandling(
        () => firestoreStore.loadAllegatiMateriale(materialeId),
        'Caricamento allegati materiale'
      )
    },

    async create(materialeId, data) {
      return withErrorHandling(
        () => firestoreStore.createAllegatoMateriale(materialeId, data),
        'Salvataggio allegato materiale'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteAllegatoMateriale(id),
        'Eliminazione allegato materiale'
      )
    }
  }

  // 👤 Operazioni Clienti con error handling
  const clientiOperations = {
    async load() {
      return withErrorHandling(
        () => firestoreStore.loadClienti(),
        'Caricamento clienti'
      )
    },

    async create(data) {
      // Validazione dati prima della creazione
      const validation = validateAndSanitize('cliente', 'create', data)
      if (!validation.isValid) {
        toast.error(`❌ Dati non validi: ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      return withErrorHandling(
        () => firestoreStore.createCliente(validation.sanitizedData),
        'Creazione cliente'
      )
    },

    async update(id, data) {
      return withErrorHandling(
        () => firestoreStore.updateDocument('clienti', id, data),
        'Aggiornamento cliente'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteDocument('clienti', id),
        'Eliminazione cliente'
      )
    }
  }

  // 👥 Operazioni Dipendenti con error handling
  const dipendentiOperations = {
    async load() {
      return withErrorHandling(
        () => firestoreStore.loadDipendenti(),
        'Caricamento dipendenti'
      )
    },

    async create(data) {
      return withErrorHandling(
        () => firestoreStore.createDipendente(data),
        'Creazione dipendente'
      )
    },

    async update(id, data) {
      return withErrorHandling(
        () => firestoreStore.updateDocument('dipendenti', id, data),
        'Aggiornamento dipendente'
      )
    }
  }

  // 🔄 Caricamento dati multipli con Promise.all
  const loadAllData = async () => {
    return withErrorHandling(
      async () => {
        const results = await Promise.allSettled([
          firestoreStore.loadCantieri(),
          firestoreStore.loadClienti(),
          firestoreStore.loadDipendenti(),
          firestoreStore.loadMateriali(),
          firestoreStore.loadFornitori()
        ])

        // Controllo se qualche caricamento è fallito
        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          console.warn('⚠️ Alcuni caricamenti sono falliti:', failed)
          toast.warning(`⚠️ ${failed.length} caricamenti falliti, vedi console`)
        }

        const successful = results.filter(r => r.status === 'fulfilled').length
        // Note: Removed success notification to avoid spam

        return { success: true, results }
      },
      'Caricamento dati'
    )
  }

  return {
    // Loading state
    loading: firestoreStore.loading,
    
    // Operazioni specifiche
    cantieri: cantieriOperations,
    materialiCantiere: materialiCantiereOperations,
    allegati: allegatiOperations,
    allegatiMateriali: allegatiMaterialiOperations,
    clienti: clientiOperations,
    dipendenti: dipendentiOperations,
    
    // Operazioni globali
    loadAllData,
    withErrorHandling
  }
} 