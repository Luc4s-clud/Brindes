import api from './api';

export interface CentroCusto {
  id: number;
  nome: string;
  descricao?: string;
  orcamentoTotal?: number;
  orcamentoUtilizado: number;
  limitePorGerente?: number;
  limitePorEvento?: number;
  limitePorSetor?: number;
  setor?: string;
  ativo: boolean;
  usuarioId?: number;
  usuario?: any;
  createdAt: string;
  updatedAt: string;
}

export const centrosCustoService = {
  getAll: async (params?: { setor?: string; ativo?: boolean }): Promise<CentroCusto[]> => {
    const response = await api.get('/centros-custo', { params });
    return response.data;
  },

  getById: async (id: number): Promise<CentroCusto> => {
    const response = await api.get(`/centros-custo/${id}`);
    return response.data;
  },

  create: async (data: Omit<CentroCusto, 'id' | 'createdAt' | 'updatedAt' | 'orcamentoUtilizado'>): Promise<CentroCusto> => {
    const response = await api.post('/centros-custo', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CentroCusto>): Promise<CentroCusto> => {
    const response = await api.put(`/centros-custo/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/centros-custo/${id}`);
  },
};

