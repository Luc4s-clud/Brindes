import api from './api';

export interface Brinde {
  id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  categoria?: string;
  quantidade: number;
  valorUnitario?: number;
  fornecedor?: string;
  fotoUrl?: string;
  especificacoes?: string;
  validade?: string;
  estoqueMinimo?: number;
  recomendacaoUso?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const brindesService = {
  getAll: async (params?: { 
    categoria?: string; 
    search?: string; 
    ativo?: boolean;
    estoqueBaixo?: boolean;
    semEstoque?: boolean;
  }): Promise<Brinde[]> => {
    const response = await api.get('/brindes', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Brinde> => {
    const response = await api.get(`/brindes/${id}`);
    return response.data;
  },

  create: async (data: Omit<Brinde, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brinde> => {
    const response = await api.post('/brindes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Brinde>): Promise<Brinde> => {
    const response = await api.put(`/brindes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/brindes/${id}`);
  },
};

