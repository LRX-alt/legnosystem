/**
 * 🧪 TIMESHEET SYSTEM TESTER
 * Test automatico per verificare che tutte le funzioni di creazione timesheet
 * usino la validazione centralizzata e non creino più date problematiche
 */

import { TimesheetDateValidator } from './timesheetValidation.js'

export class TimesheetSystemTester {
  constructor() {
    this.totalTests = 0
    this.passedTests = 0
    this.failedTests = 0
    this.results = []
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      results: []
    }
  }

  /**
   * 🧪 Esegue tutti i test di validazione
   */
  async runAllTests() {
    console.log('🧪 ===============================================')
    console.log('🧪 AVVIO TEST SISTEMA TIMESHEET')
    console.log('🧪 ===============================================')

    // Test validazione date
    await this.testDateValidation()
    
    // Test validazione dati completi
    await this.testDataValidation()
    
    // Test edge cases
    await this.testEdgeCases()

    // Genera report finale
    this.generateTestReport()
    
    return this.testResults
  }

  /**
   * 📅 Test validazione date
   */
  async testDateValidation() {
    console.log('📅 Test validazione date...')
    
    const testCases = [
      { input: '2025-01-01', expectedFixed: true, description: 'Data bug principale' },
      { input: '1970-01-01', expectedFixed: true, description: 'Data epoch invalida' },
      { input: '', expectedFixed: true, description: 'Data vuota' },
      { input: null, expectedFixed: true, description: 'Data null' },
      { input: undefined, expectedFixed: true, description: 'Data undefined' },
      { input: '2024-07-08', expectedFixed: false, description: 'Data valida corrente' },
      { input: '2023-12-25', expectedFixed: false, description: 'Data valida passata' },
      { input: 'invalid-date', expectedFixed: true, description: 'Formato data invalido' },
      { input: '2026-12-31', expectedFixed: true, description: 'Data futura irrealistica' }
    ]

    for (const testCase of testCases) {
      this.totalTests++
      
      try {
        const result = TimesheetDateValidator.validateAndFixDate(testCase.input)
        
        if (result.wasFixed === testCase.expectedFixed) {
          this.passedTests++
          this.results.push({
            test: `Date validation: ${testCase.description}`,
            status: 'PASS',
            input: testCase.input,
            result: result.correctedDate
          })
        } else {
          this.failedTests++
          this.results.push({
            test: `Date validation: ${testCase.description}`,
            status: 'FAIL',
            input: testCase.input,
            expected: `wasFixed: ${testCase.expectedFixed}`,
            actual: `wasFixed: ${result.wasFixed}`
          })
        }
      } catch (error) {
        this.failedTests++
        this.results.push({
          test: `Date validation: ${testCase.description}`,
          status: 'ERROR',
          error: error.message
        })
      }
    }
  }

  /**
   * 📊 Test validazione dati completi
   */
  async testDataValidation() {
    console.log('📊 Test validazione dati completi...')
    
    const testCases = [
      {
        data: {
          dipendenteId: 'test-id',
          data: '2025-01-01',
          ore: 8,
          cantiere: 'Test Cantiere'
        },
        shouldBeValid: false,
        description: 'Timesheet con data problematica'
      },
      {
        data: {
          dipendenteId: 'test-id',
          data: '2024-07-08',
          ore: 8,
          cantiere: 'Test Cantiere'
        },
        shouldBeValid: true,
        description: 'Timesheet valido'
      },
      {
        data: {
          dipendenteId: '',
          data: '2024-07-08',
          ore: 8,
          cantiere: 'Test Cantiere'
        },
        shouldBeValid: false,
        description: 'Timesheet senza dipendente'
      },
      {
        data: {
          dipendenteId: 'test-id',
          data: '2024-07-08',
          ore: -5,
          cantiere: 'Test Cantiere'
        },
        shouldBeValid: false,
        description: 'Timesheet con ore negative'
      },
      {
        data: {
          dipendenteId: 'test-id',
          data: '2024-07-08',
          ore: 30,
          cantiere: 'Test Cantiere'
        },
        shouldBeValid: false,
        description: 'Timesheet con ore eccessive'
      }
    ]

    for (const testCase of testCases) {
      this.totalTests++
      
      try {
        const result = TimesheetDateValidator.validateTimesheetData(testCase.data)
        
        if (result.isValid === testCase.shouldBeValid) {
          this.passedTests++
          this.results.push({
            test: `Data validation: ${testCase.description}`,
            status: 'PASS',
            expected: `valid: ${testCase.shouldBeValid}`,
            actual: `valid: ${result.isValid}`
          })
        } else {
          this.failedTests++
          this.results.push({
            test: `Data validation: ${testCase.description}`,
            status: 'FAIL',
            expected: `valid: ${testCase.shouldBeValid}`,
            actual: `valid: ${result.isValid}`,
            errors: result.errors,
            warnings: result.warnings
          })
        }
      } catch (error) {
        this.failedTests++
        this.results.push({
          test: `Data validation: ${testCase.description}`,
          status: 'ERROR',
          error: error.message
        })
      }
    }
  }

  /**
   * 🔬 Test edge cases
   */
  async testEdgeCases() {
    console.log('🔬 Test edge cases...')
    
    // Test con dati null/undefined
    this.totalTests++
    try {
      const result = TimesheetDateValidator.validateTimesheetData({})
      if (!result.isValid) {
        this.passedTests++
        this.results.push({
          test: 'Edge case: dati vuoti',
          status: 'PASS',
          note: 'Correttamente identificato come invalido'
        })
      } else {
        this.failedTests++
        this.results.push({
          test: 'Edge case: dati vuoti',
          status: 'FAIL',
          note: 'Dovrebbe essere invalido ma è stato validato'
        })
      }
    } catch (error) {
      this.failedTests++
      this.results.push({
        test: 'Edge case: dati vuoti',
        status: 'ERROR',
        error: error.message
      })
    }

    // Test audit array
    this.totalTests++
    try {
      const testArray = [
        { id: '1', data: '2025-01-01', ore: 8, dipendenteId: 'test' },
        { id: '2', data: '2024-07-08', ore: 8, dipendenteId: 'test' }
      ]
      
      const auditResult = TimesheetDateValidator.auditAndFixTimesheetArray(testArray)
      
      if (auditResult.correctedCount === 1 && auditResult.totalCount === 2) {
        this.passedTests++
        this.results.push({
          test: 'Edge case: audit array',
          status: 'PASS',
          note: `Corretti ${auditResult.correctedCount}/${auditResult.totalCount} record`
        })
      } else {
        this.failedTests++
        this.results.push({
          test: 'Edge case: audit array',
          status: 'FAIL',
          expected: 'correctedCount: 1, totalCount: 2',
          actual: `correctedCount: ${auditResult.correctedCount}, totalCount: ${auditResult.totalCount}`
        })
      }
    } catch (error) {
      this.failedTests++
      this.results.push({
        test: 'Edge case: audit array',
        status: 'ERROR',
        error: error.message
      })
    }
  }

  /**
   * 📋 Genera report finale dei test
   */
  generateTestReport() {
    this.testResults = {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      results: this.results,
      success: this.failedTests === 0
    }

    console.log('📋 ===============================================')
    console.log('📋 REPORT TEST COMPLETATO')
    console.log('📋 ===============================================')
    console.log(`📊 Test totali: ${this.totalTests}`)
    console.log(`✅ Test passati: ${this.passedTests}`)
    console.log(`❌ Test falliti: ${this.failedTests}`)
    console.log(`🎯 Successo: ${this.testResults.success ? 'SÌ' : 'NO'}`)

    if (this.failedTests > 0) {
      console.log('\n❌ Test falliti:')
      this.results.filter(r => r.status !== 'PASS').forEach(result => {
        console.log(`   - ${result.test}: ${result.status}`)
        if (result.error) console.log(`     Errore: ${result.error}`)
        if (result.expected) console.log(`     Atteso: ${result.expected}`)
        if (result.actual) console.log(`     Ottenuto: ${result.actual}`)
      })
    }

    return this.testResults
  }

  /**
   * 📝 Genera report utente
   */
  generateUserReport() {
    const { totalTests, passedTests, failedTests, success } = this.testResults

    let report = `🧪 TEST SISTEMA TIMESHEET\n\n`
    report += `📊 RISULTATI:\n`
    report += `   • Test eseguiti: ${totalTests}\n`
    report += `   • Test passati: ${passedTests}\n`
    report += `   • Test falliti: ${failedTests}\n\n`

    if (success) {
      report += `🎉 SUCCESSO: Tutti i test sono passati!\n`
      report += `✅ Il sistema di validazione funziona correttamente.\n`
    } else {
      report += `⚠️ ATTENZIONE: ${failedTests} test hanno fallito.\n`
      report += `🔧 Verificare la configurazione del sistema.\n`
    }

    return report
  }
}

export default TimesheetSystemTester 