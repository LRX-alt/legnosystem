import emailjs from '@emailjs/browser'
import jsPDF from 'jspdf'
import { useToast } from './useToast'
import { useDateUtils } from './useDateUtils'

// Configurazione EmailJS (sostituire con le proprie chiavi)
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
}

export const useEmailJS = () => {
  const toast = useToast()
  const dateUtils = useDateUtils()

  // Inizializza EmailJS
  const initEmailJS = () => {
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey)
      console.log('✅ EmailJS inizializzato correttamente')
      return true
    } catch (error) {
      console.error('❌ Errore inizializzazione EmailJS:', error)
      toast.error('Errore configurazione email')
      return false
    }
  }

  // Genera PDF del preventivo
  const generatePreventivoPDF = (preventivo) => {
    try {
      const doc = new jsPDF()
      
      // Header aziendale
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text('LEGNO SYSTEM', 20, 30)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text('Abitare in natura dal 1959', 20, 40)
      doc.text('Via Roma 123, 12345 Città (CN)', 20, 48)
      doc.text('Tel: +39 123 456 7890 | Email: info@legnosystem.bio', 20, 56)
      
      // Linea separatrice
      doc.setLineWidth(0.5)
      doc.line(20, 65, 190, 65)
      
      // Titolo preventivo
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text('PREVENTIVO', 20, 80)
      
      doc.setFontSize(12)
      doc.text(`Numero: ${preventivo.numero}`, 20, 90)
      doc.text(`Data: ${dateUtils.formatDate(preventivo.createdAt, 'Non disponibile')}`, 20, 98)
      doc.text(`Scadenza: ${dateUtils.formatDate(preventivo.scadenza, 'Non specificata')}`, 20, 106)
      
      // Dati cliente
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('CLIENTE', 20, 125)
      
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text(`Nome: ${preventivo.cliente?.nome || 'Non specificato'}`, 20, 135)
      doc.text(`Contatto: ${preventivo.cliente?.contatto || 'Non specificato'}`, 20, 143)
      if (preventivo.indirizzo) {
        doc.text(`Indirizzo: ${preventivo.indirizzo}`, 20, 151)
      }
      
      // Dettagli progetto
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('DETTAGLI PROGETTO', 20, 170)
      
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text(`Progetto: ${preventivo.progetto}`, 20, 180)
      doc.text(`Tipo Lavoro: ${preventivo.tipoLavoro}`, 20, 188)
      
      // Descrizione se presente
      let currentY = 196
      if (preventivo.descrizione) {
        doc.text('Descrizione:', 20, currentY)
        const splitDescription = doc.splitTextToSize(preventivo.descrizione, 170)
        doc.text(splitDescription, 20, currentY + 8)
        currentY += 8 + (splitDescription.length * 5)
      }
      
      // Materiali se presenti
      if (preventivo.materiali && preventivo.materiali.length > 0) {
        currentY += 15
        
        // Titolo materiali
        doc.setFontSize(14)
        doc.setTextColor(40, 40, 40)
        doc.text('MATERIALI', 20, currentY)
        currentY += 15
        
        // Header tabella materiali
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        doc.text('Nome', 20, currentY)
        doc.text('Qtà', 90, currentY)
        doc.text('Prezzo Unit.', 110, currentY)
        doc.text('Totale', 150, currentY)
        
        // Linea header
        doc.setLineWidth(0.2)
        doc.line(20, currentY + 2, 180, currentY + 2)
        currentY += 8
        
        // Materiali
        let totaleMateriali = 0
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        
        preventivo.materiali.forEach(materiale => {
          const quantita = materiale.quantitaRichiesta || materiale.quantita || 0
          const prezzo = materiale.prezzoUnitario || 0
          const totaleRiga = quantita * prezzo
          totaleMateriali += totaleRiga
          
          // Tronca il nome se troppo lungo
          const nomeDisplay = materiale.nome.length > 25 ? 
            materiale.nome.substring(0, 22) + '...' : 
            materiale.nome
          
          doc.text(nomeDisplay, 20, currentY)
          doc.text(`${quantita} ${materiale.unita || ''}`, 90, currentY)
          doc.text(`€ ${prezzo.toLocaleString('it-IT')}`, 110, currentY)
          doc.text(`€ ${totaleRiga.toLocaleString('it-IT')}`, 150, currentY)
          currentY += 6
        })
        
        // Linea separatrice
        doc.setLineWidth(0.2)
        doc.line(20, currentY + 2, 180, currentY + 2)
        currentY += 8
        
        // Totale materiali
        doc.setFontSize(10)
        doc.setTextColor(40, 40, 40)
        doc.text('Totale Materiali:', 110, currentY)
        doc.text(`€ ${totaleMateriali.toLocaleString('it-IT')}`, 150, currentY)
        currentY += 15
      }
      
      // Voci aggiuntive se presenti
      let totaleVociAggiuntive = 0
      if (preventivo.vociAggiuntive && preventivo.vociAggiuntive.length > 0) {
        // Calcola lo spazio necessario per le voci aggiuntive
        const spazioNecessario = 15 + 15 + 8 + (preventivo.vociAggiuntive.length * 6) + 8 + 15 + 15
        
        // Verifica se c'è spazio sufficiente nella pagina corrente
        if (currentY + spazioNecessario > 270) {
          // Aggiungi nuova pagina se necessario
          doc.addPage()
          currentY = 30
        }
        
        currentY += 15
        
        // Titolo voci aggiuntive
        doc.setFontSize(14)
        doc.setTextColor(40, 40, 40)
        doc.text('VOCI AGGIUNTIVE', 20, currentY)
        currentY += 15
        
        // Header tabella voci aggiuntive
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        doc.text('Descrizione', 20, currentY)
        doc.text('Importo', 150, currentY)
        
        // Linea header
        doc.setLineWidth(0.2)
        doc.line(20, currentY + 2, 180, currentY + 2)
        currentY += 8
        
        // Voci aggiuntive
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        
        preventivo.vociAggiuntive.forEach(voce => {
          const importoVoce = voce.importo || 0
          totaleVociAggiuntive += importoVoce
          
          // Tronca la descrizione se troppo lunga
          const descrizioneDisplay = voce.descrizione.length > 45 ? 
            voce.descrizione.substring(0, 42) + '...' : 
            voce.descrizione
          
          doc.text(descrizioneDisplay, 20, currentY)
          doc.text(`€ ${importoVoce.toLocaleString('it-IT')}`, 150, currentY)
          currentY += 6
        })
        
        // Linea separatrice
        doc.setLineWidth(0.2)
        doc.line(20, currentY + 2, 180, currentY + 2)
        currentY += 8
        
        // Totale voci aggiuntive
        doc.setFontSize(10)
        doc.setTextColor(40, 40, 40)
        doc.text('Totale Voci Aggiuntive:', 110, currentY)
        doc.text(`€ ${totaleVociAggiuntive.toLocaleString('it-IT')}`, 150, currentY)
        currentY += 15
      }
      
      // Calcola il totale finale
      const totaleMaterialiSafe = (preventivo.materiali && preventivo.materiali.length > 0) ? 
        preventivo.materiali.reduce((acc, materiale) => {
          const quantita = materiale.quantitaRichiesta || materiale.quantita || 0
          const prezzo = materiale.prezzoUnitario || 0
          return acc + (quantita * prezzo)
        }, 0) : 0
      
      const totaleFinale = totaleMaterialiSafe + totaleVociAggiuntive
      
      // Verifica se c'è spazio sufficiente per importo e footer
      if (currentY > 240) {
        // Aggiungi nuova pagina se necessario
        doc.addPage()
        currentY = 30
      }
      
      // Importo (evidenziato)
      currentY += 10
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text('IMPORTO TOTALE', 20, currentY)
      
      doc.setFontSize(20)
      doc.setTextColor(0, 120, 0)
      // Usa il totale calcolato se disponibile, altrimenti usa l'importo del preventivo
      const importoFinale = totaleFinale > 0 ? totaleFinale : (preventivo.importo || 0)
      doc.text(`€ ${importoFinale.toLocaleString('it-IT')}`, 20, currentY + 15)
      
      // Footer
      currentY += 35
      
      // Verifica se c'è spazio per il footer
      if (currentY > 270) {
        doc.addPage()
        currentY = 30
      }
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('Preventivo valido fino alla data di scadenza indicata', 20, currentY)
      doc.text('Per accettare il preventivo, si prega di contattarci entro la scadenza', 20, currentY + 8)
      
      return doc
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error)
      throw new Error('Errore nella generazione del PDF')
    }
  }

  // Invia email con preventivo
  const sendPreventivoEmail = async (preventivo) => {
    try {
      // Verifica configurazione
      if (!EMAILJS_CONFIG.serviceId || EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID') {
        throw new Error('EmailJS non configurato. Impostare le variabili d\'ambiente.')
      }

      // Verifica email cliente
      if (!preventivo.cliente?.contatto || !preventivo.cliente.contatto.includes('@')) {
        throw new Error('Email cliente non valida o mancante')
      }

      // Inizializza EmailJS
      if (!initEmailJS()) {
        throw new Error('Errore inizializzazione EmailJS')
      }

      toast.info('Generazione PDF in corso...')

      // Genera PDF
      const pdfDoc = generatePreventivoPDF(preventivo)
      const pdfBase64 = pdfDoc.output('datauristring')

      toast.info('Invio email in corso...')

      // Parametri per il template EmailJS
      const templateParams = {
        to_email: preventivo.cliente.contatto,
        to_name: preventivo.cliente.nome,
        from_name: 'Legno System',
        preventivo_numero: preventivo.numero,
        preventivo_progetto: preventivo.progetto,
        preventivo_importo: `€ ${preventivo.importo?.toLocaleString('it-IT')}`,
        preventivo_scadenza: dateUtils.formatDate(preventivo.scadenza, 'Non specificata'),
        message: `Gentile ${preventivo.cliente.nome},

Le inviamo in allegato il preventivo ${preventivo.numero} per il progetto "${preventivo.progetto}".

Dettagli:
- Tipo lavoro: ${preventivo.tipoLavoro}
- Importo: € ${preventivo.importo?.toLocaleString('it-IT')}
- Scadenza: ${dateUtils.formatDate(preventivo.scadenza, 'Non specificata')}

Per qualsiasi chiarimento o per confermare il preventivo, non esiti a contattarci.

Cordiali saluti,
Il Team di Legno System

---
Legno System - Abitare in natura dal 1959
Tel: +39 123 456 7890 | Email: info@legnosystem.bio`,
        attachment: pdfBase64
      }

      // Invia email tramite EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      )

      console.log('✅ Email inviata con successo:', response)
      toast.success(`Email inviata a ${preventivo.cliente.nome}`)
      
      return {
        success: true,
        response,
        message: 'Email inviata con successo'
      }

    } catch (error) {
      console.error('❌ Errore invio email:', error)
      
      let errorMessage = 'Errore nell\'invio dell\'email'
      
      if (error.message.includes('EmailJS non configurato')) {
        errorMessage = 'EmailJS non configurato correttamente'
      } else if (error.message.includes('Email cliente')) {
        errorMessage = 'Email del cliente non valida'
      } else if (error.text) {
        errorMessage = `Errore EmailJS: ${error.text}`
      }
      
      toast.error(errorMessage)
      
      return {
        success: false,
        error: error.message,
        message: errorMessage
      }
    }
  }

  // Verifica configurazione EmailJS
  const isConfigured = () => {
    return EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
           EMAILJS_CONFIG.templateId !== 'YOUR_TEMPLATE_ID' &&
           EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
  }

  // Test invio email
  const testEmailConfiguration = async () => {
    try {
      if (!isConfigured()) {
        throw new Error('EmailJS non configurato')
      }

      initEmailJS()

      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        from_name: 'Legno System',
        message: 'Test di configurazione EmailJS'
      }

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        testParams
      )

      toast.success('Test EmailJS completato con successo')
      return true
    } catch (error) {
      console.error('❌ Test EmailJS fallito:', error)
      toast.error('Test EmailJS fallito')
      return false
    }
  }

  return {
    sendPreventivoEmail,
    generatePreventivoPDF,
    testEmailConfiguration,
    isConfigured,
    initEmailJS
  }
} 