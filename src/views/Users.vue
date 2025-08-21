<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Gestione Utenti</h1>
    <div v-if="loading" class="text-sm text-gray-500">Caricamento utenti...</div>
    <div v-else class="space-y-2">
      <div v-for="u in users" :key="u.id" class="border rounded p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ u.name || u.email }}</div>
          <div class="text-xs text-gray-500">{{ u.email }} • Ruolo: {{ u.role }} • Stato: {{ u.isActive ? 'attivo' : 'disabilitato' }}</div>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
          <button class="btn-secondary" @click="toggleActive(u)">{{ u.isActive ? 'Disabilita' : 'Abilita' }}</button>
          <button class="btn-secondary" @click="setRole(u.id, 'manager')">Rendi Manager</button>
          <button class="btn-primary" @click="promoteToAdmin(u.id)">Promuovi a Admin</button>
          <button class="btn-secondary" @click="sendPasswordReset(u.email)">Reset Password</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { db, auth, firestoreConfig } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { usePopup } from '@/composables/usePopup'

const authStore = useAuthStore()
const { success, error, confirm } = usePopup()

const users = ref([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    const snap = await getDocs(collection(db, firestoreConfig.collections.userProfiles))
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    error('Errore', 'Impossibile caricare utenti')
  } finally {
    loading.value = false
  }
}

const setRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, firestoreConfig.collections.userProfiles, userId), { role })
    success('Ruolo aggiornato', 'Aggiornamento completato')
    await loadUsers()
  } catch (e) {
    error('Errore', 'Impossibile aggiornare ruolo')
  }
}

const toggleActive = async (u) => {
  try {
    const ok = await confirm(u.isActive ? 'Disabilita utente?' : 'Abilita utente?', `${u.email}`)
    if (!ok) return
    await updateDoc(doc(db, firestoreConfig.collections.userProfiles, u.id), { isActive: !u.isActive })
    success('Stato aggiornato', `Utente ${!u.isActive ? 'abilitato' : 'disabilitato'}`)
    await loadUsers()
  } catch (e) {
    error('Errore', 'Impossibile aggiornare stato utente')
  }
}

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    success('Email inviata', `Reset password inviato a ${email}`)
  } catch (e) {
    error('Errore', e?.message || 'Impossibile inviare reset password')
  }
}

const promoteToAdmin = async (userId) => {
  const res = await authStore.promoteUserToAdmin(userId)
  if (res.success) {
    success('Promosso', 'Utente promosso ad admin')
    await loadUsers()
  } else {
    error('Errore', res.error || 'Impossibile promuovere')
  }
}

onMounted(() => loadUsers())
</script>

<style scoped>
</style>


