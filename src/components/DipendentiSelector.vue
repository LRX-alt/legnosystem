<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-medium text-gray-900">👥 Dipendenti Presenti</h4>
      <button 
        @click="addDipendente" 
        type="button"
        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
      >
        + Aggiungi Dipendente
      </button>
    </div>

    <!-- Lista dipendenti selezionati -->
    <div v-if="dipendentiSelezionati.length > 0" class="space-y-3">
      <div 
        v-for="(dipendente, index) in dipendentiSelezionati" 
        :key="dipendente.id"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {{ dipendente.iniziali }}
            </div>
            <div>
              <h5 class="font-medium text-gray-900">{{ dipendente.nome }} {{ dipendente.cognome }}</h5>
              <p class="text-sm text-gray-500">{{ dipendente.ruolo }}</p>
            </div>
          </div>
          <button 
            @click="removeDipendente(index)"
            type="button"
            class="text-red-500 hover:text-red-700"
            title="Rimuovi dipendente"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ore Lavorate</label>
            <input 
              v-model.number="dipendente.ore" 
              type="number" 
              step="0.5" 
              min="0" 
              max="12"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoDipendente(index)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Orario</label>
            <input 
              v-model.number="dipendente.costoOrario" 
              type="number" 
              step="0.5" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoDipendente(index)"
            />
          </div>
        </div>

        <div class="mt-3 p-3 bg-white rounded-md border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Costo Totale:</span>
            <span class="font-semibold text-green-600">€{{ dipendente.costoTotale.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messaggio se nessun dipendente -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-4xl mb-2">👥</div>
      <p class="text-gray-500">Nessun dipendente selezionato</p>
      <p class="text-sm text-gray-400">Clicca "Aggiungi Dipendente" per iniziare</p>
    </div>

    <!-- Modal selezione dipendente -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Seleziona Dipendente</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Ricerca dipendenti -->
          <div class="mb-4">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Cerca dipendente..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Lista dipendenti disponibili -->
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div 
              v-for="dipendente in dipendentiFiltrati" 
              :key="dipendente.id"
              @click="selectDipendente(dipendente)"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ dipendente.iniziali }}
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ dipendente.nome }} {{ dipendente.cognome }}</div>
                  <div class="text-sm text-gray-500">{{ dipendente.ruolo }} • €{{ dipendente.pagaOraria }}/h</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="dipendentiFiltrati.length === 0" class="text-center py-4 text-gray-500">
            Nessun dipendente trovato
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  dipendenti: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// Stato locale
const showModal = ref(false)
const searchTerm = ref('')
const dipendentiSelezionati = ref([...props.modelValue])

// Dipendenti filtrati per ricerca
const dipendentiFiltrati = computed(() => {
  const dipendentiDisponibili = props.dipendenti.filter(d => 
    !dipendentiSelezionati.value.some(selected => selected.id === d.id)
  )
  
  if (!searchTerm.value) return dipendentiDisponibili
  
  return dipendentiDisponibili.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    d.cognome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    d.ruolo.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Aggiungi dipendente
const addDipendente = () => {
  showModal.value = true
  searchTerm.value = ''
}

// Seleziona dipendente dal modal
const selectDipendente = (dipendente) => {
  const nuovoDipendente = {
    id: dipendente.id,
    nome: dipendente.nome,
    cognome: dipendente.cognome,
    iniziali: dipendente.iniziali,
    ruolo: dipendente.ruolo,
    pagaOraria: dipendente.pagaOraria,
    ore: 8, // Default 8 ore
    costoOrario: dipendente.pagaOraria,
    costoTotale: dipendente.pagaOraria * 8
  }
  
  dipendentiSelezionati.value.push(nuovoDipendente)
  closeModal()
  updateModel()
}

// Rimuovi dipendente
const removeDipendente = (index) => {
  dipendentiSelezionati.value.splice(index, 1)
  updateModel()
}

// Calcola costo dipendente
const calcolaCostoDipendente = (index) => {
  const dipendente = dipendentiSelezionati.value[index]
  dipendente.costoTotale = (dipendente.ore || 0) * (dipendente.costoOrario || 0)
  updateModel()
}

// Chiudi modal
const closeModal = () => {
  showModal.value = false
  searchTerm.value = ''
}

// Aggiorna model
const updateModel = () => {
  emit('update:modelValue', dipendentiSelezionati.value)
}

// Watch per sincronizzare con props
watch(() => props.modelValue, (newValue) => {
  dipendentiSelezionati.value = [...newValue]
}, { deep: true })

// Calcola totale generale
const totaleGenerale = computed(() => {
  return dipendentiSelezionati.value.reduce((tot, dip) => tot + dip.costoTotale, 0)
})

// Esponi totale per uso esterno
defineExpose({
  totaleGenerale
})
</script> 