// 🛡️ Sistema di Validazione per Firestore
export const firestoreValidation = {
  
  // 🏗️ Validazione Cantieri
  cantiere: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome cantiere obbligatorio')
      }
      
      if (!data.cliente) {
        errors.push('Cliente obbligatorio')
      }
      
      if (!data.dataInizio) {
        errors.push('Data inizio obbligatoria')
      }
      
      if (!data.scadenza) {
        errors.push('Data scadenza obbligatoria')
      }
      
      if (!data.indirizzo?.trim()) {
        errors.push('Indirizzo cantiere obbligatorio')
      }

      if (!data.tipoLavoro?.trim()) {
        errors.push('Tipo lavoro obbligatorio')
      }

      if (!data.valore || isNaN(parseFloat(data.valore)) || parseFloat(data.valore) <= 0) {
        errors.push('Valore cantiere deve essere un numero positivo')
      }
      
      // Validate date order
      if (data.dataInizio && data.scadenza) {
        const inizio = new Date(data.dataInizio)
        const scadenza = new Date(data.scadenza)
        if (inizio >= scadenza) {
          errors.push('La data di scadenza deve essere successiva alla data di inizio')
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          indirizzo: data.indirizzo.trim(),
          tipoLavoro: data.tipoLavoro.trim(),
          valore: parseFloat(data.valore),
          stato: data.stato || 'pianificato',
          priorita: data.priorita || 'media',
          progresso: 0,
          team: data.team || [],
          costiAccumulati: {
            materiali: 0,
            manodopera: 0,
            totale: 0
          }
        } : null
      }
    },
    
    update: (data) => {
      const errors = []
      
      if (data.nome !== undefined && !data.nome?.trim()) {
        errors.push('Nome cantiere non può essere vuoto')
      }
      
      if (data.valore !== undefined && (isNaN(parseFloat(data.valore)) || parseFloat(data.valore) <= 0)) {
        errors.push('Valore cantiere deve essere un numero positivo')
      }
      
      if (data.progresso !== undefined) {
        const prog = parseFloat(data.progresso)
        if (isNaN(prog) || prog < 0 || prog > 100) {
          errors.push('Progresso deve essere tra 0 e 100')
        }
      }
      
      // Validate date order if both dates are present
      if (data.dataInizio && data.scadenza) {
        const inizio = new Date(data.dataInizio)
        const scadenza = new Date(data.scadenza)
        if (inizio >= scadenza) {
          errors.push('La data di scadenza deve essere successiva alla data di inizio')
        }
      }
      
      // Sanifica i dati rimuovendo i campi undefined
      const sanitizedData = {}
      
      // Copia solo i campi definiti
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          switch (key) {
            case 'nome':
            case 'indirizzo':
            case 'tipoLavoro':
              sanitizedData[key] = data[key]?.trim()
              break
            case 'valore':
              sanitizedData[key] = parseFloat(data[key])
              break
            case 'progresso':
              sanitizedData[key] = parseFloat(data[key])
              break
            case 'cliente':
            case 'team':
            case 'costiAccumulati':
              sanitizedData[key] = data[key]
              break
            default:
              sanitizedData[key] = data[key]
          }
        }
      })
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : null
      }
    }
  },

  // 👤 Validazione Clienti
  cliente: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome cliente obbligatorio')
      }
      
      if (data.email && !isValidEmail(data.email)) {
        errors.push('Email non valida')
      }
      
      if (data.telefono && !isValidPhone(data.telefono)) {
        errors.push('Numero di telefono non valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          email: data.email?.trim().toLowerCase() || '',
          telefono: sanitizePhone(data.telefono) || '',
          indirizzo: data.indirizzo?.trim() || '',
          note: data.note?.trim() || ''
        } : null
      }
    }
  },

  // 👥 Validazione Dipendenti
  dipendente: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome dipendente obbligatorio')
      }
      
      if (!data.cognome?.trim()) {
        errors.push('Cognome dipendente obbligatorio')
      }
      
      if (!data.ruolo?.trim()) {
        errors.push('Ruolo obbligatorio')
      }
      
      if (data.email && !isValidEmail(data.email)) {
        errors.push('Email non valida')
      }
      
      if (data.telefono && !isValidPhone(data.telefono)) {
        errors.push('Numero di telefono non valido')
      }
      
      if (data.salario_orario && isNaN(parseFloat(data.salario_orario))) {
        errors.push('Salario orario deve essere un numero valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          cognome: data.cognome.trim(),
          ruolo: data.ruolo.trim(),
          email: data.email?.trim().toLowerCase() || '',
          telefono: sanitizePhone(data.telefono) || '',
          salario_orario: data.salario_orario ? parseFloat(data.salario_orario) : 0
        } : null
      }
    }
  },

  // 📦 Validazione Materiali
  materiale: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome materiale obbligatorio')
      }
      
      if (!data.categoria?.trim()) {
        errors.push('Categoria obbligatoria')
      }
      
      if (data.quantita && isNaN(parseFloat(data.quantita))) {
        errors.push('Quantità deve essere un numero valido')
      }
      
      if (data.prezzo_unitario && isNaN(parseFloat(data.prezzo_unitario))) {
        errors.push('Prezzo unitario deve essere un numero valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          categoria: data.categoria.trim(),
          descrizione: data.descrizione?.trim() || '',
          quantita: data.quantita ? parseFloat(data.quantita) : 0,
          prezzo_unitario: data.prezzo_unitario ? parseFloat(data.prezzo_unitario) : 0,
          unita_misura: data.unita_misura?.trim() || 'pz'
        } : null
      }
    }
  },

  // 📦 Validazione Materiali Cantiere
  materialeCantiere: {
    create: (data) => {
      const errors = []
      
      if (!data.materialeId) {
        errors.push('ID materiale obbligatorio')
      }
      
      if (!data.cantiereId) {
        errors.push('ID cantiere obbligatorio')
      }
      
      if (!data.quantita || isNaN(parseFloat(data.quantita)) || parseFloat(data.quantita) <= 0) {
        errors.push('Quantità deve essere un numero positivo')
      }
      
      if (!data.prezzoUnitario || isNaN(parseFloat(data.prezzoUnitario)) || parseFloat(data.prezzoUnitario) < 0) {
        errors.push('Prezzo unitario deve essere un numero non negativo')
      }
      
      if (!data.stato || !['pianificato', 'ordinato', 'in-uso', 'utilizzato', 'completato'].includes(data.stato)) {
        errors.push('Stato non valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          quantita: parseFloat(data.quantita),
          prezzoUnitario: parseFloat(data.prezzoUnitario),
          costoTotale: parseFloat(data.quantita) * parseFloat(data.prezzoUnitario),
          stato: data.stato,
          note: data.note?.trim() || ''
        } : null
      }
    },
    
    update: (data) => {
      const errors = []
      
      if (data.quantita !== undefined) {
        if (isNaN(parseFloat(data.quantita)) || parseFloat(data.quantita) <= 0) {
          errors.push('Quantità deve essere un numero positivo')
        }
      }
      
      if (data.prezzoUnitario !== undefined) {
        if (isNaN(parseFloat(data.prezzoUnitario)) || parseFloat(data.prezzoUnitario) < 0) {
          errors.push('Prezzo unitario deve essere un numero non negativo')
        }
      }
      
      if (data.stato && !['pianificato', 'ordinato', 'in-uso', 'utilizzato', 'completato'].includes(data.stato)) {
        errors.push('Stato non valido')
      }
      
      const sanitizedData = {}
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          switch (key) {
            case 'quantita':
            case 'prezzoUnitario':
              sanitizedData[key] = parseFloat(data[key])
              break
            case 'note':
              sanitizedData[key] = data[key]?.trim()
              break
            default:
              sanitizedData[key] = data[key]
          }
        }
      })
      
      // Calcola il costo totale se necessario
      if (sanitizedData.quantita !== undefined || sanitizedData.prezzoUnitario !== undefined) {
        sanitizedData.costoTotale = 
          (sanitizedData.quantita || data.quantita) * 
          (sanitizedData.prezzoUnitario || data.prezzoUnitario)
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : null
      }
    }
  },

  // 📎 Validazione Allegati
  allegato: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome file obbligatorio')
      }
      
      if (!data.url?.trim()) {
        errors.push('URL file obbligatorio')
      }
      
      if (!data.tipo?.trim()) {
        errors.push('Tipo file obbligatorio')
      }
      
      // Validate file size (max 10MB)
      if (data.dimensione && data.dimensione > 10 * 1024 * 1024) {
        errors.push('File troppo grande (max 10MB)')
      }
      
      // Validate file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt']
      if (data.tipo && !allowedTypes.includes(data.tipo.toLowerCase())) {
        errors.push(`Tipo file non supportato. Tipi consentiti: ${allowedTypes.join(', ')}`)
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          url: data.url.trim(),
          tipo: data.tipo.toLowerCase(),
          descrizione: data.descrizione?.trim() || '',
          dimensione: data.dimensione || 0
        } : null
      }
    }
  },

  // 📎 Validazione Allegati Materiali
  allegatoMateriale: {
    create: (data) => {
      const errors = []
      
      if (!data.materialeId) {
        errors.push('ID materiale obbligatorio')
      }
      
      if (!data.nome?.trim()) {
        errors.push('Nome file obbligatorio')
      }
      
      if (!data.url?.trim()) {
        errors.push('URL file obbligatorio')
      }
      
      if (!data.tipo?.trim()) {
        errors.push('Tipo file obbligatorio')
      }
      
      // Validate file size (max 10MB)
      if (data.dimensione && data.dimensione > 10 * 1024 * 1024) {
        errors.push('File troppo grande (max 10MB)')
      }
      
      // Validate file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'dwg', 'dxf']
      if (data.tipo && !allowedTypes.includes(data.tipo.toLowerCase())) {
        errors.push(`Tipo file non supportato. Tipi consentiti: ${allowedTypes.join(', ')}`)
      }
      
      // Validate file name length
      if (data.nome && data.nome.length > 255) {
        errors.push('Nome file troppo lungo (max 255 caratteri)')
      }
      
      // Validate file name characters
      const invalidChars = /[<>:"/\\|?*]/
      if (data.nome && invalidChars.test(data.nome)) {
        errors.push('Nome file contiene caratteri non validi')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          url: data.url.trim(),
          tipo: data.tipo.toLowerCase(),
          descrizione: data.descrizione?.trim() || '',
          dimensione: data.dimensione || 0,
          dataCaricamento: new Date().toISOString(),
          categoria: data.categoria?.trim() || 'generale'
        } : null
      }
    },
    
    update: (data) => {
      const errors = []
      
      if (data.nome !== undefined && !data.nome?.trim()) {
        errors.push('Nome file non può essere vuoto')
      }
      
      if (data.tipo) {
        const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'dwg', 'dxf']
        if (!allowedTypes.includes(data.tipo.toLowerCase())) {
          errors.push(`Tipo file non supportato. Tipi consentiti: ${allowedTypes.join(', ')}`)
        }
      }
      
      if (data.nome && data.nome.length > 255) {
        errors.push('Nome file troppo lungo (max 255 caratteri)')
      }
      
      const invalidChars = /[<>:"/\\|?*]/
      if (data.nome && invalidChars.test(data.nome)) {
        errors.push('Nome file contiene caratteri non validi')
      }
      
      const sanitizedData = {}
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          switch (key) {
            case 'nome':
            case 'descrizione':
            case 'categoria':
              sanitizedData[key] = data[key]?.trim()
              break
            case 'tipo':
              sanitizedData[key] = data[key].toLowerCase()
              break
            default:
              sanitizedData[key] = data[key]
          }
        }
      })
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : null
      }
    }
  },

  // 🚛 Validazione Mezzi
  mezzo: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome mezzo obbligatorio')
      }
      
      if (!data.tipo?.trim()) {
        errors.push('Tipo mezzo obbligatorio')
      }
      
      if (!data.targa?.trim()) {
        errors.push('Targa/Matricola obbligatoria')
      }
      
      if (data.costoOrario !== undefined && (isNaN(parseFloat(data.costoOrario)) || parseFloat(data.costoOrario) < 0)) {
        errors.push('Costo orario deve essere un numero non negativo')
      }
      
      if (data.statoOperativo && !['disponibile', 'in-uso', 'manutenzione', 'fuori-servizio'].includes(data.statoOperativo)) {
        errors.push('Stato operativo non valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          tipo: data.tipo.trim(),
          targa: data.targa.trim(),
          costoOrario: data.costoOrario ? parseFloat(data.costoOrario) : 0,
          statoOperativo: data.statoOperativo || 'disponibile',
          note: data.note?.trim() || '',
          manutenzioniProgrammate: data.manutenzioniProgrammate || [],
          cantiereId: data.cantiereId || null,
          dataUltimaRevisione: data.dataUltimaRevisione || null,
          dataProssimaRevisione: data.dataProssimaRevisione || null
        } : null
      }
    },
    
    update: (data) => {
      const errors = []
      
      if (data.nome !== undefined && !data.nome?.trim()) {
        errors.push('Nome mezzo non può essere vuoto')
      }
      
      if (data.costoOrario !== undefined && (isNaN(parseFloat(data.costoOrario)) || parseFloat(data.costoOrario) < 0)) {
        errors.push('Costo orario deve essere un numero non negativo')
      }
      
      if (data.statoOperativo && !['disponibile', 'in-uso', 'manutenzione', 'fuori-servizio'].includes(data.statoOperativo)) {
        errors.push('Stato operativo non valido')
      }
      
      const sanitizedData = {}
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          switch (key) {
            case 'nome':
            case 'tipo':
            case 'targa':
            case 'note':
              sanitizedData[key] = data[key]?.trim()
              break
            case 'costoOrario':
              sanitizedData[key] = parseFloat(data[key])
              break
            case 'manutenzioniProgrammate':
              sanitizedData[key] = Array.isArray(data[key]) ? data[key] : []
              break
            default:
              sanitizedData[key] = data[key]
          }
        }
      })
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : null
      }
    }
  }
}

