<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
    <!-- Transition wrapper -->
    <transition name="auth-fade" mode="out-in">
      <LoginForm 
        v-if="!showRegister"
        @show-register="showRegister = true"
        @login-success="handleLoginSuccess"
        key="login"
      />
      <RegisterForm 
        v-else
        @show-login="showRegister = false"
        @register-success="handleRegisterSuccess"
        key="register"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { usePopup } from '@/composables/usePopup'

// Composables
const router = useRouter()
const { success } = usePopup()

// State
const showRegister = ref(false)

// Methods
const handleLoginSuccess = () => {
  success('Accesso Effettuato', 'Benvenuto in Legnosystem!')
  router.push('/')
}

const handleRegisterSuccess = () => {
  success('Registrazione Completata', 'Account creato con successo! Ora puoi accedere.')
  showRegister.value = false
}
</script>

<style scoped>
.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: all 0.3s ease;
}

.auth-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.auth-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style> 