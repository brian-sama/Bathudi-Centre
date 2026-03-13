import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: [
      'bathudi.co.za',
      'www.bathudi.co.za',
      'invigorating-laughter-production-ad4f.up.railway.app',
      '.up.railway.app'
    ]
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: []
    }
  }
});