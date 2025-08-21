<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Mobile Menu Button + Logo -->
        <div class="flex items-center">
          <!-- Hamburger Menu - Solo Mobile -->
          <button @click="$emit('toggle-sidebar')"
                  class="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-3">
            <span class="sr-only">Apri menu</span>
            <Bars3Icon class="w-6 h-6" />
          </button>
          
          <!-- Logo e Brand -->
          <div class="flex-shrink-0 flex items-center">
            <!-- Logo Legnosystem -->
            <img 
              :src="logoLegnosystem" 
              alt="Legno System Logo" 
              class="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-lg object-contain"
            />
            <div>
              <h1 class="text-lg sm:text-xl font-display font-bold text-primary-800">Legnosystem.bio</h1>
              <p class="text-xs text-gray-500 leading-none hidden sm:block">Gestionale Aziendale</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Notifiche -->
          <button @click="toggleNotifications" 
                  class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <BellIcon class="w-5 h-5 sm:w-6 sm:h-6" />
            <span v-if="unreadCount > 0" 
                  class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button @click="showUserMenu = !showUserMenu"
                    class="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div class="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs sm:text-sm font-medium">
                  {{ userInitials }}
                </span>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userRoleLabel }}</p>
              </div>
              <ChevronDownIcon class="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            <!-- User Dropdown -->
            <div v-if="showUserMenu" 
                 class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              
              <!-- Header del profilo -->
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userProfile?.email }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                  {{ userRoleLabel }}
                </span>
              </div>
              
              <!-- Menu items -->
              <div class="py-1">
                <button @click="viewProfile" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span class="mr-3">👤</span>
                  Profilo
                </button>
                <button @click="viewSettings" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span class="mr-3">⚙️</span>
                  Impostazioni
                </button>
                <button v-if="authStore.isAdmin" @click="createAdminUser" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span class="mr-3">🔧</span>
                  Crea Admin
                </button>
                <button @click="openChangePassword" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span class="mr-3">🔒</span>
                  Cambia Password
                </button>
                <button v-if="authStore.isAdmin" @click="viewRegistrationRequests" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span class="mr-3">📋</span>
                  Richieste Registrazione
                </button>
              </div>
              
              <div class="border-t border-gray-100 py-1">
                <button @click="handleLogout" 
                        :disabled="logoutLoading"
                        class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  <span class="mr-3">
                    <span v-if="logoutLoading" class="inline-block animate-spin">⏳</span>
                    <span v-else>🚪</span>
                  </span>
                                     <span v-if="logoutLoading">Disconnessione...</span>
                   <span v-else>Esci</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="absolute top-16 right-2 sm:right-4 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div class="p-3 sm:p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900">Notifiche</h3>
      </div>
      <div class="max-h-64 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-sm">
          Nessuna notifica
        </div>
        <div v-for="notification in notifications" :key="notification.id" 
             class="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
             @click="markAsRead(notification)">
          <div class="flex justify-between items-start">
            <p class="text-sm text-gray-900" :class="!notification.read ? 'font-semibold' : ''">{{ notification.message }}</p>
            <span v-if="!notification.read" class="mt-0.5 inline-block w-2 h-2 rounded-full bg-primary-500"></span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ formatNotificationTime(notification.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click="showChangePassword = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md" @click.stop>
        <div class="px-5 py-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Cambia Password</h3>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
            <input v-model="currentPassword" type="password" class="w-full border rounded-md px-3 py-2" placeholder="••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
            <input v-model="newPassword" type="password" class="w-full border rounded-md px-3 py-2" placeholder="Minimo 6 caratteri" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conferma nuova password</label>
            <input v-model="confirmPassword" type="password" class="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div class="px-5 py-4 border-t flex justify-end gap-2">
          <button class="btn-secondary" @click="showChangePassword = false">Annulla</button>
          <button class="btn-primary" :disabled="!canSubmitPassword" @click="submitChangePassword">Aggiorna</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BellIcon, ChevronDownIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'
import logoLegnosystem from '@/assets/logo legnosystem.avif'

// Emit per comunicare con il componente padre
defineEmits(['toggle-sidebar'])

// Firebase Auth Store
const authStore = useAuthStore()
const { success, error, confirm } = usePopup()
const router = useRouter()

// UI State
const showNotifications = ref(false)
const showUserMenu = ref(false)
const firestoreStore = useFirestoreStore()

// Firebase Auth Data
const userName = computed(() => authStore.userName || 'Utente')
const userRole = computed(() => authStore.userRole)
const userProfile = computed(() => authStore.userProfile)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// User computed data
const userInitials = computed(() => {
  const name = userName.value
  if (name && name !== 'Utente') {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }
  return userProfile.value?.email?.[0]?.toUpperCase() || 'U'
})

const userRoleLabel = computed(() => {
  const roleLabels = {
    admin: '🔧 Amministratore',
    manager: '👔 Manager',
    capo_cantiere: '👷‍♂️ Capo Cantiere',
    amministrativo: '📋 Amministrativo',
    employee: '👷 Operaio',
    user: '👤 Utente'
  }
  return roleLabels[userRole.value] || '👤 Utente'
})

const notifications = computed(() => firestoreStore.notifications || [])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const formatNotificationTime = (ts) => {
  try {
    if (!ts) return ''
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return date.toLocaleString('it-IT')
  } catch {
    return ''
  }
}

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && authStore.user) {
    // Attiva realtime se disponibile, altrimenti fallback a load
    if (firestoreStore.subscribeToNotifications) {
      firestoreStore.subscribeToNotifications(authStore.user.uid)
    } else {
      await firestoreStore.loadNotifications(authStore.user.uid).catch(() => {})
    }
  }
}

