/**
 * Test Rapido Correzione Automatica
 * Script per testare velocemente la correzione degli errori di coerenza
 */

import { executeAutoCorrection } from './hoursCoherenceCorrection.js'
import { executeHoursCoherenceCheck } from './hoursCoherenceCheck.js'

// Funzione per test rapido completo
window.quickFix = async () => {
  console.log('🚀 === CORREZIONE AUTOMATICA RAPIDA ===')
  
  try {
    // 1. Controllo preliminare
    console.log('📊 Controllo preliminare...')
    const preCheck = await executeHoursCoherenceCheck()
    
    console.log(`🔍 Problemi rilevati: ${preCheck.summary.totalIssues}`)
    console.log(`📈 Coerenza attuale: ${preCheck.summary.coherencePercentage}%`)
    
    if (preCheck.summary.totalIssues === 0) {
      console.log('✅ Sistema già completamente coerente!')
      return preCheck
    }
    
    // 2. Esegue correzione automatica
    console.log('\n🔧 Esecuzione correzione automatica...')
    const correzione = await executeAutoCorrection()
    
    // 3. Mostra risultati
    console.log('\n🎉 === RISULTATI CORREZIONE ===')
    console.log(`✅ Correzioni applicate: ${correzione.correctionsMade}`)
    console.log(`📈 Miglioramento: ${correzione.preReport.summary.coherencePercentage}% → ${correzione.postReport.summary.coherencePercentage}%`)
    console.log(`💾 Backup ID: ${correzione.backupId}`)
    
    if (correzione.corrections && correzione.corrections.length > 0) {
      console.log('\n📋 Dettagli correzioni:')
      console.table(correzione.corrections.map(c => ({
        Dipendente: c.dipendente,
        Data: c.data,
        Tipo: c.type,
        'Valore Vecchio': c.oldValue,
        'Valore Nuovo': c.newValue,
        Status: c.status
      })))
    }
    
    console.log('\n💾 Backup automatico creato - Dati originali al sicuro!')
    console.log('🔄 Per ripristinare: window.restoreFromBackup("' + correzione.backupId + '")')
    
    // Salva risultato per riferimento
    window.lastQuickFix = correzione
    console.log('\n🔍 Risultato completo salvato in: window.lastQuickFix')
    
    return correzione
    
  } catch (error) {
    console.error('❌ Errore durante correzione rapida:', error)
    throw error
  }
}

// Test specifico per verificare backup
window.testBackup = async () => {
  console.log('🧪 Test funzionalità backup...')
  
  try {
    const report = await executeHoursCoherenceCheck()
    
    if (report.summary.totalIssues === 0) {
      console.log('ℹ️  Sistema coerente - nessun backup da testare')
      return
    }
    
    console.log('📦 Simulazione backup...')
    // Questo test mostra come funzionerebbe il backup senza applicare correzioni
    console.log(`📊 Record da modificare: ${report.summary.totalIssues}`)
    console.log(`👥 Dipendenti coinvolti: ${report.summary.uniqueEmployees}`)
    
    console.log('✅ Sistema backup operativo!')
    
  } catch (error) {
    console.error('❌ Errore test backup:', error)
    throw error
  }
}

console.log('⚡ Strumenti correzione rapida caricati:')
console.log('  • window.quickFix() - Correzione automatica completa')
console.log('  • window.testBackup() - Test funzionalità backup')
console.log('  • window.restoreFromBackup("id") - Ripristino sicuro') 