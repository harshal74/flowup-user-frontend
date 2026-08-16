import axios from 'axios';

// In development: VITE_API_URL is not set, so baseURL = '/api'
// The Vite proxy (vite.config.ts) forwards /api → http://localhost:5000/api
// In production: VITE_API_URL = https://your-backend.up.railway.app/api (set on Netlify)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;
