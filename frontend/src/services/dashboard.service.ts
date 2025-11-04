import api from './api';

export interface Estatisticas {
  brindes: {
    total: number;
    comEstoque: number;
    estoqueBaixo: number;
    vencendo: number;
    valorTotalEstoque: number;
  };
  solicitacoes: {
    total: number;
    pendentes: number;
    aprovadas: number;
    entregues: number;
    valorTotalAprovado: number;
    valorTotalEntregue: number;
  };
  rankings: {
    brindesMaisSolicitados: Array<{
      brinde: {
        id: number;
        nome: string;
        codigo?: string;
      };
      quantidadeTotal: number;
    }>;
    topSolicitantes: Array<{
      usuario: {
        id: number;
        nome: string;
        email: string;
      };
      totalSolicitacoes: number;
    }>;
    consumoPorCentroCusto: Array<{
      centroCusto: {
        id: number;
        nome: string;
        setor?: string;
      };
      valorTotal: number;
    }>;
  };
}

export const dashboardService = {
  getEstatisticas: async (): Promise<Estatisticas> => {
    const response = await api.get('/dashboard/estatisticas');
    return response.data;
  },

  getRelatorioConsumo: async (params?: {
    inicio?: string;
    fim?: string;
    centroCustoId?: number;
    solicitanteId?: number;
  }) => {
    const response = await api.get('/dashboard/relatorio-consumo', { params });
    return response.data;
  },
};

