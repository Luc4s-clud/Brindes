import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  solicitacoesService,
  Solicitacao,
} from '../../../services/solicitacoes.service';
import { solicitacoesKeys } from './keys';

export interface SolicitacoesFilters {
  status?: string;
  centroCustoId?: number;
  solicitanteId?: number;
}

type SolicitacoesQueryOptions = Omit<
  UseQueryOptions<Solicitacao[], unknown, Solicitacao[], any>,
  'queryKey' | 'queryFn'
>;

export const useSolicitacoesQuery = (
  filters: SolicitacoesFilters = {},
  options?: SolicitacoesQueryOptions,
) => {
  const sanitizedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

  return useQuery({
    queryKey: solicitacoesKeys.filters(sanitizedFilters),
    queryFn: () => solicitacoesService.getAll(sanitizedFilters),
    ...options,
  });
};


