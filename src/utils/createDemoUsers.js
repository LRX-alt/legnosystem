import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, firestoreConfig } from '@/config/firebase'

/**
 * Crea utenti demo per testare il sistema
 */
export const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin@legnosystem.it',
      password: 'demo123',
      name: 'Admin Sistema',
      role: 'admin',
      department: 'amministrazione',
      position: 'Amministratore di Sistema'
    },
    {
      email: 'manager@legnosystem.it', 
      password: 'demo123',
      name: 'Marco Rossi',
      role: 'manager',
      department: 'produzione',
      position: 'Direttore Operativo'
    },
    {
      email: 'capo@legnosystem.it',
      password: 'demo123',
      name: 'Giuseppe Bianchi',
      role: 'capo_cantiere',
      department: 'produzione',
      position: 'Capo Cantiere Senior'
    },
    {
      email: 'operaio@legnosystem.it',
      password: 'demo123',
      name: 'Luigi Verdi',
      role: 'employee',
      department: 'produzione',
      position: 'Operaio Specializzato'
    },
    {
      email: 'admin.uff@legnosystem.it',
      password: 'demo123',
      name: 'Sara Neri',
      role: 'amministrativo',
      department: 'amministrazione',
      position: 'Responsabile Amministrativo'
    }
  ]

  const results = []

  for (const user of demoUsers) {
    try {
      console.log(`Creando utente demo: ${user.email}`)
      
      // Crea utente Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      )

      // Aggiorna profilo Firebase
      await updateProfile(userCredential.user, {
        displayName: user.name
      })

      // Crea profilo Firestore
      const profileData = {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        phone: '',
        isActive: true,
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        loginCount: 0
      }

      await setDoc(
        doc(db, firestoreConfig.collections.userProfiles, userCredential.user.uid), 
        profileData
      )

      results.push({
        success: true,
        email: user.email,
        uid: userCredential.user.uid,
        role: user.role
      })

      console.log(`✅ Utente creato: ${user.email} (${user.role})`)

    } catch (error) {
      console.error(`❌ Errore creazione utente ${user.email}:`, error)
      
      results.push({
        success: false,
        email: user.email,
        error: error.message
      })
    }
  }

  return results
}

/**
 * Verifica se gli utenti demo esistono già
 */
export const checkDemoUsersExist = async () => {
  // TODO: Implementare verifica esistenza utenti
  return false
} 