import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Configurazione PDF
const PDF_CONFIG = {
  pageSize: 'a4',
  orientation: 'p',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  colors: {
    primary: [41, 128, 185],
    secondary: [52, 73, 94],
    accent: [231, 76, 60],
    success: [39, 174, 96],
    warning: [243, 156, 18],
    info: [52, 152, 219]
  }
}

// Formatta la data
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Formatta la valuta
const formatCurrency = (value) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(value || 0)
}

// Genera report PDF
export const generatePDFReport = (data, filters, statistiche) => {
  const doc = new jsPDF({
    orientation: PDF_CONFIG.orientation,
    unit: 'mm',
    format: PDF_CONFIG.pageSize
  })
  
  // Configura font
  doc.setFont('helvetica')
  
  let yPosition = PDF_CONFIG.margins.top
  
  // Header del documento
  doc.setFillColor(...PDF_CONFIG.colors.primary)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo/Titolo principale
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORT ANALISI COSTI', 15, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 15, 35)
  
  yPosition = 50
  
  // Informazioni sui filtri applicati
  if (filters && Object.keys(filters).some(key => filters[key])) {
    doc.setTextColor(...PDF_CONFIG.colors.secondary)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('FILTRI APPLICATI', 15, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    if (filters.periodo && filters.periodo !== 'tutto') {
      doc.text(`• Periodo: ${filters.periodo}`, 20, yPosition)
      yPosition += 6
    }
    
    if (filters.cantiere) {
      doc.text(`• Cantiere: ${filters.cantiere}`, 20, yPosition)
      yPosition += 6
    }
    
    if (filters.categoria) {
      doc.text(`• Categoria: ${filters.categoria}`, 20, yPosition)
      yPosition += 6
    }
    
    yPosition += 10
  }
  
  // Riepilogo statistiche
  doc.setTextColor(...PDF_CONFIG.colors.primary)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RIEPILOGO STATISTICHE', 15, yPosition)
  yPosition += 15
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  const statsData = [
    ['Costo Totale', formatCurrency(statistiche.costoTotale)],
    ['Costo Dipendenti', formatCurrency(statistiche.costoDipendenti)],
    ['Costo Materiali', formatCurrency(statistiche.costoMateriali)],
    ['Costo Mezzi', formatCurrency(statistiche.costoMezzi)],
    ['Costo Lavori', formatCurrency(statistiche.costoLavori || 0)]
  ]
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Voce', 'Importo']],
    body: statsData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  })
  
  yPosition = doc.lastAutoTable.finalY + 15
  
  // Distribuzione costi per categoria
  doc.setTextColor(...PDF_CONFIG.colors.primary)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DISTRIBUZIONE COSTI PER CATEGORIA', 15, yPosition)
  yPosition += 10
  
  const costiPerCategoria = {}
  data.forEach(costo => {
    if (!costiPerCategoria[costo.categoria]) {
      costiPerCategoria[costo.categoria] = 0
    }
    costiPerCategoria[costo.categoria] += costo.costoTotale
  })
  
  const distribuzioneData = Object.entries(costiPerCategoria).map(([categoria, valore]) => [
    categoria.charAt(0).toUpperCase() + categoria.slice(1),
    formatCurrency(valore),
    `${((valore / statistiche.costoTotale) * 100).toFixed(1)}%`
  ])
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Categoria', 'Costo', '% sul Totale']],
    body: distribuzioneData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.secondary,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  })
  
  yPosition = doc.lastAutoTable.finalY + 15
  
  // Dettaglio costi
  doc.setTextColor(...PDF_CONFIG.colors.primary)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DETTAGLIO COSTI', 15, yPosition)
  yPosition += 10
  
  const dettaglioData = data.map(costo => [
    formatDate(costo.data),
    costo.cantiere,
    costo.categoria.charAt(0).toUpperCase() + costo.categoria.slice(1),
    costo.descrizione,
    costo.quantita,
    formatCurrency(costo.costoUnitario),
    formatCurrency(costo.costoTotale)
  ])
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Data', 'Cantiere', 'Categoria', 'Descrizione', 'Quantità', 'Costo Unit.', 'Totale']],
    body: dettaglioData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.secondary,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  })
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setTextColor(128, 128, 128)
    doc.setFontSize(8)
    doc.text(`Pagina ${i} di ${pageCount}`, 105, 290, { align: 'center' })
    doc.text('Legnosystem - Report Analisi Costi', 105, 295, { align: 'center' })
  }
  
  return doc
}

