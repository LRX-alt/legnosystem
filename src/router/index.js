import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 🔐 Auth Routes (pubbliche)
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/Auth.vue'),
      meta: { 
        title: 'Accedi - Legnosystem.bio',
        requiresGuest: true // Solo per utenti non autenticati
      }
    },
    {
      path: '/login',
      redirect: '/auth'
    },
    {
      path: '/register',
      redirect: '/auth'
    },

    // 🏠 Dashboard (rotta principale protetta)
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { 
        title: 'Dashboard - Legnosystem.bio',
        requiresAuth: true 
      }
    },
    // 📦 Magazzino e Scorte
    {
      path: '/magazzino',
      name: 'magazzino',
      component: () => import('../views/Magazzino.vue'),
      meta: { 
        title: 'Magazzino - Legnosystem.bio',
        requiresAuth: true
      }
    },
    {
      path: '/scorte',
      name: 'scorte', 
      component: () => import('../views/Scorte.vue'),
      meta: { 
        title: 'Gestione Scorte - Legnosystem.bio',
        requiresAuth: true
      }
    },

    // 🏗️ Cantieri
    {
      path: '/cantieri',
      name: 'cantieri',
      component: () => import('../views/Cantieri.vue'),
      meta: { 
        title: 'Gestione Cantieri - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['canManageCantieri']
      }
    },
    {
      path: '/cantieri/:id/giornale',
      name: 'giornale-cantiere',
      component: () => import('../views/GiornaleCantiere.vue'),
      meta: { 
        title: 'Giornale di Cantiere - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['canManageCantieri']
      }
    },

    // 🏢 Fornitori e Mezzi
    {
      path: '/fornitori',
      name: 'fornitori',
      component: () => import('../views/Fornitori.vue'),
      meta: { 
        title: 'Gestione Fornitori - Legnosystem.bio',
        requiresAuth: true
      }
    },
    {
      path: '/mezzi',
      name: 'mezzi',
      component: () => import('../views/Mezzi.vue'),
      meta: { 
        title: 'Gestione Mezzi - Legnosystem.bio',
        requiresAuth: true
      }
    },

    // 📅 Calendario e Personale
    {
      path: '/calendario',
      name: 'calendario',
      component: () => import('../views/Calendario.vue'),
      meta: { 
        title: 'Calendario & Planning - Legnosystem.bio',
        requiresAuth: true
      }
    },
    {
      path: '/personale',
      name: 'personale',
      component: () => import('../views/Personale.vue'),
      meta: { 
        title: 'Gestione Personale - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['canManagePersonnel']
      }
    },

    // 👥 Clienti e Business
    {
      path: '/clienti',
      name: 'clienti',
      component: () => import('../views/Clienti.vue'),
      meta: { 
        title: 'Gestione Clienti - Legnosystem.bio',
        requiresAuth: true
      }
    },

    // 📊 Analytics
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/Analytics.vue'),
      meta: { 
        title: 'Analytics - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['canViewFinancials']
      }
    },
    {
      path: '/analisi-costi',
      name: 'analisi-costi',
      component: () => import('../views/AnalisiCosti.vue'),
      meta: { 
        title: 'Analisi Costi - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['canViewFinancials']
      }
    },

    // 🔧 Admin Tools
    {
      path: '/registration-requests',
      name: 'registrationRequests',
      component: () => import('../views/RegistrationRequests.vue'),
      meta: { 
        title: 'Richieste di Registrazione - Legnosystem.bio',
        requiresAuth: true,
        permissions: ['isAdmin']
      }
    }
  ]
})

// 🔐 Guard di autenticazione e permessi
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Aggiorna il titolo della pagina
  document.title = to.meta.title || 'Legnosystem.bio'
  
  // Aspetta che l'autenticazione sia inizializzata
  if (!authStore.authInitialized) {
    await authStore.initializeAuth()
  }
  
  // Controlla se la rotta richiede autenticazione
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Utente non autenticato, reindirizza al login
    next('/auth')
    return
  }
  
  // Controlla se la rotta è solo per ospiti (non autenticati)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Utente già autenticato, reindirizza alla dashboard
    next('/')
    return
  }
  
  // Controlla i permessi specifici
  if (to.meta.permissions && authStore.isAuthenticated) {
    const hasPermission = to.meta.permissions.every(permission => {
      return authStore[permission] || false
    })
    
    if (!hasPermission) {
      // Utente non ha i permessi necessari
      console.warn(`Accesso negato a ${to.path}: permessi insufficienti`)
      // Reindirizza alla dashboard con messaggio di errore
      next('/')
      return
    }
  }
  
  next()
})

export default router 