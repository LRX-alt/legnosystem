<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Gestione Utenti</h1>
    <div v-if="loading" class="text-sm text-gray-500">Caricamento utenti...</div>
    <div v-else class="space-y-2">
      <div v-for="u in users" :key="u.id" class="border rounded p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ u.name || u.email }}</div>
          <div class="text-xs text-gray-500">{{ u.email }} • Ruolo: {{ u.role }}</div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary" @click="setRole(u.id, 'manager')">Rendi Manager</button>
          <button class="btn-primary" @click="promoteToAdmin(u.id)">Promuovi a Admin</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db, firestoreConfig } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { usePopup } from '@/composables/usePopup'

const auth = useAuthStore()
const { success, error } = usePopup()

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

const promoteToAdmin = async (userId) => {
  const res = await auth.promoteUserToAdmin(userId)
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


