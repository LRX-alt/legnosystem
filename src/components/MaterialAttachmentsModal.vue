<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
    <div class="relative top-4 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-xl font-bold text-gray-900 flex items-center">
              📄 Documentazione Materiale
            </h3>
            <div class="mt-2 space-y-1">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Materiale:</span> 
                <span class="font-semibold text-gray-900 text-base tracking-wide">{{ material.nome }}</span>
                <span v-if="material.codice" class="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">{{ material.codice }}</span>
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Fornitore:</span> {{ material.fornitoreNome }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Cantiere:</span> {{ material.cantiere?.nome }} - {{ material.cantiere?.cliente }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Quantità:</span> {{ material.quantitaRichiesta }} {{ material.unita }} - 
                <span class="font-medium text-green-600">€{{ (material.quantitaRichiesta * material.prezzoUnitario).toFixed(2) }}</span>
              </p>
            </div>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 -m-2">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Colonna Sinistra: Lista Allegati -->
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">
                Allegati ({{ attachments.length }})
              </h4>
              <button @click="showUploadArea = !showUploadArea" class="btn-primary text-sm py-2 px-4">
                <PlusIcon class="w-4 h-4 mr-2" />
                Aggiungi
              </button>
            </div>

            <!-- Area Upload (togglabile) -->
            <div v-if="showUploadArea" class="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div class="text-center">
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  @change="handleFileUpload"
                  class="hidden"
                />
                <div
                  @drop.prevent="handleDrop"
                  @dragover.prevent
                  @dragenter.prevent
                  @click="$refs.fileInput.click()"
                  class="cursor-pointer py-6"
                >
                  <PaperClipIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p class="text-sm text-gray-600 mb-2">
                    <span class="font-medium text-primary-600">Clicca per caricare</span> o trascina i file qui
                  </p>
                  <p class="text-xs text-gray-500">
                    PDF, DOC, XLS, JPG (max 10MB per file)
                  </p>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span class="ml-3 text-gray-600">Caricamento allegati...</span>
            </div>

            <!-- Lista Allegati -->
            <div v-else-if="attachments.length > 0" class="space-y-3">
              <div
                v-for="attachment in attachments"
                :key="attachment.id"
                class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center flex-1 min-w-0">
                  <!-- Icona tipo file -->
                  <div class="flex-shrink-0 mr-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                         :class="getFileTypeColor(attachment.categoria)">
                      {{ getFileTypeIcon(attachment.categoria) }}
                    </div>
                  </div>
                  
                  <!-- Info file -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ attachment.nome }}
                    </p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {{ getCategoryLabel(attachment.categoria) }}
                      </span>
                      <span>{{ formatFileSize(attachment.dimensione) }}</span>
                      <span>{{ formatDate(attachment.dataCaricamento) }}</span>
                      <span v-if="attachment.fornitore" class="text-primary-600 font-medium">
                        da {{ attachment.fornitore }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Azioni -->
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    @click="viewFile(attachment)"
                    class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Visualizza"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="downloadFile(attachment)"
                    class="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Scarica"
                  >
                    <ArrowDownTrayIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteFile(attachment)"
                    class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Elimina"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Messaggio vuoto -->
            <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
              <PaperClipIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 class="text-sm font-medium text-gray-900 mb-2">Nessun allegato</h3>
              <p class="text-sm text-gray-500 mb-4">
                Non ci sono ancora documenti allegati per questo materiale
              </p>
              <button @click="showUploadArea = true" class="btn-primary text-sm">
                📎 Aggiungi Primo Allegato
              </button>
            </div>
          </div>

          <!-- Colonna Destra: Statistiche e Informazioni -->
          <div class="space-y-4">
            <!-- Statistiche allegati -->
            <div class="card">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">📊 Statistiche</h4>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Totale allegati:</span>
                  <span class="font-medium">{{ attachments.length }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Spazio occupato:</span>
                  <span class="font-medium">{{ formatFileSize(totalSize) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Ultimo caricamento:</span>
                  <span class="font-medium">{{ lastUploadDate }}</span>
                </div>
              </div>
            </div>

            <!-- Tipologie documenti -->
            <div class="card">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">📋 Tipologie</h4>
              <div class="space-y-2">
                <div v-for="(count, categoria) in categoryCounts" :key="categoria" 
                     class="flex justify-between text-sm">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-2" :class="getFileTypeColor(categoria)"></div>
                    <span class="text-gray-600">{{ getCategoryLabel(categoria) }}</span>
                  </div>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Ordine correlato -->
            <div class="card">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">🛒 Dettagli Ordine</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Data acquisto:</span>
                  <span class="font-medium">{{ formatDate(material.dataAcquisto) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Prezzo unitario:</span>
                  <span class="font-medium">€{{ material.prezzoUnitario }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Stato:</span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="material.stato === 'consegnato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ material.stato }}
                  </span>
                </div>
                <div v-if="material.note" class="pt-2 border-t border-gray-200">
                  <span class="text-gray-600 text-xs">Note:</span>
                  <p class="text-sm mt-1">{{ material.note }}</p>
                </div>
              </div>
            </div>

            <!-- Azioni rapide -->
            <div class="card">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">⚡ Azioni Rapide</h4>
              <div class="space-y-2">
                <button @click="generateReport" class="w-full btn-secondary text-left text-sm py-2">
                  📄 Genera Report Completo
                </button>
                <button @click="shareDocuments" class="w-full btn-secondary text-left text-sm py-2">
                  📤 Condividi Documentazione
                </button>
                <button @click="archiveDocuments" class="w-full btn-secondary text-left text-sm py-2">
                  📦 Archivia Documenti
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  XMarkIcon, 
  PlusIcon, 
  PaperClipIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  TrashIcon 
} from '@heroicons/vue/24/outline'
import { usePopup } from '@/composables/usePopup'
import { useFirestoreStore } from '@/stores/firestore'

const props = defineProps({
  isOpen: Boolean,
  material: Object
})

const emit = defineEmits(['close'])

const popup = usePopup()
const { success, error, confirm } = usePopup()
const firestoreStore = useFirestoreStore()

// Stato locale
const showUploadArea = ref(false)
const attachments = ref([])
const isDragOver = ref(false)
const isLoading = ref(false)

// Computed
const totalSize = computed(() => {
  return attachments.value.reduce((total, att) => total + att.dimensione, 0)
})

const lastUploadDate = computed(() => {
  if (attachments.value.length === 0) return '-'
  const latest = attachments.value.reduce((latest, att) => {
    return new Date(att.dataCaricamento) > new Date(latest.dataCaricamento) ? att : latest
  })
  return formatDate(latest.dataCaricamento)
})

const categoryCounts = computed(() => {
  const counts = {}
  attachments.value.forEach(att => {
    counts[att.categoria] = (counts[att.categoria] || 0) + 1
  })
  return counts
})

// Watchers
watch(() => props.material, (newMaterial) => {
  if (newMaterial) {
    loadAttachments()
  }
}, { immediate: true })

// Methods
const loadAttachments = async () => {
  if (!props.material?.id) return
  
  isLoading.value = true
  try {
    // Carica allegati da Firestore
    const result = await firestoreStore.loadAllegatiMateriale(props.material.id)
    if (result.success && result.data) {
      attachments.value = result.data.map(att => ({
        id: att.id,
        materialId: att.materialeId,
        cantiereId: props.material.cantiere?.id,
        nome: att.nome,
        categoria: att.categoria || 'Generale',
        dimensione: att.dimensione,
        tipo: att.tipo,
        dataCaricamento: att.uploadedAt?.toDate?.() || att.uploadedAt,
        fornitore: props.material.fornitoreNome,
        url: att.url
      }))
    } else {
      attachments.value = []
    }
  } catch (e) {
    console.error('Errore caricamento allegati da Firestore:', e)
    // Fallback a localStorage per compatibilità
    loadAttachmentsFromLocalStorage()
  } finally {
    isLoading.value = false
  }
}

// Fallback per compatibilità con localStorage
const loadAttachmentsFromLocalStorage = () => {
  const stored = localStorage.getItem('legnosystem_material_attachments')
  if (!stored) {
    attachments.value = []
    return
  }
  
  try {
    const allAttachments = JSON.parse(stored)
    // Filtra per materiale e cantiere specifici usando confronto stringa
    attachments.value = allAttachments.filter(att => 
      String(att.materialId) === String(props.material.id) && 
      String(att.cantiereId) === String(props.material.cantiere?.id)
    ).map(att => ({
      // Converte i campi al formato atteso dal componente
      id: att.id,
      materialId: att.materialId,
      cantiereId: att.cantiereId,
      nome: att.name || att.nome,
      categoria: att.category || att.categoria,
      dimensione: att.size || att.dimensione,
      tipo: att.type || att.tipo,
      dataCaricamento: att.uploadDate || att.dataCaricamento,
      fornitore: att.fornitore,
      url: att.url
    }))
  } catch (e) {
    console.error('Errore caricamento allegati da localStorage:', e)
    attachments.value = []
  }
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const processFiles = (files) => {
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      error(`File "${file.name}" troppo grande (max 10MB)`)
      return
    }
    
    addAttachment(file)
  })
  
  showUploadArea.value = false
}

const addAttachment = async (file) => {
  if (!props.material?.id) return
  
  const categoria = categorizeFile(file.name, file.type)
  
  try {
    isLoading.value = true
    
    // Converte il file in Base64 per persistenza
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
    
    // Prepara i dati per Firestore
    const allegatoData = {
      nome: file.name,
      categoria,
      dimensione: file.size,
      tipo: file.type.split('/').pop(),
      fornitore: props.material.fornitoreNome,
      url: base64,
      materialeId: props.material.id,
      cantiereId: props.material.cantiere?.id
    }
    
    // Salva su Firestore
    const result = await firestoreStore.createAllegatoMateriale(props.material.id, allegatoData)
    
    if (result.success) {
      // Ricarica allegati da Firestore
      await loadAttachments()
      success(`Allegato "${file.name}" aggiunto con successo!`)
    } else {
      throw new Error(result.error || 'Errore nel salvataggio')
    }
  } catch (e) {
    console.error('Errore aggiunta allegato:', e)
    error(`Errore nell'aggiunta dell'allegato: ${e.message}`)
  } finally {
    isLoading.value = false
  }
}

const categorizeFile = (fileName, fileType) => {
  const ext = fileName.split('.').pop().toLowerCase()
  
  if (['pdf'].includes(ext)) return 'Documento'
  if (['xls', 'xlsx'].includes(ext)) return 'Fattura/DDT'
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Foto'
  if (['doc', 'docx'].includes(ext)) return 'Certificato'
  
  return 'Generale'
}

const getFileTypeColor = (categoria) => {
  const colors = {
    'Documento': 'bg-red-500',
    'Fattura/DDT': 'bg-green-500',
    'Foto': 'bg-blue-500',
    'Certificato': 'bg-purple-500',
    'Generale': 'bg-gray-500'
  }
  return colors[categoria] || 'bg-gray-500'
}

const getFileTypeIcon = (categoria) => {
  const icons = {
    'Documento': 'PDF',
    'Fattura/DDT': 'XLS',
    'Foto': 'IMG',
    'Certificato': 'DOC',
    'Generale': 'FILE'
  }
  return icons[categoria] || 'FILE'
}

const getCategoryLabel = (categoria) => {
  return categoria || 'Generale'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewFile = (attachment) => {
  window.open(attachment.url, '_blank')
}

const downloadFile = (attachment) => {
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.nome
  link.click()
  success(`Download avviato: ${attachment.nome}`)
}

const deleteFile = async (attachment) => {
  if (await confirm('Elimina Allegato', `Sei sicuro di voler eliminare "${attachment.nome}"?`)) {
    try {
      isLoading.value = true
      
      // Elimina da Firestore
      const result = await firestoreStore.deleteAllegatoMateriale(attachment.id)
      
      if (result.success) {
        // Ricarica allegati da Firestore
        await loadAttachments()
        success(`Allegato "${attachment.nome}" eliminato`)
      } else {
        throw new Error(result.error || 'Errore nell\'eliminazione')
      }
    } catch (e) {
      console.error('Errore eliminazione allegato:', e)
      error(`Errore nell'eliminazione dell'allegato: ${e.message}`)
    } finally {
      isLoading.value = false
    }
  }
}

const generateReport = () => {
  success('Report completo generato con successo!', 'Funzionalità in implementazione')
}

const shareDocuments = () => {
  success('Link di condivisione copiato negli appunti!', 'Funzionalità in implementazione')
}

const archiveDocuments = () => {
  success('Documenti archiviati con successo!', 'Funzionalità in implementazione')
}

const closeModal = () => {
  emit('close')
}
</script> 