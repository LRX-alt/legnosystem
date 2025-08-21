# 🔥 Configurazione Firebase per Legnosystem.bio

## 📋 **Cosa dovete fare VOI**

Questa guida vi accompagna passo-passo nella configurazione di Firebase sul **vostro account Google**.

### **⚠️ IMPORTANTE**: 
- **Non posso configurare Firebase sul vostro account** - dovete farlo voi
- **Ho preparato tutto il codice** - dovete solo configurare le credenziali
- **Seguite questa guida** per completare la configurazione

---

## 🚀 **Passo 1: Creare il Progetto Firebase**

1. **Andate su [Firebase Console](https://console.firebase.google.com)**
2. **Cliccate "Crea un progetto"**
3. **Nome progetto**: `legnosystem-bio` (o quello che preferite)
4. **Abilitate Google Analytics**: ✅ Consigliato
5. **Account Analytics**: Usate il vostro account Google
6. **Cliccate "Crea progetto"**

---

## 🔧 **Passo 2: Configurare i Servizi Firebase**

### **A. Firestore Database**

1. **Andate in "Firestore Database"**
2. **Cliccate "Crea database"**
3. **Modalità**: Iniziate in **modalità test** (cambieremo dopo)
4. **Località**: Scegliete `europe-west1` (Europa - GDPR compliant)
5. **Cliccate "Fine"**

### **B. Authentication**

1. **Andate in "Authentication"**
2. **Cliccate "Inizia"**
3. **Scheda "Sign-in method"**
4. **Abilitate "Email/Password"**: ✅
5. **Salvate**

### **C. Storage**

1. **Andate in "Storage"**
2. **Cliccate "Inizia"**
3. **Modalità**: Iniziate in **modalità test**
4. **Località**: `europe-west1` (stessa di Firestore)
5. **Cliccate "Fine"**

### **D. Functions (Opzionale)**

1. **Andate in "Functions"**
2. **Cliccate "Inizia"**
3. **Selezionate Piano Blaze** (pay-as-you-go, gratuito fino a certi limiti)

---

## 🔑 **Passo 3: Ottenere le Credenziali**

1. **Andate in "Impostazioni progetto" (⚙️)**
2. **Scorrete fino a "Le tue app"**
3. **Cliccate sull'icona Web `</>`**
4. **Nome app**: `Legnosystem Web App`
5. **Abilitate Firebase Hosting**: ✅ (se volete usarlo)
6. **Cliccate "Registra app"**
7. **COPIATE la configurazione** che appare (sarà simile a questa):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "legnosystem-bio.firebaseapp.com",
  projectId: "legnosystem-bio",
  storageBucket: "legnosystem-bio.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 📝 **Passo 4: Configurare il Progetto**

### **A. Creare il file .env**

1. **Copiate il file `env.example` in `.env`**:
```bash
cp env.example .env
```

2. **Modificate `.env` con le VOSTRE credenziali**:
```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=legnosystem-bio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=legnosystem-bio
VITE_FIREBASE_STORAGE_BUCKET=legnosystem-bio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Ambiente
VITE_USE_FIREBASE_EMULATORS=false
VITE_APP_NAME=Legnosystem.bio
VITE_APP_VERSION=1.13.0
VITE_APP_ENVIRONMENT=production
```

### **B. Aggiornare le Regole di Sicurezza**

#### **Firestore Rules:**
1. **Andate in "Firestore Database" > "Regole"**
2. **Copiate il contenuto del file `firestore.rules`**
3. **Incollate nel editor delle regole**
4. **Pubblicate**

#### **Storage Rules:**
1. **Andate in "Storage" > "Regole"**
2. **Copiate il contenuto del file `storage.rules`**
3. **Incollate nel editor delle regole**
4. **Pubblicate**

---

## 🧪 **Passo 5: Testare la Configurazione**

1. **Avviate il progetto**:
```bash
npm run dev
```

2. **Aprite la console del browser** (F12)
3. **Cercate questo messaggio**: `🔥 Firebase Auth inizializzato`
4. **Se non ci sono errori**: ✅ **Configurazione corretta!**

---

## 👤 **Passo 6: Creare il Primo Utente Admin**

1. **Aprite l'app nel browser**
2. **Registrate un nuovo utente** (sarà il vostro admin)
3. **Andate in Firebase Console > Firestore**
4. **Trovate la collezione `userProfiles`**
5. **Modificate il documento del vostro utente**:
```json
{
  "role": "admin",
  "displayName": "Admin Legnosystem",
  "department": "IT",
  "settings": {
    "theme": "light",
    "notifications": true,
    "language": "it"
  }
}
```

---

## 📊 **Passo 7: Migrare i Dati Esistenti**

Se avete già dati nel localStorage, potete migrarli:

1. **Login come admin**
2. **Aprite la console del browser**
3. **Eseguite**:
```javascript
// Accedete al store Firestore
const firestoreStore = window.Vue.useFirestoreStore()
firestoreStore.migrateFromLocalStorage()
```

---

## 🔧 **Configurazioni Avanzate (Opzionali)**

### **A. Backup Automatici**

Nel Firebase Console, andate in **"Firestore" > "Backup"** e configurate backup giornalieri.

### **B. Indicizzazione**

Se avete molti dati, create questi indici in Firestore:
- `cantieri`: `createdAt` (desc), `stato` (asc)
- `materiali`: `categoria` (asc), `quantita` (desc)
- `timesheet`: `dipendenteId` (asc), `data` (desc)

### **C. Funzioni Cloud (Opzionale)**

Per funzionalità avanzate come:
- Invio email automatiche
- Backup automatici
- Notifiche push
- Calcoli complessi

Create funzioni in `functions/index.js`.

---

## 🚨 **Risoluzione Problemi**

### **Errore: "Firebase project not found"**
- ✅ Verificate che `VITE_FIREBASE_PROJECT_ID` sia corretto
- ✅ Assicuratevi che il progetto esista in Firebase Console

### **Errore: "Permission denied"**
- ✅ Controllate che le regole Firestore siano pubblicate
- ✅ Verificate che l'utente sia autenticato

### **Errore: "Storage bucket not found"**
- ✅ Verificate che Storage sia abilitato
- ✅ Controllate `VITE_FIREBASE_STORAGE_BUCKET`

### **Errore: "API key not valid"**
- ✅ Rigenerate la API key in Firebase Console  
- ✅ Aggiornate il file `.env`

---

## 📈 **Prossimi Passi**

Una volta configurato Firebase:

1. **✅ Testare tutte le funzionalità**
2. **✅ Creare più utenti con ruoli diversi**
3. **✅ Caricare alcuni dati di test**
4. **✅ Configurare il backup**
5. **✅ Monitorare l'utilizzo nella Firebase Console**

---

## 💡 **Consigli per la Produzione**

1. **Sicurezza**: Cambiate le regole da "test mode" a quelle che ho creato
2. **Monitoraggio**: Abilitate gli alert per quota usage
3. **Performance**: Monitorate le query lente in Firestore
4. **Costi**: Tenete d'occhio i costi nella sezione "Usage and billing"

---

## 🆘 **Bisogno di Aiuto?**

Se incontrate problemi:
1. **Controllate la console del browser** per errori dettagliati  
2. **Verificate la configurazione** passo per passo
3. **Controllate le credenziali** nel file `.env`
4. **Assicuratevi** che tutti i servizi siano abilitati in Firebase

---

**🎉 Congratulazioni! Ora avete Firebase completamente configurato per Legnosystem.bio!** 