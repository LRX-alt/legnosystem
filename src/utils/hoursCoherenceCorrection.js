/**
 * Sistema di Correzione Automatica Coerenza Ore
 * Risolve automaticamente gli errori identificati dal controllo coerenza
 */

import { useFirestoreStore } from '@/stores/firestore.js'
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '@/config/firebase.js'
import { executeHoursCoherenceCheck } from './hoursCoherenceCheck.js'

export class HoursCoherenceCorrector {
  constructor() {
    this.firestoreStore = useFirestoreStore()
    this.correctionLog = []
    this.backupData = []
  }

  /**
   * Esegue la correzione automatica completa
   */
  async executeAutoCorrection() {
    console.log('🔧 Avvio correzione automatica coerenza ore...')
    
    try {
      // 1. Esegue controllo pre-correzione
      console.log('📊 Controllo pre-correzione...')
      const preReport = await executeHoursCoherenceCheck()
      
      if (preReport.summary.totalIssues === 0) {
        console.log('✅ Nessun problema da correggere!')
        return {
          success: true,
          message: 'Sistema già coerente',
          correctionsMade: 0,
          preReport,
          postReport: preReport
        }
      }

      // 2. Crea backup prima delle correzioni
      console.log('💾 Creazione backup dati...')
      await this.createBackup(preReport)

      // 3. Esegue correzioni specifiche
      console.log('🔨 Applicazione correzioni...')
      await this.applyCorrections(preReport)

      // 4. Verifica post-correzione
      console.log('✅ Verifica post-correzione...')
      const postReport = await executeHoursCoherenceCheck()

      // 5. Salva log correzioni
      await this.saveCorrectionsLog()

      const result = {
        success: true,
        message: 'Correzioni applicate con successo',
        correctionsMade: this.correctionLog.length,
        preReport,
        postReport,
        corrections: this.correctionLog,
        backupId: this.backupData.length > 0 ? this.backupData[0].id : null
      }

      console.log('🎉 Correzione automatica completata!')
      console.log(`📈 Miglioramento coerenza: ${preReport.summary.coherencePercentage}% → ${postReport.summary.coherencePercentage}%`)
      
      return result

    } catch (error) {
      console.error('❌ Errore durante correzione automatica:', error)
      throw error
    }
  }

  /**
   * Crea backup dei dati originali
   */
  async createBackup(report) {
    const backupDoc = {
      timestamp: new Date().toISOString(),
      type: 'pre_correction_backup',
      reportSummary: report.summary,
      affectedRecords: [],
      metadata: {
        totalIssues: report.summary.totalIssues,
        coherencePercentage: report.summary.coherencePercentage,
        correctionReason: 'Automatic coherence correction'
      }
    }

    // Raccoglie tutti i record che verranno modificati
    const recordsToBackup = new Set()
    
    report.detailedIssues.forEach(issue => {
      if (issue.recordId) {
        recordsToBackup.add(issue.recordId)
      }
    })

    // Backup dei record specifici
    for (const recordId of recordsToBackup) {
      const originalRecord = this.firestoreStore.timesheet.find(r => r.id === recordId)
      if (originalRecord) {
        backupDoc.affectedRecords.push({
          id: recordId,
          originalData: { ...originalRecord }
        })
      }
    }

    // Salva backup in Firestore
    try {
      const backupRef = await addDoc(collection(db, 'backups'), backupDoc)
      backupDoc.id = backupRef.id
      this.backupData.push(backupDoc)
      
      console.log(`💾 Backup creato con ID: ${backupRef.id}`)
      console.log(`📦 Records salvati nel backup: ${backupDoc.affectedRecords.length}`)
      
    } catch (error) {
      console.error('❌ Errore creazione backup:', error)
      throw new Error('Impossibile creare backup - correzione annullata')
    }
  }

  /**
   * Applica le correzioni specifiche
   */
  async applyCorrections(report) {
    const corrections = []
    
    // Correzione errori di calcolo costi
    const calculationErrors = report.detailedIssues.filter(issue => issue.type === 'calculation_error')
    
    for (const error of calculationErrors) {
      try {
        const correction = await this.fixCalculationError(error)
        corrections.push(correction)
        
        // Aggiorna anche il store locale
        const storeRecord = this.firestoreStore.timesheet.find(r => r.id === error.recordId)
        if (storeRecord) {
          storeRecord.costoTotale = correction.newValue
          storeRecord.lastModified = new Date().toISOString()
          storeRecord.correctionApplied = true
        }
        
      } catch (correctionError) {
        console.error(`❌ Errore correzione record ${error.recordId}:`, correctionError)
        corrections.push({
          recordId: error.recordId,
          type: 'calculation_error',
          status: 'failed',
          error: correctionError.message
        })
      }
    }

    // Correzione inconsistenze campi (se presenti)
    const fieldErrors = report.detailedIssues.filter(issue => issue.type === 'field_inconsistency')
    for (const error of fieldErrors) {
      try {
        const correction = await this.fixFieldInconsistency(error)
        corrections.push(correction)
      } catch (correctionError) {
        console.error(`❌ Errore correzione field ${error.recordId}:`, correctionError)
      }
    }

    this.correctionLog = corrections
    console.log(`🔨 Correzioni applicate: ${corrections.filter(c => c.status === 'success').length}/${corrections.length}`)
  }

