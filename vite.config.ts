import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // In development: proxy /api → backend so CORS is never an issue locally.
  // In production: VITE_API_URL is an absolute URL, no proxy needed.
  const backendTarget = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
