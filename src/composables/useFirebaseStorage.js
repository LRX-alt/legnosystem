import { ref } from 'vue'
import { 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  ref as storageRef,
  listAll 
} from 'firebase/storage'
import { storage, storagePaths, firestoreConfig } from '@/config/firebase'

// Verifica se Storage è disponibile
const isStorageAvailable = storage !== null

export function useFirebaseStorage() {
  const uploading = ref(false)
  const downloadURL = ref(null)
  const uploadProgress = ref(0)
  const error = ref(null)

  /**
   * Valida il file prima dell'upload
   */
  const validateFile = (file) => {
    const errors = []
    
    // Controlla dimensione (max 10MB)
    if (file.size > firestoreConfig.security.maxFileSize) {
      errors.push(`File troppo grande. Massimo ${firestoreConfig.security.maxFileSize / 1024 / 1024}MB`)
    }
    
    // Controlla tipo file
    const extension = file.name.split('.').pop().toLowerCase()
    if (!firestoreConfig.security.allowedFileTypes.includes(extension)) {
      errors.push(`Tipo file non supportato. Consentiti: ${firestoreConfig.security.allowedFileTypes.join(', ')}`)
    }
    
    return errors
  }

  /**
   * Carica un singolo file
   */
  const uploadFile = async (file, path, metadata = {}) => {
    // Verifica se Storage è disponibile
    if (!isStorageAvailable) {
      error.value = 'Firebase Storage non è configurato'
      return { success: false, error: 'Storage non disponibile' }
    }
    
    // Reset stato
    error.value = null
    uploading.value = true
    uploadProgress.value = 0
    
    try {
      // Valida file
      const validationErrors = validateFile(file)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }
      
      // Crea reference storage
      const fileRef = storageRef(storage, path)
      
      // Metadati personalizzati
      const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      }
      
      // Upload con progress tracking
      const uploadTask = uploadBytesResumable(fileRef, file, uploadMetadata)
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          // Progress callback
          (snapshot) => {
            uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          // Error callback
          (err) => {
            error.value = err.message
            uploading.value = false
            reject(err)
          },
          // Complete callback
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref)
              downloadURL.value = url
              uploading.value = false
              
              resolve({
                success: true,
                url,
                path,
                name: file.name,
                size: file.size,
                type: file.type.split('/')[1] || 'unknown'
              })
            } catch (err) {
              error.value = err.message
              uploading.value = false
              reject(err)
            }
          }
        )
      })
    } catch (err) {
      error.value = err.message
      uploading.value = false
      return { success: false, error: err.message }
    }
  }

  /**
   * Carica multipli file
   */
  const uploadMultipleFiles = async (files, basePath, metadata = {}) => {
    const results = []
    const total = files.length
    let completed = 0
    
    for (const file of files) {
      try {
        // Genera path unico per ogni file
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = `${basePath}/${fileName}`
        
        const result = await uploadFile(file, filePath, {
          ...metadata,
          fileIndex: completed + 1,
          totalFiles: total
        })
        
        results.push(result)
        completed++
        
        // Aggiorna progress globale
        uploadProgress.value = (completed / total) * 100
      } catch (err) {
        results.push({ success: false, error: err.message, fileName: file.name })
      }
    }
    
    return {
      success: results.every(r => r.success),
      results,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    }
  }

  /**
   * Elimina un file
   */
  const deleteFile = async (path) => {
    try {
      const fileRef = storageRef(storage, path)
      await deleteObject(fileRef)
      return { success: true }
    } catch (err) {
      console.error('Errore eliminazione file:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Lista file in una directory
   */
  const listFiles = async (path) => {
    try {
      const folderRef = storageRef(storage, path)
      const result = await listAll(folderRef)
      
      const files = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item)
          return {
            name: item.name,
            path: item.fullPath,
            url
          }
        })
      )
      
      return { success: true, files }
    } catch (err) {
      console.error('Errore lista file:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Carica allegati per cantiere
   */
  const uploadCantiereAttachment = async (file, cantiereId, category = 'documents') => {
    const path = storagePaths.cantieriAttachments
      .replace('{cantiereId}', cantiereId) + `/${category}`
    
    return await uploadFile(file, path, {
      cantiereId,
      category,
      type: 'attachment'
    })
  }

  /**
   * Carica foto cantiere
   */
  const uploadCantierePhoto = async (file, cantiereId, fase = '') => {
    const path = storagePaths.cantieriPhotos
      .replace('{cantiereId}', cantiereId)
    
    return await uploadFile(file, path, {
      cantiereId,
      fase,
      type: 'photo'
    })
  }

  /**
   * Carica documenti materiali
   */
  const uploadMaterialeDocument = async (file, materialeId, category = 'certificates') => {
    let path
    
    switch (category) {
      case 'certificates':
        path = storagePaths.materialiCertificates.replace('{materialeId}', materialeId)
        break
      case 'fatture':
        path = storagePaths.materialiFatture.replace('{materialeId}', materialeId)
        break
      default:
        path = storagePaths.materialiAttachments.replace('{materialeId}', materialeId)
    }
    
    return await uploadFile(file, path, {
      materialeId,
      category,
      type: 'document'
    })
  }

  /**
   * Carica avatar utente
   */
  const uploadUserAvatar = async (file, userId) => {
    const path = storagePaths.avatars.replace('{userId}', userId)
    
    // Ridimensiona immagine se necessario (opzionale)
    return await uploadFile(file, path, {
      userId,
      type: 'avatar'
    })
  }

  /**
   * Genera URL per preview immagini
   */
  const getImagePreviewURL = (file) => {
    if (file && file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  /**
   * Converte file in Base64 per preview
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Reset stato
   */
  const resetState = () => {
    uploading.value = false
    downloadURL.value = null
    uploadProgress.value = 0
    error.value = null
  }

  return {
    // State
    uploading,
    downloadURL,
    uploadProgress,
    error,
    
    // Methods
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    listFiles,
    validateFile,
    
    // Specialized upload methods
    uploadCantiereAttachment,
    uploadCantierePhoto,
    uploadMaterialeDocument,
    uploadUserAvatar,
    
    // Utility methods
    getImagePreviewURL,
    fileToBase64,
    resetState
  }
} 