<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <svg class="w-full h-full" viewBox="0 0 100 100" fill="none">
        <pattern id="wood-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="url(#wood-grain)"/>
        </pattern>
        <defs>
          <linearGradient id="wood-grain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B4513;stop-opacity:0.1"/>
            <stop offset="50%" style="stop-color:#A0522D;stop-opacity:0.05"/>
            <stop offset="100%" style="stop-color:#8B4513;stop-opacity:0.1"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#wood-pattern)"/>
      </svg>
    </div>

    <!-- Header con logo aziendale -->
    <header class="relative z-10 pt-8 pb-6">
      <div class="max-w-md mx-auto text-center px-4">
        <!-- Logo aziendale Legnosystem -->
        <div class="inline-flex items-center justify-center mb-4">
          <div class="w-20 h-20 rounded-lg shadow-lg overflow-hidden bg-white p-2">
            <img 
              :src="logoLegnosystem" 
              alt="Legno System Logo" 
              class="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <span class="text-green-700">LEGNO</span> 
          <span class="text-gray-600">SYSTEM</span>
        </h1>
        <p class="text-green-600 font-medium">Gestionale Aziendale</p>
        <p class="text-sm text-gray-500 mt-1">Costruttori esperti dal 1959</p>
      </div>
    </header>

    <!-- Container principale -->
    <div class="relative z-10 max-w-md mx-auto px-4">
      <!-- Card principale -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
        <!-- Header card -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
          <h2 class="text-2xl font-bold text-white mb-1">Benvenuto</h2>
          <p class="text-green-100 text-sm">Accedi al tuo sistema di gestione</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">
              Email Aziendale
            </label>
            <div class="relative">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                :disabled="loading"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="nome@azienda.it"
              />

            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                v-model="form.password"
                :disabled="loading"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="La tua password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="loading"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me & Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="form.remember"
                :disabled="loading"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
              />
              <span class="ml-2 text-sm text-gray-600">Ricordami</span>
            </label>

            <button
              type="button"
              @click="showForgotPassword = true"
              :disabled="loading"
              class="text-sm text-green-600 hover:text-green-500 font-medium disabled:opacity-50"
            >
              Password dimenticata?
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="text-red-400">❌</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Accesso in corso...
            </span>
            <span v-else class="flex items-center justify-center">
              Accedi al Sistema
            </span>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">oppure</span>
            </div>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Non hai ancora un account aziendale?
            </p>
            <button
              type="button"
              @click="$emit('show-register')"
              :disabled="loading"
              class="mt-2 font-semibold text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              Richiedi Registrazione →
            </button>
          </div>
        </form>
      </div>

      <!-- Demo Section -->
      <div class="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">🧪 Ambiente Demo</h3>
              <p class="text-xs text-gray-600">Account di test per valutazione</p>
            </div>
            <button
              type="button"
              @click="createDemoAccounts"
              :disabled="loading || creatingDemo"
              class="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 font-medium transition-colors"
            >
              {{ creatingDemo ? 'Creando...' : '+ Crea Demo' }}
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-3">
          <button
            type="button"
            @click="loginDemo('admin')"
            :disabled="loading"
            class="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-green-300 hover:bg-green-50 disabled:opacity-50 transition-all duration-200"
          >
            <span class="flex items-center">
              <span class="mr-3 text-lg">🔧</span>
              <div class="text-left">
                <div class="font-medium">Amministratore</div>
                <div class="text-xs text-gray-500">admin@legnosystem.it</div>
              </div>
            </span>
            <span class="text-green-600">→</span>
          </button>
          
          <button
            type="button"
            @click="loginDemo('manager')"
            :disabled="loading"
            class="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-green-300 hover:bg-green-50 disabled:opacity-50 transition-all duration-200"
          >
            <span class="flex items-center">
              <span class="mr-3 text-lg">👔</span>
              <div class="text-left">
                <div class="font-medium">Direttore</div>
                <div class="text-xs text-gray-500">manager@legnosystem.it</div>
              </div>
            </span>
            <span class="text-green-600">→</span>
          </button>
          
          <button
            type="button"
            @click="loginDemo('capo')"
            :disabled="loading"
            class="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-green-300 hover:bg-green-50 disabled:opacity-50 transition-all duration-200"
          >
            <span class="flex items-center">
              <span class="mr-3 text-lg">👷‍♂️</span>
              <div class="text-left">
                <div class="font-medium">Capo Cantiere</div>
                <div class="text-xs text-gray-500">capo@legnosystem.it</div>
              </div>
            </span>
            <span class="text-green-600">→</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-gray-500 pb-8">
        <p>&copy; {{ currentYear }} Legno System • Abitare in natura dal 1959</p>
        <p class="mt-1">Sistema di gestione aziendale integrato</p>
        <p class="mt-2 text-xs text-gray-400">
          Ideato e sviluppato da <span class="font-medium text-green-600">Loris Di Furio</span>
        </p>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🔐</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Recupera Password</h3>
          <p class="text-sm text-gray-600 mt-1">Ti invieremo un link per reimpostare la password</p>
        </div>
        
        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label for="resetEmail" class="block text-sm font-semibold text-gray-700 mb-2">
              Email Aziendale
            </label>
            <input
              id="resetEmail"
              type="email"
              required
              v-model="resetEmail"
              :disabled="resetLoading"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:opacity-50"
              placeholder="nome@azienda.it"
            />
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              :disabled="resetLoading"
              class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium disabled:opacity-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              :disabled="resetLoading || !resetEmail"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium disabled:opacity-50 hover:from-green-700 hover:to-green-800 transition-all"
            >
              {{ resetLoading ? 'Invio...' : 'Invia Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePopup } from '@/composables/usePopup'
import { createDemoUsers } from '@/utils/createDemoUsers'
import logoLegnosystem from '@/assets/logo legnosystem.avif'

// Emits
const emit = defineEmits(['show-register', 'login-success'])

// Composables
const authStore = useAuthStore()
const { success, error } = usePopup()

// Current year for copyright
const currentYear = new Date().getFullYear()

// State
const form = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const creatingDemo = ref(false)

// Forgot Password
const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)

// Demo accounts
const demoAccounts = {
  admin: { email: 'admin@legnosystem.it', password: 'demo123' },
  manager: { email: 'manager@legnosystem.it', password: 'demo123' },
  capo: { email: 'capo@legnosystem.it', password: 'demo123' }
}

// Computed
const isFormValid = computed(() => {
  return form.value.email.length > 0 && form.value.password.length > 0
})

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const result = await authStore.login(form.value.email, form.value.password)
    
    if (result.success) {
      emit('login-success')
    } else {
      errorMessage.value = result.error
    }
  } catch (err) {
    console.error('Errore login:', err)
    errorMessage.value = 'Si è verificato un errore durante l\'accesso'
  } finally {
    loading.value = false
  }
}

