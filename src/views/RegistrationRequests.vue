<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="px-8 py-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                <span class="mr-3 text-3xl">📋</span>
                Richieste di Registrazione
              </h1>
              <p class="text-gray-600 mt-1">Gestisci le richieste di accesso al sistema</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                <span class="font-medium">{{ pendingCount }}</span> in attesa
              </div>
              <button
                @click="loadRequests"
                :disabled="loading"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <span v-if="loading" class="animate-spin mr-2">⟳</span>
                <span v-else class="mr-2">🔄</span>
                Aggiorna
              </button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="px-8 py-4 bg-gray-50 border-b border-gray-100">
          <div class="flex flex-wrap gap-4">
            <select v-model="statusFilter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tutti gli stati</option>
              <option value="pending">In attesa</option>
              <option value="approved">Approvati</option>
              <option value="rejected">Rifiutati</option>
            </select>
            <select v-model="roleFilter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tutti i ruoli</option>
              <option value="employee">Operaio</option>
              <option value="capo_cantiere">Capo Cantiere</option>
              <option value="amministrativo">Amministrativo</option>
              <option value="manager">Manager</option>
              <option value="admin">Amministratore</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Caricamento richieste...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nessuna richiesta trovata</h3>
        <p class="text-gray-600">Non ci sono richieste di registrazione con i filtri selezionati.</p>
      </div>

      <!-- Requests Grid -->
      <div v-else class="grid grid-cols-1 gap-6">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="p-6">
            <!-- Header della richiesta -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-xl">{{ getRoleIcon(request.role) }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ request.name }}</h3>
                  <p class="text-gray-600">{{ request.email }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(request.status)">
                      {{ getStatusLabel(request.status) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(request.requestedAt) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Actions per richieste pending -->
              <div v-if="request.status === 'pending'" class="flex space-x-2">
                <button
                  @click="showApproveModal(request)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                >
                  <span class="mr-1">✅</span>
                  Approva
                </button>
                <button
                  @click="showRejectModal(request)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center"
                >
                  <span class="mr-1">❌</span>
                  Rifiuta
                </button>
              </div>

              <!-- Actions per richieste già approvate -->
              <div v-else-if="request.status === 'approved'" class="flex space-x-2">
                <button
                  @click="promoteToAdmin(request)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                >
                  <span class="mr-1">🔧</span>
                  Promuovi a admin
                </button>
              </div>
            </div>

            <!-- Dettagli della richiesta -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Ruolo</dt>
                <dd class="text-sm text-gray-900 flex items-center">
                  <span class="mr-2">{{ getRoleIcon(request.role) }}</span>
                  {{ getRoleLabel(request.role) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Dipartimento</dt>
                <dd class="text-sm text-gray-900">{{ request.department || 'Non specificato' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Telefono</dt>
                <dd class="text-sm text-gray-900">{{ request.phone || 'Non specificato' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Posizione</dt>
                <dd class="text-sm text-gray-900">{{ request.position || 'Non specificata' }}</dd>
              </div>
            </div>

            <!-- Info processamento (se processata) -->
            <div v-if="request.status !== 'pending'" class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-800">
                <span class="font-medium">
                  {{ request.status === 'approved' ? 'Approvata' : 'Rifiutata' }}
                </span>
                il {{ formatDate(request.processedAt) }}
              </p>
              <p v-if="request.notes" class="text-sm text-blue-700 mt-1">
                <strong>Note:</strong> {{ request.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-gray-500 pb-8">
        <p>&copy; {{ currentYear }} Legno System • Sistema di gestione aziendale</p>
        <p class="mt-1 text-xs text-gray-400">
          Ideato e sviluppato da <span class="font-medium text-green-600">Loris Di Furio</span>
        </p>
      </div>
    </div>

    <!-- Modal Approvazione -->
    <div v-if="showApproveModalFlag" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">✅</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Approva Registrazione</h3>
          <p class="text-sm text-gray-600 mt-1">
            Confermi l'approvazione per <strong>{{ selectedRequest?.name }}</strong>?
          </p>
        </div>

        <div class="bg-green-50 rounded-lg p-4 mb-6">
          <div class="text-sm text-green-800">
            <p>✉️ Verrà inviata un'email per impostare la password</p>
            <p>🔑 L'account sarà immediatamente attivo</p>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="closeApproveModal"
            :disabled="approving"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            Annulla
          </button>
          <button
            @click="approveRequest"
            :disabled="approving"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium disabled:opacity-50 hover:from-green-700 hover:to-green-800 transition-all"
          >
            {{ approving ? 'Approvando...' : 'Conferma' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Rifiuto -->
    <div v-if="showRejectModalFlag" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">❌</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Rifiuta Registrazione</h3>
          <p class="text-sm text-gray-600 mt-1">
            Rifiutare la richiesta di <strong>{{ selectedRequest?.name }}</strong>?
          </p>
        </div>

        <div class="mb-6">
          <label for="rejectReason" class="block text-sm font-semibold text-gray-700 mb-2">
            Motivo del rifiuto (opzionale)
          </label>
          <textarea
            id="rejectReason"
            v-model="rejectReason"
            :disabled="rejecting"
            rows="3"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 disabled:opacity-50"
            placeholder="Descrivi il motivo del rifiuto..."
          ></textarea>
        </div>

        <div class="flex space-x-3">
          <button
            @click="closeRejectModal"
            :disabled="rejecting"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            Annulla
          </button>
          <button
            @click="rejectRequest"
            :disabled="rejecting"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium disabled:opacity-50 hover:from-red-700 hover:to-red-800 transition-all"
          >
            {{ rejecting ? 'Rifiutando...' : 'Conferma Rifiuto' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePopup } from '@/composables/usePopup'

// Composables
const authStore = useAuthStore()
const { success, error } = usePopup()

// Current year for copyright
const currentYear = new Date().getFullYear()

// State
const requests = ref([])
const loading = ref(false)
const statusFilter = ref('')
const roleFilter = ref('')

// Modals
const showApproveModalFlag = ref(false)
const showRejectModalFlag = ref(false)
const selectedRequest = ref(null)
const approving = ref(false)
const rejecting = ref(false)
const rejectReason = ref('')
const promoting = ref(false)

// Computed
const filteredRequests = computed(() => {
  return requests.value.filter(request => {
    const matchesStatus = !statusFilter.value || request.status === statusFilter.value
    const matchesRole = !roleFilter.value || request.role === roleFilter.value
    return matchesStatus && matchesRole
  })
})

const pendingCount = computed(() => {
  return requests.value.filter(r => r.status === 'pending').length
})

// Methods
const loadRequests = async () => {
  loading.value = true
  try {
    requests.value = await authStore.getRegistrationRequests()
  } catch (err) {
    error('Errore', 'Impossibile caricare le richieste di registrazione')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const showApproveModal = (request) => {
  selectedRequest.value = request
  showApproveModalFlag.value = true
}

const closeApproveModal = () => {
  showApproveModalFlag.value = false
  selectedRequest.value = null
}

const showRejectModal = (request) => {
  selectedRequest.value = request
  rejectReason.value = ''
  showRejectModalFlag.value = true
}

const closeRejectModal = () => {
  showRejectModalFlag.value = false
  selectedRequest.value = null
  rejectReason.value = ''
}

const approveRequest = async () => {
  if (!selectedRequest.value) return
  
  approving.value = true
  try {
    const result = await authStore.approveRegistrationRequest(
      selectedRequest.value.id, 
      selectedRequest.value
    )
    
    if (result.success) {
      await loadRequests() // Ricarica la lista
      closeApproveModal()
    }
  } catch (err) {
    error('Errore', 'Impossibile approvare la richiesta')
    console.error(err)
  } finally {
    approving.value = false
  }
}

const rejectRequest = async () => {
  if (!selectedRequest.value) return
  
  rejecting.value = true
  try {
    const result = await authStore.rejectRegistrationRequest(
      selectedRequest.value.id, 
      rejectReason.value
    )
    
    if (result.success) {
      await loadRequests() // Ricarica la lista
      closeRejectModal()
    }
  } catch (err) {
    error('Errore', 'Impossibile rifiutare la richiesta')
    console.error(err)
  } finally {
    rejecting.value = false
  }
}

const promoteToAdmin = async (request) => {
  if (!request?.createdUserId && !request?.userId) {
    error('Errore', 'Non è possibile individuare l\'utente creato da questa richiesta')
    return
  }
  const targetUserId = request.createdUserId || request.userId

  try {
    promoting.value = true
    const res = await authStore.promoteUserToAdmin(targetUserId)
    if (res.success) {
      success('Promosso', `${request.name} ora è Amministratore`)
      await loadRequests()
    } else {
      error('Errore', res.error || 'Impossibile promuovere utente')
    }
  } catch (e) {
    console.error(e)
    error('Errore', 'Impossibile promuovere utente')
  } finally {
    promoting.value = false
  }
}

// Utility functions
const getRoleIcon = (role) => {
  const icons = {
    employee: '👷',
    capo_cantiere: '👷‍♂️',
    amministrativo: '📋',
    manager: '👔',
    admin: '🔧'
  }
  return icons[role] || '👤'
}

const getRoleLabel = (role) => {
  const labels = {
    employee: 'Operaio',
    capo_cantiere: 'Capo Cantiere',
    amministrativo: 'Amministrativo',
    manager: 'Manager',
    admin: 'Amministratore'
  }
  return labels[role] || 'Utente'
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'In attesa',
    approved: 'Approvato',
    rejected: 'Rifiutato'
  }
  return labels[status] || 'Sconosciuto'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  
  // Gestisci sia Timestamp di Firestore che Date normale
  let dateObj
  if (date?.toDate) {
    dateObj = date.toDate()
  } else if (date?.seconds) {
    dateObj = new Date(date.seconds * 1000)
  } else {
    dateObj = new Date(date)
  }
  
  return dateObj.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Verifica che l'utente sia admin
  if (!authStore.isAdmin) {
    error('Accesso Negato', 'Solo gli amministratori possono accedere a questa pagina')
    return
  }
  
  loadRequests()
})
</script>

<style scoped>
/* Animazioni personalizzate */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style> 