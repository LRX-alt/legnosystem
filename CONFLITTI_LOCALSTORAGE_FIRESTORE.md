# 🚨 Report Conflitti localStorage vs Firestore

## Stato Attuale del Sistema

### ✅ **COMPONENTI GIÀ MIGRATI A FIRESTORE**
- `src/views/Magazzino.vue` - Materiali magazzino ✅
- `src/stores/firestore.js` - Store principale ✅  
- `src/composables/useFirestore.js` - Composable per operazioni ✅

### 🔄 **COMPONENTI CON CONFLITTI IDENTIFICATI**

## 1. **🏢 Fornitori.vue**
**Problema**: Legge ancora dati da localStorage
**File**: `src/views/Fornitori.vue`
**Linee problematiche**:
- Linea 1146: `localStorage.getItem('legnosystem_materiali_cantieri')`
- Linea 1147: `localStorage.getItem('legnosystem_cantieri')`
- Linea 1203: `localStorage.getItem('legnosystem_material_attachments')`

**Soluzione**: ✅ PARZIALMENTE IMPLEMENTATA
- Aggiornata funzione `getFornitoreRelations()` per usare `firestoreStore.cantieri`
- Rimane da implementare il caricamento materiali cantieri da Firestore

## 2. **📎 MaterialAttachmentsModal.vue**
**Problema**: Salva allegati solo in localStorage
**File**: `src/components/MaterialAttachmentsModal.vue`
**Linee problematiche**:
- Linea 290: Caricamento da localStorage
- Linea 373: Lettura da localStorage  
- Linea 406: Salvataggio su localStorage

**Soluzione**: ❌ DA IMPLEMENTARE
- Migrare a `firestoreStore.loadAllegatiMateriale()`
- Usare `firestoreStore.createAllegatoMateriale()` per salvataggi

## 3. **🏗️ Cantieri.vue**
**Problema**: Sistema ibrido localStorage/Firestore per allegati
**File**: `src/views/Cantieri.vue`
**Linee problematiche**:
- Linea 3276: `localStorage.getItem('legnosystem_material_attachments')`
- Linea 3310: Lettura da localStorage
- Linea 3341: `localStorage.setItem()` per allegati

**Soluzione**: 🔄 PARZIALMENTE IMPLEMENTATA
- Materiali cantieri migrati a Firestore ✅
- Allegati materiali ancora su localStorage ❌

## 4. **👥 Personale.vue**
**Problema**: Riferimento a localStorage per pulizia
**File**: `src/views/Personale.vue`
**Linea problematica**:
- Linea 1390: `localStorage.removeItem('legnosystem_dipendenti')`

**Soluzione**: ⚠️ VERIFICARE
- Probabilmente legacy, verificare se ancora necessario

---

## 🎯 **PIANO DI RISOLUZIONE PRIORITARIO**

### **FASE 1: ALTA PRIORITÀ** ⚡
1. **MaterialAttachmentsModal.vue**
   - Sostituire localStorage con Firestore per allegati materiali
   - Usare: `firestoreStore.allegatiMateriali.*`

2. **Cantieri.vue** 
   - Completare migrazione allegati a Firestore
   - Rimuovere funzioni localStorage per allegati

### **FASE 2: MEDIA PRIORITÀ** 🔄  
3. **Fornitori.vue**
   - Implementare caricamento materiali cantieri da Firestore
   - Migrare conteggio allegati a Firestore

### **FASE 3: BASSA PRIORITÀ** 📋
4. **Personale.vue**
   - Verificare se la pulizia localStorage è ancora necessaria
   - Aggiornare se necessario

---

## 🔍 **INCONSISTENZE RILEVATE**

### **Nomenclatura Campi**
- localStorage usa: `name`, `size`, `type`, `uploadDate`
- Firestore usa: `nome`, `dimensione`, `tipo`, `uploadedAt`
- **Soluzione**: Standardizzare nomenclatura su formato Firestore

### **ID Gestione**
- localStorage: ID come numeri e stringhe
- Firestore: ID come stringhe
- **Soluzione**: Sempre convertire ID a string con `String(id)`

### **Formato Dati**
- localStorage: Array piatto per allegati
- Firestore: Collezioni separate per tipo
- **Soluzione**: Usare sempre formato Firestore

---

## 🛠️ **AZIONI IMPLEMENTATE**

### ✅ **Magazzino.vue**
- Sostituito `materiali.value` locale con `firestoreStore.materiali`
- Aggiornate funzioni CRUD per usare Firestore
- Aggiunto caricamento automatico al mount

### ✅ **Cantieri.vue**  
- Aggiunto caricamento materiali magazzino al mount
- Aggiornata funzione `addMaterialToCantiere()` per ricaricare materiali
- Migliorata mappatura campi in `fillMaterialFromStock()`

### ✅ **Fornitori.vue**
- Aggiornata `getFornitoreRelations()` per usare `firestoreStore.cantieri`
- Aggiunto TODO per materiali cantieri da Firestore

---

## ⚠️ **RISCHI IDENTIFICATI**

1. **Perdita Dati**: Allegati materiali solo su localStorage
2. **Inconsistenza**: Fornitori leggono dati vecchi
3. **Performance**: Caricamenti duplicati localStorage + Firestore
4. **Manutenzione**: Codice ibrido difficile da mantenere

---

## 🚀 **PROSSIMI PASSI**

1. Implementare migrazione allegati materiali a Firestore
2. Completare integrazione Fornitori con Firestore  
3. Rimuovere codice localStorage legacy
4. Testare integrazione completa
5. Aggiornare documentazione

---

**Stato aggiornamento**: `2024-12-27`
**Autore**: Sistema di Migrazione Legnosystem 