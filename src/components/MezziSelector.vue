<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-medium text-gray-900">🚛 Mezzi Utilizzati</h4>
      <button 
        @click="addMezzo" 
        type="button"
        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
      >
        + Aggiungi Mezzo
      </button>
    </div>

    <!-- Lista mezzi selezionati -->
    <div v-if="mezziSelezionati.length > 0" class="space-y-3">
      <div 
        v-for="(mezzo, index) in mezziSelezionati" 
        :key="mezzo.id"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
              🚛
            </div>
            <div>
              <h5 class="font-medium text-gray-900">{{ mezzo.nome }}</h5>
              <p class="text-sm text-gray-500">{{ mezzo.categoria }}</p>
            </div>
          </div>
          <button 
            @click="removeMezzo(index)"
            type="button"
            class="text-red-500 hover:text-red-700"
            title="Rimuovi mezzo"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ore Utilizzo</label>
            <input 
              v-model.number="mezzo.oreUtilizzo" 
              type="number" 
              step="0.5" 
              min="0" 
              max="24"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoMezzo(index)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Orario</label>
            <input 
              v-model.number="mezzo.costoOrario" 
              type="number" 
              step="0.5" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoMezzo(index)"
            />
          </div>
        </div>

        <div class="mt-3 p-3 bg-white rounded-md border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Costo Totale:</span>
            <span class="font-semibold text-orange-600">€{{ mezzo.costoTotale.toFixed(2) }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ mezzo.oreUtilizzo }}h × €{{ mezzo.costoOrario }}/h
          </div>
        </div>
      </div>
    </div>

    <!-- Messaggio se nessun mezzo -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-4xl mb-2">🚛</div>
      <p class="text-gray-500">Nessun mezzo selezionato</p>
      <p class="text-sm text-gray-400">Clicca "Aggiungi Mezzo" per iniziare</p>
    </div>

    <!-- Modal selezione mezzo -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Seleziona Mezzo</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Ricerca mezzi -->
          <div class="mb-4">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Cerca mezzo..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Lista mezzi disponibili -->
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div 
              v-for="mezzo in mezziFiltrati" 
              :key="mezzo.id"
              @click="selectMezzo(mezzo)"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                  🚛
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ mezzo.nome }}</div>
                  <div class="text-sm text-gray-500">{{ mezzo.categoria }} • €{{ mezzo.costoOrario }}/h</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="mezziFiltrati.length === 0" class="text-center py-4 text-gray-500">
            Nessun mezzo trovato
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
  mezzi: {
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
const mezziSelezionati = ref([...props.modelValue])

// Mezzi filtrati per ricerca
const mezziFiltrati = computed(() => {
  const mezziDisponibili = props.mezzi.filter(m => 
    !mezziSelezionati.value.some(selected => selected.id === m.id)
  )
  
  if (!searchTerm.value) return mezziDisponibili
  
  return mezziDisponibili.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    m.categoria.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Aggiungi mezzo
const addMezzo = () => {
  showModal.value = true
  searchTerm.value = ''
}

// Seleziona mezzo dal modal
const selectMezzo = (mezzo) => {
  const nuovoMezzo = {
    id: mezzo.id,
    nome: mezzo.nome,
    categoria: mezzo.categoria,
    costoOrario: mezzo.costoOrario,
    oreUtilizzo: 8, // Default 8 ore
    costoTotale: mezzo.costoOrario * 8
  }
  
  mezziSelezionati.value.push(nuovoMezzo)
  closeModal()
  updateModel()
}

// Rimuovi mezzo
const removeMezzo = (index) => {
  mezziSelezionati.value.splice(index, 1)
  updateModel()
}

// Calcola costo mezzo
const calcolaCostoMezzo = (index) => {
  const mezzo = mezziSelezionati.value[index]
  mezzo.costoTotale = (mezzo.oreUtilizzo || 0) * (mezzo.costoOrario || 0)
  updateModel()
}

// Chiudi modal
const closeModal = () => {
  showModal.value = false
  searchTerm.value = ''
}

// Aggiorna model
const updateModel = () => {
  emit('update:modelValue', mezziSelezionati.value)
}

// Watch per sincronizzare con props
watch(() => props.modelValue, (newValue) => {
  mezziSelezionati.value = [...newValue]
}, { deep: true })

// Calcola totale generale
const totaleGenerale = computed(() => {
  return mezziSelezionati.value.reduce((tot, mez) => tot + mez.costoTotale, 0)
})

// Esponi totale per uso esterno
defineExpose({
  totaleGenerale
})
</script> 