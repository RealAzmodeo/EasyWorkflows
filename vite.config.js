import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8188',
        ws: true,
        changeOrigin: true
      },
      '/prompt': 'http://127.0.0.1:8188',
      '/upload': 'http://127.0.0.1:8188',
      '/history': 'http://127.0.0.1:8188',
      '/system_stats': 'http://127.0.0.1:8188',
      '/view': 'http://127.0.0.1:8188',
      '/interrupt': 'http://127.0.0.1:8188',
      '/queue': 'http://127.0.0.1:8188',
    }
  }
})
