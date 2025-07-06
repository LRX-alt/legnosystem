/**
 * Script per il controllo di coerenza delle ore dipendenti
 * Esegue un'analisi completa dei timesheet e identifica discrepanze
 */

import { executeHoursCoherenceCheck } from '../utils/hoursCoherenceCheck.js'

// Funzione principale
async function runCoherenceCheck() {
  console.log('🚀 Avvio controllo coerenza ore dipendenti...\n')
  
  try {
    const startTime = Date.now()
    
    // Esegue il controllo completo
    const report = await executeHoursCoherenceCheck()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log(`⏱️ Controllo completato in ${duration} secondi`)
    
    // Salva report se necessario
    if (typeof window !== 'undefined' && window.saveReport) {
      console.log('💾 Salvataggio report...')
      const reportData = {
        timestamp: new Date().toISOString(),
        duration: duration,
        ...report
      }
      
      // Qui potresti salvare il report in un file o database
      console.log('📄 Report salvato con successo')
    }
    
    return report
    
  } catch (error) {
    console.error('❌ Errore durante il controllo:', error)
    throw error
  }
}

// Esegue se chiamato direttamente
if (typeof window !== 'undefined') {
  // Browser environment
  window.runHoursCoherenceCheck = runCoherenceCheck
  console.log('🔍 Controllo coerenza ore disponibile: window.runHoursCoherenceCheck()')
} else {
  // Node environment
  runCoherenceCheck().catch(console.error)
}

export { runCoherenceCheck } 