/**
 * Sistema di Controllo Coerenza Ore Dipendenti
 * Analizza tutti i timesheet e verifica la coerenza dei dati
 */

import { useFirestoreStore } from '@/stores/firestore.js'

export class HoursCoherenceChecker {
  constructor() {
    this.firestoreStore = useFirestoreStore()
    this.issues = []
    this.report = {}
  }

  /**
   * Esegue il controllo completo di coerenza delle ore
   */
  async executeFullCheck() {
    console.log('🔍 Avvio controllo coerenza ore dipendenti...')
    
    try {
      // 1. Carica tutti i dati necessari
      await this.loadAllData()
      
      // 2. Esegue i controlli specifici
      await this.checkFieldConsistency()
      await this.checkDuplicateRecords() 
      await this.checkHourlyAnomalies()
      await this.checkSourceConflicts()
      await this.checkCalculationAccuracy()
      
      // 3. Genera il report finale
      this.generateComprehensiveReport()
      
      // 4. Mostra risultati
      this.displayResults()
      
      return this.report
      
    } catch (error) {
      console.error('❌ Errore durante il controllo coerenza:', error)
      throw error
    }
  }

  /**
   * Carica tutti i dati necessari da Firestore
   */
  async loadAllData() {
    console.log('📥 Caricamento dati da Firestore...')
    
    await Promise.all([
      this.firestoreStore.loadTimesheet(),
      this.firestoreStore.loadDipendenti(),
      this.firestoreStore.loadCantieri()
    ])
    
    this.timesheet = this.firestoreStore.timesheet || []
    this.dipendenti = this.firestoreStore.dipendenti || []
    this.cantieri = this.firestoreStore.cantieri || []
    
    console.log(`📊 Dati caricati: ${this.timesheet.length} timesheet, ${this.dipendenti.length} dipendenti`)
  }

  /**
   * Controlla consistenza tra campi ore e oreLavorate
   */
  async checkFieldConsistency() {
    console.log('🔍 Controllo consistenza campi ore...')
    
    const inconsistentFields = []
    
    this.timesheet.forEach(record => {
      const hasOre = record.ore !== undefined && record.ore !== null
      const hasOreLavorate = record.oreLavorate !== undefined && record.oreLavorate !== null
      
      if (hasOre && hasOreLavorate && record.ore !== record.oreLavorate) {
        const dipendente = this.getDipendenteName(record.dipendenteId)
        
        inconsistentFields.push({
          type: 'field_inconsistency',
          severity: 'high',
          recordId: record.id,
          dipendente: dipendente,
          data: record.data,
          ore: record.ore,
          oreLavorate: record.oreLavorate,
          fonte: record.fonte || 'non_specificata',
          difference: Math.abs(record.ore - record.oreLavorate),
          message: `Campo ore (${record.ore}h) diverso da oreLavorate (${record.oreLavorate}h)`
        })
      }
    })
    
    this.issues.push(...inconsistentFields)
    console.log(`📋 Trovate ${inconsistentFields.length} inconsistenze tra campi`)
  }

  /**
   * Controlla record duplicati per stesso dipendente/data/cantiere
   */
  async checkDuplicateRecords() {
    console.log('🔍 Controllo record duplicati...')
    
    const recordMap = new Map()
    const duplicates = []
    
    // Raggruppa per chiave dipendente-data-cantiere
    this.timesheet.forEach(record => {
      const key = `${record.dipendenteId}-${record.data}-${record.cantiereId || record.cantiere || 'no_cantiere'}`
      
      if (!recordMap.has(key)) {
        recordMap.set(key, [])
      }
      recordMap.get(key).push(record)
    })
    
    // Identifica duplicati
    recordMap.forEach((records, key) => {
      if (records.length > 1) {
        const [dipendenteId, data, cantiere] = key.split('-')
        const dipendente = this.getDipendenteName(dipendenteId)
        const totalHours = records.reduce((sum, r) => sum + (r.ore || r.oreLavorate || 0), 0)
        const sources = [...new Set(records.map(r => r.fonte || 'non_specificata'))]
        
        duplicates.push({
          type: 'duplicate_records',
          severity: 'medium',
          dipendente: dipendente,
          data: data,
          cantiere: cantiere,
          recordCount: records.length,
          totalHours: totalHours,
          sources: sources,
          records: records.map(r => ({
            id: r.id,
            ore: r.ore || r.oreLavorate || 0,
            fonte: r.fonte || 'non_specificata',
            timestamp: r.createdAt
          })),
          message: `${records.length} registrazioni per stesso dipendente/data/cantiere`
        })
      }
    })
    
    this.issues.push(...duplicates)
    console.log(`📋 Trovati ${duplicates.length} gruppi di record duplicati`)
  }

