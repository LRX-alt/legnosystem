<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-3"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start p-4 rounded-lg shadow-lg backdrop-blur-sm border',
            'transform transition-all duration-300 ease-in-out',
            getToastStyles(toast.type)
          ]"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mr-3">
            <component :is="getIcon(toast.type)" :class="getIconStyles(toast.type)" class="w-6 h-6" />
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 v-if="toast.title" :class="getTitleStyles(toast.type)" class="text-sm font-semibold mb-1">
              {{ toast.title }}
            </h4>
            <p :class="getTextStyles(toast.type)" class="text-sm leading-relaxed">
              {{ toast.message }}
            </p>
            
            <!-- Actions -->
            <div v-if="toast.actions && toast.actions.length" class="mt-3 flex space-x-2">
              <button
                v-for="action in toast.actions"
                :key="action.label"
                @click="action.handler(); removeToast(toast.id)"
                :class="[
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200',
                  action.primary ? getPrimaryActionStyles(toast.type) : getSecondaryActionStyles(toast.type)
                ]"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            :class="getCloseButtonStyles(toast.type)"
            class="flex-shrink-0 ml-2 p-1 rounded-full transition-colors duration-200"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

const removeToast = (id) => {
  toastStore.removeToast(id)
}

const getIcon = (type) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || InformationCircleIcon
}

const getToastStyles = (type) => {
  const styles = {
    success: 'bg-green-50/95 border-green-200 text-green-800',
    error: 'bg-red-50/95 border-red-200 text-red-800',
    warning: 'bg-yellow-50/95 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50/95 border-blue-200 text-blue-800'
  }
  return styles[type] || styles.info
}

const getIconStyles = (type) => {
  const styles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return styles[type] || styles.info
}

const getTitleStyles = (type) => {
  const styles = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  }
  return styles[type] || styles.info
}

const getTextStyles = (type) => {
  const styles = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }
  return styles[type] || styles.info
}

const getPrimaryActionStyles = (type) => {
  const styles = {
    success: 'bg-green-600 text-white hover:bg-green-700',
    error: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700'
  }
  return styles[type] || styles.info
}

const getSecondaryActionStyles = (type) => {
  const styles = {
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    error: 'bg-red-100 text-red-700 hover:bg-red-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    info: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  }
  return styles[type] || styles.info
}

const getCloseButtonStyles = (type) => {
  const styles = {
    success: 'text-green-400 hover:text-green-600 hover:bg-green-100',
    error: 'text-red-400 hover:text-red-600 hover:bg-red-100',
    warning: 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100',
    info: 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
  }
  return styles[type] || styles.info
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style> 