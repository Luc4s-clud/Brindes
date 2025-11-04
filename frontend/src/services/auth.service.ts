import api from './api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  setor?: string;
  centroCusto?: any;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export const authService = {
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, senha });
    // Salvar token no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  register: async (data: {
    nome: string;
    email: string;
    senha: string;
    perfil: string;
    setor?: string;
  }): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getUsuario: (): Usuario | null => {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  me: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