// Attiva la sottoscrizione realtime appena l'utente è autenticato
onMounted(() => {
  let unsubscribe = null
  if (authStore.user && firestoreStore.subscribeToNotifications) {
    unsubscribe = firestoreStore.subscribeToNotifications(authStore.user.uid)
  }
  // Watch per avviare/aggiornare la sottoscrizione quando cambia l'utente
  const stop = watch(() => authStore.user, (u) => {
    if (!firestoreStore.subscribeToNotifications) return
    if (unsubscribe) {
      try { unsubscribe() } catch (_) {}
    }
    if (u) {
      unsubscribe = firestoreStore.subscribeToNotifications(u.uid)
    }
  })
  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (unsubscribe) {
      try { unsubscribe() } catch (_) {}
    }
    stop()
  })
})

const markAsRead = async (notification) => {
  if (!notification.read) {
    await firestoreStore.markNotificationAsRead(notification.id).catch(() => {})
  }
}

// Change Password modal state
const showChangePassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const canSubmitPassword = computed(() => !!currentPassword.value && newPassword.value.length >= 6 && newPassword.value === confirmPassword.value)

const openChangePassword = () => {
  showUserMenu.value = false
  showChangePassword.value = true
}

const submitChangePassword = async () => {
  if (!canSubmitPassword.value) return
  try {
    const res = await authStore.changePassword(currentPassword.value, newPassword.value)
    if (res?.success) {
      showChangePassword.value = false
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      success('Password aggiornata', 'La password è stata cambiata con successo')
    }
  } catch (e) {
    error('Errore', e?.message || 'Impossibile cambiare password')
  }
}

// State per logout
const logoutLoading = ref(false)

// Methods
const handleLogout = async () => {
  try {
    // 1. Conferma logout con popup elegante
    const confirmed = await confirm(
      'Conferma Logout',
      `Ciao <strong>${userName.value}</strong>! 👋<br><br>
      Sei sicuro di voler uscire da <strong>Legnosystem</strong>?<br><br>
      <small style="color: #6B7280;">Dovrai accedere nuovamente per continuare a lavorare.</small>`,
      {
        confirmText: 'Sì, esci',
        cancelText: 'Rimani',
        type: 'info'
      }
    )
    
    if (!confirmed) return
    
    // 2. Chiudi menu e mostra loading
    showUserMenu.value = false
    logoutLoading.value = true
    
    // 3. Feedback visivo immediato
    success('Disconnessione in corso...', 'Preparando l\'uscita sicura 🔒')
    
    // 4. Aggiungi animazione fade-out
    document.body.style.transition = 'opacity 0.3s ease'
    document.body.style.opacity = '0.7'
    
    // 5. Cleanup listeners per evitare memory leaks
    window.dispatchEvent(new CustomEvent('before-logout'))
    
    // 6. Breve delay per l'animazione
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 7. Esegui logout
    const result = await authStore.logout()
    
    if (result.success) {
      // 8. Reset finale UI
      document.body.style.opacity = '1'
      document.body.style.transition = ''
      
      // 9. Redirect elegante
      await router.push('/auth')
      
      // 10. Messaggio finale
      success('Logout Completato', `Grazie per aver usato Legnosystem, ${userName.value}! 🏗️`)
    } else {
      // Ripristina UI in caso di errore
      document.body.style.opacity = '1'
      document.body.style.transition = ''
      error('Errore Logout', result.error || 'Errore durante la disconnessione')
    }
    
  } catch (error) {
    console.error('Errore logout:', error)
    error('Errore Logout', 'Si è verificato un errore inaspettato')
    
    // Ripristina UI
    document.body.style.opacity = '1'
    document.body.style.transition = ''
  } finally {
    logoutLoading.value = false
  }
}

const viewProfile = () => {
  showUserMenu.value = false
  // TODO: Implementare modal profilo
  success('Profilo', 'Funzionalità in sviluppo')
}

const viewSettings = () => {
  showUserMenu.value = false
  // TODO: Implementare modal impostazioni
  success('Impostazioni', 'Funzionalità in sviluppo')
}

const createAdminUser = async () => {
  try {
    const result = await authStore.createAdminProfile()
    if (result.success) {
      if (result.info === 'already_admin') {
        success('Sei già Admin', 'Il tuo profilo è già amministratore')
      } else {
        success('Admin Creato', 'Profilo amministratore creato con successo!')
      }
    }
    showUserMenu.value = false
  } catch (error) {
    console.error('Errore creazione admin:', error)
    error('Errore', 'Impossibile creare profilo amministratore')
  }
}

const viewRegistrationRequests = () => {
  showUserMenu.value = false
  router.push('/registration-requests')
}

// Chiudi dropdown quando si clicca fuori
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
})

// Cleanup durante logout
window.addEventListener('auth-logout-cleanup', () => {
  // Chiudi tutti i menu aperti
  showNotifications.value = false
  showUserMenu.value = false
  
  // Nascondi eventuali tooltip o popover
  document.querySelectorAll('[data-tippy-root]').forEach(el => el.remove())
  
  console.log('🧹 AppHeader cleanup completato')
})

// Cleanup automatico prima del logout
window.addEventListener('before-logout', () => {
  // Chiudi tutti i menu immediatamente
  showNotifications.value = false
  showUserMenu.value = false
  
  console.log('🚪 AppHeader preparato per logout')
})
</script> 