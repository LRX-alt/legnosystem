import { db } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Esegui manualmente da console:
// import('/src/scripts/seedCentriCosto.js').then(m => m.seedCentriCosto())

export const seedCentriCosto = async () => {
  const seed = [
    { nome: 'Riparazioni', tipo: 'MANSIONE' },
    { nome: 'Commerciale', tipo: 'MANSIONE' },
    { nome: 'Magazzino', tipo: 'MANSIONE' },
    { nome: 'Consegne', tipo: 'MANSIONE' },
    { nome: 'Amministrazione', tipo: 'MANSIONE' }
  ]

  const col = collection(db, 'centri_costo')
  let created = 0
  for (const item of seed) {
    await addDoc(col, { ...item, stato: 'attivo', createdAt: serverTimestamp() })
    created++
  }
  console.log(`✅ Seed centri_costo completato: ${created} voci create`)
  return { success: true, created }
}

export default seedCentriCosto

