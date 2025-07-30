<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFirestore } from '@/composables/useFirestore'
import { useFirestoreRealtime } from '@/composables/useFirestoreRealtime'
import { usePopup } from '@/composables/usePopup'
import { useToast } from '@/composables/useToast'
import { useFirestoreStore } from '@/stores/firestore'
import { db, storage } from '@/config/firebase'
import { ref as storageRef, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage'
import { doc, getDoc, runTransaction } from 'firebase/firestore'
import {
  PlusIcon,
  XMarkIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilIcon,
  CubeIcon,
  PaperClipIcon,
  UsersIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreOperations } from '@/composables/useFirestoreOperations'
import { useModalEsc } from '@/composables/useModalEsc'

const router = useRouter()
const popup = usePopup()
const { showToast } = useToast()
const firestore = useFirestore()
const firestoreRealtime = useFirestoreRealtime()
const firestoreStore = useFirestoreStore()
const firestoreOperations = useFirestoreOperations()

// Reactive state
const cantieri = ref([])
const unsubscribeCantieri = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedPriority = ref('')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showProgressModal = ref(false)
const showTeamModal = ref(false)
const showAttachmentsModal = ref(false)
const showManageMaterialsModal = ref(false)
const showAddMaterialModal = ref(false)
const showEditMaterialModal = ref(false)
const showMaterialAttachmentsModal = ref(false)
const showManageVociModal = ref(false)
const showAddVoceModal = ref(false)
const showEditVoceModal = ref(false)

const selectedCantiere = ref(null)
const editingCantiere = ref(null)
const newCantiere = ref({
  nome: '',
  cliente: {
    id: '',
    nome: ''
  },
  indirizzo: '',
  tipoLavoro: '',
  valore: 0,
  dataInizio: '',
  scadenza: '',
  stato: 'pianificato',
  priorita: 'media',
  progresso: 0,
  team: [],
  costiAccumulati: {
    materiali: 0,
    manodopera: 0,
    totale: 0
  }
})

const clientSelectionMode = ref('existing')
const selectedClientFromList = ref('')
const materialSelectionMode = ref('existing')
const selectedMaterialFromStock = ref('')
const selectedMaterial = ref(null)
const editingMaterial = ref(null)
const newMaterial = ref(null)
const loading = ref(false)
const materialiCantiere = ref([])
const materialiMagazzino = ref([])
const fornitori = ref([])
const availableClients = ref([])
const vociAggiuntiveCantiere = ref([])
const newVoce = ref(null)
const editingVoce = ref(null)

// Oggetto per l'aggiornamento progresso
const progressUpdate = ref({
  incremento: 5,
  fase: '',
  nota: '',
  dataCompletamento: new Date().toISOString().split('T')[0]
})

// Computed properties
const cantieriOrdinati = computed(() => {
  return firestoreStore.cantieri
    .slice() // Crea una copia per non modificare l'array originale
    .map(cantiere => ({
      ...cantiere,
      // 🔤 AGGIUNGE INIZIALI: Calcola le iniziali per ogni membro del team
      team: (cantiere.team || []).map(membro => ({
        ...membro,
        iniziali: getIniziali(membro.nome, membro.cognome)
      }))
    }))
    .sort((a, b) => {
      // Ordina per data di creazione decrescente
      const dateA = a.createdAt?.seconds || 0
      const dateB = b.createdAt?.seconds || 0
      return dateB - dateA
    })
})

const cantieriVisibili = computed(() => {
  return cantieriOrdinati.value.filter(cantiere => {
    // Filtra per termine di ricerca
    const matchSearch = !searchTerm.value || 
      cantiere.nome?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      cantiere.cliente?.nome?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      cantiere.indirizzo?.toLowerCase().includes(searchTerm.value.toLowerCase())

    // Filtra per stato
    const matchStatus = !selectedStatus.value || cantiere.stato === selectedStatus.value

    // Filtra per priorità
    const matchPriority = !selectedPriority.value || cantiere.priorita === selectedPriority.value

    return matchSearch && matchStatus && matchPriority
  })
})

const stats = computed(() => {
  const now = new Date()
  const inOneMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  
  return {
    attivi: firestoreStore.cantieriAttivi.length,
    valoreTotale: firestoreStore.cantieri.reduce((acc, c) => acc + (c.valore || 0), 0),
    inScadenza: firestoreStore.cantieri.filter(c => {
      const scadenza = new Date(c.scadenza)
      return scadenza <= inOneMonth && c.stato !== 'completato'
    }).length,
    completatiMese: firestoreStore.cantieri.filter(c => {
      const dataCompletamento = new Date(c.dataCompletamento)
      return dataCompletamento.getMonth() === now.getMonth() && 
             dataCompletamento.getFullYear() === now.getFullYear()
    }).length
  }
})

// Methods
const getStatusColor = (stato) => {
  const colors = {
    'pianificato': 'bg-blue-100 text-blue-800',
    'in-corso': 'bg-accent-100 text-accent-800',
    'completato': 'bg-green-100 text-green-800',
    'sospeso': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (stato) => {
  const labels = {
    'pianificato': 'Pianificato',
    'in-corso': 'In Corso',
    'completato': 'Completato',
    'sospeso': 'Sospeso'
  }
  return labels[stato] || stato
}

const getPriorityColor = (priorita) => {
  const colors = {
    'alta': 'bg-red-100 text-red-800',
    'media': 'bg-yellow-100 text-yellow-800',
    'bassa': 'bg-gray-100 text-gray-800'
  }
  return colors[priorita] || 'bg-gray-100 text-gray-800'
}

// 🎨 Helper per il colore del tipo cliente
const getTipoColor = (tipo) => {
  const colors = {
    'privato': 'bg-blue-100 text-blue-800',
    'azienda': 'bg-purple-100 text-purple-800',
    'ente': 'bg-green-100 text-green-800'
  }
  return colors[tipo] || 'bg-gray-100 text-gray-800'
}

// 🏷️ Helper per l'etichetta del tipo cliente
const getTipoLabel = (tipo) => {
  const labels = {
    'privato': 'Privato',
    'azienda': 'Azienda',
    'ente': 'Ente Pubblico'
  }
  return labels[tipo] || tipo
}

// 🔧 Helper per gestire il campo cliente (compatibilità oggetto/stringa)
const getClienteNome = (cliente) => {
  if (!cliente) return 'Cliente non specificato'
  
  // Se è un oggetto con proprietà 'nome', usa quella
  if (typeof cliente === 'object' && cliente.nome) {
    return cliente.nome
  }
  
  // Se è una stringa, usala direttamente (cantieri vecchi)
  if (typeof cliente === 'string') {
    return cliente
  }
  
  // Fallback
  return 'Cliente non valido'
}

// 🔍 Helper per ottenere il cliente selezionato
const getSelectedClient = () => {
  if (clientSelectionMode.value === 'existing') {
    return availableClients.value.find(c => c.id === selectedClientFromList.value)
  } else if (clientSelectionMode.value === 'new') {
    return newCantiere.value.cliente
  }
  return null
}

// 👀 Watch per gestire il cambio di modalità cliente
watch(clientSelectionMode, (newMode) => {
  // Reset dei campi cliente quando si cambia modalità
  if (newMode === 'new') {
    // Per nuovo cliente, inizializza con oggetto vuoto
    newCantiere.value.cliente = {
      id: '',
      nome: ''
    }
    // Reset altri campi cliente
    newCantiere.value.clienteTipo = 'privato'
    newCantiere.value.clienteEmail = ''
    newCantiere.value.clienteTelefono = ''
    newCantiere.value.clienteIndirizzo = ''
    newCantiere.value.indirizzo = ''
  } else {
    // Per cliente esistente, resetta la selezione
    selectedClientFromList.value = ''
    newCantiere.value.cliente = {
      id: '',
      nome: ''
    }
  }
}, { immediate: true })

// 🔄 Funzione per popolare i dati quando si seleziona un cliente esistente
const fillClientFromList = () => {
  const selectedClient = getSelectedClient()
  if (selectedClient) {
    // Aggiorna tutti i dati del cliente
    newCantiere.value.cliente = {
      id: selectedClient.id,
      nome: selectedClient.nome,
      tipo: selectedClient.tipo,
      email: selectedClient.email,
      telefono: selectedClient.telefono,
      indirizzo: selectedClient.indirizzo
    }
    // Popola l'indirizzo del cantiere con quello del cliente
    newCantiere.value.indirizzo = selectedClient.indirizzo || ''
  }
}

// 💰 Helper per calcoli di margine e performance
const getMargineColor = (cantiere) => {
  const margine = cantiere.valore - (cantiere.costiAccumulati?.totale || 0)
  const percentuale = (margine / cantiere.valore) * 100
  
  if (percentuale > 20) return 'text-green-600'
  if (percentuale > 10) return 'text-yellow-600'
  return 'text-red-600'
}

const getMarginePercentColor = (cantiere) => {
  const margine = cantiere.valore - (cantiere.costiAccumulati?.totale || 0)
  const percentuale = (margine / cantiere.valore) * 100
  
  if (percentuale > 20) return 'text-green-500'
  if (percentuale > 10) return 'text-yellow-500'
  return 'text-red-500'
}

const getMarginePercent = (cantiere) => {
  if (!cantiere.valore || cantiere.valore === 0) return '0%'
  
  const margine = cantiere.valore - (cantiere.costiAccumulati?.totale || 0)
  const percentuale = Math.round((margine / cantiere.valore) * 100)
  
  return `${percentuale}%`
}

const getPerformanceBarColor = (cantiere) => {
  const percentualeSpesa = ((cantiere.costiAccumulati?.totale || 0) / cantiere.valore) * 100
  
  if (percentualeSpesa < 50) return 'bg-green-500'
  if (percentualeSpesa < 80) return 'bg-yellow-500'
  if (percentualeSpesa < 100) return 'bg-orange-500'
  return 'bg-red-500'
}

const getManodoperaGiornaliera = (cantiere) => {
  if (!cantiere.statisticheCosti?.giorniLavorativi || cantiere.statisticheCosti.giorniLavorativi === 0) {
    return 0
  }
  
  const costoManodopera = cantiere.costiAccumulati?.manodopera || 0
  return Math.round(costoManodopera / cantiere.statisticheCosti.giorniLavorativi)
}

const calculateActualDailyCost = (cantiere) => {
  // Calcolo basato sui costi accumulati e giorni lavorati
  if (!cantiere?.costiAccumulati?.manodopera || !cantiere?.statisticheCosti?.giorniLavorativi) {
    return 0
  }
  
  const costoManodopera = cantiere.costiAccumulati.manodopera
  return Math.round(costoManodopera / cantiere.statisticheCosti.giorniLavorativi)
}

// 📅 Helper per date
const isScaduto = (scadenza) => {
  if (!scadenza) return false
  const oggi = new Date()
  const dataScadenza = new Date(scadenza)
  return dataScadenza < oggi
}

const formatDate = (date, includeTime = false) => {
  if (!date) return 'Non definita'
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return new Date(date).toLocaleString('it-IT', options)
}

// 📊 Helper per lo storico progresso cantiere
const getProgressHistory = (cantiereId) => {
  // TODO: Implementare caricamento storico progresso da Firestore
  // Per ora ritorna un array vuoto per evitare errori
  if (!cantiereId) return []
  
  // Placeholder per futura implementazione
  return []
}

// 📎 Helper per allegati (placeholder per futura implementazione)
const getCantiereAttachments = (cantiereId) => {
  // Per ora restituisce array vuoto, da implementare con sistema allegati
  return []
}

// Test connessione Firebase
const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...')
    console.log('Firebase config:', {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    })
    
    // Test Firestore
    const testDoc = await getDoc(doc(db, 'cantieri', 'test'))
    console.log('✅ Firestore read test:', testDoc.exists())
    
    return true
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    throw error
  }
}

// Esegui test all'avvio del componente
onMounted(async () => {
  try {
    await testFirebaseConnection()
  } catch (error) {
    popup.error('Errore Connessione', 'Impossibile connettersi a Firebase. Verifica la configurazione.')
  }
})

onMounted(async () => {
  try {
    // Imposta il listener real-time
    const { unsubscribe } = firestoreRealtime.listenToCantieri((docs) => {
      firestoreStore.cantieri = docs
    })
    unsubscribeCantieri.value = unsubscribe

    // Carica i clienti disponibili
    const clientiResult = await firestore.clientiOperations.load()
    if (clientiResult.success) {
      availableClients.value = clientiResult.data
    }

    // 🚀 Precarica i dipendenti per ridurre il lag dell'apertura team modal
    if (!firestoreStore.dipendenti.length) {
      firestoreStore.loadDipendenti().catch(console.error)
    }
  } catch (error) {
    console.error('Errore inizializzazione:', error)
    popup.error('Errore', 'Errore durante il caricamento dei dati')
  }
})

onUnmounted(() => {
  // Rimuovi il listener quando il componente viene distrutto
  if (unsubscribeCantieri.value) {
    unsubscribeCantieri.value()
  }
})

// 🚪 Funzioni di chiusura modali
const closeAddModal = () => {
  showAddModal.value = false
  resetNewCantiere()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedCantiere.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCantiere.value = null
}

const closeProgressModal = () => {
  showProgressModal.value = false
}

const closeTeamModal = () => {
  showTeamModal.value = false
  selectedCantiere.value = null
}

const closeAttachmentsModal = () => {
  showAttachmentsModal.value = false
}

const closeManageMaterialsModal = () => {
  showManageMaterialsModal.value = false
  selectedMaterial.value = null
  editingMaterial.value = null
  materialSelectionMode.value = 'existing'
  selectedMaterialFromStock.value = ''
}

const closeAddMaterialModal = () => {
  showAddMaterialModal.value = false
  newMaterial.value = null
  materialSelectionMode.value = 'existing'
  selectedMaterialFromStock.value = ''
}

const closeEditMaterialModal = () => {
  showEditMaterialModal.value = false
  editingMaterial.value = null
}

const closeMaterialAttachmentsModal = () => {
  showMaterialAttachmentsModal.value = false
}

// Chiusura modal con ESC
const modalRefs = [
  showAddModal, 
  showDetailModal, 
  showEditModal, 
  showProgressModal, 
  showTeamModal, 
  showAttachmentsModal, 
  showManageMaterialsModal, 
  showAddMaterialModal, 
  showEditMaterialModal, 
  showMaterialAttachmentsModal, 
  showManageVociModal, 
  showAddVoceModal, 
  showEditVoceModal
]
const closeFunctions = [
  closeAddModal,
  closeDetailModal,
  closeEditModal,
  closeProgressModal,
  closeTeamModal,
  closeAttachmentsModal,
  closeManageMaterialsModal,
  closeAddMaterialModal,
  closeEditMaterialModal,
  closeMaterialAttachmentsModal,
  () => showManageVociModal.value = false,
  () => showAddVoceModal.value = false,
  () => showEditVoceModal.value = false
]
useModalEsc(modalRefs, closeFunctions)

// 🔧 FUNZIONI GESTIONE MATERIALI CANTIERE - Fix funzioni mancanti

const addMaterialToCantiere = async () => {
  try {
    // Carica materiali dal magazzino se non già caricati
    if (materialiMagazzino.value.length === 0) {
      await firestoreStore.loadMateriali()
      materialiMagazzino.value = firestoreStore.materiali
    }
    
    // Carica fornitori se non già caricati
    if (fornitori.value.length === 0) {
      await firestoreStore.loadFornitori()
      fornitori.value = firestoreStore.fornitori
    }
    
    // Inizializza nuovo materiale
    newMaterial.value = {
      nome: '',
      codice: '',
      descrizione: '',
      quantitaRichiesta: 1,
      unita: 'pz',
      prezzoUnitario: 0,
      stato: 'ordinato',
      fornitoreId: '',
      dataAcquisto: '',
      note: ''
    }
    
    // Reset selezioni
    materialSelectionMode.value = 'existing'
    selectedMaterialFromStock.value = ''
    
    // Apri modal
    showAddMaterialModal.value = true
    
  } catch (err) {
    console.error('Errore apertura modal materiali:', err)
    popup.error('Errore', `Impossibile aprire la gestione materiali: ${err.message}`)
  }
}

const getSelectedMaterialFromStock = () => {
  if (!selectedMaterialFromStock.value) return null
  return materialiMagazzino.value.find(m => m.id === selectedMaterialFromStock.value)
}

const fillMaterialFromStock = () => {
  const selected = getSelectedMaterialFromStock()
  if (selected && newMaterial.value) {
    newMaterial.value = {
      ...newMaterial.value,
      nome: selected.nome,
      codice: selected.codice,
      descrizione: selected.descrizione,
      unita: selected.unita,
      prezzoUnitario: selected.prezzoUnitario || 0
    }
  }
}

const saveMaterialToCantiere = async () => {
  try {
    if (!selectedCantiere.value || !newMaterial.value) {
      popup.error('Errore', 'Dati mancanti per il salvataggio')
      return
    }
    
    loading.value = true
    
    let materialeData = { ...newMaterial.value }
    
    // Se selezione da magazzino, aggiunge reference al materiale originale
    if (materialSelectionMode.value === 'existing' && selectedMaterialFromStock.value) {
      materialeData.materialeId = selectedMaterialFromStock.value
      materialeData.tipoMateriale = 'magazzino'
    } else {
      materialeData.tipoMateriale = 'cantiere'
    }
    
    // Aggiungi al cantiere
    const result = await firestoreStore.createMaterialeCantiere(selectedCantiere.value.id, materialeData)
    
    if (result.success) {
      // Ricarica materiali cantiere
      const materialiResult = await firestoreStore.loadMaterialiCantiere(selectedCantiere.value.id)
      if (materialiResult.success) {
        materialiCantiere.value = materialiResult.data
      }
      
      popup.success('Materiale Aggiunto', 'Il materiale è stato aggiunto al cantiere con successo')
      closeAddMaterialModal()
      
      // 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere
      await autoUpdateCantiereCosts(selectedCantiere.value.id)
    } else {
      throw new Error(result.error)
    }
    
  } catch (err) {
    console.error('Errore salvataggio materiale:', err)
    popup.error('Errore Salvataggio', err.message)
  } finally {
    loading.value = false
  }
}

const manageMaterialAttachments = async (materiale) => {
  try {
    loading.value = true
    selectedMaterial.value = materiale
    
    // Carica gli allegati del materiale dal database
    const allegatiResult = await firestoreStore.loadAllegatiMateriale(materiale.id)
    if (allegatiResult.success) {
      selectedMaterial.value.allegati = allegatiResult.data || []
    } else {
      selectedMaterial.value.allegati = []
      console.warn('Impossibile caricare allegati materiale:', allegatiResult.error)
    }
    
    showMaterialAttachmentsModal.value = true
  } catch (err) {
    console.error('Errore apertura modal allegati materiale:', err)
    popup.error('Errore', `Impossibile aprire la gestione allegati: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const editMaterialInCantiere = async (materiale) => {
  try {
    editingMaterial.value = { ...materiale }
    showEditMaterialModal.value = true
  } catch (err) {
    console.error('Errore apertura modal modifica materiale:', err)
    popup.error('Errore', `Impossibile modificare il materiale: ${err.message}`)
  }
}

const removeMaterialFromCantiere = async (materialeId) => {
  try {
    const confirmed = await popup.confirm(
      'Conferma Eliminazione',
      'Sei sicuro di voler rimuovere questo materiale dal cantiere? Questa azione non può essere annullata.'
    )
    
    if (!confirmed) return
    
    loading.value = true
    
    const result = await firestoreStore.deleteMaterialeCantiere(materialeId)
    
    if (result.success) {
      // Ricarica materiali cantiere
      const materialiResult = await firestoreStore.loadMaterialiCantiere(selectedCantiere.value.id)
      if (materialiResult.success) {
        materialiCantiere.value = materialiResult.data
      }
      
      popup.success('Materiale Rimosso', 'Il materiale è stato rimosso dal cantiere con successo')
      
      // 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere
      await autoUpdateCantiereCosts(selectedCantiere.value.id)
    } else {
      throw new Error(result.error)
    }
    
  } catch (err) {
    console.error('Errore eliminazione materiale:', err)
    popup.error('Errore Eliminazione', err.message)
  } finally {
    loading.value = false
  }
}

// 🔧 FUNZIONI GESTIONE ALLEGATI CANTIERI - Fix funzioni mancanti

const handleFileUpload = async (event) => {
  try {
    const files = Array.from(event.target.files)
    if (!files.length || !selectedCantiere.value) return
    
    loading.value = true
    
    for (const file of files) {
      // Validazione file
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        popup.warning('File Troppo Grande', `Il file ${file.name} supera i 10MB`)
        continue
      }
      
      // Prepara i dati dell'allegato
      const allegatoData = {
        name: file.name,
        size: file.size,
        type: file.type.split('/')[1] || 'unknown',
        uploadDate: new Date(),
        description: '',
        file: file
      }
      
      // Carica l'allegato
      const result = await firestoreStore.createAllegatoCantiere(selectedCantiere.value.id, allegatoData)
      if (!result.success) {
        popup.error('Errore Upload', `Errore durante l'upload di ${file.name}: ${result.error}`)
      }
    }
    
    popup.success('Upload Completato', `${files.length} file(s) caricati con successo`)
    
    // Reset input
    event.target.value = ''
    
  } catch (err) {
    console.error('Errore upload allegati cantiere:', err)
    popup.error('Errore Upload', err.message)
  } finally {
    loading.value = false
  }
}

