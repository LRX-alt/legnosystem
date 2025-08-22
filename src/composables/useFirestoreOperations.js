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

  // ===== Util condiviso: ricalcolo costi cantiere dal Giornale Cantiere (fallback timesheet+materiali) =====
  const recalculateCantiereCostsFromJournal = async (cantiereId) => {
    if (!cantiereId) return { success: false, error: 'cantiereId mancante' }
    try {
      // Carica giornali del cantiere (no orderBy per evitare indici)
      const giornaleRes = await firestoreStore.loadCollection('giornale_cantiere', [
        { field: 'cantiereId', operator: '==', value: cantiereId }
      ], null)

      let costoManodopera = 0
      let costoMateriali = 0
      let costoMezzi = 0
      let costoLavori = 0
      let giorniLavorativi = 0
      let oreTotali = 0

      if (giornaleRes?.success && Array.isArray(giornaleRes.data) && giornaleRes.data.length > 0) {
        const entries = giornaleRes.data
        // Somma dipendenti
        costoManodopera = entries.reduce((sum, e) => {
          const fromArray = Array.isArray(e.dipendenti) ? e.dipendenti.reduce((s, d) => {
            const ore = d.ore || d.oreLavorate || 0
            const unit = d.costoOrario || 0
            const costo = d.costoTotale != null ? d.costoTotale : (ore * unit)
            return s + costo
          }, 0) : 0
          const fromTotals = Number(e.costiTotali?.dipendenti) || 0
          return sum + (fromArray || fromTotals)
        }, 0)
        // Somma materiali
        costoMateriali = entries.reduce((sum, e) => {
          const fromArray = Array.isArray(e.materiali) ? e.materiali.reduce((s, m) => {
            const qty = m.quantita || m.quantitaUtilizzata || m.quantitaRichiesta || 0
            const unit = m.costoUnitario || m.prezzoUnitario || m.prezzo || 0
            const costo = m.costoTotale != null ? m.costoTotale : (qty * unit)
            return s + costo
          }, 0) : 0
          const fromTotals = Number(e.costiTotali?.materiali) || 0
          return sum + (fromArray || fromTotals)
        }, 0)
        // Somma mezzi
        costoMezzi = entries.reduce((sum, e) => {
          const fromArray = Array.isArray(e.mezzi) ? e.mezzi.reduce((s, z) => {
            const ore = z.oreUtilizzo || 0
            const unit = z.costoOrario || 0
            const costo = z.costoTotale != null ? z.costoTotale : (ore * unit)
            return s + costo
          }, 0) : 0
          const fromTotals = Number(e.costiTotali?.mezzi) || 0
          return sum + (fromArray || fromTotals)
        }, 0)
        // Somma lavori
        costoLavori = entries.reduce((sum, e) => {
          const fromArray = Array.isArray(e.lavori) ? e.lavori.reduce((s, l) => {
            const ore = l.ore || 0
            const unit = l.costoOrario || 0
            const costo = l.costoTotale != null ? l.costoTotale : (ore * unit)
            return s + costo
          }, 0) : 0
          const fromTotals = Number(e.costiTotali?.lavori) || 0
          return sum + (fromArray || fromTotals)
        }, 0)

        giorniLavorativi = [...new Set(entries.map(e => e.data))].length
        oreTotali = entries.reduce((sum, e) => sum + (
          Array.isArray(e.dipendenti)
            ? e.dipendenti.reduce((s, d) => s + (d.ore || d.oreLavorate || 0), 0)
            : (Number(e.oreTotali) || 0)
        ), 0)
      } else {
        // Fallback: timesheet + materiali
        const timesheetRes = await firestoreStore.loadCollection('timesheet', [
          { field: 'cantiereId', operator: '==', value: cantiereId }
        ])
        if (timesheetRes.success && Array.isArray(timesheetRes.data)) {
          costoManodopera = timesheetRes.data.reduce((acc, t) => {
            const ore = t.oreLavorate || t.ore || 0
            const unit = t.costoOrario || 0
            return acc + (ore * unit)
          }, 0)
          giorniLavorativi = [...new Set(timesheetRes.data.map(t => t.data))].length
          oreTotali = timesheetRes.data.reduce((acc, t) => acc + (t.oreLavorate || t.ore || 0), 0)
        }
        const materialiRes = await firestoreStore.loadMaterialiCantiere(cantiereId)
        if (materialiRes.success && Array.isArray(materialiRes.data)) {
          costoMateriali = materialiRes.data.reduce((acc, m) => {
            const qty = m.quantitaUtilizzata || m.quantitaRichiesta || 0
            const unit = m.prezzoUnitario || 0
            return acc + (qty * unit)
          }, 0)
        }
      }

      // Voci aggiuntive dal cantiere (originali + aggiunte)
      // Assicurati che lo store cantieri sia aggiornato
      await firestoreStore.loadCantieri()
      const cantiereDoc = firestoreStore.cantieri.find(c => c.id === cantiereId)
      let costoVociAggiuntive = 0
      if (cantiereDoc) {
        const vociOriginali = cantiereDoc.vociAggiuntiveOriginali || []
        const vociAggiunte = cantiereDoc.vociAggiuntive || []
        costoVociAggiuntive = [...vociOriginali, ...vociAggiunte].reduce((acc, v) => acc + (v.importo || 0), 0)
      }

      const totale = costoManodopera + costoMateriali + costoMezzi + costoLavori + costoVociAggiuntive
      const updateData = {
        costiAccumulati: {
          manodopera: Math.round(costoManodopera * 100) / 100,
          materiali: Math.round(costoMateriali * 100) / 100,
          vociAggiuntive: Math.round((costoVociAggiuntive + costoMezzi + costoLavori) * 100) / 100,
          totale: Math.round(totale * 100) / 100
        },
        statisticheCosti: {
          giorniLavorativi,
          oreTotaliLavorate: oreTotali,
          costoMedioGiornaliero: giorniLavorativi > 0 ? Math.round((totale / giorniLavorativi) * 100) / 100 : 0
        }
      }

      // Usa operations.update per invalidare cache correttamente
      await operations.update('cantieri', cantiereId, updateData)
      // Ricarica cantieri in store per aggiornare UI
      await firestoreStore.loadCantieri()
      return { success: true }
    } catch (err) {
      console.error('Errore recalculateCantiereCostsFromJournal:', err)
      return { success: false, error: err.message }
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
    recalculateCantiereCostsFromJournal,
    clearCache: cache.clearCache
  }
} 