/**
 * 🔧 TIMESHEET VALIDATION UTILITY
 * Sistema centralizzato per validazione e correzione date timesheet
 * Previene i bug ricorrenti (01/01/2025, date vuote, etc.)
 */

export class TimesheetDateValidator {
  static PROBLEMATIC_DATES = [
    '2025-01-01', 
    '1970-01-01', 
    '', 
    null, 
    undefined
  ]

  /**
   * Valida e corregge una data per timesheet
   * @param {string} inputDate - Data da validare
   * @param {string} fallbackDate - Data di fallback (default: oggi)
   * @returns {Object} { isValid, correctedDate, originalDate, wasFixed }
   */
  static validateAndFixDate(inputDate, fallbackDate = null) {
    const originalDate = inputDate
    let correctedDate = inputDate
    let wasFixed = false
    let isValid = true

    // Fallback di default
    if (!fallbackDate) {
      fallbackDate = new Date().toISOString().split('T')[0]
    }

    // Controllo date problematiche
    if (this.PROBLEMATIC_DATES.includes(inputDate)) {
      correctedDate = fallbackDate
      wasFixed = true
      isValid = false
      console.warn(`🔧 Data problematica "${originalDate}" corretta in "${correctedDate}"`)
    }

    // Controllo formato date
    if (inputDate && typeof inputDate === 'string') {
      const dateObj = new Date(inputDate)
      if (isNaN(dateObj.getTime())) {
        correctedDate = fallbackDate
        wasFixed = true
        isValid = false
        console.warn(`🔧 Data formato invalido "${originalDate}" corretta in "${correctedDate}"`)
      }
    }

    // Controllo date future irrealistiche (oltre 1 anno)
    if (inputDate && typeof inputDate === 'string') {
      const dateObj = new Date(inputDate)
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      
      if (dateObj > oneYearFromNow) {
        correctedDate = fallbackDate
        wasFixed = true
        isValid = false
        console.warn(`🔧 Data futura irrealistica "${originalDate}" corretta in "${correctedDate}"`)
      }
    }

    return {
      isValid,
      correctedDate,
      originalDate,
      wasFixed,
      validationMessage: wasFixed ? `Data corretta da "${originalDate}" a "${correctedDate}"` : 'Data valida'
    }
  }

  /**
   * Valida dati completi timesheet
   * @param {Object} timesheetData - Dati timesheet da validare
   * @returns {Object} { isValid, errors, warnings, correctedData }
   */
  static validateTimesheetData(timesheetData) {
    const errors = []
    const warnings = []
    const correctedData = { ...timesheetData }

    // Validazione data
    const dateValidation = this.validateAndFixDate(timesheetData.data)
    if (dateValidation.wasFixed) {
      correctedData.data = dateValidation.correctedDate
      correctedData.dataOriginale = dateValidation.originalDate
      warnings.push(dateValidation.validationMessage)
    }

    // Validazione campi obbligatori
    if (!timesheetData.dipendenteId) {
      errors.push('ID dipendente mancante')
    }

    if (!timesheetData.ore && !timesheetData.oreLavorate) {
      errors.push('Ore lavorate mancanti')
    }

    // Validazione ore
    const ore = timesheetData.ore || timesheetData.oreLavorate || 0
    if (ore < 0) {
      errors.push('Le ore non possono essere negative')
    }
    if (ore > 24) {
      errors.push('Le ore non possono superare 24 per giorno')
    }
    if (ore > 12) {
      warnings.push(`Ore elevate: ${ore}h (verificare se corretto)`)
    }

    // Aggiunge metadati di validazione
    correctedData.validatedAt = new Date().toISOString()
    correctedData.validationVersion = '1.0'

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData
    }
  }

  /**
   * Scansiona e corregge array di timesheet
   * @param {Array} timesheetArray - Array di timesheet da correggere
   * @returns {Object} { correctedCount, totalCount, correctedTimesheet, report }
   */
  static auditAndFixTimesheetArray(timesheetArray) {
    let correctedCount = 0
    const correctedTimesheet = []
    const report = []

    timesheetArray.forEach((timesheet, index) => {
      const validation = this.validateTimesheetData(timesheet)
      
      if (validation.warnings.length > 0 || !validation.isValid) {
        correctedCount++
        report.push({
          id: timesheet.id || `index_${index}`,
          dipendenteId: timesheet.dipendenteId,
          originalDate: timesheet.data,
          correctedDate: validation.correctedData.data,
          warnings: validation.warnings,
          errors: validation.errors
        })
      }

      correctedTimesheet.push(validation.correctedData)
    })

    return {
      correctedCount,
      totalCount: timesheetArray.length,
      correctedTimesheet,
      report
    }
  }
}

/**
 * Utility per validazione rapida in funzioni esistenti
 */
export const validateTimesheetDate = (date, fallback = null) => {
  return TimesheetDateValidator.validateAndFixDate(date, fallback)
}

export const ensureValidTimesheetData = (data) => {
  return TimesheetDateValidator.validateTimesheetData(data)
}

export default TimesheetDateValidator 