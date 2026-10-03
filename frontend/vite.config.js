import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '5173', 10),
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
