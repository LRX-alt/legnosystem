<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-medium text-gray-900">🔨 Tipi di Lavori Effettuati</h4>
      <button 
        @click="addLavoro" 
        type="button"
        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
      >
        + Aggiungi Lavoro
      </button>
    </div>

    <!-- Lista lavori selezionati -->
    <div v-if="lavoriSelezionati.length > 0" class="space-y-3">
      <div 
        v-for="(lavoro, index) in lavoriSelezionati" 
        :key="`${lavoro.tipo}-${index}`"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              🔨
            </div>
            <div>
              <h5 class="font-medium text-gray-900">{{ lavoro.nomeTipo }}</h5>
              <p class="text-sm text-gray-500">{{ lavoro.nomeSottocategoria }}</p>
            </div>
          </div>
          <button 
            @click="removeLavoro(index)"
            type="button"
            class="text-red-500 hover:text-red-700"
            title="Rimuovi lavoro"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ore Lavoro</label>
            <input 
              v-model.number="lavoro.ore" 
              type="number" 
              step="0.5" 
              min="0" 
              max="12"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Orario</label>
            <input 
              v-model.number="lavoro.costoOrario" 
              type="number" 
              step="0.5" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <textarea 
            v-model="lavoro.descrizione" 
            rows="2"
            placeholder="Descrizione dettagliata del lavoro effettuato..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="mt-3 p-3 bg-white rounded-md border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Costo Totale:</span>
            <span class="font-semibold text-purple-600">€{{ (lavoro.ore * lavoro.costoOrario).toFixed(2) }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ lavoro.ore }}h × €{{ lavoro.costoOrario }}/h
          </div>
        </div>
      </div>
    </div>

    <!-- Messaggio se nessun lavoro -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-4xl mb-2">🔨</div>
      <p class="text-gray-500">Nessun lavoro selezionato</p>
      <p class="text-sm text-gray-400">Clicca "Aggiungi Lavoro" per iniziare</p>
    </div>

    <!-- Modal selezione lavoro -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-lg shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Seleziona Tipo di Lavoro</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Selezione categoria principale -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria Principale</label>
            <select 
              v-model="selectedCategoria"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleziona categoria...</option>
              <option v-for="tipo in tipiLavori" :key="tipo.id" :value="tipo.id">
                {{ tipo.nome }}
              </option>
              <option value="altro">Altro</option>
            </select>
          </div>

          <!-- Selezione sottocategoria -->
          <div v-if="selectedCategoria" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Sottocategoria</label>
            <select 
              v-model="selectedSottocategoria"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleziona sottocategoria...</option>
              <option v-for="sottocat in sottocategorieDisponibili" :key="sottocat.id" :value="sottocat.id">
                {{ sottocat.nome }} - {{ sottocat.descrizione }}
              </option>
              <option v-if="selectedCategoria === 'altro'" value="altro">Altro</option>
            </select>
          </div>

          <!-- Dettagli lavoro selezionato -->
          <div v-if="selectedSottocategoria" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Dettagli Lavoro</h4>
            <div v-if="selectedCategoria !== 'altro'" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Categoria:</span>
                <span class="font-medium">{{ tipoLavoroSelezionato?.nome }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Sottocategoria:</span>
                <span class="font-medium">{{ sottocategoriaSelezionata?.nome }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Costo Standard:</span>
                <span class="font-medium">€{{ costoStandard }}/h</span>
              </div>
            </div>
            <div v-else class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ore Lavoro</label>
                <input 
                  v-model.number="oreManuale" 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="12"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Costo Orario (€)</label>
                <input 
                  v-model.number="costoOrarioManuale" 
                  type="number" 
                  step="0.5" 
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Pulsanti azione -->
          <div class="flex justify-end space-x-3">
            <button 
              @click="closeModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Annulla
            </button>
            <button 
              @click="confirmLavoro"
              type="button"
              :disabled="!selectedSottocategoria || (selectedCategoria === 'altro' && (oreManuale <= 0 || costoOrarioManuale <= 0))"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Conferma
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { getTipiLavori, getTipoLavoro, getSottocategorie, getCostoStandard } from '@/data/tipiLavori.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// Stato locale
const showModal = ref(false)
const selectedCategoria = ref('')
const selectedSottocategoria = ref('')
const lavoriSelezionati = ref([...props.modelValue])
const oreManuale = ref(0)
const costoOrarioManuale = ref(0)

// Dati tipi lavori
const tipiLavori = getTipiLavori()

// Computed properties
const tipoLavoroSelezionato = computed(() => 
  selectedCategoria.value ? getTipoLavoro(selectedCategoria.value) : null
)

const sottocategorieDisponibili = computed(() => 
  selectedCategoria.value && selectedCategoria.value !== 'altro' ? getSottocategorie(selectedCategoria.value) : []
)

const sottocategoriaSelezionata = computed(() => 
  selectedSottocategoria.value ? 
    sottocategorieDisponibili.value.find(s => s.id === selectedSottocategoria.value) : null
)

const costoStandard = computed(() => 
  selectedSottocategoria.value && selectedCategoria.value !== 'altro' ? 
    getCostoStandard(selectedCategoria.value, selectedSottocategoria.value) : 0
)

// Aggiungi lavoro
const addLavoro = () => {
  showModal.value = true
  selectedCategoria.value = ''
  selectedSottocategoria.value = ''
  oreManuale.value = 0
  costoOrarioManuale.value = 0
}

// Conferma selezione lavoro
const confirmLavoro = () => {
  if (!selectedSottocategoria.value) return

  const isAltro = selectedCategoria.value === 'altro'
  const nuovoLavoro = isAltro ? {
    tipo: 'altro',
    sottocategoria: 'altro',
    nomeTipo: 'Altro',
    nomeSottocategoria: 'Altro',
    ore: oreManuale.value,
    costoOrario: costoOrarioManuale.value,
    descrizione: 'Lavoro personalizzato'
  } : {
    tipo: selectedCategoria.value,
    sottocategoria: selectedSottocategoria.value,
    nomeTipo: tipoLavoroSelezionato.value.nome,
    nomeSottocategoria: sottocategoriaSelezionata.value.nome,
    ore: 8,
    costoOrario: costoStandard.value,
    descrizione: sottocategoriaSelezionata.value.descrizione
  }
  
  lavoriSelezionati.value.push(nuovoLavoro)
  closeModal()
  updateModel()
}

// Rimuovi lavoro
const removeLavoro = (index) => {
  lavoriSelezionati.value.splice(index, 1)
  updateModel()
}

// Chiudi modal
const closeModal = () => {
  showModal.value = false
  selectedCategoria.value = ''
  selectedSottocategoria.value = ''
}

// Aggiorna model
const updateModel = () => {
  emit('update:modelValue', lavoriSelezionati.value)
}

// Watch per sincronizzare con props
watch(() => props.modelValue, (newValue) => {
  lavoriSelezionati.value = [...newValue]
}, { deep: true })

// Calcola totale generale
const totaleGenerale = computed(() => {
  return lavoriSelezionati.value.reduce((tot, lav) => tot + (lav.ore * lav.costoOrario), 0)
})

// Esponi totale per uso esterno
defineExpose({
  totaleGenerale
})
</script> 