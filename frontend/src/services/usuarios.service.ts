import api from './api';

export type PerfilUsuario = 'MARKETING' | 'GERENTE' | 'SOLICITANTE' | 'DIRETOR';

export interface CentroCustoResumo {
  id: number;
  nome: string;
}

export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  setor?: string | null;
  ativo: boolean;
  centroCusto?: CentroCustoResumo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  setor?: string;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: PerfilUsuario;
  setor?: string | null;
  ativo?: boolean;
}

export interface UsuarioFilters {
  perfil?: PerfilUsuario | 'TODOS';
  ativo?: boolean | 'TODOS';
}

const parseFilters = (filters?: UsuarioFilters) => {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};

  if (filters.perfil && filters.perfil !== 'TODOS') {
    params.perfil = filters.perfil;
  }

  if (filters.ativo !== undefined && filters.ativo !== 'TODOS') {
    params.ativo = String(filters.ativo);
  }

  return params;
};

export const usuariosService = {
  getAll: async (filters?: UsuarioFilters): Promise<UsuarioResumo[]> => {
    const response = await api.get('/usuarios', {
      params: parseFilters(filters),
    });
    return response.data;
  },

  getById: async (id: number): Promise<UsuarioResumo> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: CreateUsuarioPayload): Promise<UsuarioResumo> => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUsuarioPayload): Promise<UsuarioResumo> => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },
};