// Genera report Excel
export const generateExcelReport = (data, filters, statistiche) => {
  const workbook = XLSX.utils.book_new()
  
  // Foglio 1: Riepilogo
  const riepilogoData = [
    ['REPORT ANALISI COSTI - LEGNOSYSTEM'],
    [''],
    ['Generato il:', new Date().toLocaleDateString('it-IT')],
    [''],
    ['FILTRI APPLICATI'],
    ['Periodo:', filters?.periodo || 'Tutto'],
    ['Cantiere:', filters?.cantiere || 'Tutti'],
    ['Categoria:', filters?.categoria || 'Tutte'],
    [''],
    ['RIEPILOGO STATISTICHE'],
    ['Costo Totale', statistiche.costoTotale],
    ['Costo Dipendenti', statistiche.costoDipendenti],
    ['Costo Materiali', statistiche.costoMateriali],
    ['Costo Mezzi', statistiche.costoMezzi],
    ['Costo Lavori', statistiche.costoLavori || 0],
    [''],
    ['DISTRIBUZIONE COSTI PER CATEGORIA']
  ]
  
  // Aggiungi distribuzione costi
  const costiPerCategoria = {}
  data.forEach(costo => {
    if (!costiPerCategoria[costo.categoria]) {
      costiPerCategoria[costo.categoria] = 0
    }
    costiPerCategoria[costo.categoria] += costo.costoTotale
  })
  
  Object.entries(costiPerCategoria).forEach(([categoria, valore]) => {
    riepilogoData.push([
      categoria.charAt(0).toUpperCase() + categoria.slice(1),
      valore,
      `${((valore / statistiche.costoTotale) * 100).toFixed(1)}%`
    ])
  })
  
  const riepilogoSheet = XLSX.utils.aoa_to_sheet(riepilogoData)
  
  // Stili per il riepilogo
  riepilogoSheet['A1'].s = { font: { bold: true, size: 16 } }
  riepilogoSheet['A5'].s = { font: { bold: true, size: 12 } }
  riepilogoSheet['A10'].s = { font: { bold: true, size: 12 } }
  riepilogoSheet['A17'].s = { font: { bold: true, size: 12 } }
  
  XLSX.utils.book_append_sheet(workbook, riepilogoSheet, 'Riepilogo')
  
  // Foglio 2: Dettaglio costi
  const dettaglioHeaders = [
    'Data',
    'Cantiere', 
    'Categoria',
    'Descrizione',
    'Quantità',
    'Costo Unitario',
    'Costo Totale'
  ]
  
  const dettaglioData = [
    dettaglioHeaders,
    ...data.map(costo => [
      formatDate(costo.data),
      costo.cantiere,
      costo.categoria.charAt(0).toUpperCase() + costo.categoria.slice(1),
      costo.descrizione,
      costo.quantita,
      costo.costoUnitario,
      costo.costoTotale
    ])
  ]
  
  const dettaglioSheet = XLSX.utils.aoa_to_sheet(dettaglioData)
  
  // Stili per il dettaglio
  dettaglioSheet['A1'].s = { font: { bold: true } }
  dettaglioSheet['B1'].s = { font: { bold: true } }
  dettaglioSheet['C1'].s = { font: { bold: true } }
  dettaglioSheet['D1'].s = { font: { bold: true } }
  dettaglioSheet['E1'].s = { font: { bold: true } }
  dettaglioSheet['F1'].s = { font: { bold: true } }
  dettaglioSheet['G1'].s = { font: { bold: true } }
  
  XLSX.utils.book_append_sheet(workbook, dettaglioSheet, 'Dettaglio Costi')
  
  // Foglio 3: Analisi temporale
  const analisiTemporaleData = [
    ['ANALISI TEMPORALE COSTI'],
    [''],
    ['Data', 'Costo Totale', 'Dipendenti', 'Materiali', 'Mezzi', 'Lavori']
  ]
  
  // Raggruppa per data
  const costiPerData = {}
  data.forEach(costo => {
    if (!costiPerData[costo.data]) {
      costiPerData[costo.data] = {
        totale: 0,
        dipendenti: 0,
        materiali: 0,
        mezzi: 0,
        lavori: 0
      }
    }
    costiPerData[costo.data].totale += costo.costoTotale
    costiPerData[costo.data][costo.categoria] += costo.costoTotale
  })
  
  Object.entries(costiPerData)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .forEach(([data, costi]) => {
      analisiTemporaleData.push([
        formatDate(data),
        costi.totale,
        costi.dipendenti,
        costi.materiali,
        costi.mezzi,
        costi.lavori
      ])
    })
  
  const analisiSheet = XLSX.utils.aoa_to_sheet(analisiTemporaleData)
  
  // Stili per l'analisi temporale
  analisiSheet['A1'].s = { font: { bold: true, size: 14 } }
  analisiSheet['A3'].s = { font: { bold: true } }
  analisiSheet['B3'].s = { font: { bold: true } }
  analisiSheet['C3'].s = { font: { bold: true } }
  analisiSheet['D3'].s = { font: { bold: true } }
  analisiSheet['E3'].s = { font: { bold: true } }
  analisiSheet['F3'].s = { font: { bold: true } }
  
  XLSX.utils.book_append_sheet(workbook, analisiSheet, 'Analisi Temporale')
  
  return workbook
}

// Funzione helper per scaricare il PDF
export const downloadPDF = (data, filters, statistiche, filename = 'report-costi.pdf') => {
  const doc = generatePDFReport(data, filters, statistiche)
  doc.save(filename)
}

// Funzione helper per scaricare l'Excel
export const downloadExcel = (data, filters, statistiche, filename = 'report-costi.xlsx') => {
  const workbook = generateExcelReport(data, filters, statistiche)
  XLSX.writeFile(workbook, filename)
} 