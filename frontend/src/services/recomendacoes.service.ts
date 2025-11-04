import api from './api';

export interface Recomendacao {
  id: number;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  link?: string;
  categoria?: string;
  sugeridoPor?: string;
  email?: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export const recomendacoesService = {
  getAll: async (params?: { status?: string; categoria?: string }): Promise<Recomendacao[]> => {
    const response = await api.get('/recomendacoes', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Recomendacao> => {
    const response = await api.get(`/recomendacoes/${id}`);
    return response.data;
  },

  create: async (data: Omit<Recomendacao, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Recomendacao> => {
    const response = await api.post('/recomendacoes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Recomendacao>): Promise<Recomendacao> => {
    const response = await api.put(`/recomendacoes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recomendacoes/${id}`);
  },
};

