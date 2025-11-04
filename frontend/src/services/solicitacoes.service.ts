import api from './api';

export interface ItemSolicitacao {
  id?: number;
  brindeId: number;
  quantidade: number;
  valorUnitario?: number;
  observacao?: string;
  brinde?: any;
}

export interface Solicitacao {
  id: number;
  numeroSolicitacao: string;
  solicitanteId: number;
  centroCustoId: number;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'ENTREGUE' | 'CANCELADA';
  justificativa?: string;
  enderecoEntrega?: string;
  prazoEntrega?: string;
  finalidade?: string;
  valorTotal?: number;
  observacoes?: string;
  dataEntrega?: string;
  createdAt: string;
  updatedAt: string;
  solicitante?: any;
  centroCusto?: any;
  itens?: ItemSolicitacao[];
  aprovacoes?: any[];
}

export interface CreateSolicitacaoData {
  centroCustoId: number;
  justificativa?: string;
  enderecoEntrega?: string;
  prazoEntrega?: string;
  finalidade?: string;
  observacoes?: string;
  itens: Omit<ItemSolicitacao, 'id' | 'brinde'>[];
}

export const solicitacoesService = {
  getAll: async (params?: {
    status?: string;
    centroCustoId?: number;
    solicitanteId?: number;
  }): Promise<Solicitacao[]> => {
    const response = await api.get('/solicitacoes', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Solicitacao> => {
    const response = await api.get(`/solicitacoes/${id}`);
    return response.data;
  },

  create: async (data: CreateSolicitacaoData): Promise<Solicitacao> => {
    const response = await api.post('/solicitacoes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Solicitacao>): Promise<Solicitacao> => {
    const response = await api.put(`/solicitacoes/${id}`, data);
    return response.data;
  },

  cancelar: async (id: number): Promise<Solicitacao> => {
    const response = await api.patch(`/solicitacoes/${id}/cancelar`);
    return response.data;
  },
};