  /**
   * Corregge errori di calcolo costi
   */
  async fixCalculationError(error) {
    const correctValue = error.costoCalcolato
    const recordRef = doc(db, 'timesheet', error.recordId)
    
    await updateDoc(recordRef, {
      costoTotale: correctValue,
      lastModified: new Date().toISOString(),
      correctionApplied: true,
      correctionType: 'calculation_fix',
      correctionTimestamp: new Date().toISOString()
    })

    console.log(`✅ Corretto costo record ${error.recordId}: €${error.costoRegistrato} → €${correctValue}`)

    return {
      recordId: error.recordId,
      type: 'calculation_error',
      status: 'success',
      dipendente: error.dipendente,
      data: error.data,
      oldValue: error.costoRegistrato,
      newValue: correctValue,
      difference: Math.abs(correctValue - error.costoRegistrato),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Corregge inconsistenze tra campi
   */
  async fixFieldInconsistency(error) {
    // Usa il valore più alto tra ore e oreLavorate (assumendo sia più accurato)
    const correctValue = Math.max(error.ore, error.oreLavorate)
    const recordRef = doc(db, 'timesheet', error.recordId)
    
    await updateDoc(recordRef, {
      ore: correctValue,
      oreLavorate: correctValue,
      lastModified: new Date().toISOString(),
      correctionApplied: true,
      correctionType: 'field_unification',
      correctionTimestamp: new Date().toISOString()
    })

    console.log(`✅ Unificati campi record ${error.recordId}: ore=${correctValue}, oreLavorate=${correctValue}`)

    return {
      recordId: error.recordId,
      type: 'field_inconsistency',
      status: 'success',
      dipendente: error.dipendente,
      data: error.data,
      oldValues: { ore: error.ore, oreLavorate: error.oreLavorate },
      newValue: correctValue,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Salva log delle correzioni
   */
  async saveCorrectionsLog() {
    if (this.correctionLog.length === 0) return

    const logDoc = {
      timestamp: new Date().toISOString(),
      type: 'correction_log',
      corrections: this.correctionLog,
      summary: {
        totalCorrections: this.correctionLog.length,
        successfulCorrections: this.correctionLog.filter(c => c.status === 'success').length,
        failedCorrections: this.correctionLog.filter(c => c.status === 'failed').length
      },
      metadata: {
        correctionMethod: 'automatic',
        backupId: this.backupData.length > 0 ? this.backupData[0].id : null
      }
    }

    try {
      const logRef = await addDoc(collection(db, 'correction_logs'), logDoc)
      console.log(`📝 Log correzioni salvato con ID: ${logRef.id}`)
    } catch (error) {
      console.error('❌ Errore salvataggio log:', error)
    }
  }

  /**
   * Ripristina backup in caso di problemi
   */
  async restoreBackup(backupId) {
    console.log(`🔄 Ripristino backup ${backupId}...`)
    
    try {
      const backup = this.backupData.find(b => b.id === backupId)
      if (!backup) {
        throw new Error('Backup non trovato')
      }

      const restoredRecords = []
      
      for (const recordBackup of backup.affectedRecords) {
        const recordRef = doc(db, 'timesheet', recordBackup.id)
        await updateDoc(recordRef, {
          ...recordBackup.originalData,
          lastModified: new Date().toISOString(),
          restoredFromBackup: true,
          restoredTimestamp: new Date().toISOString(),
          restoredBackupId: backupId
        })
        
        restoredRecords.push(recordBackup.id)
      }

      console.log(`✅ Ripristinati ${restoredRecords.length} record dal backup`)
      
      return {
        success: true,
        restoredRecords: restoredRecords.length,
        backupId
      }

    } catch (error) {
      console.error('❌ Errore ripristino backup:', error)
      throw error
    }
  }
}

// Export delle funzioni di utilità
export const executeAutoCorrection = async () => {
  const corrector = new HoursCoherenceCorrector()
  return await corrector.executeAutoCorrection()
}

export const restoreFromBackup = async (backupId) => {
  const corrector = new HoursCoherenceCorrector()
  return await corrector.restoreBackup(backupId)
} 