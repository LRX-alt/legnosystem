/**
 * 🚨 COMPLETE TIMESHEET AUDIT & FIX UTILITY
 * Scansiona e corregge TUTTI i problemi nei dati timesheet esistenti
 * Uso: per sistemare il database dopo aver scoperto i bug
 */

import { TimesheetDateValidator } from './timesheetValidation.js'

export class CompleteTimesheetAuditor {
  constructor(firestoreStore) {
    this.firestoreStore = firestoreStore
    this.auditResults = {
      totalRecords: 0,
      problematicRecords: 0,
      correctedRecords: 0,
      deletedDuplicates: 0,
      errors: [],
      warnings: [],
      detailedReport: []
    }
  }

  /**
   * 🔍 AUDIT COMPLETO: Scansiona TUTTI i timesheet
   */
  async performCompleteAudit() {
    console.log('🔍 ===============================================')
    console.log('🔍 AVVIO AUDIT COMPLETO TIMESHEET')
    console.log('🔍 ===============================================')

    try {
      // 1. Carica TUTTI i timesheet
      const timesheetResult = await this.firestoreStore.loadTimesheet()
      if (!timesheetResult.success) {
        throw new Error(`Impossibile caricare timesheet: ${timesheetResult.error}`)
      }

      const allTimesheet = timesheetResult.data || []
      this.auditResults.totalRecords = allTimesheet.length
      
      console.log(`📊 Trovati ${allTimesheet.length} timesheet da analizzare`)

      // 2. Raggruppa per problematiche
      const problematicDates = this.findProblematicDates(allTimesheet)
      const duplicates = this.findDuplicates(allTimesheet)
      const invalidData = this.findInvalidData(allTimesheet)
      const orphanedRecords = await this.findOrphanedRecords(allTimesheet)

      // 3. Genera report dettagliato
      this.generateDetailedReport(problematicDates, duplicates, invalidData, orphanedRecords)

      // 4. Calcola statistiche finali
      this.auditResults.problematicRecords = 
        problematicDates.length + duplicates.length + invalidData.length + orphanedRecords.length

      return this.auditResults

    } catch (error) {
      console.error('❌ Errore durante audit completo:', error)
      this.auditResults.errors.push(`Audit fallito: ${error.message}`)
      return this.auditResults
    }
  }

  /**
   * 🔧 FIX AUTOMATICO: Corregge TUTTI i problemi trovati
   */
  async performCompleteFix() {
    console.log('🔧 ===============================================')
    console.log('🔧 AVVIO CORREZIONE AUTOMATICA COMPLETA')
    console.log('🔧 ===============================================')

    try {
      // 1. Prima esegui audit per identificare problemi
      await this.performCompleteAudit()
      
      if (this.auditResults.problematicRecords === 0) {
        console.log('✅ Nessun problema trovato - database già pulito!')
        return this.auditResults
      }

      console.log(`🔧 Avvio correzione di ${this.auditResults.problematicRecords} problemi...`)

      // 2. Correggi date problematiche
      await this.fixProblematicDates()

      // 3. Rimuovi duplicati
      await this.removeDuplicates()

      // 4. Correggi dati invalidi
      await this.fixInvalidData()

      // 5. Gestisci record orfani
      await this.handleOrphanedRecords()

      // 6. Verifica finale
      await this.performFinalVerification()

      console.log('✅ Correzione automatica completata!')
      return this.auditResults

    } catch (error) {
      console.error('❌ Errore durante correzione automatica:', error)
      this.auditResults.errors.push(`Correzione fallita: ${error.message}`)
      return this.auditResults
    }
  }

  /**
   * 📅 Trova timesheet con date problematiche
   */
  findProblematicDates(allTimesheet) {
    return allTimesheet.filter(timesheet => {
      const validation = TimesheetDateValidator.validateAndFixDate(timesheet.data)
      return !validation.isValid
    })
  }

  /**
   * 🔄 Trova duplicati (stesso dipendente, data, cantiere)
   */
  findDuplicates(allTimesheet) {
    const recordMap = new Map()
    const duplicates = []

    allTimesheet.forEach(timesheet => {
      const key = `${timesheet.dipendenteId}-${timesheet.data}-${timesheet.cantiereId || timesheet.cantiere || 'no_cantiere'}`
      
      if (!recordMap.has(key)) {
        recordMap.set(key, [])
      }
      recordMap.get(key).push(timesheet)
    })

    recordMap.forEach((records, key) => {
      if (records.length > 1) {
        // Mantieni solo il più recente, marca gli altri come duplicati
        const sorted = records.sort((a, b) => 
          new Date(b.createdAt || b.updatedAt || '1970-01-01') - 
          new Date(a.createdAt || a.updatedAt || '1970-01-01')
        )
        
        duplicates.push(...sorted.slice(1)) // Tutti tranne il primo (più recente)
      }
    })

    return duplicates
  }