const openFile = async (attachment) => {
  try {
    if (attachment.url) {
      window.open(attachment.url, '_blank')
    } else {
      popup.info('Apertura File', 'Il file verrà scaricato automaticamente')
      await downloadFile(attachment)
    }
  } catch (err) {
    console.error('Errore apertura file:', err)
    popup.error('Errore', 'Impossibile aprire il file')
  }
}

const downloadFile = async (attachment) => {
  try {
    // Se l'attachment ha un URL diretto, usalo
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      link.click()
    } else {
      popup.info('Download', 'Funzionalità di download in fase di implementazione')
    }
  } catch (err) {
    console.error('Errore download file:', err)
    popup.error('Errore', 'Impossibile scaricare il file')
  }
}

const deleteFile = async (attachment) => {
  try {
    const confirmed = await popup.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare il file "${attachment.name}"? Questa azione non può essere annullata.`
    )
    
    if (!confirmed) return
    
    loading.value = true
    
    const result = await firestoreStore.deleteAllegatoCantiere(attachment.id)
    if (result.success) {
      popup.success('File Eliminato', 'Il file è stato eliminato con successo')
    } else {
      throw new Error(result.error)
    }
    
  } catch (err) {
    console.error('Errore eliminazione file:', err)
    popup.error('Errore Eliminazione', err.message)
  } finally {
    loading.value = false
  }
}

// 🔧 FUNZIONI GESTIONE ALLEGATI MATERIALI - Fix funzioni mancanti

const handleMaterialFileUpload = async (event) => {
  try {
    const files = Array.from(event.target.files)
    if (!files.length || !selectedMaterial.value) return
    
    loading.value = true
    
    for (const file of files) {
      // Validazione file
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        popup.warning('File Troppo Grande', `Il file ${file.name} supera i 10MB`)
        continue
      }
      
      // 1. Carica il file su Firebase Storage
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const fileRef = storageRef(storage, `materiali/${selectedMaterial.value.id}/${fileName}`)
      
      await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(fileRef)
      
      // 2. Prepara i dati dell'allegato per Firestore
      const allegatoData = {
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type.split('/')[1] || 'unknown',
        uploadedAt: new Date(),
        description: '',
        category: 'Generale',
        fornitore: getFornitoreById(selectedMaterial.value.fornitoreId)?.nome,
        url: downloadURL,
        path: `materiali/${selectedMaterial.value.id}/${fileName}`
      }
      
      // 3. Salva i metadati in Firestore
      const result = await firestoreStore.createAllegatoMateriale(selectedMaterial.value.id, allegatoData)
      if (!result.success) {
        popup.error('Errore Upload', `Errore durante l'upload di ${file.name}: ${result.error}`)
      }
    }
    
    popup.success('Upload Completato', `${files.length} file(s) caricati con successo`)
    
    // Ricarica gli allegati per aggiornare la visualizzazione
    const allegatiResult = await firestoreStore.loadAllegatiMateriale(selectedMaterial.value.id)
    if (allegatiResult.success) {
      selectedMaterial.value.allegati = allegatiResult.data || []
    }
    
    // Reset input
    event.target.value = ''
    
  } catch (err) {
    console.error('Errore upload allegati materiale:', err)
    popup.error('Errore Upload', err.message)
  } finally {
    loading.value = false
  }
}

const openMaterialFile = async (attachment) => {
  try {
    if (attachment.url) {
      window.open(attachment.url, '_blank')
    } else {
      popup.info('Apertura File', 'Il file verrà scaricato automaticamente')
      await downloadMaterialFile(attachment)
    }
  } catch (err) {
    console.error('Errore apertura file materiale:', err)
    popup.error('Errore', 'Impossibile aprire il file')
  }
}

const downloadMaterialFile = async (attachment) => {
  try {
    loading.value = true
    
    // Se abbiamo già l'URL di download, usalo
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.originalName || attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Altrimenti prova a ottenerlo da Storage usando il path salvato
      const fileRef = storageRef(storage, attachment.path || `materiali/${attachment.materialeId}/${attachment.name}`)
      const url = await getDownloadURL(fileRef)
      
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.originalName || attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    popup.success('Download Avviato', `Il file ${attachment.originalName || attachment.name} verrà scaricato a breve`)
  } catch (err) {
    console.error('Errore download file materiale:', err)
    popup.error('Errore', 'Impossibile scaricare il file: ' + err.message)
  } finally {
    loading.value = false
  }
}

