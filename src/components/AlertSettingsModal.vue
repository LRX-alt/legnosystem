<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">⚙️ Impostazioni Alert Costi</h3>
            <p class="text-sm text-gray-500">Configura le soglie per gli avvisi di costo</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Soglie Generali -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">📊 Soglie Generali</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Costo Giornaliero (€)</label>
              <input 
                v-model.number="settings.sogliaCostoGiornaliero" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="1000"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Costo Settimanale (€)</label>
              <input 
                v-model.number="settings.sogliaCostoSettimanale" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="5000"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Costo Mensile (€)</label>
              <input 
                v-model.number="settings.sogliaCostoMensile" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="20000"
              >
            </div>
          </div>
        </div>

        <!-- Soglie per Categoria -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">🎯 Soglie per Categoria (Giornaliere)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span>Dipendenti (€)</span>
                </span>
              </label>
              <input 
                v-model.number="settings.sogliePerCategoria.dipendenti" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="800"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Materiali (€)</span>
                </span>
              </label>
              <input 
                v-model.number="settings.sogliePerCategoria.materiali" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span>Mezzi (€)</span>
                </span>
              </label>
              <input 
                v-model.number="settings.sogliePerCategoria.mezzi" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="400"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Lavori (€)</span>
                </span>
              </label>
              <input 
                v-model.number="settings.sogliePerCategoria.lavori" 
                type="number" 
                min="0"
                class="form-input w-full"
                placeholder="300"
              >
            </div>
          </div>
        </div>

        <!-- Soglia Incremento Anomalo -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">📈 Incremento Anomalo</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Soglia percentuale incremento (rispetto alla media)
            </label>
            <input 
              v-model.number="settings.sogliaIncrementoPercentuale" 
              type="number" 
              min="0"
              max="100"
              class="form-input w-full md:w-1/3"
              placeholder="50"
            >
            <p class="text-xs text-gray-500 mt-1">Es: 50% = alert se i costi superano del 50% la media</p>
          </div>
        </div>

        <!-- Alert Abilitati -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">🔔 Tipi di Alert</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center space-x-3">
              <input 
                v-model="settings.alertAbilitati.costoGiornaliero" 
                type="checkbox" 
                id="alert-giornaliero"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              >
              <label for="alert-giornaliero" class="text-sm font-medium text-gray-700">
                Costo giornaliero eccessivo
              </label>
            </div>
            <div class="flex items-center space-x-3">
              <input 
                v-model="settings.alertAbilitati.costoSettimanale" 
                type="checkbox" 
                id="alert-settimanale"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              >
              <label for="alert-settimanale" class="text-sm font-medium text-gray-700">
                Costo settimanale eccessivo
              </label>
            </div>
            <div class="flex items-center space-x-3">
              <input 
                v-model="settings.alertAbilitati.costoMensile" 
                type="checkbox" 
                id="alert-mensile"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              >
              <label for="alert-mensile" class="text-sm font-medium text-gray-700">
                Costo mensile eccessivo
              </label>
            </div>
            <div class="flex items-center space-x-3">
              <input 
                v-model="settings.alertAbilitati.categoriaSingola" 
                type="checkbox" 
                id="alert-categoria"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              >
              <label for="alert-categoria" class="text-sm font-medium text-gray-700">
                Costo categoria singola
              </label>
            </div>
            <div class="flex items-center space-x-3">
              <input 
                v-model="settings.alertAbilitati.incrementoAnomalo" 
                type="checkbox" 
                id="alert-incremento"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              >
              <label for="alert-incremento" class="text-sm font-medium text-gray-700">
                Incremento anomalo costi
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button @click="$emit('close')" class="btn-secondary">
          Annulla
        </button>
        <button @click="saveSettings" class="btn-primary">
          💾 Salva Impostazioni
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { usePopup } from '@/composables/usePopup'
import { alertSettings } from '@/config/alertSettings.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'settings-updated'])

const popup = usePopup()
const settings = ref({})

onMounted(() => {
  // Carica le impostazioni correnti
  settings.value = JSON.parse(JSON.stringify(alertSettings))
})

const saveSettings = () => {
  try {
    // Aggiorna le impostazioni globali
    Object.assign(alertSettings, settings.value)
    
    // Salva in localStorage per persistenza
    localStorage.setItem('alertSettings', JSON.stringify(settings.value))
    
    popup.success('Impostazioni Salvate', 'Le soglie degli alert sono state aggiornate')
    emit('settings-updated', settings.value)
    emit('close')
  } catch (error) {
    popup.error('Errore', 'Impossibile salvare le impostazioni')
  }
}
</script> 