  /**
   * ❌ Trova dati invalidi (ore negative, dipendenti inesistenti, etc.)
   */
  findInvalidData(allTimesheet) {
    return allTimesheet.filter(timesheet => {
      const validation = TimesheetDateValidator.validateTimesheetData(timesheet)
      return !validation.isValid
    })
  }

  /**
   * 👻 Trova record orfani (dipendenti/cantieri inesistenti)
   */
  async findOrphanedRecords(allTimesheet) {
    const orphaned = []
    
    // Carica dipendenti e cantieri esistenti
    const dipendentiResult = await this.firestoreStore.loadDipendenti()
    const cantieriResult = await this.firestoreStore.loadCantieri()
    
    const validDipendenti = dipendentiResult.success ? 
      dipendentiResult.data.map(d => d.id) : []
    const validCantieri = cantieriResult.success ? 
      cantieriResult.data.map(c => c.id) : []

    allTimesheet.forEach(timesheet => {
      let isOrphaned = false
      let orphanReasons = []

      // Verifica dipendente esistente
      if (!validDipendenti.includes(timesheet.dipendenteId)) {
        isOrphaned = true
        orphanReasons.push('Dipendente inesistente')
      }

      // Verifica cantiere esistente (se specificato)
      if (timesheet.cantiereId && !validCantieri.includes(timesheet.cantiereId)) {
        isOrphaned = true
        orphanReasons.push('Cantiere inesistente')
      }

      if (isOrphaned) {
        orphaned.push({
          ...timesheet,
          orphanReasons
        })
      }
    })

    return orphaned
  }

  /**
   * 🔧 Corregge le date problematiche
   */
  async fixProblematicDates() {
    console.log('🔧 Correzione date problematiche...')
    
    const timesheetResult = await this.firestoreStore.loadTimesheet()
    const allTimesheet = timesheetResult.data || []
    
    const problematicDates = this.findProblematicDates(allTimesheet)
    let correctedCount = 0

    for (const timesheet of problematicDates) {
      try {
        const validation = TimesheetDateValidator.validateTimesheetData(timesheet)
        
        if (validation.correctedData.data !== timesheet.data) {
          await this.firestoreStore.updateDocument('timesheet', timesheet.id, {
            data: validation.correctedData.data,
            dataOriginale: timesheet.data,
            correctedAt: new Date().toISOString(),
            correctionReason: 'Date fix automation'
          })
          
          correctedCount++
          console.log(`🔧 Corretta data timesheet ${timesheet.id}: ${timesheet.data} → ${validation.correctedData.data}`)
        }
      } catch (error) {
        console.error(`❌ Errore correzione timesheet ${timesheet.id}:`, error)
        this.auditResults.errors.push(`Correzione fallita per ${timesheet.id}: ${error.message}`)
      }
    }

    this.auditResults.correctedRecords += correctedCount
    console.log(`✅ Corrette ${correctedCount} date problematiche`)
  }

  /**
   * 🗑️ Rimuove record duplicati
   */
  async removeDuplicates() {
    console.log('🗑️ Rimozione duplicati...')
    
    const timesheetResult = await this.firestoreStore.loadTimesheet()
    const allTimesheet = timesheetResult.data || []
    
    const duplicates = this.findDuplicates(allTimesheet)
    let deletedCount = 0

    for (const duplicate of duplicates) {
      try {
        await this.firestoreStore.deleteDocument('timesheet', duplicate.id)
        deletedCount++
        console.log(`🗑️ Eliminato duplicato ${duplicate.id}`)
      } catch (error) {
        console.error(`❌ Errore eliminazione duplicato ${duplicate.id}:`, error)
        this.auditResults.errors.push(`Eliminazione fallita per ${duplicate.id}: ${error.message}`)
      }
    }

    this.auditResults.deletedDuplicates = deletedCount
    console.log(`✅ Eliminati ${deletedCount} record duplicati`)
  }

  /**
   * 🔧 Corregge dati invalidi
   */
  async fixInvalidData() {
    console.log('🔧 Correzione dati invalidi...')
    
    const timesheetResult = await this.firestoreStore.loadTimesheet()
    const allTimesheet = timesheetResult.data || []
    
    const invalidData = this.findInvalidData(allTimesheet)
    let fixedCount = 0

    for (const timesheet of invalidData) {
      try {
        const validation = TimesheetDateValidator.validateTimesheetData(timesheet)
        
        // Applica correzioni automatiche
        await this.firestoreStore.updateDocument('timesheet', timesheet.id, {
          ...validation.correctedData,
          correctedAt: new Date().toISOString(),
          correctionReason: 'Data validation automation'
        })
        
        fixedCount++
        console.log(`🔧 Corretto timesheet invalido ${timesheet.id}`)
      } catch (error) {
        console.error(`❌ Errore correzione dati invalidi ${timesheet.id}:`, error)
        this.auditResults.errors.push(`Correzione dati fallita per ${timesheet.id}: ${error.message}`)
      }
    }

    console.log(`✅ Corretti ${fixedCount} record con dati invalidi`)
  }

