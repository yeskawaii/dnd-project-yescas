import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001/api"
});

// 1. El que manda el token (El que ya tenías)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. EL CADENERO (Lo nuevo que auto-limpia la sesión)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');

      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;