import { ref, computed } from 'vue'
import { 
  ref as storageRef, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage'
import { storage, storagePaths } from '@/config/firebase'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

export const useFirebaseStorage = () => {
  const toast = useToast()
  const authStore = useAuthStore()
  
  // State
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const uploadError = ref(null)
  const currentUploadTask = ref(null)

  // File validation
  const allowedFileTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const maxTotalSize = 100 * 1024 * 1024 // 100MB per utente

  // Computed
  const canUpload = computed(() => {
    return authStore.isAuthenticated && !isUploading.value
  })

  /**
   * Valida un file prima dell'upload
   */
  const validateFile = (file) => {
    const errors = []

    // Controllo dimensione
    if (file.size > maxFileSize) {
      errors.push(`File troppo grande. Massimo ${formatFileSize(maxFileSize)}`)
    }

    // Controllo tipo file
    if (!allowedFileTypes.includes(file.type)) {
      errors.push(`Tipo file non supportato: ${file.type}`)
    }

    // Controllo nome file
    if (file.name.length > 255) {
      errors.push('Nome file troppo lungo (max 255 caratteri)')
    }

    // Controllo caratteri speciali nel nome
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      errors.push('Nome file contiene caratteri non validi')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Upload file con progress tracking
   */
  const uploadFile = async (file, path, options = {}) => {
    if (!authStore.isAuthenticated) {
      throw new Error('Utente non autenticato')
    }

    // Validazione file
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // Reset state
    uploadProgress.value = 0
    isUploading.value = true
    uploadError.value = null

    try {
      // Crea riferimento storage
      const fileRef = storageRef(storage, path)
      
      // Metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: authStore.user.uid,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          originalSize: file.size.toString(),
          ...options.metadata
        }
      }

      // Upload con progress tracking
      const uploadTask = uploadBytesResumable(fileRef, file, metadata)
      currentUploadTask.value = uploadTask

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          // Progress
          (snapshot) => {
            uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          // Error
          (error) => {
            console.error('Errore upload:', error)
            uploadError.value = error.message
            isUploading.value = false
            currentUploadTask.value = null
            
            let errorMessage = 'Errore durante l\'upload'
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'Non autorizzato ad accedere allo storage'
                break
              case 'storage/canceled':
                errorMessage = 'Upload annullato'
                break
              case 'storage/quota-exceeded':
                errorMessage = 'Quota storage superata'
                break
              case 'storage/invalid-format':
                errorMessage = 'Formato file non valido'
                break
              case 'storage/invalid-argument':
                errorMessage = 'Argomenti upload non validi'
                break
              default:
                errorMessage = error.message
            }
            
            toast.error(errorMessage, '❌ Errore Upload')
            reject(new Error(errorMessage))
          },
          // Complete
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              const metadata = await getMetadata(uploadTask.snapshot.ref)
              
              const result = {
                url: downloadURL,
                path: path,
                name: file.name,
                size: file.size,
                type: file.type,
                metadata: metadata,
                uploadedAt: new Date().toISOString(),
                uploadedBy: authStore.user.uid
              }
              
              isUploading.value = false
              currentUploadTask.value = null
              uploadProgress.value = 100
              
              toast.success(`File "${file.name}" caricato con successo`, '✅ Upload Completato')
              resolve(result)
            } catch (error) {
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      isUploading.value = false
      currentUploadTask.value = null
      console.error('Errore upload file:', error)
      toast.error(`Errore upload: ${error.message}`)
      throw error
    }
  }

  /**
   * Upload multipli file
   */
  const uploadMultipleFiles = async (files, basePath, options = {}) => {
    if (!Array.isArray(files)) {
      throw new Error('Files deve essere un array')
    }

    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = `${basePath}/${Date.now()}_${file.name}`
      
      try {
        const result = await uploadFile(file, filePath, options)
        results.push(result)
      } catch (error) {
        errors.push({
          file: file.name,
          error: error.message
        })
      }
    }

    if (errors.length > 0) {
      console.warn('Errori upload multiplo:', errors)
      toast.warning(`${errors.length} file non caricati`, '⚠️ Upload Parziale')
    }

    return {
      success: results,
      errors: errors,
      total: files.length
    }
  }

  /**
   * Cancella upload in corso
   */
  const cancelUpload = () => {
    if (currentUploadTask.value) {
      currentUploadTask.value.cancel()
      currentUploadTask.value = null
      isUploading.value = false
      uploadProgress.value = 0
      toast.info('Upload annullato', '🚫 Annullato')
    }
  }

  /**
   * Elimina file
   */
  const deleteFile = async (path) => {
    if (!authStore.isAuthenticated) {
      throw new Error('Utente non autenticato')
    }

    try {
      const fileRef = storageRef(storage, path)
      await deleteObject(fileRef)
      
      toast.success('File eliminato con successo', '🗑️ File Eliminato')
      return { success: true }
    } catch (error) {
      console.error('Errore eliminazione file:', error)
      
      let errorMessage = 'Errore durante l\'eliminazione'
      switch (error.code) {
        case 'storage/object-not-found':
          errorMessage = 'File non trovato'
          break
        case 'storage/unauthorized':
          errorMessage = 'Non autorizzato ad eliminare questo file'
          break
        default:
          errorMessage = error.message
      }
      
      toast.error(errorMessage, '❌ Errore Eliminazione')
      throw new Error(errorMessage)
    }
  }

  /**
   * Ottieni URL download
   */
  const getFileUrl = async (path) => {
    try {
      const fileRef = storageRef(storage, path)
      return await getDownloadURL(fileRef)
    } catch (error) {
      console.error('Errore ottenimento URL:', error)
      throw error
    }
  }

  /**
   * Lista file in una directory
   */
  const listFiles = async (path) => {
    try {
      const dirRef = storageRef(storage, path)
      const result = await listAll(dirRef)
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          try {
            const metadata = await getMetadata(itemRef)
            const url = await getDownloadURL(itemRef)
            
            return {
              name: itemRef.name,
              path: itemRef.fullPath,
              url: url,
              size: metadata.size,
              type: metadata.contentType,
              metadata: metadata.customMetadata || {},
              updatedAt: metadata.updated,
              downloadTokens: metadata.downloadTokens
            }
          } catch (error) {
            console.warn(`Errore caricamento metadata per ${itemRef.name}:`, error)
            return {
              name: itemRef.name,
              path: itemRef.fullPath,
              error: error.message
            }
          }
        })
      )
      
      return files.filter(file => !file.error)
    } catch (error) {
      console.error('Errore lista file:', error)
      throw error
    }
  }

  /**
   * Ottieni metadata file
   */
  const getFileMetadata = async (path) => {
    try {
      const fileRef = storageRef(storage, path)
      return await getMetadata(fileRef)
    } catch (error) {
      console.error('Errore metadata file:', error)
      throw error
    }
  }

  /**
   * Aggiorna metadata file
   */
  const updateFileMetadata = async (path, newMetadata) => {
    try {
      const fileRef = storageRef(storage, path)
      return await updateMetadata(fileRef, newMetadata)
    } catch (error) {
      console.error('Errore aggiornamento metadata:', error)
      throw error
    }
  }

  // Utilities per path storage
  const getCantiereAttachmentsPath = (cantiereId) => 
    storagePaths.cantieriAttachments.replace('{cantiereId}', cantiereId)
  
  const getCantierePhotosPath = (cantiereId) => 
    storagePaths.cantieriPhotos.replace('{cantiereId}', cantiereId)
  
  const getMaterialeAttachmentsPath = (materialeId) => 
    storagePaths.materialiAttachments.replace('{materialeId}', materialeId)
  
  

  // Upload specifici per entità
  const uploadCantiereAttachment = async (cantiereId, file, options = {}) => {
    const path = `${getCantiereAttachmentsPath(cantiereId)}/${Date.now()}_${file.name}`
    return await uploadFile(file, path, {
      ...options,
      metadata: {
        cantiereId,
        type: 'attachment',
        ...options.metadata
      }
    })
  }

  const uploadCantierePhoto = async (cantiereId, file, options = {}) => {
    const path = `${getCantierePhotosPath(cantiereId)}/${Date.now()}_${file.name}`
    return await uploadFile(file, path, {
      ...options,
      metadata: {
        cantiereId,
        type: 'photo',
        ...options.metadata
      }
    })
  }

  const uploadMaterialeAttachment = async (materialeId, file, options = {}) => {
    const path = `${getMaterialeAttachmentsPath(materialeId)}/${Date.now()}_${file.name}`
    return await uploadFile(file, path, {
      ...options,
      metadata: {
        materialeId,
        type: 'attachment',
        ...options.metadata
      }
    })
  }

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📁'
  }

  return {
    // State
    uploadProgress,
    isUploading,
    uploadError,
    canUpload,

    // Methods
    validateFile,
    uploadFile,
    uploadMultipleFiles,
    cancelUpload,
    deleteFile,
    getFileUrl,
    listFiles,
    getFileMetadata,
    updateFileMetadata,

    // Path utilities
    getCantiereAttachmentsPath,
    getCantierePhotosPath,
    getMaterialeAttachmentsPath,


    // Specific uploads
    uploadCantiereAttachment,
    uploadCantierePhoto,
    uploadMaterialeAttachment,

    // Utilities
    formatFileSize,
    getFileIcon,
    allowedFileTypes,
    maxFileSize
  }
} 