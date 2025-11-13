import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aprovacoesService } from '../../../services/aprovacoes.service';
import { solicitacoesKeys } from '../../solicitacoes/api/keys';

export const useAprovarSolicitacaoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitacaoId: number) => aprovacoesService.aprovar(solicitacaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: solicitacoesKeys.all,
      });
    },
  });
};


