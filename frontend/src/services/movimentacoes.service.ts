import api from './api';
import { Brinde } from './brindes.service';

export interface Movimentacao {
  id: number;
  brindeId: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo?: string;
  observacao?: string;
  createdAt: string;
  brinde: Brinde;
}

export const movimentacoesService = {
  getAll: async (): Promise<Movimentacao[]> => {
    const response = await api.get('/movimentacoes');
    return response.data;
  },

  getByBrinde: async (brindeId: number): Promise<Movimentacao[]> => {
    const response = await api.get(`/movimentacoes/brinde/${brindeId}`);
    return response.data;
  },

  create: async (data: Omit<Movimentacao, 'id' | 'createdAt' | 'brinde'>): Promise<Movimentacao> => {
    const response = await api.post('/movimentacoes', data);
    return response.data;
  },
};

