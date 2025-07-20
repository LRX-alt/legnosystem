<template>
  <div class="space-y-6">
    <!-- Header Clienti -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-primary-800">Gestione Clienti</h1>
        <p class="text-gray-600">Anagrafica e storico progetti - Legnosystem.bio</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Nuovo Cliente
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <UserGroupIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Clienti Totali</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.clientiTotali }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-accent-100 rounded-lg">
            <CurrencyEuroIcon class="w-6 h-6 text-accent-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Fatturato Annuo</p>
            <p class="text-2xl font-bold text-gray-900">€{{ stats.fatturatoAnnuo.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <BuildingOfficeIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Progetti Attivi</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.progettiAttivi }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <StarIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Soddisfazione</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.soddisfazione }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card">
      <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cerca clienti..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base"
          />
        </div>
        <div class="w-full sm:w-40">
          <select v-model="selectedTipo" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti i tipi</option>
            <option value="privato">Privato</option>
            <option value="azienda">Azienda</option>
            <option value="ente-pubblico">Ente Pubblico</option>
          </select>
        </div>
        <div class="w-full sm:w-48">
          <select v-model="selectedStato" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-base">
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivo</option>
            <option value="potenziale">Potenziale</option>
            <option value="inattivo">Inattivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista Clienti -->
    <!-- Mobile: Card Layout -->
    <div class="block lg:hidden space-y-4">
      <div v-for="cliente in filteredClienti" :key="cliente.id" class="card hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {{ cliente.iniziali }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ cliente.nome }}</h3>
            <p class="text-base text-gray-600 truncate">{{ cliente.email }}</p>
          </div>
          <div class="flex flex-col items-end space-y-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getTipoColor(cliente.tipo)">
              {{ getTipoLabel(cliente.tipo) }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(cliente.stato)">
              {{ getStatoLabel(cliente.stato) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Progetti</p>
            <p class="text-lg font-bold text-gray-900">{{ cliente.numeroProgetti }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Valore Totale</p>
            <p class="text-lg font-bold text-gray-900">€{{ cliente.valoreTotale.toLocaleString() }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-1">Ultimo Contatto</p>
          <p class="text-base font-medium text-gray-900">{{ formatDate(cliente.ultimoContatto) }}</p>
        </div>

        <div class="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button @click="viewCliente(cliente)" 
                  class="w-full btn-primary py-3 text-base font-medium"
                  title="Visualizza dettagli cliente">
            👤 Visualizza Cliente
          </button>
          <button @click="editCliente(cliente)" 
                  class="w-full btn-secondary py-3 text-base font-medium"
                  title="Modifica dati cliente">
            ✏️ Modifica
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: Table Layout -->
    <div class="hidden lg:block card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Progetti</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Valore Totale</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Ultimo Contatto</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              <th class="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cliente in filteredClienti" :key="cliente.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {{ cliente.iniziali }}
                  </div>
                  <div>
                    <div class="text-base font-medium text-gray-900">{{ cliente.nome }}</div>
                    <div class="text-base text-gray-500">{{ cliente.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getTipoColor(cliente.tipo)">
                  {{ getTipoLabel(cliente.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ cliente.numeroProgetti }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">€{{ cliente.valoreTotale.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-base text-gray-900">{{ formatDate(cliente.ultimoContatto) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(cliente.stato)">
                  {{ getStatoLabel(cliente.stato) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-medium">
                <div class="flex space-x-2">
                  <button @click="viewCliente(cliente)" 
                          class="text-primary-600 hover:text-primary-900"
                          title="Visualizza dettagli cliente">
                    Visualizza
                  </button>
                  <button @click="editCliente(cliente)" 
                          class="text-gray-600 hover:text-gray-900"
                          title="Modifica dati cliente">
                    Modifica
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuovo Cliente -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header Modal -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Nuovo Cliente</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form Nuovo Cliente -->
          <form @submit.prevent="createCliente" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nome -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome/Ragione Sociale *</label>
                <input 
                  v-model="newCliente.nome" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Es. Mario Rossi o Azienda SpA"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input 
                  v-model="newCliente.email" 
                  type="email" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@esempio.com"
                />
              </div>

              <!-- Telefono -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                <input 
                  v-model="newCliente.telefono" 
                  type="tel" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <!-- Tipo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Cliente *</label>
                <select 
                  v-model="newCliente.tipo" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seleziona tipo</option>
                  <option value="privato">Privato</option>
                  <option value="azienda">Azienda</option>
                  <option value="ente-pubblico">Ente Pubblico</option>
                </select>
              </div>

              <!-- Partita IVA -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Partita IVA</label>
                <input 
                  v-model="newCliente.partitaIva" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="IT12345678901"
                />
              </div>

              <!-- Indirizzo -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                <input 
                  v-model="newCliente.indirizzo" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Via Roma 123, Milano"
                />
              </div>

              <!-- Note -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea 
                  v-model="newCliente.note" 
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Note aggiuntive sul cliente..."
                ></textarea>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                @click="showAddModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
              >
                {{ loading ? 'Creazione...' : 'Crea Cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Visualizza Cliente -->
    <div v-if="showViewModal && selectedCliente" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header Modal -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Dettagli Cliente</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Dettagli Cliente -->
          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500">Nome/Ragione Sociale</label>
                <p class="text-lg font-semibold text-gray-900">{{ selectedCliente.nome }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Tipo</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getTipoColor(selectedCliente.tipo)">
                  {{ getTipoLabel(selectedCliente.tipo) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Email</label>
                <p class="text-base text-gray-900">{{ selectedCliente.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Telefono</label>
                <p class="text-base text-gray-900">{{ selectedCliente.telefono }}</p>
              </div>
              <div v-if="selectedCliente.partitaIva">
                <label class="block text-sm font-medium text-gray-500">Partita IVA</label>
                <p class="text-base text-gray-900">{{ selectedCliente.partitaIva }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Stato</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getStatoColor(selectedCliente.stato)">
                  {{ getStatoLabel(selectedCliente.stato) }}
                </span>
              </div>
            </div>
            
            <div v-if="selectedCliente.indirizzo">
              <label class="block text-sm font-medium text-gray-500">Indirizzo</label>
              <p class="text-base text-gray-900">{{ selectedCliente.indirizzo }}</p>
            </div>
            
            <div v-if="selectedCliente.note">
              <label class="block text-sm font-medium text-gray-500">Note</label>
              <p class="text-base text-gray-900">{{ selectedCliente.note }}</p>
            </div>

            <!-- Stats Cliente -->
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div class="text-center">
                <p class="text-2xl font-bold text-primary-600">{{ selectedCliente.numeroProgetti }}</p>
                <p class="text-sm text-gray-500">Progetti</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">€{{ selectedCliente.valoreTotale.toLocaleString() }}</p>
                <p class="text-sm text-gray-500">Valore Totale</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold text-gray-900">{{ formatDate(selectedCliente.ultimoContatto) }}</p>
                <p class="text-sm text-gray-500">Ultimo Contatto</p>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              @click="editCliente(selectedCliente)"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              Modifica
            </button>
            <button 
              @click="showViewModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifica Cliente -->
    <div v-if="showEditModal && selectedCliente" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header Modal -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Modifica Cliente</h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form Modifica Cliente -->
          <form @submit.prevent="updateCliente" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nome -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome/Ragione Sociale *</label>
                <input 
                  v-model="selectedCliente.nome" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input 
                  v-model="selectedCliente.email" 
                  type="email" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Telefono -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                <input 
                  v-model="selectedCliente.telefono" 
                  type="tel" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Tipo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Cliente *</label>
                <select 
                  v-model="selectedCliente.tipo" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="privato">Privato</option>
                  <option value="azienda">Azienda</option>
                  <option value="ente-pubblico">Ente Pubblico</option>
                </select>
              </div>

              <!-- Stato -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stato *</label>
                <select 
                  v-model="selectedCliente.stato" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="potenziale">Potenziale</option>
                  <option value="attivo">Attivo</option>
                  <option value="inattivo">Inattivo</option>
                </select>
              </div>

              <!-- Partita IVA -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Partita IVA</label>
                <input 
                  v-model="selectedCliente.partitaIva" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Indirizzo -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                <input 
                  v-model="selectedCliente.indirizzo" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Note -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea 
                  v-model="selectedCliente.note" 
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-between mt-6 pt-4 border-t border-gray-200">
              <button 
                type="button"
                @click="deleteCliente(selectedCliente.id)"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Elimina Cliente
              </button>
              <div class="flex space-x-3">
                <button 
                  type="button" 
                  @click="showEditModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  :disabled="loading"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Aggiornamento...' : 'Aggiorna Cliente' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  UserGroupIcon, 
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import { useFirestoreStore } from '@/stores/firestore'
import { usePopup } from '@/composables/usePopup'
import { useModalEsc } from '@/composables/useModalEsc'

// Stores
const firestoreStore = useFirestoreStore()
const { success, error, confirm } = usePopup()

// Stato della pagina
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const searchTerm = ref('')
const selectedTipo = ref('')
const selectedStato = ref('')
const loading = ref(false)
const selectedCliente = ref(null)

// Form nuovo cliente
const newCliente = ref({
  nome: '',
  email: '',
  telefono: '',
  tipo: '',
  partitaIva: '',
  indirizzo: '',
  note: '',
  stato: 'potenziale'
})

// Stats
const stats = ref({
  clientiTotali: 0,
  fatturatoAnnuo: 0,
  progettiAttivi: 0,
  soddisfazione: 0
})

// Dati clienti - inizialmente vuoto, caricato da Firestore
const clienti = ref([])

// Computed
const filteredClienti = computed(() => {
  let result = clienti.value

  if (searchTerm.value) {
    result = result.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (selectedTipo.value) {
    result = result.filter(c => c.tipo === selectedTipo.value)
  }

  if (selectedStato.value) {
    result = result.filter(c => c.stato === selectedStato.value)
  }

  return result
})

// Methods
const getTipoColor = (tipo) => {
  const colors = {
    'privato': 'bg-blue-100 text-blue-800',
    'azienda': 'bg-green-100 text-green-800',
    'ente-pubblico': 'bg-purple-100 text-purple-800'
  }
  return colors[tipo] || 'bg-gray-100 text-gray-800'
}

const getTipoLabel = (tipo) => {
  const labels = {
    'privato': 'Privato',
    'azienda': 'Azienda',
    'ente-pubblico': 'Ente Pubblico'
  }
  return labels[tipo] || tipo
}

const getStatoColor = (stato) => {
  const colors = {
    'attivo': 'bg-green-100 text-green-800',
    'potenziale': 'bg-yellow-100 text-yellow-800',
    'inattivo': 'bg-red-100 text-red-800'
  }
  return colors[stato] || 'bg-gray-100 text-gray-800'
}

const getStatoLabel = (stato) => {
  const labels = {
    'attivo': 'Attivo',
    'potenziale': 'Potenziale',
    'inattivo': 'Inattivo'
  }
  return labels[stato] || stato
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const viewCliente = (cliente) => {
  selectedCliente.value = cliente
  showViewModal.value = true
}

const editCliente = (cliente) => {
  selectedCliente.value = { ...cliente }
  showEditModal.value = true
}

// Aggiorna cliente esistente
const updateCliente = async () => {
  loading.value = true
  
  try {
    const { id, ...clienteData } = selectedCliente.value
    const result = await firestoreStore.updateDocument('clienti', id, clienteData)
    
    if (result.success) {
      // Aggiorna nella lista locale
      const index = clienti.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clienti.value[index] = { ...selectedCliente.value }
      }
      
      showEditModal.value = false
      selectedCliente.value = null
      
      success('Cliente Aggiornato', 'Informazioni cliente salvate con successo!')
    } else {
      error("Errore Cliente", "Operazione fallita")
    }
  } catch (error) {
    console.error('Errore aggiornamento cliente:', error)
    error("Errore Cliente", "Operazione fallita")
  } finally {
    loading.value = false
  }
}

// Elimina cliente
const deleteCliente = async (clienteId) => {
  const confirmed = await confirm('Eliminare Cliente', 'Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.')
  if (!confirmed) {
    return
  }
  
  loading.value = true
  
  try {
    const result = await firestoreStore.deleteDocument('clienti', clienteId)
    
    if (result.success) {
      // Rimuovi dalla lista locale
      clienti.value = clienti.value.filter(c => c.id !== clienteId)
      
      // Chiudi tutti i modali
      showViewModal.value = false
      showEditModal.value = false
      selectedCliente.value = null
      
      success("Operazione Completata", "Cliente eliminato con successo!")
    } else {
      error("Errore Cliente", "Eliminazione fallita")
    }
  } catch (err) {
    console.error('Errore eliminazione cliente:', err)
    error("Errore Cliente", "Eliminazione fallita")
  } finally {
    loading.value = false
  }
}

// Crea nuovo cliente
const createCliente = async () => {
  loading.value = true
  
  try {
    const clienteData = {
      ...newCliente.value,
      numeroProgetti: 0,
      valoreTotale: 0,
      ultimoContatto: new Date().toISOString().split('T')[0],
      iniziali: getInitials(newCliente.value.nome)
    }
    
    const result = await firestoreStore.createCliente(clienteData)
    
    if (result.success) {
      // Aggiungi alla lista locale
      clienti.value.push({
        id: result.id,
        ...clienteData
      })
      
      // Reset form
      resetForm()
      showAddModal.value = false
      
      success("Operazione Completata", "Cliente gestito con successo!")
    } else {
      error("Errore Cliente", "Operazione fallita")
    }
  } catch (error) {
    console.error('Errore creazione cliente:', error)
    error("Errore Cliente", "Operazione fallita")
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  newCliente.value = {
    nome: '',
    email: '',
    telefono: '',
    tipo: '',
    partitaIva: '',
    indirizzo: '',
    note: '',
    stato: 'potenziale'
  }
}

// Genera iniziali dal nome
const getInitials = (nome) => {
  return nome
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Carica clienti da Firestore
const loadClienti = async () => {
  loading.value = true
  try {
    const result = await firestoreStore.loadClienti()
    if (result.success) {
      clienti.value = result.data.map(cliente => ({
        ...cliente,
        iniziali: getInitials(cliente.nome),
        numeroProgetti: cliente.numeroProgetti || 0,
        valoreTotale: cliente.valoreTotale || 0,
        ultimoContatto: cliente.ultimoContatto || new Date().toISOString().split('T')[0]
      }))
    }
  } catch (error) {
    console.error('Errore caricamento clienti:', error)
  } finally {
    loading.value = false
  }
}

// Chiusura modal con ESC
const modalRefs = [showAddModal, showViewModal, showEditModal]
const closeFunctions = [
  () => showAddModal.value = false,
  () => showViewModal.value = false,
  () => showEditModal.value = false
]
useModalEsc(modalRefs, closeFunctions)

// Carica dati all'avvio
onMounted(() => {
  loadClienti()
})
</script> 