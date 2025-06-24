<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            🔄 Migrazione localStorage → Firestore
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Migra i dati locali verso il cloud per backup e sincronizzazione
          </p>
        </div>
        <button
          @click="refreshAnalysis"
          :disabled="loading"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          🔄 Aggiorna
        </button>
      </div>
    </div>

    <!-- Analisi dati -->
    <div class="px-6 py-4">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-sm text-gray-600 mt-2">Analisi in corso...</p>
      </div>

      <div v-else-if="analysis">
        <!-- Statistiche -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ analysis.attachments.count }}</div>
            <div class="text-sm text-blue-800">Allegati Cantieri</div>
            <div class="text-xs text-blue-600">{{ analysis.attachments.cantieri || 0 }} cantieri</div>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ analysis.materialiCantieri.count }}</div>
            <div class="text-sm text-green-800">Materiali</div>
            <div class="text-xs text-green-600">{{ analysis.materialiCantieri.cantieri || 0 }} cantieri</div>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ analysis.progressHistory.count }}</div>
            <div class="text-sm text-purple-800">Progressi</div>
            <div class="text-xs text-purple-600">{{ analysis.progressHistory.cantieri || 0 }} cantieri</div>
          </div>
          
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ analysis.materialAttachments.count }}</div>
            <div class="text-sm text-orange-800">Allegati Materiali</div>
            <div class="text-xs text-orange-600">{{ analysis.materialAttachments.materiali || 0 }} materiali</div>
          </div>
        </div>

        <!-- Stato migrazione -->
        <div v-if="analysis.total === 0" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <span class="text-green-500 mr-2">✅</span>
            <span class="text-sm font-medium text-green-800">
              Sistema già aggiornato! Nessun dato localStorage da migrare.
            </span>
          </div>
        </div>

        <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <span class="text-yellow-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <h4 class="text-sm font-medium text-yellow-800 mb-2">
                {{ analysis.total }} elementi in localStorage
              </h4>
              <p class="text-sm text-yellow-700 mb-3">
                È consigliabile migrare questi dati a Firestore per:
              </p>
              <ul class="text-sm text-yellow-700 space-y-1 mb-4">
                <li>• ☁️ Backup automatico nel cloud</li>
                <li>• 🔄 Sincronizzazione tra dispositivi</li>
                <li>• 📊 Analytics e reporting avanzati</li>
                <li>• 🛡️ Maggiore sicurezza dei dati</li>
              </ul>
              
              <!-- Opzioni migrazione -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  @click="startMigration(false)"
                  :disabled="migrating"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  🚀 Migra Tutto a Firestore
                </button>
                
                <button
                  @click="startMigration(true)"
                  :disabled="migrating"
                  class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  📋 Anteprima (Dry Run)
                </button>
                
                <button
                  @click="showDetailedAnalysis = !showDetailedAnalysis"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                >
                  📊 {{ showDetailedAnalysis ? 'Nascondi' : 'Mostra' }} Dettagli
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analisi dettagliata -->
        <div v-if="showDetailedAnalysis && analysis.total > 0" class="space-y-4 mb-6">
          <!-- Allegati cantieri -->
          <div v-if="analysis.attachments.count > 0" class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">📎 Allegati Cantieri</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div v-for="detail in analysis.attachments.details" :key="detail.cantiereId" 
                   class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Cantiere {{ detail.cantiereId.substring(0, 8) }}...</span>
                <span class="font-medium">{{ detail.files }} file</span>
              </div>
            </div>
          </div>

          <!-- Materiali cantieri -->
          <div v-if="analysis.materialiCantieri.count > 0" class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">📦 Materiali Cantieri</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div v-for="detail in analysis.materialiCantieri.details" :key="detail.cantiereId" 
                   class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Cantiere {{ detail.cantiereId.substring(0, 8) }}...</span>
                <span class="font-medium">{{ detail.materiali }} materiali</span>
              </div>
            </div>
          </div>

          <!-- Storico progresso -->
          <div v-if="analysis.progressHistory.count > 0" class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">📈 Storico Progresso</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div v-for="detail in analysis.progressHistory.details" :key="detail.cantiereId" 
                   class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Cantiere {{ detail.cantiereId.substring(0, 8) }}...</span>
                <span class="font-medium">{{ detail.updates }} aggiornamenti</span>
              </div>
            </div>
          </div>

          <!-- Allegati materiali -->
          <div v-if="analysis.materialAttachments.count > 0" class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">🧱 Allegati Materiali</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div v-for="detail in analysis.materialAttachments.details" :key="detail.materialeId" 
                   class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Materiale {{ detail.materialeId.substring(0, 8) }}...</span>
                <span class="font-medium">{{ detail.files }} file</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progresso migrazione -->
    <div v-if="migrating" class="px-6 py-4 border-t border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">
          {{ isDryRun ? '📋 Anteprima Migrazione' : '🚀 Migrazione in Corso' }}
        </h4>
        <span class="text-sm text-gray-600">
          {{ migrationProgress.current }}/{{ migrationProgress.total }}
        </span>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: migrationProgress.percentage + '%' }"
        ></div>
      </div>
      
      <p class="text-sm text-gray-600">{{ migrationProgress.currentOperation }}</p>
    </div>

    <!-- Log migrazione -->
    <div v-if="migrationResult" class="px-6 py-4 border-t border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">
          📋 Risultato Migrazione
        </h4>
        <button
          @click="showMigrationLog = !showMigrationLog"
          class="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          {{ showMigrationLog ? 'Nascondi' : 'Mostra' }} Log
        </button>
      </div>

      <!-- Sommario risultati -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-green-50 rounded-lg p-3 text-center">
          <div class="text-lg font-bold text-green-600">{{ migrationResult.totalMigrated }}</div>
          <div class="text-sm text-green-800">Elementi Migrati</div>
        </div>
        <div class="bg-red-50 rounded-lg p-3 text-center">
          <div class="text-lg font-bold text-red-600">{{ migrationResult.totalErrors }}</div>
          <div class="text-sm text-red-800">Errori</div>
        </div>
      </div>

      <!-- Stato finale -->
      <div v-if="migrationResult.success" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div class="flex items-center">
          <span class="text-green-500 mr-2">✅</span>
          <span class="text-sm font-medium text-green-800">
            Migrazione completata con successo!
          </span>
        </div>
      </div>

      <div v-else class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div class="flex items-center">
          <span class="text-red-500 mr-2">❌</span>
          <span class="text-sm font-medium text-red-800">
            Migrazione completata con errori
          </span>
        </div>
      </div>

      <!-- Log dettagliato -->
      <div v-if="showMigrationLog" class="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
        <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ migrationResult.log.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createMigrationManager } from '@/utils/migrationManager'

