import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'

export class MigrationManager {
  constructor() {
    this.firestoreStore = useFirestoreStore()
    this.popup = usePopup()
    this.migrationLog = []
  }

  // 📊 Analizza dati localStorage esistenti
  analyzeLocalStorageData() {
    const analysis = {
      attachments: this.analyzeAttachments(),
      materialiCantieri: this.analyzeMaterialiCantieri(), 
      progressHistory: this.analyzeProgressHistory(),
      materialAttachments: this.analyzeMaterialAttachments(),
      total: 0
    }

    analysis.total = Object.values(analysis).reduce((sum, item) => 
      sum + (typeof item === 'object' && item.count ? item.count : 0), 0
    )

    return analysis
  }

  analyzeAttachments() {
    try {
      const stored = localStorage.getItem('legnosystem_attachments')
      if (!stored) return { count: 0, cantieri: [] }
      
      const data = JSON.parse(stored)
      const cantieri = Object.keys(data)
      const totalFiles = cantieri.reduce((sum, cantiereId) => 
        sum + (data[cantiereId]?.length || 0), 0
      )

      return {
        count: totalFiles,
        cantieri: cantieri.length,
        details: cantieri.map(cantiereId => ({
          cantiereId,
          files: data[cantiereId]?.length || 0
        }))
      }
    } catch (e) {
      console.warn('Errore analisi allegati:', e)
      return { count: 0, cantieri: [] }
    }
  }

  analyzeMaterialiCantieri() {
    try {
      const stored = localStorage.getItem('legnosystem_materiali_cantieri')
      if (!stored) return { count: 0, cantieri: [] }
      
      const data = JSON.parse(stored)
      const cantieri = Object.keys(data)
      const totalMateriali = cantieri.reduce((sum, cantiereId) => 
        sum + (data[cantiereId]?.length || 0), 0
      )

      return {
        count: totalMateriali,
        cantieri: cantieri.length,
        details: cantieri.map(cantiereId => ({
          cantiereId,
          materiali: data[cantiereId]?.length || 0
        }))
      }
    } catch (e) {
      console.warn('Errore analisi materiali cantieri:', e)
      return { count: 0, cantieri: [] }
    }
  }

  analyzeProgressHistory() {
    try {
      const stored = localStorage.getItem('legnosystem_progress_history')
      if (!stored) return { count: 0, cantieri: [] }
      
      const data = JSON.parse(stored)
      const cantieri = Object.keys(data)
      const totalUpdates = cantieri.reduce((sum, cantiereId) => 
        sum + (data[cantiereId]?.length || 0), 0
      )

      return {
        count: totalUpdates,
        cantieri: cantieri.length,
        details: cantieri.map(cantiereId => ({
          cantiereId,
          updates: data[cantiereId]?.length || 0
        }))
      }
    } catch (e) {
      console.warn('Errore analisi storico progresso:', e)
      return { count: 0, cantieri: [] }
    }
  }

  analyzeMaterialAttachments() {
    try {
      const stored = localStorage.getItem('legnosystem_material_attachments')
      if (!stored) return { count: 0, materiali: [] }
      
      const data = JSON.parse(stored)
      const materiali = Object.keys(data)
      const totalFiles = materiali.reduce((sum, materialeId) => 
        sum + (data[materialeId]?.length || 0), 0
      )

      return {
        count: totalFiles,
        materiali: materiali.length,
        details: materiali.map(materialeId => ({
          materialeId,
          files: data[materialeId]?.length || 0
        }))
      }
    } catch (e) {
      console.warn('Errore analisi allegati materiali:', e)
      return { count: 0, materiali: [] }
    }
  }

