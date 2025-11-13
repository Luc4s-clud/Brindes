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
    console.log('[AUTH] Enviando requisição de login', {
      email,
      baseURL: api.defaults.baseURL,
      url: '/auth/login',
    });

    try {
      const response = await api.post('/auth/login', { email, senha });
      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }

      console.log('[AUTH] Login bem-sucedido no frontend', {
        email: response.data.usuario?.email,
        perfil: response.data.usuario?.perfil,
      });

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error('[AUTH] Falha na requisição de login', {
        email,
        status,
        data,
      });

      throw error;
    }
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