const loginDemo = async (type) => {
  const account = demoAccounts[type]
  if (!account) return
  
  form.value.email = account.email
  form.value.password = account.password
  
  await handleLogin()
}

const handleForgotPassword = async () => {
  if (!resetEmail.value) return
  
  resetLoading.value = true
  
  try {
    const result = await authStore.resetPassword(resetEmail.value)
    
    if (result.success) {
      success('Email Inviata', 'Controlla la tua casella di posta per il link di reset')
      showForgotPassword.value = false
      resetEmail.value = ''
    } else {
      error('Errore Reset', result.error)
    }
  } catch (err) {
    console.error('Errore reset password:', err)
    error('Errore Reset', 'Si è verificato un errore durante l\'invio dell\'email')
  } finally {
    resetLoading.value = false
  }
}

const createDemoAccounts = async () => {
  creatingDemo.value = true
  
  try {
    const results = await createDemoUsers()
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    if (successful.length > 0) {
      success(
        'Account Demo Creati', 
        `${successful.length} account demo creati con successo! Ora puoi accedere usando i pulsanti sopra.`
      )
    }
    
    if (failed.length > 0) {
      console.warn('Alcuni account non sono stati creati:', failed)
      // Non mostrare errore se sono già esistenti
      if (!failed.every(f => f.error?.includes('already-in-use'))) {
        error('Attenzione', `${failed.length} account non sono stati creati. Potrebbero già esistere.`)
      }
    }
  } catch (err) {
    console.error('Errore creazione account demo:', err)
    error('Errore', 'Impossibile creare account demo. Verifica la configurazione Firebase.')
  } finally {
    creatingDemo.value = false
  }
}
</script>

<style scoped>
/* Animazioni personalizzate */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Effetti hover personalizzati */
input:focus {
  transform: translateY(-1px);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* Pattern del background */
.wood-pattern {
  background-image: 
    linear-gradient(45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%), 
    linear-gradient(-45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(160, 82, 45, 0.02) 75%), 
    linear-gradient(-45deg, transparent 75%, rgba(160, 82, 45, 0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style> 