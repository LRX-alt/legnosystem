import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Dashboard - Legnosystem.bio' }
    },
    {
      path: '/magazzino',
      name: 'magazzino',
      component: () => import('../views/Magazzino.vue'),
      meta: { title: 'Magazzino - Legnosystem.bio' }
    },
    {
      path: '/scorte',
      name: 'scorte', 
      component: () => import('../views/Scorte.vue'),
      meta: { title: 'Gestione Scorte - Legnosystem.bio' }
    },
    {
      path: '/sfridi',
      name: 'sfridi',
      component: () => import('../views/Sfridi.vue'),
      meta: { title: 'Gestione Sfridi - Legnosystem.bio' }
    },
    {
      path: '/cantieri',
      name: 'cantieri',
      component: () => import('../views/Cantieri.vue'),
      meta: { title: 'Gestione Cantieri - Legnosystem.bio' }
    },
    {
      path: '/cantieri/:id/giornale',
      name: 'giornale-cantiere',
      component: () => import('../views/GiornaleCantiere.vue'),
      meta: { title: 'Giornale di Cantiere - Legnosystem.bio' }
    },
    {
      path: '/fornitori',
      name: 'fornitori',
      component: () => import('../views/Fornitori.vue'),
      meta: { title: 'Gestione Fornitori - Legnosystem.bio' }
    },
    {
      path: '/mezzi',
      name: 'mezzi',
      component: () => import('../views/Mezzi.vue'),
      meta: { title: 'Gestione Mezzi - Legnosystem.bio' }
    },
    {
      path: '/calendario',
      name: 'calendario',
      component: () => import('../views/Calendario.vue'),
      meta: { title: 'Calendario & Planning - Legnosystem.bio' }
    },
    {
      path: '/fatturazione',
      name: 'fatturazione',
      component: () => import('../views/Fatturazione.vue'),
      meta: { title: 'Fatturazione & Admin - Legnosystem.bio' }
    },
    {
      path: '/personale',
      name: 'personale',
      component: () => import('../views/Personale.vue'),
      meta: { title: 'Gestione Personale - Legnosystem.bio' }
    },
    {
      path: '/clienti',
      name: 'clienti',
      component: () => import('../views/Clienti.vue'),
      meta: { title: 'Gestione Clienti - Legnosystem.bio' }
    },
    {
      path: '/preventivi',
      name: 'preventivi',
      component: () => import('../views/Preventivi.vue'),
      meta: { title: 'Preventivi - Legnosystem.bio' }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/Analytics.vue'),
      meta: { title: 'Analytics - Legnosystem.bio' }
    }
  ]
})

// Aggiorna il titolo della pagina
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Legnosystem.bio'
  next()
})

export default router 