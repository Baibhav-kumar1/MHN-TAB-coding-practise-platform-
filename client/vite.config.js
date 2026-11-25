import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL || '')
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.SERVER_URL || 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
