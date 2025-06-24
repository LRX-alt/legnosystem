import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db, firestoreConfig } from '@/config/firebase'

export const useAuthStore = defineStore('auth', () => {
  // 🔐 State
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(false)
  const isAuthenticated = ref(false)
  const authInitialized = ref(false)

  // 📊 Computed
  const userRole = computed(() => userProfile.value?.role || 'user')
  const userName = computed(() => userProfile.value?.displayName || user.value?.email || 'Utente')
  const isAdmin = computed(() => userRole.value === 'admin')
  const canManageCantieri = computed(() => ['admin', 'project_manager'].includes(userRole.value))
  const canManagePersonale = computed(() => ['admin', 'hr_manager'].includes(userRole.value))

  // 🔧 Methods
  
  /**
   * Inizializza il listener di autenticazione
   */
  const initAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        loading.value = true
        
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
          }
          
          // Carica il profilo utente da Firestore
          await loadUserProfile(firebaseUser.uid)
          isAuthenticated.value = true
        } else {
          user.value = null
          userProfile.value = null
          isAuthenticated.value = false
        }
        
        loading.value = false
        authInitialized.value = true
        resolve(firebaseUser)
      })
    })
  }

  /**
   * Carica il profilo utente da Firestore
   */
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, firestoreConfig.collections.userProfiles, uid))
      
      if (userDoc.exists()) {
        userProfile.value = {
          id: userDoc.id,
          ...userDoc.data()
        }
      } else {
        // Crea profilo base se non esiste
        const defaultProfile = {
          displayName: user.value?.displayName || user.value?.email?.split('@')[0] || 'Utente',
          role: 'user',
          department: '',
          createdAt: new Date(),
          lastLogin: new Date(),
          settings: {
            theme: 'light',
            notifications: true,
            language: 'it'
          }
        }
        
        await setDoc(doc(db, firestoreConfig.collections.userProfiles, uid), defaultProfile)
        userProfile.value = { id: uid, ...defaultProfile }
      }
    } catch (error) {
      console.error('Errore nel caricamento profilo utente:', error)
    }
  }

  /**
   * Login con email e password
   */
  const login = async (email, password) => {
    loading.value = true
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Aggiorna ultimo login
      if (result.user) {
        await updateDoc(doc(db, firestoreConfig.collections.userProfiles, result.user.uid), {
          lastLogin: new Date()
        })
      }
      
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Errore login:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registrazione nuovo utente
   */
  const register = async (email, password, displayName = '', role = 'user') => {
    loading.value = true
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Aggiorna profilo Firebase Auth
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      
      // Crea profilo Firestore
      const userProfile = {
        displayName: displayName || email.split('@')[0],
        email: email,
        role: role,
        department: '',
        createdAt: new Date(),
        lastLogin: new Date(),
        settings: {
          theme: 'light',
          notifications: true,
          language: 'it'
        }
      }
      
      await setDoc(doc(db, firestoreConfig.collections.userProfiles, result.user.uid), userProfile)
      
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Errore registrazione:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout utente
   */
  const logout = async () => {
    loading.value = true
    
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
      isAuthenticated.value = false
      
      return { success: true }
    } catch (error) {
      console.error('Errore logout:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    loading.value = true
    
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      console.error('Errore reset password:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna profilo utente
   */
  const updateUserProfile = async (updates) => {
    if (!user.value) return { success: false, error: 'Utente non autenticato' }
    
    loading.value = true
    
    try {
      // Aggiorna Firestore
      await updateDoc(doc(db, firestoreConfig.collections.userProfiles, user.value.uid), {
        ...updates,
        updatedAt: new Date()
      })
      
      // Aggiorna state locale
      userProfile.value = {
        ...userProfile.value,
        ...updates
      }
      
      // Aggiorna Firebase Auth se necessario
      if (updates.displayName) {
        await updateProfile(auth.currentUser, { displayName: updates.displayName })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambia password
   */
  const changePassword = async (newPassword) => {
    if (!auth.currentUser) return { success: false, error: 'Utente non autenticato' }
    
    loading.value = true
    
    try {
      await updatePassword(auth.currentUser, newPassword)
      return { success: true }
    } catch (error) {
      console.error('Errore cambio password:', error)
      return { 
        success: false, 
        error: getFirebaseErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Traduce i codici errore Firebase in messaggi italiani
   */
  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/email-already-in-use': 'Email già registrata',
      'auth/weak-password': 'Password troppo debole',
      'auth/invalid-email': 'Email non valida',
      'auth/user-disabled': 'Account disabilitato',
      'auth/too-many-requests': 'Troppi tentativi, riprova più tardi',
      'auth/network-request-failed': 'Errore di connessione',
      'auth/requires-recent-login': 'Accesso recente richiesto'
    }
    
    return errorMessages[errorCode] || 'Errore sconosciuto'
  }

  /**
   * Crea profilo admin per il primo utente
   */
  const createAdminProfile = async () => {
    if (!user.value) {
      throw new Error('Nessun utente autenticato')
    }

    const adminProfile = {
      role: 'admin',
      displayName: 'Admin Legnosystem',
      department: 'Amministrazione',
      settings: {
        theme: 'light',
        notifications: true,
        language: 'it'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      await setDoc(doc(db, firestoreConfig.collections.userProfiles, user.value.uid), adminProfile)
      userProfile.value = adminProfile
      console.log('✅ Profilo admin creato con successo!')
      return { success: true }
    } catch (err) {
      console.error('❌ Errore creazione profilo admin:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    // State
    user,
    userProfile,
    loading,
    isAuthenticated,
    authInitialized,
    
    // Computed
    userRole,
    userName,
    isAdmin,
    canManageCantieri,
    canManagePersonale,
    
    // Methods
    initAuth,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    loadUserProfile,
    createAdminProfile
  }
}) 