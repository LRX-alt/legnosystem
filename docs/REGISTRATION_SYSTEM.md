# 📋 Sistema di Richieste di Registrazione - Legnosystem

## 🎯 Panoramica

Il sistema di richieste di registrazione implementa un flusso di approvazione per i nuovi utenti che vogliono accedere al sistema Legnosystem. Invece di permettere registrazioni dirette, il sistema raccoglie le richieste e le sottopone all'approvazione degli amministratori.

## 🔄 Flusso del Processo

### 1. Richiesta di Registrazione
- L'utente accede alla pagina di registrazione
- Compila il form con i suoi dati:
  - Nome completo
  - Email aziendale
  - Ruolo desiderato
  - Dipartimento
  - Telefono (opzionale)
  - Posizione (opzionale)
- La richiesta viene salvata in Firestore con stato `pending`

### 2. Gestione Amministrativa
- Gli amministratori possono accedere alle richieste tramite il menu utente
- Visualizzano tutte le richieste con filtri per stato e ruolo
- Possono approvare o rifiutare ogni richiesta

### 3. Approvazione
- **Se approvata**: 
  - Viene creato l'account Firebase Auth
  - Viene creato il profilo Firestore
  - Viene inviata email di reset password per il primo accesso
  - La richiesta viene marcata come `approved`

- **Se rifiutata**:
  - La richiesta viene marcata come `rejected`
  - L'amministratore può inserire un motivo del rifiuto

## 🗂️ Struttura Dati

### Collection: `registrationRequests`

```javascript
{
  id: "auto-generated-id",
  name: "Mario Rossi",
  email: "mario.rossi@azienda.com",
  role: "employee", // employee, capo_cantiere, amministrativo, manager, admin
  department: "Produzione",
  phone: "+39 123 456 7890",
  position: "Operaio specializzato",
  requestedAt: Timestamp,
  status: "pending", // pending, approved, rejected
  notes: "",
  processedBy: "admin-uid",
  processedAt: Timestamp,
  createdUserId: "firebase-auth-uid" // Solo se approvata
}
```

## 🛠️ Componenti Implementati

### 1. Store Auth (`src/stores/auth.js`)
Nuove funzioni aggiunte:
- `requestRegistration(userData)` - Crea richiesta di registrazione
- `getRegistrationRequests()` - Ottiene tutte le richieste (solo admin)
- `approveRegistrationRequest(requestId, requestData)` - Approva richiesta
- `rejectRegistrationRequest(requestId, reason)` - Rifiuta richiesta
- `generateTemporaryPassword()` - Genera password temporanea

### 2. RegisterForm (`src/components/auth/RegisterForm.vue`)
- Modificato per utilizzare `requestRegistration` invece di `register`
- Aggiunto messaggio informativo sul processo di approvazione
- Aggiornati testi del bottone e messaggi

### 3. RegistrationRequests (`src/views/RegistrationRequests.vue`)
- Pagina di gestione per amministratori
- Lista delle richieste con filtri
- Modal di approvazione e rifiuto
- Visualizzazione stato e dettagli

### 4. Router (`src/router/index.js`)
- Aggiunta route `/registration-requests` per amministratori
- Protezione con permesso `isAdmin`

### 5. AppHeader (`src/components/layout/AppHeader.vue`)
- Aggiunto link "Richieste Registrazione" nel menu admin
- Navigazione diretta alla pagina di gestione

## 🔐 Sicurezza e Permessi

### Controlli di Accesso
- Solo utenti non autenticati possono fare richieste di registrazione
- Solo amministratori possono visualizzare e gestire le richieste
- Le funzioni di approvazione/rifiuto verificano il ruolo admin

### Validazioni
- Controllo email univoca (non può esistere richiesta duplicata)
- Validazione campi obbligatori nel form
- Verifica permessi a livello di store e route

## 📧 Flusso Email

### Approvazione Account
1. L'admin approva la richiesta
2. Viene creato l'account Firebase
3. Viene automaticamente inviata email di reset password
4. L'utente riceve l'email con link per impostare la password
5. L'utente può accedere al sistema

### Vantaggi del Sistema
- **Sicurezza**: Controllo totale sugli accessi
- **Tracciabilità**: Storico completo delle richieste
- **Flessibilità**: Possibilità di rifiutare con motivi
- **Automazione**: Creazione account e invio email automatici

## 🎨 UI/UX

### Design Coerente
- Interfaccia in linea con il design Legno System
- Icone e colori aziendali
- Responsive design per dispositivi mobili

### Esperienza Utente
- Processo chiaro e guidato
- Feedback immediato sulle azioni
- Stati di caricamento e conferme
- Messaggi informativi

## 🚀 Utilizzo per Amministratori

### Accedere alle Richieste
1. Fare login come amministratore
2. Cliccare sull'avatar in alto a destra
3. Selezionare "Richieste Registrazione"

### Gestire una Richiesta
1. Visualizzare i dettagli della richiesta
2. Cliccare "Approva" o "Rifiuta"
3. Confermare l'azione nel modal
4. Il sistema gestisce automaticamente il resto

### Filtri Disponibili
- **Per stato**: Tutti, In attesa, Approvati, Rifiutati
- **Per ruolo**: Tutti, Operaio, Capo Cantiere, Amministrativo, Manager, Admin

## 📊 Monitoraggio

### Metriche Utili
- Numero richieste in attesa
- Tempo medio di approvazione
- Tasso di approvazione/rifiuto
- Richieste per ruolo

### Log e Audit
- Tutte le azioni sono tracciate in Firestore
- Timestamp e utente che ha processato la richiesta
- Motivi di rifiuto registrati

## 🔮 Sviluppi Futuri

### Possibili Miglioramenti
- **Notifiche Push**: Alert per nuove richieste
- **Email Template**: Template personalizzati per approvazione/rifiuto
- **Workflow Avanzato**: Approvazione multi-livello
- **Dashboard Analytics**: Statistiche dettagliate
- **Bulk Actions**: Approvazione/rifiuto multiplo
- **Auto-approval**: Regole automatiche per alcuni ruoli

### Integrazioni
- **Sistema HR**: Sincronizzazione con database personale
- **Active Directory**: Integrazione LDAP/AD
- **Slack/Teams**: Notifiche su canali aziendali

## ✅ Test e Validazione

### Scenari di Test
1. ✅ Richiesta registrazione valida
2. ✅ Richiesta con email duplicata
3. ✅ Approvazione richiesta (admin)
4. ✅ Rifiuto richiesta con motivo
5. ✅ Accesso negato a non-admin
6. ✅ Navigazione e UI responsive

### Stati del Sistema
- ✅ Nessuna richiesta pendente
- ✅ Richieste multiple in attesa
- ✅ Filtri funzionanti
- ✅ Modal di conferma
- ✅ Gestione errori

---

**Implementato da:** Sistema Legnosystem.bio  
**Data:** Dicembre 2024  
**Versione:** 1.0.0 