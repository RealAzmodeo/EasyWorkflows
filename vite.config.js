import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'start-comfy-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/start-comfy') {
            const batPath = path.resolve(__dirname, '..', 'ComfyUI-Easy-Install', 'run_nvidia_gpu.bat');
            console.log(`[RemoteStart] Triggering: ${batPath}`);

            exec(`start "ALLAI - ComfyUI Backend" cmd /c "call \"${batPath}\""`, (error) => {
              if (error) {
                console.error(`[RemoteStart] Error: ${error.message}`);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message }));
                return;
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ message: 'Startup triggered' }));
            });
          } else {
            next();
          }
        });
      }
    }
  ],
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
