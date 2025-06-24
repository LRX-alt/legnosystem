// 🛡️ Sistema di Validazione per Firestore
export const firestoreValidation = {
  
  // 🏗️ Validazione Cantieri
  cantiere: {
    create: (data) => {
      const errors = []
      
      if (!data.nome?.trim()) {
        errors.push('Nome cantiere obbligatorio')
      }
      
      if (!data.cliente?.id) {
        errors.push('Cliente obbligatorio')
      }
      
      if (!data.data_inizio) {
        errors.push('Data inizio obbligatoria')
      }
      
      if (!data.scadenza) {
        errors.push('Data scadenza obbligatoria')
      }
      
      // Validate date order
      if (data.data_inizio && data.scadenza) {
        const inizio = new Date(data.data_inizio)
        const scadenza = new Date(data.scadenza)
        if (inizio >= scadenza) {
          errors.push('La data di scadenza deve essere successiva alla data di inizio')
        }
      }
      
      if (data.budget && isNaN(parseFloat(data.budget))) {
        errors.push('Budget deve essere un numero valido')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          ...data,
          nome: data.nome.trim(),
          descrizione: data.descrizione?.trim() || '',
          budget: data.budget ? parseFloat(data.budget) : 0,
          stato: data.stato || 'pianificato',
          progresso: 0,
          team: data.team || [],
          fasi: data.fasi || []
        } : null
      }
    },
    
    update: (data) => {
      const errors = []
      
      if (data.nome !== undefined && !data.nome?.trim()) {
        errors.push('Nome cantiere non può essere vuoto')
      }
      
      if (data.budget !== undefined && isNaN(parseFloat(data.budget))) {
        errors.push('Budget deve essere un numero valido')
      }
      
      if (data.progresso !== undefined) {
        const prog = parseFloat(data.progresso)
        if (isNaN(prog) || prog < 0 || prog > 100) {
          errors.push('Progresso deve essere tra 0 e 100')
        }
      }
      
      // Sanifica i dati rimuovendo i campi undefined
      const sanitizedData = {}
      
      // Copia solo i campi definiti
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          switch (key) {
            case 'nome':
              sanitizedData[key] = data[key]?.trim()
              break
            case 'descrizione':
              sanitizedData[key] = data[key]?.trim() || ''
              break
            case 'budget':
            case 'valore':
              sanitizedData[key] = data[key] ? parseFloat(data[key]) : 0
              break
            case 'progresso':
              sanitizedData[key] = data[key] ? parseFloat(data[key]) : data[key]
              break
            case 'cliente':
            case 'indirizzo':
            case 'tipoLavoro':
              sanitizedData[key] = data[key]?.trim()
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