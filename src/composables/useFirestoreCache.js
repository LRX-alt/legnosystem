import { ref } from 'vue'

const cache = new Map()
const cacheTimestamps = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti

export const useFirestoreCache = () => {
  const loading = ref(false)

  /**
   * Verifica se i dati in cache sono ancora validi
   */
  const isCacheValid = (key) => {
    const timestamp = cacheTimestamps.get(key)
    if (!timestamp) return false
    return Date.now() - timestamp < CACHE_DURATION
  }

  /**
   * Ottiene i dati dalla cache o esegue la funzione di fetch
   */
  const getWithCache = async (key, fetchFn) => {
    loading.value = true

    try {
      // Se abbiamo dati validi in cache, li restituiamo
      if (cache.has(key) && isCacheValid(key)) {
        console.log(`🎯 Cache hit per ${key}`)
        return cache.get(key)
      }

      // Altrimenti eseguiamo la funzione di fetch
      console.log(`🔄 Cache miss per ${key}, fetching...`)
      const data = await fetchFn()
      
      // Salviamo i dati in cache
      cache.set(key, data)
      cacheTimestamps.set(key, Date.now())
      
      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Invalida una specifica chiave nella cache
   */
  const invalidateCache = (key) => {
    console.log(`🗑️ Invalidando cache per ${key}`)
    cache.delete(key)
    cacheTimestamps.delete(key)
  }

  /**
   * Invalida tutte le chiavi che iniziano con il prefisso specificato
   */
  const invalidateCacheByPrefix = (prefix) => {
    console.log(`🗑️ Invalidando cache con prefisso ${prefix}`)
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key)
        cacheTimestamps.delete(key)
      }
    }
  }

  /**
   * Invalida l'intera cache
   */
  const clearCache = () => {
    console.log('🗑️ Pulizia completa cache')
    cache.clear()
    cacheTimestamps.clear()
  }

  /**
   * Aggiorna i dati in cache per una specifica chiave
   */
  const updateCache = (key, updateFn) => {
    if (!cache.has(key)) return

    const currentData = cache.get(key)
    const updatedData = updateFn(currentData)
    
    cache.set(key, updatedData)
    cacheTimestamps.set(key, Date.now())
  }

  return {
    loading,
    getWithCache,
    invalidateCache,
    invalidateCacheByPrefix,
    clearCache,
    updateCache
  }
} 