import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.ico'],
  optimizeDeps: {
    exclude: ['lucide-react', 'xlsx'],
  },
  server: {
    // Configurações para evitar problemas de desenvolvimento
    hmr: {
      overlay: false, // Desabilitar overlay de erros para evitar interferência
    },
  },
  // sem resolve.alias
})
