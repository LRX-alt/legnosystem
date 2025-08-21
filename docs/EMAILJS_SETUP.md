# 📧 Configurazione EmailJS per Invio Preventivi

Questa guida ti aiuterà a configurare EmailJS per inviare preventivi via email direttamente da Legnosystem.

## 🎯 Perché EmailJS?

EmailJS è un servizio che permette di inviare email direttamente dal frontend senza bisogno di un server backend. È perfetto per:
- ✅ Invio automatico preventivi ai clienti
- ✅ Allegati PDF generati automaticamente
- ✅ Template email personalizzabili
- ✅ Semplice configurazione
- ✅ Piano gratuito disponibile

## 📋 Prerequisiti

1. Account EmailJS gratuito su [https://www.emailjs.com/](https://www.emailjs.com/)
2. Un provider email (Gmail, Outlook, SendGrid, etc.)
3. File `.env` nel progetto Legnosystem

## 🚀 Configurazione Passo-Passo

### 1. Creazione Account EmailJS

1. Vai su [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clicca "Get Started" → "Sign Up"
3. Registrati con email e password
4. Conferma l'email di attivazione

### 2. Configurazione Service (Provider Email)

1. Nel dashboard EmailJS, vai su **"Email Services"**
2. Clicca **"Add New Service"**
3. Scegli il tuo provider email:
   - **Gmail**: Per email @gmail.com
   - **Outlook**: Per email @outlook.com/@hotmail.com
   - **SendGrid**: Per invii professionali
   - **Custom SMTP**: Per altri provider

#### Per Gmail:
1. Seleziona "Gmail"
2. Clicca "Connect Account"
3. Autorizza EmailJS ad accedere al tuo account Gmail
4. Assegna un nome al service (es: "legnosystem_gmail")
5. Salva

#### Per Outlook:
1. Seleziona "Outlook"
2. Inserisci le tue credenziali Outlook
3. Assegna un nome al service (es: "legnosystem_outlook")
4. Salva

### 3. Creazione Template Email

1. Vai su **"Email Templates"**
2. Clicca **"Create New Template"**
3. Configura il template:

```
Subject: Preventivo {{preventivo_numero}} - {{preventivo_progetto}}

From Name: Legno System
From Email: {{from_email}} (automatico dal service)
To Email: {{to_email}}
To Name: {{to_name}}
```

#### Contenuto HTML del Template:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center;">
    <h1>LEGNO SYSTEM</h1>
    <p>Abitare in natura dal 1959</p>
  </div>
  
  <div style="padding: 30px; line-height: 1.6; color: #333;">
    <h2>Preventivo {{preventivo_numero}}</h2>
    
    <p>Gentile {{to_name}},</p>
    
    <p>Le inviamo in allegato il preventivo per il progetto <strong>{{preventivo_progetto}}</strong>.</p>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3>Dettagli Preventivo:</h3>
      <ul>
        <li><strong>Numero:</strong> {{preventivo_numero}}</li>
        <li><strong>Progetto:</strong> {{preventivo_progetto}}</li>
        <li><strong>Importo:</strong> {{preventivo_importo}}</li>
        <li><strong>Scadenza:</strong> {{preventivo_scadenza}}</li>
      </ul>
    </div>
    
    <div style="white-space: pre-line;">{{message}}</div>
    
    <div style="background-color: #2d5a27; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Contatti:</strong></p>
      <p style="margin: 5px 0;">📧 Email: info@legnosystem.bio</p>
      <p style="margin: 5px 0;">📞 Telefono: +39 123 456 7890</p>
      <p style="margin: 5px 0;">🏠 Indirizzo: Via Roma 123, 12345 Città (CN)</p>
    </div>
    
    <p style="color: #666; font-size: 12px; margin-top: 30px;">
      Questo preventivo è valido fino alla data di scadenza indicata.
      <br>Per accettare il preventivo, la preghiamo di contattarci entro la scadenza.
    </p>
  </div>
</div>
```

4. Salva il template e copia il **Template ID**

### 4. Configurazione Variabili d'Ambiente

1. Crea/modifica il file `.env` nella root del progetto:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

2. Sostituisci i valori:
   - **SERVICE_ID**: ID del service creato (es: "service_abc123")
   - **TEMPLATE_ID**: ID del template creato (es: "template_xyz789")
   - **PUBLIC_KEY**: Chiave pubblica del tuo account EmailJS

### 5. Recupero Chiavi EmailJS

#### Service ID:
1. Vai su "Email Services"
2. Clicca sul service creato
3. Copia il "Service ID"

#### Template ID:
1. Vai su "Email Templates"
2. Clicca sul template creato
3. Copia il "Template ID"

#### Public Key:
1. Vai su "Account" → "General"
2. Nella sezione "API Keys" trovi la "Public Key"
3. Copia la chiave

## 🧪 Test Configurazione

1. Riavvia il server di sviluppo: `npm run dev`
2. Vai su **Preventivi** in Legnosystem
3. Nella barra filtri, clicca il pulsante **"✅ EmailJS"**
4. Conferma l'invio del test
5. Controlla che arrivi l'email di test

## 🔧 Risoluzione Problemi

### Errore: "EmailJS non configurato"
- Verifica che le variabili d'ambiente siano corrette
- Riavvia il server di sviluppo
- Controlla che il file `.env` sia nella root del progetto

### Errore: "Email cliente non valida"
- Verifica che il cliente abbia un campo email valido
- Controlla che l'email contenga il simbolo "@"

### Errore: "Template not found"
- Verifica che il Template ID sia corretto
- Controlla che il template sia salvato e attivo

### Errore: "Service not found"
- Verifica che il Service ID sia corretto
- Controlla che il service sia configurato correttamente

### Email non arriva
- Controlla la cartella SPAM/Posta indesiderata
- Verifica che l'email mittente sia autorizzata
- Controlla i limiti del piano EmailJS (200 email/mese gratis)

## 📊 Limiti Piano Gratuito

- **200 email/mese** (circa 50 preventivi/settimana)
- **Template illimitati**
- **Service illimitati**
- **Supporto email**

Per volumi maggiori, considera i piani a pagamento:
- Personal: €4/mese → 1.000 email/mese
- Professional: €10/mese → 3.000 email/mese

## 🔒 Sicurezza

- Le chiavi EmailJS sono **pubbliche** e sicure per il frontend
- Non includere mai password o chiavi private nel codice
- Le email sono inviate tramite HTTPS
- I dati non vengono memorizzati sui server EmailJS

## 🚀 Funzionalità Disponibili

Una volta configurato EmailJS, avrai:

✅ **Invio automatico preventivi** con pulsante "📧 Invia al Cliente"
✅ **PDF allegato** generato automaticamente
✅ **Template professionale** con dati aziendali
✅ **Reinvio email** per preventivi già inviati
✅ **Download PDF** senza invio email
✅ **Test configurazione** con pulsante dedicato
✅ **Gestione errori** con feedback immediato

## 🎨 Personalizzazione

Puoi personalizzare:
- **Template HTML** per cambiare il design
- **Contenuto email** modificando il composable
- **Dati aziendali** nel template
- **Colori e stili** nel CSS del template

## 🆘 Supporto

Per problemi specifici:
1. Controlla i log del browser (F12 → Console)
2. Verifica la configurazione EmailJS
3. Testa con un preventivo di esempio
4. Contatta il supporto EmailJS se necessario

---

**🎉 Congratulazioni!** Ora puoi inviare preventivi professionali via email direttamente da Legnosystem! 