// State
const migrationManager = createMigrationManager()
const loading = ref(false)
const migrating = ref(false)
const isDryRun = ref(false)
const analysis = ref(null)
const migrationResult = ref(null)
const showDetailedAnalysis = ref(false)
const showMigrationLog = ref(false)

const migrationProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  currentOperation: ''
})

// Methods
const refreshAnalysis = async () => {
  loading.value = true
  try {
    analysis.value = migrationManager.analyzeLocalStorageData()
  } catch (error) {
    console.error('Errore analisi:', error)
  } finally {
    loading.value = false
  }
}

const startMigration = async (dryRun = false) => {
  if (!analysis.value || analysis.value.total === 0) {
    return
  }

  migrating.value = true
  isDryRun.value = dryRun
  migrationResult.value = null
  showMigrationLog.value = false

  // Reset progress
  migrationProgress.value = {
    current: 0,
    total: analysis.value.total,
    percentage: 0,
    currentOperation: 'Inizializzazione...'
  }

  try {
    const result = await migrationManager.migrateAllData({
      dryRun,
      batchSize: 25,
      onProgress: (operation, progressData) => {
        migrationProgress.value.current += progressData.migrated + progressData.errors
        migrationProgress.value.percentage = Math.round(
          (migrationProgress.value.current / migrationProgress.value.total) * 100
        )
        
        const operationNames = {
          attachments: 'Allegati cantieri',
          materialiCantieri: 'Materiali cantieri',
          progressHistory: 'Storico progresso',
          materialAttachments: 'Allegati materiali'
        }
        
        migrationProgress.value.currentOperation = `${operationNames[operation] || operation}...`
      }
    })

    migrationResult.value = result
    
    // Aggiorna analisi dopo migrazione riuscita
    if (!dryRun && result.success) {
      setTimeout(() => {
        refreshAnalysis()
      }, 1000)
    }

  } catch (error) {
    console.error('Errore migrazione:', error)
    migrationResult.value = {
      totalMigrated: 0,
      totalErrors: 1,
      success: false,
      log: [`Errore fatale: ${error.message}`]
    }
  } finally {
    migrating.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshAnalysis()
})
</script> 