// 🔧 Utility Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone) {
  // Italian phone number validation
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

function sanitizePhone(phone) {
  if (!phone) return ''
  // Remove all non-digit characters except +
  return phone.replace(/[^\d\+]/g, '')
}

// 🔐 Validazione Sicurezza

/**
 * Valida un indirizzo email
 * @param {string} email - L'indirizzo email da validare
 * @returns {object} Risultato della validazione
 */
export const validateEmail = (email) => {
  const errors = []
  
  if (!email?.trim()) {
    errors.push('Email obbligatoria')
    return { isValid: false, errors }
  }
  
  // Regex per email valida
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    errors.push('Formato email non valido')
  }
  
  // Lista domini email aziendali consentiti
  const allowedDomains = [
    'legnosystem.bio',
    'legnosystem.it',
    'legnosystem.com',
    // Aggiungi altri domini consentiti
  ]
  
  const emailDomain = email.split('@')[1]?.toLowerCase()
  // La restrizione ai soli domini aziendali è opzionale e controllata da ENV
  const requireCompanyEmail = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REQUIRE_COMPANY_EMAIL === 'true'
  if (requireCompanyEmail && !allowedDomains.includes(emailDomain)) {
    errors.push('Usa un indirizzo email aziendale')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida una password
 * @param {string} password - La password da validare
 * @returns {object} Risultato della validazione
 */
export const validatePassword = (password) => {
  const errors = []
  
  if (!password) {
    errors.push('Password obbligatoria')
    return { isValid: false, errors }
  }
  
  // Lunghezza minima
  if (password.length < 8) {
    errors.push('La password deve essere di almeno 8 caratteri')
  }
  
  // Deve contenere almeno un numero
  if (!/\d/.test(password)) {
    errors.push('La password deve contenere almeno un numero')
  }
  
  // Deve contenere almeno una lettera (maiuscola o minuscola)
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera')
  }
  
  // Controllo sequenze comuni (solo quelle molto ovvie)
  const veryCommonSequences = ['123456', 'password', 'qwerty']
  if (veryCommonSequences.some(seq => password.toLowerCase().includes(seq))) {
    errors.push('La password non può contenere sequenze troppo comuni')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

/**
 * Calcola la forza di una password
 * @param {string} password - La password da valutare
 * @returns {number} Punteggio da 0 a 100
 */
const calculatePasswordStrength = (password) => {
  let score = 0
  
  // Lunghezza (max 30 punti)
  score += Math.min(30, password.length * 2.5)
  
  // Varietà caratteri (max 30 punti)
  const charTypes = {
    numbers: /\d/.test(password),
    letters: /[a-zA-Z]/.test(password),
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  // Punti base per tipi di caratteri
  score += Object.values(charTypes).filter(Boolean).length * 7.5
  
  // Bonus per maiuscole/minuscole miste
  if (charTypes.mixedCase) {
    score += 5
  }
  
  // Bonus per caratteri speciali (opzionale ma premiato)
  if (charTypes.special) {
    score += 5
  }
  
  // Complessità (max 25 punti)
  const uniqueChars = new Set(password).size
  score += Math.min(25, uniqueChars * 2)
  
  // Penalità per sequenze comuni (max -20 punti)
  const veryCommonSequences = ['123456', 'password', 'qwerty']
  const hasCommonSeq = veryCommonSequences.some(seq => password.toLowerCase().includes(seq))
  if (hasCommonSeq) {
    score -= 20
  }
  
  // Penalità per password troppo semplici
  if (password.length === 8 && !charTypes.mixedCase && !charTypes.special) {
    score -= 10
  }

  // Se i requisiti minimi sono rispettati, forza un livello minimo "Media"
  const meetsMinimumRequirements = password.length >= 8 && charTypes.numbers && charTypes.letters
  if (meetsMinimumRequirements && score < 40) {
    score = 40
  }
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

// 🛡️ Validation Wrapper
export const validateAndSanitize = (type, operation, data) => {
  const validator = firestoreValidation[type]?.[operation]
  
  if (!validator) {
    console.warn(`⚠️ Validator non trovato per ${type}.${operation}`)
    return { isValid: true, errors: [], sanitizedData: data }
  }
  
  const result = validator(data)
  
  if (!result.isValid) {
    console.error(`❌ Validazione fallita per ${type}.${operation}:`, result.errors)
  }
  
  return result
}

export default firestoreValidation 