const deleteMaterialFile = async (attachment) => {
  try {
    const confirmed = await popup.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare il file "${attachment.originalName || attachment.name}"? Questa azione non può essere annullata.`
    )
    
    if (!confirmed) return
    
    loading.value = true
    
    // 1. Elimina il file da Firebase Storage
    try {
      const fileRef = storageRef(storage, attachment.path || `materiali/${attachment.materialeId}/${attachment.name}`)
      await deleteObject(fileRef)
    } catch (storageErr) {
      console.warn('Errore eliminazione file da storage:', storageErr)
      // Continuiamo comunque con l'eliminazione del record da Firestore
    }
    
    // 2. Elimina il record da Firestore
    const result = await firestoreStore.deleteAllegatoMateriale(attachment.id)
    if (result.success) {
      // 3. Ricarica gli allegati per aggiornare la visualizzazione
      const allegatiResult = await firestoreStore.loadAllegatiMateriale(selectedMaterial.value.id)
      if (allegatiResult.success) {
        selectedMaterial.value.allegati = allegatiResult.data || []
      }
      
      popup.success('File Eliminato', 'Il file è stato eliminato con successo')
    } else {
      throw new Error(result.error)
    }
    
  } catch (err) {
    console.error('Errore eliminazione file materiale:', err)
    popup.error('Errore Eliminazione', err.message)
  } finally {
    loading.value = false
  }
}

const saveMaterialChanges = async () => {
  try {
    if (!editingMaterial.value) {
      popup.error('Errore', 'Nessun materiale in modifica')
      return
    }
    
    loading.value = true
    
    const result = await firestoreStore.updateMaterialeCantiere(editingMaterial.value.id, editingMaterial.value)
    
    if (result.success) {
      // Ricarica materiali cantiere
      const materialiResult = await firestoreStore.loadMaterialiCantiere(selectedCantiere.value.id)
      if (materialiResult.success) {
        materialiCantiere.value = materialiResult.data
      }
      
      popup.success('Materiale Aggiornato', 'Le modifiche sono state salvate con successo')
      closeEditMaterialModal()
      
      // 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere
      await autoUpdateCantiereCosts(selectedCantiere.value.id)
    } else {
      throw new Error(result.error)
    }
    
  } catch (err) {
    console.error('Errore salvataggio modifiche materiale:', err)
    popup.error('Errore Salvataggio', err.message)
  } finally {
    loading.value = false
  }
}

// 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere quando si modificano i materiali
const autoUpdateCantiereCosts = async (cantiereId) => {
  // Usa la nuova funzione che include le voci aggiuntive
  await autoUpdateCantiereCostsWithVoci(cantiereId)
}

// 📋 FUNZIONI GESTIONE VOCI AGGIUNTIVE
const manageVociAggiuntive = async (cantiere) => {
  try {
    loading.value = true
    selectedCantiere.value = cantiere
    
    console.log('🔍 Apertura modal voci aggiuntive per cantiere:', cantiere.nome)
    console.log('🔍 Costi attuali cantiere:', cantiere.costiAccumulati)
    console.log('🔍 Voci originali:', cantiere.vociAggiuntiveOriginali || [])
    console.log('🔍 Voci aggiunte:', cantiere.vociAggiuntive || [])
    
    // Carica le voci aggiuntive del cantiere (sia originali che aggiunte)
    vociAggiuntiveCantiere.value = [
      ...(cantiere.vociAggiuntiveOriginali || []),
      ...(cantiere.vociAggiuntive || [])
    ]
    
    console.log('🔍 Voci caricate nel modal:', vociAggiuntiveCantiere.value)
    
    showManageVociModal.value = true
    
  } catch (err) {
    console.error('Errore caricamento voci aggiuntive cantiere:', err)
    popup.error('Errore', `Impossibile caricare le voci aggiuntive: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const addVoceAggiuntiva = () => {
  newVoce.value = {
    descrizione: '',
    importo: 0,
    note: '',
    tipo: 'aggiunta' // distingue dalle voci originali
  }
  showAddVoceModal.value = true
}

const saveVoceAggiuntiva = async () => {
  try {
    if (!newVoce.value || !newVoce.value.descrizione || newVoce.value.importo <= 0) {
      popup.error('Inserisci una descrizione valida e un importo maggiore di 0')
      return
    }
    
    loading.value = true
    
    const voceData = {
      ...newVoce.value,
      id: Date.now().toString(),
      tipo: 'aggiunta', // IMPORTANTE: Marca come voce aggiunta
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Aggiungi alla lista locale
    vociAggiuntiveCantiere.value.push(voceData)
    
    // Prepara le voci aggiuntive per il salvataggio (solo quelle aggiunte, non quelle originali)
    const vociAggiunte = vociAggiuntiveCantiere.value.filter(v => v.tipo === 'aggiunta')
    
    // Aggiorna il cantiere con le nuove voci aggiuntive
    await firestoreOperations.update('cantieri', selectedCantiere.value.id, {
      vociAggiuntive: vociAggiunte,
      updatedAt: new Date()
    })
    
    // Ricalcola i costi includendo le voci aggiuntive
    await autoUpdateCantiereCostsWithVoci(selectedCantiere.value.id)
    
    popup.success('Voce aggiuntiva inserita con successo')
    closeAddVoceModal()
    
  } catch (err) {
    console.error('Errore salvataggio voce aggiuntiva:', err)
    popup.error('Errore nel salvataggio della voce aggiuntiva')
  } finally {
    loading.value = false
  }
}

const closeAddVoceModal = () => {
  showAddVoceModal.value = false
  newVoce.value = null
}

const editVoceAggiuntiva = (voce) => {
  // Solo le voci aggiunte possono essere modificate (non quelle originali del preventivo)
  if (voce.tipo !== 'aggiunta') {
    popup.warning('Le voci originali del preventivo non possono essere modificate')
    return
  }
  
  editingVoce.value = { ...voce }
  showEditVoceModal.value = true
}

const saveVoceChanges = async () => {
  try {
    if (!editingVoce.value || !editingVoce.value.descrizione || editingVoce.value.importo <= 0) {
      popup.error('Inserisci una descrizione valida e un importo maggiore di 0')
      return
    }
    
    loading.value = true
    
    // Aggiorna nella lista locale
    const index = vociAggiuntiveCantiere.value.findIndex(v => v.id === editingVoce.value.id)
    if (index !== -1) {
      vociAggiuntiveCantiere.value[index] = { 
        ...editingVoce.value, 
        updatedAt: new Date() 
      }
    }
    
    // Prepara le voci aggiuntive per il salvataggio (solo quelle aggiunte)
    const vociAggiunte = vociAggiuntiveCantiere.value.filter(v => v.tipo === 'aggiunta')
    
    // Aggiorna il cantiere
    await firestoreOperations.update('cantieri', selectedCantiere.value.id, {
      vociAggiuntive: vociAggiunte,
      updatedAt: new Date()
    })
    
    // Ricalcola i costi
    await autoUpdateCantiereCostsWithVoci(selectedCantiere.value.id)
    
    popup.success('Voce aggiuntiva aggiornata con successo')
    closeEditVoceModal()
    
  } catch (err) {
    console.error('Errore salvataggio modifiche voce aggiuntiva:', err)
    popup.error('Errore nel salvataggio delle modifiche')
  } finally {
    loading.value = false
  }
}

const closeEditVoceModal = () => {
  showEditVoceModal.value = false
  editingVoce.value = null
}

const removeVoceAggiuntiva = async (voceId) => {
  try {
    const voce = vociAggiuntiveCantiere.value.find(v => v.id === voceId)
    
    if (voce && voce.tipo !== 'aggiunta') {
      popup.warning('Le voci originali del preventivo non possono essere rimosse')
      return
    }
    
    const confirmed = await popup.confirm('Vuoi rimuovere questa voce aggiuntiva?')
    if (!confirmed) return
    
    loading.value = true
    
    // Rimuovi dalla lista locale
    vociAggiuntiveCantiere.value = vociAggiuntiveCantiere.value.filter(v => v.id !== voceId)
    
    // Prepara le voci aggiuntive per il salvataggio (solo quelle aggiunte)
    const vociAggiunte = vociAggiuntiveCantiere.value.filter(v => v.tipo === 'aggiunta')
    
    // Aggiorna il cantiere
    await firestoreOperations.update('cantieri', selectedCantiere.value.id, {
      vociAggiuntive: vociAggiunte,
      updatedAt: new Date()
    })
    
    // Ricalcola i costi
    await autoUpdateCantiereCostsWithVoci(selectedCantiere.value.id)
    
    popup.success('Voce aggiuntiva rimossa con successo')
    
  } catch (err) {
    console.error('Errore rimozione voce aggiuntiva:', err)
    popup.error('Errore nella rimozione della voce aggiuntiva')
  } finally {
    loading.value = false
  }
}

const getTotalVociAggiuntive = () => {
  return vociAggiuntiveCantiere.value.reduce((acc, voce) => {
    return acc + (voce.importo || 0)
  }, 0)
}

const closeManageVociModal = async () => {
  showManageVociModal.value = false
  vociAggiuntiveCantiere.value = []
  
  // Forza ricarica completa dei cantieri per essere sicuri che l'UI si aggiorni
  try {
    await firestoreStore.loadCantieri()
    
    // Aggiorna selectedCantiere con i dati più recenti quando si chiude il modal
    if (selectedCantiere.value) {
      const cantiereAggiornato = firestoreStore.cantieri.find(c => c.id === selectedCantiere.value.id)
      
      if (cantiereAggiornato) {
        selectedCantiere.value = { ...cantiereAggiornato }
        console.log('🔄 UI aggiornata - Voci aggiuntive:', selectedCantiere.value.costiAccumulati?.vociAggiuntive)
      }
    }
  } catch (error) {
    console.error('Errore ricarica cantieri:', error)
  }
}

// 🚀 AGGIORNAMENTO AUTOMATICO: Ricalcola i costi del cantiere includendo le voci aggiuntive
const autoUpdateCantiereCostsWithVoci = async (cantiereId) => {
  if (!cantiereId) return
  
  try {
    // IMPORTANTE: Ricarica i cantieri dallo store per avere i dati aggiornati
    await firestoreStore.loadCantieri()
    
    // Carica timesheet per manodopera (senza ordinamento per evitare indice)
    const timesheetResult = await firestoreOperations.load('timesheet', [
      ['cantiereId', '==', cantiereId]
    ], null, null, null)
    
    let costoManodopera = 0
    if (timesheetResult.success && timesheetResult.data) {
      costoManodopera = timesheetResult.data.reduce((acc, entry) => {
        const oreLavorate = entry.oreLavorate || entry.ore || 0
        const costoOrario = entry.costoOrario || 0
        return acc + (oreLavorate * costoOrario)
      }, 0)
    }
    
    // Carica materiali del cantiere
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiereId)
    let costoMateriali = 0
    if (materialiResult.success && materialiResult.data) {
      costoMateriali = materialiResult.data.reduce((acc, materiale) => {
        const quantita = materiale.quantitaUtilizzata || materiale.quantitaRichiesta || 0
        const prezzo = materiale.prezzoUnitario || 0
        return acc + (quantita * prezzo)
      }, 0)
    }
    
    // Calcola costo voci aggiuntive (originali + aggiunte)
    const cantiere = firestoreStore.cantieri.find(c => c.id === cantiereId)
    let costoVociAggiuntive = 0
    
    if (cantiere) {
      // Voci originali dal preventivo
      const vociOriginali = cantiere.vociAggiuntiveOriginali || []
      const costoVociOriginali = vociOriginali.reduce((acc, voce) => acc + (voce.importo || 0), 0)
      
      // Voci aggiunte nel cantiere
      const vociAggiunte = cantiere.vociAggiuntive || []
      const costoVociAggiunte = vociAggiunte.reduce((acc, voce) => acc + (voce.importo || 0), 0)
      
      costoVociAggiuntive = costoVociOriginali + costoVociAggiunte
      
      console.log('🔍 Voci aggiuntive - Originali:', costoVociOriginali, 'Aggiunte:', costoVociAggiunte, 'Totale:', costoVociAggiuntive)
    } else {
      console.log('❌ Cantiere non trovato nel store!')
    }
    
    // Calcola statistiche
    const giorniLavorativi = timesheetResult.success ? 
      [...new Set(timesheetResult.data.map(t => t.data))].length : 0
    const oreTotali = timesheetResult.success ?
      timesheetResult.data.reduce((acc, t) => acc + (t.oreLavorate || t.ore || 0), 0) : 0
    
    // Aggiorna i costi nel cantiere
    const updateData = {
      costiAccumulati: {
        manodopera: Math.round(costoManodopera * 100) / 100,
        materiali: Math.round(costoMateriali * 100) / 100,
        vociAggiuntive: Math.round(costoVociAggiuntive * 100) / 100,
        totale: Math.round((costoManodopera + costoMateriali + costoVociAggiuntive) * 100) / 100
      },
      statisticheCosti: {
        giorniLavorativi,
        oreTotaliLavorate: oreTotali,
        costoMedioGiornaliero: giorniLavorativi > 0 ? 
          Math.round(((costoManodopera + costoMateriali + costoVociAggiuntive) / giorniLavorativi) * 100) / 100 : 0
      },
      updatedAt: new Date()
    }
    
    await firestoreOperations.update('cantieri', cantiereId, updateData)
    
    // Ricarica i cantieri per aggiornare l'UI
    await firestoreStore.loadCantieri()
    
    // Aggiorna anche selectedCantiere se è lo stesso cantiere aggiornato
    if (selectedCantiere.value && selectedCantiere.value.id === cantiereId) {
      const cantiereAggiornato = firestoreStore.cantieri.find(c => c.id === cantiereId)
      if (cantiereAggiornato) {
        selectedCantiere.value = { ...cantiereAggiornato }
      }
    }
    
    console.log('✅ Costi aggiornati con voci aggiuntive:', {
      manodopera: costoManodopera,
      materiali: costoMateriali,
      vociAggiuntive: costoVociAggiuntive,
      totale: costoManodopera + costoMateriali + costoVociAggiuntive
    })
    
  } catch (error) {
    console.error('Errore aggiornamento costi con voci aggiuntive:', error)
  }
}

// 🔄 Funzioni di gestione cantieri
const resetNewCantiere = () => {
  newCantiere.value = {
    nome: '',
    cliente: {
      id: '',
      nome: ''
    },
    indirizzo: '',
    tipoLavoro: '',
    valore: 0,
    dataInizio: '',
    scadenza: '',
    stato: 'pianificato',
    priorita: 'media',
    progresso: 0,
    team: [],
    costiAccumulati: {
      materiali: 0,
      manodopera: 0,
      totale: 0
    }
  }
  clientSelectionMode.value = 'existing'
  selectedClientFromList.value = ''
}



const showCantiereDetail = (cantiere) => {
  selectedCantiere.value = { ...cantiere }
  showDetailModal.value = true
}

const editCantiere = (cantiere) => {
  // Crea una copia profonda per gestire correttamente l'oggetto cliente
  editingCantiere.value = {
    ...cantiere,
    cliente: typeof cantiere.cliente === 'object' && cantiere.cliente 
      ? { ...cantiere.cliente }
      : { nome: cantiere.cliente || '' }
  }
  showEditModal.value = true
}

const updateProgress = (cantiere) => {
  selectedCantiere.value = cantiere
  
  // Reset dei dati del modal
  progressUpdate.value = {
    incremento: 5,
    fase: '',
    nota: '',
    dataCompletamento: new Date().toISOString().split('T')[0]
  }
  
  showProgressModal.value = true
}

const saveProgressUpdate = async () => {
  try {
    if (!selectedCantiere.value || !progressUpdate.value.incremento || !progressUpdate.value.fase) {
      popup.error('Campi Mancanti', 'Incremento e fase sono obbligatori')
      return
    }
    
    loading.value = true
    
    // Calcola il nuovo progresso
    const nuovoProgresso = Math.min(
      (selectedCantiere.value.progresso || 0) + progressUpdate.value.incremento,
      100
    )
    
    // Prepara i dati di aggiornamento
    const updateData = {
      progresso: nuovoProgresso,
      ultimaFaseCompletata: progressUpdate.value.fase,
      noteProgresso: progressUpdate.value.nota,
      dataUltimoAggiornamento: new Date(),
      updatedAt: new Date()
    }
    
    // Se raggiungiamo il 100%, aggiorna lo stato
    if (nuovoProgresso === 100) {
      updateData.stato = 'completato'
      updateData.dataCompletamento = new Date(progressUpdate.value.dataCompletamento)
    }
    
    // Salva in Firestore
    await firestoreOperations.update('cantieri', selectedCantiere.value.id, updateData)
    
    // Chiudi modal e resetta dati
    showProgressModal.value = false
    progressUpdate.value = {
      incremento: 5,
      fase: '',
      nota: '',
      dataCompletamento: new Date().toISOString().split('T')[0]
    }
    
    // Mostra messaggio di successo
    if (nuovoProgresso === 100) {
      popup.success('Cantiere Completato! 🎉', 
        `Il cantiere "${selectedCantiere.value.nome}" è stato completato al 100%`)
    } else {
      popup.success('Progresso Aggiornato', 
        `Progresso aggiornato al ${nuovoProgresso}% - Fase: ${progressUpdate.value.fase}`)
    }
    
    // Ricarica i cantieri per aggiornare l'UI
    await firestoreStore.loadCantieri()
    
  } catch (error) {
    console.error('Errore aggiornamento progresso:', error)
    popup.error('Errore Aggiornamento', 'Impossibile aggiornare il progresso del cantiere')
  } finally {
    loading.value = false
  }
}

const viewMaterials = async (cantiere) => {
  try {
    loading.value = true
    selectedCantiere.value = cantiere
    
    // Carica materiali del cantiere
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiere.id)
    if (materialiResult.success) {
      materialiCantiere.value = materialiResult.data
    } else {
      materialiCantiere.value = []
    }
    
    showManageMaterialsModal.value = true
    
  } catch (err) {
    console.error('Errore caricamento materiali cantiere:', err)
    popup.error('Errore', `Impossibile caricare i materiali: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const manageMaterials = () => {
  // Questa funzione viene chiamata dal modal "visualizza" per andare al modal "gestione"
  // Per ora è identica a viewMaterials, ma potrebbe essere espansa in futuro
  // Il modal è già aperto, quindi non serve riaprirlo
  console.log('Modal gestione materiali già aperto')
}

const manageAttachments = (cantiere) => {
  selectedCantiere.value = cantiere
  showAttachmentsModal.value = true
}

const manageTeam = async (cantiere) => {
  selectedCantiere.value = cantiere
  showTeamModal.value = true
}

const openDailyLog = (cantiere) => {
  // Naviga al giornale di cantiere
  router.push({
    name: 'giornale-cantiere',
    params: { id: cantiere.id }
  })
}

const deleteCantiere = async (cantiere) => {
  try {
    loading.value = true
    
    // 🔒 CONTROLLI DI SICUREZZA AVANZATI
    
    // 1. Blocca eliminazione cantieri attivi
    if (cantiere.stato === 'in_corso' || cantiere.stato === 'attivo') {
      popup.error(
        'Eliminazione Bloccata',
        `⚠️ Non è possibile eliminare un cantiere con stato "${cantiere.stato}". \n\nPer eliminare questo cantiere:\n1. Cambia lo stato in "sospeso" o "completato"\n2. Riprova l'eliminazione`
      )
      loading.value = false
      return
    }
    
    // 2. Verifica dati associati al cantiere
    console.log('🔍 Verifica dati associati al cantiere:', cantiere.nome)
    
    // Controlla timesheet associati
    const timesheetResult = await firestoreOperations.load('timesheet', [
      ['cantiereId', '==', cantiere.id]
    ], null, null, null)
    
    const hasTimesheet = timesheetResult.success && timesheetResult.data && timesheetResult.data.length > 0
    
    // Controlla materiali associati
    const materialiResult = await firestoreStore.loadMaterialiCantiere(cantiere.id)
    const hasMateriali = materialiResult.success && materialiResult.data && materialiResult.data.length > 0
    
    // Controlla voci aggiuntive
    const hasVociAggiuntive = (cantiere.vociAggiuntive && cantiere.vociAggiuntive.length > 0) ||
                              (cantiere.vociAggiuntiveOriginali && cantiere.vociAggiuntiveOriginali.length > 0)
    
    // Controlla progresso cantiere
    const hasProgresso = cantiere.progresso && cantiere.progresso > 0
    
    // 3. Prepara messaggio elegante e informativo
    let warningMessage = `Stai per eliminare il cantiere "${cantiere.nome}"`
    
    if (hasTimesheet || hasMateriali || hasVociAggiuntive || hasProgresso) {
      warningMessage += '\n\nDati associati che verranno rimossi:'
      
      if (hasTimesheet) {
        warningMessage += `\n📊 ${timesheetResult.data.length} registrazioni timesheet`
      }
      if (hasMateriali) {
        warningMessage += `\n📦 ${materialiResult.data.length} materiali utilizzati`
      }
      if (hasVociAggiuntive) {
        const vociTotali = (cantiere.vociAggiuntive?.length || 0) + (cantiere.vociAggiuntiveOriginali?.length || 0)
        warningMessage += `\n📋 ${vociTotali} voci aggiuntive`
      }
      if (hasProgresso) {
        warningMessage += `\n📈 Progresso: ${cantiere.progresso}%`
      }
      
      if (cantiere.costiAccumulati && cantiere.costiAccumulati.totale > 0) {
        warningMessage += `\n💰 Costi totali: €${cantiere.costiAccumulati.totale}`
      }
    }
    
    warningMessage += '\n\nQuesta operazione non può essere annullata.'
    
    // 4. Prima conferma elegante
    const firstConfirm = await popup.confirm(
      'Conferma Eliminazione',
      warningMessage
    )
    
    if (!firstConfirm) {
      loading.value = false
      return
    }
    
    // 5. Controllo sicurezza: inserire nome cantiere
    const nomeConferma = window.prompt(
      `🔐 CONTROLLO DI SICUREZZA\n\nPer confermare l'eliminazione, scrivi esattamente il nome del cantiere:\n\n"${cantiere.nome}"`
    )
    
    // 🚀 FIX: Confronto case-insensitive e con trim su entrambi i valori per massima robustezza
    if (!nomeConferma || nomeConferma.trim().toLowerCase() !== cantiere.nome.trim().toLowerCase()) {
      popup.error('Eliminazione Annullata', 'Il nome inserito non corrisponde. Operazione annullata per sicurezza.')
      loading.value = false
      return
    }
    
    // 6. Eliminazione con log di sicurezza
    console.log('🔥 ELIMINAZIONE CANTIERE AUTORIZZATA:', {
      cantiere: cantiere.nome,
      id: cantiere.id,
      timestamp: new Date().toISOString(),
      hasTimesheet,
      hasMateriali,
      hasVociAggiuntive,
      hasProgresso
    })
    
    await firestoreOperations.delete('cantieri', cantiere.id)
    popup.success('Cantiere Eliminato', 'Il cantiere è stato eliminato definitivamente')
    
  } catch (err) {
    popup.error('Errore Eliminazione', err.message)
  } finally {
    loading.value = false
  }
}

