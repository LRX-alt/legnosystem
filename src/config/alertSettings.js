// Configurazione soglie alert costi
export const alertSettings = {
  // Soglia costo giornaliero per cantiere (€)
  sogliaCostoGiornaliero: 1000,
  
  // Soglia costo settimanale per cantiere (€)
  sogliaCostoSettimanale: 5000,
  
  // Soglia costo mensile per cantiere (€)
  sogliaCostoMensile: 20000,
  
  // Soglia costo per categoria (€)
  sogliePerCategoria: {
    dipendenti: 800,    // Soglia costo dipendenti giornaliero
    materiali: 500,     // Soglia costo materiali giornaliero
    mezzi: 400,         // Soglia costo mezzi giornaliero
    lavori: 300         // Soglia costo lavori giornaliero
  },
  
  // Soglia percentuale di incremento costi (rispetto alla media)
  sogliaIncrementoPercentuale: 50, // 50% sopra la media
  
  // Abilita/disabilita tipi di alert
  alertAbilitati: {
    costoGiornaliero: true,
    costoSettimanale: true,
    costoMensile: true,
    categoriaSingola: true,
    incrementoAnomalo: true
  }
}

// Funzioni helper per calcoli alert
export const calculateAlertThresholds = (cantiereId, periodo = 'giornaliero') => {
  const baseThresholds = {
    giornaliero: alertSettings.sogliaCostoGiornaliero,
    settimanale: alertSettings.sogliaCostoSettimanale,
    mensile: alertSettings.sogliaCostoMensile
  }
  
  // Qui potresti aggiungere logica per soglie personalizzate per cantiere
  // Per ora usiamo le soglie base
  return baseThresholds[periodo] || baseThresholds.giornaliero
}

export const checkCostoAlert = (costo, categoria, cantiereId) => {
  const alerts = []
  
  // Check soglia categoria
  if (alertSettings.alertAbilitati.categoriaSingola) {
    const sogliaCategoria = alertSettings.sogliePerCategoria[categoria]
    if (costo > sogliaCategoria) {
      alerts.push({
        tipo: 'categoria',
        livello: 'warning',
        messaggio: `Costo ${categoria} (€${costo}) supera la soglia di €${sogliaCategoria}`,
        categoria,
        costo,
        soglia: sogliaCategoria
      })
    }
  }
  
  return alerts
} 