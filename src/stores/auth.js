import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { auth, db, firestoreConfig, rolesConfig } from '@/config/firebase'
import { useFirestoreStore } from '@/stores/firestore'
import { useToast } from '@/composables/useToast'
import { validateEmail } from '@/utils/firestoreValidation'

export const useAuthStore = defineStore('auth', () => {
  const firestoreStore = useFirestoreStore()
  const toast = useToast()
  
  // 🔐 State
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)
  const isAuthenticated = ref(false)
  const authInitialized = ref(false)
  const sessionTimeout = ref(null)
  const sessionExpiryTime = 30 * 60 * 1000 // 30 minuti

  // 📊 Computed
  const userRole = computed(() => userProfile.value?.role || 'user')
  const userName = computed(() => userProfile.value?.displayName || user.value?.email || 'Utente')
  const userRoleConfig = computed(() => rolesConfig.roles[userRole.value] || rolesConfig.roles.user)
  const userPermissions = computed(() => {
    const role = userRole.value
    if (role === 'admin') return ['*']
    return rolesConfig.roles[role]?.permissions || []
  })

  // Computed helpers per i permessi
  const isAdmin = computed(() => userRole.value === 'admin')
  const isManager = computed(() => ['admin', 'manager'].includes(userRole.value))
  const canManageCantieri = computed(() => hasPermission('manage_cantieri'))
  const canManagePersonnel = computed(() => hasPermission('manage_dipendenti'))
  const canViewFinancials = computed(() => hasPermission('view_financials'))

  /**
   * Verifica se l'utente ha un determinato permesso
   */
  const hasPermission = (permission) => {
    if (!isAuthenticated.value) return false
    if (userPermissions.value.includes('*')) return true
    return userPermissions.value.includes(permission)
  }

  /**
   * Verifica se l'utente ha il livello di ruolo richiesto
   */
  const hasRoleLevel = (requiredLevel) => {
    const userLevel = userRoleConfig.value?.level || 0
    return userLevel >= requiredLevel
  }

  /**
   * Gestisce il timeout della sessione
   */
  const handleSessionTimeout = () => {
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
    }
    
    if (isAuthenticated.value) {
      sessionTimeout.value = setTimeout(async () => {
        await logout('Sessione scaduta')
      }, sessionExpiryTime)
    }
  }

  /**
   * Resetta il timer della sessione
   */
  const resetSessionTimer = () => {
    handleSessionTimeout()
  }

  /**
   * Inizializza il listener di autenticazione
   */
  const initializeAuth = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        loading.value = true
        
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime,
            lastLoginAt: firebaseUser.metadata.lastSignInTime
          }
          
          // Carica il profilo utente da Firestore
          await loadUserProfile(firebaseUser.uid)
          isAuthenticated.value = true
          handleSessionTimeout()
        } else {
          user.value = null
          userProfile.value = null
          isAuthenticated.value = false
        }
        
        loading.value = false
        authInitialized.value = true
        resolve()
      })
    })
  }

  /**
   * Carica il profilo utente da Firestore
   */
  const loadUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, firestoreConfig.collections.userProfiles, uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        userProfile.value = {
          id: userDoc.id,
          ...userDoc.data()
        }
      } else {
        // Crea profilo base se non esiste
        const defaultProfile = {
          name: user.value?.displayName || user.value?.email?.split('@')[0] || 'Utente',
          role: 'user',
          department: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true
        }
        
        await setDoc(userDocRef, defaultProfile)
        userProfile.value = { id: uid, ...defaultProfile }
      }
    } catch (error) {
      console.error('Errore nel caricamento profilo utente:', error)
      toast.error(`Errore caricamento profilo: ${error.message}`)
    }
  }

  /**
   * Login con email e password
   */
  const login = async (email, password, remember = false) => {
    try {
      loading.value = true
      
      // Imposta la persistenza prima del login
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
      
      // Esegui il login
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Aggiorna ultimo login
      if (userProfile.value) {
        await updateUserProfile({ 
          lastLoginAt: serverTimestamp(),
          loginCount: (userProfile.value.loginCount || 0) + 1
        })
      }
      
      handleSessionTimeout()
      toast.success(`Benvenuto ${userProfile.value?.name || user.value.email}!`, '✅ Accesso Effettuato')
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Errore login:', error)
      let errorMessage = 'Errore durante l\'accesso'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Utente non trovato'
          break
        case 'auth/wrong-password':
          errorMessage = 'Password non corretta'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email non valida'
          break
        case 'auth/user-disabled':
          errorMessage = 'Account disabilitato'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Troppi tentativi di accesso. Riprova più tardi'
          break
        default:
          errorMessage = error.message
      }
      
      toast.error(errorMessage, '❌ Errore Accesso')
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registrazione nuovo utente
   */
  const register = async (email, password, userData = {}) => {
    try {
      loading.value = true
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Aggiorna profilo Firebase
      if (userData.name) {
        await updateProfile(userCredential.user, {
          displayName: userData.name
        })
      }
      
      // Crea profilo Firestore
      const profileData = {
        name: userData.name || email.split('@')[0],
        email: email,
        role: userData.role || 'user',
        department: userData.department || 'generale',
        phone: userData.phone || '',
        position: userData.position || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        loginCount: 0
      }
      
      await setDoc(doc(db, firestoreConfig.collections.userProfiles, userCredential.user.uid), profileData)
      
      toast.success(`Account creato con successo! Benvenuto ${profileData.name}!`, '✅ Registrazione Completata')
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Errore registrazione:', error)
      let errorMessage = 'Errore durante la registrazione'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email già registrata'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email non valida'
          break
        case 'auth/weak-password':
          errorMessage = 'Password troppo debole (minimo 6 caratteri)'
          break
        default:
          errorMessage = error.message
      }
      
      toast.error(errorMessage, '❌ Errore Registrazione')
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout Completo con Cleanup
   */
  const logout = async (message = 'Logout effettuato con successo', skipConfirm = false) => {
    try {
      // 1. Cleanup completo dello stato
      await performLogoutCleanup()
      
      // 2. Logout da Firebase
      await signOut(auth)
      
      // 3. Reset finale dello stato
      await resetAuthState()
      
      console.log('✅ Logout completato con successo')
      return { success: true }
    } catch (error) {
      console.error('❌ Errore logout:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cleanup Pre-Logout
   */
  const performLogoutCleanup = async () => {
    try {
      // Stop session timeout
      if (sessionTimeout.value) {
        clearTimeout(sessionTimeout.value)
        sessionTimeout.value = null
      }

      // Cleanup localStorage specifici (mantieni solo le impostazioni essenziali)
      const keysToKeep = ['legnosystem-theme', 'legnosystem-language']
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (key.startsWith('legnosystem-') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })

      // Reset scroll position
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0)
      }

      // Dispatch cleanup event per altri componenti
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-logout-cleanup'))
      }

      console.log('🧹 Cleanup pre-logout completato')
    } catch (error) {
      console.error('Errore cleanup pre-logout:', error)
    }
  }

  /**
   * Reset Stato Autenticazione
   */
  const resetAuthState = async () => {
    try {
      // Reset tutti i reactive state
      user.value = null
      userProfile.value = null
      isAuthenticated.value = false
      loading.value = false
      
      // Reset session data
      sessionTimeout.value = null
      
      console.log('🔄 Stato autenticazione resettato')
    } catch (error) {
      console.error('Errore reset stato auth:', error)
    }
  }

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Email di reset password inviata. Controlla la tua casella di posta.', '📧 Reset Password')
      return { success: true }
    } catch (error) {
      console.error('Errore reset password:', error)
      let errorMessage = 'Errore invio email di reset'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Utente non trovato'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email non valida'
          break
        default:
          errorMessage = error.message
      }
      
      toast.error(errorMessage, '❌ Errore Reset')
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Richiesta di registrazione (da approvare)
   */
  const requestRegistration = async (userData) => {
    try {
      loading.value = true
      
      // Validazione email
      const emailValidation = validateEmail(userData.email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors.join(', '))
      }
      
      // Rate limiting: controlla richieste recenti dallo stesso IP
      const ipAddress = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
      const rateLimitWindow = 24 * 60 * 60 * 1000 // 24 ore
      const maxRequestsPerWindow = 3
      
      // Evita indice composito: filtra per data in memoria dopo query sull'IP
      const recentByIpSnapshot = await getDocs(
        query(
          collection(db, firestoreConfig.collections.registrationRequests),
          where('ipAddress', '==', ipAddress)
        )
      )
      const windowStart = Date.now() - rateLimitWindow
      const recentByIp = recentByIpSnapshot.docs.filter(docSnap => {
        const data = docSnap.data()
        const ts = data?.requestedAt
        const ms = ts?.toDate ? ts.toDate().getTime() : (ts?.seconds ? ts.seconds * 1000 : 0)
        return ms >= windowStart
      })
      
      if (recentByIp.length >= maxRequestsPerWindow) {
        throw new Error('Hai raggiunto il limite di richieste di registrazione. Riprova tra 24 ore.')
      }
      
      // Verifica se l'email è già in uso o in attesa
      // Evita indice per altre combinazioni future: usa singolo where
      const existingRequestQuery = await getDocs(
        query(
          collection(db, firestoreConfig.collections.registrationRequests),
          where('email', '==', userData.email)
        )
      )
      if (!existingRequestQuery.empty) {
        throw new Error('Una richiesta con questa email è già in attesa di approvazione')
      }
      
      // Crea richiesta di registrazione
      const requestData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department || 'generale',
        phone: userData.phone || '',
        position: userData.position || '',
        requestedAt: serverTimestamp(),
        status: 'pending',
        notes: '',
        processedBy: null,
        processedAt: null,
        ipAddress: ipAddress,
        userAgent: navigator.userAgent
      }
      
      await addDoc(collection(db, firestoreConfig.collections.registrationRequests), requestData)
      
      // 🔔 Notifica admin: nuova richiesta
      try {
        await firestoreStore.createNotification({
          type: 'registration_request',
          message: `Nuova richiesta da ${requestData.name} (${requestData.email})`,
          recipients: ['admin'],
          userId: 'admin',
          meta: { role: requestData.role, department: requestData.department }
        })
      } catch (e) {
        console.warn('Impossibile creare notifica richiesta registrazione:', e)
      }

      toast.success(
        'Richiesta di registrazione inviata! Ti contatteremo per l\'approvazione.',
        '📧 Richiesta Inviata'
      )
      
      return { success: true }
    } catch (error) {
      console.error('Errore richiesta registrazione:', error)
      toast.error(error.message || 'Errore durante l\'invio della richiesta', '❌ Errore Richiesta')
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ottieni richieste di registrazione (solo admin)
   */
  const getRegistrationRequests = async () => {
    if (!isAdmin.value) {
      throw new Error('Accesso negato: solo amministratori')
    }
    
    try {
      const requestsQuery = query(
        collection(db, firestoreConfig.collections.registrationRequests),
        orderBy('requestedAt', 'desc')
      )
      
      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Errore caricamento richieste:', error)
      throw error
    }
  }

  /**
   * Approva richiesta di registrazione (solo admin)
   */
  const approveRegistrationRequest = async (requestId, requestData) => {
    if (!isAdmin.value) {
      throw new Error('Accesso negato: solo amministratori')
    }
    
    try {
      // Genera password temporanea
      const tempPassword = generateTemporaryPassword()
      
      // Crea account Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        requestData.email, 
        tempPassword
      )
      
      // Aggiorna profilo Firebase
      await updateProfile(userCredential.user, {
        displayName: requestData.name
      })
      
      // Crea profilo Firestore
      const profileData = {
        name: requestData.name,
        email: requestData.email,
        role: requestData.role,
        department: requestData.department,
        phone: requestData.phone,
        position: requestData.position,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        loginCount: 0,
        approvedBy: user.value.uid,
        approvedAt: serverTimestamp()
      }
      
      await setDoc(doc(db, firestoreConfig.collections.userProfiles, userCredential.user.uid), profileData)
      
      // Aggiorna richiesta come approvata
      await updateDoc(doc(db, firestoreConfig.collections.registrationRequests, requestId), {
        status: 'approved',
        processedBy: user.value.uid,
        processedAt: serverTimestamp(),
        createdUserId: userCredential.user.uid
      })
      
      // Invia email di reset password per il primo accesso
      await sendPasswordResetEmail(auth, requestData.email)
      
      toast.success(
        `Account creato per ${requestData.name}. Email di impostazione password inviata.`,
        '✅ Registrazione Approvata'
      )
      
      return { success: true, userId: userCredential.user.uid }
    } catch (error) {
      console.error('Errore approvazione richiesta:', error)
      toast.error(error.message || 'Errore durante l\'approvazione', '❌ Errore Approvazione')
      return { success: false, error: error.message }
    }
  }

  /**
   * Rifiuta richiesta di registrazione (solo admin)
   */
  const rejectRegistrationRequest = async (requestId, reason = '') => {
    if (!isAdmin.value) {
      throw new Error('Accesso negato: solo amministratori')
    }
    
    try {
      await updateDoc(doc(db, firestoreConfig.collections.registrationRequests, requestId), {
        status: 'rejected',
        processedBy: user.value.uid,
        processedAt: serverTimestamp(),
        notes: reason
      })
      
      toast.success('Richiesta rifiutata', '❌ Richiesta Rifiutata')
      return { success: true }
    } catch (error) {
      console.error('Errore rifiuto richiesta:', error)
      toast.error(error.message || 'Errore durante il rifiuto', '❌ Errore')
      return { success: false, error: error.message }
    }
  }

  /**
   * Genera password temporanea
   */
  const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  }

  /**
   * Aggiorna profilo utente
   */
  const updateUserProfile = async (updates) => {
    if (!user.value) return { success: false, error: 'Utente non autenticato' }
    
    try {
      const userDocRef = doc(db, firestoreConfig.collections.userProfiles, user.value.uid)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userDocRef, updateData)
      
      // Aggiorna state locale
      userProfile.value = {
        ...userProfile.value,
        ...updates
      }
      
      // Aggiorna Firebase Auth se necessario
      if (updates.name) {
        await updateProfile(auth.currentUser, { displayName: updates.name })
      }
      
      toast.success('Profilo aggiornato con successo', '✅ Profilo Aggiornato')
      return { success: true }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error)
      toast.error(`Errore aggiornamento profilo: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cambia password
   */
  const changePassword = async (currentPassword, newPassword) => {
    if (!user.value) return { success: false, error: 'Utente non autenticato' }
    
    try {
      // Re-autentica utente
      const credential = EmailAuthProvider.credential(user.value.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      // Aggiorna password
      await updatePassword(auth.currentUser, newPassword)
      
      toast.success('Password aggiornata con successo', '✅ Password Aggiornata')
      return { success: true }
    } catch (error) {
      console.error('Errore cambio password:', error)
      let errorMessage = 'Errore cambio password'
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Password attuale non corretta'
          break
        case 'auth/weak-password':
          errorMessage = 'Nuova password troppo debole'
          break
        default:
          errorMessage = error.message
      }
      
      toast.error(errorMessage, '❌ Errore Password')
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Crea profilo admin per il primo utente
   * Questa funzione può essere chiamata solo se:
   * 1. Non esistono altri admin nel sistema
   * 2. L'utente corrente è autenticato
   * 3. La richiesta proviene da un IP trusted
   */
  const createAdminProfile = async () => {
    if (!user.value) {
      throw new Error('Nessun utente autenticato')
    }

    try {
      // Verifica se esistono già altri admin
      const adminQuery = await getDocs(
        query(
          collection(db, firestoreConfig.collections.userProfiles),
          where('role', '==', 'admin')
        )
      )
      
      if (!adminQuery.empty) {
        throw new Error('Esiste già un amministratore nel sistema')
      }
      
      // Verifica IP trusted
      const ipAddress = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
      const trustedIPs = [
        '127.0.0.1',
        'localhost',
        // Aggiungi altri IP fidati
      ]
      
      if (!trustedIPs.includes(ipAddress)) {
        throw new Error('Operazione non consentita da questo indirizzo IP')
      }

      const adminProfile = {
        role: 'admin',
        name: user.value.displayName || 'Admin Legnosystem',
        email: user.value.email,
        department: 'Amministrazione',
        settings: {
          theme: 'light',
          notifications: true,
          language: 'it'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        loginCount: 0,
        lastLoginAt: serverTimestamp()
      }

      await setDoc(doc(db, firestoreConfig.collections.userProfiles, user.value.uid), adminProfile)
      userProfile.value = adminProfile
      
      // Log dell'operazione per audit
      await addDoc(collection(db, 'audit_logs'), {
        action: 'create_admin',
        userId: user.value.uid,
        timestamp: serverTimestamp(),
        ipAddress: ipAddress,
        userAgent: navigator.userAgent
      })
      
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
    userRoleConfig,
    userPermissions,
    isAdmin,
    isManager,
    canManageCantieri,
    canManagePersonnel,
    canViewFinancials,
    
    // Methods
    initializeAuth,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    loadUserProfile,
    createAdminProfile,
    hasPermission,
    hasRoleLevel,
    resetSessionTimer,
    
    // Registration requests
    requestRegistration,
    getRegistrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest
  }
}) 