  /**
   * Controlla anomalie nelle ore giornaliere
   */
  async checkHourlyAnomalies() {
    console.log('🔍 Controllo anomalie ore giornaliere...')
    
    const dailyHours = new Map()
    const anomalies = []
    
    // Calcola ore totali per dipendente per giorno
    this.timesheet.forEach(record => {
      const key = `${record.dipendenteId}-${record.data}`
      const hours = record.ore || record.oreLavorate || 0
      
      if (!dailyHours.has(key)) {
        dailyHours.set(key, {
          totalHours: 0,
          records: [],
          dipendente: this.getDipendenteName(record.dipendenteId),
          data: record.data
        })
      }
      
      const dailyData = dailyHours.get(key)
      dailyData.totalHours += hours
      dailyData.records.push({
        id: record.id,
        ore: hours,
        fonte: record.fonte || 'non_specificata',
        cantiere: record.cantiere || record.cantiereNome || 'Non Assegnato'
      })
    })
    
    // Identifica anomalie
    dailyHours.forEach((data, key) => {
      const { totalHours, dipendente, data: date, records } = data
      
      // Ore zero
      if (totalHours === 0) {
        anomalies.push({
          type: 'zero_hours',
          severity: 'low',
          dipendente: dipendente,
          data: date,
          totalHours: totalHours,
          recordCount: records.length,
          message: 'Giornata con 0 ore registrate'
        })
      }
      
      // Ore eccessive (>12h)
      if (totalHours > 12) {
        anomalies.push({
          type: 'excessive_hours',
          severity: 'high',
          dipendente: dipendente,
          data: date,
          totalHours: totalHours,
          recordCount: records.length,
          records: records,
          message: `Ore giornaliere eccessive: ${totalHours}h > 12h`
        })
      }
      
      // Ore insufficienti per giorno lavorativo (<4h in giorni non weekend)
      const dayOfWeek = new Date(date).getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 6 && totalHours > 0 && totalHours < 4) {
        anomalies.push({
          type: 'insufficient_hours',
          severity: 'medium',
          dipendente: dipendente,
          data: date,
          totalHours: totalHours,
          message: `Ore insufficienti per giorno lavorativo: ${totalHours}h < 4h`
        })
      }
    })
    
