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
          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="text-red-400">❌</span>
              </div>
              <div class="ml-3">
                <p v-for="error in validationErrors" :key="error" class="text-sm text-red-700">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

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
              <label for="email" class="block text-sm font-semibold text-gray-700">Email Aziendale</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                v-model="form.email"
                :disabled="loading"
                :class="[
                  'w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50',
                  emailValidation.isValid ? 'border-green-500' : 'border-gray-200'
                ]"
                placeholder="nome@legnosystem.bio"
              />
            </div>
          </div>

          <!-- Grid a 2 colonne per password -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
              <div class="relative">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  v-model="form.password"
                  :disabled="loading"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span class="text-gray-500">👁️</span>
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div v-if="form.password" class="mt-2">
                <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300"
                    :class="getPasswordStrengthColor"
                    :style="{ width: `${passwordStrength}%` }"
                  ></div>
                </div>
                <p class="text-xs mt-1" :class="passwordStrengthTextColor">
                  {{ getPasswordStrengthLabel }}
                </p>
                
                <!-- Password Requirements -->
                <div class="mt-2 text-xs text-gray-600 space-y-1">
                  <div class="flex items-center" :class="form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'">
                    <span class="mr-1">{{ form.password.length >= 8 ? '✅' : '⭕' }}</span>
                    Minimo 8 caratteri
                  </div>
                  <div class="flex items-center" :class="/\d/.test(form.password) ? 'text-green-600' : 'text-gray-400'">
                    <span class="mr-1">{{ /\d/.test(form.password) ? '✅' : '⭕' }}</span>
                    Almeno un numero
                  </div>
                  <div class="flex items-center" :class="/[a-zA-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'">
                    <span class="mr-1">{{ /[a-zA-Z]/.test(form.password) ? '✅' : '⭕' }}</span>
                    Almeno una lettera
                  </div>
                </div>
                
                <!-- Sentinel per assicurare che le classi Tailwind siano compilate -->
                <span class="hidden bg-green-500 text-green-500 bg-yellow-500 text-yellow-500 bg-orange-500 text-orange-500 bg-red-500 text-red-500"></span>
              </div>
            </div>

            <!-- Conferma Password -->
            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700">
                Conferma Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  v-model="form.confirmPassword"
                  :disabled="loading"
                  :class="[
                    'w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-400 transition-all duration-200 disabled:opacity-50',
                    passwordsMatch && form.confirmPassword ? 'border-green-500' : 'border-gray-200'
                  ]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span class="text-gray-500">👁️</span>
                </button>
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
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword } from '@/utils/firestoreValidation'
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
const validationErrors = ref([])
const passwordStrength = ref(0)

// Computed
const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword
})

const emailValidation = computed(() => {
  if (!form.value.email) return { isValid: false, errors: [] }
  return validateEmail(form.value.email)
})

const passwordValidation = computed(() => {
  if (!form.value.password) return { isValid: false, errors: [] }
  const validation = validatePassword(form.value.password)
  passwordStrength.value = validation.strength
  return validation
})

// Aggiorna la barra forza in tempo reale
watch(() => form.value.password, (pwd) => {
  if (!pwd) {
    passwordStrength.value = 0
    return
  }
  const v = validatePassword(pwd)
  passwordStrength.value = v.strength
})

const isFormValid = computed(() => {
  return (
    form.value.name.length > 0 &&
    emailValidation.value.isValid &&
    passwordValidation.value.isValid &&
    passwordsMatch.value &&
    form.value.role.length > 0 &&
    form.value.acceptTerms
  )
})

// Methods
const handleRegister = async () => {
  validationErrors.value = []
  
  // Validazione email
  if (!emailValidation.value.isValid) {
    validationErrors.value.push(...emailValidation.value.errors)
  }
  
  // Validazione password
  if (!passwordValidation.value.isValid) {
    validationErrors.value.push(...passwordValidation.value.errors)
  }
  
  // Validazione conferma password
  if (!passwordsMatch.value) {
    validationErrors.value.push('Le password non coincidono')
  }
  
  if (validationErrors.value.length > 0 || !isFormValid.value) {
    return
  }
  
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
    } else {
      validationErrors.value.push(result.error)
    }
  } catch (error) {
    console.error('Errore richiesta registrazione:', error)
    validationErrors.value.push(error.message)
  } finally {
    loading.value = false
  }
}

// Password strength indicator
const getPasswordStrengthColor = computed(() => {
  if (passwordStrength.value >= 80) return 'bg-green-500'
  if (passwordStrength.value >= 60) return 'bg-yellow-500'
  if (passwordStrength.value >= 40) return 'bg-orange-500'
  return 'bg-red-500'
})

const getPasswordStrengthLabel = computed(() => {
  if (passwordStrength.value >= 80) return 'Eccellente'
  if (passwordStrength.value >= 60) return 'Buona'
  if (passwordStrength.value >= 40) return 'Media'
  if (passwordStrength.value >= 20) return 'Debole'
  return 'Molto debole'
})

const passwordStrengthTextColor = computed(() => {
  if (passwordStrength.value >= 80) return 'text-green-500'
  if (passwordStrength.value >= 60) return 'text-yellow-500'
  if (passwordStrength.value >= 40) return 'text-orange-500'
  return 'text-red-500'
})
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