  /**
   * 👻 Gestisce record orfani
   */
  async handleOrphanedRecords() {
    console.log('👻 Gestione record orfani...')
    
    const timesheetResult = await this.firestoreStore.loadTimesheet()
    const allTimesheet = timesheetResult.data || []
    
    const orphaned = await this.findOrphanedRecords(allTimesheet)
    
    for (const record of orphaned) {
      // Per ora marca solo come orfano, non elimina automaticamente
      try {
        await this.firestoreStore.updateDocument('timesheet', record.id, {
          isOrphaned: true,
          orphanReasons: record.orphanReasons,
          markedOrphanAt: new Date().toISOString()
        })
        
        console.log(`👻 Marcato come orfano ${record.id}: ${record.orphanReasons.join(', ')}`)
      } catch (error) {
        console.error(`❌ Errore marcatura orfano ${record.id}:`, error)
      }
    }

    console.log(`👻 Marcati ${orphaned.length} record orfani`)
  }

  /**
   * ✅ Verifica finale dopo le correzioni
   */
  async performFinalVerification() {
    console.log('✅ Verifica finale...')
    
    const finalAudit = await this.performCompleteAudit()
    
    console.log(`✅ RISULTATI FINALI:`)
    console.log(`   - Problemi risolti: ${this.auditResults.correctedRecords}`)
    console.log(`   - Duplicati eliminati: ${this.auditResults.deletedDuplicates}`)
    console.log(`   - Problemi rimanenti: ${finalAudit.problematicRecords}`)
    
    if (finalAudit.problematicRecords === 0) {
      console.log('🎉 DATABASE COMPLETAMENTE PULITO!')
    } else {
      console.log(`⚠️ Rimangono ${finalAudit.problematicRecords} problemi da verificare manualmente`)
    }
  }

  /**
   * 📋 Genera report dettagliato
   */
  generateDetailedReport(problematicDates, duplicates, invalidData, orphanedRecords) {
    this.auditResults.detailedReport = [
      {
        category: 'Date Problematiche',
        count: problematicDates.length,
        items: problematicDates.map(t => ({
          id: t.id,
          data: t.data,
          dipendenteId: t.dipendenteId,
          problem: 'Data invalida o problematica'
        }))
      },
      {
        category: 'Record Duplicati',
        count: duplicates.length,
        items: duplicates.map(t => ({
          id: t.id,
          data: t.data,
          dipendenteId: t.dipendenteId,
          problem: 'Record duplicato'
        }))
      },
      {
        category: 'Dati Invalidi',
        count: invalidData.length,
        items: invalidData.map(t => ({
          id: t.id,
          data: t.data,
          dipendenteId: t.dipendenteId,
          problem: 'Dati timesheet invalidi'
        }))
      },
      {
        category: 'Record Orfani',
        count: orphanedRecords.length,
        items: orphanedRecords.map(t => ({
          id: t.id,
          data: t.data,
          dipendenteId: t.dipendenteId,
          problem: t.orphanReasons.join(', ')
        }))
      }
    ]
  }

  /**
   * 📊 Genera report testuale per l'utente
   */
  generateUserReport() {
    const { totalRecords, problematicRecords, correctedRecords, deletedDuplicates, detailedReport } = this.auditResults

    let report = `🔍 REPORT AUDIT TIMESHEET COMPLETO\n\n`
    report += `📊 STATISTICHE GENERALI:\n`
    report += `   • Record totali analizzati: ${totalRecords}\n`
    report += `   • Problemi trovati: ${problematicRecords}\n`
    report += `   • Record corretti: ${correctedRecords}\n`
    report += `   • Duplicati eliminati: ${deletedDuplicates}\n\n`

    report += `📋 DETTAGLIO PROBLEMI:\n`
    detailedReport.forEach(category => {
      if (category.count > 0) {
        report += `\n🔸 ${category.category}: ${category.count} problemi\n`
        category.items.slice(0, 5).forEach(item => {
          report += `   - ${item.id}: ${item.problem}\n`
        })
        if (category.count > 5) {
          report += `   ... e altri ${category.count - 5} problemi\n`
        }
      }
    })

    if (problematicRecords === 0) {
      report += `\n🎉 RISULTATO: Database completamente pulito!\n`
    } else {
      report += `\n⚠️ RISULTATO: Audit completato, verificare i problemi rimanenti.\n`
    }

    return report
  }
}

export default CompleteTimesheetAuditor 