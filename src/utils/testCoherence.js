/**
 * Test rapido per il controllo coerenza delle ore
 * Esegui da console: window.testCoherence()
 */

import { executeHoursCoherenceCheck } from './hoursCoherenceCheck.js'
import { executeAutoCorrection, restoreFromBackup } from './hoursCoherenceCorrection.js'

// Funzione di test semplificata
window.testCoherence = async () => {
  console.log('🚀 === TEST CONTROLLO COERENZA ORE ===')
  
  try {
    const startTime = Date.now()
    
    // Esegue il controllo
    const report = await executeHoursCoherenceCheck()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log(`\n⏱️ Controllo completato in ${duration}s`)
    console.log(`📊 Record analizzati: ${report.summary.totalRecords}`)
    console.log(`🔍 Problemi rilevati: ${report.summary.totalIssues}`)
    console.log(`👥 Dipendenti coinvolti: ${report.summary.uniqueEmployees}`)
    console.log(`✅ Coerenza: ${report.summary.coherencePercentage}%`)
    
    if (report.summary.totalIssues > 0) {
      console.log(`\n🚨 PROBLEMI RILEVATI:`)
      Object.entries(report.issueBreakdown.byType).forEach(([type, count]) => {
        console.log(`  • ${type}: ${count}`)
      })
      
      console.log(`\n📋 DETTAGLI:`)
      console.table(report.detailedIssues.slice(0, 5)) // Mostra solo i primi 5
      
      if (report.recommendations.length > 0) {
        console.log(`\n💡 RACCOMANDAZIONI:`)
        report.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`)
        })
      }
    } else {
      console.log(`\n✨ SISTEMA COMPLETAMENTE COERENTE!`)
    }
    
    console.log(`\n🔍 Report completo disponibile in: window.lastCoherenceReport`)
    window.lastCoherenceReport = report
    
    return report
    
  } catch (error) {
    console.error('❌ Errore durante test:', error)
    throw error
  }
}

// Funzione per analizzare un dipendente specifico
window.testEmployeeCoherence = async (dipendenteId) => {
  console.log(`🔍 Analisi coerenza dipendente: ${dipendenteId}`)
  
  try {
    const report = await executeHoursCoherenceCheck()
    
    // Filtra solo i problemi del dipendente specificato
    const employeeIssues = report.detailedIssues.filter(issue => 
      issue.dipendente && issue.dipendente.toLowerCase().includes(dipendenteId.toLowerCase())
    )
    
    console.log(`\n📊 Problemi trovati per dipendente: ${employeeIssues.length}`)
    
    if (employeeIssues.length > 0) {
      console.table(employeeIssues)
    } else {
      console.log('✅ Nessun problema rilevato per questo dipendente')
    }
    
    return employeeIssues
    
  } catch (error) {
    console.error('❌ Errore durante analisi dipendente:', error)
    throw error
  }
}

// Funzione per eseguire correzioni automatiche
window.autoFixCoherence = async () => {
  console.log('🔧 ATTENZIONE: Funzione di correzione automatica')
  console.log('⚠️  Questa funzione modificherà i dati in Firestore')
  console.log('💡 Per sicurezza, esegui prima: window.testCoherence()')
  
  const conferma = window.confirm('Sei sicuro di voler procedere con la correzione automatica?')
  if (!conferma) {
    console.log('❌ Correzione annullata dall\'utente')
    return
  }
  
  try {
    console.log('🚀 Avvio correzione automatica...')
    
    const risultato = await executeAutoCorrection()
    
    console.log('✅ Correzione completata!')
    console.log(`📊 Correzioni applicate: ${risultato.correctionsMade}`)
    console.log(`📈 Miglioramento coerenza: ${risultato.preReport.summary.coherencePercentage}% → ${risultato.postReport.summary.coherencePercentage}%`)
    console.log(`💾 Backup ID: ${risultato.backupId}`)
    
    console.log('\n📋 Dettagli correzioni:')
    console.table(risultato.corrections)
    
    // Salva il risultato per riferimento
    window.lastCorrectionResult = risultato
    console.log('\n🔍 Risultato completo salvato in: window.lastCorrectionResult')
    
    return risultato
    
  } catch (error) {
    console.error('❌ Errore durante correzione automatica:', error)
    throw error
  }
}

// Funzione per ripristinare da backup
window.restoreFromBackup = async (backupId) => {
  console.log(`🔄 Ripristino da backup: ${backupId}`)
  
  if (!backupId) {
    console.error('❌ ID backup richiesto')
    return
  }
  
  const conferma = window.confirm(`Sei sicuro di voler ripristinare il backup ${backupId}?`)
  if (!conferma) {
    console.log('❌ Ripristino annullato dall\'utente')
    return
  }
  
  try {
    const risultato = await restoreFromBackup(backupId)
    console.log('✅ Ripristino completato!')
    console.log(`📊 Record ripristinati: ${risultato.restoredRecords}`)
    
    return risultato
    
  } catch (error) {
    console.error('❌ Errore durante ripristino:', error)
    throw error
  }
}

console.log('🔍 Strumenti controllo coerenza caricati:')
console.log('  • window.testCoherence() - Controllo completo')
console.log('  • window.testEmployeeCoherence("nome") - Analisi dipendente')
console.log('  • window.autoFixCoherence() - Correzioni automatiche')
console.log('  • window.restoreFromBackup("backupId") - Ripristino da backup') 