  // 🚀 Migrazione completa automatica
  async migrateAllData(options = {}) {
    const { 
      dryRun = false, 
      batchSize = 50, 
      onProgress = null,
      skipExisting = true 
    } = options

    this.migrationLog = []
    let totalMigrated = 0
    let totalErrors = 0

    try {
      this.log('🚀 Inizio migrazione da localStorage a Firestore...')
      
      if (dryRun) {
        this.log('📋 MODALITÀ DRY-RUN - Nessun dato sarà modificato')
      }

      const analysis = this.analyzeLocalStorageData()
      this.log(`📊 Analisi completata: ${analysis.total} elementi da migrare`)

      // 1. Migra allegati cantieri
      if (analysis.attachments.count > 0) {
        this.log(`📎 Migrazione ${analysis.attachments.count} allegati cantieri...`)
        const result = await this.migrateAttachments(dryRun, batchSize)
        totalMigrated += result.migrated
        totalErrors += result.errors
        onProgress?.('attachments', result)
      }

      // 2. Migra materiali cantieri
      if (analysis.materialiCantieri.count > 0) {
        this.log(`📦 Migrazione ${analysis.materialiCantieri.count} materiali cantieri...`)
        const result = await this.migrateMaterialiCantieri(dryRun, batchSize)
        totalMigrated += result.migrated
        totalErrors += result.errors
        onProgress?.('materialiCantieri', result)
      }

      // 3. Migra storico progresso
      if (analysis.progressHistory.count > 0) {
        this.log(`📈 Migrazione ${analysis.progressHistory.count} aggiornamenti progresso...`)
        const result = await this.migrateProgressHistory(dryRun, batchSize)
        totalMigrated += result.migrated
        totalErrors += result.errors
        onProgress?.('progressHistory', result)
      }

      // 4. Migra allegati materiali
      if (analysis.materialAttachments.count > 0) {
        this.log(`🧱 Migrazione ${analysis.materialAttachments.count} allegati materiali...`)
        const result = await this.migrateMaterialAttachments(dryRun, batchSize)
        totalMigrated += result.migrated
        totalErrors += result.errors
        onProgress?.('materialAttachments', result)
      }

      const summary = {
        totalMigrated,
        totalErrors,
        success: totalErrors === 0,
        log: this.migrationLog
      }

      if (!dryRun && summary.success) {
        this.log('🧹 Pulizia localStorage completata')
        this.cleanupLocalStorage()
      }

      this.log(`✅ Migrazione completata: ${totalMigrated} elementi migrati, ${totalErrors} errori`)
      
      if (!dryRun) {
        this.popup.success('🚀 Migrazione Completata', `✅ Migrazione completata con successo! ${totalMigrated} elementi migrati a Firestore`)
      }

      return summary

    } catch (error) {
      this.log(`❌ Errore fatale migrazione: ${error.message}`)
      this.popup.error('❌ Errore Migrazione', `Errore migrazione: ${error.message}`)
      throw error
    }
  }

  // 📎 Migrazione allegati cantieri
  async migrateAttachments(dryRun = false, batchSize = 50) {
    let migrated = 0
    let errors = 0

    try {
      const stored = localStorage.getItem('legnosystem_attachments')
      if (!stored) return { migrated, errors }

      const data = JSON.parse(stored)
      
      for (const [cantiereId, attachments] of Object.entries(data)) {
        if (!attachments || !Array.isArray(attachments)) continue

        for (const attachment of attachments) {
          if (dryRun) {
            this.log(`[DRY-RUN] Allegato: ${attachment.name} → cantiere ${cantiereId}`)
            migrated++
            continue
          }

          try {
            const allegatoData = {
              nome: attachment.name || 'File senza nome',
              url: attachment.url || attachment.dataUrl || '',
              tipo: attachment.type || 'unknown',
              dimensione: attachment.size || 0,
              descrizione: attachment.description || '',
              categoria: attachment.category || 'generale',
              migratedFrom: 'localStorage',
              originalData: attachment
            }

            await this.firestoreStore.createAllegatoCantiere(cantiereId, allegatoData)
            migrated++
            this.log(`✅ Allegato migrato: ${allegatoData.nome}`)

          } catch (error) {
            errors++
            this.log(`❌ Errore migrazione allegato ${attachment.name}: ${error.message}`)
          }
        }
      }

    } catch (error) {
      this.log(`❌ Errore migrazione allegati: ${error.message}`)
      errors++
    }

    return { migrated, errors }
  }

  // 📦 Migrazione materiali cantieri
  async migrateMaterialiCantieri(dryRun = false, batchSize = 50) {
    let migrated = 0
    let errors = 0

    try {
      const stored = localStorage.getItem('legnosystem_materiali_cantieri')
      if (!stored) return { migrated, errors }

      const data = JSON.parse(stored)
      
      for (const [cantiereId, materiali] of Object.entries(data)) {
        if (!materiali || !Array.isArray(materiali)) continue

        for (const materiale of materiali) {
          if (dryRun) {
            this.log(`[DRY-RUN] Materiale: ${materiale.nome} → cantiere ${cantiereId}`)
            migrated++
            continue
          }

          try {
            const materialeData = {
              nome: materiale.nome || 'Materiale senza nome',
              descrizione: materiale.descrizione || '',
              codice: materiale.codice || `MAT-${Date.now()}`,
              quantitaRichiesta: materiale.quantitaRichiesta || 0,
              quantitaUtilizzata: materiale.quantitaUtilizzata || 0,
              unita: materiale.unita || 'pz',
              prezzoUnitario: materiale.prezzoUnitario || 0,
              stato: materiale.stato || 'pianificato',
              fornitoreId: materiale.fornitoreId || null,
              fornitoreNome: materiale.fornitoreNome || '',
              dataAcquisto: materiale.dataAcquisto || null,
              note: materiale.note || '',
              migratedFrom: 'localStorage',
              originalData: materiale
            }

            await this.firestoreStore.createMaterialeCantiere(cantiereId, materialeData)
            migrated++
            this.log(`✅ Materiale migrato: ${materialeData.nome}`)

          } catch (error) {
            errors++
            this.log(`❌ Errore migrazione materiale ${materiale.nome}: ${error.message}`)
          }
        }
      }

    } catch (error) {
      this.log(`❌ Errore migrazione materiali cantieri: ${error.message}`)
      errors++
    }

    return { migrated, errors }
  }

