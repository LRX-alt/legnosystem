import { usePopup } from './usePopup'
import { useFirestoreStore } from '@/stores/firestore'
import { validateAndSanitize } from '@/utils/firestoreValidation'
import { serverTimestamp, writeBatch, doc, increment } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'

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
  const popup = usePopup()
  const firestoreStore = useFirestoreStore()
  const authStore = useAuthStore()

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
      popup.error('Errore', `❌ ${operationName} fallita: ${error.message}`)
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
      // Validazione completa dei dati prima della creazione
      const validation = validateAndSanitize('cantiere', 'create', data)
      if (!validation.isValid) {
        popup.error('Dati non validi', `❌ ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Verifica presenza cliente
      if (!validation.sanitizedData.cliente?.id) {
        popup.error('Dati non validi', '❌ Cliente mancante o non valido')
        throw new Error('Cliente mancante o non valido')
      }

      // Verifica date
      if (new Date(validation.sanitizedData.scadenza) <= new Date(validation.sanitizedData.dataInizio)) {
        popup.error('Dati non validi', '❌ La data di scadenza deve essere successiva alla data di inizio')
        throw new Error('Data scadenza non valida')
      }

      // Verifica valore cantiere
      if (isNaN(parseFloat(validation.sanitizedData.valore)) || parseFloat(validation.sanitizedData.valore) <= 0) {
        popup.error('Dati non validi', '❌ Il valore del cantiere deve essere un numero positivo')
        throw new Error('Valore cantiere non valido')
      }

      // Ottieni l'utente corrente
      const userId = authStore.user?.uid

      if (!userId) {
        popup.error('Autenticazione', '❌ Utente non autenticato')
        throw new Error('Utente non autenticato')
      }

      // Aggiungi campi calcolati/default
      const cantiereData = {
        ...validation.sanitizedData,
        stato: 'pianificato',
        costiAccumulati: {
          materiali: 0,
          manodopera: 0,
          totale: 0
        },
        progressoPercentuale: 0,
        createdBy: userId,
        updatedBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      return withErrorHandling(
        () => firestoreStore.createCantiere(cantiereData),
        'Creazione cantiere'
      )
    },

    async update(id, data) {
      // Prima rimuovo i campi undefined per evitare errori Firestore
      const cleanedData = removeUndefinedFields(data)
      
      // Validazione dati prima dell'aggiornamento
      const validation = validateAndSanitize('cantiere', 'update', cleanedData)
      if (!validation.isValid) {
        popup.error('Dati non validi', `❌ ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Verifica date se presenti
      if (validation.sanitizedData.scadenza && validation.sanitizedData.dataInizio) {
        if (new Date(validation.sanitizedData.scadenza) <= new Date(validation.sanitizedData.dataInizio)) {
          popup.error('Dati non validi', '❌ La data di scadenza deve essere successiva alla data di inizio')
          throw new Error('Data scadenza non valida')
        }
      }

      // Aggiungi campo updatedBy
      const updateData = {
        ...validation.sanitizedData,
        updatedBy: firestoreStore.currentUser?.uid,
        updatedAt: serverTimestamp()
      }

      return withErrorHandling(
        () => firestoreStore.updateDocument('cantieri', id, updateData),
        'Aggiornamento cantiere'
      )
    },

    async delete(id) {
      // Verifica che il cantiere non abbia dipendenze
      const hasDependencies = await firestoreStore.checkCantiereDependencies(id)
      if (hasDependencies) {
        popup.error('Operazione non consentita', '❌ Impossibile eliminare il cantiere: ci sono materiali o allegati associati')
        throw new Error('Cantiere ha dipendenze')
      }

      return withErrorHandling(
        () => firestoreStore.deleteDocument('cantieri', id),
        'Eliminazione cantiere'
      )
    },

    async updateProgress(id, progressData) {
      // Validazione dati progresso
      if (!progressData.data || !progressData.descrizione) {
        popup.error('Dati non validi', '❌ Data e descrizione sono obbligatori per aggiornare il progresso')
        throw new Error('Dati progresso incompleti')
      }

      return withErrorHandling(
        () => firestoreStore.updateCantiereProgress(id, progressData),
        'Aggiornamento progresso'
      )
    }
  }

  // 📦 Operazioni Materiali con error handling
  const materialiOperations = {
    async load() {
      return withErrorHandling(
        () => firestoreStore.loadMateriali(),
        'Caricamento materiali'
      )
    },

    async create(data) {
      return withErrorHandling(
        () => firestoreStore.createMateriale(data),
        'Creazione materiale'
      )
    },

    async update(id, data) {
      return withErrorHandling(
        () => firestoreStore.updateDocument('materiali', id, data),
        'Aggiornamento materiale'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteDocument('materiali', id),
        'Eliminazione materiale'
      )
    },

    async updateQuantita(id, quantitaDelta, movimento = 'manuale') {
      return withErrorHandling(
        () => firestoreStore.updateMaterialeQuantita(id, quantitaDelta, movimento),
        'Aggiornamento quantità'
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
      // Validazione dati
      const validation = validateAndSanitize('materialeCantiere', 'create', {
        ...data,
        cantiereId
      })
      
      if (!validation.isValid) {
        popup.error('Dati non validi', `❌ ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Verifica disponibilità in magazzino
      const materiale = await firestoreStore.getMateriale(data.materialeId)
      if (!materiale || materiale.quantita < data.quantita) {
        throw new Error('Quantità richiesta non disponibile in magazzino')
      }

      // Crea il materiale nel cantiere e aggiorna il magazzino
      const batch = writeBatch(db)
      
      // Aggiorna quantità in magazzino
      const materialeRef = doc(db, 'materiali', data.materialeId)
      batch.update(materialeRef, {
        quantita: increment(-data.quantita)
      })

      return withErrorHandling(
        async () => {
          const result = await firestoreStore.createMaterialeCantiere(cantiereId, validation.sanitizedData)
          if (result.success) {
            await batch.commit()
          }
          return result
        },
        'Aggiunta materiale al cantiere'
      )
    },

    async update(id, data) {
      // Validazione dati
      const validation = validateAndSanitize('materialeCantiere', 'update', data)
      if (!validation.isValid) {
        popup.error('Dati non validi', `❌ ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Se c'è una modifica della quantità, verifica disponibilità
      if (validation.sanitizedData.quantita) {
        const materiale = await firestoreStore.getMateriale(data.materialeId)
        const materialeCantiere = await firestoreStore.getMaterialeCantiere(id)
        
        const deltaNecessario = validation.sanitizedData.quantita - materialeCantiere.quantita
        if (deltaNecessario > 0 && materiale.quantita < deltaNecessario) {
          throw new Error('Quantità aggiuntiva non disponibile in magazzino')
        }

        // Aggiorna magazzino se necessario
        if (deltaNecessario !== 0) {
          await firestoreStore.updateMaterialeQuantita(
            data.materialeId,
            -deltaNecessario,
            'modifica_cantiere'
          )
        }
      }

      return withErrorHandling(
        () => firestoreStore.updateMaterialeCantiere(id, validation.sanitizedData),
        'Aggiornamento materiale cantiere'
      )
    },

    async delete(id) {
      // Recupera il materiale cantiere prima della cancellazione
      const materialeCantiere = await firestoreStore.getMaterialeCantiere(id)
      
      // Restituisci la quantità al magazzino
      await firestoreStore.updateMaterialeQuantita(
        materialeCantiere.materialeId,
        materialeCantiere.quantita,
        'restituzione_cantiere'
      )

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
      // Validazione dati
      const validation = validateAndSanitize('allegatoMateriale', 'create', {
        ...data,
        materialeId
      })
      
      if (!validation.isValid) {
        popup.error('Dati non validi', `❌ ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      return withErrorHandling(
        () => firestoreStore.createAllegatoMateriale(materialeId, validation.sanitizedData),
        'Salvataggio allegato materiale'
      )
    },

    async update(id, data) {
      // Validazione dati
      const validation = validateAndSanitize('allegatoMateriale', 'update', data)
      if (!validation.isValid) {
        toast.error(`❌ Dati non validi: ${validation.errors.join(', ')}`)
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      return withErrorHandling(
        () => firestoreStore.updateAllegatoMateriale(id, validation.sanitizedData),
        'Aggiornamento allegato materiale'
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

  // 🏭 Operazioni Fornitori con error handling
  const fornitoriOperations = {
    async load() {
      return withErrorHandling(
        () => firestoreStore.loadFornitori(),
        'Caricamento fornitori'
      )
    },

    async create(data) {
      return withErrorHandling(
        () => firestoreStore.createFornitore(data),
        'Creazione fornitore'
      )
    },

    async update(id, data) {
      return withErrorHandling(
        () => firestoreStore.updateDocument('fornitori', id, data),
        'Aggiornamento fornitore'
      )
    },

    async delete(id) {
      return withErrorHandling(
        () => firestoreStore.deleteDocument('fornitori', id),
        'Eliminazione fornitore'
      )
    }
  }

  // 🔄 Funzione per caricare tutti i dati
  const loadAllData = async () => {
    try {
      await Promise.all([
        cantieriOperations.load(),
        clientiOperations.load(),
        materialiOperations.load(),
        dipendentiOperations.load(),
        fornitoriOperations.load()
      ])
      return { success: true }
    } catch (error) {
      console.error('❌ Errore caricamento dati:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    cantieriOperations,
    clientiOperations,
    materialiOperations,
    materialiCantiereOperations,
    dipendentiOperations,
    fornitoriOperations,
    allegatiOperations,
    allegatiMaterialiOperations,
    loadAllData,
    loading: firestoreStore.loading,
    error: firestoreStore.error
  }
} 