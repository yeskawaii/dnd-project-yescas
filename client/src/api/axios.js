import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001/api"
});

// 1. El que manda el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. EL CADENERO (Ya a prueba de bucles infinitos)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión caducada, limpiando caché...");
      
      localStorage.clear();

      // Recargamos y mandamos al login limpios
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;