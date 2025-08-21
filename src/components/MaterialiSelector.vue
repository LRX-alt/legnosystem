<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-medium text-gray-900">🧱 Materiali Utilizzati</h4>
      <button 
        @click="addMateriale" 
        type="button"
        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
      >
        + Aggiungi Materiale
      </button>
    </div>

    <!-- Lista materiali selezionati -->
    <div v-if="materialiSelezionati.length > 0" class="space-y-3">
      <div 
        v-for="(materiale, index) in materialiSelezionati" 
        :key="materiale.id"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              🧱
            </div>
            <div>
              <h5 class="font-medium text-gray-900">{{ materiale.nome }}</h5>
              <p class="text-sm text-gray-500">{{ materiale.categoria }}</p>
            </div>
          </div>
          <button 
            @click="removeMateriale(index)"
            type="button"
            class="text-red-500 hover:text-red-700"
            title="Rimuovi materiale"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
            <input 
              v-model.number="materiale.quantita" 
              type="number" 
              step="0.01" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoMateriale(index)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unità</label>
            <select 
              v-model="materiale.unita"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pz">Pezzi</option>
              <option value="mq">m²</option>
              <option value="mc">m³</option>
              <option value="kg">kg</option>
              <option value="l">Litri</option>
              <option value="m">Metri</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Unitario</label>
            <input 
              v-model.number="materiale.costoUnitario" 
              type="number" 
              step="0.01" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              @input="calcolaCostoMateriale(index)"
            />
          </div>
        </div>

        <div class="mt-3 p-3 bg-white rounded-md border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Costo Totale:</span>
            <span class="font-semibold text-blue-600">€{{ materiale.costoTotale.toFixed(2) }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ materiale.quantita }} {{ materiale.unita }} × €{{ materiale.costoUnitario }}/{{ materiale.unita }}
          </div>
        </div>
      </div>
    </div>

    <!-- Messaggio se nessun materiale -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-4xl mb-2">🧱</div>
      <p class="text-gray-500">Nessun materiale selezionato</p>
      <p class="text-sm text-gray-400">Clicca "Aggiungi Materiale" per iniziare</p>
    </div>

    <!-- Modal selezione materiale -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" @click="closeModal">
      <div class="relative top-4 mx-auto border w-full max-w-md shadow-lg rounded-md bg-white" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Seleziona Materiale</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Switch sorgente -->
          <div class="mb-3 flex items-center gap-2">
            <button
              type="button"
              @click="source = 'catalogo'"
              :class="['px-3 py-1 text-xs rounded-lg border', source === 'catalogo' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50']"
            >Catalogo</button>
            <button
              type="button"
              @click="source = 'magazzino'"
              :class="['px-3 py-1 text-xs rounded-lg border', source === 'magazzino' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50']"
            >Magazzino</button>
          </div>

          <!-- Ricerca materiali -->
          <div class="mb-4">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Cerca materiale..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Lista materiali disponibili -->
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div 
              v-for="materiale in materialiFiltrati" 
              :key="materiale.id"
              @click="selectMateriale(materiale)"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  🧱
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900 flex items-center gap-2">
                    <span>{{ materiale.nome }}</span>
                    <span v-if="materiale._source === 'magazzino'" class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Magazzino</span>
                  </div>
                  <div class="text-sm text-gray-500">{{ materiale.categoria }} • €{{ (materiale.prezzo ?? materiale.prezzoUnitario) }}/{{ materiale.unita }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="materialiFiltrati.length === 0" class="text-center py-4 text-gray-500">
            Nessun materiale trovato
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
  materiali: {
    type: Array,
    default: () => []
  },
  materialiMagazzino: {
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
const materialiSelezionati = ref([...props.modelValue])
const source = ref('catalogo') // 'catalogo' | 'magazzino'

// Materiali filtrati per ricerca e sorgente
const materialiFiltrati = computed(() => {
  const base = source.value === 'magazzino' ? props.materialiMagazzino : props.materiali
  const disponibili = base.filter(m => !materialiSelezionati.value.some(selected => selected.id === m.id))

  if (!searchTerm.value) return disponibili

  return disponibili.filter(m => {
    const categoria = (m.categoria || '').toLowerCase()
    const nome = (m.nome || '').toLowerCase()
    return nome.includes(searchTerm.value.toLowerCase()) || categoria.includes(searchTerm.value.toLowerCase())
  })
})

// Aggiungi materiale
const addMateriale = () => {
  showModal.value = true
  searchTerm.value = ''
}

// Seleziona materiale dal modal
const selectMateriale = (materiale) => {
  const nuovoMateriale = {
    id: materiale.id,
    nome: materiale.nome,
    categoria: materiale.categoria,
    prezzo: materiale.prezzo ?? materiale.prezzoUnitario,
    quantita: 1, // Default 1
    unita: materiale.unita || 'pz',
    costoUnitario: materiale.prezzo ?? materiale.prezzoUnitario,
    costoTotale: materiale.prezzo ?? materiale.prezzoUnitario,
    _source: materiale._source || (source.value === 'magazzino' ? 'magazzino' : 'catalogo')
  }
  
  materialiSelezionati.value.push(nuovoMateriale)
  closeModal()
  updateModel()
}

// Rimuovi materiale
const removeMateriale = (index) => {
  materialiSelezionati.value.splice(index, 1)
  updateModel()
}

// Calcola costo materiale
const calcolaCostoMateriale = (index) => {
  const materiale = materialiSelezionati.value[index]
  materiale.costoTotale = (materiale.quantita || 0) * (materiale.costoUnitario || 0)
  updateModel()
}

// Chiudi modal
const closeModal = () => {
  showModal.value = false
  searchTerm.value = ''
}

// Aggiorna model
const updateModel = () => {
  emit('update:modelValue', materialiSelezionati.value)
}

// Watch per sincronizzare con props
watch(() => props.modelValue, (newValue) => {
  materialiSelezionati.value = [...newValue]
}, { deep: true })

// Calcola totale generale
const totaleGenerale = computed(() => {
  return materialiSelezionati.value.reduce((tot, mat) => tot + mat.costoTotale, 0)
})

// Esponi totale per uso esterno
defineExpose({
  totaleGenerale
})
</script> 