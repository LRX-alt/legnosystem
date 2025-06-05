import { useToastStore } from '@/stores/toast'

export function useToast() {
  const toastStore = useToastStore()

  // Toast di successo semplice
  const success = (message, title = '') => {
    return toastStore.success(message, { title })
  }

  // Toast di errore semplice
  const error = (message, title = 'Errore') => {
    return toastStore.error(message, { title })
  }

  // Toast di warning semplice
  const warning = (message, title = 'Attenzione') => {
    return toastStore.warning(message, { title })
  }

  // Toast informativo semplice
  const info = (message, title = '') => {
    return toastStore.info(message, { title })
  }

  // Toast con azioni personalizzate
  const actionToast = (message, actions, type = 'info', title = '') => {
    return toastStore.addToast({
      title,
      message,
      type,
      actions,
      duration: 0 // Non scompare automaticamente se ha azioni
    })
  }

  // Toast di conferma con Yes/No
  const confirm = (message, onConfirm, onCancel = null, title = 'Conferma') => {
    const actions = [
      {
        label: 'Conferma',
        primary: true,
        handler: onConfirm
      },
      {
        label: 'Annulla',
        primary: false,
        handler: onCancel || (() => {})
      }
    ]
    
    return actionToast(message, actions, 'warning', title)
  }

  // Toast per dettagli cantiere (sostituto specifico per l'alert mostrato)
  const cantiereDetails = (cantiere, fornitore = null) => {
    const materialiCount = fornitore ? fornitore.materialiCount : 0
    
    const actions = [
      {
        label: '🏗️ Vai ai Cantieri',
        primary: true,
        handler: () => {
          // Qui potresti navigare alla pagina cantieri
          window.dispatchEvent(new CustomEvent('navigate-to-cantieri', { detail: cantiere.id }))
        }
      },
      {
        label: 'Chiudi',
        primary: false,
        handler: () => {}
      }
    ]

    return toastStore.addToast({
      title: `🏗️ ${cantiere.nome}`,
      message: `👤 Cliente: ${cantiere.cliente}\n📊 Stato: ${cantiere.stato}\n🧱 Materiali fornitore: ${materialiCount}`,
      type: 'info',
      actions,
      duration: 0
    })
  }

  // Toast per creazione cantiere con successo
  const cantiereCreated = (nomeCantiere, cliente, tipoCliente) => {
    return toastStore.addToast({
      title: '✅ Cantiere Creato!',
      message: `"${nomeCantiere}" è stato creato con successo.\n👤 Cliente: ${cliente} (${tipoCliente})\n🧱 Sistema materiali inizializzato e pronto!`,
      type: 'success',
      duration: 6000
    })
  }

  return {
    success,
    error,
    warning,
    info,
    actionToast,
    confirm,
    cantiereDetails,
    cantiereCreated
  }
} 