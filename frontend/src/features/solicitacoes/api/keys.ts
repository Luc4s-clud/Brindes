export const solicitacoesKeys = {
  all: ['solicitacoes'] as const,
  filters: (filters: Record<string, unknown>) => [
    ...solicitacoesKeys.all,
    'list',
    filters,
  ] as const,
};