const addCantiere = async () => {
  try {
    // Validazione base
    if (!newCantiere.value.nome || !newCantiere.value.valore) {
      popup.error('Campi Mancanti', 'Nome e valore sono obbligatori')
      return
    }

    // Prepara i dati del cliente
    let clienteData
    if (clientSelectionMode.value === 'existing') {
      const clienteSelezionato = availableClients.value.find(c => c.id === selectedClientFromList.value)
      if (!clienteSelezionato) {
        popup.error('Cliente Mancante', 'Seleziona un cliente dalla lista')
        return
      }
      clienteData = {
        id: clienteSelezionato.id,
        nome: clienteSelezionato.nome,
        email: clienteSelezionato.email
      }
    } else if (clientSelectionMode.value === 'new') {
      // Crea nuovo cliente
      if (!newCantiere.value.cliente.nome) {
        popup.error('Cliente Mancante', 'Inserisci il nome del cliente')
        return
      }

      const nuovoCliente = {
        nome: newCantiere.value.cliente.nome,
        tipo: newCantiere.value.clienteTipo || 'privato',
        email: newCantiere.value.clienteEmail || '',
        telefono: newCantiere.value.clienteTelefono || '',
        indirizzo: newCantiere.value.clienteIndirizzo || '',
        stato: 'attivo'
      }

      // Crea il cliente in Firestore
      const clienteResult = await firestoreStore.createCliente(nuovoCliente)
      if (!clienteResult.success) {
        throw new Error('Errore durante la creazione del cliente')
      }

      clienteData = {
        id: clienteResult.id,
        nome: nuovoCliente.nome,
        email: nuovoCliente.email
      }
    }

    // Crea il cantiere con i dati del cliente
    const cantiereData = {
      ...newCantiere.value,
      cliente: clienteData
    }

    // Crea il cantiere in Firestore
    const result = await firestoreStore.createCantiere(cantiereData)
    
    if (result.success) {
      popup.success('Successo', 'Cantiere creato con successo')
      closeAddModal()
    } else {
      throw new Error('Errore durante la creazione del cantiere')
    }
  } catch (error) {
    console.error('Errore creazione cantiere:', error)
    popup.error('Errore', error.message || 'Errore durante la creazione del cantiere')
  }
}

const saveCantiere = async () => {
  try {
    loading.value = true
    popup.info('Salvataggio in corso...')
    
    if (editingCantiere.value.id) {
      await firestoreOperations.update('cantieri', editingCantiere.value.id, editingCantiere.value)
      popup.success('Cantiere Aggiornato', 'Le modifiche sono state salvate con successo')
    } else {
      // Se il cliente è nuovo, crealo prima
      if (typeof editingCantiere.value.cliente === 'string') {
        const clienteResult = await firestoreOperations.create('clienti', nuovoCliente.value)
        editingCantiere.value.cliente = clienteResult.data
      }
      
      await firestoreOperations.cantieri.create(editingCantiere.value)
      popup.success('Cantiere Creato', 'Il nuovo cantiere è stato creato con successo')
    }
    
    showNewCantiereModal.value = false
    showEditModal.value = false
    
  } catch (err) {
    popup.error('Errore Salvataggio', err.message)
  } finally {
    loading.value = false
  }
}

// 🚪 Helper per chiudere i modali generici
const closeModal = () => {
  showDetailModal.value = false
  selectedCantiere.value = null
}

// Computed per i dipendenti disponibili
const getAvailableEmployees = () => {
  // Se non ci sono dipendenti caricati, ritorna array vuoto
  if (!firestoreStore.dipendenti) return []
  
  // 🚀 MULTI-ASSIGNMENT: Permette ai dipendenti di essere assegnati a più cantieri
  return firestoreStore.dipendenti.filter(dipendente => {
    // Verifica che il dipendente sia attivo
    const isActive = dipendente.stato === 'attivo'
    
    // Verifica che non sia già nel team di QUESTO cantiere specifico
    const notInTeam = !selectedCantiere.value?.team?.some(membro => membro.id === dipendente.id)
    
    // 🔓 RIMOSSO BLOCCO: I dipendenti possono ora essere aggiunti a più cantieri
    // Non controlliamo più cantiereAttuale per permettere multi-assegnazione
    
    return isActive && notInTeam
  }).map(dipendente => ({
    ...dipendente,
    iniziali: getIniziali(dipendente.nome, dipendente.cognome),
    // 📋 INFO CANTIERI: Mostra tutti i cantieri dove è assegnato
    cantieriAssegnati: firestoreStore.cantieri
      .filter(cantiere => cantiere.team?.some(membro => membro.id === dipendente.id))
      .map(cantiere => cantiere.nome)
  }))
}

// Helper per le etichette dei ruoli
const getRuoloLabel = (ruolo, ruoloPersonalizzato = '') => {
  const labels = {
    'capo-squadra': 'Capo Squadra',
    'carpentiere': 'Carpentiere',
    'operaio': 'Operaio Specializzato',
    'amministrativo': 'Amministrativo',
    'manovale': 'Manovale',
    'commerciale': 'Commerciale',
    'tecnico': 'Tecnico',
    'altro': ruoloPersonalizzato || 'Altro'
  }
  return labels[ruolo] || ruolo
}

