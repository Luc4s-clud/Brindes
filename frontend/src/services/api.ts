import axios from 'axios';

// URL da API - em produção usa a variável de ambiente, senão usa /api (proxy local)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('[API] Requisição iniciada', {
    method: config.method?.toUpperCase(),
    baseURL: config.baseURL,
    url: config.url,
  });

  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config) {
      console.error('[API] Erro na resposta', {
        method: error.config.method?.toUpperCase(),
        baseURL: error.config.baseURL,
        url: error.config.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

