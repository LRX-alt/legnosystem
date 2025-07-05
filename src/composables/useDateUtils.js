/**
 * Composable per gestione date robusta
 * Supporta timestamp Firestore, Date JS, stringhe ISO
 */

export const useDateUtils = () => {
  
  /**
   * Converte vari formati di date in oggetto Date JavaScript
   * @param {*} dateInput - Date, timestamp Firestore, stringa ISO, etc.
   * @returns {Date|null} - Date valida o null se non valida
   */
  const parseDate = (dateInput) => {
    if (!dateInput) return null
    
    try {
      // Se è già un oggetto Date
      if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput
      }
      
      // Se è un timestamp Firestore (ha proprietà seconds)
      if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
        return new Date(dateInput.seconds * 1000)
      }
      
      // Se è un timestamp Unix (numero)
      if (typeof dateInput === 'number') {
        // Se è in secondi (Unix timestamp)
        if (dateInput < 1e12) {
          return new Date(dateInput * 1000)
        }
        // Se è in millisecondi
        return new Date(dateInput)
      }
      
      // Se è una stringa
      if (typeof dateInput === 'string') {
        // Stringa vuota
        if (dateInput.trim() === '') return null
        
        // Prova a parsare come ISO string o formato standard
        const parsed = new Date(dateInput)
        return isNaN(parsed.getTime()) ? null : parsed
      }
      
      return null
    } catch (error) {
      console.warn('Errore nel parsing della data:', dateInput, error)
      return null
    }
  }

  /**
   * Formatta una data in formato italiano (dd/mm/yyyy)
   * @param {*} dateInput - Data da formattare
   * @param {string} fallback - Testo da mostrare se data non valida
   * @returns {string} - Data formattata o fallback
   */
  const formatDate = (dateInput, fallback = 'Non disponibile') => {
    const date = parseDate(dateInput)
    if (!date) return fallback
    
    try {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Errore nella formattazione della data:', dateInput, error)
      return fallback
    }
  }

  /**
   * Formatta una data con ora in formato italiano
   * @param {*} dateInput - Data da formattare
   * @param {string} fallback - Testo da mostrare se data non valida
   * @returns {string} - Data e ora formattate o fallback
   */
  const formatDateTime = (dateInput, fallback = 'Non disponibile') => {
    const date = parseDate(dateInput)
    if (!date) return fallback
    
    try {
      return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.warn('Errore nella formattazione della data/ora:', dateInput, error)
      return fallback
    }
  }

  /**
   * Formatta una data in formato relativo (es. "2 giorni fa")
   * @param {*} dateInput - Data da formattare
   * @param {string} fallback - Testo da mostrare se data non valida
   * @returns {string} - Data relativa o fallback
   */
  const formatRelativeDate = (dateInput, fallback = 'Non disponibile') => {
    const date = parseDate(dateInput)
    if (!date) return fallback
    
    try {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          if (diffMinutes <= 0) return 'Ora'
          return `${diffMinutes} minuti fa`
        }
        return `${diffHours} ore fa`
      } else if (diffDays === 1) {
        return 'Ieri'
      } else if (diffDays < 7) {
        return `${diffDays} giorni fa`
      } else if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7)
        return `${diffWeeks} settimane fa`
      } else {
        return formatDate(dateInput, fallback)
      }
    } catch (error) {
      console.warn('Errore nella formattazione della data relativa:', dateInput, error)
      return fallback
    }
  }

  /**
   * Verifica se una data è scaduta
   * @param {*} dateInput - Data da verificare
   * @returns {boolean} - True se scaduta, false altrimenti
   */
  const isExpired = (dateInput) => {
    const date = parseDate(dateInput)
    if (!date) return false
    
    const now = new Date()
    return date < now
  }

  /**
   * Calcola i giorni tra due date
   * @param {*} startDate - Data di inizio
   * @param {*} endDate - Data di fine (default: oggi)
   * @returns {number} - Numero di giorni (negativo se startDate è nel futuro)
   */
  const daysBetween = (startDate, endDate = new Date()) => {
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    
    if (!start || !end) return 0
    
    const diffMs = end.getTime() - start.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  /**
   * Converte una data in formato ISO per input HTML
   * @param {*} dateInput - Data da convertire
   * @returns {string} - Data in formato YYYY-MM-DD o stringa vuota
   */
  const toInputDate = (dateInput) => {
    const date = parseDate(dateInput)
    if (!date) return ''
    
    try {
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.warn('Errore nella conversione per input:', dateInput, error)
      return ''
    }
  }

  /**
   * Verifica se una data è valida
   * @param {*} dateInput - Data da verificare
   * @returns {boolean} - True se valida, false altrimenti
   */
  const isValidDate = (dateInput) => {
    return parseDate(dateInput) !== null
  }

  /**
   * Ottiene il nome del giorno della settimana in italiano
   * @param {*} dateInput - Data da analizzare
   * @returns {string} - Nome del giorno o stringa vuota
   */
  const getDayName = (dateInput) => {
    const date = parseDate(dateInput)
    if (!date) return ''
    
    try {
      return date.toLocaleDateString('it-IT', { weekday: 'long' })
    } catch (error) {
      console.warn('Errore nell\'ottenere il nome del giorno:', dateInput, error)
      return ''
    }
  }

  /**
   * Ottiene il nome del mese in italiano
   * @param {*} dateInput - Data da analizzare
   * @returns {string} - Nome del mese o stringa vuota
   */
  const getMonthName = (dateInput) => {
    const date = parseDate(dateInput)
    if (!date) return ''
    
    try {
      return date.toLocaleDateString('it-IT', { month: 'long' })
    } catch (error) {
      console.warn('Errore nell\'ottenere il nome del mese:', dateInput, error)
      return ''
    }
  }

  /**
   * Crea una data di scadenza basata su giorni dal oggi
   * @param {number} days - Numero di giorni da aggiungere
   * @returns {Date} - Data di scadenza
   */
  const addDays = (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
  }

  /**
   * Formatta una durata in giorni in formato leggibile
   * @param {number} days - Numero di giorni
   * @returns {string} - Durata formattata
   */
  const formatDuration = (days) => {
    if (days === 0) return 'Oggi'
    if (days === 1) return '1 giorno'
    if (days < 7) return `${days} giorni`
    if (days < 30) {
      const weeks = Math.floor(days / 7)
      const remainingDays = days % 7
      let result = `${weeks} settimane`
      if (remainingDays > 0) result += ` e ${remainingDays} giorni`
      return result
    }
    if (days < 365) {
      const months = Math.floor(days / 30)
      const remainingDays = days % 30
      let result = `${months} mesi`
      if (remainingDays > 0) result += ` e ${remainingDays} giorni`
      return result
    }
    const years = Math.floor(days / 365)
    const remainingDays = days % 365
    let result = `${years} anni`
    if (remainingDays > 0) result += ` e ${remainingDays} giorni`
    return result
  }

  return {
    parseDate,
    formatDate,
    formatDateTime,
    formatRelativeDate,
    isExpired,
    daysBetween,
    toInputDate,
    isValidDate,
    getDayName,
    getMonthName,
    addDays,
    formatDuration
  }
} 