// Funzioni di gestione del team
const addMemberToTeam = async (dipendente) => {
  try {
    // Verifica se il dipendente è già nel team
    if (selectedCantiere.value.team?.some(m => m.id === dipendente.id)) {
      popup.warning('Attenzione', 'Questo dipendente è già nel team.')
      return
    }

    // Prepara il nuovo membro
    const nuovoMembro = {
      id: dipendente.id,
      nome: dipendente.nome,
      cognome: dipendente.cognome,
      ruolo: dipendente.ruolo,
      pagaOraria: dipendente.pagaOraria
    }

    // Aggiorna il cantiere con il nuovo membro
    const cantiereUpdate = {
      team: [...(selectedCantiere.value.team || []), nuovoMembro]
    }

    // 🚀 MULTI-ASSIGNMENT: Non aggiorniamo più cantiereAttuale per permettere multi-assegnazione
    // Il dipendente può ora essere presente in più team contemporaneamente
    
    // Aggiorna solo il cantiere (non il dipendente per evitare blocchi)
    const cantiereRef = doc(db, 'cantieri', selectedCantiere.value.id)

    await runTransaction(db, async (transaction) => {
      // Verifica che il cantiere esista
      const cantiereDoc = await transaction.get(cantiereRef)

      if (!cantiereDoc.exists()) {
        throw new Error('Il cantiere non esiste più')
      }

      // Aggiorna solo il cantiere - il dipendente rimane libero per altri cantieri
      transaction.update(cantiereRef, cantiereUpdate)
    })

    // Aggiorna lo stato locale
    selectedCantiere.value.team = cantiereUpdate.team
    
    // Popup veloce e discreto per conferma
    popup.success('✅ Aggiunto al Team', `${dipendente.nome} ${dipendente.cognome}`)
  } catch (error) {
    console.error('Errore aggiunta membro al team:', error)
    popup.error('Errore', `Impossibile aggiungere il membro al team: ${error.message}`)
  }
}

const removeMemberFromTeam = async (membroId) => {
  try {
    // Trova il membro nel team
    const membro = selectedCantiere.value.team?.find(m => m.id === membroId)
    if (!membro) {
      popup.error('Errore', 'Membro non trovato nel team.')
      return
    }

    // Rimuovi il membro dal team del cantiere
    const cantiereUpdate = {
      team: selectedCantiere.value.team.filter(m => m.id !== membroId)
    }

    // 🚀 MULTI-ASSIGNMENT: Non rimuoviamo cantiereAttuale perché potrebbe essere in altri team
    // Il dipendente rimane disponibile per tutti gli altri cantieri dove è assegnato
    
    // Aggiorna solo il cantiere
    const cantiereRef = doc(db, 'cantieri', selectedCantiere.value.id)

    await runTransaction(db, async (transaction) => {
      // Verifica che il cantiere esista
      const cantiereDoc = await transaction.get(cantiereRef)

      if (!cantiereDoc.exists()) {
        throw new Error('Il cantiere non esiste più')
      }

      // Aggiorna solo il cantiere - il dipendente rimane disponibile per altri cantieri
      transaction.update(cantiereRef, cantiereUpdate)
    })

    // Aggiorna lo stato locale
    selectedCantiere.value.team = cantiereUpdate.team
    
    popup.success('Membro Rimosso', `${membro.nome} ${membro.cognome} è stato rimosso dal team.`)
  } catch (error) {
    console.error('Errore rimozione membro dal team:', error)
    popup.error('Errore', `Impossibile rimuovere il membro dal team: ${error.message}`)
  }
}

// Funzione per aprire il modal di gestione team
const openTeamModal = async (cantiere) => {
  try {
    selectedCantiere.value = cantiere
    
    // Carica i dipendenti se non sono già stati caricati
    if (!firestoreStore.dipendenti.length) {
      await firestoreStore.loadDipendenti()
    }
    
    // Aggiunge le iniziali ai membri del team esistente
    if (selectedCantiere.value?.team) {
      selectedCantiere.value.team = selectedCantiere.value.team.map(membro => ({
        ...membro,
        iniziali: getIniziali(membro.nome, membro.cognome)
      }))
    }
    
    showTeamModal.value = true
  } catch (error) {
    console.error('Errore apertura modal team:', error)
    popup.error('Errore', `Impossibile aprire la gestione team: ${error.message}`)
  }
}

// Funzioni per il calcolo dei costi
const calculateTeamHourlyCost = () => {
  if (!selectedCantiere.value?.team?.length) return 0
  return selectedCantiere.value.team.reduce((acc, membro) => acc + (membro.pagaOraria || 0), 0)
}

const calculateTeamDailyCost = (cantiere) => {
  if (!cantiere?.team?.length) return 0
  const costoOrario = cantiere.team.reduce((acc, membro) => acc + (membro.pagaOraria || 0), 0)
  return costoOrario * 8 // 8 ore lavorative al giorno
}

const calculateMonthlyCost = (cantiere) => {
  if (!cantiere?.team?.length) return 0
  const costoGiornaliero = calculateTeamDailyCost(cantiere)
  return costoGiornaliero * 26 // 26 giorni lavorativi al mese [[memory:1910188113861248821]]
}

const saveTeamChanges = async () => {
  try {
    loading.value = true
    
    const updateData = {
      team: selectedCantiere.value.team,
      updatedAt: new Date()
    }
    
    await firestoreOperations.update('cantieri', selectedCantiere.value.id, updateData)
    popup.success('Team Aggiornato', 'Il team del cantiere è stato aggiornato con successo')
    
    showTeamModal.value = false
    
  } catch (err) {
    popup.error('Errore Salvataggio Team', err.message)
  } finally {
    loading.value = false
  }
}

// ... existing code ...

// Helper per le iniziali
const getIniziali = (nome, cognome) => {
  if (!nome || !cognome) return '??'
  return `${nome[0]}${cognome[0]}`.toUpperCase()
}

// Helper per il fornitore
const getFornitoreById = (id) => {
  return fornitori.value.find(f => f.id === id)
}

// Helper per gli allegati
const getAttachments = () => {
  return selectedCantiere.value?.allegati || []
}

const getMaterialAttachments = () => {
  return selectedMaterial.value?.allegati || []
}

const getFileTypeClass = (type) => {
  const classes = {
    'pdf': 'bg-red-500',
    'doc': 'bg-blue-500',
    'xls': 'bg-green-500',
    'jpg': 'bg-purple-500',
    'png': 'bg-purple-500',
    'txt': 'bg-gray-500'
  }
  return classes[type] || 'bg-gray-500'
}

