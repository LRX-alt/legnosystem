# 📊 Integrazione Timesheet - Giornale Cantiere

## Panoramica Sistema

Il sistema Legnosystem ora integra automaticamente i dati del **Giornale Cantiere** con i **Timesheet dei Dipendenti**, creando un flusso di dati unificato e automatico per il tracking delle ore lavorate.

## ✨ Funzionalità Implementate

### 1. Sincronizzazione Automatica
Quando si salva una nuova registrazione nel **Giornale Cantiere**:
- ✅ Vengono create automaticamente le voci timesheet per ogni dipendente presente
- ✅ Le ore totali vengono divise equamente tra i membri del team
- ✅ Viene calcolato il costo orario e totale per ogni dipendente
- ✅ I dati vengono salvati in Firestore nella collezione `timesheet`

### 2. Tracciamento Origine Dati
Ogni voce timesheet contiene il campo `fonte`:
- **📋 `giornale_cantiere`**: Dati auto-generati dal giornale cantiere
- **✋ `manuale`**: Dati inseriti manualmente nel modulo Personale

### 3. Collegamento Registrazioni
- Ogni timesheet generato automaticamente è collegato alla registrazione originale tramite `registrazioneGiornaleId`
- Questo permette di eliminare automaticamente i timesheet quando si elimina una registrazione

### 4. Visualizzazione Migliorata
Il modulo **Personale** ora mostra:
- 📊 **Riepilogo settimanale**: ore totali, costi, numero registrazioni
- 🏷️ **Indicatori fonte**: badge colorati per distinguere voci manuali da auto-generate
- 💰 **Calcoli costi**: costo orario e totale per ogni voce
- 📅 **Cronologia completa**: tutti i timesheet ordinati per data

## 🔄 Flusso di Lavoro

### Scenario Tipico
1. **Capo cantiere** apre il Giornale Cantiere per un progetto
2. Crea una nuova registrazione con:
   - Data: `15 gennaio 2024`
   - Team presente: `Mario Rossi, Luigi Bianchi`
   - Ore totali: `8 ore`
   - Cantiere: `Villa Magna Mater`
3. **Sistema automaticamente**:
   - Crea timesheet per Mario: `4 ore` su Villa Magna Mater
   - Crea timesheet per Luigi: `4 ore` su Villa Magna Mater
   - Calcola costi in base alla paga oraria
   - Aggiorna ore settimanali per entrambi i dipendenti

### Visualizzazione nel Modulo Personale
- **Mario Rossi** vede nel suo timesheet: `15 gen • 4h • €100 • 📋 Giornale`
- **Luigi Bianchi** vede nel suo timesheet: `15 gen • 4h • €120 • 📋 Giornale`

## 🛠️ Implementazione Tecnica

### File Modificati
1. **`src/views/GiornaleCantiere.vue`**
   - ➕ Funzione `syncTimesheetFromGiornale()`
   - ➕ Funzione `updateDipendentiOreSettimanali()`
   - ➕ Funzione `deleteTimesheetByRegistrazione()`
   - 🔄 Aggiornata `saveEntry()` per sincronizzazione automatica

2. **`src/views/Personale.vue`**
   - ➕ Funzione `loadTimesheet()` per caricare da Firestore
   - ➕ Funzione `updateDipendentiOreFromTimesheet()`
   - 🔄 Aggiornata `saveTimesheet()` per salvare in Firestore
   - 🎨 Migliorata UI del modal timesheet con riepilogo e indicatori

3. **`src/stores/firestore.js`**
   - ✅ Già presente metodo `registraTimesheet()`
   - ✅ Già presente collezione `timesheet` configurata

### Struttura Dati Timesheet
```javascript
{
  id: "auto-generated-id",
  dipendenteId: "dipendente-id",
  data: "2024-01-15",
  cantiere: "Villa Magna Mater",
  cantiereId: "cantiere-id",
  ore: 4,
  costoOrario: 25,
  costoTotale: 100,
  note: "Auto-generato da Giornale Cantiere - Fondazioni",
  turno: "giornaliero",
  fonte: "giornale_cantiere", // o "manuale"
  registrazioneGiornaleId: "registrazione-id",
  createdAt: "2024-01-15T10:30:00Z"
}
```

## 🎯 Benefici

### Per i Capi Cantiere
- ✅ **Zero doppi inserimenti**: compilano solo il giornale cantiere
- ✅ **Sincronizzazione automatica**: i timesheet si popolano da soli
- ✅ **Visione d'insieme**: costi e ore sempre aggiornati

### Per gli Amministrativi
- ✅ **Dati centralizzati**: tutto in Firestore, accessibile ovunque
- ✅ **Tracciabilità completa**: origine di ogni dato sempre identificabile
- ✅ **Calcoli automatici**: costi e ore settimanali sempre precisi

### Per i Dipendenti
- ✅ **Trasparenza**: possono vedere le proprie ore e costi
- ✅ **Storico completo**: cronologia dettagliata delle attività
- ✅ **Progresso settimanale**: barra di avanzamento ore lavorate

## 🔧 Configurazione Workweek

Il sistema è configurato per **6 giorni lavorativi** (Lunedì-Sabato):
- 📊 Calcolo ore settimanali: `48h target` (6 giorni × 8h)
- 💰 Calcolo costi mensili: `26 giorni lavorativi/mese`
- 📅 Calendari: mostrano Lun-Sab come giorni lavorativi

## 🚀 Utilizzo

### Per Testare il Sistema
1. Vai al **Giornale Cantiere** di un progetto
2. Crea una nuova registrazione con team presente
3. Salva la registrazione
4. Vai al modulo **Personale** 
5. Clicca "Vedi Timesheet" su un dipendente presente nella registrazione
6. ✅ Verifica che sia apparsa la voce timesheet con badge "📋 Giornale"

### Per Gestire Ore Manuali
1. Va al modulo **Personale**
2. Clicca "Registra Ore" 
3. Compila il form manualmente
4. ✅ La voce apparirà con badge "✋ Manuale"

## 🛡️ Sicurezza e Integrità

- **Prevenzione duplicati**: modifiche al giornale non creano nuovi timesheet
- **Eliminazione collegata**: cancellando una registrazione si eliminano i timesheet associati
- **Validazione dati**: controlli su presenza dipendenti e dati obbligatori
- **Fallback graceful**: errori non bloccano il salvataggio del giornale

---

*Documentazione aggiornata: 2024*
*Sistema attivo su: http://localhost:5175/* 