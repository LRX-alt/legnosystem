// Tipi di lavori di esempio per il sistema di categorizzazione
// Questi dati verranno poi modificati dal cliente

export const tipiLavori = [
  {
    id: 'fondazioni',
    nome: 'Fondazioni',
    categoria: 'strutturale',
    descrizione: 'Lavori di fondazione e sottofondazione',
    costiStandard: {
      scavi: 35,
      getto: 45,
      armatura: 40
    },
    sottocategorie: [
      { id: 'scavi', nome: 'Scavi', descrizione: 'Scavo manuale e meccanico' },
      { id: 'getto', nome: 'Getto', descrizione: 'Getto calcestruzzo fondazioni' },
      { id: 'armatura', nome: 'Armatura', descrizione: 'Posa armature metalliche' }
    ]
  },
  {
    id: 'muratura',
    nome: 'Muratura',
    categoria: 'strutturale',
    descrizione: 'Lavori di muratura portante e di tamponamento',
    costiStandard: {
      muratura: 30,
      intonaco: 25,
      isolamento: 35
    },
    sottocategorie: [
      { id: 'muratura', nome: 'Muratura', descrizione: 'Posa mattoni e blocchi' },
      { id: 'intonaco', nome: 'Intonaco', descrizione: 'Intonacatura pareti' },
      { id: 'isolamento', nome: 'Isolamento', descrizione: 'Posa isolanti termici' }
    ]
  },
  {
    id: 'carpenteria',
    nome: 'Carpenteria',
    categoria: 'strutturale',
    descrizione: 'Lavori di carpenteria in legno',
    costiStandard: {
      struttura: 50,
      copertura: 45,
      finiture: 40
    },
    sottocategorie: [
      { id: 'struttura', nome: 'Struttura', descrizione: 'Telaio e travi principali' },
      { id: 'copertura', nome: 'Copertura', descrizione: 'Tetto e manto di copertura' },
      { id: 'finiture', nome: 'Finiture', descrizione: 'Finiture interne in legno' }
    ]
  },
  {
    id: 'impianti',
    nome: 'Impianti',
    categoria: 'tecnico',
    descrizione: 'Impianti elettrici, idraulici e termici',
    costiStandard: {
      elettrico: 40,
      idraulico: 45,
      termico: 50
    },
    sottocategorie: [
      { id: 'elettrico', nome: 'Elettrico', descrizione: 'Impianto elettrico' },
      { id: 'idraulico', nome: 'Idraulico', descrizione: 'Impianto idraulico' },
      { id: 'termico', nome: 'Termico', descrizione: 'Impianto di riscaldamento' }
    ]
  },
  {
    id: 'finiture',
    nome: 'Finiture',
    categoria: 'finiture',
    descrizione: 'Lavori di finitura interna ed esterna',
    costiStandard: {
      pavimenti: 35,
      rivestimenti: 40,
      pittura: 25
    },
    sottocategorie: [
      { id: 'pavimenti', nome: 'Pavimenti', descrizione: 'Posa pavimenti e parquet' },
      { id: 'rivestimenti', nome: 'Rivestimenti', descrizione: 'Rivestimenti pareti' },
      { id: 'pittura', nome: 'Pittura', descrizione: 'Tinteggiatura e verniciatura' }
    ]
  },
  {
    id: 'esterni',
    nome: 'Lavori Esterni',
    categoria: 'esterni',
    descrizione: 'Lavori di sistemazione esterna',
    costiStandard: {
      giardino: 30,
      pavimentazione: 35,
      recinzioni: 40
    },
    sottocategorie: [
      { id: 'giardino', nome: 'Giardino', descrizione: 'Sistemazione giardino' },
      { id: 'pavimentazione', nome: 'Pavimentazione', descrizione: 'Pavimentazione esterna' },
      { id: 'recinzioni', nome: 'Recinzioni', descrizione: 'Recinzioni e cancelli' }
    ]
  }
]

// Funzione per ottenere tutti i tipi di lavoro
export const getTipiLavori = () => tipiLavori

// Funzione per ottenere un tipo di lavoro specifico
export const getTipoLavoro = (id) => tipiLavori.find(tipo => tipo.id === id)

// Funzione per ottenere le sottocategorie di un tipo di lavoro
export const getSottocategorie = (tipoId) => {
  const tipo = getTipoLavoro(tipoId)
  return tipo ? tipo.sottocategorie : []
}

// Funzione per ottenere il costo standard di una sottocategoria
export const getCostoStandard = (tipoId, sottocategoriaId) => {
  const tipo = getTipoLavoro(tipoId)
  return tipo?.costiStandard?.[sottocategoriaId] || 0
} 