  // 📈 Migrazione storico progresso
  async migrateProgressHistory(dryRun = false, batchSize = 50) {
    let migrated = 0
    let errors = 0

    try {
      const stored = localStorage.getItem('legnosystem_progress_history')
      if (!stored) return { migrated, errors }

      const data = JSON.parse(stored)
      
      for (const [cantiereId, updates] of Object.entries(data)) {
        if (!updates || !Array.isArray(updates)) continue

        for (const update of updates) {
          if (dryRun) {
            this.log(`[DRY-RUN] Progresso: ${update.fase} → cantiere ${cantiereId}`)
            migrated++
            continue
          }

          try {
            const progressData = {
              fase: update.fase || 'Fase senza nome',
              nota: update.nota || '',
              incremento: update.incremento || 0,
              progressoPrecedente: update.progressoPrecedente || 0,
              nuovoProgresso: update.nuovoProgresso || 0,
              dataCompletamento: update.dataCompletamento || null,
              timestamp: update.timestamp || new Date().toISOString(),
              migratedFrom: 'localStorage',
              originalData: update
            }

            // Usa il metodo esistente che salva automaticamente in cantieriProgress
            await this.firestoreStore.updateCantiereProgress(cantiereId, progressData)
            migrated++
            this.log(`✅ Progresso migrato: ${progressData.fase}`)

          } catch (error) {
            errors++
            this.log(`❌ Errore migrazione progresso ${update.fase}: ${error.message}`)
          }
        }
      }

    } catch (error) {
      this.log(`❌ Errore migrazione storico progresso: ${error.message}`)
      errors++
    }

    return { migrated, errors }
  }

  // 🧱 Migrazione allegati materiali
  async migrateMaterialAttachments(dryRun = false, batchSize = 50) {
    let migrated = 0
    let errors = 0

    try {
      const stored = localStorage.getItem('legnosystem_material_attachments')
      if (!stored) return { migrated, errors }

      const data = JSON.parse(stored)
      
      for (const [materialeId, attachments] of Object.entries(data)) {
        if (!attachments || !Array.isArray(attachments)) continue

        for (const attachment of attachments) {
          if (dryRun) {
            this.log(`[DRY-RUN] Allegato materiale: ${attachment.name} → materiale ${materialeId}`)
            migrated++
            continue
          }

          try {
            const allegatoData = {
              nome: attachment.name || 'File senza nome',
              url: attachment.url || attachment.dataUrl || '',
              tipo: attachment.type || 'unknown',
              dimensione: attachment.size || 0,
              descrizione: attachment.description || '',
              categoria: attachment.category || 'generale',
              migratedFrom: 'localStorage',
              originalData: attachment
            }

            await this.firestoreStore.createAllegatoMateriale(materialeId, allegatoData)
            migrated++
            this.log(`✅ Allegato materiale migrato: ${allegatoData.nome}`)

          } catch (error) {
            errors++
            this.log(`❌ Errore migrazione allegato materiale ${attachment.name}: ${error.message}`)
          }
        }
      }

    } catch (error) {
      this.log(`❌ Errore migrazione allegati materiali: ${error.message}`)
      errors++
    }

    return { migrated, errors }
  }

  // 🧹 Pulizia localStorage dopo migrazione
  cleanupLocalStorage() {
    const keysToRemove = [
      'legnosystem_attachments',
      'legnosystem_materiali_cantieri', 
      'legnosystem_progress_history',
      'legnosystem_material_attachments'
    ]

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
        this.log(`🧹 Rimossa chiave localStorage: ${key}`)
      } catch (error) {
        this.log(`⚠️ Errore rimozione ${key}: ${error.message}`)
      }
    })
  }

  // 📝 Logging
  log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    this.migrationLog.push(logEntry)
    console.log(logEntry)
  }

  // 📊 Report migrazione
  generateMigrationReport() {
    const analysis = this.analyzeLocalStorageData()
    
    return {
      timestamp: new Date().toISOString(),
      analysis,
      recommendations: this.generateRecommendations(analysis),
      log: this.migrationLog
    }
  }

  generateRecommendations(analysis) {
    const recommendations = []

    if (analysis.total > 0) {
      recommendations.push('🚀 È consigliabile eseguire la migrazione per sfruttare le funzionalità cloud')
    }

    if (analysis.attachments.count > 100) {
      recommendations.push('📎 Grande numero di allegati: considera la migrazione in batch')
    }

    if (analysis.materialiCantieri.count > 50) {
      recommendations.push('📦 Molti materiali da migrare: verifica la struttura dati')
    }

    if (analysis.total === 0) {
      recommendations.push('✅ Nessun dato localStorage da migrare - sistema già aggiornato')
    }

    return recommendations
  }
}

// Factory function per facilità d'uso
export const createMigrationManager = () => new MigrationManager() 