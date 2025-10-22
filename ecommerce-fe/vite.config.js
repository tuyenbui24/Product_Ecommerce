import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'vite-cache',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
  server: {
  port: 5173,
  open: true,
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
    '/product-image': { target: 'http://localhost:8080', changeOrigin: true },
    '/staff-photos': { target: 'http://localhost:8080', changeOrigin: true },
  },
},
})