    this.issues.push(...anomalies)
    console.log(`📋 Trovate ${anomalies.length} anomalie nelle ore giornaliere`)
  }

  /**
   * Controlla conflitti tra fonti diverse
   */
  async checkSourceConflicts() {
    console.log('🔍 Controllo conflitti tra fonti...')
    
    const dailyRecords = new Map()
    const conflicts = []
    
    // Raggruppa per dipendente/giorno
    this.timesheet.forEach(record => {
      const key = `${record.dipendenteId}-${record.data}`
      
      if (!dailyRecords.has(key)) {
        dailyRecords.set(key, {
          dipendente: this.getDipendenteName(record.dipendenteId),
          data: record.data,
          bySource: new Map()
        })
      }
      
      const dailyData = dailyRecords.get(key)
      const fonte = record.fonte || 'non_specificata'
      
      if (!dailyData.bySource.has(fonte)) {
        dailyData.bySource.set(fonte, [])
      }
      
      dailyData.bySource.get(fonte).push(record)
    })
    
    // Identifica conflitti
    dailyRecords.forEach((data, key) => {
      const { dipendente, data: date, bySource } = data
      
      if (bySource.size > 1) {
        const sources = Array.from(bySource.keys())
        const totalHoursBySource = new Map()
        
        bySource.forEach((records, source) => {
          const total = records.reduce((sum, r) => sum + (r.ore || r.oreLavorate || 0), 0)
          totalHoursBySource.set(source, total)
        })
        
        conflicts.push({
          type: 'source_conflicts',
          severity: 'medium',
          dipendente: dipendente,
          data: date,
          sources: sources,
          hoursBySource: Object.fromEntries(totalHoursBySource),
          totalHours: Array.from(totalHoursBySource.values()).reduce((sum, h) => sum + h, 0),
          message: `Registrazioni da fonti multiple: ${sources.join(', ')}`
        })
      }
    })
    
    this.issues.push(...conflicts)
    console.log(`📋 Trovati ${conflicts.length} conflitti tra fonti`)
  }

  /**
   * Controlla accuratezza dei calcoli costi
   */
  async checkCalculationAccuracy() {
    console.log('🔍 Controllo accuratezza calcoli costi...')
    
    const calculationErrors = []
    
    this.timesheet.forEach(record => {
      const ore = record.ore || record.oreLavorate || 0
      const costoOrario = record.costoOrario || 0
      const costoTotaleRegistrato = record.costoTotale || 0
      
      if (costoOrario > 0 && ore > 0) {
        const costoTotaleCalcolato = ore * costoOrario
        const differenza = Math.abs(costoTotaleCalcolato - costoTotaleRegistrato)
        
        if (differenza > 0.01) { // Tolleranza di 1 centesimo
          calculationErrors.push({
            type: 'calculation_error',
            severity: 'medium',
            recordId: record.id,
            dipendente: this.getDipendenteName(record.dipendenteId),
            data: record.data,
            ore: ore,
            costoOrario: costoOrario,
            costoCalcolato: costoTotaleCalcolato,
            costoRegistrato: costoTotaleRegistrato,
            differenza: differenza,
            message: `Costo errato: calcolato €${costoTotaleCalcolato.toFixed(2)}, registrato €${costoTotaleRegistrato.toFixed(2)}`
          })
        }
      }
    })
    
    this.issues.push(...calculationErrors)
    console.log(`📋 Trovati ${calculationErrors.length} errori di calcolo`)
  }

  /**
   * Genera report completo con statistiche
   */
  generateComprehensiveReport() {
    console.log('📊 Generazione report completo...')
    
    // Statistiche generali
    const totalRecords = this.timesheet.length
    const totalIssues = this.issues.length
    const uniqueEmployees = new Set(this.timesheet.map(r => r.dipendenteId)).size
    
    // Raggruppa issues per tipo e severità
    const issuesByType = new Map()
    const issuesBySeverity = new Map()
    
    this.issues.forEach(issue => {
      // Per tipo
      if (!issuesByType.has(issue.type)) {
        issuesByType.set(issue.type, 0)
      }
      issuesByType.set(issue.type, issuesByType.get(issue.type) + 1)
      
      // Per severità
      if (!issuesBySeverity.has(issue.severity)) {
        issuesBySeverity.set(issue.severity, 0)
      }
      issuesBySeverity.set(issue.severity, issuesBySeverity.get(issue.severity) + 1)
    })
    
    // Calcola totali ore per dipendente
    const employeeHours = new Map()
    this.timesheet.forEach(record => {
      const dipendenteId = record.dipendenteId
      const ore = record.ore || record.oreLavorate || 0
      
      if (!employeeHours.has(dipendenteId)) {
        employeeHours.set(dipendenteId, {
          nome: this.getDipendenteName(dipendenteId),
          totalHours: 0,
          recordCount: 0,
          avgHoursPerDay: 0
        })
      }
      
      const empData = employeeHours.get(dipendenteId)
      empData.totalHours += ore
      empData.recordCount += 1
    })
    
    // Calcola media ore per giorno
    employeeHours.forEach(empData => {
      if (empData.recordCount > 0) {
        empData.avgHoursPerDay = empData.totalHours / empData.recordCount
      }
    })
    
    // Compila report finale
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRecords,
        totalIssues,
        uniqueEmployees,
        coherencePercentage: totalRecords > 0 ? Math.round(((totalRecords - totalIssues) / totalRecords) * 100) : 100
      },
      issueBreakdown: {
        byType: Object.fromEntries(issuesByType),
        bySeverity: Object.fromEntries(issuesBySeverity)
      },
      employeeStats: Array.from(employeeHours.entries()).map(([id, data]) => ({
        dipendenteId: id,
        ...data
      })),
      detailedIssues: this.issues,
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * Genera raccomandazioni basate sui problemi trovati
   */
  generateRecommendations() {
    const recommendations = []
    
    const issueTypes = new Set(this.issues.map(i => i.type))
    
    if (issueTypes.has('field_inconsistency')) {
      recommendations.push({
        priority: 'high',
        action: 'Unificare campi ore e oreLavorate',
        description: 'Standardizzare tutti i timesheet per usare un campo unificato per le ore'
      })
    }
    
    if (issueTypes.has('duplicate_records')) {
      recommendations.push({
        priority: 'high',
        action: 'Rimuovere record duplicati',
        description: 'Eliminare registrazioni duplicate mantenendo quella più affidabile per fonte'
      })
    }
    
    if (issueTypes.has('excessive_hours')) {
      recommendations.push({
        priority: 'medium',
        action: 'Verificare ore eccessive',
        description: 'Controllare manualmente giorni con più di 12 ore per validare la correttezza'
      })
    }
    
    if (issueTypes.has('calculation_error')) {
      recommendations.push({
        priority: 'medium',
        action: 'Ricalcolare costi',
        description: 'Aggiornare tutti i costi totali con calcolo automatico ore × paga oraria'
      })
    }
    
    if (issueTypes.has('source_conflicts')) {
      recommendations.push({
        priority: 'low',
        action: 'Rivedere workflow registrazione',
        description: 'Stabilire priorità tra fonti per evitare registrazioni duplicate da fonti diverse'
      })
    }
    
    return recommendations
  }

  /**
   * Mostra risultati in console con formattazione
   */
  displayResults() {
    const { summary, issueBreakdown, recommendations } = this.report
    
    console.log('\n🎯 ======== REPORT COERENZA ORE DIPENDENTI ========')
    console.log(`📊 Record analizzati: ${summary.totalRecords}`)
    console.log(`🔍 Problemi rilevati: ${summary.totalIssues}`)
    console.log(`👥 Dipendenti coinvolti: ${summary.uniqueEmployees}`)
    console.log(`✅ Coerenza sistema: ${summary.coherencePercentage}%`)
    
    if (summary.totalIssues > 0) {
      console.log('\n📋 BREAKDOWN PROBLEMI:')
      Object.entries(issueBreakdown.byType).forEach(([type, count]) => {
        const emoji = this.getEmojiForIssueType(type)
        console.log(`  ${emoji} ${this.getIssueTypeLabel(type)}: ${count}`)
      })
      
      console.log('\n🚨 SEVERITÀ:')
      Object.entries(issueBreakdown.bySeverity).forEach(([severity, count]) => {
        const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'
        console.log(`  ${emoji} ${severity.toUpperCase()}: ${count}`)
      })
      
      if (recommendations.length > 0) {
        console.log('\n💡 RACCOMANDAZIONI:')
        recommendations.forEach((rec, index) => {
          const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'
          console.log(`  ${index + 1}. ${priority} ${rec.action}`)
          console.log(`     ${rec.description}`)
        })
      }
    } else {
      console.log('\n✨ SISTEMA COMPLETAMENTE COERENTE!')
      console.log('   Nessun problema rilevato nell\'analisi dei dati ore.')
    }
    
    console.log('\n================================================\n')
  }

  /**
   * Helper per ottenere nome dipendente
   */
  getDipendenteName(dipendenteId) {
    const dipendente = this.dipendenti.find(d => d.id === dipendenteId)
    return dipendente ? `${dipendente.nome} ${dipendente.cognome}` : `ID: ${dipendenteId}`
  }

  /**
   * Helper per emoji tipo problema
   */
  getEmojiForIssueType(type) {
    const emojis = {
      'field_inconsistency': '🔀',
      'duplicate_records': '📑', 
      'zero_hours': '⭕',
      'excessive_hours': '⏰',
      'insufficient_hours': '⚡',
      'source_conflicts': '🔀',
      'calculation_error': '💰'
    }
    return emojis[type] || '❓'
  }

  /**
   * Helper per label tipo problema
   */
  getIssueTypeLabel(type) {
    const labels = {
      'field_inconsistency': 'Campi Inconsistenti',
      'duplicate_records': 'Record Duplicati',
      'zero_hours': 'Ore Mancanti',
      'excessive_hours': 'Ore Eccessive', 
      'insufficient_hours': 'Ore Insufficienti',
      'source_conflicts': 'Conflitti Fonti',
      'calculation_error': 'Errori Calcolo'
    }
    return labels[type] || type
  }
}

// Export funzione di utilità per uso immediato
export const executeHoursCoherenceCheck = async () => {
  const checker = new HoursCoherenceChecker()
  return await checker.executeFullCheck()
} 