const getFileTypeIcon = (type) => {
  const icons = {
    'pdf': 'PDF',
    'doc': 'DOC',
    'xls': 'XLS',
    'jpg': 'IMG',
    'png': 'IMG',
    'txt': 'TXT'
  }
  return icons[type] || '???'
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${Math.round(size * 100) / 100} ${units[i]}`
}

const getTotalMaterialAttachmentsSize = () => {
  const attachments = getMaterialAttachments()
  if (!attachments.length) return '0 B'
  const totalSize = attachments.reduce((acc, att) => acc + (att.size || 0), 0)
  return formatFileSize(totalSize)
}

const getLastUploadDate = () => {
  const attachments = getMaterialAttachments()
  if (!attachments.length) return 'N/A'
  
  // Usa uploadedAt invece di uploadDate e gestisci il timestamp di Firestore
  const dates = attachments.map(att => {
    const uploadedAt = att.uploadedAt
    // Se è un timestamp Firestore, usa toDate()
    if (uploadedAt && typeof uploadedAt.toDate === 'function') {
      return uploadedAt.toDate()
    }
    // Altrimenti prova a parsare la data
    return new Date(uploadedAt)
  }).filter(date => !isNaN(date))
  
  if (!dates.length) return 'N/A'
  const lastDate = new Date(Math.max(...dates))
  return formatDate(lastDate, true) // Aggiungiamo true per includere l'ora
}

// 🔧 FUNZIONI MATERIALI CANTIERE - Fix errori calcolatori
const getTotalMaterialsValue = () => {
  if (!materialiCantiere.value?.length) return 0
  return materialiCantiere.value.reduce((acc, materiale) => {
    const quantita = materiale.quantitaRichiesta || 0
    const prezzo = materiale.prezzoUnitario || 0
    return acc + (quantita * prezzo)
  }, 0)
}

const getCompletedMaterials = () => {
  if (!materialiCantiere.value?.length) return 0
  return materialiCantiere.value.filter(materiale => 
    materiale.stato === 'consegnato' || materiale.stato === 'completato'
  ).length
}

const getMaterialAttachmentCount = (materiale) => {
  if (!materiale?.allegati) return 0
  return materiale.allegati.length
}

const getMaterialStatusColor = (stato) => {
  const colors = {
    'ordinato': 'bg-blue-100 text-blue-800',
    'consegnato': 'bg-green-100 text-green-800',
    'in-attesa': 'bg-yellow-100 text-yellow-800',
    'annullato': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

// ... existing code ...
</script>

<template>
  <div class="space-y-6">
    <!-- Header Cantieri -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Cantieri</h1>
        <p class="text-gray-600">Progetti e commesse - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="w-full sm:w-auto btn-primary py-3 text-base">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Cantiere
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <BuildingOfficeIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Cantieri Attivi</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.attivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg flex-shrink-0">
            <CurrencyEuroIcon class="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Valore Totale</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">€{{ stats.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <CalendarDaysIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">In Scadenza</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.inScadenza }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div class="ml-3 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Completati Mese</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ stats.completatiMese }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca cantieri..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti gli stati</option>
            <option value="pianificato">Pianificato</option>
            <option value="in-corso">In Corso</option>
            <option value="completato">Completato</option>
            <option value="sospeso">Sospeso</option>
          </select>
        </div>
        <div class="w-full sm:w-52">
          <select v-model="selectedPriority" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutte le priorità</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="bassa">Bassa</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="cantieriVisibili.length === 0" class="text-center py-12">
      <div class="mx-auto h-24 w-24 text-gray-400 flex items-center justify-center text-4xl mb-4">
        🏗️
      </div>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Nessun cantiere trovato</h3>
      <p class="mt-1 text-sm text-gray-500 mb-6">
        {{ cantieri.length === 0 ? 'Inizia creando il tuo primo cantiere.' : 'Prova a modificare i filtri di ricerca.' }}
      </p>
      <button v-if="cantieri.length === 0" @click="showAddModal = true" class="btn-primary">
        <span class="mr-2">➕</span>
        Crea Primo Cantiere
      </button>
    </div>

    <!-- Grid Cantieri -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="cantiere in cantieriVisibili" :key="cantiere.id" class="card hover:shadow-md transition-shadow duration-200">
        <!-- Header Card -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ cantiere.nome || 'Cantiere senza nome' }}</h3>
            <p class="text-sm text-gray-600">{{ getClienteNome(cantiere.cliente) }}</p>
            <p class="text-xs text-gray-500">{{ cantiere.indirizzo }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusColor(cantiere.stato)">
              {{ getStatusLabel(cantiere.stato) }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityColor(cantiere.priorita)">
              {{ cantiere.priorita }}
            </span>
            <!-- Badge Alert Costi -->
            <span v-if="(cantiere.costiAccumulati?.totale || 0) / cantiere.valore > 0.8" 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ⚠️ Costi
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-600">Progresso</span>
            <span class="font-medium">{{ cantiere.progresso }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="`width: ${cantiere.progresso}%`"></div>
          </div>
        </div>

        <!-- 💰 Riepilogo Costi -->
        <div class="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-700 flex items-center">
              💰 Costi Sostenuti
              <span class="ml-2 text-xs text-green-600">• Auto-sync</span>
            </h4>
          </div>
          
          <!-- Costi Dettagliati -->
          <div class="grid grid-cols-3 gap-3 text-sm mb-3">
            <div>
              <span class="text-gray-600">Materiali:</span>
              <span class="font-medium text-blue-600 block">
                €{{ cantiere.costiAccumulati?.materiali?.toLocaleString() || '0' }}
              </span>
            </div>
            <div>
              <span class="text-gray-600">Manodopera:</span>
              <span class="font-medium text-orange-600 block">
                €{{ cantiere.costiAccumulati?.manodopera?.toLocaleString() || '0' }}
              </span>
            </div>
            <div>
              <span class="text-gray-600">Voci Aggiuntive:</span>
              <span class="font-medium text-purple-600 block">
                €{{ cantiere.costiAccumulati?.vociAggiuntive?.toLocaleString() || '0' }}
              </span>
            </div>
          </div>

          <!-- Totale e Progresso -->
          <div class="pt-2 mt-2 border-t border-green-200">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600 text-sm">Totale Sostenuto:</span>
              <span class="font-bold text-red-600">
                €{{ cantiere.costiAccumulati?.totale?.toLocaleString() || '0' }} / €{{ cantiere.valore?.toLocaleString() || '0' }}
              </span>
            </div>
            
            <!-- Margine di Profitto -->
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600 text-sm">Margine Rimanente:</span>
              <span class="font-bold text-sm" :class="getMargineColor(cantiere)">
                €{{ (cantiere.valore - (cantiere.costiAccumulati?.totale || 0)).toLocaleString() }}
                <span class="text-xs ml-1" :class="getMarginePercentColor(cantiere)">
                  ({{ getMarginePercent(cantiere) }})
                </span>
              </span>
            </div>

            <!-- Barra di Progresso Costi -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div class="h-2 rounded-full transition-all duration-300" 
                   :class="getPerformanceBarColor(cantiere)"
                   :style="`width: ${Math.min(100, (cantiere.costiAccumulati?.totale || 0) / cantiere.valore * 100)}%`">
              </div>
            </div>

            <!-- Stats Footer -->
            <div class="flex justify-between items-center text-xs text-gray-500">
              <div v-if="cantiere.statisticheCosti?.giorniLavorativi">
                {{ cantiere.statisticheCosti.giorniLavorativi }} giorni • 
                {{ cantiere.statisticheCosti.oreTotaliLavorate || 0 }}h totali
              </div>
              <div class="text-gray-600 font-medium">
                <span v-if="(cantiere.costiAccumulati?.totale || 0) > 0">
                  €{{ Math.round((cantiere.costiAccumulati?.totale || 0) / Math.max(1, cantiere.statisticheCosti?.giorniLavorativi || 1)).toLocaleString() }}/giorno
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Cantiere -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Tipo Lavoro:</span>
            <span class="font-medium truncate ml-2">{{ cantiere.tipoLavoro }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Valore:</span>
            <span class="font-medium truncate ml-2">€{{ cantiere.valore ? cantiere.valore.toLocaleString() : '0' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Manodopera/giorno:</span>
            <span class="font-medium truncate ml-2 text-orange-600">
              €{{ getManodoperaGiornaliera(cantiere).toLocaleString() }}
              <span v-if="getManodoperaGiornaliera(cantiere) > 0" class="text-xs text-gray-500 ml-1">
                (effettiva)
              </span>
              <span v-else-if="calculateActualDailyCost(cantiere) > 0" class="text-xs text-gray-500 ml-1">
                (stimato: €{{ calculateActualDailyCost(cantiere).toLocaleString() }})
              </span>
            </span>
          </div>
          <div class="flex items-center justify-between text-sm min-w-0">
            <span class="text-gray-600 flex-shrink-0">Scadenza:</span>
            <span class="font-medium truncate ml-2" :class="isScaduto(cantiere.scadenza) ? 'text-red-600' : 'text-gray-900'">
              {{ formatDate(cantiere.scadenza) }}
            </span>
          </div>
        </div>

        <!-- Team Assegnato -->
        <div class="mb-4">
          <p class="text-xs text-gray-500 mb-2">Team Assegnato</p>
          <div class="flex -space-x-2">
            <div v-for="membro in (cantiere.team || []).slice(0, 3)" :key="membro.id" 
                 class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
              {{ membro.iniziali }}
            </div>
            <div v-if="(cantiere.team || []).length > 3" 
                 class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
              +{{ (cantiere.team || []).length - 3 }}
            </div>
          </div>
        </div>

        <!-- Info Allegati -->
        <div v-if="getCantiereAttachments(cantiere.id).length > 0" class="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center space-x-2">
            <PaperClipIcon class="w-4 h-4 text-blue-600" />
            <span class="text-xs text-blue-700 font-medium">
              {{ getCantiereAttachments(cantiere.id).length }} allegat{{ getCantiereAttachments(cantiere.id).length === 1 ? 'o' : 'i' }}
            </span>
          </div>
        </div>

        <!-- Azioni -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <button @click="showCantiereDetail(cantiere)" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Visualizza
          </button>
          <div class="flex space-x-2">
            <div class="relative group">
              <button @click="openDailyLog(cantiere)" class="text-gray-400 hover:text-gray-600">
                <DocumentTextIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Giornale di cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="editCantiere(cantiere)" class="text-gray-400 hover:text-gray-600">
                <PencilIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Modifica cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="updateProgress(cantiere)" class="text-gray-400 hover:text-gray-600">
                <ChartBarIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Aggiorna progresso
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="viewMaterials(cantiere)" class="text-gray-400 hover:text-gray-600">
                <CubeIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Visualizza materiali
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageVociAggiuntive(cantiere)" class="text-purple-500 hover:text-purple-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci voci aggiuntive
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageAttachments(cantiere)" class="text-blue-500 hover:text-blue-700">
                <PaperClipIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci allegati
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="manageTeam(cantiere)" class="text-blue-500 hover:text-blue-700">
                <UsersIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Gestisci team
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div class="relative group">
              <button @click="deleteCantiere(cantiere)" class="text-red-500 hover:text-red-700">
                <TrashIcon class="w-5 h-5" />
              </button>
              <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Elimina cantiere
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dettaglio Cantiere - Mobile Optimized -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">{{ selectedCantiere?.nome }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div v-if="selectedCantiere" class="space-y-6">
            <!-- Mobile: Stack Layout -->
            <div class="block lg:hidden space-y-6">
              <!-- Info Generali -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">Informazioni Generali</h4>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Cliente:</span> 
                    <span class="font-medium truncate ml-2">{{ getClienteNome(selectedCantiere.cliente) }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Indirizzo:</span> 
                    <span class="font-medium text-right truncate ml-2">{{ selectedCantiere.indirizzo }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Tipo Lavoro:</span> 
                    <span class="font-medium truncate ml-2">{{ selectedCantiere.tipoLavoro }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Valore:</span> 
                    <span class="font-medium truncate ml-2">€{{ selectedCantiere.valore ? selectedCantiere.valore.toLocaleString() : '0' }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Manodopera/giorno:</span> 
                    <span class="font-medium truncate ml-2 text-orange-600">€{{ calculateTeamDailyCost(selectedCantiere).toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Data Inizio:</span> 
                    <span class="font-medium truncate ml-2">{{ formatDate(selectedCantiere.dataInizio) }}</span>
                  </div>
                  <div class="flex justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0">Scadenza:</span> 
                    <span class="font-medium truncate ml-2">{{ formatDate(selectedCantiere.scadenza) }}</span>
                  </div>
                </div>
              </div>

              <!-- Storico Aggiornamenti Progresso -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                  📊 Storico Progresso
                </h4>
                
                <div v-if="getProgressHistory(selectedCantiere?.id)?.length > 0" class="space-y-4 max-h-64 overflow-y-auto">
                  <div v-for="(update, index) in getProgressHistory(selectedCantiere?.id)" :key="index" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <ChartBarIcon class="w-4 h-4 text-accent-600" />
                        <span class="font-medium text-gray-900">{{ update.fase }}</span>
                      </div>
                      <div class="text-right">
                        <span class="text-sm font-bold text-accent-600">+{{ update.incremento }}%</span>
                        <p class="text-xs text-gray-500">{{ formatDate(update.dataCompletamento) }}</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600" v-if="update.nota">{{ update.nota }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Progresso: {{ update.progressoPrecedente }}% → {{ update.nuovoProgresso }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Stato Vuoto -->
                <div v-else class="text-center py-8 text-gray-500">
                  <ChartBarIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p class="text-sm font-medium text-gray-400">Nessun aggiornamento registrato</p>
                  <p class="text-xs text-gray-400 mt-1">I progressi del cantiere appariranno qui</p>
                </div>
              </div>
            </div>

            <!-- Desktop: Grid Layout -->
            <div class="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              <!-- Info Generali -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Informazioni Generali</h4>
                <div class="space-y-2 text-sm">
                  <div><span class="text-gray-600">Cliente:</span> {{ getClienteNome(selectedCantiere.cliente) }}</div>
                  <div><span class="text-gray-600">Indirizzo:</span> {{ selectedCantiere.indirizzo }}</div>
                  <div><span class="text-gray-600">Tipo Lavoro:</span> {{ selectedCantiere.tipoLavoro }}</div>
                  <div><span class="text-gray-600">Valore:</span> €{{ selectedCantiere.valore ? selectedCantiere.valore.toLocaleString() : '0' }}</div>
                  <div><span class="text-gray-600">Manodopera/giorno:</span> <span class="text-orange-600 font-medium">€{{ calculateTeamDailyCost(selectedCantiere).toLocaleString() }}</span></div>
                  <div><span class="text-gray-600">Data Inizio:</span> {{ formatDate(selectedCantiere.dataInizio) }}</div>
                  <div><span class="text-gray-600">Scadenza:</span> {{ formatDate(selectedCantiere.scadenza) }}</div>
                </div>
              </div>

              <!-- Storico Aggiornamenti Progresso -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">📊 Storico Progresso</h4>
                
                <div v-if="getProgressHistory(selectedCantiere?.id)?.length > 0" class="space-y-3 max-h-48 overflow-y-auto">
                  <div v-for="(update, index) in getProgressHistory(selectedCantiere?.id)" :key="index" class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <ChartBarIcon class="w-4 h-4 text-accent-600" />
                        <span class="font-medium text-gray-900">{{ update.fase }}</span>
                      </div>
                      <div class="text-right">
                        <span class="text-sm font-bold text-accent-600">+{{ update.incremento }}%</span>
                        <p class="text-xs text-gray-500">{{ formatDate(update.dataCompletamento) }}</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600" v-if="update.nota">{{ update.nota }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Progresso: {{ update.progressoPrecedente }}% → {{ update.nuovoProgresso }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Stato Vuoto -->
                <div v-else class="text-center py-6 text-gray-500">
                  <ChartBarIcon class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p class="text-sm font-medium text-gray-400">Nessun aggiornamento registrato</p>
                  <p class="text-xs text-gray-400 mt-1">I progressi del cantiere appariranno qui</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons Mobile -->
            <div class="pt-6 border-t border-gray-200">
              <div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button @click="deleteCantiere(selectedCantiere)" class="btn-danger py-3 text-base flex-1">
                  🗑️ Elimina Cantiere
                </button>
                <button @click="closeModal" class="btn-secondary py-3 text-base flex-1">
                Chiudi
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Cantiere -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Cantiere</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="editingCantiere" @submit.prevent="saveCantiereChanges" class="space-y-6">
            <!-- Nome Cantiere -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Cantiere</label>
              <input
                v-model="editingCantiere.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Cliente -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <input
                v-model="editingCantiere.cliente.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Indirizzo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
              <textarea
                v-model="editingCantiere.indirizzo"
                rows="2"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Riga 1: Tipo Lavoro e Valore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro</label>
                <select
                  v-model="editingCantiere.tipoLavoro"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="Rifacimento Completo">Rifacimento Completo</option>
                  <option value="Nuova Costruzione">Nuova Costruzione</option>
                  <option value="Restauro Conservativo">Restauro Conservativo</option>
                  <option value="Manutenzione">Manutenzione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valore (€)</label>
                <input
                  v-model.number="editingCantiere.valore"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 2: Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  v-model="editingCantiere.dataInizio"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
                <input
                  v-model="editingCantiere.scadenza"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 3: Stato e Priorità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="editingCantiere.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="in-corso">In Corso</option>
                  <option value="completato">Completato</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  v-model="editingCantiere.priorita"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="bassa">Bassa</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Materiali Cantiere -->
    <div v-if="showManageMaterialsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeManageMaterialsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">Materiali Cantiere</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ getClienteNome(selectedCantiere?.cliente) }}</p>
            </div>
            <button @click="closeManageMaterialsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Stats Materiali -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <CubeIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Totale Materiali</p>
                  <p class="text-lg font-bold text-gray-900">{{ materialiCantiere.length }}</p>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-accent-100 rounded-lg">
                  <CurrencyEuroIcon class="w-5 h-5 text-accent-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Valore Totale</p>
                  <p class="text-lg font-bold text-gray-900">€{{ getTotalMaterialsValue().toLocaleString() }}</p>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon class="w-5 h-5 text-green-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-600">Completati</p>
                  <p class="text-lg font-bold text-gray-900">{{ getCompletedMaterials() }}/{{ materialiCantiere.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista Materiali Mobile -->
          <div class="block lg:hidden space-y-4">
            <div v-for="materiale in materialiCantiere" :key="materiale.id" class="card">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3 flex-1">
                  <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-xs text-gray-600">{{ materiale.descrizione }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                  {{ materiale.stato }}
                </span>
              </div>
              
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Richiesto</p>
                  <p class="font-medium">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Utilizzato</p>
                  <p class="font-medium">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-300"
                      :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                              (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                      :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-500">Valore</p>
                  <p class="font-medium">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabella Materiali Desktop -->
          <div class="hidden lg:block">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materiale</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Richiesto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizzato</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valore</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allegati</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="materiale in materialiCantiere" :key="materiale.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-wood-light rounded-lg flex items-center justify-center mr-3">
                          <span class="text-primary-600 text-xs font-medium">{{ materiale.codice }}</span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ materiale.nome }}</div>
                          <div class="text-sm text-gray-500">{{ materiale.descrizione }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                        {{ materiale.stato }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</div>
                      <div class="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-300"
                          :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                                  (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                          :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                        ></div>
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button @click="manageMaterialAttachments(materiale)" 
                              class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                              title="Gestisci allegati materiale">
                        <PaperClipIcon class="w-4 h-4" />
                        <span v-if="getMaterialAttachmentCount(materiale) > 0" 
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{ getMaterialAttachmentCount(materiale) }}
                        </span>
                        <span v-else class="text-xs text-gray-400">0</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button @click="manageMaterials" class="btn-primary py-3 px-6 text-base mr-3">
              🔧 Gestisci Materiali
            </button>
            <button @click="closeMaterialsModal" class="btn-secondary py-3 px-6 text-base">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aggiornamento Progresso -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeProgressModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-accent-100 rounded-lg">
                <ChartBarIcon class="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📊 Aggiorna Progresso</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedCantiere">
                  {{ selectedCantiere.nome }} - Progresso attuale: {{ selectedCantiere.progresso }}%
                </p>
              </div>
            </div>
            <button @click="closeProgressModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Barra Progresso Attuale -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-600">Progresso Corrente</span>
              <span class="font-bold text-accent-600">{{ selectedCantiere?.progresso }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-accent-500 h-3 rounded-full transition-all duration-300" 
                :style="`width: ${selectedCantiere?.progresso}%`"
              ></div>
            </div>
          </div>

          <form @submit.prevent="saveProgressUpdate" class="space-y-6">
            <!-- Incremento Progresso -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Incremento Progresso (%)</label>
              <div class="grid grid-cols-4 gap-2 mb-3">
                <button 
                  type="button"
                  v-for="increment in [5, 10, 15, 20]" 
                  :key="increment"
                  @click="progressUpdate.incremento = increment"
                  :class="[
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                    progressUpdate.incremento === increment 
                      ? 'bg-accent-500 text-white border-accent-500' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  +{{ increment }}%
                </button>
              </div>
              <input
                v-model.number="progressUpdate.incremento"
                type="number"
                min="1"
                :max="100 - (selectedCantiere?.progresso || 0)"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
                placeholder="Inserisci incremento personalizzato..."
              />
              <p class="text-xs text-gray-500 mt-1">
                Nuovo progresso: {{ Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) }}%
              </p>
            </div>

            <!-- Nome Fase Completata -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fase Completata</label>
              <input
                v-model="progressUpdate.fase"
                type="text"
                required
                placeholder="Es: Posa manto di copertura, Montaggio travi, Isolamento..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Note Dettagliate -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note Dettagliate</label>
              <textarea
                v-model="progressUpdate.nota"
                rows="3"
                placeholder="Descrivi i lavori completati, eventuali problemi risolti, materiali utilizzati..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              ></textarea>
            </div>

            <!-- Data Completamento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Completamento</label>
              <input
                v-model="progressUpdate.dataCompletamento"
                type="date"
                :max="new Date().toISOString().split('T')[0]"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 text-base"
              />
            </div>

            <!-- Preview Completamento -->
            <div v-if="Math.min((selectedCantiere?.progresso || 0) + progressUpdate.incremento, 100) === 100" class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <CheckCircleIcon class="w-5 h-5 text-green-600" />
                <span class="font-medium text-green-900">🎉 Cantiere al 100% - Verrà marcato come COMPLETATO!</span>
              </div>
              <p class="text-sm text-green-700 mt-1">Il cantiere passerà automaticamente allo stato "Completato"</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeProgressModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                📊 Aggiorna Progresso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Nuovo Cantiere -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Nuovo Cantiere</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="newCantiere" @submit.prevent="addCantiere" class="space-y-6">
            <!-- Nome Cantiere -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Cantiere</label>
              <input
                v-model="newCantiere.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Cliente con Sistema Ibrido -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              
              <!-- Toggle Selezione Cliente -->
              <div class="flex space-x-4 mb-4">
                <label class="flex items-center">
                  <input 
                    v-model="clientSelectionMode" 
                    type="radio" 
                    value="existing" 
                    class="text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">📋 Seleziona Esistente</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="clientSelectionMode" 
                    type="radio" 
                    value="new" 
                    class="text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">➕ Nuovo Cliente</span>
                </label>
              </div>

              <!-- Selezione Cliente Esistente -->
              <div v-if="clientSelectionMode === 'existing'" class="space-y-3">
                <div>
                  <select
                    v-model="selectedClientFromList"
                    @change="fillClientFromList"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                  >
                    <option value="">🔍 Seleziona cliente esistente...</option>
                    <option v-for="cliente in availableClients" :key="cliente.id" :value="cliente.id">
                      {{ cliente.nome }} - {{ cliente.tipo === 'privato' ? '👤' : cliente.tipo === 'azienda' ? '🏢' : '🏛️' }} {{ getTipoLabel(cliente.tipo) }}
                    </option>
                  </select>
                </div>
                
                <!-- Preview Cliente Selezionato -->
                <div v-if="getSelectedClient()" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ getSelectedClient().iniziali }}
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ getSelectedClient().nome }}</p>
                      <p class="text-sm text-gray-600">{{ getSelectedClient().email }} • {{ getSelectedClient().telefono }}</p>
                      <p class="text-xs text-gray-500">{{ getSelectedClient().indirizzo }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getTipoColor(getSelectedClient().tipo)">
                        {{ getTipoLabel(getSelectedClient().tipo) }}
                      </span>
                      <p class="text-xs text-gray-500 mt-1">{{ getSelectedClient().numeroProgetti }} progetti</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inserimento Nuovo Cliente -->
              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      v-model="newCantiere.cliente.nome"
                      type="text"
                      required
                      placeholder="Nome cliente/azienda..."
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <select
                      v-model="newCantiere.clienteTipo"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    >
                      <option value="privato">👤 Privato</option>
                      <option value="azienda">🏢 Azienda</option>
                      <option value="ente-pubblico">🏛️ Ente Pubblico</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      v-model="newCantiere.clienteEmail"
                      type="email"
                      placeholder="email@esempio.it"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <input
                      v-model="newCantiere.clienteTelefono"
                      type="tel"
                      placeholder="Telefono cliente"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <input
                    v-model="newCantiere.clienteIndirizzo"
                    type="text"
                    placeholder="Indirizzo cliente (opzionale)"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                  />
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p class="text-sm text-yellow-800">
                    💡 <strong>Nuovo Cliente:</strong> I dati del cliente verranno automaticamente aggiunti all'anagrafica aziendale.
                  </p>
                </div>
              </div>
            </div>

            <!-- Indirizzo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo Cantiere
                <span v-if="clientSelectionMode === 'existing' && getSelectedClient()?.indirizzo" 
                      class="text-xs text-gray-500 font-normal">
                  (pre-popolato con indirizzo cliente - puoi modificarlo)
                </span>
              </label>
              <textarea
                v-model="newCantiere.indirizzo"
                rows="2"
                required
                :placeholder="clientSelectionMode === 'existing' && getSelectedClient()?.indirizzo ? 
                  'Indirizzo del cantiere (modificabile se diverso dal cliente)' : 
                  'Indirizzo dove si svolgerà il cantiere...'"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Riga 1: Tipo Lavoro e Valore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Lavoro</label>
                <select
                  v-model="newCantiere.tipoLavoro"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="Rifacimento Completo">Rifacimento Completo</option>
                  <option value="Nuova Costruzione">Nuova Costruzione</option>
                  <option value="Restauro Conservativo">Restauro Conservativo</option>
                  <option value="Manutenzione">Manutenzione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valore (€)</label>
                <input
                  v-model.number="newCantiere.valore"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 2: Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  v-model="newCantiere.dataInizio"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
                <input
                  v-model="newCantiere.scadenza"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
            </div>

            <!-- Riga 3: Stato e Priorità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="newCantiere.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="in-corso">In Corso</option>
                  <option value="completato">Completato</option>
                  <option value="sospeso">Sospeso</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  v-model="newCantiere.priorita"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="bassa">Bassa</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Nuovo Cantiere
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Team Cantiere -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeTeamModal">
      <div class="relative top-4 mx-auto border w-full max-w-3xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <UsersIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Gestione Team</h3>
                <p class="text-sm text-gray-600 mt-1">
                  <span class="font-medium">{{ selectedCantiere?.nome }}</span>
                  <span v-if="selectedCantiere?.cliente" class="text-gray-400"> • </span>
                  <span class="text-gray-500">{{ getClienteNome(selectedCantiere?.cliente) }}</span>
                </p>
              </div>
            </div>
            <button @click="closeTeamModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2"
                    title="Chiudi gestione team">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Team Attuale -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🔧 Team Assegnato</h4>
              <div v-if="selectedCantiere?.team && selectedCantiere.team.length > 0" class="space-y-3">
                <div v-for="membro in selectedCantiere.team" :key="membro.id" 
                     class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {{ membro.iniziali }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ membro.nome }}</p>
                      <p class="text-sm text-gray-600">{{ membro.ruolo }}</p>
                    </div>
                  </div>
                  <button @click="removeMemberFromTeam(membro.id)" 
                          class="text-red-500 hover:text-red-700 p-1"
                          title="Rimuovi dal team">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <UsersIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nessun dipendente assegnato al cantiere</p>
              </div>
            </div>

            <!-- Dipendenti Disponibili -->
            <div class="card">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">👷 Dipendenti Disponibili</h4>
              <div class="space-y-3 max-h-60 overflow-y-auto">
                <div v-for="dipendente in getAvailableEmployees()" :key="dipendente.id"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      {{ dipendente.iniziali }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ dipendente.nome }} {{ dipendente.cognome }}</p>
                      <p class="text-sm text-gray-600">{{ getRuoloLabel(dipendente.ruolo, dipendente.ruoloPersonalizzato) }}</p>
                      <!-- 🚀 MULTI-ASSIGNMENT: Mostra tutti i cantieri assegnati -->
                      <div class="text-xs text-gray-500">
                        <span v-if="dipendente.cantieriAssegnati?.length > 0">
                          🏗️ {{ dipendente.cantieriAssegnati.join(', ') }}
                        </span>
                        <span v-else class="text-green-600">✅ Disponibile</span>
                      </div>
                    </div>
                  </div>
                  <button @click="addMemberToTeam(dipendente)" 
                          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          title="Aggiungi al team">
                    ➕ Aggiungi
                  </button>
                </div>
              </div>
              <div v-if="getAvailableEmployees().length === 0" class="text-center py-8 text-gray-500">
                <p>🚀 Tutti i dipendenti attivi sono già nel team di questo cantiere</p>
                <p class="text-xs mt-1">I dipendenti possono ora essere assegnati a più cantieri contemporaneamente</p>
              </div>
            </div>

            <!-- Riepilogo -->
            <div class="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <p class="text-sm text-primary-600">Team Assegnato</p>
                  <p class="text-2xl font-bold text-primary-800">{{ selectedCantiere?.team?.length || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Dipendenti Disponibili</p>
                  <p class="text-2xl font-bold text-primary-800">{{ getAvailableEmployees().length }}</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Costo Orario Team</p>
                  <p class="text-2xl font-bold text-primary-800">€{{ calculateTeamHourlyCost() }}/h</p>
                </div>
                <div>
                  <p class="text-sm text-primary-600">Costo Giornaliero</p>
                  <p class="text-2xl font-bold text-orange-600">€{{ calculateTeamDailyCost(selectedCantiere) }}/giorno</p>
                </div>
              </div>
              
              <!-- Costo Mensile (riga separata per evitare sovraffollamento) -->
              <div v-if="selectedCantiere?.team?.length > 0" class="mt-4 pt-4 border-t border-primary-200">
                <div class="text-center">
                  <p class="text-sm text-primary-600">💰 Costo Mensile Stimato (22 gg lavorativi)</p>
                  <p class="text-3xl font-bold text-red-600">€{{ calculateMonthlyCost(selectedCantiere).toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeTeamModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button @click="saveTeamChanges" class="w-full sm:w-auto btn-primary py-3 text-base font-medium">
                💾 Salva Modifiche Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Allegati -->
    <div v-if="showAttachmentsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAttachmentsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Allegati - {{ selectedCantiere?.nome }}</h3>
            <button @click="closeAttachmentsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <div class="text-center">
                <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Carica un file</span>
                    <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt">
                  </label>
                  <p class="pl-1">o trascina qui</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">PDF, DOC, XLS, JPG, PNG fino a 10MB</p>
              </div>
            </div>

            <!-- Lista Allegati -->
            <div v-if="getAttachments()?.length > 0">
              <h4 class="font-semibold text-gray-900 mb-4">Documenti allegati ({{ getAttachments().length }})</h4>
              <div class="space-y-3">
                <div v-for="attachment in getAttachments()" :key="attachment.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <!-- Icona file -->
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getFileTypeClass(attachment.type)">
                        <span class="text-white text-xs font-bold">{{ getFileTypeIcon(attachment.type) }}</span>
                      </div>
                    </div>
                    
                    <!-- Info file -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                      <p class="text-xs text-gray-500">
                        {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadedAt, true) }}
                      </p>
                      <p v-if="attachment.description" class="text-xs text-gray-600 mt-1">{{ attachment.description }}</p>
                    </div>
                  </div>
                  
                  <!-- Azioni -->
                  <div class="flex items-center space-x-2">
                    <button @click="openFile(attachment)" 
                            class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            title="Apri file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button @click="downloadFile(attachment)" 
                            class="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                            title="Scarica file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="deleteFile(attachment)" 
                            class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Elimina file">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nessun allegato -->
            <div v-else class="text-center py-8 text-gray-500">
              <PaperClipIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p class="text-lg font-medium text-gray-400">Nessun allegato</p>
              <p class="text-sm text-gray-400">Carica documenti, fatture o foto del cantiere</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeAttachmentsModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Materiali Cantiere -->
    <div v-if="showManageMaterialsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeManageMaterialsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <CubeIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Gestione Materiali Cantiere</h3>
                <p class="text-sm text-gray-600 mt-1">{{ selectedCantiere?.nome }} - {{ getClienteNome(selectedCantiere?.cliente) }}</p>
              </div>
            </div>
            <button @click="closeManageMaterialsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Lista Materiali -->
          <div class="space-y-4">
            <div v-for="materiale in materialiCantiere" :key="materiale.id" class="card">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3 flex-1">
                  <div class="w-10 h-10 bg-wood-light rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-xs font-bold">{{ materiale.codice }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">{{ materiale.nome }}</h4>
                    <p class="text-xs text-gray-600">{{ materiale.descrizione }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(materiale.stato)">
                  {{ materiale.stato }}
                </span>
              </div>
              
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-gray-500">Richiesto</p>
                  <p class="font-medium">{{ materiale.quantitaRichiesta }} {{ materiale.unita }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Utilizzato</p>
                  <p class="font-medium">{{ materiale.quantitaUtilizzata || 0 }} {{ materiale.unita }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-300"
                      :class="(materiale.quantitaUtilizzata || 0) >= materiale.quantitaRichiesta ? 'bg-green-500' : 
                              (materiale.quantitaUtilizzata || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-300'"
                      :style="`width: ${Math.min(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100, 100)}%`"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ Math.round(((materiale.quantitaUtilizzata || 0) / materiale.quantitaRichiesta) * 100) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-500">Valore</p>
                  <p class="font-medium">€{{ (materiale.quantitaRichiesta * materiale.prezzoUnitario).toFixed(2) }}</p>
                </div>
              </div>
              
              <!-- Azioni Materiale -->
              <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 mt-4">
                <button 
                  @click="editMaterialInCantiere(materiale)" 
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-50"
                  title="Modifica materiale"
                >
                  ✏️ Modifica
                </button>
                <button 
                  @click="manageMaterialAttachments(materiale)" 
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
                  title="Gestisci allegati"
                >
                  📎 Allegati
                  <span v-if="getMaterialAttachmentCount(materiale) > 0" 
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                    {{ getMaterialAttachmentCount(materiale) }}
                  </span>
                </button>
                <button 
                  @click="removeMaterialFromCantiere(materiale.id)" 
                  class="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50"
                  title="Rimuovi materiale"
                >
                  🗑️ Rimuovi
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button @click="addMaterialToCantiere" class="btn-primary py-3 px-6 text-base mr-3">
              ➕ Aggiungi Materiale
            </button>
            <button @click="closeManageMaterialsModal" class="btn-secondary py-3 px-6 text-base">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aggiunta Materiale -->
    <div v-if="showAddMaterialModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeAddMaterialModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Aggiungi Materiale</h3>
            <button @click="closeAddMaterialModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="newMaterial" @submit.prevent="saveMaterialToCantiere" class="space-y-6">
            <!-- Toggle Selezione/Nuovo -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center space-x-4">
                <button 
                  type="button"
                  @click="materialSelectionMode = 'existing'"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                    materialSelectionMode === 'existing' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  📦 Seleziona da Magazzino
                </button>
                <button 
                  type="button"
                  @click="materialSelectionMode = 'new'"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                    materialSelectionMode === 'new' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  ➕ Nuovo Materiale
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                {{ materialSelectionMode === 'existing' 
                   ? 'Seleziona un materiale già presente in magazzino' 
                   : 'Crea un nuovo materiale compilando tutti i campi' }}
              </p>
            </div>

            <!-- Selezione Materiale Esistente -->
            <div v-if="materialSelectionMode === 'existing'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Materiale da Magazzino</label>
                <select
                  v-model="selectedMaterialFromStock"
                  @change="fillMaterialFromStock"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">-- Seleziona un materiale --</option>
                  <option v-for="materiale in materialiMagazzino" :key="materiale.id" :value="materiale.id">
                    {{ materiale.codice }} - {{ materiale.nome }} ({{ materiale.quantita }} {{ materiale.unita }} disponibili)
                  </option>
                </select>
              </div>
              
              <!-- Info Materiale Selezionato -->
              <div v-if="selectedMaterialFromStock" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-blue-900 mb-2">📋 Dettagli Materiale Selezionato</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><span class="text-blue-600">Categoria:</span> {{ getSelectedMaterialFromStock()?.categoria }}</div>
                  <div><span class="text-blue-600">Disponibile:</span> {{ getSelectedMaterialFromStock()?.quantita }} {{ getSelectedMaterialFromStock()?.unita }}</div>
                  <div><span class="text-blue-600">Prezzo:</span> €{{ getSelectedMaterialFromStock()?.prezzoUnitario }}</div>
                </div>
              </div>
            </div>

            <!-- Campi Materiale (sempre visibili ma readonly se da magazzino) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nome Materiale -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
                <input
                  v-model="newMaterial.nome"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>

              <!-- Codice -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
                <input
                  v-model="newMaterial.codice"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                v-model="newMaterial.descrizione"
                rows="2"
                :readonly="materialSelectionMode === 'existing'"
                :class="[
                  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                  materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                ]"
              ></textarea>
            </div>

            <!-- Quantità e Unità -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Richiesta</label>
                <input
                  v-model.number="newMaterial.quantitaRichiesta"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unità di Misura</label>
                <input
                  v-model="newMaterial.unita"
                  type="text"
                  required
                  :readonly="materialSelectionMode === 'existing'"
                  :class="[
                    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base',
                    materialSelectionMode === 'existing' ? 'bg-gray-100' : ''
                  ]"
                />
              </div>
            </div>

            <!-- Prezzo Unitario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prezzo Unitario (€)
                <span v-if="materialSelectionMode === 'existing'" class="text-xs text-gray-500">
                  (modificabile per questo cantiere)
                </span>
              </label>
              <input
                v-model.number="newMaterial.prezzoUnitario"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                :placeholder="materialSelectionMode === 'existing' ? 'Prezzo personalizzato per questo cantiere' : ''"
              />
            </div>

            <!-- Stato e Fornitore -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  v-model="newMaterial.stato"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="pianificato">Pianificato</option>
                  <option value="ordinato">Ordinato</option>
                  <option value="in-uso">In Uso</option>
                  <option value="utilizzato">Utilizzato</option>
                  <option value="completato">Completato</option>
                  <option value="in-lavorazione">In Lavorazione</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fornitore</label>
                <select
                  v-model="newMaterial.fornitoreId"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">-- Seleziona fornitore --</option>
                  <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
                    {{ fornitore.nome }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Data Acquisto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Acquisto</label>
              <input
                v-model="newMaterial.dataAcquisto"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                v-model="newMaterial.note"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                :placeholder="materialSelectionMode === 'existing' ? 'Note specifiche per questo cantiere...' : 'Note sul materiale...'"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeAddMaterialModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 {{ materialSelectionMode === 'existing' ? 'Aggiungi al Cantiere' : 'Salva Nuovo Materiale' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Materiale -->
    <div v-if="showEditMaterialModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeEditMaterialModal">
      <div class="relative top-4 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Modifica Materiale</h3>
            <button @click="closeEditMaterialModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form v-if="editingMaterial" @submit.prevent="saveMaterialChanges" class="space-y-6">
            <!-- Nome Materiale -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Materiale</label>
              <input
                v-model="editingMaterial.nome"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Descrizione -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                v-model="editingMaterial.descrizione"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Codice -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Codice</label>
              <input
                v-model="editingMaterial.codice"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Quantità e Utilizzo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Richiesta</label>
                <input
                  v-model.number="editingMaterial.quantitaRichiesta"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantità Utilizzata 
                  <span class="text-xs text-gray-500">(Per aggiornare lo stato dei materiali)</span>
                </label>
                <input
                  v-model.number="editingMaterial.quantitaUtilizzata"
                  type="number"
                  min="0"
                  :max="editingMaterial.quantitaRichiesta"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Rimanente: {{ (editingMaterial.quantitaRichiesta || 0) - (editingMaterial.quantitaUtilizzata || 0) }}
                </p>
              </div>
            </div>

            <!-- Unita di Misura -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unita di Misura</label>
              <input
                v-model="editingMaterial.unita"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Prezzo Unitario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Unitario (€)</label>
              <input
                v-model.number="editingMaterial.prezzoUnitario"
                type="number"
                min="0"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Stato -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                v-model="editingMaterial.stato"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="pianificato">Pianificato</option>
                <option value="ordinato">Ordinato</option>
                <option value="in-uso">In Uso</option>
                <option value="utilizzato">Utilizzato</option>
                <option value="completato">Completato</option>
                <option value="in-lavorazione">In Lavorazione</option>
              </select>
            </div>

            <!-- Data Acquisto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Acquisto</label>
              <input
                v-model="editingMaterial.dataAcquisto"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                v-model="editingMaterial.note"
                rows="2"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              ></textarea>
            </div>

            <!-- Fornitori -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fornitori</label>
              <select
                v-model="editingMaterial.fornitoreId"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option v-for="fornitore in fornitori" :key="fornitore.id" :value="fornitore.id">
                  {{ fornitore.nome }}
                </option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeEditMaterialModal" class="w-full sm:w-auto btn-secondary py-3 text-base">
                Annulla
              </button>
              <button type="submit" class="w-full sm:w-auto btn-primary py-3 text-base">
                💾 Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Allegati Materiale -->
    <div v-if="showMaterialAttachmentsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeMaterialAttachmentsModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <PaperClipIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📎 Allegati Materiale</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedMaterial">
                  {{ selectedMaterial.nome }} ({{ selectedMaterial.codice }}) - {{ getFornitoreById(selectedMaterial.fornitoreId)?.nome }}
                </p>
              </div>
            </div>
            <button @click="closeMaterialAttachmentsModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Info Materiale -->
            <div class="bg-wood-light p-4 rounded-lg border border-primary-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p class="text-primary-600 font-medium">Quantità</p>
                  <p class="font-semibold">{{ selectedMaterial?.quantitaRichiesta }} {{ selectedMaterial?.unita }}</p>
                </div>
                <div>
                  <p class="text-primary-600 font-medium">Valore Totale</p>
                  <p class="font-semibold">€{{ (selectedMaterial?.quantitaRichiesta * selectedMaterial?.prezzoUnitario).toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-primary-600 font-medium">Stato</p>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getMaterialStatusColor(selectedMaterial?.stato)">
                    {{ selectedMaterial?.stato }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <div class="text-center">
                <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex text-sm text-gray-600">
                  <label for="material-file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Carica documenti</span>
                    <input id="material-file-upload" name="material-file-upload" type="file" class="sr-only" @change="handleMaterialFileUpload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt">
                  </label>
                  <p class="pl-1">o trascina qui</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">DDT, Fatture, Certificati, Foto - PDF, DOC, XLS, JPG, PNG fino a 10MB</p>
              </div>
            </div>

            <!-- Lista Allegati -->
            <div v-if="getMaterialAttachments()?.length > 0">
              <h4 class="font-semibold text-gray-900 mb-4">📋 Documenti Allegati ({{ getMaterialAttachments().length }})</h4>
              <div class="space-y-3">
                <div v-for="attachment in getMaterialAttachments()" :key="attachment.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <!-- Icona file -->
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getFileTypeClass(attachment.type)">
                        <span class="text-white text-xs font-bold">{{ getFileTypeIcon(attachment.type) }}</span>
                      </div>
                    </div>
                    
                    <!-- Info file -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                      <p class="text-xs text-gray-500">
                        {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadedAt, true) }}
                      </p>
                      <p v-if="attachment.description" class="text-xs text-gray-600 mt-1">{{ attachment.description }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{{ attachment.category || 'Generale' }}</span>
                        <span v-if="attachment.fornitore" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ attachment.fornitore }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Azioni -->
                  <div class="flex items-center space-x-2">
                    <button @click="openMaterialFile(attachment)" 
                            class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            title="Apri documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button @click="downloadMaterialFile(attachment)" 
                            class="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                            title="Scarica documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="deleteMaterialFile(attachment)" 
                            class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Elimina documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nessun allegato -->
            <div v-else class="text-center py-8 text-gray-500">
              <PaperClipIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p class="text-lg font-medium text-gray-400">Nessun documento allegato</p>
              <p class="text-sm text-gray-400">Carica DDT, fatture, certificati o foto del materiale</p>
            </div>

            <!-- Statistiche -->
            <div v-if="getMaterialAttachments()?.length > 0" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-sm text-blue-600">Documenti Totali</p>
                  <p class="text-xl font-bold text-blue-800">{{ getMaterialAttachments().length }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-600">Dimensione Totale</p>
                  <p class="text-xl font-bold text-blue-800">{{ getTotalMaterialAttachmentsSize() }}</p>
                </div>
                <div>
                  <p class="text-sm text-blue-600">Fornitore</p>
                  <p class="text-sm font-medium text-blue-800">{{ getFornitoreById(selectedMaterial?.fornitoreId)?.nome || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button @click="closeMaterialAttachmentsModal" class="w-full sm:w-auto btn-secondary py-3 text-base font-medium">
                Chiudi
              </button>
              <button @click="generateMaterialReport" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium text-base">
                📊 Genera Report Materiale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestione Voci Aggiuntive -->
    <div v-if="showManageVociModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeManageVociModal">
      <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">📋 Voci Aggiuntive</h3>
                <p class="text-sm text-gray-600 mt-1" v-if="selectedCantiere">
                  {{ selectedCantiere.nome }}
                </p>
              </div>
            </div>
            <button @click="closeManageVociModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Pulsante Aggiungi -->
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-gray-900">Lista Voci Aggiuntive</h4>
              <button @click="addVoceAggiuntiva" class="btn-primary">
                + Aggiungi Voce
              </button>
            </div>

            <!-- Lista Voci Aggiuntive -->
            <div v-if="vociAggiuntiveCantiere.length > 0" class="space-y-4">
              <div v-for="voce in vociAggiuntiveCantiere" :key="voce.id" 
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <h4 class="font-medium text-gray-900">{{ voce.descrizione }}</h4>
                      <span v-if="voce.tipo === 'aggiunta'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aggiunta
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Preventivo
                      </span>
                    </div>
                    <p v-if="voce.note" class="text-sm text-gray-600 mb-2">{{ voce.note }}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <span class="font-medium text-purple-600 text-lg">
                        €{{ voce.importo.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2" v-if="voce.tipo === 'aggiunta'">
                    <button 
                      type="button"
                      @click="editVoceAggiuntiva(voce)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifica"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      @click="removeVoceAggiuntiva(voce.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Totale Voci Aggiuntive -->
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-purple-900">Totale Voci Aggiuntive:</span>
                  <span class="text-2xl font-bold text-purple-900">€{{ getTotalVociAggiuntive().toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p class="text-lg font-medium text-gray-400">Nessuna voce aggiuntiva</p>
              <p class="text-sm text-gray-400">Aggiungi servizi extra, noleggi o lavori speciali</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button @click="closeManageVociModal" class="btn-secondary">
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Aggiungi Voce Aggiuntiva -->
    <div v-if="showAddVoceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Aggiungi Voce Aggiuntiva</h2>
          <button @click="closeAddVoceModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveVoceAggiuntiva" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione *</label>
            <input
              v-model="newVoce.descrizione"
              type="text"
              required
              placeholder="Es. Noleggio escavatore, Trasporto speciale, Lavori extra..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
            <input
              v-model.number="newVoce.importo"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              v-model="newVoce.note"
              rows="3"
              placeholder="Dettagli aggiuntivi..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeAddVoceModal" class="btn-secondary">
              Annulla
            </button>
            <button type="submit" class="btn-primary">
              Aggiungi Voce
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Modifica Voce Aggiuntiva -->
    <div v-if="showEditVoceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifica Voce Aggiuntiva</h2>
          <button @click="closeEditVoceModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveVoceChanges" class="space-y-4" v-if="editingVoce">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrizione *</label>
            <input
              v-model="editingVoce.descrizione"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Importo (€) *</label>
            <input
              v-model.number="editingVoce.importo"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              v-model="editingVoce.note"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeEditVoceModal" class="btn-secondary">
              Annulla
            </button>
            <button type="submit" class="btn-primary">
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* Stili specifici del componente */
</style>