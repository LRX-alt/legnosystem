import { ref, computed } from 'vue'
import { 
  logEvent, 
  setUserId, 
  setUserProperties,
  setCurrentScreen,
  setAnalyticsCollectionEnabled
} from 'firebase/analytics'
import { analytics } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

export const useFirebaseAnalytics = () => {
  const authStore = useAuthStore()
  const toast = useToast()
  
  // State
  const isEnabled = ref(true)
  const debugMode = ref(import.meta.env.MODE === 'development')
  const sessionStartTime = ref(Date.now())
  const eventsQueue = ref([])
  
  // Computed
  const isAnalyticsAvailable = computed(() => {
    return analytics !== null && isEnabled.value
  })

  /**
   * Configura Analytics per l'utente corrente
   */
  const initializeUserAnalytics = async (user) => {
    if (!isAnalyticsAvailable.value) return
    
    try {
      // Imposta user ID
      await setUserId(analytics, user.uid)
      
      // Imposta proprietà utente
      await setUserProperties(analytics, {
        user_role: user.role || 'unknown',
        user_department: user.department || 'unknown',
        registration_date: user.createdAt || new Date().toISOString(),
        is_active: user.isActive ? 'true' : 'false'
      })
      
      // Evento di login
      await logUserLogin(user)
      
      if (debugMode.value) {
        console.log('✅ Analytics inizializzato per utente:', user.uid)
      }
    } catch (error) {
      console.error('Errore inizializzazione Analytics:', error)
    }
  }

  /**
   * Abilita/disabilita raccolta dati Analytics
   */
  const setAnalyticsEnabled = async (enabled) => {
    if (!analytics) return
    
    try {
      await setAnalyticsCollectionEnabled(analytics, enabled)
      isEnabled.value = enabled
      
      if (debugMode.value) {
        console.log(`📊 Analytics ${enabled ? 'abilitato' : 'disabilitato'}`)
      }
    } catch (error) {
      console.error('Errore configurazione Analytics:', error)
    }
  }

  /**
   * Imposta schermata corrente
   */
  const trackPageView = async (pageName, parameters = {}) => {
    if (!isAnalyticsAvailable.value) return
    
    try {
      await setCurrentScreen(analytics, pageName)
      await logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        ...parameters
      })
      
      if (debugMode.value) {
        console.log('📄 Page view:', pageName, parameters)
      }
    } catch (error) {
      console.error('Errore tracking page view:', error)
    }
  }

  /**
   * Eventi di autenticazione
   */
  const logUserLogin = async (user) => {
    return await trackEvent('login', {
      user_id: user.uid,
      user_role: user.role,
      login_method: 'email'
    })
  }

  const logUserLogout = async () => {
    return await trackEvent('logout', {
      session_duration: Date.now() - sessionStartTime.value
    })
  }

  const logUserRegistration = async (user) => {
    return await trackEvent('sign_up', {
      user_id: user.uid,
      user_role: user.role,
      registration_method: 'email'
    })
  }

  /**
   * Eventi Cantieri
   */
  const logCantiereCreated = async (cantiere) => {
    return await trackEvent('cantiere_created', {
      cantiere_id: cantiere.id,
      cantiere_valore: cantiere.valore,
      cliente_id: cantiere.clienteId,
      stato: cantiere.stato,
      categoria: cantiere.categoria || 'standard'
    })
  }

  const logCantiereUpdated = async (cantiere, changes) => {
    return await trackEvent('cantiere_updated', {
      cantiere_id: cantiere.id,
      changed_fields: Object.keys(changes).join(','),
      new_stato: cantiere.stato,
      valore: cantiere.valore
    })
  }

  const logCantiereCompleted = async (cantiere) => {
    return await trackEvent('cantiere_completed', {
      cantiere_id: cantiere.id,
      valore_finale: cantiere.valore,
      durata_giorni: cantiere.durataGiorni,
      cliente_id: cantiere.clienteId,
      profitto: cantiere.profitto || 0
    })
  }

  const logCantiereDeleted = async (cantiereId, reason = 'user_action') => {
    return await trackEvent('cantiere_deleted', {
      cantiere_id: cantiereId,
      deletion_reason: reason
    })
  }

  /**
   * Eventi Materiali
   */
  const logMaterialeAdded = async (materiale, cantiereId) => {
    return await trackEvent('materiale_added_to_cantiere', {
      materiale_id: materiale.id,
      cantiere_id: cantiereId,
      categoria: materiale.categoria,
      quantita: materiale.quantitaRichiesta,
      valore_unitario: materiale.prezzoUnitario || 0
    })
  }

  const logMaterialeUsed = async (materiale, quantitaUsata) => {
    return await trackEvent('materiale_used', {
      materiale_id: materiale.id,
      quantita_usata: quantitaUsata,
      categoria: materiale.categoria,
      valore_totale: (materiale.prezzoUnitario || 0) * quantitaUsata
    })
  }

  /**
   * Eventi File e Allegati
   */
  const logFileUploaded = async (file, context) => {
    return await trackEvent('file_uploaded', {
      file_type: file.type,
      file_size: file.size,
      context_type: context.type, // 'cantiere', 'materiale', etc.
      context_id: context.id
    })
  }

  const logFileDownloaded = async (file, context) => {
    return await trackEvent('file_downloaded', {
      file_type: file.type,
      file_size: file.size,
      context_type: context.type,
      context_id: context.id
    })
  }

  /**
   * Eventi Business Intelligence
   */
  const logReportGenerated = async (reportType, parameters = {}) => {
    return await trackEvent('report_generated', {
      report_type: reportType,
      date_range: parameters.dateRange || 'month',
      filters_applied: Object.keys(parameters).length,
      ...parameters
    })
  }

  const logSearchPerformed = async (searchTerm, resultCount, context) => {
    return await trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
      search_context: context // 'cantieri', 'clienti', etc.
    })
  }

  const logDashboardViewed = async (widgets) => {
    return await trackEvent('dashboard_viewed', {
      widgets_count: widgets.length,
      widgets_list: widgets.join(',')
    })
  }

  /**
   * Eventi Performance
   */
  const logPerformanceMetric = async (metric, value, context = {}) => {
    return await trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      ...context
    })
  }

  const logErrorOccurred = async (error, context = {}) => {
    return await trackEvent('error_occurred', {
      error_message: error.message,
      error_code: error.code || 'unknown',
      error_context: context.component || 'unknown',
      page: window.location.pathname
    })
  }



  const logFatturaGenerated = async (fattura) => {
    return await trackEvent('fattura_generated', {
      fattura_id: fattura.id,
      cliente_id: fattura.clienteId,
      importo: fattura.importo,
      tipo_fattura: fattura.tipo
    })
  }

  /**
   * Metodo generico per eventi personalizzati
   */
  const trackEvent = async (eventName, parameters = {}) => {
    if (!isAnalyticsAvailable.value) {
      if (debugMode.value) {
        console.log('📊 Analytics non disponibile, evento saltato:', eventName)
      }
      return
    }

    try {
      // Aggiungi metadata standard
      const eventData = {
        timestamp: Date.now(),
        user_id: authStore.user?.uid,
        user_role: authStore.userProfile?.role,
        page: window.location.pathname,
        ...parameters
      }

      // Rimuovi valori null/undefined
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === null || eventData[key] === undefined) {
          delete eventData[key]
        }
      })

      await logEvent(analytics, eventName, eventData)
      
      // Aggiungi alla coda per debug
      if (debugMode.value) {
        eventsQueue.value.unshift({
          event: eventName,
          parameters: eventData,
          timestamp: new Date().toISOString()
        })
        
        // Mantieni solo gli ultimi 50 eventi
        if (eventsQueue.value.length > 50) {
          eventsQueue.value = eventsQueue.value.slice(0, 50)
        }
        
        console.log('📊 Analytics evento:', eventName, eventData)
      }
    } catch (error) {
      console.error('Errore tracking evento:', error)
    }
  }

  /**
   * Conversioni e Goal
   */
  const trackConversion = async (goalName, value = 0, currency = 'EUR') => {
    return await trackEvent('conversion', {
      goal_name: goalName,
      value: value,
      currency: currency
    })
  }

  const trackCantiereConversion = async (cantiere) => {
    return await trackConversion('cantiere_completion', cantiere.valore, 'EUR')
  }

  /**
   * Batch tracking per ottimizzazione
   */
  const trackBatch = async (events) => {
    if (!Array.isArray(events)) return
    
    for (const event of events) {
      await trackEvent(event.name, event.parameters)
    }
  }

  /**
   * Utilities per Analytics
   */
  const getSessionId = () => {
    return `session_${sessionStartTime.value}_${authStore.user?.uid || 'anonymous'}`
  }

  const getEventsQueue = () => {
    return [...eventsQueue.value]
  }

  const clearEventsQueue = () => {
    eventsQueue.value = []
  }

  /**
   * Export dati Analytics per report
   */
  const exportAnalyticsData = () => {
    return {
      sessionId: getSessionId(),
      sessionDuration: Date.now() - sessionStartTime.value,
      eventsCount: eventsQueue.value.length,
      userId: authStore.user?.uid,
      userRole: authStore.userProfile?.role,
      lastEvents: eventsQueue.value.slice(0, 10)
    }
  }

  /**
   * Configurazione GDPR
   */
  const requestAnalyticsConsent = async () => {
    // In un'app reale, mostrerei un banner GDPR
    const consent = confirm('Accetti la raccolta dati per migliorare l\'esperienza?')
    await setAnalyticsEnabled(consent)
    
    if (consent) {
      toast.success('Raccolta dati abilitata', '📊 Analytics')
    } else {
      toast.info('Raccolta dati disabilitata', '🔒 Privacy')
    }
    
    return consent
  }

  // Auto-track page views su route change
  const startAutoTracking = () => {
    if (typeof window !== 'undefined') {
      // Track initial page
      trackPageView(window.location.pathname)
      
      // Listen for route changes (se using Vue Router)
      window.addEventListener('popstate', () => {
        trackPageView(window.location.pathname)
      })
    }
  }

  // Hook per Vue Router (se disponibile)
  const createRouterHook = () => {
    return (to, from) => {
      trackPageView(to.path, {
        from_page: from?.path,
        route_name: to.name
      })
    }
  }

  return {
    // State
    isEnabled,
    debugMode,
    isAnalyticsAvailable,
    eventsQueue: computed(() => eventsQueue.value),

    // Configuration
    initializeUserAnalytics,
    setAnalyticsEnabled,
    requestAnalyticsConsent,

    // Core tracking
    trackEvent,
    trackPageView,
    trackConversion,
    trackBatch,

    // Authentication events
    logUserLogin,
    logUserLogout,
    logUserRegistration,

    // Business events
    logCantiereCreated,
    logCantiereUpdated,
    logCantiereCompleted,
    logCantiereDeleted,
    logMaterialeAdded,
    logMaterialeUsed,
    logFileUploaded,
    logFileDownloaded,
    logReportGenerated,
    logSearchPerformed,
    logDashboardViewed,

    logFatturaGenerated,

    // Performance & Error tracking
    logPerformanceMetric,
    logErrorOccurred,

    // Conversions
    trackCantiereConversion,

    // Utilities
    getSessionId,
    getEventsQueue,
    clearEventsQueue,
    exportAnalyticsData,
    startAutoTracking,
    createRouterHook
  }
} 