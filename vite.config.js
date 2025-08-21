import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  define: {
    // Se definita nel .env, Vite userà quella; altrimenti lasciamo undefined e AppFooter leggerà da package.json
    'import.meta.env.VITE_APP_VERSION': process.env.VITE_APP_VERSION ? JSON.stringify(process.env.VITE_APP_VERSION) : undefined,
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Legnosystem.bio')
  },
  server: {
    port: 3000,
  }
})
