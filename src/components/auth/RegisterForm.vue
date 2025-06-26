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
    <header class="relative z-10 pt-6 pb-4">
      <div class="max-w-lg mx-auto text-center px-4">
        <!-- Logo aziendale Legnosystem -->
        <div class="inline-flex items-center justify-center mb-3">
          <div class="w-16 h-16 rounded-lg shadow-lg overflow-hidden bg-white p-2">
            <img 
              :src="logoLegnosystem" 
              alt="Legno System Logo" 
              class="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1">
          <span class="text-green-700">LEGNO</span> 
          <span class="text-gray-600">SYSTEM</span>
        </h1>
        <p class="text-green-600 font-medium text-sm">Richiesta Accesso</p>
      </div>
    </header>

    <!-- Container principale -->
    <div class="relative z-10 max-w-lg mx-auto px-4 pb-8">
      <!-- Card principale -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
        <!-- Header card -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
          <h2 class="text-xl font-bold text-white mb-1">Nuovo Account</h2>
          <p class="text-green-100 text-sm">Compila i dati per richiedere l'accesso</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="p-8 space-y-5">
          <!-- Grid a 2 colonne per nome e email -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nome -->
            <div class="space-y-2">
              <label for="name" class="block text-sm font-semibold text-gray-700">Nome completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                v-model="form.name"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="Mario Rossi"
              />
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-gray-700">Email aziendale</label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="nome@azienda.it"
              />
            </div>
          </div>

          <!-- Password fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  v-model="form.password"
                  :disabled="loading"
                  class="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                  placeholder="Min. 6 caratteri"
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

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700">Conferma</label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  v-model="form.confirmPassword"
                  :disabled="loading"
                  class="w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                  :class="{ 
                    'border-red-300 focus:border-red-500 focus:ring-red-200': form.confirmPassword && !passwordsMatch,
                    'border-gray-200 focus:border-green-500 focus:ring-green-200': !form.confirmPassword || passwordsMatch
                  }"
                  placeholder="Ripeti password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="loading"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showConfirmPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                </button>
              </div>
              <!-- Error per password mismatch -->
              <div v-if="form.confirmPassword && !passwordsMatch" class="text-xs text-red-600 flex items-center">
                <span class="mr-1">⚠️</span>
                Le password non corrispondono
              </div>
            </div>
          </div>

          <!-- Ruolo e Dipartimento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Ruolo -->
            <div class="space-y-2">
              <label for="role" class="block text-sm font-semibold text-gray-700">Ruolo aziendale</label>
              <select
                id="role"
                name="role"
                required
                v-model="form.role"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 bg-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 disabled:opacity-50 transition-all duration-200"
              >
                <option value="">Seleziona ruolo</option>
                <option value="employee">👷 Operaio</option>
                <option value="capo_cantiere">👷‍♂️ Capo Cantiere</option>
                <option value="amministrativo">📋 Amministrativo</option>
                <option value="manager">👔 Manager</option>
                <option value="admin">🔧 Amministratore</option>
              </select>
            </div>

            <!-- Dipartimento -->
            <div class="space-y-2">
              <label for="department" class="block text-sm font-semibold text-gray-700">Dipartimento</label>
              <select
                id="department"
                name="department"
                v-model="form.department"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 bg-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 disabled:opacity-50 transition-all duration-200"
              >
                <option value="">Seleziona dipartimento</option>
                <option value="produzione">🏗️ Produzione</option>
                <option value="amministrazione">📊 Amministrazione</option>
                <option value="vendite">💼 Vendite</option>
                <option value="logistica">🚛 Logistica</option>
                <option value="qualita">✅ Qualità</option>
                <option value="sicurezza">🦺 Sicurezza</option>
              </select>
            </div>
          </div>

          <!-- Dati aggiuntivi opzionali -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Telefono -->
            <div class="space-y-2">
              <label for="phone" class="block text-sm font-semibold text-gray-700">Telefono <span class="text-gray-400 font-normal">(opzionale)</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                v-model="form.phone"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="+39 123 456 7890"
              />
            </div>

            <!-- Posizione -->
            <div class="space-y-2">
              <label for="position" class="block text-sm font-semibold text-gray-700">Posizione <span class="text-gray-400 font-normal">(opzionale)</span></label>
              <input
                id="position"
                name="position"
                type="text"
                v-model="form.position"
                :disabled="loading"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                placeholder="Tecnico specializzato"
              />
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <label class="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                v-model="form.acceptTerms"
                :disabled="loading"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50 mt-0.5"
              />
              <span class="ml-3 text-sm text-gray-700">
                Accetto i 
                <a href="#" class="text-green-600 hover:text-green-500 font-medium underline">Termini e Condizioni</a>
                e la 
                <a href="#" class="text-green-600 hover:text-green-500 font-medium underline">Privacy Policy</a>
                di Legno System
              </span>
            </label>
          </div>

          <!-- Info processo approvazione -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-start">
              <span class="text-blue-600 mr-2">ℹ️</span>
              <div class="text-sm text-blue-800">
                <p class="font-medium">Processo di approvazione</p>
                <p class="mt-1">La tua richiesta sarà valutata dall'amministratore. Riceverai un'email di conferma con le credenziali di accesso una volta approvata.</p>
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
              Invio richiesta...
            </span>
            <span v-else class="flex items-center justify-center">
              Richiedi Accesso
            </span>
          </button>

          <!-- Login Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Hai già un account aziendale?
            </p>
            <button
              type="button"
              @click="$emit('show-login')"
              :disabled="loading"
              class="mt-2 font-semibold text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              ← Torna al Login
            </button>
          </div>
        </form>
      </div>

      <!-- Info footer -->
      <div class="mt-6 text-center text-xs text-gray-500">
        <p>&copy; {{ currentYear }} Legno System • Abitare in natura dal 1959</p>
        <p class="mt-1">La registrazione è soggetta ad approvazione amministrativa</p>
        <p class="mt-2 text-xs text-gray-400">
          Ideato e sviluppato da <span class="font-medium text-green-600">Loris Di Furio</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import logoLegnosystem from '@/assets/logo legnosystem.avif'

// Emits
const emit = defineEmits(['show-login', 'register-success'])

// Store
const authStore = useAuthStore()

// Current year for copyright
const currentYear = new Date().getFullYear()

// State
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  department: '',
  phone: '',
  position: '',
  acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

// Computed
const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword
})

const isFormValid = computed(() => {
  return (
    form.value.name.length > 0 &&
    form.value.email.length > 0 &&
    form.value.password.length >= 6 &&
    passwordsMatch.value &&
    form.value.role.length > 0 &&
    form.value.acceptTerms
  )
})

// Methods
const handleRegister = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    const userData = {
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      department: form.value.department,
      phone: form.value.phone,
      position: form.value.position
    }
    
    const result = await authStore.requestRegistration(userData)
    
    if (result.success) {
      emit('register-success')
    }
  } catch (error) {
    console.error('Errore richiesta registrazione:', error)
  } finally {
    loading.value = false
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
input:focus, select:focus {
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