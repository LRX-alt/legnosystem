# 🌿 Legnosystem.bio - Sistema di Gestione Aziendale

Sistema di gestione completo per **Legnosystem.bio**, specializzata nella costruzione e posa di tetti in legno.

## 🎯 Funzionalità

### ✅ **CORE FEATURES MEMORIZZATE:**

1. **📦 Gestione Magazzino & Inventario**
   - Catalogazione materiali (travi, tavole, chiodi, viti, isolanti)
   - Tracking quantità e movimenti
   - Gestione fornitori e costi

2. **📊 Gestione Scorte con Alert**
   - Livelli minimi di riordino
   - Storico ordini e consumi
   - Previsioni fabbisogno

3. **♻️ Gestione Sfridi dal Cantiere**
   - Registrazione sfridi di ritorno
   - Classificazione e riutilizzo
   - Valorizzazione economica

4. **👥 Gestione Personale & Timesheet**
   - Anagrafica dipendenti
   - Registrazione orari di lavoro
   - Associazione ore ai cantieri

5. **🏗️ Gestione Cantieri**
   - Anagrafica cantieri con avanzamento
   - Tracking materiali utilizzati
   - Calcolo costi totali

6. **📈 Dashboard & Analytics**
   - KPI principali
   - Grafici consumi e produttività
   - Report redditività

7. **👤 Gestione Clienti & Preventivi**
   - Anagrafica clienti
   - Sistema preventivazione
   - Gestione pagamenti

8. **📱 App Mobile/PWA**
   - Registrazione ore da cantiere
   - Upload foto progresso
   - Controllo scorte mobile

9. **🔔 Sistema Notifiche**
   - Alert scorte minime
   - Promemoria scadenze
   - Notifiche completamento fasi

10. **🔥 Integrazione Firebase**
    - Database cloud
    - Autenticazione
    - Sincronizzazione real-time

## 🎨 Design System

### Palette Colori
- **Primary**: Marrone legno (#9d6b3e) - Rappresenta il legno naturale
- **Accent**: Verde natura (#369e5d) - Rappresenta sostenibilità
- **Wood**: Variazioni legno chiaro/scuro

### Tipografia
- **Display**: Poppins (Headers)
- **Body**: Inter (Testo)

## 🛠️ Stack Tecnologico

- **Frontend**: Vue.js 3 + Composition API
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **UI**: Tailwind CSS + HeadlessUI
- **Charts**: Chart.js + Vue-ChartJS
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Deploy**: Vercel
- **PWA**: Service Workers per uso offline

## 🚀 Sviluppo

```bash
# Installa dipendenze
npm install

# Avvia development server
npm run dev

# Build per produzione
npm run build

# Preview build
npm run preview
```

## 📁 Struttura Progetto

```
src/
├── components/     # Componenti riutilizzabili
├── views/         # Pagine principali  
├── stores/        # Store Pinia
├── composables/   # Logica riutilizzabile
├── utils/         # Utility functions
├── types/         # TypeScript types
└── assets/        # Assets statici
```

## 🎯 Roadmap

- [x] Setup progetto e branding
- [x] Dashboard principale **v1.1.0**
- [x] Gestione magazzino **v1.1.0**
- [x] Gestione cantieri **v1.2.0**
- [x] Gestione personale **v1.2.0**
- [x] Gestione clienti **v1.2.0** 
- [x] Gestione preventivi **v1.2.0**
- [x] Analytics aziendali **v1.2.0**
- [x] **Ottimizzazioni Mobile-First** ✨
- [ ] Sistema sfridi
- [ ] PWA Mobile
- [ ] Integrazione Firebase

## 📱 Mobile-First Design

**Perfettamente ottimizzato per smartphone** - priorità assoluta per Legnosystem.bio:

### ✅ **Touch-Friendly Features:**
- **Touch targets** minimi 44px per accessibilità
- **Card layout** mobile per sostituire tabelle desktop
- **Modal full-screen** responsive per smartphone
- **Form ottimizzati** con font-size 16px (no zoom iOS)
- **Feedback tattile** su tap con scale animation
- **Safe area** support per iPhone con notch

### ✅ **Layout Responsivi:**
- **Breakpoint lg:** Tabelle desktop vs Card mobile
- **Grid responsive** con gap ottimizzati
- **Stack layout** per modal su mobile
- **Overflow gestito** con scroll touch-friendly
- **Controlli full-width** su mobile

### ✅ **Accessibilità Mobile:**
- **Focus visibile** per navigazione da tastiera
- **Reduced motion** support per sensibilità
- **Theme color** personalizzato (#9d6b3e)
- **Apple touch icons** configurati
- **Viewport ottimizzato** con user-scalable=no

---

**Sviluppato per Legnosystem.bio** 🌿  
**v1.2.0** - Ideato e sviluppato da **Di Furio Loris**
