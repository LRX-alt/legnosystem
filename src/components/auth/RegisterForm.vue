<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center">
          🏗️
        </div>
        <h2 class="mt-6 text-center text-3xl font-display font-extrabold text-gray-900">
          Registrati a Legnosystem
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Crea il tuo account per gestire i cantieri
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              v-model="form.name"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              placeholder="Es. Mario Rossi"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="form.email"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              placeholder="email@esempio.it"
            />
          </div>

          <!-- Password -->
          <div class="relative">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              v-model="form.password"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              placeholder="Minimo 6 caratteri"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>🙈</span>
            </button>
          </div>

          <!-- Confirm Password -->
          <div class="relative">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Conferma Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              v-model="form.confirmPassword"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              :class="{ 'border-red-300': form.confirmPassword && !passwordsMatch }"
              placeholder="Ripeti la password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <span v-if="showConfirmPassword">👁️</span>
              <span v-else>🙈</span>
            </button>
          </div>

          <!-- Password Match Error -->
          <div v-if="form.confirmPassword && !passwordsMatch" class="text-sm text-red-600">
            Le password non corrispondono
          </div>

          <!-- Ruolo -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Ruolo</label>
            <select
              id="role"
              name="role"
              required
              v-model="form.role"
              :disabled="loading"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
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
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700">Dipartimento</label>
            <select
              id="department"
              name="department"
              v-model="form.department"
              :disabled="loading"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
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

          <!-- Telefono (opzionale) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Telefono (opzionale)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              v-model="form.phone"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              placeholder="+39 123 456 7890"
            />
          </div>

          <!-- Posizione (opzionale) -->
          <div>
            <label for="position" class="block text-sm font-medium text-gray-700">Posizione (opzionale)</label>
            <input
              id="position"
              name="position"
              type="text"
              v-model="form.position"
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
              placeholder="Es. Tecnico specializzato"
            />
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              v-model="form.acceptTerms"
              :disabled="loading"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="text-gray-700">
              Accetto i 
              <a href="#" class="text-primary-600 hover:text-primary-500">Termini e Condizioni</a>
              e la 
              <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span v-else>✨</span>
            </span>
            {{ loading ? 'Registrazione in corso...' : 'Registrati' }}
          </button>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Hai già un account?
            <button
              type="button"
              @click="$emit('show-login')"
              :disabled="loading"
              class="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
            >
              Accedi qui
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Emits
const emit = defineEmits(['show-login', 'register-success'])

// Store
const authStore = useAuthStore()

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
      role: form.value.role,
      department: form.value.department,
      phone: form.value.phone,
      position: form.value.position
    }
    
    const result = await authStore.register(form.value.email, form.value.password, userData)
    
    if (result.success) {
      emit('register-success')
    }
  } catch (error) {
    console.error('Errore registrazione:', error)
  } finally {
    loading.value = false
  }
}
</script> 