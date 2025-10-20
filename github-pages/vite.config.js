import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  // Явно задаем базовый путь для GitHub Pages с кастомным доменом
  // При использовании custom domain base должен быть '/'
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'misc-preferred-reflections-fathers.trycloudflare.com',
      '.trycloudflare.com',
      '.ngrok.io'
    ],
    proxy: {
      '/api': {
        target: 'https://equations-supervisors-find-cast.trycloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
