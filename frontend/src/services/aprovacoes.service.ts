import api from './api';

export interface Aprovacao {
  id: number;
  solicitacaoId: number;
  aprovadoPorId: number;
  status: 'APROVADA' | 'REJEITADA';
  observacao?: string;
  nivelAprovacao: number;
  createdAt: string;
  aprovadoPor?: any;
}

export const aprovacoesService = {
  aprovar: async (solicitacaoId: number, data?: { observacao?: string }) => {
    const response = await api.post(`/aprovacoes/${solicitacaoId}/aprovar`, data);
    return response.data;
  },

  rejeitar: async (solicitacaoId: number, data: { observacao: string }) => {
    const response = await api.post(`/aprovacoes/${solicitacaoId}/rejeitar`, data);
    return response.data;
  },
};

